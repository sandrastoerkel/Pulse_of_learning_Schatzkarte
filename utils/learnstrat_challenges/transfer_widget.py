"""
🚀 Transfer-Challenge Widget
============================

Challenge 2: Das Geheimnis der Überflieger
Interaktives Streamlit-Widget für Transfer-Strategien.

Ablauf:
1. Phase 1: Das Transfer-Geheimnis entdecken
2. Phase 2: Near Transfer üben
3. Phase 3: Far Transfer wagen
4. Phase 4: Brückenprinzipien meistern
5. Finale: Transfer-Check → Zertifikat!
"""

import streamlit as st
from datetime import datetime
from typing import Dict, List, Optional, Any

# Lokale Imports
from .transfer_content import (
    TRANSFER_XP,
    TRANSFER_BADGES,
    TRANSFER_CERTIFICATE,
    TRANSFER_EFFECT_SIZE,
    get_transfer_content_for_age,
    get_phase_content,
    PHASE_1_CONTENT,
    PHASE_2_CONTENT,
    PHASE_3_CONTENT,
    PHASE_4_CONTENT,
    FINALE_CONTENT,
)
from .certificate_generator import (
    generate_transfer_certificate,
    image_to_bytes,
)

# ============================================
# SESSION STATE KEYS
# ============================================

STATE_KEYS = {
    "current_phase": "transfer_current_phase",
    "completed_phases": "transfer_completed_phases",
    "phase_ratings": "transfer_ratings",
    "user_responses": "transfer_responses",
    "total_xp": "transfer_total_xp",
    "challenge_complete": "transfer_complete",
}

# ============================================
# DATABASE FUNCTIONS
# ============================================

def save_transfer_progress(conn, user_id: str, phase_id: str, xp: int, response: str = ""):
    """Speichert den Fortschritt für eine Transfer-Phase."""
    c = conn.cursor()
    
    # Prüfen ob schon vorhanden
    c.execute('''
        SELECT id FROM learnstrat_progress 
        WHERE user_id = ? AND challenge_id = 'transfer' AND technique_id = ?
    ''', (user_id, phase_id))
    
    existing = c.fetchone()
    
    if existing:
        c.execute('''
            UPDATE learnstrat_progress 
            SET xp_earned = ?, reflection = ?, completed = 1, completed_at = ?
            WHERE id = ?
        ''', (xp, response, datetime.now().isoformat(), existing[0]))
    else:
        c.execute('''
            INSERT INTO learnstrat_progress 
            (user_id, challenge_id, technique_id, xp_earned, reflection, completed, completed_at)
            VALUES (?, 'transfer', ?, ?, ?, 1, ?)
        ''', (user_id, phase_id, xp, response, datetime.now().isoformat()))
    
    conn.commit()

def get_transfer_progress(conn, user_id: str) -> List[Dict]:
    """Holt den Transfer-Fortschritt eines Users."""
    c = conn.cursor()
    
    c.execute('''
        SELECT technique_id, xp_earned, reflection, completed_at
        FROM learnstrat_progress
        WHERE user_id = ? AND challenge_id = 'transfer' AND completed = 1
        ORDER BY completed_at
    ''', (user_id,))
    
    results = []
    for row in c.fetchall():
        results.append({
            "phase_id": row[0],
            "xp_earned": row[1],
            "response": row[2],
            "completed_at": row[3],
        })
    
    return results

# ============================================
# UI COMPONENTS
# ============================================

