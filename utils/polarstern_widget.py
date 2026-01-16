# -*- coding: utf-8 -*-
"""
⭐ Polarstern Widget v3.0
==========================

Überarbeitetes Reflexions- und Zielsetzungs-Tool für Schüler.
- Hübsches Design mit Inline-Styles (Streamlit-kompatibel)
- Automatische Kategorisierung (Keyword-basiert)
- Erfolgs-Reflexion beim Abschließen
- Detaillierte Anzeige erreichter Ziele

Basierend auf 3 Leitfragen:
1. "Wo will ich hin?" → Das Ziel
2. "Wo bin ich jetzt?" → Aktueller Stand
3. "Wie komme ich dahin?" → Konkrete Strategie

Beim Abschließen:
4. "Woran merkst du, dass du es geschafft hast?" → Erfolgs-Reflexion
"""

import streamlit as st
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# ============================================
# KATEGORIEN MIT KINDGERECHTEN NAMEN
# ============================================

CATEGORIES = {
    'family': {
        'icon': '👨‍👩‍👧',
        'label': 'Familie',
        'color': '#E91E63',
        'keywords': ['mama', 'papa', 'eltern', 'schwester', 'bruder', 'oma', 'opa',
                    'familie', 'zuhause', 'geschwister', 'mutter', 'vater', 'onkel', 'tante']
    },
    'school': {
        'icon': '📚',
        'label': 'Schule',
        'color': '#4CAF50',
        'keywords': ['note', 'noten', 'schule', 'mathe', 'deutsch', 'englisch', 'test',
                    'klausur', 'prüfung', 'hausaufgaben', 'unterricht', 'lehrer', 'lehrerin',
                    'zeugnis', 'klassenarbeit', 'übertritt', 'gymnasium', 'fach', 'lernen']
    },
    'social': {
        'icon': '👥',
        'label': 'Freunde',
        'color': '#2196F3',
        'keywords': ['freund', 'freundin', 'freunde', 'streit', 'zusammen', 'spielen',
                    'team', 'gruppe', 'klassenkamerad', 'mitschüler', 'beliebt', 'mobbing']
    },
    'personal': {
        'icon': '💪',
        'label': 'Ich selbst',
        'color': '#FF9800',
        'keywords': ['selbst', 'mut', 'angst', 'traurig', 'glücklich', 'stark', 'schüchtern',
                    'selbstbewusst', 'gefühle', 'wütend', 'nervös', 'konzentration']
    },
    'skill': {
        'icon': '🎨',
        'label': 'Können & Lernen',
        'color': '#9C27B0',
        'keywords': ['können', 'fahrrad', 'schwimmen', 'lesen', 'rechnen', 'malen', 'sport',
                    'instrument', 'gitarre', 'klavier', 'tanzen', 'singen', 'basteln', 'hobby']
    },
    'career': {
        'icon': '🚀',
        'label': 'Später mal werden',
        'color': '#00BCD4',
        'keywords': ['beruf', 'werden', 'später', 'arbeit', 'job', 'tierarzt', 'feuerwehr',
                    'polizist', 'arzt', 'lehrer', 'youtuber', 'fußballer', 'traumberuf']
    },
    'other': {
        'icon': '✨',
        'label': 'Sonstiges',
        'color': '#FFD700',
        'keywords': []
    }
}

XP_REWARDS = {
    'goal_created': 10,
    'goal_updated': 5,
    'goal_achieved': 50,
}

# ============================================
# DATABASE FUNCTIONS
# ============================================

def get_db_path() -> Path:
    """Gibt den Pfad zur SQLite-Datenbank zurück."""
    if Path("/tmp").exists() and Path("/tmp").is_dir():
        db_dir = Path("/tmp")
    else:
        db_dir = Path(__file__).parent / "data"
        db_dir.mkdir(exist_ok=True)
    return db_dir / "polarstern.db"


