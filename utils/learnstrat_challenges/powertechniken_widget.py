"""
🧠 Powertechniken Challenge Widget
===================================

Challenge 1: Die 7 Powertechniken
Spielerisches Kennenlernen wissenschaftlich fundierter Lerntechniken.

Ablauf:
1. Technik kennenlernen (Erklärung + Fun Fact)
2. Mini-Übung ausprobieren
3. Bewertung abgeben (1-5 Sterne)
4. Nächste Technik

Nach allen 7: Top 3 auswählen → Zertifikat!
"""

import streamlit as st
from datetime import datetime
from typing import Dict, List, Optional, Any
import json

# Lokale Imports
from .challenge_content import (
    POWERTECHNIKEN,
    CHALLENGE_XP,
    LEARNSTRAT_BADGES,
    get_technique_content,
    get_all_techniques_for_age,
    get_technique_names,
    get_technique_icons,
)
from .certificate_generator import (
    generate_powertechniken_certificate,
    image_to_bytes,
)

# ============================================
# SESSION STATE KEYS
# ============================================

STATE_KEYS = {
    "current_technique": "pwt_current_technique",
    "completed_techniques": "pwt_completed_techniques",
    "technique_ratings": "pwt_ratings",
    "phase": "pwt_phase",  # intro, learn, exercise, rate, complete, top3, certificate
    "top3_selection": "pwt_top3",
    "challenge_started": "pwt_started",
    "timer_active": "pwt_timer_active",
    "timer_start": "pwt_timer_start",
}

# ============================================
# DATABASE FUNCTIONS
# ============================================

def init_learnstrat_tables(conn):
    """Initialisiert die Lernstrategie-Tabellen."""
    c = conn.cursor()
    
    # User Learning Preferences (Top 3)
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_learning_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            technique_1 TEXT,
            technique_2 TEXT,
            technique_3 TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Lernstrategie-Progress
    c.execute('''
        CREATE TABLE IF NOT EXISTS learnstrat_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            challenge_id TEXT NOT NULL,
            technique_id TEXT,
            completed BOOLEAN DEFAULT 0,
            rating INTEGER,
            reflection TEXT,
            xp_earned INTEGER DEFAULT 0,
            completed_at TIMESTAMP
        )
    ''')
    
    # Index für schnelle Abfragen
    c.execute('CREATE INDEX IF NOT EXISTS idx_learnstrat_user ON learnstrat_progress(user_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_learnstrat_challenge ON learnstrat_progress(challenge_id)')
    
    conn.commit()

def save_technique_progress(conn, user_id: str, technique_id: str, rating: int, xp: int):
    """Speichert den Fortschritt für eine Technik."""
    c = conn.cursor()
    
    # Prüfen ob schon vorhanden
    c.execute('''
        SELECT id FROM learnstrat_progress 
        WHERE user_id = ? AND challenge_id = 'powertechniken' AND technique_id = ?
    ''', (user_id, technique_id))
    
    existing = c.fetchone()
    
    if existing:
        c.execute('''
            UPDATE learnstrat_progress 
            SET rating = ?, xp_earned = ?, completed = 1, completed_at = ?
            WHERE id = ?
        ''', (rating, xp, datetime.now().isoformat(), existing[0]))
    else:
        c.execute('''
            INSERT INTO learnstrat_progress 
            (user_id, challenge_id, technique_id, rating, xp_earned, completed, completed_at)
            VALUES (?, 'powertechniken', ?, ?, ?, 1, ?)
        ''', (user_id, technique_id, rating, xp, datetime.now().isoformat()))
    
    conn.commit()

