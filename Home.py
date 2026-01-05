"""
🚀 Pulse of Learning - Landing Page

Moderne, jugendgerechte Landing Page im Maithink-Stil.
Spricht Schüler UND Eltern an.
"""

import streamlit as st
import sys
sys.path.append('.')

from utils.coaching_db import init_database
from utils.page_config import get_page_path

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Pulse of Learning - Lerne wie ein Pro",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Initialize database
init_database()

# ============================================
# CUSTOM CSS - MAITHINK STYLE
# ============================================

st.markdown("""
<style>
    /* Hide default Streamlit elements for cleaner look */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Hero Section */
    .hero-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        padding: 60px 40px;
        border-radius: 20px;
        margin-bottom: 30px;
        text-align: center;
        position: relative;
        overflow: hidden;
    }

    .hero-container::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: pulse 4s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.3; }
    }

    .hero-title {
        font-size: 3.5em;
        font-weight: 800;
        color: white;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        position: relative;
        z-index: 1;
    }

    .hero-subtitle {
        font-size: 1.8em;
        color: rgba(255,255,255,0.95);
        margin-bottom: 25px;
        font-weight: 300;
        position: relative;
        z-index: 1;
    }

    .hero-claim {
        font-size: 1.2em;
        color: rgba(255,255,255,0.9);
        background: rgba(0,0,0,0.2);
        padding: 15px 30px;
        border-radius: 50px;
        display: inline-block;
        position: relative;
        z-index: 1;
    }

    /* Feature Cards */
    .feature-card {
        background: white;
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        height: 100%;
        border-top: 5px solid;
    }

    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }

    .feature-icon {
        font-size: 3em;
        margin-bottom: 15px;
    }

    .feature-title {
        font-size: 1.4em;
        font-weight: 700;
        color: #1a1a2e;
        margin-bottom: 10px;
    }

    .feature-text {
        color: #666;
        font-size: 1em;
        line-height: 1.6;
    }

    /* Stats Section */
    .stats-container {
        background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
        padding: 40px;
        border-radius: 20px;
        margin: 40px 0;
    }

    .stat-box {
        text-align: center;
        padding: 20px;
    }

    .stat-number {
        font-size: 3em;
        font-weight: 800;
        color: #667eea;
        text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
    }

    .stat-label {
        color: rgba(255,255,255,0.8);
        font-size: 1em;
        margin-top: 5px;
    }

    /* CTA Button */
    .cta-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 18px 40px;
        border-radius: 50px;
        font-size: 1.2em;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        display: inline-block;
        text-decoration: none;
    }

    .cta-button:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }

    /* Quote Box */
    .quote-box {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-left: 5px solid #667eea;
        padding: 25px 30px;
        border-radius: 0 15px 15px 0;
        margin: 30px 0;
        font-style: italic;
        font-size: 1.1em;
        color: #495057;
    }

    /* Challenge Preview Cards */
    .challenge-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 25px;
        color: white;
        margin-bottom: 15px;
        transition: transform 0.3s ease;
    }

    .challenge-card:hover {
        transform: scale(1.02);
    }

    .challenge-title {
        font-size: 1.2em;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .challenge-xp {
        background: rgba(255,255,255,0.2);
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.9em;
        display: inline-block;
    }

    /* For Parents Section */
    .parents-section {
        background: #f8f9fa;
        border-radius: 20px;
        padding: 40px;
        margin-top: 40px;
    }

    .science-badge {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 0.9em;
        font-weight: 600;
        display: inline-block;
        margin: 5px;
    }
</style>
""", unsafe_allow_html=True)

# ============================================
# HERO SECTION
# ============================================

st.markdown("""
<div class="hero-container">
    <div class="hero-title">Lerne, wie dein Gehirn wirklich lernt.</div>
    <div class="hero-subtitle">Nicht mehr pauken. Cleverer lernen.</div>
    <div class="hero-claim">🔬 Basiert auf echter Wissenschaft!</div>
</div>
""", unsafe_allow_html=True)

# ============================================
# MAIN VALUE PROPOSITION
# ============================================

