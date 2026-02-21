# -*- coding: utf-8 -*-
"""
⭐ Polarstern Widget v4.0 - Karteikarten-Edition
================================================

Komplett überarbeitetes Reflexions- und Zielsetzungs-Tool für Schüler.

NEU in v4.0:
- Karteikarten-Flow (Step-by-Step statt alle Fragen gleichzeitig)
- Große, prominente Schrift für die 3 Kernfragen
- Inspirierende Bilder nach Altersstufe (GS/US/MS)
- Visuell ansprechende Traumbilder die zeigen "was möglich ist"

Die 3 Leitfragen (als Karteikarten):
1. "Wo will ich hin?" → Das Ziel (Traum)
2. "Wo bin ich jetzt?" → Aktueller Stand
3. "Wie komme ich dahin?" → Konkrete Strategie

Beim Abschließen:
4. "Woran merkst du, dass du es geschafft hast?" → Erfolgs-Reflexion
"""

import streamlit as st
from datetime import datetime
from typing import Dict, List, Optional, Any

from utils.database import get_db

# ============================================
# INSPIRIERENDE BILDER NACH ALTERSSTUFE
# ============================================

# Hochwertige Unsplash-Bilder (kostenlos, legal)
# Inspirierende Traumbilder - gleich für alle Steps (Traum im Blick behalten!)
_DREAM_IMAGES_GS = [  # Grundschule (6-10 Jahre)
    {'url': 'https://images.unsplash.com/photo-1587614387466-0a72ca909e16?w=400&h=250&fit=crop', 'label': 'Feuerwehr'},
    {'url': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=250&fit=crop', 'label': 'Ärztin'},
    {'url': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=250&fit=crop', 'label': 'Astronaut'},
    {'url': 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=250&fit=crop', 'label': 'Superheld'},
    {'url': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=250&fit=crop', 'label': 'Glückliche Familie'},
]

_DREAM_IMAGES_US = [  # Unterstufe (10-13 Jahre)
    {'url': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop', 'label': 'Beste Freunde'},
    {'url': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop', 'label': 'Sportprofi'},
    {'url': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=250&fit=crop', 'label': 'Musikstar'},
    {'url': 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=250&fit=crop', 'label': 'Stolz & Lob'},
    {'url': 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=400&h=250&fit=crop', 'label': 'Spaß & Freizeit'},
]

_DREAM_IMAGES_MS = [  # Mittelstufe (13-16 Jahre)
    {'url': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=250&fit=crop', 'label': 'Medizin'},
    {'url': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop', 'label': 'Ingenieurin'},
    {'url': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop', 'label': 'Erfolg'},
    {'url': 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&h=250&fit=crop', 'label': 'Anerkennung'},
    {'url': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop', 'label': 'Echte Freunde'},
]

INSPIRATION_IMAGES = {
    'grundschule': {
        'step1': _DREAM_IMAGES_GS,
        'step2': _DREAM_IMAGES_GS,  # Gleiche Traumbilder - Traum im Blick!
        'step3': _DREAM_IMAGES_GS,
    },
    'unterstufe': {
        'step1': _DREAM_IMAGES_US,
        'step2': _DREAM_IMAGES_US,
        'step3': _DREAM_IMAGES_US,
    },
    'mittelstufe': {
        'step1': _DREAM_IMAGES_MS,
        'step2': _DREAM_IMAGES_MS,
        'step3': _DREAM_IMAGES_MS,
    },
}

# Texte nach Altersstufe
STEP_TEXTS = {
    'grundschule': {
        'step1': {
            'question': 'Wo will ich hin?',
            'subtitle': 'Was ist dein größter Traum? Was möchtest du erreichen?',
            'placeholder': 'Schreib deinen Traum hier auf...',
            'examples': 'z.B. "Ich möchte Fahrrad fahren lernen" oder "Ich will in Mathe besser werden"'
        },
        'step2': {
            'question': 'Wo bin ich jetzt?',
            'subtitle': 'Wie sieht es gerade bei dir aus?',
            'placeholder': 'Beschreibe, wie es jetzt ist...',
            'examples': 'z.B. "Ich kann noch nicht ohne Stützräder fahren" oder "Ich habe eine 4 in Mathe"'
        },
        'step3': {
            'question': 'Wie komme ich dahin?',
            'subtitle': 'Was kannst du tun, um deinen Traum zu erreichen?',
            'placeholder': 'Schreib deine Schritte auf...',
            'examples': 'z.B. "Jeden Tag 10 Minuten üben" oder "Mama um Hilfe bitten"'
        },
    },
    'unterstufe': {
        'step1': {
            'question': 'Wo will ich hin?',
            'subtitle': 'Was möchtest du erreichen? Was ist dein Ziel?',
            'placeholder': 'Beschreibe dein Ziel...',
            'examples': 'z.B. "Bessere Noten in Englisch" oder "Mehr Zeit mit Freunden verbringen"'
        },
        'step2': {
            'question': 'Wo bin ich jetzt?',
            'subtitle': 'Wie ist deine aktuelle Situation?',
            'placeholder': 'Beschreibe deinen aktuellen Stand...',
            'examples': 'z.B. "Ich verstehe die Grammatik nicht gut" oder "Ich bin oft alleine"'
        },
        'step3': {
            'question': 'Wie komme ich dahin?',
            'subtitle': 'Welche konkreten Schritte kannst du unternehmen?',
            'placeholder': 'Dein Plan...',
            'examples': 'z.B. "Jeden Tag 15 Min Vokabeln lernen" oder "Jemanden zum Spielen einladen"'
        },
    },
    'mittelstufe': {
        'step1': {
            'question': 'Wo will ich hin?',
            'subtitle': 'Was ist dein Ziel? Was willst du erreichen?',
            'placeholder': 'Definiere dein Ziel klar und konkret...',
            'examples': 'z.B. "Abitur mit 2,0 schaffen" oder "Ein Praktikum im Bereich IT finden"'
        },
        'step2': {
            'question': 'Wo bin ich jetzt?',
            'subtitle': 'Analysiere ehrlich deine aktuelle Situation.',
            'placeholder': 'Dein aktueller Stand...',
            'examples': 'z.B. "Mein Schnitt liegt bei 2,8" oder "Ich habe noch keine Erfahrung"'
        },
        'step3': {
            'question': 'Wie komme ich dahin?',
            'subtitle': 'Entwickle eine konkrete Strategie mit Meilensteinen.',
            'placeholder': 'Deine Strategie...',
            'examples': 'z.B. "Wöchentlich 2 Stunden extra lernen" oder "3 Bewerbungen pro Woche schreiben"'
        },
    },
}

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

def init_tables():
    """Keine Initialisierung nötig — Tabellen existieren in Supabase."""
    pass


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
    combined_text = f"{goal_title} {current_state} {strategy}"
    category = auto_categorize(combined_text)

    result = get_db().table("polarstern_goals").insert({
        "user_id": user_id,
        "category": category,
        "goal_title": goal_title,
        "current_state": current_state,
        "strategy": strategy,
        "xp_earned": XP_REWARDS['goal_created']
    }).execute()

    return result.data[0]["id"]


def update_goal(goal_id: int, goal_title: str = None, current_state: str = None,
                strategy: str = None) -> bool:
    """Aktualisiert ein Ziel mit Re-Kategorisierung."""
    db = get_db()
    result = db.table("polarstern_goals").select("*").eq("id", goal_id).execute()

    if not result.data:
        return False

    goal = result.data[0]
    new_title = goal_title if goal_title else goal['goal_title']
    new_state = current_state if current_state else goal['current_state']
    new_strategy = strategy if strategy else goal['strategy']

    combined_text = f"{new_title} {new_state} {new_strategy}"
    new_category = auto_categorize(combined_text)

    db.table("polarstern_goals").update({
        "goal_title": new_title,
        "current_state": new_state,
        "strategy": new_strategy,
        "category": new_category,
        "updated_at": datetime.now().isoformat()
    }).eq("id", goal_id).execute()

    return True


def mark_goal_achieved(goal_id: int, reflection: str = "") -> Dict[str, Any]:
    """Markiert ein Ziel als erreicht MIT Reflexion."""
    db = get_db()
    result = db.table("polarstern_goals").select("*").eq("id", goal_id).execute()

    if not result.data or result.data[0].get('is_achieved'):
        return {"success": False}

    goal = result.data[0]
    new_xp = (goal.get('xp_earned') or 0) + XP_REWARDS['goal_achieved']

    db.table("polarstern_goals").update({
        "is_achieved": True,
        "is_active": False,
        "achieved_at": datetime.now().isoformat(),
        "achievement_reflection": reflection,
        "xp_earned": new_xp
    }).eq("id", goal_id).execute()

    return {"success": True, "xp_earned": XP_REWARDS['goal_achieved']}


def delete_goal(goal_id: int) -> bool:
    """Löscht ein Ziel."""
    result = get_db().table("polarstern_goals").delete().eq("id", goal_id).execute()
    return len(result.data) > 0


def get_user_goals(user_id: str) -> List[Dict]:
    """Holt alle aktiven Ziele eines Users."""
    result = get_db().table("polarstern_goals") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("is_active", True) \
        .eq("is_achieved", False) \
        .order("category") \
        .order("created_at", desc=True) \
        .execute()
    return result.data


def get_achieved_goals(user_id: str) -> List[Dict]:
    """Holt alle erreichten Ziele eines Users."""
    result = get_db().table("polarstern_goals") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("is_achieved", True) \
        .order("achieved_at", desc=True) \
        .execute()
    return result.data


def get_goal_by_id(goal_id: int) -> Optional[Dict]:
    """Holt ein einzelnes Ziel nach ID."""
    result = get_db().table("polarstern_goals").select("*").eq("id", goal_id).execute()
    return result.data[0] if result.data else None


def get_goal_stats(user_id: str) -> Dict[str, Any]:
    """Holt Statistiken zu den Zielen eines Users."""
    db = get_db()
    all_goals = db.table("polarstern_goals") \
        .select("is_active, is_achieved, xp_earned") \
        .eq("user_id", user_id) \
        .execute()

    goals = all_goals.data
    active = sum(1 for g in goals if g.get("is_active") and not g.get("is_achieved"))
    achieved = sum(1 for g in goals if g.get("is_achieved"))
    total_xp = sum(g.get("xp_earned") or 0 for g in goals)

    return {'active': active, 'achieved': achieved, 'total_xp': total_xp}


# ============================================
# TEXT FORMATTING
# ============================================

def format_text_for_display(text: str) -> str:
    """Formatiert Text für die Anzeige mit Zeilenumbrüchen und Listen."""
    if not text:
        return ""

    lines = text.split('\n')
    formatted_lines = []
    in_list = False
    list_type = None

    for line in lines:
        stripped = line.strip()

        if not stripped:
            if in_list:
                formatted_lines.append(f'</{list_type}>')
                in_list = False
                list_type = None
            formatted_lines.append('<br>')
            continue

        if stripped.startswith('-') or stripped.startswith('*'):
            content = stripped[1:].strip()
            if not in_list:
                formatted_lines.append('<ul style="margin: 0.3rem 0; padding-left: 1.2rem;">')
                in_list = True
                list_type = 'ul'
            formatted_lines.append(f'<li style="margin: 0.2rem 0;">✓ {content}</li>')

        elif len(stripped) > 1 and stripped[0].isdigit() and stripped[1] in '.):':
            content = stripped[2:].strip() if len(stripped) > 2 else ""
            num = stripped[0]
            if not in_list:
                formatted_lines.append('<ol style="margin: 0.3rem 0; padding-left: 1.2rem; list-style: none;">')
                in_list = True
                list_type = 'ol'
            formatted_lines.append(f'<li style="margin: 0.2rem 0;"><strong>{num}.</strong> {content}</li>')

        else:
            if in_list:
                formatted_lines.append(f'</{list_type}>')
                in_list = False
                list_type = None
            formatted_lines.append(f'{stripped}<br>')

    if in_list and list_type:
        formatted_lines.append(f'</{list_type}>')

    result = ''.join(formatted_lines)
    while result.endswith('<br>'):
        result = result[:-4]

    return result


# ============================================
# KARTEIKARTEN-WIZARD - NEU!
# ============================================

def render_inspiration_images(age_group: str, step: str):
    """Rendert inspirierende Bilder für den aktuellen Step."""
    images = INSPIRATION_IMAGES.get(age_group, INSPIRATION_IMAGES['grundschule']).get(step, [])

    if not images:
        return

    # Bilder-Grid
    st.markdown("""
    <div style="margin: 1.5rem 0;">
        <p style="text-align: center; font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.75rem;">
            ✨ Was alles möglich ist...
        </p>
    </div>
    """, unsafe_allow_html=True)

    cols = st.columns(len(images))
    for i, img in enumerate(images):
        with cols[i]:
            st.markdown(f"""
            <div style="text-align: center;">
                <img src="{img['url']}"
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 12px;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.3); margin-bottom: 0.5rem;"
                     alt="{img['label']}"
                     onerror="this.style.display='none'">
                <p style="font-size: 0.8rem; color: rgba(255,255,255,0.8); margin: 0;">{img['label']}</p>
            </div>
            """, unsafe_allow_html=True)


def render_step_card(step_num: int, age_group: str, current_value: str = ""):
    """Rendert eine einzelne Karteikarte mit großer Frage."""
    step_key = f"step{step_num}"
    texts = STEP_TEXTS.get(age_group, STEP_TEXTS['grundschule']).get(step_key, {})

    question = texts.get('question', f'Frage {step_num}')
    subtitle = texts.get('subtitle', '')
    placeholder = texts.get('placeholder', '')
    examples = texts.get('examples', '')

    # Farben je nach Step
    step_colors = {
        1: ('#FFD700', '#FFA500'),  # Gold - Träume
        2: ('#4ECDC4', '#44A08D'),  # Türkis - Realität
        3: ('#667eea', '#764ba2'),  # Lila - Strategie
    }
    color1, color2 = step_colors.get(step_num, ('#667eea', '#764ba2'))

    # Step-Icons
    step_icons = {1: '🎯', 2: '📍', 3: '🛤️'}
    icon = step_icons.get(step_num, '⭐')

    # Karteikarten-Header mit GROSSER Schrift
    dot1 = 'white' if step_num >= 1 else 'rgba(255,255,255,0.3)'
    dot2 = 'white' if step_num >= 2 else 'rgba(255,255,255,0.3)'
    dot3 = 'white' if step_num >= 3 else 'rgba(255,255,255,0.3)'

    st.markdown(f"""
<div style="max-width: 700px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, {color1} 0%, {color2} 100%); border-radius: 24px; padding: 2.5rem 2rem; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); margin-bottom: 1.5rem;">
<div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem;">
<div style="width: 12px; height: 12px; border-radius: 50%; background: {dot1};"></div>
<div style="width: 12px; height: 12px; border-radius: 50%; background: {dot2};"></div>
<div style="width: 12px; height: 12px; border-radius: 50%; background: {dot3};"></div>
</div>
<div style="font-size: 4rem; margin-bottom: 1rem;">{icon}</div>
<h1 style="font-size: 2.8rem; font-weight: 800; color: white; margin: 0 0 0.75rem 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); line-height: 1.2;">{question}</h1>
<p style="font-size: 1.2rem; color: rgba(255,255,255,0.9); margin: 0; line-height: 1.5;">{subtitle}</p>
</div>
</div>
    """, unsafe_allow_html=True)

    # Inspirierende Bilder
    render_inspiration_images(age_group, step_key)

    # Eingabefeld
    st.markdown(f"""
    <div style="max-width: 700px; margin: 1.5rem auto 0 auto;">
        <p style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; text-align: center;">
            {examples}
        </p>
    </div>
    """, unsafe_allow_html=True)

    return texts, placeholder


def render_new_goal_wizard(user_id: str, age_group: str):
    """Karteikarten-Wizard für neues Ziel (Step-by-Step)."""

    # Session State für Wizard
    if 'polarstern_wizard_step' not in st.session_state:
        st.session_state.polarstern_wizard_step = 0  # 0 = Übersicht, 1-3 = Steps, 4 = Ergebnis
    if 'polarstern_wizard_data' not in st.session_state:
        st.session_state.polarstern_wizard_data = {'goal': '', 'state': '', 'strategy': ''}

    wizard_step = st.session_state.polarstern_wizard_step
    wizard_data = st.session_state.polarstern_wizard_data

    # ============================================
    # STEP 0: Start-Button
    # ============================================
    if wizard_step == 0:
        st.markdown("""
        <div style="max-width: 700px; margin: 2rem auto; padding: 4px; border-radius: 24px;
                    background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #96E6A1 100%);
                    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);">
            <div style="background: rgba(26, 35, 126, 0.95); border-radius: 20px; padding: 2.5rem; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">✨</div>
                <h2 style="font-size: 1.8rem; font-weight: 700; color: white; margin: 0 0 1rem 0;">
                    Neues Ziel setzen
                </h2>
                <p style="font-size: 1.1rem; color: rgba(255,255,255,0.8); margin-bottom: 1.5rem; line-height: 1.6;">
                    In 3 einfachen Schritten formulierst du dein Ziel.<br>
                    Lass dich von den Bildern inspirieren!
                </p>
            </div>
        </div>
        """, unsafe_allow_html=True)

        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("🚀 Los geht's!", use_container_width=True, type="primary"):
                st.session_state.polarstern_wizard_step = 1
                st.session_state.polarstern_wizard_data = {'goal': '', 'state': '', 'strategy': ''}
                st.rerun()

    # ============================================
    # STEP 1: Wo will ich hin?
    # ============================================
    elif wizard_step == 1:
        texts, placeholder = render_step_card(1, age_group, wizard_data.get('goal', ''))

        col1, col2, col3 = st.columns([1, 4, 1])
        with col2:
            goal_input = st.text_area(
                "Dein Ziel",
                value=wizard_data.get('goal', ''),
                height=120,
                placeholder=placeholder,
                label_visibility="collapsed",
                key="wizard_goal_input"
            )

        # Navigation
        st.markdown("<div style='height: 1rem;'></div>", unsafe_allow_html=True)
        col_back, col_spacer, col_next = st.columns([1, 2, 1])

        with col_back:
            if st.button("⬅️ Zurück", use_container_width=True):
                st.session_state.polarstern_wizard_step = 0
                st.rerun()

        with col_next:
            if st.button("Weiter ➡️", use_container_width=True, type="primary"):
                if goal_input.strip():
                    st.session_state.polarstern_wizard_data['goal'] = goal_input.strip()
                    st.session_state.polarstern_wizard_step = 2
                    st.rerun()
                else:
                    st.error("Bitte gib dein Ziel ein!")

    # ============================================
    # STEP 2: Wo bin ich jetzt?
    # ============================================
    elif wizard_step == 2:
        texts, placeholder = render_step_card(2, age_group, wizard_data.get('state', ''))

        col1, col2, col3 = st.columns([1, 4, 1])
        with col2:
            state_input = st.text_area(
                "Aktueller Stand",
                value=wizard_data.get('state', ''),
                height=120,
                placeholder=placeholder,
                label_visibility="collapsed",
                key="wizard_state_input"
            )

        # Navigation
        st.markdown("<div style='height: 1rem;'></div>", unsafe_allow_html=True)
        col_back, col_spacer, col_next = st.columns([1, 2, 1])

        with col_back:
            if st.button("⬅️ Zurück", use_container_width=True):
                st.session_state.polarstern_wizard_data['state'] = state_input.strip()
                st.session_state.polarstern_wizard_step = 1
                st.rerun()

        with col_next:
            if st.button("Weiter ➡️", use_container_width=True, type="primary"):
                if state_input.strip():
                    st.session_state.polarstern_wizard_data['state'] = state_input.strip()
                    st.session_state.polarstern_wizard_step = 3
                    st.rerun()
                else:
                    st.error("Bitte beschreibe deinen aktuellen Stand!")

    # ============================================
    # STEP 3: Wie komme ich dahin?
    # ============================================
    elif wizard_step == 3:
        texts, placeholder = render_step_card(3, age_group, wizard_data.get('strategy', ''))

        col1, col2, col3 = st.columns([1, 4, 1])
        with col2:
            strategy_input = st.text_area(
                "Deine Strategie",
                value=wizard_data.get('strategy', ''),
                height=120,
                placeholder=placeholder,
                label_visibility="collapsed",
                key="wizard_strategy_input"
            )

        # Navigation
        st.markdown("<div style='height: 1rem;'></div>", unsafe_allow_html=True)
        col_back, col_spacer, col_next = st.columns([1, 2, 1])

        with col_back:
            if st.button("⬅️ Zurück", use_container_width=True):
                st.session_state.polarstern_wizard_data['strategy'] = strategy_input.strip()
                st.session_state.polarstern_wizard_step = 2
                st.rerun()

        with col_next:
            if st.button("✨ Fertig!", use_container_width=True, type="primary"):
                if strategy_input.strip():
                    st.session_state.polarstern_wizard_data['strategy'] = strategy_input.strip()
                    st.session_state.polarstern_wizard_step = 4
                    st.rerun()
                else:
                    st.error("Bitte beschreibe deine Strategie!")

    # ============================================
    # STEP 4: Zusammenfassung & Speichern
    # ============================================
    elif wizard_step == 4:
        goal = wizard_data.get('goal', '')
        state = wizard_data.get('state', '')
        strategy = wizard_data.get('strategy', '')

        st.markdown(f"""
<div style="max-width: 700px; margin: 0 auto;">
<div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); border-radius: 24px; padding: 2rem; text-align: center; margin-bottom: 1.5rem; box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);">
<div style="font-size: 4rem; margin-bottom: 0.5rem;">⭐</div>
<h1 style="font-size: 2rem; font-weight: 800; color: #1a237e; margin: 0;">Dein Ziel ist bereit!</h1>
</div>
<div style="background: white; border-radius: 20px; padding: 1.5rem; box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
<div style="background: linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; border-left: 5px solid #FFD700;">
<div style="font-size: 0.85rem; font-weight: 600; color: #F57F17; margin-bottom: 0.3rem;">🎯 Wo will ich hin?</div>
<div style="font-size: 1.1rem; color: #2c3e50; font-weight: 600;">{goal}</div>
</div>
<div style="background: linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; border-left: 5px solid #4ECDC4;">
<div style="font-size: 0.85rem; font-weight: 600; color: #00838F; margin-bottom: 0.3rem;">📍 Wo bin ich jetzt?</div>
<div style="font-size: 1rem; color: #2c3e50;">{state}</div>
</div>
<div style="background: linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 100%); border-radius: 12px; padding: 1rem; border-left: 5px solid #667eea;">
<div style="font-size: 0.85rem; font-weight: 600; color: #4527A0; margin-bottom: 0.3rem;">🛤️ Wie komme ich dahin?</div>
<div style="font-size: 1rem; color: #2c3e50;">{strategy}</div>
</div>
</div>
</div>
        """, unsafe_allow_html=True)

        # Buttons
        st.markdown("<div style='height: 1.5rem;'></div>", unsafe_allow_html=True)
        col_back, col_spacer, col_save = st.columns([1, 2, 1])

        with col_back:
            if st.button("⬅️ Bearbeiten", use_container_width=True):
                st.session_state.polarstern_wizard_step = 1
                st.rerun()

        with col_save:
            if st.button("⭐ Ziel speichern!", use_container_width=True, type="primary"):
                # Ziel in DB speichern
                create_goal(user_id, goal, state, strategy)

                # Wizard zurücksetzen
                st.session_state.polarstern_wizard_step = 0
                st.session_state.polarstern_wizard_data = {'goal': '', 'state': '', 'strategy': ''}

                st.balloons()
                st.toast("⭐ Neues Ziel gesetzt! +10 XP", icon="🎯")
                st.rerun()


# ============================================
# RENDERING FUNCTIONS
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

    current_state_html = format_text_for_display(goal['current_state'])
    strategy_html = format_text_for_display(goal['strategy'])

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

        if st.session_state.get(f"editing_{goal_id}", False):
            render_edit_form(goal)

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

    goals_by_category = {}
    for goal in goals:
        cat = goal.get('category', 'other')
        if cat not in goals_by_category:
            goals_by_category[cat] = []
        goals_by_category[cat].append(goal)

    category_order = ['family', 'school', 'social', 'personal', 'skill', 'career', 'other']

    for cat_key in category_order:
        if cat_key not in goals_by_category:
            continue

        cat_goals = goals_by_category[cat_key]
        cat_info = CATEGORIES.get(cat_key, CATEGORIES['other'])

        st.markdown(f"""
<div style="max-width: 700px; margin: 1.5rem auto 0.5rem auto; padding: 3px; border-radius: 16px; background: linear-gradient(135deg, {cat_info['color']} 0%, #FFD700 100%);">
<div style="background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%); border-radius: 13px; padding: 0.6rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
<span style="font-size: 1.5rem;">{cat_info['icon']}</span>
<span style="font-size: 1.1rem; font-weight: 700; color: white;">{cat_info['label']}</span>
<span style="background: rgba(255,255,255,0.2); color: white; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.8rem; margin-left: auto;">{len(cat_goals)} Ziel{"e" if len(cat_goals) > 1 else ""}</span>
</div>
</div>
        """, unsafe_allow_html=True)

        for goal in cat_goals:
            render_goal_card(goal, show_category_badge=False)


def render_achieved_section(user_id: str):
    """Rendert erreichte Ziele."""
    achieved = get_achieved_goals(user_id)

    if not achieved:
        return

    st.markdown(f"""
<div style="max-width: 700px; margin: 2rem auto 1.5rem auto; padding: 4px; border-radius: 24px; background: linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #96E6A1 100%);">
<div style="background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%); border-radius: 20px; padding: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 1rem;">
<span style="font-size: 2.5rem;">🏆</span>
<span style="font-size: 1.3rem; font-weight: 700; color: white;">Deine Erfolge!</span>
<span style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #1a237e; padding: 0.4rem 0.8rem; border-radius: 30px; font-weight: 700; font-size: 1rem;">{len(achieved)} geschafft</span>
</div>
</div>
    """, unsafe_allow_html=True)

    achieved_by_category = {}
    for goal in achieved:
        cat = goal.get('category', 'other')
        if cat not in achieved_by_category:
            achieved_by_category[cat] = []
        achieved_by_category[cat].append(goal)

    category_order = ['family', 'school', 'social', 'personal', 'skill', 'career', 'other']

    for cat_key in category_order:
        if cat_key not in achieved_by_category:
            continue

        cat_goals = achieved_by_category[cat_key]
        cat_info = CATEGORIES.get(cat_key, CATEGORIES['other'])

        st.markdown(f"""
<div style="max-width: 700px; margin: 1.5rem auto 0.5rem auto; padding: 3px; border-radius: 16px; background: linear-gradient(135deg, {cat_info['color']} 0%, #4CAF50 100%);">
<div style="background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); border-radius: 13px; padding: 0.6rem 1rem; display: flex; align-items: center; gap: 0.5rem;">
<span style="font-size: 1.5rem;">{cat_info['icon']}</span>
<span style="font-size: 1.1rem; font-weight: 700; color: white;">{cat_info['label']}</span>
<span style="background: rgba(255,255,255,0.2); color: white; padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.8rem; margin-left: auto;">✅ {len(cat_goals)} geschafft</span>
</div>
</div>
        """, unsafe_allow_html=True)

        for goal in cat_goals:
            color = cat_info['color']
            current_state_html = format_text_for_display(goal['current_state'])
            strategy_html = format_text_for_display(goal['strategy'])
            reflection_html = format_text_for_display(goal.get('achievement_reflection', ''))
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


# ============================================
# MAIN WIDGET
# ============================================

def render_polarstern_widget(user_id: str = "default_user", age_group: str = "grundschule"):
    """
    Rendert das komplette Polarstern-Widget mit Karteikarten-Flow.

    Args:
        user_id: Die User-ID für die Datenbank
        age_group: Altersstufe (grundschule, unterstufe, mittelstufe)
    """
    # Hintergrund-Styling
    st.markdown("""
    <style>
    .stApp { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important; }
    .stButton > button { border-radius: 12px !important; font-weight: 600 !important; }
    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
        color: #2c3e50 !important;
        border: none !important;
    }
    .stTextArea textarea {
        border-radius: 12px !important;
        border: 2px solid #e0e0e0 !important;
        font-size: 1.1rem !important;
    }
    .stTextArea textarea:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2) !important;
    }
    </style>
    """, unsafe_allow_html=True)

    # Normalisiere age_group
    if age_group not in ['grundschule', 'unterstufe', 'mittelstufe']:
        age_group = 'grundschule'

    # Prüfe ob Wizard aktiv ist (Step 1-4)
    wizard_active = st.session_state.get('polarstern_wizard_step', 0) > 0

    # Header und Ziel-Liste nur anzeigen wenn Wizard NICHT aktiv
    if not wizard_active:
        stats = get_goal_stats(user_id)
        render_header(stats)
        render_goals_grouped(user_id)

    # Wizard immer rendern (zeigt je nach Step unterschiedliche Inhalte)
    render_new_goal_wizard(user_id, age_group)

    # Erfolge nur anzeigen wenn Wizard NICHT aktiv
    if not wizard_active:
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
    render_polarstern_widget("test_user", "grundschule")