def get_connection():
    """Erstellt eine Datenbankverbindung."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_tables():
    """Erstellt die Polarstern-Tabellen mit Reflexions-Feld."""
    conn = get_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS polarstern_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            category TEXT DEFAULT 'other',
            goal_title TEXT NOT NULL,
            current_state TEXT NOT NULL,
            strategy TEXT NOT NULL,
            achievement_reflection TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 1,
            is_achieved BOOLEAN DEFAULT 0,
            achieved_at DATETIME,
            xp_earned INTEGER DEFAULT 0
        )
    """)

    # Migration: Spalte hinzufügen falls nicht vorhanden
    try:
        c.execute("ALTER TABLE polarstern_goals ADD COLUMN achievement_reflection TEXT")
    except sqlite3.OperationalError:
        pass  # Spalte existiert bereits

    c.execute('CREATE INDEX IF NOT EXISTS idx_polarstern_user ON polarstern_goals(user_id)')
    conn.commit()
    conn.close()


# ============================================
# AUTOMATISCHE KATEGORISIERUNG
# ============================================

def auto_categorize(text: str) -> str:
    """Kategorisiert Text automatisch basierend auf Keywords."""
    text_lower = text.lower()
    scores = {}

    for cat_key, cat_info in CATEGORIES.items():
        if cat_key == 'other':
            continue
        score = sum(1 for kw in cat_info['keywords'] if kw in text_lower)
        if score > 0:
            scores[cat_key] = score

    return max(scores, key=scores.get) if scores else 'other'


# ============================================
# GOAL MANAGEMENT
# ============================================

def create_goal(user_id: str, goal_title: str, current_state: str, strategy: str) -> int:
    """Erstellt ein neues Ziel mit automatischer Kategorisierung."""
    init_tables()
    combined_text = f"{goal_title} {current_state} {strategy}"
    category = auto_categorize(combined_text)

    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        INSERT INTO polarstern_goals
        (user_id, category, goal_title, current_state, strategy, xp_earned)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, category, goal_title, current_state, strategy, XP_REWARDS['goal_created']))

    goal_id = c.lastrowid
    conn.commit()
    conn.close()
    return goal_id


def update_goal(goal_id: int, goal_title: str = None, current_state: str = None,
                strategy: str = None) -> bool:
    """Aktualisiert ein Ziel mit Re-Kategorisierung."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM polarstern_goals WHERE id = ?", (goal_id,))
    goal = c.fetchone()

    if not goal:
        conn.close()
        return False

    new_title = goal_title if goal_title else goal['goal_title']
    new_state = current_state if current_state else goal['current_state']
    new_strategy = strategy if strategy else goal['strategy']

    combined_text = f"{new_title} {new_state} {new_strategy}"
    new_category = auto_categorize(combined_text)

    c.execute("""
        UPDATE polarstern_goals
        SET goal_title = ?, current_state = ?, strategy = ?, category = ?, updated_at = ?
        WHERE id = ?
    """, (new_title, new_state, new_strategy, new_category, datetime.now().isoformat(), goal_id))

    conn.commit()
    conn.close()
    return True


def mark_goal_achieved(goal_id: int, reflection: str = "") -> Dict[str, Any]:
    """Markiert ein Ziel als erreicht MIT Reflexion."""
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM polarstern_goals WHERE id = ?", (goal_id,))
    goal = c.fetchone()

    if not goal or goal['is_achieved']:
        conn.close()
        return {"success": False}

    c.execute("""
        UPDATE polarstern_goals
        SET is_achieved = 1, is_active = 0, achieved_at = ?,
            achievement_reflection = ?, xp_earned = xp_earned + ?
        WHERE id = ?
    """, (datetime.now().isoformat(), reflection, XP_REWARDS['goal_achieved'], goal_id))

    conn.commit()
    conn.close()
    return {"success": True, "xp_earned": XP_REWARDS['goal_achieved']}


def delete_goal(goal_id: int) -> bool:
    """Löscht ein Ziel."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM polarstern_goals WHERE id = ?", (goal_id,))
    success = c.rowcount > 0
    conn.commit()
    conn.close()
    return success


