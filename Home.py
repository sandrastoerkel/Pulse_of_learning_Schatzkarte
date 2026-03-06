"""
🚀 Pulse of Learning - Landing Page
HTML-basierte Landing Page aus docs/index.html

Stand: Maerz 2026
"""

import streamlit as st
import streamlit.components.v1 as components
import sys
import os

sys.path.append('.')

from utils.page_config import get_page_path
from utils.user_system import start_preview_mode

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Pulse of Learning - Lerncoaching für Schüler",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ============================================
# NAVIGATION: Query-Parameter abfangen
# ============================================

action = st.query_params.get("action", "")
if action:
    st.query_params.clear()

    schatzkarte_path = get_page_path("schatzkarte")
    if not schatzkarte_path:
        schatzkarte_path = "pages/1_🗺️_Schatzkarte.py"

    if action == "go_to_map":
        st.switch_page(schatzkarte_path)
    elif action == "start_preview":
        start_preview_mode("unterstufe")
        st.switch_page(schatzkarte_path)

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
    iframe {
        width: 100% !important;
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
# LANDING PAGE aus HTML-Datei laden
# ============================================

html_path = os.path.join(os.path.dirname(__file__), "docs", "index.html")

with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Links direkt im HTML ersetzen + Script fuer Navigation injizieren
# "Jetzt kostenlos erkunden" → start_preview (Gastmodus)
html_content = html_content.replace(
    '>🚀 Jetzt kostenlos erkunden</a>',
    ' data-action="start_preview">🚀 Jetzt kostenlos erkunden</a>'
)

nav_script = """
<script>
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href*="learnerspulse"]');
  if (!link) return;
  e.preventDefault();
  e.stopPropagation();
  var action = link.getAttribute('data-action') || 'go_to_map';
  // Verschiedene Methoden probieren um aus dem iframe auszubrechen
  try { window.top.location.href = '/?action=' + action; } catch(err1) {
    try { window.parent.location.href = '/?action=' + action; } catch(err2) {
      window.location.href = '/?action=' + action;
    }
  }
}, true);
</script>
"""
html_content = html_content.replace('</body>', nav_script + '</body>')

components.html(html_content, height=5000, scrolling=True)
