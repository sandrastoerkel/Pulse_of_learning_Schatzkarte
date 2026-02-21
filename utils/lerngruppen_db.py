# -*- coding: utf-8 -*-
"""
👥 Lerngruppen-Datenbank-Modul
==============================

Verwaltet Lerngruppen für die Schatzkarte.
- Gruppen erstellen/verwalten
- Mitglieder einladen (Email-Token)
- Wöchentliche Insel-Auswahl durch Coach

Speicherort: hattie_gamification.db (gleiche DB wie Schatzkarte)
"""

import sqlite3
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json

from utils.database import get_connection

# ============================================
# TABELLEN INITIALISIERUNG
# ============================================

def init_lerngruppen_tables():
    """Initialisiert die Lerngruppen-Tabellen."""
    conn = get_connection()
    c = conn.cursor()
    
    # Lerngruppen-Tabelle
    c.execute('''
        CREATE TABLE IF NOT EXISTS learning_groups (
            group_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            coach_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            start_date DATE,
            current_week INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            settings TEXT DEFAULT '{}',
            FOREIGN KEY (coach_id) REFERENCES users(user_id)
        )
    ''')
    
    # Gruppen-Mitglieder
    c.execute('''
        CREATE TABLE IF NOT EXISTS group_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id TEXT NOT NULL,
            user_id TEXT NOT NULL UNIQUE,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active',
            FOREIGN KEY (group_id) REFERENCES learning_groups(group_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Einladungs-Tokens
    c.execute('''
        CREATE TABLE IF NOT EXISTS group_invitations (
            token TEXT PRIMARY KEY,
            group_id TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            used_at TIMESTAMP,
            used_by TEXT,
            FOREIGN KEY (group_id) REFERENCES learning_groups(group_id)
        )
    ''')
    
    # Wöchentliche Insel-Auswahl (Coach wählt Woche für Woche)
    c.execute('''
        CREATE TABLE IF NOT EXISTS group_weekly_islands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id TEXT NOT NULL,
            week_number INTEGER NOT NULL,
            island_id TEXT NOT NULL,
            activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            coach_notes TEXT,
            UNIQUE(group_id, week_number),
            UNIQUE(group_id, island_id),
            FOREIGN KEY (group_id) REFERENCES learning_groups(group_id)
        )
    ''')

    # Migration: status-Spalte zu group_members hinzufügen falls nicht vorhanden
    try:
        c.execute("ALTER TABLE group_members ADD COLUMN status TEXT DEFAULT 'active'")
    except sqlite3.OperationalError:
        pass  # Spalte existiert bereits
    
    # Indizes
    c.execute('CREATE INDEX IF NOT EXISTS idx_members_group ON group_members(group_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_members_user ON group_members(user_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_invitations_group ON group_invitations(group_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_weekly_islands_group ON group_weekly_islands(group_id)')
    
    conn.commit()
    conn.close()

# ============================================
# GRUPPEN-VERWALTUNG
# ============================================

def create_group(name: str, coach_id: str, start_date: str = None) -> Optional[str]:
    """
    Erstellt eine neue Lerngruppe.
    
    Args:
        name: Name der Gruppe (z.B. "Klasse 4a")
        coach_id: User-ID des Coaches
        start_date: Startdatum (YYYY-MM-DD), optional
    
    Returns:
        group_id oder None bei Fehler
    """
    init_lerngruppen_tables()
    conn = get_connection()
    c = conn.cursor()
    
    # Generiere eindeutige Group-ID
    group_id = hashlib.md5(f"{name}{coach_id}{datetime.now().isoformat()}".encode()).hexdigest()[:12]
    
    try:
        c.execute('''
            INSERT INTO learning_groups (group_id, name, coach_id, start_date, current_week)
            VALUES (?, ?, ?, ?, 0)
        ''', (group_id, name, coach_id, start_date))
        
        conn.commit()
        return group_id
    except Exception as e:
        print(f"Error creating group: {e}")
        return None
    finally:
        conn.close()


def get_group(group_id: str) -> Optional[Dict]:
    """Holt eine Gruppe anhand der ID."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT * FROM learning_groups WHERE group_id = ?", (group_id,))
    row = c.fetchone()
    conn.close()
    
    return dict(row) if row else None


def get_coach_groups(coach_id: str) -> List[Dict]:
    """Holt alle Gruppen eines Coaches."""
    init_lerngruppen_tables()
    conn = get_connection()
    c = conn.cursor()
    
    c.execute('''
        SELECT g.*, 
               (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id AND status = 'active') as member_count
        FROM learning_groups g
        WHERE g.coach_id = ? AND g.is_active = 1
        ORDER BY g.created_at DESC
    ''', (coach_id,))
    
    groups = [dict(row) for row in c.fetchall()]
    conn.close()
    return groups


def update_group(group_id: str, **kwargs) -> bool:
    """
    Aktualisiert Gruppen-Eigenschaften.
    
    Erlaubte kwargs: name, start_date, current_week, is_active, settings
    """
    allowed_fields = {'name', 'start_date', 'current_week', 'is_active', 'settings'}
    updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
    
    if not updates:
        return False
    
    conn = get_connection()
    c = conn.cursor()
    
    set_clause = ", ".join([f"{k} = ?" for k in updates.keys()])
    values = list(updates.values()) + [group_id]
    
    try:
        c.execute(f"UPDATE learning_groups SET {set_clause} WHERE group_id = ?", values)
        conn.commit()
        success = c.rowcount > 0
    except Exception as e:
        print(f"Error updating group: {e}")
        success = False
    
    conn.close()
    return success


def delete_group(group_id: str, soft_delete: bool = True) -> bool:
    """Löscht eine Gruppe (soft delete = is_active = 0)."""
    if soft_delete:
        return update_group(group_id, is_active=0)
    
    conn = get_connection()
    c = conn.cursor()
    
    try:
        # Kaskadierendes Löschen
        c.execute("DELETE FROM group_weekly_islands WHERE group_id = ?", (group_id,))
        c.execute("DELETE FROM group_invitations WHERE group_id = ?", (group_id,))
        c.execute("DELETE FROM group_members WHERE group_id = ?", (group_id,))
        c.execute("DELETE FROM learning_groups WHERE group_id = ?", (group_id,))
        conn.commit()
        success = True
    except Exception as e:
        print(f"Error deleting group: {e}")
        success = False
    
    conn.close()
    return success

# ============================================
# MITGLIEDER-VERWALTUNG
# ============================================

def add_member(group_id: str, user_id: str) -> bool:
    """
    Fügt ein Mitglied zur Gruppe hinzu.
    Ein User kann nur in EINER Gruppe sein (UNIQUE constraint).
    """
    conn = get_connection()
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT INTO group_members (group_id, user_id, status)
            VALUES (?, ?, 'active')
        ''', (group_id, user_id))
        conn.commit()
        return True
    except sqlite3.IntegrityError as e:
        # User ist bereits in einer Gruppe
        print(f"User already in a group: {e}")
        return False
    except Exception as e:
        print(f"Error adding member: {e}")
        return False
    finally:
        conn.close()


