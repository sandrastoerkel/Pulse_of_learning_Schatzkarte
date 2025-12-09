"""
📚 Ressourcen - Videos & Tipps zur Verbesserung

Diese Seite zeigt Content (Videos, Tipps, Materialien) für einen bestimmten Faktor.
Der Faktor wird über st.session_state.selected_factor oder URL-Parameter übergeben.

Basiert auf:
- streamlit-player für YouTube-Embeds
- Best Practices aus GitHub Education Apps
"""

import streamlit as st
import json
from pathlib import Path
import sys
sys.path.append('..')

from utils.scale_info import get_scale_info
from utils.evidence_integration import get_evidence, get_hattie_info, get_pisa_info

# Import aus ausgelagerten Modulen
from utils.ressourcen.content_database import CONTENT_DATABASE
from utils.ressourcen.helpers import (
    embed_youtube,
    render_video_section,
    render_tipps_section,
    render_wissenschaft_section
)
from utils.ressourcen.matheff_content import render_matheff_altersstufen
from utils.ressourcen.learnstrat_content import render_learnstrat_altersstufen
from utils.ressourcen.motivation_content import render_motivation_altersstufen

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Ressourcen & Tipps",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"  # Sidebar startet geöffnet (entfernen für collapsed)
)

# ============================================
# TRY TO IMPORT STREAMLIT-PLAYER (optional)
# ============================================

try:
    from streamlit_player import st_player
    HAS_PLAYER = True
except ImportError:
    HAS_PLAYER = False

# ============================================
# TRY TO IMPORT USER SYSTEM (für Login)
# ============================================

try:
    from utils.user_system import render_user_login, render_user_info_bar, is_logged_in, get_current_user, is_preview_mode
    HAS_GAMIFICATION = True
except ImportError:
    HAS_GAMIFICATION = False

# ============================================
# MAIN APP
# ============================================

# ============================================
# BENUTZER-LOGIN (für Gamification)
# ============================================

if HAS_GAMIFICATION:
    # Nur Login-Formular zeigen wenn nicht eingeloggt (Info-Bar kommt später)
    render_user_login(show_info_bar=False)

    # Nur fortfahren wenn eingeloggt
    if not is_logged_in():
        st.stop()

# URL-Parameter oder Session State
query_params = st.query_params
factor_from_url = query_params.get('factor', None)

if factor_from_url and factor_from_url in CONTENT_DATABASE:
    st.session_state.selected_factor = factor_from_url
elif 'selected_factor' not in st.session_state or st.session_state.selected_factor not in CONTENT_DATABASE:
    st.session_state.selected_factor = 'MATHEFF'  # Default

factor = st.session_state.selected_factor

# ============================================
# KACHEL-NAVIGATION (auf der Hauptseite)
# Zum Entfernen: Diesen Block löschen (bis "# END KACHEL-NAVIGATION")
# ============================================

st.markdown("### 📚 Wähle einen Bereich:")

# Items in Liste umwandeln für 2 Zeilen
items = list(CONTENT_DATABASE.items())
row1_items = items[:6]  # Erste 6 Items
row2_items = items[6:]  # Rest (5 Items)

