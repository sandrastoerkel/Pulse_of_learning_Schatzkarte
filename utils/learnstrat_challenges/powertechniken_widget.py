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
import streamlit.components.v1 as components
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
    get_application_prompt,
    generate_techniques_overview,
    generate_techniques_overview_html,
    get_technique_application_data,
)
from .certificate_generator import (
    generate_powertechniken_certificate,
    image_to_bytes,
)

# ============================================
# SESSION STATE KEYS
# ============================================

STATE_KEYS = {
    "current_technique": "pwt_current_technique",  # Index (1-7) der aktuellen Technik
    "current_technique_key": "pwt_current_key",    # Key der aktuellen Technik (z.B. "pomodoro")
    "completed_techniques": "pwt_completed_techniques",
    "technique_ratings": "pwt_ratings",
    "technique_applications": "pwt_applications",  # NEU: Konkrete Anwendungsszenarien
    "phase": "pwt_phase",  # intro, learn, exercise, apply, complete, top3, overview, certificate
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
            application TEXT,
            xp_earned INTEGER DEFAULT 0,
            completed_at TIMESTAMP
        )
    ''')

    # Migration: application Spalte hinzufügen falls nicht vorhanden
    try:
        c.execute('ALTER TABLE learnstrat_progress ADD COLUMN application TEXT')
    except:
        pass  # Spalte existiert bereits
    
    # Index für schnelle Abfragen
    c.execute('CREATE INDEX IF NOT EXISTS idx_learnstrat_user ON learnstrat_progress(user_id)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_learnstrat_challenge ON learnstrat_progress(challenge_id)')
    
    conn.commit()

def save_technique_progress(conn, user_id: str, technique_id: str, rating: int, xp: int, application: str = ""):
    """Speichert den Fortschritt für eine Technik inkl. konkretem Anwendungsszenario."""
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
            SET rating = ?, xp_earned = ?, application = ?, completed = 1, completed_at = ?
            WHERE id = ?
        ''', (rating, xp, application, datetime.now().isoformat(), existing[0]))
    else:
        c.execute('''
            INSERT INTO learnstrat_progress
            (user_id, challenge_id, technique_id, rating, xp_earned, application, completed, completed_at)
            VALUES (?, 'powertechniken', ?, ?, ?, ?, 1, ?)
        ''', (user_id, technique_id, rating, xp, application, datetime.now().isoformat()))

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
    """Holt den Lernstrategie-Fortschritt eines Users inkl. Anwendungsszenarien."""
    c = conn.cursor()
    c.row_factory = lambda cursor, row: {
        "technique_id": row[0],
        "rating": row[1],
        "xp_earned": row[2],
        "completed_at": row[3],
        "application": row[4] if len(row) > 4 else ""
    }

    c.execute('''
        SELECT technique_id, rating, xp_earned, completed_at, application
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


def reset_powertechniken_progress(conn, user_id: str):
    """Löscht den kompletten Powertechniken-Fortschritt eines Users für Neustart."""
    c = conn.cursor()

    # Lösche Technik-Progress
    c.execute('''
        DELETE FROM learnstrat_progress
        WHERE user_id = ? AND challenge_id = 'powertechniken'
    ''', (user_id,))

    # Lösche Top 3 Auswahl
    c.execute('''
        DELETE FROM user_learning_preferences
        WHERE user_id = ?
    ''', (user_id,))

    conn.commit()

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


def render_technique_navigation(techniques: List[Dict], current_key: str, completed: List[str]):
    """Zeigt eine horizontale Navigation durch alle 7 Techniken."""
    st.markdown("---")

    # Erstelle Spalten für die Navigation
    cols = st.columns(len(techniques))

    for i, (col, tech) in enumerate(zip(cols, techniques)):
        key = tech["key"]
        icon = tech["icon"]
        is_current = (key == current_key)
        is_done = key in completed

        with col:
            # Styling basierend auf Status
            if is_current:
                bg_color = "#667eea"
                text_color = "white"
                border = "none"
            elif is_done:
                bg_color = "#d1fae5"
                text_color = "#065f46"
                border = "2px solid #10b981"
            else:
                bg_color = "#f3f4f6"
                text_color = "#6b7280"
                border = "1px solid #e5e7eb"

            # Button für jede Technik
            if st.button(
                f"{icon}",
                key=f"nav_{key}",
                use_container_width=True,
                help=tech["name"]
            ):
                st.session_state[STATE_KEYS["current_technique_key"]] = key
                st.session_state[STATE_KEYS["phase"]] = "intro"
                st.rerun()

    # Legende
    st.markdown("""
    <div style="display: flex; justify-content: center; gap: 20px; margin-top: 5px; font-size: 0.8em; color: #666;">
        <span>✅ = erledigt</span>
        <span>🔵 = aktuell</span>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("---")

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

    # Timer für Pomodoro - Intervall-Timer mit Arbeits- und Pausenzeit
    if timer_needed and duration:
        # Zeit-Einstellungen
        st.markdown("**⏱️ Intervall-Timer einstellen:**")
        col1, col2 = st.columns(2)
        with col1:
            work_minutes = st.number_input(
                "🔴 Arbeitszeit (Min):",
                min_value=1,
                max_value=60,
                value=duration,
                key=f"timer_work_{technique.get('key', 'pomodoro')}"
            )
        with col2:
            break_minutes = st.number_input(
                "🟢 Pausenzeit (Min):",
                min_value=1,
                max_value=30,
                value=5,
                key=f"timer_break_{technique.get('key', 'pomodoro')}"
            )

        timer_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
                .timer-container {{
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 15px;
                    text-align: center;
                    transition: background 0.5s ease;
                }}
                .timer-container.break {{
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                }}
                .timer-container.finished {{
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                }}
                .timer-label {{ font-size: 1.1em; margin-bottom: 5px; }}
                .timer-phase {{ font-size: 0.9em; opacity: 0.9; margin-bottom: 10px; }}
                .timer-display {{
                    font-size: 4em;
                    font-weight: bold;
                    font-family: 'Courier New', monospace;
                    margin: 10px 0;
                }}
                .timer-info {{
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin: 10px 0;
                    font-size: 0.85em;
                    opacity: 0.9;
                }}
                .btn {{
                    padding: 10px 25px;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 5px;
                    font-size: 0.95em;
                    border: none;
                    transition: transform 0.1s;
                }}
                .btn:hover {{ transform: scale(1.05); }}
                .btn:active {{ transform: scale(0.95); }}
                .btn-start {{ background: white; color: #dc2626; }}
                .timer-container.break .btn-start {{ color: #16a34a; }}
                .btn-pause {{ background: rgba(255,255,255,0.2); color: white; border: 2px solid white; }}
                .btn-reset {{ background: rgba(255,255,255,0.2); color: white; border: 2px solid white; }}
                .btn-skip {{ background: rgba(255,255,255,0.2); color: white; border: 2px solid white; }}
                .hidden {{ display: none; }}
                .warning {{ color: #fef08a; }}
            </style>
        </head>
        <body>
            <div class="timer-container" id="container">
                <div class="timer-label" id="label">🍅 Pomodoro Timer</div>
                <div class="timer-phase" id="phase">Arbeitszeit</div>
                <div class="timer-display" id="display">{work_minutes:02d}:00</div>
                <div class="timer-info">
                    <span>Runde: <strong id="roundNum">1</strong></span>
                    <span>|</span>
                    <span id="intervals">🔴 {work_minutes} Min / 🟢 {break_minutes} Min</span>
                </div>
                <div style="margin-top: 10px;">
                    <button class="btn btn-start" id="startBtn" onclick="startTimer()">▶️ Start</button>
                    <button class="btn btn-pause hidden" id="pauseBtn" onclick="pauseTimer()">⏸️ Pause</button>
                    <button class="btn btn-skip hidden" id="skipBtn" onclick="skipPhase()">⏭️ Skip</button>
                    <button class="btn btn-reset" onclick="resetTimer()">🔄 Reset</button>
                </div>
            </div>

            <script>
                const workSeconds = {work_minutes} * 60;
                const breakSeconds = {break_minutes} * 60;
                let remainingSeconds = workSeconds;
                let timerInterval = null;
                let isRunning = false;
                let isWorkPhase = true;
                let currentRound = 1;

                const display = document.getElementById('display');
                const phase = document.getElementById('phase');
                const label = document.getElementById('label');
                const roundNum = document.getElementById('roundNum');
                const startBtn = document.getElementById('startBtn');
                const pauseBtn = document.getElementById('pauseBtn');
                const skipBtn = document.getElementById('skipBtn');
                const container = document.getElementById('container');

                let audioContext = null;

                function playSound(isWork) {{
                    try {{
                        if (!audioContext) {{
                            audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        }}
                        const playTone = (time, freq, dur) => {{
                            const osc = audioContext.createOscillator();
                            const gain = audioContext.createGain();
                            osc.connect(gain);
                            gain.connect(audioContext.destination);
                            osc.frequency.value = freq;
                            osc.type = 'sine';
                            gain.gain.setValueAtTime(0.3, time);
                            gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
                            osc.start(time);
                            osc.stop(time + dur);
                        }};
                        const now = audioContext.currentTime;
                        if (isWork) {{
                            // Arbeitszeit vorbei - fröhliche Töne
                            playTone(now, 523, 0.2);
                            playTone(now + 0.2, 659, 0.2);
                            playTone(now + 0.4, 784, 0.3);
                        }} else {{
                            // Pause vorbei - sanfte Töne
                            playTone(now, 440, 0.3);
                            playTone(now + 0.3, 523, 0.3);
                            playTone(now + 0.6, 440, 0.3);
                        }}
                    }} catch(e) {{}}
                }}

                function updateDisplay() {{
                    const mins = Math.floor(remainingSeconds / 60);
                    const secs = remainingSeconds % 60;
                    display.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
                    display.classList.toggle('warning', remainingSeconds <= 60 && remainingSeconds > 0);
                }}

                function switchPhase() {{
                    playSound(isWorkPhase);
                    isWorkPhase = !isWorkPhase;

                    if (isWorkPhase) {{
                        currentRound++;
                        roundNum.textContent = currentRound;
                        remainingSeconds = workSeconds;
                        container.classList.remove('break');
                        phase.textContent = 'Arbeitszeit';
                        label.textContent = '🍅 Pomodoro Timer';
                    }} else {{
                        remainingSeconds = breakSeconds;
                        container.classList.add('break');
                        phase.textContent = '☕ Pause - Entspann dich!';
                        label.textContent = '🌿 Pausenzeit';
                    }}
                    updateDisplay();
                }}

                function startTimer() {{
                    if (isRunning) return;
                    isRunning = true;
                    startBtn.classList.add('hidden');
                    pauseBtn.classList.remove('hidden');
                    skipBtn.classList.remove('hidden');
                    container.classList.remove('finished');

                    if (!audioContext) {{
                        audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    }}

                    timerInterval = setInterval(function() {{
                        remainingSeconds--;
                        updateDisplay();
                        if (remainingSeconds <= 0) {{
                            switchPhase();
                        }}
                    }}, 1000);
                }}

                function pauseTimer() {{
                    if (!isRunning) return;
                    clearInterval(timerInterval);
                    isRunning = false;
                    startBtn.classList.remove('hidden');
                    pauseBtn.classList.add('hidden');
                }}

                function skipPhase() {{
                    switchPhase();
                }}

                function resetTimer() {{
                    clearInterval(timerInterval);
                    isRunning = false;
                    isWorkPhase = true;
                    currentRound = 1;
                    remainingSeconds = workSeconds;
                    roundNum.textContent = '1';
                    container.classList.remove('break', 'finished');
                    phase.textContent = 'Arbeitszeit';
                    label.textContent = '🍅 Pomodoro Timer';
                    updateDisplay();
                    startBtn.classList.remove('hidden');
                    pauseBtn.classList.add('hidden');
                    skipBtn.classList.add('hidden');
                }}
            </script>
        </body>
        </html>
        """

        components.html(timer_html, height=280)

    # Beispiele anzeigen wenn vorhanden
    examples = exercise.get("example") or exercise.get("test_words")
    if examples and isinstance(examples, list):
        st.markdown("**Beispiele:**")
        for ex in examples:
            st.markdown(f"- {ex}")

def render_rating_phase(technique: Dict):
    """Zeigt die Bewertungsphase einer Technik (Legacy - wird durch apply ersetzt)."""
    name = technique.get("name", "diese Technik")

    st.markdown(f"""
    <div style="background: #faf5ff; border: 2px solid #a855f7;
                padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="color: #7e22ce; margin: 0 0 15px 0;">⭐ Wie hat dir {name} gefallen?</h3>
        <p style="margin: 0;">Bewerte, wie gut diese Technik für DICH funktioniert hat.</p>
    </div>
    """, unsafe_allow_html=True)


def render_application_phase(technique: Dict, age_group: str = "grundschule"):
    """
    Zeigt die Anwendungsphase: Schüler schreiben, wo sie die Technik konkret anwenden.
    Ersetzt die bisherige Sterne-Bewertung.
    """
    technique_key = technique.get("key", "")
    prompt_data = get_application_prompt(technique_key, age_group)

    if not prompt_data:
        return

    name = technique.get("name", "diese Technik")
    icon = technique.get("icon", "📚")
    kurzanleitung = prompt_data.get("kurzanleitung", "")
    frage = prompt_data.get("frage", "Bei welcher Lernaufgabe willst du diese Technik anwenden?")
    hinweis = prompt_data.get("hinweis", "")
    beispiele_text = prompt_data.get("beispiele_text", "")
    placeholder = prompt_data.get("placeholder", "z.B. Englisch-Vokabeln für den Test")
    ideal_fuer = prompt_data.get("ideal_fuer", [])

    # Header
    st.markdown(f"""
    <div style="background: #f0fdf4; border: 2px solid #22c55e;
                padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="color: #166534; margin: 0 0 15px 0;">📝 Wo wendest DU {name} an?</h3>
        <p style="margin: 0; color: #166534;">{frage}</p>
    </div>
    """, unsafe_allow_html=True)

    # Kurzanleitung als Erinnerung
    st.markdown(f"""
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6;
                padding: 12px 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
        <strong>{icon} Kurzanleitung:</strong> {kurzanleitung}
    </div>
    """, unsafe_allow_html=True)

    # Ideal für (als Tags/Chips)
    if ideal_fuer:
        tags = " ".join([f'<span style="background: #e2e8f0; padding: 4px 10px; border-radius: 15px; margin: 2px; display: inline-block; font-size: 0.9em;">{item}</span>' for item in ideal_fuer[:4]])
        st.markdown(f"""
        <div style="margin-bottom: 15px;">
            <strong style="color: #666;">Ideal für:</strong><br>
            {tags}
        </div>
        """, unsafe_allow_html=True)

    # Hinweis
    if hinweis:
        st.info(hinweis)

    # Beispiele
    if beispiele_text:
        st.caption(beispiele_text)

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


def render_techniques_overview(applications: Dict[str, str], user_name: str = "", age_group: str = "grundschule"):
    """
    Zeigt das persönliche Übersichtsdokument mit allen Techniken und Anwendungsszenarien.
    Wird am Ende der Challenge angezeigt.
    """
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: white;">📋 Deine Lerntechniken-Übersicht</h2>
        {"<p style='margin: 10px 0 0 0; opacity: 0.9;'>für " + user_name + "</p>" if user_name else ""}
    </div>
    """, unsafe_allow_html=True)

    # Alle 7 Techniken durchgehen
    technique_order = ["pomodoro", "active_recall", "feynman", "spaced_repetition", "teaching", "loci", "interleaving"]

    for tech_key in technique_order:
        tech_data = get_technique_application_data(tech_key)
        if not tech_data:
            continue

        icon = tech_data.get("icon", "📚")
        name = tech_data.get("name", tech_key)
        kurzanleitung = tech_data.get("kurzanleitung", tech_data.get("core_idea", ""))
        user_anwendung = applications.get(tech_key, "")

        bg_color = "#f0fdf4" if user_anwendung else "#fff7ed"
        border_color = "#22c55e" if user_anwendung else "#f97316"
        status_icon = "✅" if user_anwendung else "⬜"

        st.markdown(f"""
        <div style="background: {bg_color}; border: 2px solid {border_color};
                    padding: 15px; border-radius: 12px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: #1f2937;">{icon} {name}</h4>
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 0.9em;">
                        <strong>Anleitung:</strong> {kurzanleitung}
                    </p>
                    <p style="margin: 0; color: #1f2937;">
                        <strong>{status_icon} Anwenden bei:</strong>
                        {user_anwendung if user_anwendung else "<em style='color: #9ca3af;'>(noch nicht festgelegt)</em>"}
                    </p>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    # Motivierender Abschluss
    filled_count = sum(1 for v in applications.values() if v)
    if filled_count == 7:
        st.success("🎉 Super! Du hast für alle 7 Techniken konkrete Anwendungen gefunden!")
    elif filled_count > 0:
        st.info(f"👍 Du hast bereits {filled_count} von 7 Techniken mit konkreten Anwendungen verknüpft!")

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
    db_applications = {p["technique_id"]: p.get("application", "") for p in db_progress}

    # Hole alle Techniken für diese Altersstufe (früh laden für Initialisierung)
    techniques = get_all_techniques_for_age(age_group)
    technique_keys = [t["key"] for t in techniques]

    # Session State initialisieren
    if STATE_KEYS["completed_techniques"] not in st.session_state:
        st.session_state[STATE_KEYS["completed_techniques"]] = completed_keys
    if STATE_KEYS["technique_ratings"] not in st.session_state:
        st.session_state[STATE_KEYS["technique_ratings"]] = db_ratings
    if STATE_KEYS["technique_applications"] not in st.session_state:
        st.session_state[STATE_KEYS["technique_applications"]] = db_applications
    if STATE_KEYS["current_technique"] not in st.session_state:
        st.session_state[STATE_KEYS["current_technique"]] = 1

    # Aktuelle Technik-Key initialisieren (erste nicht abgeschlossene oder erste)
    if STATE_KEYS["current_technique_key"] not in st.session_state:
        # Finde erste nicht abgeschlossene Technik
        first_incomplete = next((t["key"] for t in techniques if t["key"] not in completed_keys), techniques[0]["key"])
        st.session_state[STATE_KEYS["current_technique_key"]] = first_incomplete

    if STATE_KEYS["phase"] not in st.session_state:
        # Wenn alle fertig → Overview, dann Top3, dann Zertifikat
        if len(completed_keys) >= 7:
            existing_top3 = get_user_top3(conn, user_id)
            if existing_top3:
                st.session_state[STATE_KEYS["phase"]] = "certificate"
            else:
                st.session_state[STATE_KEYS["phase"]] = "overview"  # Erst Übersicht, dann Top3
        else:
            st.session_state[STATE_KEYS["phase"]] = "intro"

    # Variablen aus Session State holen
    total_techniques = len(techniques)
    completed = st.session_state[STATE_KEYS["completed_techniques"]]
    ratings = st.session_state[STATE_KEYS["technique_ratings"]]
    applications = st.session_state[STATE_KEYS["technique_applications"]]
    phase = st.session_state[STATE_KEYS["phase"]]
    current_key = st.session_state[STATE_KEYS["current_technique_key"]]
    
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
    # PHASE: ÜBERSICHT (nach allen 7 Techniken)
    # ─────────────────────────────────────────
    if phase == "overview":
        st.markdown("""
        <h2 style="text-align: center; margin-bottom: 20px;">🎉 Geschafft!</h2>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">
            Du hast alle 7 Powertechniken kennengelernt! Hier ist deine persönliche Übersicht:
        </p>
        """, unsafe_allow_html=True)

        render_techniques_overview(applications, user_name, age_group)

        st.markdown("---")

        # Download-Button für Übersicht
        overview_text = generate_techniques_overview(applications, age_group)
        col1, col2 = st.columns(2)
        with col1:
            st.download_button(
                label="📥 Übersicht herunterladen",
                data=overview_text,
                file_name="meine_lerntechniken.txt",
                mime="text/plain",
                use_container_width=True
            )
        with col2:
            if st.button("➡️ Weiter zur Top 3 Auswahl", type="primary", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "top3"
                st.rerun()

        return

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
                # Reset DB Progress
                reset_powertechniken_progress(conn, user_id)

                # Reset Session State
                for key in STATE_KEYS.values():
                    if key in st.session_state:
                        del st.session_state[key]
                st.rerun()
        
        return
    
    # ─────────────────────────────────────────
    # NORMALE CHALLENGE-PHASEN
    # ─────────────────────────────────────────

    # Finde aktuelle Technik basierend auf current_key
    current_tech = None
    current_idx = 0
    for i, tech in enumerate(techniques):
        if tech["key"] == current_key:
            current_tech = tech
            current_idx = i
            break

    # Fallback: Wenn Key nicht gefunden, nimm erste Technik
    if not current_tech:
        current_tech = techniques[0]
        current_idx = 0
        st.session_state[STATE_KEYS["current_technique_key"]] = current_tech["key"]

    # Navigation zwischen Techniken anzeigen
    render_technique_navigation(techniques, current_key, completed)
    
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
                st.session_state[STATE_KEYS["phase"]] = "apply"  # Geändert: zu apply statt rate
                st.rerun()
    
    # ─────────────────────────────────────────
    # PHASE: APPLY (Anwendungsszenario eingeben) - NEU!
    # ─────────────────────────────────────────
    elif phase == "apply":
        render_application_phase(current_tech, age_group)

        # Eingabefeld für konkrete Anwendung
        prompt_data = get_application_prompt(current_tech["key"], age_group)
        placeholder = prompt_data.get("placeholder", "z.B. Englisch-Vokabeln für den Test") if prompt_data else ""

        application_input = st.text_input(
            "Meine konkrete Anwendung:",
            value=applications.get(current_tech["key"], ""),
            placeholder=placeholder,
            key=f"apply_input_{current_tech['key']}"
        )

        st.markdown("---")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Zurück zur Übung", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "exercise"
                st.rerun()
        with col2:
            if application_input.strip():
                if st.button("✅ Speichern & Weiter!", type="primary", use_container_width=True):
                    # XP berechnen
                    xp = CHALLENGE_XP["technique_discovered"] + CHALLENGE_XP["exercise_completed"] + CHALLENGE_XP["reflection_done"]

                    # In DB speichern (rating=5 als Default, da keine Bewertung mehr)
                    save_technique_progress(conn, user_id, current_tech["key"], 5, xp, application_input.strip())

                    # Session State updaten
                    completed.append(current_tech["key"])
                    ratings[current_tech["key"]] = 5  # Default rating
                    applications[current_tech["key"]] = application_input.strip()
                    st.session_state[STATE_KEYS["completed_techniques"]] = completed
                    st.session_state[STATE_KEYS["technique_ratings"]] = ratings
                    st.session_state[STATE_KEYS["technique_applications"]] = applications

                    # XP Callback
                    if xp_callback:
                        xp_callback(user_id, xp, f"Technik '{current_tech['name']}' mit Anwendung gespeichert")

                    # Zur Completion-Phase
                    st.session_state[STATE_KEYS["phase"]] = "complete"
                    st.session_state["last_xp"] = xp
                    st.rerun()
            else:
                st.button("✅ Speichern & Weiter!", disabled=True, use_container_width=True)
                st.caption("Schreibe zuerst, wo du diese Technik anwenden willst!")

    # ─────────────────────────────────────────
    # PHASE: RATE (Legacy - für Rückwärtskompatibilität)
    # ─────────────────────────────────────────
    elif phase == "rate":
        # Redirect zu apply Phase
        st.session_state[STATE_KEYS["phase"]] = "apply"
        st.rerun()
    
    # ─────────────────────────────────────────
    # PHASE: COMPLETE (Abschluss einer Technik)
    # ─────────────────────────────────────────
    elif phase == "complete":
        xp = st.session_state.get("last_xp", 30)
        render_xp_animation(xp, f"für {current_tech['name']}!")

        remaining = total_techniques - len(completed)

        if remaining > 0:
            st.success(f"Super! Noch {remaining} Technik(en) bis zu deiner Übersicht! 🎯")

            # Finde nächste nicht abgeschlossene Technik
            next_tech_key = None
            for tech in techniques:
                if tech["key"] not in completed:
                    next_tech_key = tech["key"]
                    break

            if st.button("➡️ Nächste Technik entdecken!", type="primary", use_container_width=True):
                if next_tech_key:
                    st.session_state[STATE_KEYS["current_technique_key"]] = next_tech_key
                st.session_state[STATE_KEYS["phase"]] = "intro"
                st.rerun()
        else:
            # Bonus XP für alle Techniken
            bonus_xp = CHALLENGE_XP["all_techniques_done"]
            if xp_callback:
                xp_callback(user_id, bonus_xp, "Alle 7 Powertechniken abgeschlossen!")

            st.balloons()
            render_xp_animation(bonus_xp, "Bonus für alle 7 Techniken!")

            if st.button("📋 Zu deiner Lerntechniken-Übersicht!", type="primary", use_container_width=True):
                st.session_state[STATE_KEYS["phase"]] = "overview"
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
            application = applications.get(key, "")

            if is_done:
                if application:
                    # Zeige gekürzte Anwendung
                    short_app = application[:20] + "..." if len(application) > 20 else application
                    st.markdown(f"✅ {icon} {name}")
                    st.caption(f"   → {short_app}")
                else:
                    st.markdown(f"✅ {icon} {name}")
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
