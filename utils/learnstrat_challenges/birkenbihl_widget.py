"""
🧵 Birkenbihl-Challenge Widget
==============================

Challenge 3: Die Birkenbihl-Methode
Basierend auf Vera F. Birkenbihl's Lehren

Kernkonzept: "Nicht aufschreiben was der andere sagt – 
             sondern was DU denkst!"

Features:
- Das Original-Experiment (5 Wörter)
- Interaktive Faden-Übungen
- Wissensnetz-Builder
- 30-Tage-Challenge
"""

import streamlit as st
from datetime import datetime
from typing import Dict, List, Optional, Any
import time

# Lokale Imports
from .birkenbihl_content import (
    BIRKENBIHL_XP,
    BIRKENBIHL_BADGES,
    BIRKENBIHL_CERTIFICATE,
    BIRKENBIHL_INFO,
    get_birkenbihl_content_for_age,
    get_birkenbihl_phase_content,
)
from .certificate_generator import (
    generate_birkenbihl_certificate,
    image_to_bytes,
)

# ============================================
# SESSION STATE KEYS
# ============================================

STATE_KEYS = {
    "current_phase": "birkenbihl_current_phase",
    "completed_phases": "birkenbihl_completed_phases",
    "user_responses": "birkenbihl_responses",
    "total_xp": "birkenbihl_total_xp",
    "experiment_done": "birkenbihl_experiment_done",
    "experiment_words": "birkenbihl_exp_words",
}

# ============================================
# DATABASE FUNCTIONS
# ============================================

def save_birkenbihl_progress(conn, user_id: str, phase_id: str, xp: int, response: str = ""):
    """Speichert den Fortschritt für eine Birkenbihl-Phase."""
    c = conn.cursor()
    
    c.execute('''
        SELECT id FROM learnstrat_progress 
        WHERE user_id = ? AND challenge_id = 'birkenbihl' AND technique_id = ?
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
            VALUES (?, 'birkenbihl', ?, ?, ?, 1, ?)
        ''', (user_id, phase_id, xp, response, datetime.now().isoformat()))
    
    conn.commit()

