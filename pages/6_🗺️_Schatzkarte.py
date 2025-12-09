# -*- coding: utf-8 -*-
"""
WOW-Schatzkarte - Die Hauptseite
Mit allen viralen Elementen die Kinder lieben!
"""
import streamlit as st
from schatzkarte.map_data import ISLANDS
from schatzkarte.map_db import init_map_tables
from schatzkarte.map_progress import (
    get_unlocked_islands, 
    is_preview_mode,
    get_preview_week
)
from schatzkarte.map_styles import get_map_css
from schatzkarte.map_renderer import (
    render_streak_box,
    render_xp_box,
    render_progress_bar,
    render_island_card,
    render_treasure_item,
    render_map_title
)

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
# SESSION STATE
# ===============================================================

if "current_user_id" not in st.session_state:
    st.session_state.current_user_id = "demo_user"

if "user_xp" not in st.session_state:
    st.session_state.user_xp = 420

if "user_streak" not in st.session_state:
    st.session_state.user_streak = 7

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
    # Streak-Anzeige
    st.markdown(
        render_streak_box(st.session_state.user_streak),
        unsafe_allow_html=True
    )
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # XP-Anzeige
    level = st.session_state.user_xp // 100 + 1
    st.markdown(
        render_xp_box(st.session_state.user_xp, level),
        unsafe_allow_html=True
    )
    
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("---")
    
    # Preview-Modus (nur fuer Entwicklung)
    with st.expander("Preview-Modus"):
        preview_on = st.checkbox(
            "Preview aktivieren",
            value=st.session_state.get("preview_mode", False)
        )
        st.session_state.preview_mode = preview_on
        
        if preview_on:
            mode = st.radio(
                "Freischaltung:",
                ["Alle Inseln offen", "Woche simulieren"]
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

# Preview-Banner
if is_preview_mode():
    week = get_preview_week()
    msg = "PREVIEW: Alle Inseln" if week is None else f"PREVIEW: Woche {week}"
    st.warning(msg)

# Animierter Titel
st.markdown(render_map_title(), unsafe_allow_html=True)

# Fortschritts-Balken
user_id = st.session_state.current_user_id
unlocked = get_unlocked_islands(user_id)
completed = st.session_state.completed_islands

st.markdown(
    render_progress_bar(len(completed), len(ISLANDS)),
    unsafe_allow_html=True
)

st.markdown("<br>", unsafe_allow_html=True)

# ===============================================================
# DIE KARTE
# ===============================================================

st.markdown('<div class="ocean-bg">', unsafe_allow_html=True)

# Grid mit 5 Spalten
cols = st.columns(5)

for idx, (island_id, island) in enumerate(ISLANDS.items()):
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
        
        # Button nur fuer freigeschaltete Inseln
        if status != "locked":
            if st.button(
                "Erkunden" if status != "completed" else "Fertig",
                key=f"btn_{island_id}",
                use_container_width=True
            ):
                st.session_state.selected_island = island_id

st.markdown('</div>', unsafe_allow_html=True)

# ===============================================================
# INSEL-DETAIL (wenn ausgewaehlt)
# ===============================================================

if "selected_island" in st.session_state:
    island_id = st.session_state.selected_island
    island = ISLANDS.get(island_id)
    
    if island and island_id in unlocked:
        st.markdown("---")
        
        # Insel-Header
        st.markdown(f"""
        <div style="text-align: center; padding: 20px;">
            <span style="font-size: 80px;">{island['icon']}</span>
            <h2 style="color: {island['color']}; margin: 10px 0;">{island['name']}</h2>
        </div>
        """, unsafe_allow_html=True)
        
        # Schaetze
        st.subheader("Schaetze auf dieser Insel")
        
        for treasure in island.get("treasures", []):
            treasure_key = f"{island_id}_{treasure['id']}"
            is_collected = treasure_key in st.session_state.collected_treasures
            
            col1, col2 = st.columns([4, 1])
            
            with col1:
                st.markdown(
                    render_treasure_item(treasure, is_collected),
                    unsafe_allow_html=True
                )
            
            with col2:
                if not is_collected:
                    if st.button("Sammeln", key=f"collect_{treasure_key}"):
                        # Schatz sammeln!
                        st.session_state.collected_treasures.add(treasure_key)
                        st.session_state.user_xp += treasure.get('xp', 50)
                        st.session_state.show_celebration = True
                        st.session_state.last_xp_gain = treasure.get('xp', 50)
                        st.rerun()
        
        # Zurueck-Button
        if st.button("Zurueck zur Karte"):
            del st.session_state.selected_island
            st.rerun()

# ===============================================================
# FOOTER
# ===============================================================

st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; font-size: 14px;">
    Pulse of Learning - Deine Reise zur Lern-Meisterschaft
</div>
""", unsafe_allow_html=True)
