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
from pathlib import Path
from typing import Dict, List, Optional, Any
import json

# ============================================
# DATABASE PATH (gleich wie gamification_db.py)
# ============================================

def get_db_path() -> Path:
    """Gibt den Pfad zur SQLite-Datenbank zurück."""
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent.parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "hattie_gamification.db"

# ============================================
# TABELLEN INITIALISIERUNG
# ============================================

def init_lerngruppen_tables():
    """Initialisiert die Lerngruppen-Tabellen."""
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT * FROM learning_groups WHERE group_id = ?", (group_id,))
    row = c.fetchone()
    conn.close()
    
    return dict(row) if row else None


def get_coach_groups(coach_id: str) -> List[Dict]:
    """Holt alle Gruppen eines Coaches."""
    init_lerngruppen_tables()
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
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
    
    conn = sqlite3.connect(get_db_path())
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
    
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
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
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
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
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
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
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
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
    
    conn = sqlite3.connect(get_db_path())
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
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
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
    conn = sqlite3.connect(get_db_path())
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
# INITIALISIERUNG
# ============================================

# Tabellen beim Import erstellen
init_lerngruppen_tables()
