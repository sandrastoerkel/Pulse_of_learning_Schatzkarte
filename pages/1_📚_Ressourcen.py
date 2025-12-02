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
    layout="wide"
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
    from utils.user_system import render_user_login, is_logged_in, get_current_user
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
    render_user_login()

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
# SIDEBAR-NAVIGATION
# ============================================

with st.sidebar:
    st.markdown("### 📚 Wähle einen Bereich:")
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

# Kurzinfo-Box (vorher in Sidebar)
wissenschaft = content.get('wissenschaft', {})
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

col1, col2 = st.columns(2)

with col1:
    if st.button("⬅️ Zurück zur Auswertung", use_container_width=True):
        st.switch_page("pages/4_📊_Auswertung.py")

with col2:
    st.markdown("""
    <div style="text-align: right; color: #888; font-size: 14px; padding-top: 8px;">
        💡 Tipp: Fang mit EINEM Video oder EINEM Tipp an!
    </div>
    """, unsafe_allow_html=True)