def get_user_goals(user_id: str) -> List[Dict]:
    """Holt alle aktiven Ziele eines Users."""
    init_tables()
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM polarstern_goals
        WHERE user_id = ? AND is_active = 1 AND is_achieved = 0
        ORDER BY category, created_at DESC
    """, (user_id,))
    goals = [dict(row) for row in c.fetchall()]
    conn.close()
    return goals


def get_achieved_goals(user_id: str) -> List[Dict]:
    """Holt alle erreichten Ziele eines Users."""
    init_tables()
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM polarstern_goals
        WHERE user_id = ? AND is_achieved = 1
        ORDER BY achieved_at DESC
    """, (user_id,))
    goals = [dict(row) for row in c.fetchall()]
    conn.close()
    return goals


def get_goal_by_id(goal_id: int) -> Optional[Dict]:
    """Holt ein einzelnes Ziel nach ID."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM polarstern_goals WHERE id = ?", (goal_id,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def get_goal_stats(user_id: str) -> Dict[str, Any]:
    """Holt Statistiken zu den Zielen eines Users."""
    init_tables()
    conn = get_connection()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM polarstern_goals WHERE user_id = ? AND is_active = 1 AND is_achieved = 0", (user_id,))
    active = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM polarstern_goals WHERE user_id = ? AND is_achieved = 1", (user_id,))
    achieved = c.fetchone()[0]

    c.execute("SELECT SUM(xp_earned) FROM polarstern_goals WHERE user_id = ?", (user_id,))
    total_xp = c.fetchone()[0] or 0

    conn.close()
    return {'active': active, 'achieved': achieved, 'total_xp': total_xp}


# ============================================
# TEXT FORMATTING - Zeilenumbrüche & Listen
# ============================================

def format_text_for_display(text: str) -> str:
    """
    Formatiert Text für die Anzeige:
    - Zeilenumbrüche werden zu <br> Tags
    - Listen (-, *, 1., 2., etc.) werden schön formatiert
    - Nummerierte Listen bekommen Nummern-Styling
    """
    if not text:
        return ""

    lines = text.split('\n')
    formatted_lines = []
    in_list = False
    list_type = None  # 'ul' oder 'ol'

    for line in lines:
        stripped = line.strip()

        # Leere Zeilen
        if not stripped:
            if in_list:
                formatted_lines.append(f'</{list_type}>')
                in_list = False
                list_type = None
            formatted_lines.append('<br>')
            continue

        # Aufzählung mit - oder *
        if stripped.startswith('-') or stripped.startswith('*'):
            content = stripped[1:].strip()
            if not in_list:
                formatted_lines.append('<ul style="margin: 0.3rem 0; padding-left: 1.2rem;">')
                in_list = True
                list_type = 'ul'
            formatted_lines.append(f'<li style="margin: 0.2rem 0;">✓ {content}</li>')

        # Nummerierte Liste (1., 2., etc.)
        elif len(stripped) > 1 and stripped[0].isdigit() and stripped[1] in '.):':
            content = stripped[2:].strip() if len(stripped) > 2 else ""
            num = stripped[0]
            if not in_list:
                formatted_lines.append('<ol style="margin: 0.3rem 0; padding-left: 1.2rem; list-style: none;">')
                in_list = True
                list_type = 'ol'
            formatted_lines.append(f'<li style="margin: 0.2rem 0;"><strong>{num}.</strong> {content}</li>')

        # Normaler Text
        else:
            if in_list:
                formatted_lines.append(f'</{list_type}>')
                in_list = False
                list_type = None
            formatted_lines.append(f'{stripped}<br>')

    # Liste schließen falls noch offen
    if in_list and list_type:
        formatted_lines.append(f'</{list_type}>')

    result = ''.join(formatted_lines)
    # Doppelte <br> am Ende entfernen
    while result.endswith('<br>'):
        result = result[:-4]

    return result


# ============================================
# RENDERING FUNCTIONS - MIT INLINE STYLES
# ============================================

def render_header(stats: Dict):
    """Rendert den Header mit XP-Badge."""
    total_xp = stats.get('total_xp', 0)
    active = stats.get('active', 0)
    achieved = stats.get('achieved', 0)
    total = active + achieved
    progress = (achieved / max(total, 1)) * 100

    st.markdown(f"""