def save_top3_preferences(conn, user_id: str, top3: List[str]):
    """Speichert die Top 3 Lerntechniken des Users."""
    c = conn.cursor()
    
    # Prüfen ob schon vorhanden
    c.execute('SELECT id FROM user_learning_preferences WHERE user_id = ?', (user_id,))
    existing = c.fetchone()
    
    tech1 = top3[0] if len(top3) > 0 else None
    tech2 = top3[1] if len(top3) > 1 else None
    tech3 = top3[2] if len(top3) > 2 else None
    
    if existing:
        c.execute('''
            UPDATE user_learning_preferences 
            SET technique_1 = ?, technique_2 = ?, technique_3 = ?, updated_at = ?
            WHERE id = ?
        ''', (tech1, tech2, tech3, datetime.now().isoformat(), existing[0]))
    else:
        c.execute('''
            INSERT INTO user_learning_preferences 
            (user_id, technique_1, technique_2, technique_3)
            VALUES (?, ?, ?, ?)
        ''', (user_id, tech1, tech2, tech3))
    
    conn.commit()

def get_user_learnstrat_progress(conn, user_id: str, challenge_id: str = "powertechniken") -> List[Dict]:
    """Holt den Lernstrategie-Fortschritt eines Users."""
    c = conn.cursor()
    c.row_factory = lambda cursor, row: {
        "technique_id": row[0],
        "rating": row[1],
        "xp_earned": row[2],
        "completed_at": row[3]
    }
    
    c.execute('''
        SELECT technique_id, rating, xp_earned, completed_at
        FROM learnstrat_progress
        WHERE user_id = ? AND challenge_id = ? AND completed = 1
        ORDER BY completed_at
    ''', (user_id, challenge_id))
    
    return c.fetchall()

def get_user_top3(conn, user_id: str) -> Optional[List[str]]:
    """Holt die Top 3 Lerntechniken eines Users."""
    c = conn.cursor()
    c.execute('''
        SELECT technique_1, technique_2, technique_3 
        FROM user_learning_preferences 
        WHERE user_id = ?
    ''', (user_id,))
    
    row = c.fetchone()
    if row:
        return [t for t in row if t]
    return None

# ============================================
# UI COMPONENTS
# ============================================