def remove_member(group_id: str, user_id: str) -> bool:
    """Entfernt ein Mitglied aus der Gruppe."""
    conn = get_connection()
    c = conn.cursor()
    
    try:
        c.execute('''
            DELETE FROM group_members 
            WHERE group_id = ? AND user_id = ?
        ''', (group_id, user_id))
        conn.commit()
        return c.rowcount > 0
    except Exception as e:
        print(f"Error removing member: {e}")
        return False
    finally:
        conn.close()


def get_group_members(group_id: str) -> List[Dict]:
    """Holt alle Mitglieder einer Gruppe mit User-Details."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute('''
        SELECT gm.*, u.display_name, u.age_group, u.level, u.xp_total, u.current_streak
        FROM group_members gm
        JOIN users u ON gm.user_id = u.user_id
        WHERE gm.group_id = ? AND gm.status = 'active'
        ORDER BY u.display_name
    ''', (group_id,))
    
    members = [dict(row) for row in c.fetchall()]
    conn.close()
    return members


def get_user_group(user_id: str) -> Optional[Dict]:
    """Holt die Gruppe eines Users (falls vorhanden)."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute('''
        SELECT g.*, gm.joined_at
        FROM group_members gm
        JOIN learning_groups g ON gm.group_id = g.group_id
        WHERE gm.user_id = ? AND gm.status = 'active' AND g.is_active = 1
    ''', (user_id,))
    
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

# ============================================
# EINLADUNGS-SYSTEM
# ============================================

def create_invitation(group_id: str, email: str = None, expires_days: int = 7) -> Optional[str]:
    """
    Erstellt einen Einladungs-Token.
    
    Args:
        group_id: Ziel-Gruppe
        email: Email-Adresse (optional, für Tracking)
        expires_days: Gültigkeit in Tagen
    
    Returns:
        Token-String oder None
    """
    conn = get_connection()
    c = conn.cursor()
    
    token = secrets.token_urlsafe(16)
    expires_at = (datetime.now() + timedelta(days=expires_days)).isoformat()
    
    try:
        c.execute('''
            INSERT INTO group_invitations (token, group_id, email, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (token, group_id, email, expires_at))
        conn.commit()
        return token
    except Exception as e:
        print(f"Error creating invitation: {e}")
        return None
    finally:
        conn.close()


