"""
🎮 Hattie-Challenge Widget
==========================

Interaktives Streamlit-Widget für die Hattie-Challenge mit Gamification.
Kombiniert Bandura's Selbstwirksamkeitstheorie mit Hattie's "Student Expectations".

Verwendung in der Ressourcen-Seite:
    from utils.hattie_challenge_widget import render_hattie_challenge_widget
    render_hattie_challenge_widget()
"""

import streamlit as st
from datetime import datetime
import hashlib
from typing import Optional

# Lokale Imports
try:
    from utils.gamification_db import (
        init_database, get_or_create_user, create_challenge, 
        complete_challenge, get_user_stats, get_user_challenges,
        get_open_challenges, check_and_award_badges, get_user_badges,
        get_activity_heatmap
    )
    from utils.gamification_ui import (
        render_level_card, render_streak_display, render_badges_showcase,
        render_challenge_result, render_stats_overview, render_challenge_history,
        render_activity_heatmap, render_new_badge_celebration,
        BADGES, SUBJECTS
    )
    GAMIFICATION_AVAILABLE = True
except ImportError:
    GAMIFICATION_AVAILABLE = False

# ============================================
# SESSION STATE MANAGEMENT
# ============================================

def get_user_id() -> str:
    """Holt die User-ID aus dem User-System oder generiert eine Session-basierte."""
    # Versuche zuerst das zentrale User-System zu nutzen
    if "current_user_id" in st.session_state and st.session_state.current_user_id:
        return st.session_state.current_user_id

    # Fallback: Session-basierte ID
    if "gamification_user_id" not in st.session_state:
        session_key = str(datetime.now().timestamp())
        st.session_state.gamification_user_id = hashlib.md5(
            session_key.encode()
        ).hexdigest()[:16]
    return st.session_state.gamification_user_id

