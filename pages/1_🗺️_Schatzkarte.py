# -*- coding: utf-8 -*-
"""
WOW-Schatzkarte - Die Hauptseite
Mit allen viralen Elementen die Kinder lieben!
"""
import streamlit as st
from schatzkarte.map_data import ISLANDS
from schatzkarte.map_db import (
    init_map_tables,
    get_collected_treasures
)
from schatzkarte.map_progress import (
    get_unlocked_islands,
    get_preview_week
)
from schatzkarte.map_styles import get_map_css
from schatzkarte.map_renderer import (
    render_streak_box,
    render_xp_box,
    render_progress_bar,
    render_island_card,
    render_map_title
)
from schatzkarte.map_ships import (
    render_ships,
    render_bandura_modal,
    render_hattie_modal
)
from schatzkarte.map_modal import render_island_modal
from utils.gamification_db import get_user_stats
from utils.user_system import (
    is_logged_in,
    get_current_user,
    is_preview_mode,
    render_preview_banner,
    zeige_schatzkarte
)
from utils.page_config import get_page_path

# ===============================================================
# PAGE CONFIG
# ===============================================================

st.set_page_config(
    page_title="Schatzkarte",
    page_icon="🗺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Tabellen initialisieren
init_map_tables()

# CSS laden
st.markdown(get_map_css(), unsafe_allow_html=True)

# ===============================================================
# USER-AUTHENTIFIZIERUNG
# ===============================================================

# Preview-Modus hat Vorrang (braucht keinen echten Login)
if is_preview_mode():
    user_id = st.session_state.get("current_user_id", "preview_user")
    # Preview-Banner wird spaeter im Hauptbereich gerendert
else:
    # Echter Modus: Login erforderlich
    if not is_logged_in():
        st.warning("🔒 Bitte zuerst einloggen, um deine Schatzkarte zu sehen!")
        st.page_link(get_page_path("ressourcen"), label="➡️ Zur Anmeldung")
        st.info("💡 Tipp: Du kannst auch den **Preview-Modus** nutzen, um die Karte ohne Anmeldung zu testen.")
        st.stop()

    # Eingeloggter User
    user = get_current_user()
    if user is None:
        st.error("Fehler beim Laden der Benutzerdaten.")
        st.stop()
    user_id = user["user_id"]

# ===============================================================
# ALTERSSTUFEN-WEICHE
# ===============================================================

# Schatzkarte nur fuer Grundschule und Unterstufe
if not zeige_schatzkarte():
    st.markdown("""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; padding: 30px; border-radius: 15px; text-align: center; margin: 20px 0;">
        <div style="font-size: 3em; margin-bottom: 15px;">🗺️</div>
        <h2 style="margin: 0 0 10px 0;">Die Schatzkarte ist fuer juengere Schueler gedacht</h2>
        <p style="margin: 0; opacity: 0.9;">
            Fuer Mittelstufe, Oberstufe und Paedagogen haben wir die klassische Ressourcen-Uebersicht.
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("")
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.page_link(
            get_page_path("ressourcen"),
            label="📚 Zu den Ressourcen",
            use_container_width=True
        )
    st.stop()

# ===============================================================
# DATEN AUS DATENBANK LADEN
# ===============================================================

def load_user_data_from_db(uid: str):
    """Laedt User-Daten aus der echten Datenbank."""
    stats = get_user_stats(uid)
    st.session_state.user_xp = stats.get('xp_total', 0)
    st.session_state.user_streak = stats.get('current_streak', 0)

    # Gesammelte Schaetze aus DB laden
    collected = get_collected_treasures(uid)
    # Konvertiere zu Set mit "island_id_treasure_id" Format
    st.session_state.collected_treasures = {
        f"{island_id}_{treasure_id}" for island_id, treasure_id in collected
    }

# Daten laden beim Seitenladen oder wenn sich User aendert
current_loaded_user = st.session_state.get("loaded_user_id")
if current_loaded_user != user_id:
    load_user_data_from_db(user_id)
    st.session_state.loaded_user_id = user_id

# Fallback-Werte falls noch nicht gesetzt
if "user_xp" not in st.session_state:
    st.session_state.user_xp = 0

if "user_streak" not in st.session_state:
    st.session_state.user_streak = 0

if "collected_treasures" not in st.session_state:
    st.session_state.collected_treasures = set()

if "completed_islands" not in st.session_state:
    st.session_state.completed_islands = []

if "show_celebration" not in st.session_state:
    st.session_state.show_celebration = False

if "last_xp_gain" not in st.session_state:
    st.session_state.last_xp_gain = 0

# ===============================================================
# CELEBRATION (nach Schatz sammeln)
# ===============================================================

if st.session_state.show_celebration:
    st.balloons()
    st.toast(f"+{st.session_state.last_xp_gain} XP gesammelt!", icon="⭐")
    st.session_state.show_celebration = False

# ===============================================================
# SIDEBAR
# ===============================================================

with st.sidebar:
    # Streak-Anzeige (echte Daten aus DB)
    st.markdown(
        render_streak_box(st.session_state.user_streak),
        unsafe_allow_html=True
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # XP-Anzeige (echte Daten aus DB)
    # Level aus gamification_db Level-System berechnen
    from utils.gamification_db import calculate_level
    user_level = calculate_level(st.session_state.user_xp)
    st.markdown(
        render_xp_box(st.session_state.user_xp, user_level),
        unsafe_allow_html=True
    )

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("---")

    # Insel-Freischaltung fuer Entwickler/Tester
    if is_preview_mode():
        with st.expander("🔧 Entwickler-Optionen"):
            mode = st.radio(
                "Insel-Freischaltung:",
                ["Alle Inseln offen", "Woche simulieren"],
                key="dev_island_mode"
            )

            if mode == "Woche simulieren":
                week = st.slider("Woche:", 0, 14, value=4)
                st.session_state.preview_week = week
                st.info(f"Woche {week}: {week + 1} Inseln sichtbar")
            else:
                st.session_state.preview_week = None
                st.success("Alle 15 Inseln sichtbar!")

# ===============================================================
# HAUPTBEREICH
# ===============================================================

# Preview-Banner (nutzt das zentrale User-System)
if is_preview_mode():
    render_preview_banner()

# Animierter Titel
st.markdown(render_map_title(), unsafe_allow_html=True)

# Fortschritts-Balken (user_id wurde oben bereits gesetzt)
unlocked = get_unlocked_islands(user_id)
completed = st.session_state.completed_islands

st.markdown(
    render_progress_bar(len(completed), len(ISLANDS)),
    unsafe_allow_html=True
)

st.markdown("<br>", unsafe_allow_html=True)

# ===============================================================
# SCHWIMMENDE SCHIFFE (Bandura & Hattie)
# ===============================================================

render_ships(user_id, unlocked)

# ===============================================================
# MODALS FÜR CHALLENGES
# ===============================================================

# Prüfe ob ein Modal geöffnet werden soll
modal_open = False
if st.session_state.get("show_bandura_modal", False):
    modal_open = render_bandura_modal()
elif st.session_state.get("show_hattie_modal", False):
    modal_open = render_hattie_modal()
elif st.session_state.get("modal_island"):
    # Insel-Modal anzeigen
    render_island_modal(
        island_id=st.session_state.modal_island,
        user_id=user_id,
        is_preview=is_preview_mode()
    )
    modal_open = True

if modal_open:
    st.stop()  # Zeige nur das Modal, nicht die Karte

# ===============================================================
# DIE KARTE
# ===============================================================

st.markdown('<div class="ocean-bg">', unsafe_allow_html=True)

# Grid mit 5 Spalten
cols = st.columns(5)

# Inseln nach Woche sortieren
# Reihenfolge: Woche 0-4, dann flexible (None), dann Finale (Woche 12)
def sort_key(item):
    week = item[1].get('week')
    island_type = item[1].get('type')

    # Finale (Berg der Meisterschaft) ganz ans Ende
    if island_type == "finale":
        return (2, 99)
    # Flexible Inseln (week=None) in die Mitte
    if week is None:
        return (1, 0)
    # Feste Inseln nach Wochennummer
    return (0, week)

sorted_islands = sorted(ISLANDS.items(), key=sort_key)

for idx, (island_id, island) in enumerate(sorted_islands):
    col_idx = idx % 5

    with cols[col_idx]:
        # Status bestimmen
        if island_id in completed:
            status = "completed"
        elif island_id == unlocked[-1] if unlocked else False:
            status = "current"
        elif island_id in unlocked:
            status = "unlocked"
        else:
            status = "locked"

        # Karte rendern
        st.markdown(
            render_island_card(island_id, island, status),
            unsafe_allow_html=True
        )

        # Button fuer freigeschaltete Inseln (per CSS ueber Karte positioniert)
        if status != "locked":
            if st.button(
                f"🔍 {island['name']} erkunden",
                key=f"btn_{island_id}",
                use_container_width=True
            ):
                st.session_state.modal_island = island_id
                st.rerun()

st.markdown('</div>', unsafe_allow_html=True)

# ===============================================================
# FOOTER
# ===============================================================

st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; font-size: 14px;">
    Pulse of Learning - Deine Reise zur Lern-Meisterschaft
</div>
""", unsafe_allow_html=True)
