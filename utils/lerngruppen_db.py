# -*- coding: utf-8 -*-
"""
Lerngruppen-Datenbank-Modul (Supabase)
=======================================
Verwaltet Lerngruppen für die Schatzkarte.
- Gruppen erstellen/verwalten
- Mitglieder einladen (Token)
- Wöchentliche Insel-Auswahl durch Coach
- Video-Meetings planen und verwalten
- Zeitzonen-Support (Coach in Malaysia, Kinder in DACH)
"""

import json
import secrets
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from zoneinfo import ZoneInfo

import streamlit as st
from utils.database import get_db


# ============================================
# KONFIGURATION
# ============================================

def _get_room_secret() -> str:
    """Room-Secret aus Streamlit Secrets (nicht hardcoded)."""
    return st.secrets.get("JITSI_ROOM_SECRET", "schatzkarte-secret-2024")


def _get_app_url() -> str:
    """App-URL für Einladungslinks aus Streamlit Secrets."""
    return st.secrets.get("APP_URL", "https://learnerspulse.streamlit.app")


# ============================================
# GRUPPEN-VERWALTUNG
# ============================================

def create_group(name: str, coach_id: str, start_date: str = None) -> Optional[str]:
    """Erstellt eine neue Lerngruppe. Gibt group_id zurück (MD5-Hash, 12 Zeichen)."""
    group_id = hashlib.md5(
        f"{name}{coach_id}{datetime.now().isoformat()}".encode()
    ).hexdigest()[:12]

    try:
        get_db().table("learning_groups").insert({
            "group_id": group_id,
            "name": name,
            "coach_id": coach_id,
            "start_date": start_date,
            "current_week": 0
        }).execute()
        return group_id
    except Exception as e:
        print(f"Error creating group: {e}")
        return None


def get_group(group_id: str) -> Optional[Dict]:
    """Holt eine Gruppe anhand der ID."""
    result = get_db().table("learning_groups") \
        .select("*") \
        .eq("group_id", group_id) \
        .execute()
    return result.data[0] if result.data else None


def get_coach_groups(coach_id: str) -> List[Dict]:
    """Holt alle aktiven Gruppen eines Coaches, inkl. member_count."""
    db = get_db()
    groups_result = db.table("learning_groups") \
        .select("*") \
        .eq("coach_id", coach_id) \
        .eq("is_active", 1) \
        .order("created_at", desc=True) \
        .execute()

    groups = groups_result.data
    for group in groups:
        members_result = db.table("group_members") \
            .select("id") \
            .eq("group_id", group["group_id"]) \
            .eq("status", "active") \
            .execute()
        group["member_count"] = len(members_result.data)

    return groups


def update_group(group_id: str, **kwargs) -> bool:
    """Aktualisiert Gruppen-Eigenschaften.
    Erlaubte Felder: name, start_date, current_week, is_active, settings"""
    allowed_fields = {'name', 'start_date', 'current_week', 'is_active', 'settings'}
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
    if not updates:
        return False

    try:
        result = get_db().table("learning_groups") \
            .update(updates) \
            .eq("group_id", group_id) \
            .execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error updating group: {e}")
        return False


