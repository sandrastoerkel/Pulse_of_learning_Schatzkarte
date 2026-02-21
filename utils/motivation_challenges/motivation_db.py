"""
Motivation Challenge Database Layer (Supabase)

Supabase-basierte Datenbankfunktionen für das Motivation-Challenge-System.
Basiert auf der Selbstbestimmungstheorie (SDT) von Deci & Ryan.

Tabellen:
- motivation_challenges: Challenge-Fortschritt pro User
- motivation_sdt_progress: SDT-Level (Autonomie, Kompetenz, Verbundenheit)
- motivation_streaks: Streak-Tracking mit Freeze-Option
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
import json

from utils.database import get_db


# ============================================
# TABELLEN INITIALISIERUNG
# ============================================

def init_motivation_tables(conn=None) -> None:
    """Keine Initialisierung nötig — Tabellen existieren in Supabase."""
    pass


# ============================================
# CHALLENGE CRUD OPERATIONEN
# ============================================

def save_challenge_progress(
    conn,  # wird ignoriert, für Rückwärtskompatibilität
    user_id: str,
    challenge_id: str,
    age_group: str,
    grundbeduerfnis: str,
    phase: str = "intro",
    user_input: str = None,
    reflection: str = None,
    rating: int = None,
    xp_earned: int = 0,
    completed: bool = False
) -> int:
    """Speichert oder aktualisiert den Challenge-Fortschritt."""
    db = get_db()

    # Prüfen ob schon ein Eintrag existiert
    existing = db.table("motivation_challenges") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("challenge_id", challenge_id) \
        .eq("age_group", age_group) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    completed_at = datetime.now().isoformat() if completed else None

    if existing.data and not completed:
        # Update existierenden Eintrag
        entry_id = existing.data[0]["id"]
        db.table("motivation_challenges").update({
            "phase": phase,
            "user_input": user_input,
            "reflection": reflection,
            "rating": rating,
            "xp_earned": xp_earned,
            "completed": completed,
            "completed_at": completed_at
        }).eq("id", entry_id).execute()
        return entry_id
    else:
        # Neuer Eintrag
        result = db.table("motivation_challenges").insert({
            "user_id": user_id,
            "challenge_id": challenge_id,
            "age_group": age_group,
            "grundbeduerfnis": grundbeduerfnis,
            "phase": phase,
            "user_input": user_input,
            "reflection": reflection,
            "rating": rating,
            "xp_earned": xp_earned,
            "completed": completed,
            "completed_at": completed_at
        }).execute()
        return result.data[0]["id"]


def get_challenge_progress(
    conn,
    user_id: str,
    challenge_id: str,
    age_group: str
) -> Optional[Dict[str, Any]]:
    """Holt den aktuellen Fortschritt einer Challenge."""
    result = get_db().table("motivation_challenges") \
        .select("id, phase, user_input, reflection, rating, xp_earned, completed, completed_at") \
        .eq("user_id", user_id) \
        .eq("challenge_id", challenge_id) \
        .eq("age_group", age_group) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    if result.data:
        row = result.data[0]
        return {
            "id": row["id"],
            "phase": row["phase"],
            "user_input": row["user_input"],
            "reflection": row["reflection"],
            "rating": row["rating"],
            "xp_earned": row["xp_earned"],
            "completed": bool(row["completed"]),
            "completed_at": row["completed_at"]
        }
    return None


def get_completed_challenges(
    conn,
    user_id: str,
    age_group: str = None,
    grundbeduerfnis: str = None
) -> List[Dict[str, Any]]:
    """Holt alle abgeschlossenen Challenges eines Users."""
    query = get_db().table("motivation_challenges") \
        .select("challenge_id, age_group, grundbeduerfnis, xp_earned, completed_at, rating") \
        .eq("user_id", user_id) \
        .eq("completed", True)

    if age_group:
        query = query.eq("age_group", age_group)
    if grundbeduerfnis:
        query = query.eq("grundbeduerfnis", grundbeduerfnis)

    result = query.order("completed_at", desc=True).execute()

    # DISTINCT auf challenge_id in Python
    seen = set()
    unique_results = []
    for row in result.data:
        if row["challenge_id"] not in seen:
            seen.add(row["challenge_id"])
            unique_results.append({
                "challenge_id": row["challenge_id"],
                "age_group": row["age_group"],
                "grundbeduerfnis": row["grundbeduerfnis"],
                "xp_earned": row["xp_earned"],
                "completed_at": row["completed_at"],
                "rating": row["rating"]
            })

    return unique_results


def count_completed_challenges(
    conn,
    user_id: str,
    age_group: str = None,
    grundbeduerfnis: str = None
) -> int:
    """Zählt abgeschlossene Challenges."""
    challenges = get_completed_challenges(conn, user_id, age_group, grundbeduerfnis)
    return len(challenges)


# ============================================
# SDT PROGRESS (Skill-Tree)
# ============================================

def get_or_create_sdt_progress(
    conn,
    user_id: str
) -> Dict[str, Any]:
    """Holt oder erstellt den SDT-Progress eines Users."""
    db = get_db()

    result = db.table("motivation_sdt_progress") \
        .select("autonomie_level, autonomie_xp, kompetenz_level, kompetenz_xp, "
                "verbundenheit_level, verbundenheit_xp, total_challenges, total_xp") \
        .eq("user_id", user_id) \
        .execute()

    if result.data:
        return result.data[0]
    else:
        db.table("motivation_sdt_progress").insert({
            "user_id": user_id
        }).execute()
        return {
            "autonomie_level": 0, "autonomie_xp": 0,
            "kompetenz_level": 0, "kompetenz_xp": 0,
            "verbundenheit_level": 0, "verbundenheit_xp": 0,
            "total_challenges": 0, "total_xp": 0
        }


def update_sdt_progress(
    conn,
    user_id: str,
    grundbeduerfnis: str,
    xp_earned: int
) -> Dict[str, Any]:
    """Aktualisiert den SDT-Progress nach Abschluss einer Challenge."""
    LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000]

    progress = get_or_create_sdt_progress(conn, user_id)

    xp_col = f"{grundbeduerfnis}_xp"
    level_col = f"{grundbeduerfnis}_level"

    old_xp = progress.get(xp_col, 0)
    old_level = progress.get(level_col, 0)
    new_xp = old_xp + xp_earned

    new_level = 0
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if new_xp >= threshold:
            new_level = i
    new_level = min(new_level, 5)

    level_up = new_level > old_level

    # Update in DB
    get_db().table("motivation_sdt_progress").update({
        xp_col: new_xp,
        level_col: new_level,
        "total_xp": (progress.get("total_xp") or 0) + xp_earned,
        "total_challenges": (progress.get("total_challenges") or 0) + 1,
        "updated_at": datetime.now().isoformat()
    }).eq("user_id", user_id).execute()

    return {
        "grundbeduerfnis": grundbeduerfnis,
        "old_level": old_level,
        "new_level": new_level,
        "old_xp": old_xp,
        "new_xp": new_xp,
        "xp_earned": xp_earned,
        "level_up": level_up,
        "next_level_xp": LEVEL_THRESHOLDS[new_level + 1] if new_level < 5 else None
    }


def get_sdt_summary(conn, user_id: str) -> Dict[str, Any]:
    """Holt eine Zusammenfassung des SDT-Progress für UI-Anzeige."""
    progress = get_or_create_sdt_progress(conn, user_id)

    LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000]

    def calc_progress_pct(xp: int, level: int) -> float:
        if level >= 5:
            return 100.0
        current_threshold = LEVEL_THRESHOLDS[level]
        next_threshold = LEVEL_THRESHOLDS[level + 1]
        return ((xp - current_threshold) / (next_threshold - current_threshold)) * 100

    return {
        "autonomie": {
            "level": progress["autonomie_level"],
            "xp": progress["autonomie_xp"],
            "progress_pct": calc_progress_pct(progress["autonomie_xp"], progress["autonomie_level"]),
            "icon": "🎯",
            "name": "Autonomie"
        },
        "kompetenz": {
            "level": progress["kompetenz_level"],
            "xp": progress["kompetenz_xp"],
            "progress_pct": calc_progress_pct(progress["kompetenz_xp"], progress["kompetenz_level"]),
            "icon": "💪",
            "name": "Kompetenz"
        },
        "verbundenheit": {
            "level": progress["verbundenheit_level"],
            "xp": progress["verbundenheit_xp"],
            "progress_pct": calc_progress_pct(progress["verbundenheit_xp"], progress["verbundenheit_level"]),
            "icon": "👥",
            "name": "Verbundenheit"
        },
        "total_challenges": progress["total_challenges"],
        "total_xp": progress["total_xp"]
    }


# ============================================
# STREAK SYSTEM (Duolingo Style)
# ============================================

def get_or_create_streak(conn, user_id: str) -> Dict[str, Any]:
    """Holt oder erstellt Streak-Daten."""
    db = get_db()

    result = db.table("motivation_streaks") \
        .select("current_streak, longest_streak, last_activity_date, freeze_available, freeze_used_date") \
        .eq("user_id", user_id) \
        .execute()

    if result.data:
        return result.data[0]
    else:
        db.table("motivation_streaks").insert({
            "user_id": user_id
        }).execute()
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_activity_date": None,
            "freeze_available": 1,
            "freeze_used_date": None
        }


def update_streak(conn, user_id: str) -> Dict[str, Any]:
    """Aktualisiert den Streak nach einer Aktivität."""
    streak_data = get_or_create_streak(conn, user_id)
    today = date.today()

    last_activity = streak_data["last_activity_date"]
    if last_activity:
        if isinstance(last_activity, str):
            last_activity = date.fromisoformat(last_activity)

    current_streak = streak_data["current_streak"] or 0
    longest_streak = streak_data["longest_streak"] or 0
    freeze_available = streak_data["freeze_available"] or 0

    result = {
        "streak_continued": False,
        "streak_broken": False,
        "streak_saved_by_freeze": False,
        "freeze_used": False,
        "new_longest": False
    }

    if last_activity == today:
        result["streak_continued"] = True
        return {**result, "current_streak": current_streak, "longest_streak": longest_streak}

    yesterday = today - timedelta(days=1)
    day_before = today - timedelta(days=2)

    if last_activity == yesterday:
        current_streak += 1
        result["streak_continued"] = True
    elif last_activity == day_before and freeze_available > 0:
        freeze_available -= 1
        result["streak_saved_by_freeze"] = True
        result["freeze_used"] = True
        current_streak += 1
    elif last_activity is None:
        current_streak = 1
    else:
        result["streak_broken"] = True
        current_streak = 1

    if current_streak > longest_streak:
        longest_streak = current_streak
        result["new_longest"] = True

    get_db().table("motivation_streaks").update({
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_activity_date": today.isoformat(),
        "freeze_available": freeze_available,
        "updated_at": datetime.now().isoformat()
    }).eq("user_id", user_id).execute()

    return {
        **result,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "freeze_available": freeze_available
    }


def add_streak_freeze(conn, user_id: str, count: int = 1) -> int:
    """Fügt Streak-Freezes hinzu. Returns: Neue Anzahl verfügbarer Freezes"""
    db = get_db()

    # Aktuellen Wert holen
    current = db.table("motivation_streaks") \
        .select("freeze_available") \
        .eq("user_id", user_id) \
        .execute()

    if not current.data:
        return 0

    new_value = (current.data[0]["freeze_available"] or 0) + count

    db.table("motivation_streaks") \
        .update({"freeze_available": new_value}) \
        .eq("user_id", user_id) \
        .execute()

    return new_value


# ============================================
# ACTIVITY LOG (für Heatmap)
# ============================================

def log_activity(
    conn,
    user_id: str,
    challenge_id: str,
    grundbeduerfnis: str,
    xp_earned: int
) -> None:
    """Loggt eine Aktivität für die Heatmap."""
    get_db().table("motivation_activity_log").insert({
        "user_id": user_id,
        "activity_date": date.today().isoformat(),
        "challenge_id": challenge_id,
        "grundbeduerfnis": grundbeduerfnis,
        "xp_earned": xp_earned
    }).execute()


def get_activity_heatmap_data(
    conn,
    user_id: str,
    weeks: int = 12
) -> List[Dict[str, Any]]:
    """Holt Aktivitätsdaten für die GitHub-Style Heatmap."""
    start_date = (date.today() - timedelta(weeks=weeks * 7)).isoformat()

    result = get_db().table("motivation_activity_log") \
        .select("activity_date, grundbeduerfnis, xp_earned") \
        .eq("user_id", user_id) \
        .gte("activity_date", start_date) \
        .order("activity_date") \
        .execute()

    # Gruppierung in Python (ersetzt GROUP BY)
    groups = {}
    for row in result.data:
        key = (row["activity_date"], row["grundbeduerfnis"])
        if key not in groups:
            groups[key] = {"date": row["activity_date"], "grundbeduerfnis": row["grundbeduerfnis"], "count": 0, "xp": 0}
        groups[key]["count"] += 1
        groups[key]["xp"] += row.get("xp_earned") or 0

    return list(groups.values())


def get_daily_activity_summary(
    conn,
    user_id: str,
    target_date: date = None
) -> Dict[str, Any]:
    """Holt Aktivitäts-Zusammenfassung für einen Tag."""
    if target_date is None:
        target_date = date.today()

    result = get_db().table("motivation_activity_log") \
        .select("grundbeduerfnis, xp_earned") \
        .eq("user_id", user_id) \
        .eq("activity_date", target_date.isoformat()) \
        .execute()

    summary = {
        "date": target_date.isoformat(),
        "autonomie": {"count": 0, "xp": 0},
        "kompetenz": {"count": 0, "xp": 0},
        "verbundenheit": {"count": 0, "xp": 0},
        "total_count": 0,
        "total_xp": 0
    }

    for row in result.data:
        gb = row["grundbeduerfnis"]
        if gb in summary:
            summary[gb]["count"] += 1
            summary[gb]["xp"] += row.get("xp_earned") or 0
            summary["total_count"] += 1
            summary["total_xp"] += row.get("xp_earned") or 0

    return summary


# ============================================
# BADGES
# ============================================

def award_badge(conn, user_id: str, badge_id: str) -> bool:
    """Vergibt ein Badge an einen User."""
    db = get_db()

    # Prüfe ob Badge bereits vergeben
    existing = db.table("motivation_badges") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("badge_id", badge_id) \
        .execute()

    if existing.data:
        return False

    try:
        db.table("motivation_badges").insert({
            "user_id": user_id,
            "badge_id": badge_id
        }).execute()
        return True
    except Exception:
        return False


def get_user_badges(conn, user_id: str) -> List[Dict[str, Any]]:
    """Holt alle Badges eines Users."""
    result = get_db().table("motivation_badges") \
        .select("badge_id, earned_at") \
        .eq("user_id", user_id) \
        .order("earned_at") \
        .execute()
    return result.data


def has_badge(conn, user_id: str, badge_id: str) -> bool:
    """Prüft ob User ein bestimmtes Badge hat."""
    result = get_db().table("motivation_badges") \
        .select("id") \
        .eq("user_id", user_id) \
        .eq("badge_id", badge_id) \
        .execute()
    return len(result.data) > 0


# ============================================
# ZERTIFIKATE
# ============================================

def issue_certificate(
    conn,
    user_id: str,
    certificate_type: str,
    age_group: str,
    challenges_completed: List[str],
    total_xp: int
) -> int:
    """Stellt ein Zertifikat aus. Returns: Certificate ID"""
    result = get_db().table("motivation_certificates").insert({
        "user_id": user_id,
        "certificate_type": certificate_type,
        "age_group": age_group,
        "challenges_completed": json.dumps(challenges_completed),
        "total_xp": total_xp
    }).execute()
    return result.data[0]["id"]


def get_user_certificates(conn, user_id: str) -> List[Dict[str, Any]]:
    """Holt alle Zertifikate eines Users."""
    result = get_db().table("motivation_certificates") \
        .select("id, certificate_type, age_group, challenges_completed, total_xp, issued_at") \
        .eq("user_id", user_id) \
        .order("issued_at", desc=True) \
        .execute()

    return [{
        "id": row["id"],
        "type": row["certificate_type"],
        "age_group": row["age_group"],
        "challenges": json.loads(row["challenges_completed"]) if row["challenges_completed"] else [],
        "total_xp": row["total_xp"],
        "issued_at": row["issued_at"]
    } for row in result.data]


# ============================================
# STATISTIKEN
# ============================================

def get_user_motivation_stats(conn, user_id: str) -> Dict[str, Any]:
    """Holt umfassende Statistiken für einen User."""
    sdt = get_sdt_summary(conn, user_id)
    streak = get_or_create_streak(conn, user_id)
    badges = get_user_badges(conn, user_id)
    certificates = get_user_certificates(conn, user_id)
    today_activity = get_daily_activity_summary(conn, user_id)

    return {
        "sdt_progress": sdt,
        "streak": {
            "current": streak["current_streak"],
            "longest": streak["longest_streak"],
            "freeze_available": streak["freeze_available"]
        },
        "badges_count": len(badges),
        "badges": badges,
        "certificates_count": len(certificates),
        "certificates": certificates,
        "today": today_activity,
        "total_xp": sdt["total_xp"],
        "total_challenges": sdt["total_challenges"]
    }


# ============================================
# UTILITY FUNCTIONS
# ============================================

def reset_user_motivation_data(conn, user_id: str) -> None:
    """Setzt alle Motivation-Daten eines Users zurück."""
    db = get_db()

    tables = [
        "motivation_challenges",
        "motivation_sdt_progress",
        "motivation_streaks",
        "motivation_activity_log",
        "motivation_badges",
        "motivation_certificates"
    ]

    for table in tables:
        db.table(table).delete().eq("user_id", user_id).execute()
