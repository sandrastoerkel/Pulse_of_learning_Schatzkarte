# -*- coding: utf-8 -*-
"""
Lerngruppen-Datenbank-Modul (Supabase)

Verwaltet Lerngruppen für die Schatzkarte.
- Gruppen erstellen/verwalten
- Mitglieder einladen (Token)
- Wöchentliche Insel-Auswahl durch Coach
"""

import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from utils.database import get_db

# ============================================
# TABELLEN INITIALISIERUNG
# ============================================

def init_lerngruppen_tables():
    """Keine Initialisierung nötig — Tabellen existieren in Supabase."""
    pass

# ============================================
# GRUPPEN-VERWALTUNG
# ============================================

def create_group(name: str, coach_id: str, start_date: str = None) -> Optional[str]:
    """Erstellt eine neue Lerngruppe."""
    group_id = hashlib.md5(f"{name}{coach_id}{datetime.now().isoformat()}".encode()).hexdigest()[:12]

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
    """Holt alle Gruppen eines Coaches."""
    db = get_db()

    # Gruppen holen
    groups_result = db.table("learning_groups") \
        .select("*") \
        .eq("coach_id", coach_id) \
        .eq("is_active", True) \
        .order("created_at", desc=True) \
        .execute()

    groups = groups_result.data

    # Member-Count pro Gruppe hinzufügen
    for group in groups:
        members_result = db.table("group_members") \
            .select("id") \
            .eq("group_id", group["group_id"]) \
            .eq("status", "active") \
            .execute()
        group["member_count"] = len(members_result.data)

    return groups