def delete_group(group_id: str, soft_delete: bool = True) -> bool:
    """Soft delete (is_active=0) oder Hard delete mit Kaskade."""
    if soft_delete:
        return update_group(group_id, is_active=0)

    db = get_db()
    try:
        # Kaskade: abhängige Tabellen zuerst
        meeting_ids = [m["id"] for m in db.table("scheduled_meetings")
                       .select("id").eq("group_id", group_id).execute().data]
        if meeting_ids:
            db.table("meeting_participants").delete() \
                .in_("meeting_id", meeting_ids) \
                .execute()
        db.table("scheduled_meetings").delete().eq("group_id", group_id).execute()
        db.table("group_weekly_islands").delete().eq("group_id", group_id).execute()
        db.table("group_invitations").delete().eq("group_id", group_id).execute()
        db.table("group_members").delete().eq("group_id", group_id).execute()
        db.table("learning_groups").delete().eq("group_id", group_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting group: {e}")
        return False


# ============================================
# ZEITZONEN-VERWALTUNG
# ============================================

def get_group_timezone(group_id: str) -> str:
    """Liest settings.timezone aus dem JSON-Feld. Default: 'Europe/Berlin'."""
    group = get_group(group_id)
    if not group or not group.get('settings'):
        return "Europe/Berlin"
    try:
        settings = json.loads(group['settings']) if isinstance(group['settings'], str) else group['settings']
        return settings.get('timezone', 'Europe/Berlin')
    except (json.JSONDecodeError, TypeError):
        return "Europe/Berlin"


def set_group_timezone(group_id: str, timezone: str) -> bool:
    """Setzt settings.timezone, erhält andere Settings im JSON."""
    group = get_group(group_id)
    if not group:
        return False

    try:
        settings = {}
        if group.get('settings'):
            settings = json.loads(group['settings']) if isinstance(group['settings'], str) else group['settings']
        settings['timezone'] = timezone
        return update_group(group_id, settings=json.dumps(settings))
    except Exception as e:
        print(f"Error setting timezone: {e}")
        return False


def convert_meeting_time_display(
    time_of_day: str, day_of_week: int, group_tz: str, coach_tz: str
) -> Dict:
    """Konvertiert Meeting-Uhrzeit zwischen zwei Zeitzonen.
    Returns: {group_time, group_day, coach_time, coach_day, group_day_name, coach_day_name}"""
    DAYS_DE = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]

    hour, minute = map(int, time_of_day.split(':'))

    # Referenz-Datum (nächster passender Wochentag)
    now = datetime.now(ZoneInfo(group_tz))
    days_ahead = day_of_week - now.weekday()
    if days_ahead < 0:
        days_ahead += 7
    ref_date = now + timedelta(days=days_ahead)
    group_dt = ref_date.replace(hour=hour, minute=minute, second=0, microsecond=0)

    # In Coach-Zeitzone konvertieren
    coach_dt = group_dt.astimezone(ZoneInfo(coach_tz))

    return {
        "group_time": group_dt.strftime("%H:%M"),
        "group_day": group_dt.weekday(),
        "group_day_name": DAYS_DE[group_dt.weekday()],
        "coach_time": coach_dt.strftime("%H:%M"),
        "coach_day": coach_dt.weekday(),
        "coach_day_name": DAYS_DE[coach_dt.weekday()],
    }


# ============================================
# MITGLIEDER-VERWALTUNG
# ============================================

def add_member(group_id: str, user_id: str) -> bool:
    """Fügt Mitglied zur Gruppe hinzu."""
    try:
        get_db().table("group_members").insert({
            "group_id": group_id,
            "user_id": user_id,
            "status": "active"
        }).execute()
        return True
    except Exception as e:
        print(f"User already in a group or error: {e}")
        return False


def remove_member(group_id: str, user_id: str) -> bool:
    """Entfernt Mitglied (DELETE aus group_members)."""
    try:
        result = get_db().table("group_members") \
            .delete() \
            .eq("group_id", group_id) \
            .eq("user_id", user_id) \
            .execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error removing member: {e}")
        return False


def get_group_members(group_id: str) -> List[Dict]:
    """Alle aktiven Mitglieder mit User-Details. Sortiert nach display_name."""
    db = get_db()
    members_result = db.table("group_members") \
        .select("*") \
        .eq("group_id", group_id) \
        .eq("status", "active") \
        .execute()

    members = []
    for gm in members_result.data:
        user_result = db.table("users") \
            .select("display_name, age_group, level, xp_total, current_streak") \
            .eq("user_id", gm["user_id"]) \
            .execute()
        member = {**gm}
        if user_result.data:
            member.update(user_result.data[0])
        members.append(member)

    members.sort(key=lambda m: (m.get("display_name") or "").lower())
    return members


def get_user_group(user_id: str) -> Optional[Dict]:
    """Holt die Gruppe eines Users. User kann nur in einer Gruppe sein."""
    db = get_db()
    member_result = db.table("group_members") \
        .select("group_id, joined_at") \
        .eq("user_id", user_id) \
        .eq("status", "active") \
        .execute()

    if not member_result.data:
        return None

    gm = member_result.data[0]
    group_result = db.table("learning_groups") \
        .select("*") \
        .eq("group_id", gm["group_id"]) \
        .eq("is_active", 1) \
        .execute()

    if not group_result.data:
        return None

    group = group_result.data[0]
    group["joined_at"] = gm["joined_at"]
    return group