def init_widget_state():
    """Initialisiert den Widget-State."""
    defaults = {
        "challenge_phase": "start",  # start, predict, result, complete
        "current_challenge_id": None,
        "show_history": False,
        "show_badges": False,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

# ============================================
# MAIN WIDGET
# ============================================

def render_hattie_challenge_widget(compact: bool = False, color: str = "#667eea"):
    """
    Rendert das komplette Hattie-Challenge Widget.
    
    Args:
        compact: Wenn True, kompaktere Darstellung
        color: Primärfarbe für das Widget
    """
    if not GAMIFICATION_AVAILABLE:
        st.warning("""
        ⚠️ **Gamification-Module nicht gefunden.**
        
        Bitte stelle sicher, dass die Dateien `gamification_db.py` und `gamification_ui.py` 
        im `utils/` Ordner vorhanden sind.
        """)
        return
    
    init_database()
    init_widget_state()
    user_id = get_user_id()
    
    # User laden
    user = get_or_create_user(user_id)
    stats = get_user_stats(user_id)
    
    # Header mit Level und Streak
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, {color} 0%, {color}dd 100%);
                color: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; display: flex; align-items: center; gap: 10px;">
            🎮 Hattie-Challenge
            <span style="font-size: 0.6em; background: rgba(255,255,255,0.2); 
                        padding: 4px 10px; border-radius: 20px;">
                Interaktiv
            </span>
        </h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.95em;">
            Trainiere deine Selbstwirksamkeit durch realistische Selbsteinschätzung
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Stats-Leiste
    col_level, col_streak = st.columns([2, 1])
    
    with col_level:
        render_level_card(
            level=stats.get("level", 1),
            xp=stats.get("xp_total", 0),
            compact=True
        )
    
    with col_streak:
        st.markdown(f"""
        <div style="background: {'#ff652f' if stats.get('current_streak', 0) >= 3 else '#f0f0f0'};
                    color: {'white' if stats.get('current_streak', 0) >= 3 else '#333'};
                    padding: 12px; border-radius: 10px; text-align: center;">
            <div style="font-size: 0.8em; opacity: 0.9;">🔥 Streak</div>
            <div style="font-size: 1.8em; font-weight: bold;">{stats.get('current_streak', 0)}</div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("")
    
    # Tabs für verschiedene Bereiche
    tab_challenge, tab_stats, tab_badges = st.tabs([
        "🎯 Challenge", "📊 Statistiken", "🏅 Badges"
    ])
    
    # === TAB 1: CHALLENGE ===
    with tab_challenge:
        render_challenge_tab(user_id, stats, color)
    
    # === TAB 2: STATISTIKEN ===
    with tab_stats:
        render_stats_tab(user_id, stats)
    
    # === TAB 3: BADGES ===
    with tab_badges:
        render_badges_tab(user_id, stats)

# ============================================
# CHALLENGE TAB
# ============================================

def render_challenge_tab(user_id: str, stats: dict, color: str):
    """Rendert den Challenge-Tab."""
    
    # Prüfe auf offene Challenges
    open_challenges = get_open_challenges(user_id)
    
    if open_challenges:
        # Es gibt eine offene Challenge - zeige Phase 2
        challenge = open_challenges[0]
        render_challenge_phase2(user_id, challenge, color)
    else:
        # Keine offene Challenge - zeige Phase 1 (Neue Challenge)
        render_challenge_phase1(user_id, stats, color)

def render_challenge_phase1(user_id: str, stats: dict, color: str):
    """Phase 1: Neue Challenge erstellen (Vorhersage)."""

    # Altersstufe aus Session State holen
    age_group = st.session_state.get("current_user_age_group", "unterstufe")
    is_oberstufe = age_group == "oberstufe"

    st.markdown("""
    ### 🎯 Starte eine neue Challenge

    **So funktioniert's:**
    1. Wähle ein Fach und beschreibe die Aufgabe
    2. Schätze ehrlich: Welche Note (oder wie viel Prozent) wirst du erreichen?
    3. Mach die Aufgabe und trag dann dein echtes Ergebnis ein
    """)

    with st.form("new_challenge_form"):
        col1, col2 = st.columns(2)

        with col1:
            subject = st.selectbox(
                "📚 Fach",
                options=SUBJECTS,
                index=0
            )

        with col2:
            # Auswahl: Prozent oder Note/Punkte
            if is_oberstufe:
                prediction_type = st.radio(
                    "📊 Was möchtest du schätzen?",
                    options=["punkte", "prozent"],
                    format_func=lambda x: "🎯 Punkte (0-15)" if x == "punkte" else "📈 Prozent richtig",
                    horizontal=True
                )
            else:
                prediction_type = st.radio(
                    "📊 Was möchtest du schätzen?",
                    options=["note", "prozent"],
                    format_func=lambda x: "🎯 Note (1-6)" if x == "note" else "📈 Prozent richtig",
                    horizontal=True
                )

        # Eingabefeld je nach Auswahl
        if prediction_type == "prozent":
            prediction = st.slider(
                "📈 Meine Schätzung: So viel Prozent werde ich richtig haben",
                min_value=0,
                max_value=100,
                value=70,
                step=5,
                format="%d%%",
                help="Schätze ehrlich: Wie viel Prozent der Aufgaben wirst du richtig lösen?"
            )
            prediction_display = f"{prediction}%"
        elif prediction_type == "punkte":
            prediction = st.slider(
                "🎯 Meine Schätzung: Diese Punktzahl werde ich erreichen",
                min_value=0,
                max_value=15,
                value=10,
                step=1,
                help="Oberstufen-Punkte von 0 (ungenügend) bis 15 (sehr gut+)"
            )
            prediction_display = f"{prediction} Punkte"
        else:  # note
            prediction = st.select_slider(
                "🎯 Meine Schätzung: Diese Note werde ich bekommen",
                options=[1, 2, 3, 4, 5, 6],
                value=3,
                format_func=lambda x: {1: "1 (sehr gut)", 2: "2 (gut)", 3: "3 (befriedigend)",
                                       4: "4 (ausreichend)", 5: "5 (mangelhaft)", 6: "6 (ungenügend)"}[x],
                help="Welche Note erwartest du?"
            )
            prediction_display = f"Note {prediction}"

        task_description = st.text_input(
            "📝 Aufgabe (optional)",
            placeholder="z.B. 'Mathe-Test zum Thema Brüche'",
            help="Beschreibe kurz, was du machen wirst"
        )

        submitted = st.form_submit_button(
            "🚀 Challenge starten",
            use_container_width=True,
            type="primary"
        )

        if submitted:
            # Challenge erstellen - speichere auch den Typ
            challenge_id = create_challenge(
                user_id=user_id,
                subject=subject,
                prediction=prediction,
                task_description=f"[{prediction_type}] {task_description}" if task_description else f"[{prediction_type}]"
            )

            st.success(f"""
            ✅ **Challenge gestartet!**

            Fach: **{subject}**
            Deine Schätzung: **{prediction_display}**

            *Mach jetzt deine Aufgabe und komm zurück, um das Ergebnis einzutragen!*
            """)

            st.rerun()
    
    # Wissenschaftlicher Hintergrund
    with st.expander("🔬 Warum funktioniert das?"):
        st.markdown("""
        **John Hattie's Forschung** zeigt: "Student Expectations" (Schüler-Erwartungen) 
        haben eine Effektstärke von **d = 1.33** – das ist einer der stärksten Effekte überhaupt!
        
        **Der Mechanismus:**
        1. Du setzt eine realistische Erwartung
        2. Du gibst dein Bestes
        3. Wenn du deine Erwartung **übertriffst** → Dein Gehirn speichert: *"Ich kann mehr als ich dachte!"*
        
        Das ist der stärkste Weg, Selbstwirksamkeit aufzubauen (Bandura: *Mastery Experiences*).
        
        **Wichtig:** Deine Schätzung muss ehrlich sein! Nicht zu niedrig (um sicher zu gehen) 
        und nicht zu hoch (um cool zu wirken).
        """)

def render_challenge_phase2(user_id: str, challenge: dict, color: str):
    """Phase 2: Ergebnis eintragen."""

    # Typ aus task_description extrahieren
    task_desc = challenge.get('task_description', '') or ''
    prediction_type = "note"  # Default
    clean_task_desc = task_desc

    if task_desc.startswith("[prozent]"):
        prediction_type = "prozent"
        clean_task_desc = task_desc.replace("[prozent]", "").strip()
    elif task_desc.startswith("[punkte]"):
        prediction_type = "punkte"
        clean_task_desc = task_desc.replace("[punkte]", "").strip()
    elif task_desc.startswith("[note]"):
        prediction_type = "note"
        clean_task_desc = task_desc.replace("[note]", "").strip()

    prediction = challenge.get('prediction', 3)

    # Schätzung formatieren
    if prediction_type == "prozent":
        prediction_display = f"{prediction}%"
    elif prediction_type == "punkte":
        prediction_display = f"{prediction} Punkte"
    else:
        prediction_display = f"Note {prediction}"

    st.markdown(f"""
    ### ⏳ Offene Challenge

    **Fach:** {challenge.get('subject', 'Unbekannt')}
    **Deine Schätzung:** {prediction_display}
    **Aufgabe:** {clean_task_desc if clean_task_desc else '-'}
    """)

    st.info("💡 Hast du die Aufgabe gemacht? Trag jetzt dein echtes Ergebnis ein!")

    with st.form("complete_challenge_form"):
        # Eingabefeld je nach Typ
        if prediction_type == "prozent":
            actual_result = st.slider(
                "📊 Tatsächliches Ergebnis: So viel Prozent hatte ich richtig",
                min_value=0,
                max_value=100,
                value=int(prediction),
                step=5,
                format="%d%%",
                help="Wie viel Prozent hattest du wirklich richtig?"
            )
        elif prediction_type == "punkte":
            actual_result = st.slider(
                "📊 Tatsächliches Ergebnis: Diese Punktzahl habe ich erreicht",
                min_value=0,
                max_value=15,
                value=min(15, int(prediction)),
                step=1,
                help="Wie viele Punkte hast du bekommen?"
            )
        else:  # note
            actual_result = st.select_slider(
                "📊 Tatsächliches Ergebnis: Diese Note habe ich bekommen",
                options=[1, 2, 3, 4, 5, 6],
                value=min(6, max(1, int(prediction))),
                format_func=lambda x: {1: "1 (sehr gut)", 2: "2 (gut)", 3: "3 (befriedigend)",
                                       4: "4 (ausreichend)", 5: "5 (mangelhaft)", 6: "6 (ungenügend)"}[x],
                help="Welche Note hast du bekommen?"
            )

        reflection = st.text_area(
            "💭 Reflexion (optional)",
            placeholder="Was lief gut? Was könntest du verbessern?",
            height=80
        )

        col1, col2 = st.columns(2)

        with col1:
            submitted = st.form_submit_button(
                "✅ Ergebnis eintragen",
                use_container_width=True,
                type="primary"
            )

        with col2:
            # Abbrechen-Button (außerhalb des Forms)
            pass

        if submitted:
            # Challenge abschließen
            result = complete_challenge(
                challenge_id=challenge['id'],
                actual_result=actual_result,
                reflection=reflection
            )

            if "error" in result:
                st.error(result["error"])
            else:
                # Badges prüfen
                new_badges = check_and_award_badges(user_id, BADGES)

                # Speichere Ergebnis in Session State für Anzeige nach dem Rerun
                st.session_state["last_challenge_result"] = result
                st.session_state["last_challenge_badges"] = new_badges
                st.rerun()

    # Zeige letztes Ergebnis falls vorhanden (nach dem Rerun)
    if "last_challenge_result" in st.session_state:
        result = st.session_state.pop("last_challenge_result")
        new_badges = st.session_state.pop("last_challenge_badges", [])

        # Ergebnis anzeigen
        render_challenge_result(result)

        # Neue Badges feiern
        if new_badges:
            st.markdown("---")
            for badge_id in new_badges:
                badge_info = BADGES.get(badge_id, {})
                render_new_badge_celebration(badge_info)

# ============================================
# STATS TAB
# ============================================

def render_stats_tab(user_id: str, stats: dict):
    """Rendert den Statistiken-Tab."""
    
    st.markdown("### 📊 Deine Statistiken")
    
    # Übersicht
    render_stats_overview(stats)
    
    st.markdown("---")
    
    # Level und Streak
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**Level-Fortschritt**")
        render_level_card(
            level=stats.get("level", 1),
            xp=stats.get("xp_total", 0),
            compact=False
        )
    
    with col2:
        st.markdown("**Streak-Status**")
        render_streak_display(
            current_streak=stats.get("current_streak", 0),
            longest_streak=stats.get("longest_streak", 0)
        )
    
    st.markdown("---")
    
    # Activity Heatmap
    st.markdown("**📅 Aktivitäts-Verlauf (letzte 12 Wochen)**")
    activity_data = get_activity_heatmap(user_id, days=84)
    render_activity_heatmap(activity_data, weeks=12)
    
    st.markdown("---")
    
    # Challenge History
    st.markdown("**📜 Letzte Challenges**")
    challenges = get_user_challenges(user_id, limit=10)
    render_challenge_history(challenges, limit=10)

# ============================================
# BADGES TAB
# ============================================

def render_badges_tab(user_id: str, stats: dict):
    """Rendert den Badges-Tab."""
    
    earned_badges = get_user_badges(user_id)
    earned_ids = [b['badge_id'] for b in earned_badges]
    
    total_badges = len(BADGES)
    earned_count = len(earned_ids)
    
    st.markdown(f"""
    ### 🏅 Deine Badges
    
    **{earned_count} / {total_badges}** freigeschaltet
    """)
    
    # Progress Bar
    progress = earned_count / total_badges if total_badges > 0 else 0
    st.progress(progress)
    
    st.markdown("---")
    
    # Badges nach Bandura's Quellen gruppiert
    st.markdown("""
    **Die Badges basieren auf Bandura's 4 Quellen der Selbstwirksamkeit:**
    - 🏆 **Mastery** – Eigene Erfolge sammeln
    - 🔥 **Streaks** – Konsistenz zeigen
    - 💪 **Effort** – Durchhalten
    - 🌈 **Diversity** – Vielfalt entdecken
    """)
    
    st.markdown("---")
    
    render_badges_showcase(earned_ids, show_locked=True)

# ============================================
# STANDALONE TEST
# ============================================

if __name__ == "__main__":
    st.set_page_config(
        page_title="Hattie-Challenge Widget Test",
        page_icon="🎮",
        layout="wide"
    )
    
    st.title("🎮 Hattie-Challenge Widget - Test")
    
    render_hattie_challenge_widget()
