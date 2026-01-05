# -*- coding: utf-8 -*-
"""Datenbank fuer Schatzkarte."""
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

# Import der XP-Funktion aus gamification_db
from utils.gamification_db import update_user_stats, get_or_create_user

def get_db_path() -> Path:
    """Gibt den Pfad zur SQLite-Datenbank zurueck."""
    # Fuer Streamlit Cloud: tmp-Verzeichnis, sonst lokaler Ordner
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent.parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "hattie_gamification.db"

def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn

def init_map_tables():
    """Erstellt die Schatzkarten-Tabellen."""
    conn = get_connection()
    c = conn.cursor()

    # Lerngruppen
    c.execute("""
        CREATE TABLE IF NOT EXISTS learning_groups (
            group_id TEXT PRIMARY KEY,
            group_name TEXT NOT NULL,
            start_date DATE NOT NULL,
            is_active BOOLEAN DEFAULT TRUE
        )
    """)

    # Gruppen-Mitglieder
    c.execute("""
        CREATE TABLE IF NOT EXISTS group_members (
            group_id TEXT,
            user_id TEXT,
            PRIMARY KEY (group_id, user_id)
        )
    """)

    # Gesammelte Schaetze
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_treasures (
            user_id TEXT,
            island_id TEXT,
            treasure_id TEXT,
            collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            xp_earned INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, island_id, treasure_id)
        )
    """)

    # Insel-Fortschritt (Video, Erklaerung, Quiz, Challenge)
    c.execute("""
        CREATE TABLE IF NOT EXISTS island_progress (
            user_id TEXT,
            island_id TEXT,
            video_watched BOOLEAN DEFAULT 0,
            video_watched_at DATETIME,
            explanation_read BOOLEAN DEFAULT 0,
            explanation_read_at DATETIME,
            quiz_passed BOOLEAN DEFAULT 0,
            quiz_passed_at DATETIME,
            quiz_score INTEGER,
            challenge_completed BOOLEAN DEFAULT 0,
            challenge_completed_at DATETIME,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, island_id)
        )
    """)

    conn.commit()
    conn.close()
    print("Tabellen erstellt!")

# ===============================================================
# SCHATZ-FUNKTIONEN
# ===============================================================

def save_treasure_collected(user_id: str, island_id: str, treasure_id: str, xp: int) -> bool:
    """
    Speichert einen gesammelten Schatz in der Datenbank.

    - Prueft ob Schatz bereits gesammelt (UNIQUE constraint)
    - Ruft AUCH update_user_stats() aus gamification_db auf!

    Returns: True wenn neu gespeichert, False wenn bereits vorhanden
    """
    init_map_tables()  # Sicherstellen dass Tabelle existiert
    conn = get_connection()
    c = conn.cursor()

    try:
        # Schatz in user_treasures speichern
        c.execute("""
            INSERT INTO user_treasures (user_id, island_id, treasure_id, xp_earned)
            VALUES (?, ?, ?, ?)
        """, (user_id, island_id, treasure_id, xp))
        conn.commit()
        conn.close()

        # XP zum User hinzufuegen (in gamification_db)
        # Hole aktuellen Streak fuer Bonus-Berechnung
        user = get_or_create_user(user_id)
        current_streak = user.get('current_streak', 0)
        update_user_stats(user_id, xp, current_streak)

        print(f"Schatz '{treasure_id}' auf Insel '{island_id}' gesammelt!")
        print(f"+{xp} XP in Datenbank gespeichert")

        return True

    except sqlite3.IntegrityError:
        # Schatz bereits gesammelt (UNIQUE constraint verletzt)
        conn.close()
        print(f"Schatz '{treasure_id}' bereits gesammelt!")
        return False


def get_collected_treasures(user_id: str) -> List[Tuple[str, str]]:
    """
    Laedt alle gesammelten Schaetze eines Users.

    Returns: Liste von (island_id, treasure_id) Tupeln
    """
    init_map_tables()
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        SELECT island_id, treasure_id
        FROM user_treasures
        WHERE user_id = ?
        ORDER BY collected_at
    """, (user_id,))

    treasures = [(row['island_id'], row['treasure_id']) for row in c.fetchall()]
    conn.close()

    return treasures