def update_group(group_id: str, **kwargs) -> bool:
    """Aktualisiert Gruppen-Eigenschaften."""
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
    """Löscht eine Gruppe (soft delete = is_active = false)."""
    if soft_delete:
        return update_group(group_id, is_active=False)

    db = get_db()
    try:
        db.table("group_weekly_islands").delete().eq("group_id", group_id).execute()
        db.table("group_invitations").delete().eq("group_id", group_id).execute()
        db.table("group_members").delete().eq("group_id", group_id).execute()
        db.table("learning_groups").delete().eq("group_id", group_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting group: {e}")
        return False

# ============================================
# MITGLIEDER-VERWALTUNG
# ============================================

def add_member(group_id: str, user_id: str) -> bool:
    """Fügt ein Mitglied zur Gruppe hinzu."""
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
    """Entfernt ein Mitglied aus der Gruppe."""
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
    """Holt alle Mitglieder einer Gruppe mit User-Details."""
    db = get_db()

    # Mitglieder holen
    members_result = db.table("group_members") \
        .select("*") \
        .eq("group_id", group_id) \
        .eq("status", "active") \
        .execute()

    members = []
    for gm in members_result.data:
        # User-Details nachladen
        user_result = db.table("users") \
            .select("display_name, age_group, level, xp_total, current_streak") \
            .eq("user_id", gm["user_id"]) \
            .execute()

        member = {**gm}
        if user_result.data:
            member.update(user_result.data[0])
        members.append(member)

    # Nach display_name sortieren
    members.sort(key=lambda m: (m.get("display_name") or "").lower())
    return members


def get_user_group(user_id: str) -> Optional[Dict]:
    """Holt die Gruppe eines Users (falls vorhanden)."""
    db = get_db()

    # Mitgliedschaft finden
    member_result = db.table("group_members") \
        .select("group_id, joined_at") \
        .eq("user_id", user_id) \
        .eq("status", "active") \
        .execute()

    if not member_result.data:
        return None

    gm = member_result.data[0]

    # Gruppen-Details holen
    group_result = db.table("learning_groups") \
        .select("*") \
        .eq("group_id", gm["group_id"]) \
        .eq("is_active", True) \
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
    """Erstellt einen Einladungs-Token."""
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


def get_invitation(token: str) -> Optional[Dict]:
    """Holt Einladungs-Details anhand des Tokens."""
    db = get_db()

    inv_result = db.table("group_invitations") \
        .select("*") \
        .eq("token", token) \
        .execute()

    if not inv_result.data:
        return None

    invitation = inv_result.data[0]

    # Gruppen-Details nachladen
    group_result = db.table("learning_groups") \
        .select("name, coach_id") \
        .eq("group_id", invitation["group_id"]) \
        .execute()

    if group_result.data:
        invitation["group_name"] = group_result.data[0]["name"]
        invitation["coach_id"] = group_result.data[0]["coach_id"]

    return invitation


def use_invitation(token: str, user_id: str) -> Dict[str, Any]:
    """Verwendet einen Einladungs-Token."""
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

    # Markiere Einladung als verwendet
    get_db().table("group_invitations") \
        .update({
            "used_at": datetime.now().isoformat(),
            "used_by": user_id
        }) \
        .eq("token", token) \
        .execute()

    return {
        "success": True,
        "message": f"Willkommen in der Gruppe '{invitation.get('group_name', '')}'!",
        "group_id": group_id
    }


def get_group_invitations(group_id: str, include_used: bool = False) -> List[Dict]:
    """Holt alle Einladungen einer Gruppe."""
    query = get_db().table("group_invitations") \
        .select("*") \
        .eq("group_id", group_id) \
        .order("created_at", desc=True)

    if not include_used:
        query = query.is_("used_at", "null")

    return query.execute().data

# ============================================
# WÖCHENTLICHE INSEL-AUSWAHL
# ============================================

FLEXIBLE_ISLANDS = [
    "spiegel_see", "vulkan", "ruhe_oase", "ausdauer_gipfel",
    "fokus_leuchtturm", "wachstum_garten", "lehrer_turm",
    "wohlfuehl_dorf", "schutz_burg"
]

def activate_weekly_island(group_id: str, week_number: int, island_id: str, notes: str = None) -> bool:
    """Aktiviert eine Insel für eine bestimmte Woche."""
    if week_number < 5 or week_number > 11:
        print(f"Invalid week number: {week_number} (must be 5-11)")
        return False

    if island_id not in FLEXIBLE_ISLANDS:
        print(f"Invalid island_id: {island_id}")
        return False

    db = get_db()
    try:
        db.table("group_weekly_islands").insert({
            "group_id": group_id,
            "week_number": week_number,
            "island_id": island_id,
            "coach_notes": notes
        }).execute()

        # Aktualisiere current_week der Gruppe
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
    result = get_db().table("group_weekly_islands") \
        .select("*") \
        .eq("group_id", group_id) \
        .order("week_number") \
        .execute()
    return result.data


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
    """Berechnet die aktuelle Woche der Gruppe."""
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
    except:
        return group.get('current_week', 0)

# ============================================
# GRUPPEN-FORTSCHRITT
# ============================================

def get_group_progress(group_id: str) -> Dict[str, Any]:
    """Holt den Gesamtfortschritt einer Gruppe."""
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

def init_meeting_tables():
    """Keine Initialisierung nötig — Tabellen existieren in Supabase."""
    pass


def generate_secure_room_name(group_id: str, scheduled_start: str) -> str:
    """Generiert einen sicheren, nicht erratbaren Raumnamen."""
    date_str = scheduled_start.split('T')[0] if 'T' in scheduled_start else scheduled_start.split(' ')[0]
    room_secret = "schatzkarte-secret-2024"
    hash_input = f"{group_id}-{date_str}-{room_secret}"
    hash_value = hashlib.sha256(hash_input.encode()).hexdigest()[:12]
    return f"schatzkarte-{hash_value}"


def schedule_meeting(
    group_id: str,
    coach_id: str,
    day_of_week: int,
    time_of_day: str,
    duration_minutes: int = 45,
    recurrence: str = 'weekly',
    title: str = None
) -> Optional[Dict]:
    """Plant ein neues Meeting für eine Lerngruppe."""
    next_date = calculate_next_meeting_date(day_of_week, time_of_day)
    end_date = next_date + timedelta(minutes=duration_minutes)

    meeting_id = hashlib.md5(f"{group_id}{next_date.isoformat()}{datetime.now().isoformat()}".encode()).hexdigest()[:16]
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


def calculate_next_meeting_date(day_of_week: int, time_of_day: str) -> datetime:
    """Berechnet das nächste Datum für einen bestimmten Wochentag und Uhrzeit."""
    now = datetime.now()
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


def get_next_meeting(group_id: str) -> Optional[Dict]:
    """Holt das nächste geplante Meeting einer Gruppe."""
    now = datetime.now().isoformat()

    result = get_db().table("scheduled_meetings") \
        .select("*") \
        .eq("group_id", group_id) \
        .gt("scheduled_end", now) \
        .neq("status", "cancelled") \
        .order("scheduled_start") \
        .limit(1) \
        .execute()

    return result.data[0] if result.data else None


def get_group_meetings(group_id: str, include_past: bool = False) -> List[Dict]:
    """Holt alle Meetings einer Gruppe."""
    query = get_db().table("scheduled_meetings") \
        .select("*") \
        .eq("group_id", group_id)

    if include_past:
        query = query.order("scheduled_start", desc=True)
    else:
        now = datetime.now().isoformat()
        query = query.gt("scheduled_end", now).order("scheduled_start")

    return query.execute().data


def get_meeting_access(group_id: str, user_id: str, user_role: str = 'kind') -> Dict[str, Any]:
    """Generiert Zugangs-Informationen für ein Meeting."""
    meeting = get_next_meeting(group_id)

    if not meeting:
        return {
            "canJoin": False,
            "timeStatus": {"reason": "no_meeting", "message": "Kein Meeting geplant"},
            "roomName": None,
            "meeting": None
        }

    now = datetime.now()
    start = datetime.fromisoformat(meeting['scheduled_start'])
    end = datetime.fromisoformat(meeting['scheduled_end'])
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


def get_jitsi_config(role: str) -> Dict:
    """Jitsi-Konfiguration basierend auf Benutzerrolle."""
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
    """Storniert ein Meeting."""
    try:
        result = get_db().table("scheduled_meetings") \
            .update({"status": "cancelled"}) \
            .eq("id", meeting_id) \
            .execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error cancelling meeting: {e}")
        return False
