"""
🗄️ Gamification Database Module
================================

SQLite-basierte Datenbankschicht für das Hattie-Challenge Gamification System.
Inspiriert von GitHub Habit-Tracker Apps (MIT-lizenziert).

Features:
- User-Management mit XP und Levels
- Challenge-Tracking mit Streak-Berechnung
- Badge-System nach Bandura's 4 Quellen
"""

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import json

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
# DATABASE PATH
# ============================================

def get_db_path() -> Path:
    """Gibt den Pfad zur SQLite-Datenbank zurück."""
    # Für Streamlit Cloud: tmp-Verzeichnis, sonst lokaler Ordner
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent.parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "hattie_gamification.db"

# ============================================
# DATABASE INITIALIZATION
# ============================================

def init_database() -> None:
    """Initialisiert die SQLite-Datenbank mit allen Tabellen."""
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()
    
    # Users-Tabelle
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT DEFAULT 'Lernender',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            xp_total INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_activity_date DATE,
            settings TEXT DEFAULT '{}'
        )
    ''')
    
    # Challenges-Tabelle
    c.execute('''
        CREATE TABLE IF NOT EXISTS challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            challenge_date DATE NOT NULL,
            subject TEXT NOT NULL,
            task_description TEXT,
            prediction INTEGER NOT NULL,
            actual_result INTEGER,
            outcome TEXT,
            xp_earned INTEGER DEFAULT 0,
            reflection TEXT,
            completed BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # User-Badges-Tabelle
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_badges (
            user_id TEXT NOT NULL,
            badge_id TEXT NOT NULL,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, badge_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Activity-Log für Contribution-Graph
    c.execute('''
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            activity_date DATE NOT NULL,
            activity_type TEXT NOT NULL,
            xp_earned INTEGER DEFAULT 0,
            details TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Indizes für Performance
    c.execute('CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenges(user_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenges(challenge_date)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_log(user_id, activity_date)')
    
    conn.commit()
    conn.close()

# ============================================
# USER MANAGEMENT
# ============================================

def get_or_create_user(user_id: str, username: str = "Lernender") -> Dict[str, Any]:
    """Holt oder erstellt einen User."""
    init_database()
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = c.fetchone()
    
    if not user:
        c.execute('''
            INSERT INTO users (user_id, username, xp_total, level, current_streak, longest_streak)
            VALUES (?, ?, 0, 1, 0, 0)
        ''', (user_id, username))
        conn.commit()
        c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        user = c.fetchone()
    
    result = dict(user)
    conn.close()
    return result

def update_user_stats(user_id: str, xp_delta: int, streak: int) -> Dict[str, Any]:
    """Aktualisiert XP und Streak eines Users."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT xp_total, longest_streak FROM users WHERE user_id = ?", (user_id,))
    current = c.fetchone()
    
    new_xp = (current['xp_total'] or 0) + xp_delta
    new_level = calculate_level(new_xp)
    longest = max(current['longest_streak'] or 0, streak)
    today = datetime.now().date().isoformat()
    
    c.execute('''
        UPDATE users 
        SET xp_total = ?, level = ?, current_streak = ?, longest_streak = ?, last_activity_date = ?
        WHERE user_id = ?
    ''', (new_xp, new_level, streak, longest, today, user_id))
    
    conn.commit()
    
    c.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    result = dict(c.fetchone())
    conn.close()
    
    return result

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
    init_database()
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()
    
    today = datetime.now().date().isoformat()
    
    c.execute('''
        INSERT INTO challenges (user_id, challenge_date, subject, task_description, prediction, completed)
        VALUES (?, ?, ?, ?, ?, FALSE)
    ''', (user_id, today, subject, task_description, prediction))
    
    challenge_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return challenge_id

def complete_challenge(challenge_id: int, actual_result: int,
                       reflection: str = "") -> Dict[str, Any]:
    """Schließt eine Challenge ab und berechnet XP (Phase 2: Ergebnis)."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Challenge holen
    c.execute("SELECT * FROM challenges WHERE id = ?", (challenge_id,))
    challenge = c.fetchone()

    if not challenge:
        conn.close()
        return {"error": "Challenge nicht gefunden"}

    if challenge['completed']:
        conn.close()
        return {"error": "Challenge bereits abgeschlossen"}

    user_id = challenge['user_id']
    prediction = challenge['prediction']

    # Typ aus task_description extrahieren (für Note-Umkehrung)
    task_desc = challenge['task_description'] or ''
    is_note_type = task_desc.startswith("[note]")

    # Outcome bestimmen
    # Bei Noten: niedrigere Zahl = besser (Note 1 > Note 2)
    # Bei Prozent/Punkten: höhere Zahl = besser
    if is_note_type:
        # Bei Noten: actual < prediction bedeutet "übertroffen"
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
        # Bei Prozent/Punkten: actual > prediction bedeutet "übertroffen"
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
    new_streak = calculate_streak(user_id, c)
    
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
    c.execute('''
        UPDATE challenges 
        SET actual_result = ?, outcome = ?, xp_earned = ?, reflection = ?, completed = TRUE
        WHERE id = ?
    ''', (actual_result, outcome, xp_earned, reflection, challenge_id))
    
    # Activity Log
    today = datetime.now().date().isoformat()
    c.execute('''
        INSERT INTO activity_log (user_id, activity_date, activity_type, xp_earned, details)
        VALUES (?, ?, 'challenge_completed', ?, ?)
    ''', (user_id, today, xp_earned, json.dumps({
        "subject": challenge['subject'],
        "outcome": outcome,
        "prediction": prediction,
        "actual": actual_result
    })))
    
    conn.commit()
    
    # User-Stats updaten
    user = update_user_stats(user_id, xp_earned, new_streak)
    
    # Alte XP für Level-Up Check
    old_level = calculate_level(user['xp_total'] - xp_earned)
    
    conn.close()
    
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

def calculate_streak(user_id: str, cursor) -> int:
    """Berechnet den aktuellen Streak eines Users."""
    today = datetime.now().date()
    yesterday = (today - timedelta(days=1)).isoformat()
    today_str = today.isoformat()
    
    # Prüfe ob heute schon eine Challenge war
    cursor.execute('''
        SELECT COUNT(*) FROM challenges 
        WHERE user_id = ? AND challenge_date = ? AND completed = TRUE
    ''', (user_id, today_str))
    today_count = cursor.fetchone()[0]
    
    # Hole aktuellen Streak
    cursor.execute("SELECT current_streak, last_activity_date FROM users WHERE user_id = ?", (user_id,))
    user_data = cursor.fetchone()
    
    if not user_data:
        return 1
    
    current_streak = user_data['current_streak'] or 0
    last_activity = user_data['last_activity_date']
    
    if not last_activity:
        return 1
    
    # Streak-Logik
    if last_activity == today_str:
        # Heute schon aktiv - Streak bleibt
        return current_streak
    elif last_activity == yesterday:
        # Gestern aktiv - Streak erhöht sich
        return current_streak + 1
    else:
        # Streak unterbrochen
        return 1

def get_user_challenges(user_id: str, limit: int = 20) -> List[Dict]:
    """Holt die letzten Challenges eines Users."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''
        SELECT * FROM challenges 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ''', (user_id, limit))
    
    challenges = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return challenges

def get_open_challenges(user_id: str) -> List[Dict]:
    """Holt offene (nicht abgeschlossene) Challenges."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''
        SELECT * FROM challenges 
        WHERE user_id = ? AND completed = FALSE
        ORDER BY created_at DESC
    ''', (user_id,))
    
    challenges = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return challenges

# ============================================
# STATISTICS
# ============================================

def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Holt umfassende Statistiken eines Users."""
    init_database()
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Basis-User-Daten
    user = get_or_create_user(user_id)
    stats = dict(user)
    
    # Challenge-Statistiken
    c.execute("SELECT COUNT(*) FROM challenges WHERE user_id = ? AND completed = TRUE", (user_id,))
    stats["total_challenges"] = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM challenges WHERE user_id = ? AND outcome = 'exceeded'", (user_id,))
    stats["times_exceeded"] = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM challenges WHERE user_id = ? AND outcome = 'exact'", (user_id,))
    stats["exact_predictions"] = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM challenges WHERE user_id = ? AND outcome = 'below'", (user_id,))
    stats["times_below"] = c.fetchone()[0]
    
    c.execute("SELECT COUNT(DISTINCT subject) FROM challenges WHERE user_id = ?", (user_id,))
    stats["unique_subjects"] = c.fetchone()[0]
    
    c.execute("SELECT SUM(xp_earned) FROM challenges WHERE user_id = ?", (user_id,))
    stats["total_xp_from_challenges"] = c.fetchone()[0] or 0
    
    # Erfolgsquote berechnen
    if stats["total_challenges"] > 0:
        success = stats["times_exceeded"] + stats["exact_predictions"]
        stats["success_rate"] = round((success / stats["total_challenges"]) * 100, 1)
    else:
        stats["success_rate"] = 0
    
    # Fächer-Breakdown
    c.execute('''
        SELECT subject, COUNT(*) as count, 
               SUM(CASE WHEN outcome = 'exceeded' THEN 1 ELSE 0 END) as exceeded,
               SUM(CASE WHEN outcome = 'exact' THEN 1 ELSE 0 END) as exact
        FROM challenges 
        WHERE user_id = ? AND completed = TRUE
        GROUP BY subject
    ''', (user_id,))
    stats["subjects_breakdown"] = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return stats

def get_activity_heatmap(user_id: str, days: int = 90) -> List[Dict]:
    """Holt Activity-Daten für Heatmap (GitHub-Style)."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    start_date = (datetime.now() - timedelta(days=days)).date().isoformat()
    
    c.execute('''
        SELECT challenge_date, COUNT(*) as count, SUM(xp_earned) as xp
        FROM challenges 
        WHERE user_id = ? AND challenge_date >= ? AND completed = TRUE
        GROUP BY challenge_date
        ORDER BY challenge_date
    ''', (user_id, start_date))
    
    activity = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return activity

# ============================================
# BADGE SYSTEM
# ============================================

def get_user_badges(user_id: str) -> List[Dict]:
    """Holt alle verdienten Badges eines Users."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('''
        SELECT badge_id, earned_at FROM user_badges 
        WHERE user_id = ?
        ORDER BY earned_at DESC
    ''', (user_id,))
    
    badges = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return badges

def award_badge(user_id: str, badge_id: str) -> bool:
    """Vergibt ein Badge an einen User."""
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()
    
    try:
        c.execute('''
            INSERT OR IGNORE INTO user_badges (user_id, badge_id)
            VALUES (?, ?)
        ''', (user_id, badge_id))
        conn.commit()
        success = c.rowcount > 0
    except sqlite3.Error:
        success = False
    
    conn.close()
    return success

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