def is_treasure_collected(user_id: str, island_id: str, treasure_id: str) -> bool:
    """Prueft ob ein bestimmter Schatz bereits gesammelt wurde."""
    init_map_tables()
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        SELECT 1 FROM user_treasures
        WHERE user_id = ? AND island_id = ? AND treasure_id = ?
    """, (user_id, island_id, treasure_id))

    result = c.fetchone() is not None
    conn.close()

    return result


def get_user_treasure_stats(user_id: str) -> dict:
    """Holt Schatz-Statistiken eines Users."""
    init_map_tables()
    conn = get_connection()
    c = conn.cursor()

    # Gesamte gesammelte Schaetze
    c.execute("SELECT COUNT(*) FROM user_treasures WHERE user_id = ?", (user_id,))
    total_treasures = c.fetchone()[0]

    # XP aus Schaetzen
    c.execute("SELECT SUM(xp_earned) FROM user_treasures WHERE user_id = ?", (user_id,))
    total_xp = c.fetchone()[0] or 0

    # Inseln mit mindestens einem Schatz
    c.execute("SELECT COUNT(DISTINCT island_id) FROM user_treasures WHERE user_id = ?", (user_id,))
    islands_visited = c.fetchone()[0]

    conn.close()

    return {
        "total_treasures": total_treasures,
        "total_xp_from_treasures": total_xp,
        "islands_visited": islands_visited
    }


# ===============================================================
# INSEL-FORTSCHRITT FUNKTIONEN
# ===============================================================

# XP-Belohnungen für Aktionen
XP_REWARDS = {
    "video_watched": 10,
    "explanation_read": 10,
    "quiz_passed": 50,
    "challenge_completed": 100,
}


def get_island_progress(user_id: str, island_id: str) -> dict:
    """Holt den Fortschritt eines Users für eine Insel."""
    init_map_tables()
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        SELECT * FROM island_progress
        WHERE user_id = ? AND island_id = ?
    """, (user_id, island_id))

    row = c.fetchone()
    conn.close()

    if row:
        return {
            "video_watched": bool(row["video_watched"]),
            "explanation_read": bool(row["explanation_read"]),
            "quiz_passed": bool(row["quiz_passed"]),
            "quiz_score": row["quiz_score"],
            "challenge_completed": bool(row["challenge_completed"]),
        }

    # Kein Eintrag = alles auf False
    return {
        "video_watched": False,
        "explanation_read": False,
        "quiz_passed": False,
        "quiz_score": None,
        "challenge_completed": False,
    }


def complete_island_action(user_id: str, island_id: str, action: str, extra_data: dict = None) -> int:
    """
    Markiert eine Aktion als abgeschlossen und vergibt XP.

    Args:
        user_id: User-ID
        island_id: Insel-ID
        action: "video_watched", "explanation_read", "quiz_passed", "challenge_completed"
        extra_data: Zusätzliche Daten (z.B. quiz_score)

    Returns:
        Anzahl der vergebenen XP (0 wenn bereits erledigt)
    """
    init_map_tables()

    # Prüfe ob bereits erledigt
    progress = get_island_progress(user_id, island_id)
    if progress.get(action):
        return 0  # Schon gemacht

    conn = get_connection()
    c = conn.cursor()

    now = datetime.now().isoformat()

    # Prüfe ob Eintrag existiert
    c.execute("SELECT 1 FROM island_progress WHERE user_id = ? AND island_id = ?",
              (user_id, island_id))

    if c.fetchone():
        # Update
        if action == "quiz_passed" and extra_data and "score" in extra_data:
            c.execute(f"""
                UPDATE island_progress
                SET {action} = 1, {action}_at = ?, quiz_score = ?, updated_at = ?
                WHERE user_id = ? AND island_id = ?
            """, (now, extra_data["score"], now, user_id, island_id))
        else:
            c.execute(f"""
                UPDATE island_progress
                SET {action} = 1, {action}_at = ?, updated_at = ?
                WHERE user_id = ? AND island_id = ?
            """, (now, now, user_id, island_id))
    else:
        # Insert
        if action == "quiz_passed" and extra_data and "score" in extra_data:
            c.execute(f"""
                INSERT INTO island_progress (user_id, island_id, {action}, {action}_at, quiz_score, updated_at)
                VALUES (?, ?, 1, ?, ?, ?)
            """, (user_id, island_id, now, extra_data["score"], now))
        else:
            c.execute(f"""
                INSERT INTO island_progress (user_id, island_id, {action}, {action}_at, updated_at)
                VALUES (?, ?, 1, ?, ?)
            """, (user_id, island_id, now, now))

    conn.commit()
    conn.close()

    # XP vergeben
    xp = XP_REWARDS.get(action, 0)
    if xp > 0:
        user = get_or_create_user(user_id)
        current_streak = user.get('current_streak', 0)
        update_user_stats(user_id, xp, current_streak)

    return xp


def get_island_progress_percentage(user_id: str, island_id: str) -> int:
    """Berechnet den Fortschritt in Prozent (0-100)."""
    progress = get_island_progress(user_id, island_id)

    completed = 0
    total = 4  # video, explanation, quiz, challenge

    if progress["video_watched"]:
        completed += 1
    if progress["explanation_read"]:
        completed += 1
    if progress["quiz_passed"]:
        completed += 1
    if progress["challenge_completed"]:
        completed += 1

    return int((completed / total) * 100)


def get_all_island_progress(user_id: str) -> dict:
    """Holt den Fortschritt für alle Inseln eines Users."""
    init_map_tables()
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        SELECT island_id, video_watched, explanation_read, quiz_passed, challenge_completed
        FROM island_progress
        WHERE user_id = ?
    """, (user_id,))

    result = {}
    for row in c.fetchall():
        result[row["island_id"]] = {
            "video_watched": bool(row["video_watched"]),
            "explanation_read": bool(row["explanation_read"]),
            "quiz_passed": bool(row["quiz_passed"]),
            "challenge_completed": bool(row["challenge_completed"]),
        }

    conn.close()
    return result


if __name__ == "__main__":
    init_map_tables()
