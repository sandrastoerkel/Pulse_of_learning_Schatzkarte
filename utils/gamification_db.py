"""
🗄️ Gamification Database Module
================================

Supabase-basierte Datenbankschicht für das Hattie-Challenge Gamification System.

Features:
- User-Management mit XP und Levels
- Challenge-Tracking mit Streak-Berechnung
- Badge-System nach Bandura's 4 Quellen
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json

from utils.database import get_db

# ============================================
# KONFIGURATION
# ============================================

XP_CONFIG = {
    "challenge_completed": 10,      # Basis-XP für jede Challenge
    "prediction_exact": 25,         # Bonus: Exakte Vorhersage
    "exceeded_expectation": 50,     # Bonus: Erwartung übertroffen
    "streak_bonus_3": 1.2,          # 20% Bonus ab 3er Streak
    "streak_bonus_7": 1.5,          # 50% Bonus ab 7er Streak
    "streak_bonus_30": 2.0,         # 100% Bonus ab 30er Streak
}

LEVELS = {
    1: {"name": "Anfänger", "icon": "🌱", "min_xp": 0},
    2: {"name": "Entdecker", "icon": "🔍", "min_xp": 100},
    3: {"name": "Lernender", "icon": "📚", "min_xp": 250},
    4: {"name": "Aufsteiger", "icon": "📈", "min_xp": 500},
    5: {"name": "Übertreffer", "icon": "🚀", "min_xp": 1000},
    6: {"name": "Meister", "icon": "🏆", "min_xp": 2000},
    7: {"name": "Experte", "icon": "⭐", "min_xp": 5000},
    8: {"name": "Champion", "icon": "👑", "min_xp": 10000},
}

# ============================================
# DATABASE INITIALIZATION
# ============================================

def init_database() -> None:
    """Keine Initialisierung nötig — Tabellen existieren in Supabase."""
    pass

# ============================================
# USER MANAGEMENT
# ============================================

def get_or_create_user(user_id: str, username: str = "Lernender") -> Dict[str, Any]:
    """Holt oder erstellt einen User."""
    db = get_db()
    result = db.table("users").select("*").eq("user_id", user_id).execute()

    if not result.data:
        insert_result = db.table("users").insert({
            "user_id": user_id,
            "username": username,
            "xp_total": 0,
            "level": 1,
            "current_streak": 0,
            "longest_streak": 0
        }).execute()
        return insert_result.data[0]

    return result.data[0]

def update_user_stats(user_id: str, xp_delta: int, streak: int) -> Dict[str, Any]:
    """Aktualisiert XP und Streak eines Users."""
    db = get_db()
    result = db.table("users").select("xp_total, longest_streak").eq("user_id", user_id).execute()
    current = result.data[0]

    new_xp = (current.get('xp_total') or 0) + xp_delta
    new_level = calculate_level(new_xp)
    longest = max(current.get('longest_streak') or 0, streak)
    today = datetime.now().date().isoformat()

    update_result = db.table("users").update({
        "xp_total": new_xp,
        "level": new_level,
        "current_streak": streak,
        "longest_streak": longest,
        "last_activity_date": today
    }).eq("user_id", user_id).execute()

    return update_result.data[0]

def calculate_level(xp: int) -> int:
    """Berechnet das Level basierend auf XP."""
    for level in sorted(LEVELS.keys(), reverse=True):
        if xp >= LEVELS[level]["min_xp"]:
            return level
    return 1

def get_level_info(level: int) -> Dict[str, Any]:
    """Gibt Level-Informationen zurück."""
    return LEVELS.get(level, LEVELS[1])

# ============================================
# CHALLENGE MANAGEMENT
# ============================================

def create_challenge(user_id: str, subject: str, prediction: int,
                     task_description: str = "") -> int:
    """Erstellt eine neue Challenge (Phase 1: Vorhersage)."""
    db = get_db()
    today = datetime.now().date().isoformat()

    result = db.table("challenges").insert({
        "user_id": user_id,
        "challenge_date": today,
        "subject": subject,
        "task_description": task_description,
        "prediction": prediction,
        "completed": False
    }).execute()

    return result.data[0]["id"]

def complete_challenge(challenge_id: int, actual_result: int,
                       reflection: str = "") -> Dict[str, Any]:
    """Schließt eine Challenge ab und berechnet XP (Phase 2: Ergebnis)."""
    db = get_db()

    # Challenge holen
    result = db.table("challenges").select("*").eq("id", challenge_id).execute()
    if not result.data:
        return {"error": "Challenge nicht gefunden"}

    challenge = result.data[0]

    if challenge['completed']:
        return {"error": "Challenge bereits abgeschlossen"}

    user_id = challenge['user_id']
    prediction = challenge['prediction']

    # Typ aus task_description extrahieren (für Note-Umkehrung)
    task_desc = challenge.get('task_description') or ''
    is_note_type = task_desc.startswith("[note]")

    # Outcome bestimmen
    if is_note_type:
        if actual_result < prediction:
            outcome = "exceeded"
            base_xp = XP_CONFIG["challenge_completed"] + XP_CONFIG["exceeded_expectation"]
        elif actual_result == prediction:
            outcome = "exact"
            base_xp = XP_CONFIG["challenge_completed"] + XP_CONFIG["prediction_exact"]
        else:
            outcome = "below"
            base_xp = XP_CONFIG["challenge_completed"]
    else:
        if actual_result > prediction:
            outcome = "exceeded"
            base_xp = XP_CONFIG["challenge_completed"] + XP_CONFIG["exceeded_expectation"]
        elif actual_result == prediction:
            outcome = "exact"
            base_xp = XP_CONFIG["challenge_completed"] + XP_CONFIG["prediction_exact"]
        else:
            outcome = "below"
            base_xp = XP_CONFIG["challenge_completed"]

    # Streak berechnen
    new_streak = calculate_streak(user_id)

    # Streak-Bonus anwenden
    if new_streak >= 30:
        xp_earned = int(base_xp * XP_CONFIG["streak_bonus_30"])
    elif new_streak >= 7:
        xp_earned = int(base_xp * XP_CONFIG["streak_bonus_7"])
    elif new_streak >= 3:
        xp_earned = int(base_xp * XP_CONFIG["streak_bonus_3"])
    else:
        xp_earned = base_xp

    # Challenge updaten
    db.table("challenges").update({
        "actual_result": actual_result,
        "outcome": outcome,
        "xp_earned": xp_earned,
        "reflection": reflection,
        "completed": True
    }).eq("id", challenge_id).execute()

    # Activity Log
    today = datetime.now().date().isoformat()
    db.table("activity_log").insert({
        "user_id": user_id,
        "activity_date": today,
        "activity_type": "challenge_completed",
        "xp_earned": xp_earned,
        "details": json.dumps({
            "subject": challenge['subject'],
            "outcome": outcome,
            "prediction": prediction,
            "actual": actual_result
        })
    }).execute()

    # User-Stats updaten
    user = update_user_stats(user_id, xp_earned, new_streak)

    # Alte XP für Level-Up Check
    old_level = calculate_level(user['xp_total'] - xp_earned)

    return {
        "challenge_id": challenge_id,
        "outcome": outcome,
        "prediction": prediction,
        "actual_result": actual_result,
        "xp_earned": xp_earned,
        "streak": new_streak,
        "total_xp": user['xp_total'],
        "level": user['level'],
        "level_up": user['level'] > old_level,
        "streak_bonus": new_streak >= 3
    }

def calculate_streak(user_id: str) -> int:
    """Berechnet den aktuellen Streak eines Users."""
    db = get_db()
    today = datetime.now().date()
    yesterday = (today - timedelta(days=1)).isoformat()
    today_str = today.isoformat()

    # Hole aktuellen Streak
    result = db.table("users").select("current_streak, last_activity_date").eq("user_id", user_id).execute()

    if not result.data:
        return 1

    user_data = result.data[0]
    current_streak = user_data.get('current_streak') or 0
    last_activity = user_data.get('last_activity_date')

    if not last_activity:
        return 1

    # Streak-Logik
    if last_activity == today_str:
        return current_streak
    elif last_activity == yesterday:
        return current_streak + 1
    else:
        return 1

def get_user_challenges(user_id: str, limit: int = 20) -> List[Dict]:
    """Holt die letzten Challenges eines Users."""
    result = get_db().table("challenges") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()
    return result.data

def get_open_challenges(user_id: str) -> List[Dict]:
    """Holt offene (nicht abgeschlossene) Challenges."""
    result = get_db().table("challenges") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("completed", False) \
        .order("created_at", desc=True) \
        .execute()
    return result.data

# ============================================
# STATISTICS
# ============================================

def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Holt umfassende Statistiken eines Users."""
    db = get_db()

    # Basis-User-Daten
    stats = get_or_create_user(user_id)

    # Alle abgeschlossenen Challenges holen
    completed = db.table("challenges") \
        .select("subject, outcome, xp_earned") \
        .eq("user_id", user_id) \
        .eq("completed", True) \
        .execute()

    challenges = completed.data

    stats["total_challenges"] = len(challenges)
    stats["times_exceeded"] = sum(1 for c in challenges if c.get("outcome") == "exceeded")
    stats["exact_predictions"] = sum(1 for c in challenges if c.get("outcome") == "exact")
    stats["times_below"] = sum(1 for c in challenges if c.get("outcome") == "below")
    stats["unique_subjects"] = len(set(c.get("subject", "") for c in challenges))
    stats["total_xp_from_challenges"] = sum(c.get("xp_earned") or 0 for c in challenges)

    # Erfolgsquote berechnen
    if stats["total_challenges"] > 0:
        success = stats["times_exceeded"] + stats["exact_predictions"]
        stats["success_rate"] = round((success / stats["total_challenges"]) * 100, 1)
    else:
        stats["success_rate"] = 0

    # Fächer-Breakdown
    subjects = {}
    for c in challenges:
        subj = c.get("subject", "")
        if subj not in subjects:
            subjects[subj] = {"subject": subj, "count": 0, "exceeded": 0, "exact": 0}
        subjects[subj]["count"] += 1
        if c.get("outcome") == "exceeded":
            subjects[subj]["exceeded"] += 1
        elif c.get("outcome") == "exact":
            subjects[subj]["exact"] += 1

    stats["subjects_breakdown"] = list(subjects.values())

    return stats