<div style="max-width: 700px; margin: 0 auto 1.5rem auto; padding: 4px; border-radius: 24px; background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #96E6A1 100%); box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);">
<div style="background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%); border-radius: 20px; padding: 1.5rem;">
<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
<h1 style="font-size: 1.8rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
<span style="font-size: 2rem;">⭐</span>Polarstern
</h1>
<div style="display: flex; align-items: center; gap: 0.4rem; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #1a237e; padding: 0.5rem 1rem; border-radius: 30px; font-weight: 700; font-size: 1rem;">
<span>⭐</span><span>{total_xp} XP</span>
</div>
</div>
<div style="text-align: center; padding: 0.25rem; margin-bottom: 0.75rem;">
<span style="font-size: 1rem; color: rgba(255,255,255,0.8);">Deine Ziele & Träume</span>
</div>
<div style="margin-bottom: 1rem;">
<div style="height: 10px; background: rgba(255,255,255,0.2); border-radius: 30px; overflow: hidden; margin-bottom: 0.5rem;">
<div style="height: 100%; width: {progress}%; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); border-radius: 30px; transition: width 0.5s ease;"></div>
</div>
<div style="text-align: center; font-size: 0.9rem; color: rgba(255,255,255,0.8);">{achieved}/{total} Ziele erreicht</div>
</div>
<p style="text-align: center; font-size: 1rem; color: white; margin: 0; line-height: 1.5;">Setze dir Ziele und verfolge deinen Fortschritt!</p>
</div>
</div>
    """, unsafe_allow_html=True)


def render_goal_card(goal: Dict, show_actions: bool = True, show_category_badge: bool = True):
    """Rendert eine einzelne Ziel-Card."""
    goal_id = goal['id']
    cat_key = goal.get('category', 'other')
    cat_info = CATEGORIES.get(cat_key, CATEGORIES['other'])
    color = cat_info['color']

    # Text formatieren (Zeilenumbrüche, Listen)
    current_state_html = format_text_for_display(goal['current_state'])
    strategy_html = format_text_for_display(goal['strategy'])

    # Kategorie-Badge nur wenn gewünscht (nicht wenn schon im Header)
    category_badge_html = ""
    if show_category_badge:
        category_badge_html = f"""
<span style="display: flex; align-items: center; gap: 0.3rem; background: {color}; color: white; padding: 0.25rem 0.6rem; border-radius: 30px; font-size: 0.85rem; font-weight: 600;">
<span>{cat_info['icon']}</span>
<span>{cat_info['label']}</span>
</span>"""

    st.markdown(f"""