def render_transfer_header():
    """Zeigt den Challenge-Header."""
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;
                text-align: center;">
        <h1 style="margin: 0; color: white;">🚀 Das Geheimnis der Überflieger</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 1.1em;">
            Transfer-Strategien: Effektstärke d={TRANSFER_EFFECT_SIZE} – eine der höchsten überhaupt!
        </p>
    </div>
    """, unsafe_allow_html=True)

def render_phase_progress(current_phase: int, completed_phases: List[str]):
    """Zeigt den Fortschritt durch die Phasen."""
    phases = [
        ("phase_1", "🔮", "Geheimnis"),
        ("phase_2", "🎯", "Near"),
        ("phase_3", "🚀", "Far"),
        ("phase_4", "🌉", "Brücken"),
        ("finale", "🏆", "Check"),
    ]
    
    cols = st.columns(5)
    
    for i, (phase_id, icon, label) in enumerate(phases):
        is_complete = phase_id in completed_phases
        is_current = (i + 1) == current_phase
        
        with cols[i]:
            if is_complete:
                bg = "#10b981"
                border = "#059669"
                text_color = "white"
            elif is_current:
                bg = "#f5576c"
                border = "#ec4899"
                text_color = "white"
            else:
                bg = "#e5e7eb"
                border = "#d1d5db"
                text_color = "#6b7280"
            
            st.markdown(f"""
            <div style="background: {bg}; border: 3px solid {border}; 
                        padding: 10px; border-radius: 10px; text-align: center;">
                <div style="font-size: 1.5em;">{icon}</div>
                <div style="font-size: 0.75em; color: {text_color}; font-weight: 600;">{label}</div>
                {'✓' if is_complete else ''}
            </div>
            """, unsafe_allow_html=True)

def render_phase_card(phase_data: Dict, phase_num: int):
    """Zeigt die Phasen-Karte mit Titel und Icon."""
    icon = phase_data.get("icon", "📚")
    title = phase_data.get("title", f"Phase {phase_num}")
    core = phase_data.get("core_concept", "")
    
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 3em;">{icon}</span>
            <div>
                <h2 style="margin: 0; color: white;">Phase {phase_num}: {title}</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">{core}</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_intro_section(content: Dict):
    """Zeigt die Intro-Sektion einer Phase."""
    intro = content.get("intro", "")
    story = content.get("story", "")
    
    # Intro
    st.markdown(f"""
    <div style="background: white; border: 1px solid #e5e7eb; 
                padding: 20px; border-radius: 10px; margin-bottom: 15px;">
        <div style="line-height: 1.8; white-space: pre-line;">{intro}</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Story (wenn vorhanden)
    if story:
        with st.expander("📖 Geschichte", expanded=False):
            st.markdown(story)