def render_tile(key, val, is_selected):
    """Rendert eine einzelne Kachel."""
    btn_icon = val.get('icon', '📚')
    btn_name = val.get('name_schueler', key)
    btn_color = val.get('color', '#667eea')

    if is_selected:
        # Ausgewählte Kachel - volle Farbe, nicht klickbar
        st.markdown(f"""
        <div style="background: {btn_color}; color: white; padding: 12px 8px;
                    border-radius: 12px; text-align: center;
                    min-height: 70px; display: flex; flex-direction: column;
                    justify-content: center; align-items: center;
                    box-shadow: 0 3px 10px {btn_color}55;">
            <div style="font-size: 1.3em;">{btn_icon}</div>
            <div style="font-size: 0.7em; font-weight: bold; margin-top: 4px;
                        line-height: 1.2;">{btn_name}</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        # Nicht ausgewählt - helle Farbe, klickbar
        if st.button(f"{btn_icon}\n{btn_name}", key=f"tile_{key}", use_container_width=True):
            st.session_state.selected_factor = key
            st.rerun()

# CSS für einheitliches Button-Styling
st.markdown("""
<style>
/* Styling für alle Bereichs-Buttons */
div[data-testid="stHorizontalBlock"] button[kind="secondary"] {
    border-radius: 12px !important;
    min-height: 70px !important;
    padding: 10px 8px !important;
    white-space: pre-wrap !important;
    line-height: 1.2 !important;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
    border: 2px solid #dee2e6 !important;
    transition: all 0.2s ease !important;
}
div[data-testid="stHorizontalBlock"] button[kind="secondary"]:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
    border-color: #adb5bd !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>
""", unsafe_allow_html=True)

# Erste Reihe (6 Kacheln)
cols1 = st.columns(6)
for idx, (key, val) in enumerate(row1_items):
    with cols1[idx]:
        render_tile(key, val, key == factor)

# Zweite Reihe (5 Kacheln + 1 leere)
cols2 = st.columns(6)
for idx, (key, val) in enumerate(row2_items):
    with cols2[idx]:
        render_tile(key, val, key == factor)

st.divider()

# User-Info-Bar UNTER der Bereichsauswahl
if HAS_GAMIFICATION:
    render_user_info_bar()

# END KACHEL-NAVIGATION

# ============================================
# SIDEBAR-NAVIGATION (zusätzlich)
# ============================================

with st.sidebar:
    st.markdown("### 📚 Bereiche:")
    for key, val in CONTENT_DATABASE.items():
        btn_icon = val.get('icon', '📚')
        btn_name = val.get('name_schueler', key)
        is_selected = (key == factor)
        btn_type = "primary" if is_selected else "secondary"
        if st.button(
            f"{btn_icon} {btn_name}",
            key=f"sidebar_nav_{key}",
            use_container_width=True,
            type=btn_type
        ):
            st.session_state.selected_factor = key
            st.rerun()

# ============================================
# INHALT DES AUSGEWÄHLTEN BEREICHS
# ============================================

# Hole Content
content = CONTENT_DATABASE.get(factor, {})
if not content:
    st.error("Bereich nicht gefunden.")
    st.stop()

icon = content.get('icon', '📚')
name = content.get('name_de', factor)
color = content.get('color', '#667eea')

# Header
st.markdown(f"""
<div style="background: linear-gradient(135deg, {color} 0%, {color}aa 100%);
            color: white; padding: 40px; border-radius: 20px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 2.5em;">{icon} {name}</h1>
</div>
""", unsafe_allow_html=True)

# Kurzinfo-Box (vorher in Sidebar) - NICHT für EXT_LEARNSTRAT (da mehrere Bereiche mit unterschiedlichen Hattie-Werten)
wissenschaft = content.get('wissenschaft', {})

if factor == "EXT_LEARNSTRAT":
    # Für Lernstrategien: Nur Intro-Text, keine Kurzinfo (da 7 Techniken, Transfer, Birkenbihl verschiedene Werte haben)
    st.markdown(content.get('intro_text', ''))
else:
    col_intro, col_info = st.columns([3, 1])

    with col_intro:
        # Intro Text
        st.markdown(content.get('intro_text', ''))

    with col_info:
        st.markdown(f"""
        <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; border-left: 4px solid {color};">
            <strong>{icon} Kurzinfo</strong><br><br>
            <strong>Hattie d:</strong> {wissenschaft.get('hattie_d', '?')}<br>
            <strong>Rang:</strong> #{wissenschaft.get('hattie_rank', '?')} / 252<br>
            <strong>PISA:</strong> {wissenschaft.get('pisa_impact', '?')}
        </div>
        """, unsafe_allow_html=True)

st.divider()

# ============================================
# TABS
# ============================================

# Spezialbehandlung für Bereiche mit Altersstufen-Tabs
if factor == "MATHEFF":
    render_matheff_altersstufen(color)
elif factor == "EXT_LEARNSTRAT":
    render_learnstrat_altersstufen(color)
elif factor == "EXT_MOTIV":
    # Für Motivation-Challenges: Connection und User-Daten übergeben
    if HAS_GAMIFICATION and is_logged_in():
        user = get_current_user()
        if user:
            from utils.gamification_db import get_db_path, update_user_stats, get_or_create_user
            import sqlite3
            conn = sqlite3.connect(get_db_path())

            user_data = {
                "user_id": user.get("user_id", "anonymous"),
                "display_name": user.get("display_name", "Lernender"),
                "age_group": user.get("age_group", "unterstufe")
            }

            def award_xp_callback(user_id, xp, reason):
                """Vergibt XP an den User."""
                u = get_or_create_user(user_id)
                current_streak = u.get("current_streak", 0)
                update_user_stats(user_id, xp, current_streak)

            render_motivation_altersstufen(color, conn=conn, user_data=user_data, xp_callback=award_xp_callback)
            conn.close()
        else:
            render_motivation_altersstufen(color)
    else:
        render_motivation_altersstufen(color)
else:
    # Standard-Tabs für alle anderen Ressourcen
    tab1, tab2, tab3 = st.tabs(["💡 Tipps & Übungen", "🔬 Wissenschaft", "🎬 Videos"])

    with tab1:
        st.header("💡 Tipps & Übungen")
        st.markdown("Konkrete Strategien, die du sofort anwenden kannst.")
        render_tipps_section(content.get('tipps', []), color)

    with tab2:
        st.header("🔬 Was sagt die Wissenschaft?")
        render_wissenschaft_section(content.get('wissenschaft', {}), color)

    with tab3:
        st.header("🎬 Empfohlene Videos")
        st.markdown("Diese Videos wurden wissenschaftlich analysiert und helfen nachweislich bei diesem Thema.")
        render_video_section(content.get('videos', []), color)

# ============================================
# FOOTER
# ============================================

st.divider()

if st.button("⬅️ Zurück zur Auswertung"):
    st.switch_page("pages/4_📊_Auswertung.py")