def render_progress_bar(completed: int, total: int = 7):
    """Zeigt den Fortschrittsbalken der Challenge."""
    progress = completed / total
    
    st.markdown(f"""
    <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="font-weight: 600; color: #4a5568;">Fortschritt</span>
            <span style="color: #667eea; font-weight: bold;">{completed}/{total} Techniken</span>
        </div>
        <div style="background: #e2e8f0; border-radius: 10px; height: 12px; overflow: hidden;">
            <div style="background: linear-gradient(90deg, #667eea, #764ba2); 
                        width: {progress * 100}%; height: 100%; border-radius: 10px;
                        transition: width 0.5s ease;"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_technique_card(technique: Dict, phase: str):
    """Zeigt eine Technik-Karte mit dem aktuellen Inhalt."""
    icon = technique.get("icon", "📚")
    name = technique.get("name", "Lerntechnik")
    effect = technique.get("effect_note", "")
    
    # Header mit Icon und Name
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 3em;">{icon}</span>
            <div>
                <h2 style="margin: 0; color: white;">{name}</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9em;">{effect}</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_intro_phase(technique: Dict):
    """Zeigt die Einführungsphase einer Technik."""
    intro = technique.get("intro", "")
    core_idea = technique.get("core_idea", "")
    fun_fact = technique.get("fun_fact", "")
    
    # Kernidee
    st.markdown(f"""
    <div style="background: #f0f9ff; border-left: 4px solid #667eea; 
                padding: 15px 20px; border-radius: 0 10px 10px 0; margin-bottom: 20px;">
        <strong style="color: #667eea;">💡 Kernidee:</strong>
        <p style="margin: 10px 0 0 0; font-size: 1.1em;">{core_idea}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Erklärung
    st.markdown(f"""
    <div style="background: white; border: 1px solid #e2e8f0; 
                padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <p style="line-height: 1.7; margin: 0;">{intro}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Fun Fact
    if fun_fact:
        st.markdown(f"""
        <div style="background: #fffbeb; border: 1px solid #fcd34d; 
                    padding: 15px 20px; border-radius: 10px; margin-bottom: 20px;">
            <strong style="color: #d97706;">🤓 Wusstest du?</strong>
            <p style="margin: 10px 0 0 0;">{fun_fact}</p>
        </div>
        """, unsafe_allow_html=True)

def render_exercise_phase(technique: Dict):
    """Zeigt die Übungsphase einer Technik."""
    exercise = technique.get("exercise", {})
    title = exercise.get("title", "Übung")
    instruction = exercise.get("instruction", "")
    timer_needed = exercise.get("timer_needed", False)
    duration = technique.get("duration")
    
    st.markdown(f"""
    <div style="background: #f0fdf4; border: 2px solid #22c55e; 
                padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="color: #166534; margin: 0 0 15px 0;">🎯 {title}</h3>
        <p style="line-height: 1.7; margin: 0;">{instruction}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Timer für Pomodoro
    if timer_needed and duration:
        col1, col2 = st.columns([2, 1])
        with col1:
            st.info(f"⏱️ Empfohlene Zeit: **{duration} Minuten**")
        with col2:
            if st.button("▶️ Timer starten", use_container_width=True):
                st.session_state[STATE_KEYS["timer_active"]] = True
                st.session_state[STATE_KEYS["timer_start"]] = datetime.now()
    
    # Beispiele anzeigen wenn vorhanden
    examples = exercise.get("example") or exercise.get("test_words")
    if examples and isinstance(examples, list):
        st.markdown("**Beispiele:**")
        for ex in examples:
            st.markdown(f"- {ex}")

def render_rating_phase(technique: Dict):
    """Zeigt die Bewertungsphase einer Technik."""
    name = technique.get("name", "diese Technik")
    
    st.markdown(f"""
    <div style="background: #faf5ff; border: 2px solid #a855f7; 
                padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="color: #7e22ce; margin: 0 0 15px 0;">⭐ Wie hat dir {name} gefallen?</h3>
        <p style="margin: 0;">Bewerte, wie gut diese Technik für DICH funktioniert hat.</p>
    </div>
    """, unsafe_allow_html=True)

def render_star_rating(key: str) -> int:
    """Zeigt ein interaktives Sterne-Rating."""
    cols = st.columns(5)
    rating = st.session_state.get(f"rating_{key}", 0)
    
    for i, col in enumerate(cols, 1):
        with col:
            star = "⭐" if i <= rating else "☆"
            if st.button(star, key=f"star_{key}_{i}", use_container_width=True):
                st.session_state[f"rating_{key}"] = i
                st.rerun()
    
    labels = ["", "😕 Nicht mein Ding", "🤔 Geht so", "😊 Ganz okay", "😃 Richtig gut!", "🤩 Perfekt für mich!"]
    if rating > 0:
        st.markdown(f"<p style='text-align: center; font-size: 1.1em;'>{labels[rating]}</p>", unsafe_allow_html=True)
    
    return rating

def render_xp_animation(xp: int, message: str = "XP verdient!"):
    """Zeigt eine XP-Animation."""
    st.markdown(f"""
    <div style="text-align: center; padding: 20px; animation: pulse 0.5s ease;">
        <span style="font-size: 2.5em; color: #fbbf24;">+{xp} XP</span>
        <p style="color: #666; margin-top: 5px;">{message}</p>
    </div>
    <style>
    @keyframes pulse {{
        0% {{ transform: scale(1); }}
        50% {{ transform: scale(1.1); }}
        100% {{ transform: scale(1); }}
    }}
    </style>
    """, unsafe_allow_html=True)

def render_top3_selection(techniques: List[Dict], ratings: Dict[str, int]):
    """Zeigt die Top 3 Auswahl-UI."""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: white;">🏆 Wähle deine Top 3!</h2>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">
            Welche 3 Techniken haben für DICH am besten funktioniert?
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sortiere nach Rating (absteigend)
    sorted_techs = sorted(techniques, key=lambda t: ratings.get(t["key"], 0), reverse=True)
    
    selected = st.session_state.get(STATE_KEYS["top3_selection"], [])
    
    for tech in sorted_techs:
        key = tech["key"]
        icon = tech["icon"]
        name = tech["name"]
        rating = ratings.get(key, 0)
        stars = "⭐" * rating + "☆" * (5 - rating)
        
        is_selected = key in selected
        rank = selected.index(key) + 1 if is_selected else None
        
        bg_color = "#f0fdf4" if is_selected else "#ffffff"
        border_color = "#22c55e" if is_selected else "#e2e8f0"
        
        col1, col2 = st.columns([5, 1])
        
        with col1:
            st.markdown(f"""
            <div style="background: {bg_color}; border: 2px solid {border_color}; 
                        padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 1.3em;">{icon} {name}</span>
                        {f'<span style="background: #22c55e; color: white; padding: 2px 10px; border-radius: 20px; margin-left: 10px;">#{rank}</span>' if rank else ''}
                    </div>
                    <span style="color: #666;">{stars}</span>
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            if is_selected:
                if st.button("❌", key=f"remove_{key}", help="Entfernen"):
                    selected.remove(key)
                    st.session_state[STATE_KEYS["top3_selection"]] = selected
                    st.rerun()
            else:
                if len(selected) < 3:
                    if st.button("➕", key=f"add_{key}", help="Auswählen"):
                        selected.append(key)
                        st.session_state[STATE_KEYS["top3_selection"]] = selected
                        st.rerun()
    
    return selected

def render_certificate_preview(user_name: str, top3: List[str], total_xp: int):
    """Zeigt eine Vorschau des Zertifikats als PIL-generiertes Bild."""
    # Generiere das Zertifikat als Bild
    cert_image = generate_powertechniken_certificate(
        user_name=user_name,
        top3=top3,
        total_xp=total_xp
    )

    # Konvertiere zu Bytes und zeige in Streamlit
    cert_bytes = image_to_bytes(cert_image)
    st.image(cert_bytes, use_container_width=True)

# ============================================
# MAIN WIDGET
# ============================================

def render_powertechniken_challenge(user: Dict, conn, xp_callback=None):
    """
    Rendert die komplette Powertechniken-Challenge.
    
    Args:
        user: User-Dict mit user_id, display_name, age_group, etc.
        conn: SQLite Connection
        xp_callback: Optional callback(user_id, xp, reason) um XP gutzuschreiben
    """
    user_id = user.get("user_id")
    user_name = user.get("display_name", "Lernender")
    age_group = user.get("age_group", "unterstufe")
    
    # Tabellen initialisieren
    init_learnstrat_tables(conn)
    
    # Lade Progress aus DB
    db_progress = get_user_learnstrat_progress(conn, user_id)
    completed_keys = [p["technique_id"] for p in db_progress]
    db_ratings = {p["technique_id"]: p["rating"] for p in db_progress}
    
    # Session State initialisieren
    if STATE_KEYS["completed_techniques"] not in st.session_state:
        st.session_state[STATE_KEYS["completed_techniques"]] = completed_keys
    if STATE_KEYS["technique_ratings"] not in st.session_state:
        st.session_state[STATE_KEYS["technique_ratings"]] = db_ratings
    if STATE_KEYS["current_technique"] not in st.session_state:
        st.session_state[STATE_KEYS["current_technique"]] = 1
    if STATE_KEYS["phase"] not in st.session_state:
        # Wenn alle fertig → Top3, sonst intro
        if len(completed_keys) >= 7:
            existing_top3 = get_user_top3(conn, user_id)
            if existing_top3:
                st.session_state[STATE_KEYS["phase"]] = "certificate"
            else:
                st.session_state[STATE_KEYS["phase"]] = "top3"
        else:
            st.session_state[STATE_KEYS["phase"]] = "intro"
    
    # Hole alle Techniken für diese Altersstufe
    techniques = get_all_techniques_for_age(age_group)
    total_techniques = len(techniques)
    completed = st.session_state[STATE_KEYS["completed_techniques"]]
    ratings = st.session_state[STATE_KEYS["technique_ratings"]]
    phase = st.session_state[STATE_KEYS["phase"]]
    
    # Header
    st.markdown("""
    <h1 style="text-align: center; margin-bottom: 5px;">🧠 Die 7 Powertechniken</h1>
    <p style="text-align: center; color: #666; margin-bottom: 20px;">
        Entdecke wissenschaftlich fundierte Lerntechniken und finde DEINE Top 3!
    </p>
    """, unsafe_allow_html=True)
    
    # Progress Bar
    render_progress_bar(len(completed), total_techniques)
    
    # ─────────────────────────────────────────
    # PHASE: TOP 3 AUSWAHL
    # ─────────────────────────────────────────
    if phase == "top3":
        selected = render_top3_selection(techniques, ratings)
        
        st.markdown("---")
        
        if len(selected) == 3:
            if st.button("🏆 Meine Top 3 bestätigen!", type="primary", use_container_width=True):
                # Speichern
                save_top3_preferences(conn, user_id, selected)
                
                # XP vergeben
                xp = CHALLENGE_XP["top3_selected"]
                if xp_callback:
                    xp_callback(user_id, xp, "Top 3 Lerntechniken ausgewählt")
                
                st.session_state[STATE_KEYS["top3_selection"]] = selected
                st.session_state[STATE_KEYS["phase"]] = "certificate"
                st.balloons()
                st.rerun()
        else:
            st.info(f"Wähle noch {3 - len(selected)} Technik(en) aus!")
        
        return
    
    # ─────────────────────────────────────────
    # PHASE: ZERTIFIKAT
    # ─────────────────────────────────────────
    if phase == "certificate":
        top3 = get_user_top3(conn, user_id) or st.session_state.get(STATE_KEYS["top3_selection"], [])
        total_xp = sum(p.get("xp_earned", 0) for p in db_progress)
        total_xp += CHALLENGE_XP["top3_selected"] + CHALLENGE_XP["all_techniques_done"]
        
        st.success("🎉 Herzlichen Glückwunsch! Du hast alle Powertechniken gemeistert!")
        
        render_certificate_preview(user_name, top3, total_xp)
        
        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🖨️ Zertifikat drucken", use_container_width=True, key="pwt_print_cert"):
                st.info("Druckfunktion wird in Kürze verfügbar!")
        with col2:
            if st.button("🔄 Challenge wiederholen", use_container_width=True, key="pwt_restart"):
                # Reset Session State
                for key in STATE_KEYS.values():
                    if key in st.session_state:
                        del st.session_state[key]
                st.rerun()
        
        return
    
    # ─────────────────────────────────────────
    # NORMALE CHALLENGE-PHASEN
    # ─────────────────────────────────────────
    current_idx = st.session_state[STATE_KEYS["current_technique"]]
    
    # Finde nächste nicht abgeschlossene Technik
    current_tech = None
    for tech in techniques:
        if tech["key"] not in completed:
            current_tech = tech
            break
    
    if not current_tech:
        # Alle fertig → zu Top 3
        st.session_state[STATE_KEYS["phase"]] = "top3"
        st.rerun()
        return
    
    # Technik-Karte
    render_technique_card(current_tech, phase)
    
    # ─────────────────────────────────────────
    # PHASE: INTRO (Erklärung)
    # ─────────────────────────────────────────
    if phase == "intro":
        render_intro_phase(current_tech)
        
        st.markdown("---")
        if st.button("✅ Verstanden! Weiter zur Übung →", type="primary", use_container_width=True):
            st.session_state[STATE_KEYS["phase"]] = "exercise"
            st.rerun()
    
    # ─────────────────────────────────────────
    # PHASE: EXERCISE (Übung)
    # ─────────────────────────────────────────
    elif phase == "exercise":
        render_exercise_phase(current_tech)
        
        st.markdown("---")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Zurück zur Erklärung", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "intro"
                st.rerun()
        with col2:
            if st.button("✅ Übung gemacht! Weiter →", type="primary", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "rate"
                st.rerun()
    
    # ─────────────────────────────────────────
    # PHASE: RATE (Bewertung)
    # ─────────────────────────────────────────
    elif phase == "rate":
        render_rating_phase(current_tech)
        
        rating = render_star_rating(current_tech["key"])
        
        st.markdown("---")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Zurück zur Übung", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "exercise"
                st.rerun()
        with col2:
            if rating > 0:
                if st.button("✅ Bewertung abgeben!", type="primary", use_container_width=True):
                    # XP berechnen
                    xp = CHALLENGE_XP["technique_discovered"] + CHALLENGE_XP["exercise_completed"] + CHALLENGE_XP["reflection_done"]
                    
                    # In DB speichern
                    save_technique_progress(conn, user_id, current_tech["key"], rating, xp)
                    
                    # Session State updaten
                    completed.append(current_tech["key"])
                    ratings[current_tech["key"]] = rating
                    st.session_state[STATE_KEYS["completed_techniques"]] = completed
                    st.session_state[STATE_KEYS["technique_ratings"]] = ratings
                    
                    # XP Callback
                    if xp_callback:
                        xp_callback(user_id, xp, f"Technik '{current_tech['name']}' abgeschlossen")
                    
                    # Zur Completion-Phase
                    st.session_state[STATE_KEYS["phase"]] = "complete"
                    st.session_state["last_xp"] = xp
                    st.rerun()
            else:
                st.button("✅ Bewertung abgeben!", disabled=True, use_container_width=True)
                st.caption("Bitte gib eine Bewertung ab (1-5 Sterne)")
    
    # ─────────────────────────────────────────
    # PHASE: COMPLETE (Abschluss einer Technik)
    # ─────────────────────────────────────────
    elif phase == "complete":
        xp = st.session_state.get("last_xp", 30)
        render_xp_animation(xp, f"für {current_tech['name']}!")
        
        remaining = total_techniques - len(completed)
        
        if remaining > 0:
            st.success(f"Super! Noch {remaining} Technik(en) bis zu deinem Zertifikat! 🎯")
            
            if st.button("➡️ Nächste Technik entdecken!", type="primary", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "intro"
                st.rerun()
        else:
            # Bonus XP für alle Techniken
            bonus_xp = CHALLENGE_XP["all_techniques_done"]
            if xp_callback:
                xp_callback(user_id, bonus_xp, "Alle 7 Powertechniken abgeschlossen!")
            
            st.balloons()
            render_xp_animation(bonus_xp, "Bonus für alle 7 Techniken!")
            
            if st.button("🏆 Jetzt deine Top 3 wählen!", type="primary", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "top3"
                st.rerun()
    
    # ─────────────────────────────────────────
    # NAVIGATION SIDEBAR (Optional)
    # ─────────────────────────────────────────
    with st.sidebar:
        st.markdown("### 📚 Dein Fortschritt")
        
        for tech in techniques:
            key = tech["key"]
            icon = tech["icon"]
            name = tech["name"]
            is_done = key in completed
            rating = ratings.get(key, 0)
            
            if is_done:
                stars = "⭐" * rating
                st.markdown(f"✅ {icon} {name} {stars}")
            else:
                st.markdown(f"⬜ {icon} {name}")
        
        st.markdown("---")
        st.caption(f"Altersstufe: {age_group.title()}")


# ============================================
# STANDALONE TEST
# ============================================

if __name__ == "__main__":
    # Für Standalone-Tests
    import sqlite3
    
    st.set_page_config(page_title="Powertechniken Test", page_icon="🧠", layout="wide")
    
    # Mock User
    test_user = {
        "user_id": "test123",
        "display_name": "Test-Schüler",
        "age_group": "mittelstufe",
        "level": 1,
        "xp_total": 0,
    }
    
    # Temp DB
    conn = sqlite3.connect(":memory:")
    
    # Render
    render_powertechniken_challenge(test_user, conn)