# ============================================
# EINLADUNGS-SYSTEM
# ============================================

def create_invitation(group_id: str, email: str = None, expires_days: int = 7) -> Optional[str]:
    """Erstellt einen Einladungs-Token (secrets.token_urlsafe(16)). 7 Tage gültig."""
    token = secrets.token_urlsafe(16)
    expires_at = (datetime.now() + timedelta(days=expires_days)).isoformat()

    try:
        get_db().table("group_invitations").insert({
            "token": token,
            "group_id": group_id,
            "email": email,
            "expires_at": expires_at
        }).execute()
        return token
    except Exception as e:
        print(f"Error creating invitation: {e}")
        return None


def get_invitation_url(token: str) -> str:
    """Generiert die vollständige Einladungs-URL."""
    return f"{_get_app_url()}/Lerngruppen?invite={token}"


def get_invitation(token: str) -> Optional[Dict]:
    """Holt Einladungs-Details inkl. group_name und coach_id."""
    db = get_db()
    inv_result = db.table("group_invitations") \
        .select("*") \
        .eq("token", token) \
        .execute()

    if not inv_result.data:
        return None

    invitation = inv_result.data[0]
    group_result = db.table("learning_groups") \
        .select("name, coach_id") \
        .eq("group_id", invitation["group_id"]) \
        .execute()

    if group_result.data:
        invitation["group_name"] = group_result.data[0]["name"]
        invitation["coach_id"] = group_result.data[0]["coach_id"]

    return invitation


def use_invitation(token: str, user_id: str) -> Dict[str, Any]:
    """Verwendet einen Token. Prüft: existiert, nicht abgelaufen, nicht verwendet,
    User nicht schon in einer Gruppe. Bei Erfolg: add_member + mark used."""
    invitation = get_invitation(token)

    if not invitation:
        return {"success": False, "message": "Ungültiger Einladungslink", "group_id": None}

    if invitation.get('used_at'):
        return {"success": False, "message": "Einladung wurde bereits verwendet", "group_id": None}

    if invitation.get('expires_at'):
        expires = datetime.fromisoformat(invitation['expires_at'])
        if datetime.now() > expires:
            return {"success": False, "message": "Einladung ist abgelaufen", "group_id": None}

    existing_group = get_user_group(user_id)
    if existing_group:
        return {
            "success": False,
            "message": f"Du bist bereits in der Gruppe '{existing_group['name']}'",
            "group_id": None
        }

    group_id = invitation['group_id']
    if not add_member(group_id, user_id):
        return {"success": False, "message": "Fehler beim Beitreten", "group_id": None}

    get_db().table("group_invitations") \
        .update({"used_at": datetime.now().isoformat(), "used_by": user_id}) \
        .eq("token", token) \
        .execute()

    return {
        "success": True,
        "message": f"Willkommen in der Gruppe '{invitation.get('group_name', '')}'!",
        "group_id": group_id
    }


def get_group_invitations(group_id: str, include_used: bool = False) -> List[Dict]:
    """Alle Einladungen einer Gruppe, sortiert nach created_at DESC."""
    query = get_db().table("group_invitations") \
        .select("*") \
        .eq("group_id", group_id) \
        .order("created_at", desc=True)

    if not include_used:
        query = query.is_("used_at", "null")

    return query.execute().data