<div style="max-width: 700px; margin: 0 auto 1rem auto; padding: 3px; border-radius: 20px; background: linear-gradient(135deg, {color} 0%, #FFD700 100%); box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
<div style="background: white; border-radius: 17px; padding: 1.25rem 1rem;">
<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
{category_badge_html}
<span style="font-size: 1.1rem; font-weight: 700; color: #2c3e50; flex: 1;">🎯 {goal['goal_title']}</span>
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
<div style="background: #f8f9fa; border-radius: 12px; padding: 0.75rem; border-left: 3px solid {color};">
<div style="font-size: 0.75rem; font-weight: 600; color: #1a237e; margin-bottom: 0.3rem;">📍 Wo bin ich jetzt?</div>
<div style="font-size: 0.9rem; color: #2c3e50; line-height: 1.5;">{current_state_html}</div>
</div>
<div style="background: #f8f9fa; border-radius: 12px; padding: 0.75rem; border-left: 3px solid {color};">
<div style="font-size: 0.75rem; font-weight: 600; color: #1a237e; margin-bottom: 0.3rem;">🛤️ Wie komme ich dahin?</div>
<div style="font-size: 0.9rem; color: #2c3e50; line-height: 1.5;">{strategy_html}</div>
</div>
</div>
</div>
</div>
    """, unsafe_allow_html=True)

    if show_actions:
        # Container für zentrierte Buttons
        btn_container = st.container()
        with btn_container:
            col_spacer1, col1, col2, col3, col_spacer2 = st.columns([0.5, 1, 1, 1, 0.5])
            with col1:
                if st.button("✏️ Bearbeiten", key=f"edit_{goal_id}", use_container_width=True):
                    st.session_state[f"editing_{goal_id}"] = True
                    st.rerun()
            with col2:
                if st.button("✅ Geschafft!", key=f"done_{goal_id}", use_container_width=True):
                    st.session_state[f"completing_{goal_id}"] = True
                    st.rerun()
            with col3:
                if st.button("🗑️ Löschen", key=f"del_{goal_id}", use_container_width=True):
                    delete_goal(goal_id)
                    st.toast("Ziel gelöscht", icon="📦")
                    st.rerun()

        # Edit-Modus
        if st.session_state.get(f"editing_{goal_id}", False):
            render_edit_form(goal)

        # Completion-Dialog (NEU!)
        if st.session_state.get(f"completing_{goal_id}", False):
            render_completion_dialog(goal)


def render_edit_form(goal: Dict):
    """Rendert das Bearbeitungsformular für ein Ziel."""
    st.markdown("""
    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
        <h4 style="margin: 0 0 0.5rem 0; color: #856404;">✏️ Ziel bearbeiten</h4>
    </div>
    """, unsafe_allow_html=True)

    with st.form(key=f"edit_form_{goal['id']}"):
        new_title = st.text_input("🎯 Wo will ich hin?", value=goal['goal_title'])
        col1, col2 = st.columns(2)
        with col1:
            new_state = st.text_area("📍 Wo bin ich jetzt?", value=goal['current_state'], height=80)
        with col2:
            new_strategy = st.text_area("🛤️ Wie komme ich dahin?", value=goal['strategy'], height=80)

        c1, c2 = st.columns(2)
        with c1:
            if st.form_submit_button("💾 Speichern", use_container_width=True):
                if new_title.strip() and new_state.strip() and new_strategy.strip():
                    update_goal(goal['id'], new_title, new_state, new_strategy)
                    del st.session_state[f"editing_{goal['id']}"]
                    st.toast("✅ Aktualisiert!", icon="✏️")
                    st.rerun()
                else:
                    st.error("Bitte alle Felder ausfüllen!")
        with c2:
            if st.form_submit_button("❌ Abbrechen", use_container_width=True):
                del st.session_state[f"editing_{goal['id']}"]
                st.rerun()


def render_completion_dialog(goal: Dict):
    """Dialog zum Abschließen eines Ziels mit Reflexion."""
    cat_info = CATEGORIES.get(goal.get('category', 'other'), CATEGORIES['other'])

    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border: 3px solid #28a745; border-radius: 20px; padding: 1.5rem; margin: 1rem 0;
                box-shadow: 0 8px 24px rgba(40, 167, 69, 0.3);">
        <div style="text-align: center; margin-bottom: 1rem;">
            <span style="font-size: 3rem;">🎉</span>
            <h3 style="color: #155724; margin: 0.5rem 0;">Super! Du hast es geschafft!</h3>
            <p style="color: #155724; font-size: 1.1rem; font-weight: 600;">
                {cat_info['icon']} {goal['goal_title']}
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("""
    <div style="background: white; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;
                border-left: 4px solid #28a745;">
        <p style="font-size: 1rem; color: #2c3e50; margin: 0;">
            <strong>🤔 Woran merkst du, dass du es geschafft hast?</strong><br>
            <span style="font-size: 0.9rem; opacity: 0.8;">Beschreibe, wie du weißt, dass du dein Ziel erreicht hast!</span>
        </p>
    </div>
    """, unsafe_allow_html=True)

    with st.form(key=f"complete_form_{goal['id']}"):
        reflection = st.text_area(
            "Meine Erfolgs-Beschreibung",
            label_visibility="collapsed",
            height=100,
            placeholder="z.B. 'Ich habe eine 2 in Mathe bekommen!' oder 'Mama hat gesagt, sie ist stolz auf mich!'"
        )

        col1, col2 = st.columns(2)
        with col1:
            if st.form_submit_button("🏆 Ziel abschließen!", use_container_width=True, type="primary"):
                if reflection.strip():
                    result = mark_goal_achieved(goal['id'], reflection.strip())
                    if result['success']:
                        st.balloons()
                        del st.session_state[f"completing_{goal['id']}"]
                        st.toast(f"🎉 Super! +{result['xp_earned']} XP!", icon="⭐")
                        st.rerun()
                else:
                    st.error("Bitte beschreibe, woran du merkst, dass du es geschafft hast!")
        with col2:
            if st.form_submit_button("⬅️ Noch nicht fertig", use_container_width=True):
                del st.session_state[f"completing_{goal['id']}"]
                st.rerun()


def render_goals_grouped(user_id: str):
    """Rendert alle aktiven Ziele GRUPPIERT nach Kategorie."""
    goals = get_user_goals(user_id)

    if not goals:
        st.markdown("""