def get_invitation(token: str) -> Optional[Dict]:
    """Holt Einladungs-Details anhand des Tokens."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute('''
        SELECT i.*, g.name as group_name, g.coach_id
        FROM group_invitations i
        JOIN learning_groups g ON i.group_id = g.group_id
        WHERE i.token = ?
    ''', (token,))
    
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def use_invitation(token: str, user_id: str) -> Dict[str, Any]:
    """
    Verwendet einen Einladungs-Token.
    
    Returns:
        {"success": bool, "message": str, "group_id": str or None}
    """
    invitation = get_invitation(token)
    
    if not invitation:
        return {"success": False, "message": "Ungültiger Einladungslink", "group_id": None}
    
    # Prüfe ob bereits verwendet
    if invitation.get('used_at'):
        return {"success": False, "message": "Einladung wurde bereits verwendet", "group_id": None}
    
    # Prüfe Ablaufdatum
    if invitation.get('expires_at'):
        expires = datetime.fromisoformat(invitation['expires_at'])
        if datetime.now() > expires:
            return {"success": False, "message": "Einladung ist abgelaufen", "group_id": None}
    
    # Prüfe ob User bereits in einer Gruppe ist
    existing_group = get_user_group(user_id)
    if existing_group:
        return {
            "success": False, 
            "message": f"Du bist bereits in der Gruppe '{existing_group['name']}'",
            "group_id": None
        }
    
    # Füge User zur Gruppe hinzu
    group_id = invitation['group_id']
    if not add_member(group_id, user_id):
        return {"success": False, "message": "Fehler beim Beitreten", "group_id": None}
    
    # Markiere Einladung als verwendet
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        UPDATE group_invitations 
        SET used_at = ?, used_by = ?
        WHERE token = ?
    ''', (datetime.now().isoformat(), user_id, token))
    conn.commit()
    conn.close()
    
    return {
        "success": True, 
        "message": f"Willkommen in der Gruppe '{invitation['group_name']}'!",
        "group_id": group_id
    }


def get_group_invitations(group_id: str, include_used: bool = False) -> List[Dict]:
    """Holt alle Einladungen einer Gruppe."""
    conn = get_connection()
    c = conn.cursor()
    
    if include_used:
        c.execute('''
            SELECT * FROM group_invitations 
            WHERE group_id = ?
            ORDER BY created_at DESC
        ''', (group_id,))
    else:
        c.execute('''
            SELECT * FROM group_invitations 
            WHERE group_id = ? AND used_at IS NULL
            ORDER BY created_at DESC
        ''', (group_id,))
    
    invitations = [dict(row) for row in c.fetchall()]
    conn.close()
    return invitations

# ============================================
# WÖCHENTLICHE INSEL-AUSWAHL
# ============================================

# Flexible Inseln (aus map_data.py)
FLEXIBLE_ISLANDS = [
    "spiegel_see", "vulkan", "ruhe_oase", "ausdauer_gipfel",
    "fokus_leuchtturm", "wachstum_garten", "lehrer_turm",
    "wohlfuehl_dorf", "schutz_burg"
]

def activate_weekly_island(group_id: str, week_number: int, island_id: str, notes: str = None) -> bool:
    """
    Aktiviert eine Insel für eine bestimmte Woche.
    
    Args:
        group_id: Gruppen-ID
        week_number: Woche 5-11
        island_id: ID der flexiblen Insel
        notes: Coach-Notizen (warum diese Insel?)
    
    Returns:
        True bei Erfolg
    """
    if week_number < 5 or week_number > 11:
        print(f"Invalid week number: {week_number} (must be 5-11)")
        return False
    
    if island_id not in FLEXIBLE_ISLANDS:
        print(f"Invalid island_id: {island_id}")
        return False
    
    conn = get_connection()
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT INTO group_weekly_islands (group_id, week_number, island_id, coach_notes)
            VALUES (?, ?, ?, ?)
        ''', (group_id, week_number, island_id, notes))
        
        # Aktualisiere current_week der Gruppe
        c.execute('''
            UPDATE learning_groups SET current_week = ? WHERE group_id = ?
        ''', (week_number, group_id))
        
        conn.commit()
        return True
    except sqlite3.IntegrityError as e:
        # Woche oder Insel bereits vergeben
        print(f"Island activation conflict: {e}")
        return False
    except Exception as e:
        print(f"Error activating island: {e}")
        return False
    finally:
        conn.close()


def get_activated_islands(group_id: str) -> List[Dict]:
    """Holt alle aktivierten Inseln einer Gruppe."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute('''
        SELECT * FROM group_weekly_islands 
        WHERE group_id = ?
        ORDER BY week_number
    ''', (group_id,))
    
    islands = [dict(row) for row in c.fetchall()]
    conn.close()
    return islands


def get_available_islands(group_id: str) -> List[str]:
    """
    Gibt die noch verfügbaren flexiblen Inseln zurück.
    (9 minus bereits aktivierte)
    """
    activated = get_activated_islands(group_id)
    activated_ids = {i['island_id'] for i in activated}
    
    return [i for i in FLEXIBLE_ISLANDS if i not in activated_ids]


def get_current_island(group_id: str, week_number: int) -> Optional[str]:
    """Holt die aktivierte Insel für eine bestimmte Woche."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute('''
        SELECT island_id FROM group_weekly_islands 
        WHERE group_id = ? AND week_number = ?
    ''', (group_id, week_number))
    
    row = c.fetchone()
    conn.close()
    return row[0] if row else None


def get_group_week(group_id: str, start_date: str = None) -> int:
    """
    Berechnet die aktuelle Woche der Gruppe basierend auf start_date.
    Falls kein start_date, nutze current_week aus DB.
    """
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
        return max(0, min(12, weeks_passed))  # 0-12 Wochen
    except:
        return group.get('current_week', 0)

# ============================================
# GRUPPEN-FORTSCHRITT
# ============================================

def get_group_progress(group_id: str) -> Dict[str, Any]:
    """
    Holt den Gesamtfortschritt einer Gruppe.
    
    Returns:
        {
            "current_week": int,
            "activated_islands": [...],
            "available_islands": [...],
            "member_count": int,
            "total_xp": int,
            "avg_level": float
        }
    """
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
    """Initialisiert die Meeting-Tabellen."""
    conn = get_connection()
    c = conn.cursor()

    # Scheduled Meetings Tabelle
    c.execute('''
        CREATE TABLE IF NOT EXISTS scheduled_meetings (
            id TEXT PRIMARY KEY,
            group_id TEXT NOT NULL,
            title TEXT NOT NULL,
            scheduled_start TIMESTAMP NOT NULL,
            scheduled_end TIMESTAMP NOT NULL,
            recurrence_type TEXT DEFAULT 'weekly',
            day_of_week INTEGER,
            time_of_day TEXT,
            duration_minutes INTEGER DEFAULT 45,
            status TEXT DEFAULT 'scheduled',
            jitsi_room_name TEXT UNIQUE,
            created_by TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES learning_groups(group_id),
            FOREIGN KEY (created_by) REFERENCES users(user_id)
        )
    ''')

    # Meeting Participants Tabelle
    c.execute('''
        CREATE TABLE IF NOT EXISTS meeting_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            display_name TEXT,
            role TEXT DEFAULT 'kind',
            joined_at TIMESTAMP,
            left_at TIMESTAMP,
            FOREIGN KEY (meeting_id) REFERENCES scheduled_meetings(id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')

    # Indizes
    c.execute('CREATE INDEX IF NOT EXISTS idx_meetings_group ON scheduled_meetings(group_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_meetings_status ON scheduled_meetings(status)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_participants_meeting ON meeting_participants(meeting_id)')

    conn.commit()
    conn.close()


def generate_secure_room_name(group_id: str, scheduled_start: str) -> str:
    """Generiert einen sicheren, nicht erratbaren Raumnamen."""
    date_str = scheduled_start.split('T')[0] if 'T' in scheduled_start else scheduled_start.split(' ')[0]
    room_secret = "schatzkarte-secret-2024"  # In Produktion: aus Umgebungsvariable
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
    """
    Plant ein neues Meeting für eine Lerngruppe.

    Args:
        group_id: ID der Lerngruppe
        coach_id: ID des Coaches
        day_of_week: 0=Sonntag, 1=Montag, ..., 6=Samstag
        time_of_day: Uhrzeit im Format "HH:MM"
        duration_minutes: Dauer in Minuten
        recurrence: 'weekly', 'biweekly', 'none'
        title: Titel des Meetings (optional)

    Returns:
        Meeting-Dict oder None bei Fehler
    """
    init_meeting_tables()
    conn = get_connection()
    c = conn.cursor()

    # Berechne nächsten Termin
    next_date = calculate_next_meeting_date(day_of_week, time_of_day)
    end_date = next_date + timedelta(minutes=duration_minutes)

    # Generiere eindeutige Meeting-ID und Raumnamen
    meeting_id = hashlib.md5(f"{group_id}{next_date.isoformat()}{datetime.now().isoformat()}".encode()).hexdigest()[:16]
    room_name = generate_secure_room_name(group_id, next_date.isoformat())

    # Hole Gruppenname für Titel
    group = get_group(group_id)
    meeting_title = title or f"Schatzkarten-Treffen: {group['name'] if group else 'Lerngruppe'}"

    try:
        c.execute('''
            INSERT INTO scheduled_meetings
            (id, group_id, title, scheduled_start, scheduled_end, recurrence_type,
             day_of_week, time_of_day, duration_minutes, status, jitsi_room_name, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
        ''', (
            meeting_id, group_id, meeting_title,
            next_date.isoformat(), end_date.isoformat(),
            recurrence, day_of_week, time_of_day, duration_minutes,
            room_name, coach_id
        ))
        conn.commit()

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
    finally:
        conn.close()


def calculate_next_meeting_date(day_of_week: int, time_of_day: str) -> datetime:
    """Berechnet das nächste Datum für einen bestimmten Wochentag und Uhrzeit."""
    now = datetime.now()
    hour, minute = map(int, time_of_day.split(':'))

    # Finde den nächsten passenden Wochentag
    days_ahead = day_of_week - now.weekday()
    if days_ahead < 0:  # Ziel-Tag ist schon vorbei diese Woche
        days_ahead += 7
    elif days_ahead == 0:  # Heute ist der Tag
        # Prüfe ob die Uhrzeit schon vorbei ist
        target_time = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if now >= target_time:
            days_ahead = 7  # Nächste Woche

    next_date = now + timedelta(days=days_ahead)
    return next_date.replace(hour=hour, minute=minute, second=0, microsecond=0)


def get_next_meeting(group_id: str) -> Optional[Dict]:
    """Holt das nächste geplante Meeting einer Gruppe."""
    init_meeting_tables()
    conn = get_connection()
    c = conn.cursor()

    now = datetime.now().isoformat()

    c.execute('''
        SELECT * FROM scheduled_meetings
        WHERE group_id = ? AND scheduled_end > ? AND status != 'cancelled'
        ORDER BY scheduled_start ASC
        LIMIT 1
    ''', (group_id, now))

    row = c.fetchone()
    conn.close()

    return dict(row) if row else None


def get_group_meetings(group_id: str, include_past: bool = False) -> List[Dict]:
    """Holt alle Meetings einer Gruppe."""
    init_meeting_tables()
    conn = get_connection()
    c = conn.cursor()

    if include_past:
        c.execute('''
            SELECT * FROM scheduled_meetings
            WHERE group_id = ?
            ORDER BY scheduled_start DESC
        ''', (group_id,))
    else:
        now = datetime.now().isoformat()
        c.execute('''
            SELECT * FROM scheduled_meetings
            WHERE group_id = ? AND scheduled_end > ?
            ORDER BY scheduled_start ASC
        ''', (group_id, now))

    meetings = [dict(row) for row in c.fetchall()]
    conn.close()
    return meetings


def get_meeting_access(group_id: str, user_id: str, user_role: str = 'kind') -> Dict[str, Any]:
    """
    Generiert Zugangs-Informationen für ein Meeting.

    Returns:
        {
            "canJoin": bool,
            "timeStatus": {...},
            "roomName": str,
            "meeting": {...},
            "config": {...}
        }
    """
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

    # 5 Minuten Puffer vor Start
    access_start = start - timedelta(minutes=5)

    # Zeit-Status prüfen
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

    # Jitsi-Konfiguration
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
        "subject": "🗺️ Schatzkarten-Treffen",
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
    conn = get_connection()
    c = conn.cursor()

    try:
        c.execute('''
            INSERT INTO meeting_participants (meeting_id, user_id, display_name, role, joined_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (meeting_id, user_id, display_name, role, datetime.now().isoformat()))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error recording join: {e}")
        return False
    finally:
        conn.close()


def record_meeting_leave(meeting_id: str, user_id: str) -> bool:
    """Registriert das Verlassen eines Teilnehmers."""
    conn = get_connection()
    c = conn.cursor()

    try:
        c.execute('''
            UPDATE meeting_participants
            SET left_at = ?
            WHERE meeting_id = ? AND user_id = ? AND left_at IS NULL
        ''', (datetime.now().isoformat(), meeting_id, user_id))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error recording leave: {e}")
        return False
    finally:
        conn.close()


def cancel_meeting(meeting_id: str) -> bool:
    """Storniert ein Meeting."""
    conn = get_connection()
    c = conn.cursor()

    try:
        c.execute('''
            UPDATE scheduled_meetings SET status = 'cancelled' WHERE id = ?
        ''', (meeting_id,))
        conn.commit()
        return c.rowcount > 0
    except Exception as e:
        print(f"Error cancelling meeting: {e}")
        return False
    finally:
        conn.close()


# ============================================
# INITIALISIERUNG
# ============================================

# Tabellen beim Import erstellen
init_lerngruppen_tables()
init_meeting_tables()