def get_birkenbihl_progress(conn, user_id: str) -> List[Dict]:
    """Holt den Birkenbihl-Fortschritt eines Users."""
    c = conn.cursor()
    
    c.execute('''
        SELECT technique_id, xp_earned, reflection, completed_at
        FROM learnstrat_progress
        WHERE user_id = ? AND challenge_id = 'birkenbihl' AND completed = 1
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

def render_birkenbihl_header():
    """Zeigt den Challenge-Header."""
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;
                text-align: center;">
        <h1 style="margin: 0; color: white;">🧵 Die Birkenbihl-Methode</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.95; font-size: 1.1em;">
            "Nicht aufschreiben was der andere sagt – sondern was DU denkst!"
        </p>
        <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 0.9em;">
            — Vera F. Birkenbihl (1946-2011)
        </p>
    </div>
    """, unsafe_allow_html=True)

def render_phase_progress_birkenbihl(current_phase: int, completed_phases: List[str]):
    """Zeigt den Fortschritt durch die Phasen."""
    phases = [
        ("phase_1", "🧵", "Fäden"),
        ("phase_2", "💭", "Gedanken"),
        ("phase_3", "🕸️", "Netz"),
        ("phase_4", "🌍", "Alltag"),
        ("finale", "🎓", "Check"),
    ]
    
    cols = st.columns(5)
    
    for i, (phase_id, icon, label) in enumerate(phases):
        is_complete = phase_id in completed_phases
        is_current = (i + 1) == current_phase
        
        with cols[i]:
            if is_complete:
                bg, border = "#10b981", "#059669"
            elif is_current:
                bg, border = "#8b5cf6", "#7c3aed"
            else:
                bg, border = "#e5e7eb", "#d1d5db"
            
            text_color = "white" if (is_complete or is_current) else "#6b7280"
            
            st.markdown(f"""
            <div style="background: {bg}; border: 3px solid {border}; 
                        padding: 10px; border-radius: 10px; text-align: center;">
                <div style="font-size: 1.5em;">{icon}</div>
                <div style="font-size: 0.75em; color: {text_color}; font-weight: 600;">{label}</div>
            </div>
            """, unsafe_allow_html=True)

def render_experiment_interactive(words: List[Dict], age_group: str):
    """Rendert das interaktive Birkenbihl-Experiment."""
    
    st.markdown("""
    <div style="background: #fef3c7; border: 2px solid #f59e0b; 
                padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="color: #92400e; margin: 0;">🔬 Das Original-Experiment von Vera Birkenbihl</h3>
        <p style="margin: 10px 0 0 0; color: #78350f;">
            <strong>Die Regeln:</strong><br>
            1. Du siehst gleich 5 Wörter – NICHT aufschreiben!<br>
            2. Du darfst sie dir NICHT merken wollen!<br>
            3. Schreib NUR auf: Was fällt DIR dazu ein?
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Experiment-State
    if "exp_step" not in st.session_state:
        st.session_state.exp_step = 0
    if "exp_associations" not in st.session_state:
        st.session_state.exp_associations = {}
    
    exp_step = st.session_state.exp_step
    
    # Start-Button
    if exp_step == 0:
        st.info("👆 Bereit? Klicke auf 'Experiment starten'!")
        if st.button("▶️ Experiment starten", type="primary", use_container_width=True):
            st.session_state.exp_step = 1
            st.rerun()
        return None
    
    # Wörter nacheinander zeigen
    if exp_step <= len(words):
        word_data = words[exp_step - 1]
        word = word_data["word"]
        icon = word_data["icon"]
        hint = word_data.get("hint", "Was fällt dir ein?")
        
        st.markdown(f"""
        <div style="text-align: center; padding: 30px; 
                    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                    border-radius: 15px; margin-bottom: 20px;">
            <div style="font-size: 3em; color: white;">{icon}</div>
            <div style="font-size: 2em; color: white; font-weight: bold; margin-top: 10px;">
                Wort {exp_step}: {word}
            </div>
            <div style="color: rgba(255,255,255,0.8); margin-top: 10px;">
                ⚠️ NICHT das Wort aufschreiben! Nur DEINE Gedanken!
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        association = st.text_area(
            f"Deine Assoziationen zu '{word}':",
            key=f"assoc_{exp_step}",
            placeholder=hint,
            height=80
        )
        
        col1, col2 = st.columns([1, 1])
        with col2:
            if st.button("Weiter →", type="primary", use_container_width=True):
                st.session_state.exp_associations[word] = association
                st.session_state.exp_step = exp_step + 1
                st.rerun()
        
        # Progress
        st.progress(exp_step / len(words))
        return None
    
    # Alle Wörter durch → Recall-Test!
    if exp_step == len(words) + 1:
        st.markdown("""
        <div style="background: #dcfce7; border: 2px solid #22c55e; 
                    padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="color: #166534; margin: 0;">🧠 Jetzt der Test!</h3>
            <p style="margin: 10px 0 0 0; color: #15803d;">
                Welche 5 Wörter waren es? Schreib sie auf!<br>
                <em>(Du hast sie dir ja "nicht gemerkt"... oder doch? 😏)</em>
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        recall = st.text_area(
            "Welche 5 Wörter waren es?",
            key="recall_test",
            placeholder="Schreib die Wörter auf, an die du dich erinnerst...",
            height=100
        )
        
        if st.button("✅ Auflösung zeigen!", type="primary", use_container_width=True):
            st.session_state.exp_step = exp_step + 1
            st.session_state.exp_recall = recall
            st.rerun()
        
        return None
    
    # Auflösung!
    if exp_step == len(words) + 2:
        recall = st.session_state.get("exp_recall", "")
        associations = st.session_state.exp_associations
        
        st.markdown("""
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                    padding: 25px; border-radius: 15px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">🎉 Das Ergebnis!</h2>
        </div>
        """, unsafe_allow_html=True)
        
        # Zähle korrekte Wörter
        original_words = [w["word"].lower() for w in words]
        recall_lower = recall.lower()
        correct = sum(1 for w in original_words if w in recall_lower)
        
        st.markdown(f"""
        <div style="text-align: center; font-size: 1.5em; margin: 20px 0;">
            Du hast <strong style="color: #22c55e;">{correct} von 5</strong> Wörtern erinnert!
        </div>
        """, unsafe_allow_html=True)
        
        # Die Wörter und Assoziationen
        st.markdown("### Die 5 Wörter waren:")
        for word_data in words:
            word = word_data["word"]
            icon = word_data["icon"]
            user_assoc = associations.get(word, "—")
            
            remembered = "✅" if word.lower() in recall_lower else "❌"
            
            st.markdown(f"""
            <div style="background: white; border: 1px solid #e5e7eb; 
                        padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 1.3em;">{icon} <strong>{word}</strong></span>
                        <span style="margin-left: 10px;">{remembered}</span>
                    </div>
                </div>
                <div style="color: #6b7280; margin-top: 8px; font-style: italic;">
                    Deine Gedanken: "{user_assoc if user_assoc else '—'}"
                </div>
            </div>
            """, unsafe_allow_html=True)
        
        # Birkenbihl's Erkenntnis
        st.markdown("""
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; 
                    padding: 20px; border-radius: 0 10px 10px 0; margin-top: 20px;">
            <strong style="color: #1e40af;">💡 Birkenbihl's Erkenntnis:</strong>
            <p style="margin: 10px 0 0 0;">
                Obwohl du dir die Wörter <em>nicht merken solltest</em>, 
                hast du sie trotzdem behalten – WEIL du deine eigenen Gedanken notiert hast!
            </p>
            <p style="margin: 10px 0 0 0;">
                Deine Assoziationen sind die <strong>FÄDEN</strong>, 
                an denen die Wörter hängen bleiben!
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        st.session_state[STATE_KEYS["experiment_done"]] = True
        
        return {
            "words": [w["word"] for w in words],
            "associations": associations,
            "recall": recall,
            "correct": correct,
        }
    
    return None

def render_phase_card_birkenbihl(phase_data: Dict, phase_num: int):
    """Zeigt die Phasen-Karte."""
    icon = phase_data.get("icon", "📚")
    title = phase_data.get("title", f"Phase {phase_num}")
    core = phase_data.get("core_concept", "")
    
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
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

def render_birkenbihl_certificate(user_name: str, total_xp: int):
    """Zeigt das Birkenbihl-Zertifikat als PIL-generiertes Bild."""
    # Generiere das Zertifikat als Bild
    cert_image = generate_birkenbihl_certificate(
        user_name=user_name,
        total_xp=total_xp
    )

    # Konvertiere zu Bytes und zeige in Streamlit
    cert_bytes = image_to_bytes(cert_image)
    st.image(cert_bytes, use_container_width=True)

# ============================================
# MAIN WIDGET
# ============================================

def render_birkenbihl_challenge(user: Dict, conn, xp_callback=None):
    """
    Rendert die komplette Birkenbihl-Challenge.
    
    Args:
        user: User-Dict mit user_id, display_name, age_group
        conn: SQLite Connection
        xp_callback: Optional callback(user_id, xp, reason) für XP
    """
    user_id = user.get("user_id")
    user_name = user.get("display_name", "Lernender")
    age_group = user.get("age_group", "unterstufe")
    
    # Lade Progress aus DB
    db_progress = get_birkenbihl_progress(conn, user_id)
    completed_phase_ids = [p["phase_id"] for p in db_progress]
    
    # Session State initialisieren
    if STATE_KEYS["current_phase"] not in st.session_state:
        if "finale" in completed_phase_ids:
            st.session_state[STATE_KEYS["current_phase"]] = 6
        elif "phase_4" in completed_phase_ids:
            st.session_state[STATE_KEYS["current_phase"]] = 5
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
    render_birkenbihl_header()
    
    # Progress
    render_phase_progress_birkenbihl(current_phase, completed)
    
    st.markdown("---")
    
    # ─────────────────────────────────────────
    # ZERTIFIKAT (Phase 6)
    # ─────────────────────────────────────────
    if current_phase == 6:
        st.success("🎉 Herzlichen Glückwunsch! Du hast die Birkenbihl-Methode gemeistert!")
        render_birkenbihl_certificate(user_name, total_xp)
        
        st.markdown("---")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🖨️ Zertifikat drucken", use_container_width=True, key="birkenbihl_print_cert"):
                st.info("Druckfunktion wird in Kürze verfügbar!")
        with col2:
            if st.button("🔄 Challenge wiederholen", use_container_width=True, key="birkenbihl_restart"):
                for key in STATE_KEYS.values():
                    if key in st.session_state:
                        del st.session_state[key]
                # Reset experiment state
                for key in ["exp_step", "exp_associations", "exp_recall"]:
                    if key in st.session_state:
                        del st.session_state[key]
                st.rerun()
        return
    
    # ─────────────────────────────────────────
    # PHASEN 1-4
    # ─────────────────────────────────────────
    if current_phase <= 4:
        phase_key = f"phase_{current_phase}"
        phase_content = get_birkenbihl_phase_content(current_phase, age_group)
        
        if not phase_content:
            st.error("Phase nicht gefunden!")
            return
        
        render_phase_card_birkenbihl(phase_content, current_phase)
        
        # Intro
        intro = phase_content.get("intro", "")
        story = phase_content.get("story", "")
        
        st.markdown(f"""
        <div style="background: white; border: 1px solid #e5e7eb; 
                    padding: 20px; border-radius: 10px; margin-bottom: 15px;
                    white-space: pre-line; line-height: 1.8;">
            {intro}
        </div>
        """, unsafe_allow_html=True)
        
        if story:
            with st.expander("📖 Geschichte", expanded=False):
                st.markdown(story)
        
        # Fun Fact
        fun_fact = phase_content.get("fun_fact", "")
        if fun_fact:
            st.markdown(f"""
            <div style="background: #fffbeb; border: 1px solid #fcd34d; 
                        padding: 15px; border-radius: 10px; margin: 15px 0;">
                <strong style="color: #d97706;">🤓 Wusstest du?</strong>
                <p style="margin: 10px 0 0 0;">{fun_fact}</p>
            </div>
            """, unsafe_allow_html=True)
        
        # Phase 1: Das Experiment!
        if current_phase == 1:
            st.markdown("---")
            st.markdown("### 🔬 Das Experiment")
            
            experiment = phase_content.get("experiment", {})
            words = experiment.get("words", [])
            
            if words:
                result = render_experiment_interactive(words, age_group)
                
                if result:
                    st.success(f"🎉 Experiment abgeschlossen! Du hast {result['correct']}/5 Wörtern erinnert!")
        
        # Andere Phasen: Übungen anzeigen
        else:
            exercise = phase_content.get("exercise", {})
            if exercise:
                st.markdown("---")
                st.markdown(f"### 🎯 {exercise.get('title', 'Übung')}")
                
                instruction = exercise.get("instruction", "")
                st.markdown(f"""
                <div style="background: #f0fdf4; border: 2px solid #22c55e; 
                            padding: 20px; border-radius: 15px; white-space: pre-line;">
                    {instruction}
                </div>
                """, unsafe_allow_html=True)
                
                # Topics/Facts für Übungen
                topics = exercise.get("topics", [])
                facts = exercise.get("facts", [])
                mini_lectures = exercise.get("mini_lectures", [])
                
                for item in (topics or facts or mini_lectures):
                    icon = item.get("icon", "📌")
                    topic = item.get("topic", item.get("fact", ""))
                    prompt = item.get("prompt", "Deine Gedanken?")
                    
                    with st.expander(f"{icon} {topic[:50]}...", expanded=False):
                        if "content" in item:
                            st.markdown(item["content"])
                        st.text_area(prompt, key=f"exercise_{topic[:20]}", height=80)
        
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
                if st.button("Weiter →", type="primary", use_container_width=True):
                    st.session_state[STATE_KEYS["current_phase"]] = current_phase + 1
                    st.rerun()
            else:
                # Phase 1 braucht Experiment
                can_complete = True
                if current_phase == 1:
                    can_complete = st.session_state.get(STATE_KEYS["experiment_done"], False)
                
                if can_complete:
                    if st.button("✅ Phase abschließen", type="primary", use_container_width=True):
                        xp_keys = ["phase_faden", "phase_eigene_gedanken", "phase_wissensnetz", "phase_anwenden"]
                        xp = BIRKENBIHL_XP.get(xp_keys[current_phase - 1], 30)
                        
                        save_birkenbihl_progress(conn, user_id, phase_key, xp)
                        
                        completed.append(phase_key)
                        st.session_state[STATE_KEYS["completed_phases"]] = completed
                        st.session_state[STATE_KEYS["total_xp"]] = total_xp + xp
                        
                        if xp_callback:
                            xp_callback(user_id, xp, f"Birkenbihl Phase {current_phase}")
                        
                        st.session_state[STATE_KEYS["current_phase"]] = current_phase + 1
                        st.balloons()
                        st.rerun()
                else:
                    st.button("✅ Phase abschließen", disabled=True, use_container_width=True)
                    st.caption("Bitte führe zuerst das Experiment durch!")
    
    # ─────────────────────────────────────────
    # FINALE (Phase 5)
    # ─────────────────────────────────────────
    elif current_phase == 5:
        finale_content = get_birkenbihl_phase_content(5, age_group)
        
        st.markdown("""
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                    color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: white;">🎓 Der Birkenbihl-Check</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">
                Zeig, dass du die Faden-Methode beherrschst!
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        challenge = finale_content.get("challenge", "")
        st.markdown(f"""
        <div style="background: white; border: 2px solid #8b5cf6; 
                    padding: 25px; border-radius: 15px; white-space: pre-line;">
            {challenge}
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("---")
        st.markdown("### Deine Antworten:")
        
        response_1 = st.text_area("Frage 1:", key="finale_q1", height=100)
        response_2 = st.text_area("Frage 2:", key="finale_q2", height=100)
        response_3 = st.text_area("Frage 3:", key="finale_q3", height=100)
        
        st.markdown("---")
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            if st.button("← Zurück", use_container_width=True):
                st.session_state[STATE_KEYS["current_phase"]] = 4
                st.rerun()
        
        with col2:
            all_filled = all([response_1.strip(), response_2.strip(), response_3.strip()])
            
            if all_filled:
                if st.button("🎓 Challenge abschließen!", type="primary", use_container_width=True):
                    xp = BIRKENBIHL_XP.get("birkenbihl_check", 25)
                    
                    full_response = f"Q1: {response_1}\nQ2: {response_2}\nQ3: {response_3}"
                    save_birkenbihl_progress(conn, user_id, "finale", xp, full_response)
                    
                    completed.append("finale")
                    st.session_state[STATE_KEYS["completed_phases"]] = completed
                    st.session_state[STATE_KEYS["total_xp"]] = total_xp + xp
                    
                    if xp_callback:
                        xp_callback(user_id, xp, "Birkenbihl-Challenge abgeschlossen!")
                    
                    st.session_state[STATE_KEYS["current_phase"]] = 6
                    st.balloons()
                    st.rerun()
            else:
                st.button("🎓 Challenge abschließen!", disabled=True, use_container_width=True)
                st.caption("Bitte beantworte alle 3 Fragen!")
    
    # Sidebar
    with st.sidebar:
        st.markdown("### 🧵 Birkenbihl-Challenge")
        
        phase_info = [
            ("phase_1", "🧵", "Das Faden-Prinzip", BIRKENBIHL_XP["phase_faden"]),
            ("phase_2", "💭", "Eigene Gedanken", BIRKENBIHL_XP["phase_eigene_gedanken"]),
            ("phase_3", "🕸️", "Wissensnetz", BIRKENBIHL_XP["phase_wissensnetz"]),
            ("phase_4", "🌍", "Im Alltag", BIRKENBIHL_XP["phase_anwenden"]),
            ("finale", "🎓", "Check", BIRKENBIHL_XP["birkenbihl_check"]),
        ]
        
        for phase_id, icon, name, xp in phase_info:
            is_done = phase_id in completed
            status = "✅" if is_done else "⬜"
            xp_text = f"(+{xp} XP)" if is_done else ""
            st.markdown(f"{status} {icon} {name} {xp_text}")
        
        st.markdown("---")
        st.markdown(f"**Gesamt: {total_xp} XP**")
        
        # Video-Link für Pädagogen
        if age_group == "paedagogen":
            st.markdown("---")
            st.markdown("📺 **Original-Video:**")
            st.markdown("[Birkenbihl Seminar](https://youtube.com/watch?v=CiPhJj7fDX4)")


# ============================================
# STANDALONE TEST
# ============================================

if __name__ == "__main__":
    import sqlite3
    
    st.set_page_config(page_title="Birkenbihl Test", page_icon="🧵", layout="wide")
    
    test_user = {
        "user_id": "test123",
        "display_name": "Test-Schüler",
        "age_group": "unterstufe",
    }
    
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
    
    render_birkenbihl_challenge(test_user, conn)