<div style="max-width: 700px; margin: 0 auto 1.5rem auto; padding: 4px; border-radius: 24px; background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #96E6A1 100%); box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);">
<div style="background: white; border-radius: 20px; text-align: center; padding: 2.5rem 2rem;">
<div style="font-size: 4rem; margin-bottom: 1rem;">🌟</div>
<div style="font-size: 1.3rem; font-weight: 700; color: #2c3e50; margin-bottom: 0.5rem;">Du hast noch keine Ziele!</div>
<div style="font-size: 1rem; color: #2c3e50; opacity: 0.7;">Setze jetzt deinen ersten Stern und starte deine Reise!</div>
</div>
</div>
        """, unsafe_allow_html=True)
        return

    # Ziele nach Kategorien gruppieren
    goals_by_category = {}
    for goal in goals:
        cat = goal.get('category', 'other')
        if cat not in goals_by_category:
            goals_by_category[cat] = []
        goals_by_category[cat].append(goal)

    # Kategorien in definierter Reihenfolge anzeigen
    category_order = ['family', 'school', 'social', 'personal', 'skill', 'career', 'other']

    for cat_key in category_order:
        if cat_key not in goals_by_category:
            continue

        cat_goals = goals_by_category[cat_key]
        cat_info = CATEGORIES.get(cat_key, CATEGORIES['other'])

        # Kategorie-Header
        st.markdown(f"""
<div style="max-width: 700px; margin: 1.5rem auto 0.5rem auto; padding: 3px; border-radius: 16px; background: linear-gradient(135deg, {cat_info['color']} 0%, #FFD700 100%);">
<div style="background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%); border-radius: 13px; padding: 0.6rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
<span style="font-size: 1.5rem;">{cat_info['icon']}</span>
<span style="font-size: 1.1rem; font-weight: 700; color: white;">{cat_info['label']}</span>
<span style="background: rgba(255,255,255,0.2); color: white; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.8rem; margin-left: auto;">{len(cat_goals)} Ziel{"e" if len(cat_goals) > 1 else ""}</span>
</div>
</div>
        """, unsafe_allow_html=True)

        # Alle Ziele in dieser Kategorie
        for goal in cat_goals:
            render_goal_card(goal, show_category_badge=False)


def render_achieved_section(user_id: str):
    """Rendert erreichte Ziele PROMINENT mit allen Details, GRUPPIERT nach Kategorie."""
    achieved = get_achieved_goals(user_id)

    if not achieved:
        return

    # Erfolge-Banner
    st.markdown(f"""