def render_exercise_section(content: Dict, phase_key: str):
    """Zeigt die Übungs-Sektion einer Phase."""
    exercise = content.get("exercise", {})
    
    if not exercise:
        return None
    
    title = exercise.get("title", "Übung")
    instruction = exercise.get("instruction", "")
    
    st.markdown(f"""
    <div style="background: #f0fdf4; border: 2px solid #22c55e; 
                padding: 20px; border-radius: 15px; margin: 20px 0;">
        <h3 style="color: #166534; margin: 0 0 15px 0;">🎯 {title}</h3>
        <p style="margin: 0;">{instruction}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Beispiele anzeigen
    examples = exercise.get("examples", [])
    scenarios = exercise.get("scenarios", [])
    
    if examples:
        st.markdown("**Beispiele:**")
        for ex in examples:
            if isinstance(ex, str):
                st.markdown(f"- {ex}")
            elif isinstance(ex, dict):
                st.markdown(f"- **{ex.get('concept_a', '')}** → **{ex.get('concept_b', '')}**: {ex.get('principle', '')}")
    
    if scenarios:
        for i, scenario in enumerate(scenarios):
            with st.expander(f"📋 Szenario {i+1}: {scenario.get('name', scenario.get('situation_1', '')[:30])}...", expanded=i==0):
                if "level_1" in scenario:
                    st.markdown(f"**Level 1:** {scenario['level_1']}")
                    st.markdown(f"**Level 2:** {scenario['level_2']}")
                elif "situation_1" in scenario:
                    st.markdown(f"**Situation 1:** {scenario['situation_1']}")
                    st.markdown(f"**Situation 2:** {scenario['situation_2']}")
                    if "situation_3" in scenario:
                        st.markdown(f"**Situation 3:** {scenario['situation_3']}")
                elif "thing_a" in scenario:
                    st.markdown(f"{scenario.get('icon_a', '')} **{scenario['thing_a']}**")
                    st.markdown(f"{scenario.get('icon_b', '')} **{scenario['thing_b']}**")
                
                if "hidden_principle" in scenario:
                    if st.button(f"💡 Prinzip zeigen", key=f"show_principle_{phase_key}_{i}"):
                        st.success(f"**Das Prinzip:** {scenario['hidden_principle']}")
                elif "principle" in scenario:
                    st.info(f"**Prinzip:** {scenario['principle']}")
    
    # User-Input für Reflexion
    prompt = exercise.get("prompt", exercise.get("challenge", ""))
    if prompt:
        st.markdown("---")
        st.markdown(f"**Deine Antwort:**")
        user_response = st.text_area(
            prompt, 
            key=f"response_{phase_key}",
            placeholder="Schreib hier deine Antwort...",
            height=100
        )
        return user_response
    
    return ""

def render_fun_fact(content: Dict):
    """Zeigt den Fun Fact."""
    fun_fact = content.get("fun_fact", "")
    
    if fun_fact:
        st.markdown(f"""
        <div style="background: #fffbeb; border: 1px solid #fcd34d; 
                    padding: 15px 20px; border-radius: 10px; margin-top: 15px;">
            <strong style="color: #d97706;">🤓 Wusstest du?</strong>
            <p style="margin: 10px 0 0 0;">{fun_fact}</p>
        </div>
        """, unsafe_allow_html=True)

def render_xp_celebration(xp: int, phase_name: str):
    """Zeigt XP-Animation nach Abschluss einer Phase."""
    st.balloons()
    st.markdown(f"""
    <div style="text-align: center; padding: 30px; 
                background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                border-radius: 15px; margin: 20px 0;">
        <div style="font-size: 3em; color: white;">+{xp} XP</div>
        <div style="color: white; opacity: 0.9; margin-top: 10px;">
            {phase_name} abgeschlossen! 🎉
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_transfer_certificate(user_name: str, total_xp: int):
    """Zeigt das Transfer-Zertifikat als PIL-generiertes Bild."""
    # Generiere das Zertifikat als Bild
    cert_image = generate_transfer_certificate(
        user_name=user_name,
        total_xp=total_xp
    )

    # Konvertiere zu Bytes und zeige in Streamlit
    cert_bytes = image_to_bytes(cert_image)
    st.image(cert_bytes, use_container_width=True)

def render_finale_check(content: Dict, age_group: str):
    """Zeigt den finalen Transfer-Check."""
    challenge = content.get("challenge", "")
    
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
                color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: white;">🏆 Der Transfer-Check</h2>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">
            Zeig, was du gelernt hast! Beantworte die Fragen.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown(f"""
    <div style="background: white; border: 2px solid #8b5cf6; 
                padding: 25px; border-radius: 15px; white-space: pre-line;">
        {challenge}
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("### Deine Antworten:")
    
    response_1 = st.text_area(
        "Near Transfer:",
        key="finale_near",
        placeholder="Dein Near-Transfer-Beispiel...",
        height=80
    )
    
    response_2 = st.text_area(
        "Far Transfer:",
        key="finale_far",
        placeholder="Dein Far-Transfer-Beispiel...",
        height=80
    )
    
    response_3 = st.text_area(
        "Brückenprinzip:",
        key="finale_bridge",
        placeholder="Dein Brückenprinzip und 3 Anwendungen...",
        height=100
    )
    
    return {
        "near": response_1,
        "far": response_2,
        "bridge": response_3,
    }

# ============================================
# MAIN WIDGET
# ============================================

def render_transfer_challenge(user: Dict, conn, xp_callback=None):
    """
    Rendert die komplette Transfer-Challenge.
    
    Args:
        user: User-Dict mit user_id, display_name, age_group
        conn: SQLite Connection
        xp_callback: Optional callback(user_id, xp, reason) für XP
    """
    user_id = user.get("user_id")
    user_name = user.get("display_name", "Lernender")
    age_group = user.get("age_group", "unterstufe")
    
    # Lade Progress aus DB
    db_progress = get_transfer_progress(conn, user_id)
    completed_phase_ids = [p["phase_id"] for p in db_progress]
    
    # Session State initialisieren
    if STATE_KEYS["current_phase"] not in st.session_state:
        # Bestimme aktuelle Phase basierend auf DB
        if "finale" in completed_phase_ids:
            st.session_state[STATE_KEYS["current_phase"]] = 6  # Zertifikat
        elif "phase_4" in completed_phase_ids:
            st.session_state[STATE_KEYS["current_phase"]] = 5  # Finale
        elif "phase_3" in completed_phase_ids:
            st.session_state[STATE_KEYS["current_phase"]] = 4
        elif "phase_2" in completed_phase_ids:
            st.session_state[STATE_KEYS["current_phase"]] = 3
        elif "phase_1" in completed_phase_ids:
            st.session_state[STATE_KEYS["current_phase"]] = 2
        else:
            st.session_state[STATE_KEYS["current_phase"]] = 1
    
    if STATE_KEYS["completed_phases"] not in st.session_state:
        st.session_state[STATE_KEYS["completed_phases"]] = completed_phase_ids
    
    if STATE_KEYS["total_xp"] not in st.session_state:
        st.session_state[STATE_KEYS["total_xp"]] = sum(p.get("xp_earned", 0) for p in db_progress)
    
    current_phase = st.session_state[STATE_KEYS["current_phase"]]
    completed = st.session_state[STATE_KEYS["completed_phases"]]
    total_xp = st.session_state[STATE_KEYS["total_xp"]]
    
    # Header
    render_transfer_header()
    
    # Progress
    render_phase_progress(current_phase, completed)
    
    st.markdown("---")
    
    # ─────────────────────────────────────────
    # ZERTIFIKAT (Phase 6)
    # ─────────────────────────────────────────
    if current_phase == 6:
        st.success("🎉 Herzlichen Glückwunsch! Du hast die Transfer-Challenge gemeistert!")
        render_transfer_certificate(user_name, total_xp)
        
        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🖨️ Zertifikat drucken", use_container_width=True, key="transfer_print_cert"):
                st.info("Druckfunktion wird in Kürze verfügbar!")
        with col2:
            if st.button("🔄 Challenge wiederholen", use_container_width=True, key="transfer_restart"):
                for key in STATE_KEYS.values():
                    if key in st.session_state:
                        del st.session_state[key]
                st.rerun()
        return
    
    # ─────────────────────────────────────────
    # PHASEN 1-4
    # ─────────────────────────────────────────
    if current_phase <= 4:
        phase_key = f"phase_{current_phase}"
        phase_content = get_phase_content(current_phase, age_group)
        
        if not phase_content:
            st.error("Phase nicht gefunden!")
            return
        
        # Phase-Card
        render_phase_card(phase_content, current_phase)
        
        # Tabs für Intro und Übung
        tab1, tab2 = st.tabs(["📖 Lernen", "🎯 Übung"])
        
        with tab1:
            render_intro_section(phase_content)
            render_fun_fact(phase_content)
        
        with tab2:
            user_response = render_exercise_section(phase_content, phase_key)
        
        # Navigation
        st.markdown("---")
        
        col1, col2, col3 = st.columns([1, 2, 1])
        
        with col1:
            if current_phase > 1:
                if st.button("← Zurück", use_container_width=True):
                    st.session_state[STATE_KEYS["current_phase"]] = current_phase - 1
                    st.rerun()
        
        with col3:
            if phase_key in completed:
                st.success("✅ Abgeschlossen!")
                if st.button("Weiter →", use_container_width=True, type="primary"):
                    st.session_state[STATE_KEYS["current_phase"]] = current_phase + 1
                    st.rerun()
            else:
                if st.button("✅ Phase abschließen", use_container_width=True, type="primary"):
                    # XP berechnen
                    xp_key = f"phase_{'discovery' if current_phase == 1 else 'near' if current_phase == 2 else 'far' if current_phase == 3 else 'bridging'}"
                    xp = TRANSFER_XP.get(xp_key, 30)
                    
                    # In DB speichern
                    response = st.session_state.get(f"response_{phase_key}", "")
                    save_transfer_progress(conn, user_id, phase_key, xp, response)
                    
                    # Session State updaten
                    completed.append(phase_key)
                    st.session_state[STATE_KEYS["completed_phases"]] = completed
                    st.session_state[STATE_KEYS["total_xp"]] = total_xp + xp
                    
                    # XP Callback
                    if xp_callback:
                        xp_callback(user_id, xp, f"Transfer Phase {current_phase} abgeschlossen")
                    
                    # Celebration
                    st.session_state["show_celebration"] = True
                    st.session_state["celebration_xp"] = xp
                    st.session_state["celebration_phase"] = phase_content.get("title", f"Phase {current_phase}")
                    
                    # Weiter zur nächsten Phase
                    st.session_state[STATE_KEYS["current_phase"]] = current_phase + 1
                    st.rerun()
    
    # ─────────────────────────────────────────
    # FINALE (Phase 5)
    # ─────────────────────────────────────────
    elif current_phase == 5:
        finale_content = get_phase_content(5, age_group)
        
        responses = render_finale_check(finale_content, age_group)
        
        st.markdown("---")
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            if st.button("← Zurück zu Phase 4", use_container_width=True):
                st.session_state[STATE_KEYS["current_phase"]] = 4
                st.rerun()
        
        with col2:
            # Prüfen ob alle Antworten ausgefüllt
            all_filled = all([
                responses.get("near", "").strip(),
                responses.get("far", "").strip(),
                responses.get("bridge", "").strip(),
            ])
            
            if all_filled:
                if st.button("🏆 Challenge abschließen!", use_container_width=True, type="primary"):
                    xp = TRANSFER_XP.get("transfer_check", 25)
                    
                    # Alle Antworten zusammenfassen
                    full_response = f"Near: {responses['near']}\nFar: {responses['far']}\nBridge: {responses['bridge']}"
                    
                    # In DB speichern
                    save_transfer_progress(conn, user_id, "finale", xp, full_response)
                    
                    # Session State updaten
                    completed.append("finale")
                    st.session_state[STATE_KEYS["completed_phases"]] = completed
                    st.session_state[STATE_KEYS["total_xp"]] = total_xp + xp
                    
                    # XP Callback
                    if xp_callback:
                        xp_callback(user_id, xp, "Transfer-Challenge abgeschlossen!")
                    
                    # Zum Zertifikat
                    st.session_state[STATE_KEYS["current_phase"]] = 6
                    st.balloons()
                    st.rerun()
            else:
                st.button("🏆 Challenge abschließen!", disabled=True, use_container_width=True)
                st.caption("Bitte fülle alle 3 Antworten aus!")
    
    # Celebration anzeigen (wenn gerade Phase abgeschlossen)
    if st.session_state.get("show_celebration"):
        render_xp_celebration(
            st.session_state.get("celebration_xp", 30),
            st.session_state.get("celebration_phase", "Phase")
        )
        st.session_state["show_celebration"] = False
    
    # Sidebar mit Übersicht
    with st.sidebar:
        st.markdown("### 🚀 Transfer-Challenge")
        
        phase_info = [
            ("phase_1", "🔮", "Das Geheimnis", TRANSFER_XP["phase_discovery"]),
            ("phase_2", "🎯", "Near Transfer", TRANSFER_XP["phase_near"]),
            ("phase_3", "🚀", "Far Transfer", TRANSFER_XP["phase_far"]),
            ("phase_4", "🌉", "Brückenprinzipien", TRANSFER_XP["phase_bridging"]),
            ("finale", "🏆", "Transfer-Check", TRANSFER_XP["transfer_check"]),
        ]
        
        for phase_id, icon, name, xp in phase_info:
            is_done = phase_id in completed
            status = "✅" if is_done else "⬜"
            xp_text = f"(+{xp} XP)" if is_done else ""
            st.markdown(f"{status} {icon} {name} {xp_text}")
        
        st.markdown("---")
        st.markdown(f"**Gesamt: {total_xp} XP**")
        st.caption(f"Altersstufe: {age_group.title()}")


# ============================================
# STANDALONE TEST
# ============================================

if __name__ == "__main__":
    import sqlite3
    
    st.set_page_config(page_title="Transfer-Challenge Test", page_icon="🚀", layout="wide")
    
    # Mock User
    test_user = {
        "user_id": "test123",
        "display_name": "Test-Schüler",
        "age_group": "mittelstufe",
    }
    
    # Temp DB
    conn = sqlite3.connect(":memory:")
    conn.execute('''
        CREATE TABLE learnstrat_progress (
            id INTEGER PRIMARY KEY,
            user_id TEXT,
            challenge_id TEXT,
            technique_id TEXT,
            xp_earned INTEGER,
            reflection TEXT,
            completed INTEGER,
            completed_at TEXT
        )
    ''')
    
    render_transfer_challenge(test_user, conn)