def get_activity_heatmap(user_id: str, days: int = 90) -> List[Dict]:
    """Holt Activity-Daten für Heatmap (GitHub-Style)."""
    db = get_db()
    start_date = (datetime.now() - timedelta(days=days)).date().isoformat()

    result = db.table("challenges") \
        .select("challenge_date, xp_earned") \
        .eq("user_id", user_id) \
        .gte("challenge_date", start_date) \
        .eq("completed", True) \
        .order("challenge_date") \
        .execute()

    # Gruppierung nach Datum in Python
    dates = {}
    for row in result.data:
        d = row["challenge_date"]
        if d not in dates:
            dates[d] = {"challenge_date": d, "count": 0, "xp": 0}
        dates[d]["count"] += 1
        dates[d]["xp"] += row.get("xp_earned") or 0

    return list(dates.values())

# ============================================
# BADGE SYSTEM
# ============================================

def get_user_badges(user_id: str) -> List[Dict]:
    """Holt alle verdienten Badges eines Users."""
    result = get_db().table("user_badges") \
        .select("badge_id, earned_at") \
        .eq("user_id", user_id) \
        .order("earned_at", desc=True) \
        .execute()
    return result.data

def award_badge(user_id: str, badge_id: str) -> bool:
    """Vergibt ein Badge an einen User."""
    db = get_db()
    # Prüfe ob Badge bereits vergeben
    existing = db.table("user_badges") \
        .select("user_id") \
        .eq("user_id", user_id) \
        .eq("badge_id", badge_id) \
        .execute()
    if existing.data:
        return False

    try:
        db.table("user_badges").insert({
            "user_id": user_id,
            "badge_id": badge_id
        }).execute()
        return True
    except Exception:
        return False

def check_and_award_badges(user_id: str, badges_config: Dict) -> List[str]:
    """Prüft und vergibt neue Badges basierend auf Stats."""
    stats = get_user_stats(user_id)
    existing = [b['badge_id'] for b in get_user_badges(user_id)]
    new_badges = []

    for badge_id, badge_info in badges_config.items():
        if badge_id not in existing:
            condition_fn = badge_info.get("condition")
            if condition_fn and condition_fn(stats):
                if award_badge(user_id, badge_id):
                    new_badges.append(badge_id)

    return new_badges