<div style="max-width: 700px; margin: 2rem auto 1.5rem auto; padding: 4px; border-radius: 24px; background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #96E6A1 100%);">
<div style="background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%); border-radius: 20px; padding: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 1rem;">
<span style="font-size: 2.5rem;">🏆</span>
<span style="font-size: 1.3rem; font-weight: 700; color: white;">Deine Erfolge!</span>
<span style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #1a237e; padding: 0.4rem 0.8rem; border-radius: 30px; font-weight: 700; font-size: 1rem;">{len(achieved)} geschafft</span>
</div>
</div>
    """, unsafe_allow_html=True)

    # Ziele nach Kategorien gruppieren
    achieved_by_category = {}
    for goal in achieved:
        cat = goal.get('category', 'other')
        if cat not in achieved_by_category:
            achieved_by_category[cat] = []
        achieved_by_category[cat].append(goal)

    # Kategorien in definierter Reihenfolge anzeigen
    category_order = ['family', 'school', 'social', 'personal', 'skill', 'career', 'other']

    for cat_key in category_order:
        if cat_key not in achieved_by_category:
            continue

        cat_goals = achieved_by_category[cat_key]
        cat_info = CATEGORIES.get(cat_key, CATEGORIES['other'])

        # Kategorie-Header für erreichte Ziele
        st.markdown(f"""
<div style="max-width: 700px; margin: 1.5rem auto 0.5rem auto; padding: 3px; border-radius: 16px; background: linear-gradient(135deg, {cat_info['color']} 0%, #4CAF50 100%);">
<div style="background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); border-radius: 13px; padding: 0.6rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
<span style="font-size: 1.5rem;">{cat_info['icon']}</span>
<span style="font-size: 1.1rem; font-weight: 700; color: white;">{cat_info['label']}</span>
<span style="background: rgba(255,255,255,0.2); color: white; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.8rem; margin-left: auto;">✅ {len(cat_goals)} geschafft</span>
</div>
</div>
        """, unsafe_allow_html=True)

        # Alle erreichten Ziele in dieser Kategorie
        for goal in cat_goals:
            color = cat_info['color']

            # Text formatieren (Zeilenumbrüche, Listen)
            current_state_html = format_text_for_display(goal['current_state'])
            strategy_html = format_text_for_display(goal['strategy'])
            reflection_html = format_text_for_display(goal.get('achievement_reflection', ''))

            # Reflexions-Text vorbereiten
            reflection_text = reflection_html if reflection_html else 'Ich habe mein Ziel erreicht!'

            st.markdown(f"""
<div style="max-width: 700px; margin: 0 auto 1rem auto; padding: 4px; border-radius: 24px; background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #96E6A1 100%); box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);">
<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 20px; padding: 1.25rem;">
<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
<span style="font-size: 2rem;">✅</span>
<div style="flex: 1;">
<div style="font-size: 1.2rem; font-weight: 700; color: #1b5e20;">🎯 {goal['goal_title']}</div>
</div>
<span style="font-size: 2rem;">⭐</span>
</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
<div style="background: white; border-radius: 12px; padding: 0.75rem; border-left: 4px solid {color};">
<div style="font-size: 0.75rem; font-weight: 600; color: #1a237e; margin-bottom: 0.3rem;">📍 Wo ich vorher stand:</div>
<div style="font-size: 0.9rem; color: #2c3e50; line-height: 1.5;">{current_state_html}</div>
</div>
<div style="background: white; border-radius: 12px; padding: 0.75rem; border-left: 4px solid {color};">
<div style="font-size: 0.75rem; font-weight: 600; color: #1a237e; margin-bottom: 0.3rem;">🛤️ So habe ich es geschafft:</div>
<div style="font-size: 0.9rem; color: #2c3e50; line-height: 1.5;">{strategy_html}</div>
</div>
</div>
<div style="background: linear-gradient(135deg, #fff9c4 0%, #fff176 100%); border-radius: 12px; padding: 1rem; border: 2px solid #ffc107;">
<div style="font-size: 0.85rem; font-weight: 600; color: #856404; margin-bottom: 0.3rem;">🎉 Woran ich gemerkt habe, dass ich es geschafft habe:</div>
<div style="font-size: 1rem; color: #5d4037; line-height: 1.5; font-style: italic;">"{reflection_text}"</div>
</div>
<div style="text-align: center; margin-top: 1rem; color: #2e7d32; font-weight: 600;">🎊 Super gemacht! Du kannst stolz auf dich sein! 🎊</div>
</div>
</div>
            """, unsafe_allow_html=True)


def render_new_goal_form(user_id: str):
    """Formular für ein neues Ziel - OHNE Placeholder."""
    st.markdown("""