st.markdown("")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("""
    <div class="feature-card" style="border-top-color: #667eea;">
        <div class="feature-icon">🧠</div>
        <div class="feature-title">Dein Gehirn ist kein Schwamm</div>
        <div class="feature-text">
            Vergiss "einfach oft genug wiederholen". Dein Gehirn funktioniert anders.
            Wir zeigen dir die <strong>7 Techniken</strong>, die laut Wissenschaft
            <em>wirklich</em> funktionieren.
        </div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="feature-card" style="border-top-color: #764ba2;">
        <div class="feature-icon">🎮</div>
        <div class="feature-title">Challenges statt Langeweile</div>
        <div class="feature-text">
            Keine trockene Theorie. <strong>Interaktive Challenges</strong> mit XP, Levels
            und Zertifikaten. Du lernst die Methoden, indem du sie direkt anwendest.
        </div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="feature-card" style="border-top-color: #f093fb;">
        <div class="feature-icon">📈</div>
        <div class="feature-title">Du hast die Kontrolle</div>
        <div class="feature-text">
            Finde heraus, wo du stehst. Verstehe, was dich bremst.
            Und dann: <strong>Mach es selbst besser.</strong> Keine Nachhilfe nötig.
        </div>
    </div>
    """, unsafe_allow_html=True)

# ============================================
# BOLD STATEMENT
# ============================================

st.markdown("")
st.markdown("""
<div class="quote-box">
    "Die meisten Schüler wissen nicht, <strong>wie</strong> sie lernen sollen.
    Sie wiederholen einfach, was nicht funktioniert.
    Das ist so, als würdest du immer wieder gegen eine Wand laufen und hoffen,
    dass sie irgendwann nachgibt."
    <br><br>
    <span style="font-style: normal; font-weight: 600;">— Die Wissenschaft sagt: Es gibt einen besseren Weg.</span>
</div>
""", unsafe_allow_html=True)

# ============================================
# STATS SECTION
# ============================================