def send_invitation_email(to_email: str, group_name: str, invite_url: str) -> bool:
    """Sendet eine Einladungs-Email via Web.de SMTP. Returns True bei Erfolg."""
    try:
        email_cfg = st.secrets["email"]
    except (KeyError, AttributeError):
        print("Email-Konfiguration fehlt in secrets.toml")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f'Einladung zur Lerngruppe "{group_name}"'
    msg["From"] = email_cfg["sender"]
    msg["To"] = to_email

    text_body = (
        f"Hallo!\n\n"
        f'Du wurdest zur Lerngruppe "{group_name}" eingeladen!\n\n'
        f"Klicke auf diesen Link, um beizutreten:\n{invite_url}\n\n"
        f"Der Link ist 7 Tage gültig.\n\n"
        f"Viel Spaß beim Lernen!\n"
    )

    html_body = f"""\
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;">
      <h2 style="margin: 0;">🎉 Du wurdest eingeladen!</h2>
      <h3 style="margin: 10px 0 0 0;">Lerngruppe: {group_name}</h3>
    </div>
    <p style="margin-top: 20px;">Hallo!</p>
    <p>Du wurdest zur Lerngruppe <strong>"{group_name}"</strong> eingeladen.</p>
    <p style="text-align: center; margin: 25px 0;">
      <a href="{invite_url}"
         style="background: #667eea; color: white; padding: 12px 30px;
                border-radius: 25px; text-decoration: none; font-weight: bold;">
        Jetzt beitreten
      </a>
    </p>
    <p style="font-size: 0.9em; color: #666;">
      Oder kopiere diesen Link:<br>
      <a href="{invite_url}">{invite_url}</a>
    </p>
    <p style="font-size: 0.85em; color: #999;">Der Link ist 7 Tage gültig.</p>
  </div>
</body>
</html>"""

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(email_cfg["smtp_server"], int(email_cfg["smtp_port"]), timeout=15) as server:
            server.starttls()
            server.login(email_cfg["sender"], email_cfg["password"])
            server.sendmail(email_cfg["sender"], to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email-Versand fehlgeschlagen: {e}")
        return False


def send_welcome_email(
    to_email: str, child_name: str, group_name: str,
    start_date: str, meeting_info: str, schatzkarte_url: str
) -> bool:
    """Sendet eine Willkommens-Email nach Gruppenbeitritt. Returns True bei Erfolg."""
    try:
        email_cfg = st.secrets["email"]
    except (KeyError, AttributeError):
        print("Email-Konfiguration fehlt in secrets.toml")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f'Willkommen in der Lerngruppe "{group_name}"!'
    msg["From"] = email_cfg["sender"]
    msg["To"] = to_email

    start_text = f"Startdatum: {start_date}" if start_date else "Startdatum: wird noch bekannt gegeben"
    meeting_text = meeting_info if meeting_info else "Wird noch vom Coach geplant"

    text_body = (
        f"Hallo {child_name}!\n\n"
        f'Willkommen in der Lerngruppe "{group_name}"!\n\n'
        f"{start_text}\n"
        f"Treffen: {meeting_text}\n\n"
        f"So funktioniert's:\n"
        f"1. Oeffne die Schatzkarte: {schatzkarte_url}\n"
        f"2. Beim Treffen oeffnest du den Video-Chat (Link auf der Schatzkarte)\n"
        f"3. Tipp: Oeffne beides in eigenen Browser-Tabs!\n\n"
        f"Viel Spass bei der Lernreise!\n"
    )

    html_body = f"""\
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; text-align: center;">
      <h2 style="margin: 0;">Willkommen, {child_name}!</h2>
      <h3 style="margin: 10px 0 0 0;">Lerngruppe: {group_name}</h3>
    </div>

    <div style="background: #f0f9ff; border-radius: 10px; padding: 15px; margin-top: 20px;">
      <h4 style="margin: 0 0 10px 0; color: #0369a1;">Deine Lernreise</h4>
      <p style="margin: 5px 0;"><strong>Startdatum:</strong> {start_date or "wird noch bekannt gegeben"}</p>
      <p style="margin: 5px 0;"><strong>Treffen:</strong> {meeting_info or "Wird noch vom Coach geplant"}</p>
    </div>

    <div style="background: #f0fdf4; border-radius: 10px; padding: 15px; margin-top: 15px;">
      <h4 style="margin: 0 0 10px 0; color: #166534;">So funktioniert's</h4>
      <p style="margin: 5px 0;">1. Oeffne die <strong>Schatzkarte</strong> zum Lernen</p>
      <p style="margin: 5px 0;">2. Beim Treffen oeffnest du den <strong>Video-Chat</strong></p>
      <p style="margin: 5px 0;">3. Tipp: Oeffne beides in eigenen Browser-Tabs!</p>
    </div>

    <p style="text-align: center; margin: 25px 0;">
      <a href="{schatzkarte_url}"
         style="background: #667eea; color: white; padding: 12px 30px;
                border-radius: 25px; text-decoration: none; font-weight: bold;">
        Zur Schatzkarte
      </a>
    </p>

    <p style="font-size: 0.85em; color: #999; text-align: center;">
      Hebe diese Email auf — so findest du den Link immer wieder!
    </p>
  </div>
</body>
</html>"""

    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(email_cfg["smtp_server"], int(email_cfg["smtp_port"]), timeout=15) as server:
            server.starttls()
            server.login(email_cfg["sender"], email_cfg["password"])
            server.sendmail(email_cfg["sender"], to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Willkommens-Email fehlgeschlagen: {e}")
        return False


# ============================================
# WÖCHENTLICHE INSEL-AUSWAHL
# ============================================

FLEXIBLE_ISLANDS = [
    "spiegel_see", "vulkan", "ruhe_oase", "ausdauer_gipfel",
    "fokus_leuchtturm", "wachstum_garten", "lehrer_turm",
    "wohlfuehl_dorf", "schutz_burg"
]
# 9 verfügbar, Coach wählt 7 für Wochen 5-11
# Feste Inseln (Wochen 1-4): Festung der Stärke, 7 Werkzeuge, Brücken, Fäden


def activate_weekly_island(group_id: str, week_number: int, island_id: str, notes: str = None) -> bool:
    """Aktiviert eine Insel für Wochen 5-11."""
    if week_number < 5 or week_number > 11:
        return False
    if island_id not in FLEXIBLE_ISLANDS:
        return False

    db = get_db()
    try:
        db.table("group_weekly_islands").insert({
            "group_id": group_id,
            "week_number": week_number,
            "island_id": island_id,
            "coach_notes": notes
        }).execute()
        db.table("learning_groups") \
            .update({"current_week": week_number}) \
            .eq("group_id", group_id) \
            .execute()
        return True
    except Exception as e:
        print(f"Island activation conflict: {e}")
        return False


def get_activated_islands(group_id: str) -> List[Dict]:
    """Holt alle aktivierten Inseln einer Gruppe."""
    return get_db().table("group_weekly_islands") \
        .select("*") \
        .eq("group_id", group_id) \
        .order("week_number") \
        .execute().data


def get_available_islands(group_id: str) -> List[str]:
    """Gibt die noch verfügbaren flexiblen Inseln zurück."""
    activated = get_activated_islands(group_id)
    activated_ids = {i['island_id'] for i in activated}
    return [i for i in FLEXIBLE_ISLANDS if i not in activated_ids]


def get_current_island(group_id: str, week_number: int) -> Optional[str]:
    """Holt die aktivierte Insel für eine bestimmte Woche."""
    result = get_db().table("group_weekly_islands") \
        .select("island_id") \
        .eq("group_id", group_id) \
        .eq("week_number", week_number) \
        .execute()
    return result.data[0]["island_id"] if result.data else None


def get_group_week(group_id: str, start_date: str = None) -> int:
    """Berechnet aktuelle Woche (0-12) basierend auf start_date."""
    group = get_group(group_id)
    if not group:
        return 0

    start = start_date or group.get('start_date')
    if not start:
        return group.get('current_week', 0)

    try:
        start_dt = datetime.strptime(start, '%Y-%m-%d').date()
        today = datetime.now().date()
        weeks_passed = (today - start_dt).days // 7
        return max(0, min(12, weeks_passed))
    except Exception:
        return group.get('current_week', 0)


# ============================================
# GRUPPEN-FORTSCHRITT
# ============================================

def get_group_progress(group_id: str) -> Dict[str, Any]:
    """Returns: {group, current_week, activated_islands, available_islands,
     member_count, members, total_xp, avg_level}"""
    group = get_group(group_id)
    if not group:
        return {}

    members = get_group_members(group_id)
    activated = get_activated_islands(group_id)
    available = get_available_islands(group_id)

    total_xp = sum(m.get('xp_total', 0) for m in members)
    avg_level = sum(m.get('level', 1) for m in members) / max(1, len(members))

    return {
        "group": group,
        "current_week": get_group_week(group_id),
        "activated_islands": activated,
        "available_islands": available,
        "member_count": len(members),
        "members": members,
        "total_xp": total_xp,
        "avg_level": round(avg_level, 1)
    }


# ============================================
# VIDEO-MEETING VERWALTUNG
# ============================================

def generate_secure_room_name(group_id: str, scheduled_start: str) -> str:
    """Pattern: 'schatzkarte-{sha256[:12]}'
    Deterministisch: gleicher Gruppen-ID + gleicher Tag = gleicher Raum."""
    date_str = scheduled_start.split('T')[0] if 'T' in scheduled_start else scheduled_start.split(' ')[0]
    hash_input = f"{group_id}-{date_str}-{_get_room_secret()}"
    hash_value = hashlib.sha256(hash_input.encode()).hexdigest()[:12]
    return f"schatzkarte-{hash_value}"


def schedule_meeting(
    group_id: str,
    coach_id: str,
    day_of_week: int,
    time_of_day: str,
    duration_minutes: int = 45,
    recurrence: str = 'einmalig',
    title: str = None
) -> Optional[Dict]:
    """Plant ein Meeting. Nutzt Gruppen-Zeitzone für Datumsberechnung."""
    group_tz = get_group_timezone(group_id)
    next_date = calculate_next_meeting_date(day_of_week, time_of_day, group_tz)
    end_date = next_date + timedelta(minutes=duration_minutes)

    meeting_id = hashlib.md5(
        f"{group_id}{next_date.isoformat()}{datetime.now().isoformat()}".encode()
    ).hexdigest()[:16]
    room_name = generate_secure_room_name(group_id, next_date.isoformat())

    group = get_group(group_id)
    meeting_title = title or f"Schatzkarten-Treffen: {group['name'] if group else 'Lerngruppe'}"

    try:
        get_db().table("scheduled_meetings").insert({
            "id": meeting_id,
            "group_id": group_id,
            "title": meeting_title,
            "scheduled_start": next_date.isoformat(),
            "scheduled_end": end_date.isoformat(),
            "recurrence_type": recurrence,
            "day_of_week": day_of_week,
            "time_of_day": time_of_day,
            "duration_minutes": duration_minutes,
            "status": "scheduled",
            "jitsi_room_name": room_name,
            "created_by": coach_id
        }).execute()

        return {
            "id": meeting_id,
            "group_id": group_id,
            "title": meeting_title,
            "scheduled_start": next_date.isoformat(),
            "scheduled_end": end_date.isoformat(),
            "jitsi_room_name": room_name,
            "recurrence_type": recurrence
        }
    except Exception as e:
        print(f"Error scheduling meeting: {e}")
        return None


def calculate_next_meeting_date(
    day_of_week: int, time_of_day: str, timezone: str = "Europe/Berlin"
) -> datetime:
    """Berechnet nächstes Datum für Wochentag/Uhrzeit. Timezone-aware."""
    tz = ZoneInfo(timezone)
    now = datetime.now(tz)
    hour, minute = map(int, time_of_day.split(':'))

    days_ahead = day_of_week - now.weekday()
    if days_ahead < 0:
        days_ahead += 7
    elif days_ahead == 0:
        target_time = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if now >= target_time:
            days_ahead = 7

    next_date = now + timedelta(days=days_ahead)
    return next_date.replace(hour=hour, minute=minute, second=0, microsecond=0)


def renew_recurring_meeting(meeting: Dict) -> Optional[Dict]:
    """Erstellt das nächste Meeting für ein wöchentliches Treffen.
    Wird aufgerufen wenn das aktuelle Meeting abgelaufen ist."""
    if meeting.get('recurrence_type') != 'woechentlich':
        return None
    if meeting.get('status') == 'cancelled':
        return None

    group_tz = get_group_timezone(meeting['group_id'])
    next_date = calculate_next_meeting_date(
        meeting['day_of_week'], meeting['time_of_day'], group_tz
    )
    end_date = next_date + timedelta(minutes=meeting['duration_minutes'])

    # Prüfe ob schon ein Meeting für diesen Termin existiert
    existing = get_db().table("scheduled_meetings") \
        .select("id") \
        .eq("group_id", meeting['group_id']) \
        .eq("scheduled_start", next_date.isoformat()) \
        .neq("status", "cancelled") \
        .execute()

    if existing.data:
        return None  # Schon vorhanden

    meeting_id = hashlib.md5(
        f"{meeting['group_id']}{next_date.isoformat()}{datetime.now().isoformat()}".encode()
    ).hexdigest()[:16]
    room_name = generate_secure_room_name(meeting['group_id'], next_date.isoformat())

    try:
        get_db().table("scheduled_meetings").insert({
            "id": meeting_id,
            "group_id": meeting['group_id'],
            "title": meeting['title'],
            "scheduled_start": next_date.isoformat(),
            "scheduled_end": end_date.isoformat(),
            "recurrence_type": "woechentlich",
            "day_of_week": meeting['day_of_week'],
            "time_of_day": meeting['time_of_day'],
            "duration_minutes": meeting['duration_minutes'],
            "status": "scheduled",
            "jitsi_room_name": room_name,
            "created_by": meeting['created_by']
        }).execute()
        return {"id": meeting_id, "scheduled_start": next_date.isoformat()}
    except Exception as e:
        print(f"Error renewing meeting: {e}")
        return None


def get_next_meeting(group_id: str) -> Optional[Dict]:
    """Nächstes Meeting (scheduled_end > now, status != cancelled).
    Erneuert automatisch wöchentliche Meetings wenn nötig."""
    group_tz = get_group_timezone(group_id)
    now = datetime.now(ZoneInfo(group_tz)).isoformat()

    result = get_db().table("scheduled_meetings") \
        .select("*") \
        .eq("group_id", group_id) \
        .gt("scheduled_end", now) \
        .neq("status", "cancelled") \
        .order("scheduled_start") \
        .limit(1) \
        .execute()

    if result.data:
        return result.data[0]

    # Kein zukünftiges Meeting → prüfe ob ein wöchentliches erneuert werden muss
    last_meeting = get_db().table("scheduled_meetings") \
        .select("*") \
        .eq("group_id", group_id) \
        .eq("recurrence_type", "woechentlich") \
        .neq("status", "cancelled") \
        .order("scheduled_start", desc=True) \
        .limit(1) \
        .execute()

    if last_meeting.data:
        renewed = renew_recurring_meeting(last_meeting.data[0])
        if renewed:
            # Nochmal holen mit allen Feldern
            return get_db().table("scheduled_meetings") \
                .select("*") \
                .eq("id", renewed["id"]) \
                .execute().data[0]

    return None


def get_group_meetings(group_id: str, include_past: bool = False) -> List[Dict]:
    """Holt alle Meetings einer Gruppe."""
    query = get_db().table("scheduled_meetings") \
        .select("*") \
        .eq("group_id", group_id)

    if include_past:
        query = query.order("scheduled_start", desc=True)
    else:
        group_tz = get_group_timezone(group_id)
        now = datetime.now(ZoneInfo(group_tz)).isoformat()
        query = query.gt("scheduled_end", now) \
            .neq("status", "cancelled") \
            .order("scheduled_start")

    return query.execute().data


def get_meeting_access(group_id: str, user_id: str, user_role: str = 'kind') -> Dict[str, Any]:
    """Zugangs-Check: canJoin (5 Min. vor Start bis Ende), timeStatus, roomName,
    Jitsi config, interfaceConfig, userRole."""
    meeting = get_next_meeting(group_id)

    if not meeting:
        return {
            "canJoin": False,
            "timeStatus": {"reason": "no_meeting", "message": "Kein Meeting geplant"},
            "roomName": None,
            "meeting": None
        }

    group_tz = get_group_timezone(group_id)
    now = datetime.now(ZoneInfo(group_tz))
    start = datetime.fromisoformat(meeting['scheduled_start'])
    end = datetime.fromisoformat(meeting['scheduled_end'])

    # Legacy-Fallback: naive Datetimes mit Gruppen-Zeitzone versehen
    if start.tzinfo is None:
        start = start.replace(tzinfo=ZoneInfo(group_tz))
    if end.tzinfo is None:
        end = end.replace(tzinfo=ZoneInfo(group_tz))

    access_start = start - timedelta(minutes=5)

    if now < access_start:
        minutes_until = int((access_start - now).total_seconds() / 60)
        time_status = {
            "canJoin": False,
            "reason": "too_early",
            "message": f"Das Treffen beginnt in {minutes_until} Minuten",
            "minutesUntilStart": minutes_until
        }
    elif now > end:
        time_status = {
            "canJoin": False,
            "reason": "ended",
            "message": "Das Treffen ist bereits beendet"
        }
    else:
        minutes_remaining = int((end - now).total_seconds() / 60)
        time_status = {
            "canJoin": True,
            "reason": "active",
            "message": "Treffen ist aktiv",
            "minutesRemaining": minutes_remaining
        }

    config = get_jitsi_config(user_role)
    interface_config = get_jitsi_interface_config()

    return {
        "canJoin": time_status.get("canJoin", False),
        "timeStatus": time_status,
        "roomName": meeting['jitsi_room_name'],
        "meeting": meeting,
        "config": config,
        "interfaceConfig": interface_config,
        "userRole": user_role
    }


# ============================================
# JITSI-KONFIGURATION
# ============================================

def get_jitsi_config(role: str) -> Dict:
    """Jitsi-Konfiguration basierend auf Benutzerrolle (coach/kind)."""
    base_buttons = [
        'microphone', 'camera', 'desktop', 'hangup',
        'chat', 'raisehand', 'tileview'
    ]
    coach_buttons = base_buttons + [
        'mute-everyone', 'participants-pane', 'settings'
    ]

    return {
        "startWithAudioMuted": True,
        "startWithVideoMuted": False,
        "disableDeepLinking": True,
        "prejoinPageEnabled": False,
        "enableClosePage": False,
        "disableInviteFunctions": True,
        "hideConferenceSubject": False,
        "subject": "Schatzkarten-Treffen",
        "desktopSharingEnabled": True,
        "desktopSharingFrameRate": {"min": 5, "max": 15},
        "disableRemoteMute": role != 'coach',
        "remoteVideoMenu": {
            "disableKick": role != 'coach',
            "disableGrantModerator": True
        },
        "toolbarButtons": coach_buttons if role == 'coach' else base_buttons,
        "fileRecordingsEnabled": False,
        "liveStreamingEnabled": False,
        "defaultLanguage": "de"
    }


def get_jitsi_interface_config() -> Dict:
    """Interface-Konfiguration für Jitsi (kindgerecht)."""
    return {
        "DISABLE_JOIN_LEAVE_NOTIFICATIONS": False,
        "SHOW_JITSI_WATERMARK": False,
        "SHOW_BRAND_WATERMARK": False,
        "SHOW_POWERED_BY": False,
        "SHOW_PROMOTIONAL_CLOSE_PAGE": False,
        "MOBILE_APP_PROMO": False,
        "HIDE_INVITE_MORE_HEADER": True,
        "TOOLBAR_ALWAYS_VISIBLE": True,
        "INITIAL_TOOLBAR_TIMEOUT": 0
    }


# ============================================
# MEETING-TEILNEHMER TRACKING
# ============================================

def record_meeting_join(meeting_id: str, user_id: str, display_name: str, role: str = 'kind') -> bool:
    """Registriert den Beitritt eines Teilnehmers."""
    try:
        get_db().table("meeting_participants").insert({
            "meeting_id": meeting_id,
            "user_id": user_id,
            "display_name": display_name,
            "role": role,
            "joined_at": datetime.now().isoformat()
        }).execute()
        return True
    except Exception as e:
        print(f"Error recording join: {e}")
        return False


def record_meeting_leave(meeting_id: str, user_id: str) -> bool:
    """Registriert das Verlassen eines Teilnehmers."""
    try:
        get_db().table("meeting_participants") \
            .update({"left_at": datetime.now().isoformat()}) \
            .eq("meeting_id", meeting_id) \
            .eq("user_id", user_id) \
            .is_("left_at", "null") \
            .execute()
        return True
    except Exception as e:
        print(f"Error recording leave: {e}")
        return False


def cancel_meeting(meeting_id: str) -> bool:
    """Storniert ein Meeting (setzt status auf 'cancelled')."""
    try:
        result = get_db().table("scheduled_meetings") \
            .update({"status": "cancelled"}) \
            .eq("id", meeting_id) \
            .execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error cancelling meeting: {e}")
        return False