<div style="max-width: 700px; margin: 1.5rem auto; padding: 4px; border-radius: 24px; background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #96E6A1 100%); box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);">
<div style="background: white; border-radius: 20px; overflow: hidden;">
<div style="background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%); padding: 1rem; text-align: center;">
<h3 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
<span>✨</span><span>Neues Ziel setzen</span>
</h3>
</div>
<div style="padding: 1.5rem;">
    """, unsafe_allow_html=True)

    with st.form("new_goal_form", clear_on_submit=True):
        st.markdown('<p style="font-size: 0.95rem; font-weight: 600; color: #1a237e; margin-bottom: 0.3rem;">🎯 Wo will ich hin?</p>', unsafe_allow_html=True)
        goal_title = st.text_input("Ziel", label_visibility="collapsed", placeholder="")

        col1, col2 = st.columns(2)
        with col1:
            st.markdown('<p style="font-size: 0.95rem; font-weight: 600; color: #1a237e; margin-bottom: 0.3rem;">📍 Wo bin ich jetzt?</p>', unsafe_allow_html=True)
            current_state = st.text_area("Stand", label_visibility="collapsed", height=80, placeholder="")
        with col2:
            st.markdown('<p style="font-size: 0.95rem; font-weight: 600; color: #1a237e; margin-bottom: 0.3rem;">🛤️ Wie komme ich dahin?</p>', unsafe_allow_html=True)
            strategy = st.text_area("Strategie", label_visibility="collapsed", height=80, placeholder="")

        submitted = st.form_submit_button("⭐ Ziel setzen!", use_container_width=True, type="primary")

        if submitted:
            if not goal_title.strip():
                st.error("Was möchtest du erreichen?")
            elif not current_state.strip():
                st.error("Wo stehst du gerade?")
            elif not strategy.strip():
                st.error("Wie willst du es schaffen?")
            else:
                create_goal(user_id, goal_title.strip(), current_state.strip(), strategy.strip())
                st.toast("⭐ Neues Ziel! +10 XP", icon="🎯")
                st.rerun()

    st.markdown('</div></div></div>', unsafe_allow_html=True)


# ============================================
# MAIN WIDGET
# ============================================

def render_polarstern_widget(user_id: str = "default_user", age_group: str = "grundschule"):
    """
    Rendert das komplette Polarstern-Widget.

    Args:
        user_id: Die User-ID für die Datenbank
        age_group: Altersstufe (für Kompatibilität)
    """
    # Motivierender Hintergrund - warmes Gold/Orange Gradient
    st.markdown("""
    <style>
    .stApp { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important; }
    .stButton > button { border-radius: 12px !important; font-weight: 600 !important; }
    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
        color: #2c3e50 !important;
        border: none !important;
    }
    </style>
    """, unsafe_allow_html=True)

    stats = get_goal_stats(user_id)
    render_header(stats)
    render_goals_grouped(user_id)
    render_new_goal_form(user_id)
    render_achieved_section(user_id)


# ============================================
# STANDALONE TEST
# ============================================

if __name__ == "__main__":
    st.set_page_config(
        page_title="⭐ Polarstern",
        page_icon="⭐",
        layout="centered",
        initial_sidebar_state="collapsed"
    )
    render_polarstern_widget("test_user")
