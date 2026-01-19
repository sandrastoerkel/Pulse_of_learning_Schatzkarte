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

    /* Full-width iframe for landing page */
    .stCustomComponentV1 {
        width: 100% !important;
    }
    .stCustomComponentV1 > iframe {
        width: 100% !important;
        height: 4000px !important;
        min-height: 100vh !important;
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

# React Landing Page rendern
result = landing_page(
    height=4000,
    key="landing_page"
)

# Navigation zur Schatzkarte wenn User klickt
if result:
    action = result.get("action", "")
    if action == "go_to_map":
        # Zur Schatzkarte navigieren
        st.switch_page(get_page_path("schatzkarte"))
