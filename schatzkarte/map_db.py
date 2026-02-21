# -*- coding: utf-8 -*-
"""Datenbank fuer Schatzkarte."""
from datetime import datetime
from typing import List, Tuple

# Import der XP-Funktion aus gamification_db
from utils.gamification_db import update_user_stats, get_or_create_user
from utils.database import get_db

def init_map_tables():
    """Keine Initialisierung nötig — Tabellen existieren in Supabase."""
    pass

# ===============================================================
# SCHATZ-FUNKTIONEN
# ===============================================================

def save_treasure_collected(user_id: str, island_id: str, treasure_id: str, xp: int) -> bool:
    """Speichert einen gesammelten Schatz. Returns: True wenn neu, False wenn bereits vorhanden."""
    db = get_db()

    # Prüfe ob bereits gesammelt
    existing = db.table("user_treasures") \
        .select("user_id") \
        .eq("user_id", user_id) \
        .eq("island_id", island_id) \
        .eq("treasure_id", treasure_id) \
        .execute()

    if existing.data:
        return False

    db.table("user_treasures").insert({
        "user_id": user_id,
        "island_id": island_id,
        "treasure_id": treasure_id,
        "xp_earned": xp
    }).execute()

    # XP zum User hinzufuegen
    user = get_or_create_user(user_id)
    current_streak = user.get('current_streak', 0)
    update_user_stats(user_id, xp, current_streak)

    return True


def get_collected_treasures(user_id: str) -> List[Tuple[str, str]]:
    """Laedt alle gesammelten Schaetze. Returns: Liste von (island_id, treasure_id)."""
    result = get_db().table("user_treasures") \
        .select("island_id, treasure_id") \
        .eq("user_id", user_id) \
        .order("collected_at") \
        .execute()
    return [(row['island_id'], row['treasure_id']) for row in result.data]


def is_treasure_collected(user_id: str, island_id: str, treasure_id: str) -> bool:
    """Prueft ob ein bestimmter Schatz bereits gesammelt wurde."""
    result = get_db().table("user_treasures") \
        .select("user_id") \
        .eq("user_id", user_id) \
        .eq("island_id", island_id) \
        .eq("treasure_id", treasure_id) \
        .execute()
    return len(result.data) > 0


def get_user_treasure_stats(user_id: str) -> dict:
    """Holt Schatz-Statistiken eines Users."""
    result = get_db().table("user_treasures") \
        .select("island_id, xp_earned") \
        .eq("user_id", user_id) \
        .execute()

    treasures = result.data
    return {
        "total_treasures": len(treasures),
        "total_xp_from_treasures": sum(t.get("xp_earned") or 0 for t in treasures),
        "islands_visited": len(set(t["island_id"] for t in treasures))
    }


# ===============================================================
# INSEL-FORTSCHRITT FUNKTIONEN
# ===============================================================

XP_REWARDS = {
    "video_watched": 10,
    "explanation_read": 10,
    "quiz_passed": 50,
    "challenge_completed": 100,
}


def get_island_progress(user_id: str, island_id: str) -> dict:
    """Holt den Fortschritt eines Users für eine Insel."""
    result = get_db().table("island_progress") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("island_id", island_id) \
        .execute()

    if result.data:
        row = result.data[0]
        return {
            "video_watched": bool(row.get("video_watched")),
            "explanation_read": bool(row.get("explanation_read")),
            "quiz_passed": bool(row.get("quiz_passed")),
            "quiz_score": row.get("quiz_score"),
            "challenge_completed": bool(row.get("challenge_completed")),
        }

    return {
        "video_watched": False,
        "explanation_read": False,
        "quiz_passed": False,
        "quiz_score": None,
        "challenge_completed": False,
    }


def get_all_island_progress(user_id: str) -> dict:
    """Holt den Fortschritt eines Users fuer ALLE Inseln in einer Query."""
    result = get_db().table("island_progress") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()

    progress_map = {}
    for row in result.data:
        progress_map[row["island_id"]] = {
            "video_watched": bool(row.get("video_watched")),
            "explanation_read": bool(row.get("explanation_read")),
            "quiz_passed": bool(row.get("quiz_passed")),
            "quiz_score": row.get("quiz_score"),
            "challenge_completed": bool(row.get("challenge_completed")),
        }
    return progress_map


def complete_island_action(user_id: str, island_id: str, action: str, extra_data: dict = None) -> int:
    """Markiert eine Aktion als abgeschlossen und vergibt XP."""
    # Prüfe ob bereits erledigt
    progress = get_island_progress(user_id, island_id)
    if progress.get(action):
        return 0

    db = get_db()
    now = datetime.now().isoformat()

    # Prüfe ob Eintrag existiert
    existing = db.table("island_progress") \
        .select("user_id") \
        .eq("user_id", user_id) \
        .eq("island_id", island_id) \
        .execute()

    update_data = {
        action: True,
        f"{action}_at": now,
        "updated_at": now
    }

    if action == "quiz_passed" and extra_data and "score" in extra_data:
        update_data["quiz_score"] = extra_data["score"]

    if existing.data:
        db.table("island_progress").update(update_data) \
            .eq("user_id", user_id) \
            .eq("island_id", island_id) \
            .execute()
    else:
        update_data["user_id"] = user_id
        update_data["island_id"] = island_id
        db.table("island_progress").insert(update_data).execute()

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
    completed = sum(1 for key in ["video_watched", "explanation_read", "quiz_passed", "challenge_completed"]
                    if progress.get(key))
    return int((completed / 4) * 100)


def get_all_island_progress(user_id: str) -> dict:
    """Holt den Fortschritt für alle Inseln eines Users."""
    result = get_db().table("island_progress") \
        .select("island_id, video_watched, explanation_read, quiz_passed, challenge_completed") \
        .eq("user_id", user_id) \
        .execute()

    return {
        row["island_id"]: {
            "video_watched": bool(row.get("video_watched")),
            "explanation_read": bool(row.get("explanation_read")),
            "quiz_passed": bool(row.get("quiz_passed")),
            "challenge_completed": bool(row.get("challenge_completed")),
        }
        for row in result.data
    }