st.markdown("""
<div class="stats-container">
    <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
        <div class="stat-box">
            <div class="stat-number">+40</div>
            <div class="stat-label">PISA-Punkte mehr durch<br>Selbstwirksamkeit</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">d=0.92</div>
            <div class="stat-label">Effektstärke nach Hattie<br>(Mega-Effekt!)</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">7</div>
            <div class="stat-label">Powertechniken die<br>wirklich funktionieren</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">6.116</div>
            <div class="stat-label">Deutsche Schüler<br>in der PISA-Studie</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# ============================================
# WHAT YOU'LL LEARN - CHALLENGES PREVIEW
# ============================================

st.markdown("")
st.markdown("## 🎯 Das erwartet dich")

col_left, col_right = st.columns([1.2, 1])

with col_left:
    st.markdown("""
    <div class="challenge-card">
        <div class="challenge-title">💪 Challenge 1: Die 7 Powertechniken</div>
        <p style="margin: 10px 0; opacity: 0.9;">
            Active Recall, Spaced Repetition, Feynman-Methode...
            Lerne die Techniken kennen, die Wissenschaftler für am effektivsten halten.
        </p>
        <span class="challenge-xp">+150 XP</span>
    </div>

    <div class="challenge-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
        <div class="challenge-title">🚀 Challenge 2: Das Geheimnis der Überflieger</div>
        <p style="margin: 10px 0; opacity: 0.9;">
            Transfer-Strategien: Wie du Wissen aus einem Fach in anderen anwendest.
            Der Unterschied zwischen Auswendiglernen und echtem Verstehen.
        </p>
        <span class="challenge-xp">+200 XP</span>
    </div>

    <div class="challenge-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <div class="challenge-title">🧠 Challenge 3: Die Birkenbihl-Methode</div>
        <p style="margin: 10px 0; opacity: 0.9;">
            Gehirn-gerechtes Lernen nach Vera F. Birkenbihl.
            Warum Abschreiben nichts bringt und was stattdessen funktioniert.
        </p>
        <span class="challenge-xp">+200 XP</span>
    </div>
    """, unsafe_allow_html=True)

with col_right:
    st.markdown("### Was du davon hast:")
    st.markdown("""
    ✅ **Weniger Zeit mit Lernen** — Effektiver statt länger

    ✅ **Bessere Noten** — Weil du's wirklich verstehst

    ✅ **Mehr Selbstvertrauen** — Du weißt, dass du's kannst

    ✅ **Weniger Stress** — Keine Panik mehr vor Klausuren

    ✅ **Eigene Kontrolle** — Du brauchst niemanden, der dir sagt was du tun sollst
    """)

    st.markdown("")
    st.markdown("### Für welche Klassenstufe?")
    st.markdown("""
    🎒 **Grundschule** (Klasse 1-4)

    📚 **Unterstufe** (Klasse 5-7)

    🎯 **Mittelstufe** (Klasse 8-10)

    🎓 **Oberstufe** (Klasse 11-13)

    *Die Inhalte passen sich deiner Altersstufe an!*
    """)

# ============================================
# CTA SECTION
# ============================================

st.markdown("")
st.markdown("---")
st.markdown("")

cta_col1, cta_col2, cta_col3 = st.columns([1, 2, 1])

with cta_col2:
    st.markdown("""
    <div style="text-align: center; padding: 40px 0;">
        <h2 style="margin-bottom: 20px;">Ready to level up?</h2>
        <p style="font-size: 1.2em; color: #666; margin-bottom: 30px;">
            Starte jetzt mit der ersten Challenge. Kostenlos. Ohne Anmeldung.
        </p>
    </div>
    """, unsafe_allow_html=True)

    col_btn1, col_btn2 = st.columns(2)
    with col_btn1:
        if st.button("🚀 Zu den Challenges", type="primary", use_container_width=True):
            st.switch_page(get_page_path("ressourcen"))
    with col_btn2:
        if st.button("🔍 Erst mal testen, wo ich stehe", use_container_width=True):
            st.switch_page(get_page_path("screening"))

# ============================================
# FOR PARENTS SECTION
# ============================================

st.markdown("")

with st.expander("👨‍👩‍👧 **Für Eltern:** Was steckt dahinter?", expanded=False):
    st.markdown("""
    ### Wissenschaftlich fundiert — keine leeren Versprechen

    Diese Plattform basiert auf drei Säulen der Bildungsforschung:
    """)

    col_p1, col_p2, col_p3 = st.columns(3)

    with col_p1:
        st.markdown("""
        **📊 PISA 2022**

        Die weltweit größte Schulleistungsstudie der OECD.
        Unsere Analysen basieren auf **6.116 deutschen Schülern**.

        Wir haben identifiziert, welche Faktoren den größten Einfluss auf Schulerfolg haben.
        """)

    with col_p2:
        st.markdown("""
        **📚 Hattie-Studie**

        John Hatties Mega-Analyse von über **80.000 Studien** zu Lernerfolg.

        Wir nutzen nur Methoden mit nachgewiesener hoher Effektstärke (d > 0.40).
        """)

    with col_p3:
        st.markdown("""
        **🧠 Kognitionspsychologie**

        Banduras Selbstwirksamkeitstheorie, Dwecks Growth Mindset,
        Birkenbihl-Methode.

        Wissenschaftlich validierte Lernstrategien.
        """)

    st.markdown("---")

    st.markdown("""
    ### Was Ihr Kind hier lernt:

    | Technik | Effektstärke | Was es bringt |
    |---------|--------------|---------------|
    | Selbstwirksamkeit | d = 0.92 | +40 PISA-Punkte |
    | Transfer-Strategien | d = 0.86 | Wissen anwenden können |
    | Elaboration | d = 0.75 | Tiefes Verstehen |
    | Spaced Repetition | d = 0.60 | Langzeit-Behalten |
    | Active Recall | d = 0.58 | Effektives Abrufen |

    *Effektstärke d > 0.40 gilt als pädagogisch bedeutsam (Hattie)*
    """)

    st.markdown("---")

    st.markdown("""
    ### Für Lerncoaches & Lehrkräfte

    Sie möchten die Diagnostik-Tools nutzen? Diese Plattform bietet auch:

    - **Screening-Diagnostik**: Standardisierte PISA-Fragebögen (15-45 Min)
    - **Individuelle Auswertung**: Ampel-System mit PISA-Benchmark-Vergleich
    - **Förderempfehlungen**: Evidenzbasierte Maßnahmen nach Hattie
    - **Elternakademie**: Informationsmaterial für Elterngespräche
    """)

    st.markdown("")

    col_parent_btn1, col_parent_btn2 = st.columns(2)
    with col_parent_btn1:
        if st.button("📊 Zur Screening-Diagnostik", use_container_width=True):
            st.switch_page(get_page_path("screening"))
    with col_parent_btn2:
        if st.button("🎓 Zur Elternakademie", use_container_width=True):
            st.switch_page(get_page_path("elternakademie"))

# ============================================
# FOOTER
# ============================================

st.markdown("")
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #888; font-size: 14px; padding: 30px 0;">
    <p>
        <strong>Pulse of Learning</strong><br>
        Lerne, wie dein Gehirn wirklich lernt.
    </p>
    <p style="font-size: 12px; margin-top: 15px;">
        Basierend auf PISA 2022 · Hattie-Studie · Kognitionspsychologie<br>
        © 2025 Sandra Störkel
    </p>
</div>
""", unsafe_allow_html=True)
