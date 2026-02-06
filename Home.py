"""
🚀 Pulse of Learning - Landing Page
React-basierte Landing Page mit Schatzkarte-Design

Stand: Januar 2025
"""

import streamlit as st
import sys

sys.path.append('.')

from utils.coaching_db import init_database
from utils.page_config import get_page_path
from utils.user_system import start_preview_mode
from components.rpg_schatzkarte import landing_page

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Pulse of Learning - Lerncoaching für Schüler",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Initialize database
init_database()

# ============================================
# CUSTOM CSS - Streamlit UI ausblenden
# ============================================

st.markdown("""
<style>
    /* Hide default Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Full-width iframe for landing page - 100vh für sticky elements */
    .stCustomComponentV1 {
        width: 100% !important;
        height: 100vh !important;
    }
    .stCustomComponentV1 > iframe {
        width: 100% !important;
        height: 100vh !important;
        border: none !important;
    }

    /* Remove padding completely */
    .main .block-container {
        padding: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
    }

    .main {
        padding: 0 !important;
    }

    /* Hide sidebar completely */
    [data-testid="stSidebar"] {
        display: none;
    }

    /* Remove any Streamlit spacing */
    .element-container {
        margin: 0 !important;
        padding: 0 !important;
    }
</style>
""", unsafe_allow_html=True)

# ============================================
# LANDING PAGE COMPONENT
# ============================================

# React Landing Page rendern (100vh für sticky action bar)
result = landing_page(
    height=800,  # Wird per CSS auf 100vh überschrieben
    key="landing_page"
)

# Navigation zur Schatzkarte wenn User klickt
if result:
    action = result.get("action", "") if isinstance(result, dict) else ""
    # Pfad zur Schatzkarte ermitteln (mit Fallback)
    schatzkarte_path = get_page_path("schatzkarte")
    if not schatzkarte_path:
        # Fallback: Direkter Pfad
        schatzkarte_path = "pages/1_🗺️_Schatzkarte.py"

    if action == "go_to_map":
        # Zur Schatzkarte navigieren (normaler Login-Flow)
        st.switch_page(schatzkarte_path)
    elif action == "start_preview":
        # Demo-Modus: Preview starten und direkt zur Schatzkarte
        start_preview_mode("unterstufe")
        st.switch_page(schatzkarte_path)
