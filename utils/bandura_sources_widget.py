"""
🧠 Bandura-Quellen Widget
=========================

Interaktives Streamlit-Widget zum Trainieren der 4 Quellen der Selbstwirksamkeit
nach Albert Bandura (1977).

Die 4 Quellen:
1. Mastery Experiences - Eigene Erfolge erleben
2. Vicarious Experiences - Von Vorbildern lernen
3. Social Persuasion - Ermutigung erhalten/geben
4. Physiological States - Körperzustand managen

Verwendung:
    from utils.bandura_sources_widget import render_bandura_sources_widget
    render_bandura_sources_widget()
"""

import streamlit as st
from datetime import datetime, timedelta
import sqlite3
from typing import Dict, List, Any, Optional
import json

# ============================================
# INSPIRIERENDE BILDER FÜR JEDE QUELLE
# ============================================

BANDURA_IMAGES = {
    "mastery": [
        {"url": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&h=180&fit=crop", "label": "Gipfel erreicht"},
        {"url": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=300&h=180&fit=crop", "label": "Stark & fit"},
        {"url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=180&fit=crop", "label": "Problem gelöst"},
        {"url": "https://images.unsplash.com/photo-1533022139390-e31c488d69e2?w=300&h=180&fit=crop", "label": "Ins Ziel gelaufen"},
        {"url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=180&fit=crop", "label": "Präsentation gemeistert"},
    ],
    "vicarious": [
        {"url": "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=300&h=180&fit=crop", "label": "Vom Mentor lernen"},
        {"url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=180&fit=crop", "label": "Sportliche Vorbilder"},
        {"url": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=180&fit=crop", "label": "Gemeinsam lernen"},
        {"url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=180&fit=crop", "label": "Von den Besten lernen"},
        {"url": "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=300&h=180&fit=crop", "label": "Inspirierende Menschen"},
    ],
    "persuasion": [
        {"url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=180&fit=crop", "label": "Freunde feiern"},
        {"url": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=300&h=180&fit=crop", "label": "Unterstützung"},
        {"url": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=300&h=180&fit=crop", "label": "High Five!"},
        {"url": "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=300&h=180&fit=crop", "label": "Applaus"},
        {"url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=180&fit=crop", "label": "Teamwork"},
    ],
    "physiological": [
        {"url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=180&fit=crop", "label": "Meditation"},
        {"url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=180&fit=crop", "label": "Yoga & Balance"},
        {"url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=180&fit=crop", "label": "Entspannung"},
        {"url": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&h=180&fit=crop", "label": "Natur & Ruhe"},
        {"url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=180&fit=crop", "label": "Sport & Energie"},
    ],
}

# ============================================
# BANDURA SOURCES KONFIGURATION
# ============================================

BANDURA_SOURCES = {
    "mastery": {
        "name": "Mastery Experience",
        "name_de": "Eigener Erfolg",
        "icon": "🏆",
        "color": "#4CAF50",
        "description": "Der stärkste Weg! Erlebe selbst, dass du etwas schaffst.",
        "prompt": "Was hast du heute geschafft, worauf du stolz bist?",
        "examples": [
            "Eine schwierige Mathe-Aufgabe gelöst",
            "Einen Text fehlerfrei vorgelesen",
            "Etwas Neues verstanden",
            "Eine Präsentation gehalten"
        ],
        "xp": 15
    },
    "vicarious": {
        "name": "Vicarious Experience",
        "name_de": "Vorbild-Lernen",
        "icon": "👀",
        "color": "#2196F3",
        "description": "Sieh anderen zu, die es schaffen - besonders solchen, die dir ähnlich sind!",
        "prompt": "Von wem hast du heute gelernt oder wer hat dich inspiriert?",
        "examples": [
            "Ein Mitschüler hat eine gute Lösung erklärt",
            "Jemand hat trotz Schwierigkeiten nicht aufgegeben",
            "Ein Video gesehen, das mir etwas beigebracht hat",
            "Ein Vorbild gefunden, das ähnliche Herausforderungen hatte"
        ],
        "xp": 12
    },
    "persuasion": {
        "name": "Social Persuasion",
        "name_de": "Ermutigung",
        "icon": "💬",
        "color": "#9C27B0",
        "description": "Ermutigende Worte von Menschen, denen du vertraust.",
        "prompt": "Welche ermutigenden Worte hast du bekommen oder gegeben?",
        "examples": [
            "Jemand hat gesagt, dass ich das schaffen kann",
            "Positives Feedback von einem Lehrer",
            "Ich habe jemand anderen ermutigt",
            "Ein Kompliment für meine Arbeit bekommen"
        ],
        "xp": 10
    },
    "physiological": {
        "name": "Physiological States",
        "name_de": "Körper-Management",
        "icon": "🧘",
        "color": "#FF9800",
        "description": "Lerne, Aufregung als Energie zu nutzen statt als Hindernis.",
        "prompt": "Wie hast du heute mit Stress oder Nervosität umgegangen?",
        "examples": [
            "Tief durchgeatmet vor einer Prüfung",
            "Aufregung als positive Energie genutzt",
            "Pause gemacht, als ich frustriert war",
            "Sport/Bewegung zum Stressabbau gemacht"
        ],
        "xp": 12
    }
}

# XP Boni
XP_CONFIG = {
    "base_entry": 10,
    "all_four_today": 25,  # Bonus wenn alle 4 Quellen an einem Tag
    "streak_3": 1.2,
    "streak_7": 1.5,
    "detailed_reflection": 5  # Bonus für ausführliche Reflexion (>50 Zeichen)
}

# Badges speziell für Bandura-Challenge
BANDURA_BADGES = {
    "bandura_first": {
        "name": "Bandura-Entdecker",
        "icon": "🔬",
        "description": "Ersten Bandura-Eintrag gemacht",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_total", 0) >= 1
    },
    "bandura_mastery_5": {
        "name": "Erfolgs-Sammler",
        "icon": "🏆",
        "description": "5 Mastery Experiences dokumentiert",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_mastery", 0) >= 5
    },
    "bandura_mastery_20": {
        "name": "Meister der Meisterschaft",
        "icon": "👑",
        "description": "20 Mastery Experiences dokumentiert",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_mastery", 0) >= 20
    },
    "bandura_vicarious_5": {
        "name": "Beobachter",
        "icon": "👀",
        "description": "5 Vorbild-Erfahrungen dokumentiert",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_vicarious", 0) >= 5
    },
    "bandura_persuasion_5": {
        "name": "Mutmacher",
        "icon": "💬",
        "description": "5 Ermutigungen dokumentiert",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_persuasion", 0) >= 5
    },
    "bandura_physiological_5": {
        "name": "Körperflüsterer",
        "icon": "🧘",
        "description": "5x Körper-Management dokumentiert",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_physiological", 0) >= 5
    },
    "bandura_all_four": {
        "name": "Quellen-Meister",
        "icon": "🌟",
        "description": "Alle 4 Quellen an einem Tag genutzt",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_all_four_days", 0) >= 1
    },
    "bandura_balanced_10": {
        "name": "Balance-Künstler",
        "icon": "⚖️",
        "description": "Mind. 10 Einträge in jeder Quelle",
        "category": "bandura",
        "condition": lambda s: all(
            s.get(f"bandura_{src}", 0) >= 10
            for src in ["mastery", "vicarious", "persuasion", "physiological"]
        )
    },
    "bandura_streak_7": {
        "name": "Bandura-Woche",
        "icon": "📅",
        "description": "7 Tage in Folge Einträge gemacht",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_streak", 0) >= 7 or s.get("bandura_longest_streak", 0) >= 7
    },
    "bandura_50": {
        "name": "Selbstwirksamkeits-Experte",
        "icon": "🎓",
        "description": "50 Bandura-Einträge insgesamt",
        "category": "bandura",
        "condition": lambda s: s.get("bandura_total", 0) >= 50
    }
}

# ============================================
# DATABASE FUNCTIONS
# ============================================

def get_db_path():
    """Gibt den Pfad zur SQLite-Datenbank zurück."""
    from pathlib import Path
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent.parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "hattie_gamification.db"

def init_bandura_tables():
    """Initialisiert die Bandura-spezifischen Tabellen."""
    conn = sqlite3.connect(get_db_path())
    c = conn.cursor()

    # Bandura Entries Tabelle
    c.execute('''
        CREATE TABLE IF NOT EXISTS bandura_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            entry_date DATE NOT NULL,
            source_type TEXT NOT NULL,
            description TEXT NOT NULL,
            xp_earned INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')

    # Index für Performance
    c.execute('CREATE INDEX IF NOT EXISTS idx_bandura_user_date ON bandura_entries(user_id, entry_date)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_bandura_source ON bandura_entries(source_type)')

    conn.commit()
    conn.close()

def create_bandura_entry(user_id: str, source_type: str, description: str) -> Dict[str, Any]:
    """Erstellt einen neuen Bandura-Eintrag."""
    init_bandura_tables()
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    today = datetime.now().date().isoformat()

    # Basis-XP berechnen
    source_info = BANDURA_SOURCES.get(source_type, {})
    base_xp = source_info.get("xp", XP_CONFIG["base_entry"])

    # Bonus für ausführliche Reflexion
    if len(description) > 50:
        base_xp += XP_CONFIG["detailed_reflection"]

    # Eintrag erstellen
    c.execute('''
        INSERT INTO bandura_entries (user_id, entry_date, source_type, description, xp_earned)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, today, source_type, description, base_xp))

    entry_id = c.lastrowid

    # Prüfen ob alle 4 Quellen heute genutzt wurden
    c.execute('''
        SELECT DISTINCT source_type FROM bandura_entries
        WHERE user_id = ? AND entry_date = ?
    ''', (user_id, today))

    sources_today = [row[0] for row in c.fetchall()]
    all_four_bonus = 0

    if len(sources_today) == 4:
        # Prüfe ob heute schon der Bonus vergeben wurde
        c.execute('''
            SELECT COUNT(*) FROM activity_log
            WHERE user_id = ? AND activity_date = ? AND activity_type = 'bandura_all_four'
        ''', (user_id, today))

        if c.fetchone()[0] == 0:
            all_four_bonus = XP_CONFIG["all_four_today"]
            c.execute('''
                INSERT INTO activity_log (user_id, activity_date, activity_type, xp_earned, details)
                VALUES (?, ?, 'bandura_all_four', ?, ?)
            ''', (user_id, today, all_four_bonus, json.dumps({"sources": sources_today})))

    total_xp = base_xp + all_four_bonus

    # Activity Log für diesen Eintrag
    c.execute('''
        INSERT INTO activity_log (user_id, activity_date, activity_type, xp_earned, details)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, today, f'bandura_{source_type}', base_xp, json.dumps({
        "description": description[:100],
        "source": source_type
    })))

    conn.commit()

    # Streak berechnen
    streak = calculate_bandura_streak(user_id, c)

    # User XP updaten
    c.execute("SELECT xp_total, level FROM users WHERE user_id = ?", (user_id,))
    user_row = c.fetchone()

    if user_row:
        new_xp = (user_row['xp_total'] or 0) + total_xp
        new_level = calculate_level(new_xp)
        old_level = user_row['level'] or 1

        c.execute('''
            UPDATE users SET xp_total = ?, level = ?, last_activity_date = ?
            WHERE user_id = ?
        ''', (new_xp, new_level, today, user_id))

        level_up = new_level > old_level
    else:
        new_xp = total_xp
        new_level = 1
        level_up = False

    conn.commit()
    conn.close()

    return {
        "entry_id": entry_id,
        "source_type": source_type,
        "xp_earned": base_xp,
        "all_four_bonus": all_four_bonus,
        "total_xp": total_xp,
        "sources_today": sources_today,
        "streak": streak,
        "level": new_level,
        "level_up": level_up,
        "total_user_xp": new_xp
    }

def calculate_level(xp: int) -> int:
    """Berechnet das Level basierend auf XP."""
    LEVELS = {
        1: 0, 2: 100, 3: 250, 4: 500,
        5: 1000, 6: 2000, 7: 5000, 8: 10000
    }
    for level in sorted(LEVELS.keys(), reverse=True):
        if xp >= LEVELS[level]:
            return level
    return 1

def calculate_bandura_streak(user_id: str, cursor) -> int:
    """Berechnet den aktuellen Bandura-Streak."""
    today = datetime.now().date()

    # Hole alle Tage mit Einträgen (absteigend sortiert)
    cursor.execute('''
        SELECT DISTINCT entry_date FROM bandura_entries
        WHERE user_id = ?
        ORDER BY entry_date DESC
    ''', (user_id,))

    dates = [row[0] for row in cursor.fetchall()]

    if not dates:
        return 0

    # Prüfe ob heute oder gestern dabei ist
    today_str = today.isoformat()
    yesterday_str = (today - timedelta(days=1)).isoformat()

    if dates[0] != today_str and dates[0] != yesterday_str:
        return 0 if dates[0] != today_str else 1

    # Zähle aufeinanderfolgende Tage
    streak = 1
    for i in range(len(dates) - 1):
        current = datetime.fromisoformat(dates[i]).date()
        previous = datetime.fromisoformat(dates[i + 1]).date()

        if (current - previous).days == 1:
            streak += 1
        else:
            break

    return streak

def get_bandura_stats(user_id: str) -> Dict[str, Any]:
    """Holt Bandura-spezifische Statistiken."""
    init_bandura_tables()
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    stats = {}

    # Gesamt-Einträge
    c.execute("SELECT COUNT(*) FROM bandura_entries WHERE user_id = ?", (user_id,))
    stats["bandura_total"] = c.fetchone()[0]

    # Einträge pro Quelle
    for source in BANDURA_SOURCES.keys():
        c.execute('''
            SELECT COUNT(*) FROM bandura_entries
            WHERE user_id = ? AND source_type = ?
        ''', (user_id, source))
        stats[f"bandura_{source}"] = c.fetchone()[0]

    # Tage mit allen 4 Quellen
    c.execute('''
        SELECT entry_date, COUNT(DISTINCT source_type) as source_count
        FROM bandura_entries
        WHERE user_id = ?
        GROUP BY entry_date
        HAVING source_count = 4
    ''', (user_id,))
    stats["bandura_all_four_days"] = len(c.fetchall())

    # Heutiger Status
    today = datetime.now().date().isoformat()
    c.execute('''
        SELECT source_type FROM bandura_entries
        WHERE user_id = ? AND entry_date = ?
    ''', (user_id, today))
    stats["sources_today"] = [row[0] for row in c.fetchall()]

    # Streak
    stats["bandura_streak"] = calculate_bandura_streak(user_id, c)

    # Längster Streak - Python-basierte Berechnung
    c.execute('''
        SELECT DISTINCT entry_date FROM bandura_entries
        WHERE user_id = ?
        ORDER BY entry_date
    ''', (user_id,))
    all_dates = [row[0] for row in c.fetchall()]

    longest_streak = 0
    if all_dates:
        current_streak = 1
        for i in range(1, len(all_dates)):
            prev_date = datetime.fromisoformat(all_dates[i-1]).date()
            curr_date = datetime.fromisoformat(all_dates[i]).date()
            if (curr_date - prev_date).days == 1:
                current_streak += 1
            else:
                longest_streak = max(longest_streak, current_streak)
                current_streak = 1
        longest_streak = max(longest_streak, current_streak)

    stats["bandura_longest_streak"] = max(longest_streak, stats["bandura_streak"])

    conn.close()
    return stats

def get_bandura_entries(user_id: str, limit: int = 10) -> List[Dict]:
    """Holt die letzten Bandura-Einträge."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute('''
        SELECT * FROM bandura_entries
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ''', (user_id, limit))

    entries = [dict(row) for row in c.fetchall()]
    conn.close()

    return entries

def check_and_award_bandura_badges(user_id: str) -> List[str]:
    """Prüft und vergibt Bandura-Badges."""
    from utils.gamification_db import get_user_badges, award_badge, get_user_stats

    # Kombiniere normale Stats mit Bandura-Stats
    stats = get_user_stats(user_id)
    bandura_stats = get_bandura_stats(user_id)
    stats.update(bandura_stats)

    existing = [b['badge_id'] for b in get_user_badges(user_id)]
    new_badges = []

    for badge_id, badge_info in BANDURA_BADGES.items():
        if badge_id not in existing:
            condition_fn = badge_info.get("condition")
            if condition_fn and condition_fn(stats):
                if award_badge(user_id, badge_id):
                    new_badges.append(badge_id)

    return new_badges

# ============================================
# UI COMPONENTS
# ============================================

def render_source_card(source_id: str, source_info: Dict, completed_today: bool):
    """Rendert eine Karte für eine Bandura-Quelle."""
    opacity = "1" if not completed_today else "0.6"
    check = "✅ " if completed_today else ""

    st.markdown(f"""
    <div style="background: {source_info['color']}15; border: 2px solid {source_info['color']};
                padding: 15px; border-radius: 12px; margin-bottom: 10px; opacity: {opacity};">
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.8em;">{source_info['icon']}</span>
            <div>
                <div style="font-weight: bold; color: {source_info['color']};">
                    {check}{source_info['name_de']}
                </div>
                <div style="font-size: 0.85em; color: #666;">
                    {source_info['description']}
                </div>
            </div>
            <div style="margin-left: auto; background: {source_info['color']}30;
                        padding: 4px 10px; border-radius: 20px; font-size: 0.8em;">
                +{source_info['xp']} XP
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_bandura_sources_widget(compact: bool = False, color: str = "#9C27B0"):
    """
    Rendert das komplette Bandura-Quellen Widget.

    Args:
        compact: Wenn True, kompaktere Darstellung
        color: Primärfarbe für das Widget
    """
    from utils.hattie_challenge_widget import get_user_id, init_widget_state
    from utils.gamification_db import init_database, get_or_create_user
    from utils.gamification_ui import render_level_card, render_new_badge_celebration

    init_database()
    init_bandura_tables()

    user_id = get_user_id()
    user = get_or_create_user(user_id)
    bandura_stats = get_bandura_stats(user_id)

    # Merge user stats into bandura_stats for portfolio/certificate
    bandura_stats["level"] = user.get("level", 1)
    bandura_stats["xp_total"] = user.get("xp_total", 0)

    # Header
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, {color} 0%, {color}dd 100%);
                color: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; display: flex; align-items: center; gap: 10px;">
            🧠 Bandura-Challenge
            <span style="font-size: 0.6em; background: rgba(255,255,255,0.2);
                        padding: 4px 10px; border-radius: 20px;">
                4 Quellen
            </span>
        </h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.95em;">
            Trainiere die 4 Quellen der Selbstwirksamkeit nach Albert Bandura
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Heutiger Fortschritt
    sources_today = bandura_stats.get("sources_today", [])
    completed_count = len(set(sources_today))

    st.markdown(f"""
    <div style="background: #f8f9fa; padding: 12px 16px; border-radius: 10px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span><strong>Heute:</strong> {completed_count}/4 Quellen genutzt</span>
            <span style="font-size: 1.2em;">
                {'🌟 Alle 4!' if completed_count == 4 else ''.join(['✅' if s in sources_today else '⬜' for s in BANDURA_SOURCES.keys()])}
            </span>
        </div>
        <div style="background: #e0e0e0; border-radius: 6px; height: 8px; margin-top: 8px;">
            <div style="background: linear-gradient(90deg, #4CAF50, #2196F3, #9C27B0, #FF9800);
                        width: {completed_count * 25}%; height: 100%; border-radius: 6px;"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Tabs
    tab_entry, tab_overview, tab_portfolio, tab_history = st.tabs([
        "📝 Neuer Eintrag", "📊 Übersicht", "📋 Portfolio & Urkunde", "📜 Verlauf"
    ])

    # === TAB 1: NEUER EINTRAG ===
    with tab_entry:
        render_entry_tab(user_id, bandura_stats, sources_today)

    # === TAB 2: ÜBERSICHT ===
    with tab_overview:
        render_overview_tab(user_id, bandura_stats)

    # === TAB 3: PORTFOLIO & URKUNDE ===
    with tab_portfolio:
        render_portfolio_tab(user_id, bandura_stats)

    # === TAB 4: VERLAUF ===
    with tab_history:
        render_history_tab(user_id)

def render_entry_tab(user_id: str, stats: Dict, sources_today: List[str]):
    """Rendert den Eintrag-Tab."""

    st.markdown("""
    ### 📝 Dokumentiere deine Selbstwirksamkeit

    Wähle eine Quelle und beschreibe deine Erfahrung:
    """)

    # Source Selection als Cards
    selected_source = st.radio(
        "Quelle wählen:",
        options=list(BANDURA_SOURCES.keys()),
        format_func=lambda x: f"{BANDURA_SOURCES[x]['icon']} {BANDURA_SOURCES[x]['name_de']} {'✅' if x in sources_today else ''}",
        horizontal=True,
        label_visibility="collapsed"
    )

    source_info = BANDURA_SOURCES[selected_source]
    source_images = BANDURA_IMAGES.get(selected_source, [])

    # Inspirierende Bildergalerie für die gewählte Quelle
    if source_images:
        images_html = "".join([
            f'<div style="flex: 0 0 auto; text-align: center;">'
            f'<img src="{img["url"]}" style="width: 140px; height: 90px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">'
            f'<div style="font-size: 0.75em; color: #666; margin-top: 4px;">{img["label"]}</div>'
            f'</div>'
            for img in source_images
        ])
        st.markdown(f"""
        <div style="display: flex; gap: 12px; overflow-x: auto; padding: 10px 0 15px 0; margin-bottom: 10px;">
            {images_html}
        </div>
        """, unsafe_allow_html=True)

    # Info-Box für gewählte Quelle
    st.info(f"""
    **{source_info['icon']} {source_info['name_de']}** ({source_info['name']})

    {source_info['description']}

    **Beispiele:**
    - {source_info['examples'][0]}
    - {source_info['examples'][1]}
    """)

    # Eingabeformular
    with st.form("bandura_entry_form"):
        description = st.text_area(
            source_info['prompt'],
            placeholder=f"z.B. {source_info['examples'][0]}",
            height=100,
            help="Je ausführlicher, desto mehr XP! (Bonus ab 50 Zeichen)"
        )

        col1, col2 = st.columns([3, 1])
        with col1:
            submitted = st.form_submit_button(
                f"✅ {source_info['name_de']} speichern",
                use_container_width=True,
                type="primary"
            )
        with col2:
            st.markdown(f"**+{source_info['xp']} XP**")

        if submitted:
            if not description or len(description.strip()) < 5:
                st.error("Bitte beschreibe deine Erfahrung (mindestens 5 Zeichen).")
            else:
                result = create_bandura_entry(user_id, selected_source, description.strip())

                # Speichere Ergebnis für Anzeige
                st.session_state["last_bandura_result"] = result
                st.session_state["last_bandura_source"] = source_info
                st.rerun()

    # Zeige letztes Ergebnis falls vorhanden
    if "last_bandura_result" in st.session_state:
        result = st.session_state.pop("last_bandura_result")
        source = st.session_state.pop("last_bandura_source", {})

        # Erfolgs-Anzeige
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, {source.get('color', '#4CAF50')} 0%,
                    {source.get('color', '#4CAF50')}bb 100%);
                    color: white; padding: 20px; border-radius: 12px; text-align: center; margin-top: 15px;">
            <div style="font-size: 2em;">{source.get('icon', '✅')}</div>
            <h3 style="margin: 10px 0;">Eintrag gespeichert!</h3>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; margin-top: 10px;">
                <span style="font-size: 1.3em;">+{result['xp_earned']} XP</span>
                {f" · 🌟 +{result['all_four_bonus']} Bonus (alle 4 Quellen!)" if result['all_four_bonus'] > 0 else ""}
                {f" · 🔥 {result['streak']} Tage Streak" if result['streak'] >= 3 else ""}
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Level-Up?
        if result.get("level_up"):
            st.balloons()
            st.success("### 🎉 LEVEL UP!")

        # Badges prüfen
        new_badges = check_and_award_bandura_badges(user_id)
        if new_badges:
            from utils.gamification_ui import render_new_badge_celebration
            for badge_id in new_badges:
                badge_info = BANDURA_BADGES.get(badge_id, {})
                render_new_badge_celebration(badge_info)

def render_overview_tab(user_id: str, stats: Dict):
    """Rendert den Übersicht-Tab."""

    st.markdown("### 📊 Deine Bandura-Statistiken")

    # Übersichts-Metriken
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Einträge", stats.get("bandura_total", 0))
    with col2:
        st.metric("Streak", f"{stats.get('bandura_streak', 0)} Tage")
    with col3:
        st.metric("4er-Tage", stats.get("bandura_all_four_days", 0))
    with col4:
        st.metric("Bester Streak", stats.get("bandura_longest_streak", 0))

    st.markdown("---")

    # Quellen-Breakdown
    st.markdown("**📈 Verteilung nach Quellen:**")

    total = max(stats.get("bandura_total", 1), 1)

    for source_id, source_info in BANDURA_SOURCES.items():
        count = stats.get(f"bandura_{source_id}", 0)
        percentage = (count / total) * 100

        st.markdown(f"""
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 1.3em; width: 30px;">{source_info['icon']}</span>
            <span style="width: 120px;">{source_info['name_de']}</span>
            <div style="flex: 1; background: #e0e0e0; border-radius: 6px; height: 20px;">
                <div style="background: {source_info['color']}; width: {percentage}%;
                            height: 100%; border-radius: 6px;"></div>
            </div>
            <span style="width: 60px; text-align: right;"><strong>{count}</strong></span>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Wissenschaftlicher Hintergrund
    with st.expander("🔬 Die Wissenschaft dahinter"):
        st.markdown("""
        **Albert Bandura (1977)** identifizierte 4 Hauptquellen der Selbstwirksamkeit:

        1. **🏆 Mastery Experiences** (Eigene Erfolge)
           - Der STÄRKSTE Weg! Wenn du selbst erlebst, dass du etwas schaffst,
             glaubt dein Gehirn am meisten daran.
           - "Ich habe es geschafft, also kann ich es wieder schaffen."

        2. **👀 Vicarious Experiences** (Vorbild-Lernen)
           - Wenn du siehst, dass ANDERE wie du es schaffen, denkst du:
             "Wenn die das können, kann ich das auch!"
           - Wichtig: Das Vorbild sollte dir ähnlich sein (Alter, Situation).

        3. **💬 Social Persuasion** (Ermutigung)
           - Wenn Menschen, denen du vertraust, sagen "Du schaffst das!" –
             hilft das! Aber nur von glaubwürdigen Personen.
           - Auch SELBST andere ermutigen stärkt dich!

        4. **🧘 Physiological States** (Körper-Management)
           - Aufregung kann als "Ich bin bereit!" interpretiert werden
             statt als "Ich habe Angst."
           - Tiefes Atmen, Bewegung, genug Schlaf – alles hilft!

        **Tipp:** Mastery ist am stärksten, aber alle 4 zusammen sind unschlagbar!
        """)

def render_history_tab(user_id: str):
    """Rendert den Verlauf-Tab."""

    st.markdown("### 📜 Deine letzten Einträge")

    entries = get_bandura_entries(user_id, limit=15)

    if not entries:
        st.info("Noch keine Einträge. Starte jetzt mit deinem ersten Eintrag!")
        return

    for entry in entries:
        source_id = entry.get("source_type", "mastery")
        source_info = BANDURA_SOURCES.get(source_id, BANDURA_SOURCES["mastery"])

        date = entry.get("entry_date", "")
        description = entry.get("description", "")
        xp = entry.get("xp_earned", 0)

        st.markdown(f"""
        <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px;
                    background: {source_info['color']}08; border-left: 3px solid {source_info['color']};
                    border-radius: 0 8px 8px 0; margin-bottom: 10px;">
            <span style="font-size: 1.5em;">{source_info['icon']}</span>
            <div style="flex: 1;">
                <div style="font-weight: bold; color: {source_info['color']};">
                    {source_info['name_de']}
                    <span style="font-weight: normal; color: #666; font-size: 0.85em;"> · {date}</span>
                </div>
                <div style="margin-top: 5px; color: #333;">
                    {description[:150]}{'...' if len(description) > 150 else ''}
                </div>
            </div>
            <div style="background: {source_info['color']}20; padding: 4px 10px;
                        border-radius: 4px; font-size: 0.85em; white-space: nowrap;">
                +{xp} XP
            </div>
        </div>
        """, unsafe_allow_html=True)

# ============================================
# PORTFOLIO & CERTIFICATE
# ============================================

def get_all_entries_by_source(user_id: str) -> Dict[str, List[Dict]]:
    """Holt alle Einträge gruppiert nach Quelle."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    result = {source: [] for source in BANDURA_SOURCES.keys()}

    c.execute('''
        SELECT * FROM bandura_entries
        WHERE user_id = ?
        ORDER BY entry_date DESC
    ''', (user_id,))

    for row in c.fetchall():
        entry = dict(row)
        source = entry.get("source_type", "mastery")
        if source in result:
            result[source].append(entry)

    conn.close()
    return result

def render_portfolio_tab(user_id: str, bandura_stats: Dict):
    """Rendert den Portfolio-Tab mit Übersichtstabelle und Urkunde."""

    st.markdown("### 📋 Dein Selbstwirksamkeits-Portfolio")

    # Hole alle Einträge
    entries_by_source = get_all_entries_by_source(user_id)

    # Übersichts-Tabelle als 4 Spalten
    st.markdown("#### 📊 Alle deine gesammelten Erfahrungen")

    # Erstelle 4 Spalten für die 4 Quellen
    cols = st.columns(4)

    for idx, (source_id, source_info) in enumerate(BANDURA_SOURCES.items()):
        entries = entries_by_source.get(source_id, [])

        with cols[idx]:
            st.markdown(f"""
            <div style="background: {source_info['color']}15; border: 2px solid {source_info['color']};
                        border-radius: 12px; padding: 15px; height: 100%; min-height: 300px;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <span style="font-size: 2em;">{source_info['icon']}</span>
                    <div style="font-weight: bold; color: {source_info['color']}; margin-top: 5px;">
                        {source_info['name_de']}
                    </div>
                    <div style="font-size: 0.8em; color: #666;">
                        {len(entries)} Einträge
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Einträge als Liste
            if entries:
                for entry in entries[:5]:  # Max 5 pro Spalte anzeigen
                    desc = entry.get("description", "")[:60]
                    date = entry.get("entry_date", "")
                    st.markdown(f"""
                    <div style="background: white; padding: 8px 10px; border-radius: 6px;
                                margin: 5px 0; border-left: 3px solid {source_info['color']};
                                font-size: 0.85em;">
                        <div style="color: #333;">{desc}{'...' if len(entry.get('description', '')) > 60 else ''}</div>
                        <div style="color: #999; font-size: 0.8em;">{date}</div>
                    </div>
                    """, unsafe_allow_html=True)

                if len(entries) > 5:
                    st.caption(f"... und {len(entries) - 5} weitere")
            else:
                st.markdown("""
                <div style="text-align: center; color: #999; padding: 20px; font-size: 0.9em;">
                    Noch keine Einträge
                </div>
                """, unsafe_allow_html=True)

    st.markdown("---")

    # Urkunde
    render_certificate_section(user_id, bandura_stats, entries_by_source)

def render_certificate_section(user_id: str, stats: Dict, entries_by_source: Dict):
    """Rendert den Urkunden-Bereich."""

    st.markdown("#### 🏆 Deine Urkunde")

    # Hole Benutzername
    display_name = st.session_state.get("current_user_name", "Lernender")

    # Zähle Einträge
    counts = {source: len(entries) for source, entries in entries_by_source.items()}
    total = sum(counts.values())

    # Hole zusätzliche Stats
    level = stats.get("level", 1) if stats else 1
    xp = stats.get("xp_total", 0) if stats else 0
    streak = stats.get("bandura_streak", 0)
    longest_streak = stats.get("bandura_longest_streak", 0)

    # Level-Info
    level_icons = {1: "🌱", 2: "🔍", 3: "📚", 4: "📈", 5: "🚀", 6: "🏆", 7: "⭐", 8: "👑"}
    level_names = {1: "Anfänger", 2: "Entdecker", 3: "Lernender", 4: "Aufsteiger",
                   5: "Übertreffer", 6: "Meister", 7: "Experte", 8: "Champion"}

    level_icon = level_icons.get(level, "🌱")
    level_name = level_names.get(level, "Anfänger")

    # Datum
    today = datetime.now().strftime("%d.%m.%Y")

    # Generiere Einträge-HTML für jede Quelle
    def format_entries(source_key):
        entries = entries_by_source.get(source_key, [])[:5]
        if not entries:
            return '<div style="color: #999; font-style: italic;">Noch keine Einträge</div>'
        html_parts = []
        for e in entries:
            desc = e.get("description", "")
            short_desc = desc[:50] + "..." if len(desc) > 50 else desc
            html_parts.append(f'<div style="margin: 4px 0;">• {short_desc}</div>')
        return ''.join(html_parts)

    mastery_entries_html = format_entries('mastery')
    vicarious_entries_html = format_entries('vicarious')
    persuasion_entries_html = format_entries('persuasion')
    physiological_entries_html = format_entries('physiological')

    # Elegante Urkunde als HTML (ohne Kommentare für Streamlit-Kompatibilität)
    certificate_html = f'''
    <div id="certificate" style="background: linear-gradient(145deg, #fffef5 0%, #fdf8e6 50%, #f5edd6 100%); padding: 15px; border-radius: 8px; box-shadow: 0 15px 50px rgba(0,0,0,0.2); margin: 20px auto; max-width: 650px;">
        <div style="border: 3px solid #c9a227; border-radius: 6px; padding: 12px; background: linear-gradient(145deg, rgba(201,162,39,0.1) 0%, transparent 50%);">
            <div style="border: 2px solid #8b7355; border-radius: 4px; padding: 35px 30px; position: relative;">

                <div style="position: absolute; top: 8px; left: 8px; font-size: 1.2em; opacity: 0.6;">✦</div>
                <div style="position: absolute; top: 8px; right: 8px; font-size: 1.2em; opacity: 0.6;">✦</div>
                <div style="position: absolute; bottom: 8px; left: 8px; font-size: 1.2em; opacity: 0.6;">✦</div>
                <div style="position: absolute; bottom: 8px; right: 8px; font-size: 1.2em; opacity: 0.6;">✦</div>

                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 15px; background: linear-gradient(135deg, #ffd700 0%, #ffb347 50%, #ffd700 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(255,215,0,0.4); border: 3px solid #c9a227;">
                        <span style="font-size: 2.5em;">🏆</span>
                    </div>
                    <h2 style="font-family: Georgia, serif; color: #4a3728; margin: 0; font-size: 2.2em; letter-spacing: 8px; text-transform: uppercase;">URKUNDE</h2>
                    <div style="width: 200px; height: 2px; margin: 12px auto; background: linear-gradient(90deg, transparent, #c9a227, transparent);"></div>
                    <p style="font-family: Georgia, serif; color: #6b5344; margin: 0; font-size: 1.1em; font-style: italic;">Selbstwirksamkeits-Portfolio</p>
                </div>

                <div style="text-align: center; margin: 25px 0;">
                    <p style="color: #5d4e37; margin: 0 0 8px 0; font-size: 0.95em;">Hiermit wird bestätigt, dass</p>
                    <h1 style="font-family: Georgia, serif; color: #2c1810; margin: 10px 0; font-size: 2.5em; font-weight: normal;">{display_name}</h1>
                    <p style="color: #5d4e37; margin: 8px 0 0 0; font-size: 0.95em;">folgende Quellen der Selbstwirksamkeit gesammelt hat:</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 25px 0;">
                    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 15px; border-radius: 8px; border: 1px solid #a5d6a7; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #a5d6a7;">
                            <span style="font-size: 1.5em;">🏆</span>
                            <span style="font-weight: bold; color: #2e7d32;">Eigene Erfolge</span>
                        </div>
                        <div style="font-size: 0.85em; color: #33691e; min-height: 80px;">
                            {mastery_entries_html}
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 15px; border-radius: 8px; border: 1px solid #90caf9; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #90caf9;">
                            <span style="font-size: 1.5em;">👀</span>
                            <span style="font-weight: bold; color: #1565c0;">Vorbild-Erfahrungen</span>
                        </div>
                        <div style="font-size: 0.85em; color: #0d47a1; min-height: 80px;">
                            {vicarious_entries_html}
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); padding: 15px; border-radius: 8px; border: 1px solid #ce93d8; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ce93d8;">
                            <span style="font-size: 1.5em;">💬</span>
                            <span style="font-weight: bold; color: #7b1fa2;">Ermutigungen</span>
                        </div>
                        <div style="font-size: 0.85em; color: #4a148c; min-height: 80px;">
                            {persuasion_entries_html}
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 15px; border-radius: 8px; border: 1px solid #ffcc80; text-align: left;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #ffcc80;">
                            <span style="font-size: 1.5em;">🧘</span>
                            <span style="font-weight: bold; color: #e65100;">Stress-Strategien</span>
                        </div>
                        <div style="font-size: 0.85em; color: #bf360c; min-height: 80px;">
                            {physiological_entries_html}
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 18px 15px; border-radius: 10px; margin: 20px 0; display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.8em;">{level_icon}</div>
                        <div style="font-size: 1.1em; font-weight: bold;">Level {level}</div>
                        <div style="font-size: 0.7em; opacity: 0.8;">{level_name}</div>
                    </div>
                    <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.8em;">⭐</div>
                        <div style="font-size: 1.1em; font-weight: bold;">{xp:,} XP</div>
                        <div style="font-size: 0.7em; opacity: 0.8;">gesammelt</div>
                    </div>
                    <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.8em;">🔥</div>
                        <div style="font-size: 1.1em; font-weight: bold;">{longest_streak} Tage</div>
                        <div style="font-size: 0.7em; opacity: 0.8;">Streak</div>
                    </div>
                    <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.8em;">📝</div>
                        <div style="font-size: 1.1em; font-weight: bold;">{total}</div>
                        <div style="font-size: 0.7em; opacity: 0.8;">Einträge</div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 25px;">
                    <div style="width: 60px; height: 60px; margin: 0 auto 10px; background: linear-gradient(135deg, #c9a227 0%, #8b6914 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.2);">
                        <span style="font-size: 1.5em;">🧠</span>
                    </div>
                    <p style="color: #6b5344; margin: 10px 0 5px 0; font-size: 0.9em; font-style: italic;">Ausgestellt am {today}</p>
                    <p style="color: #9a8b7c; margin: 0; font-size: 0.75em;">Basierend auf Albert Bandura - Theorie der Selbstwirksamkeit (1977)</p>
                </div>

            </div>
        </div>
    </div>
    '''

    import streamlit.components.v1 as components
    components.html(certificate_html, height=750, scrolling=False)

    # Druck-Button
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("""
        <style>
        @media print {
            .stApp > header, .stApp > footer, .stSidebar, .stToolbar,
            button, .stButton, .stTabs, [data-testid="stToolbar"] {
                display: none !important;
            }
            #certificate {
                margin: 0 !important;
                box-shadow: none !important;
            }
        }
        </style>
        """, unsafe_allow_html=True)

        if st.button("🖨️ Urkunde drucken", use_container_width=True, type="primary"):
            st.markdown("""
            <script>
                window.print();
            </script>
            """, unsafe_allow_html=True)
            st.info("💡 **Tipp:** Drücke `Strg+P` (Windows) oder `Cmd+P` (Mac) um die Urkunde zu drucken!")

# ============================================
# STANDALONE TEST
# ============================================

if __name__ == "__main__":
    st.set_page_config(
        page_title="Bandura-Challenge Widget Test",
        page_icon="🧠",
        layout="wide"
    )

    st.title("🧠 Bandura-Challenge Widget - Test")

    render_bandura_sources_widget()
