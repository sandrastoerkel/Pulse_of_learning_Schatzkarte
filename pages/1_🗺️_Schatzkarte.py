# -*- coding: utf-8 -*-
"""
RPG Schatzkarte - React Custom Component Version
Die interaktive Lern-Weltkarte im RPG-Stil!
"""
import streamlit as st
from schatzkarte.map_data import ISLANDS
from schatzkarte.map_db import (
    init_map_tables,
    get_collected_treasures,
    get_island_progress,
    complete_island_action,
    save_treasure_collected
)
from schatzkarte.map_progress import get_unlocked_islands
from utils.gamification_db import get_user_stats, calculate_level
from utils.user_system import (
    is_logged_in,
    get_current_user,
    is_preview_mode,
    render_preview_banner,
    zeige_schatzkarte
)
from utils.page_config import get_page_path

# React-Komponente importieren
try:
    from components.rpg_schatzkarte import rpg_schatzkarte
    HAS_REACT_COMPONENT = True
except ImportError:
    HAS_REACT_COMPONENT = False

# ===============================================================
# PAGE CONFIG
# ===============================================================

st.set_page_config(
    page_title="Schatzkarte",
    page_icon="🗺",
    layout="wide",
    initial_sidebar_state="collapsed"  # Sidebar eingeklappt für mehr Platz
)

# Tabellen initialisieren
init_map_tables()

# ===============================================================
# USER-AUTHENTIFIZIERUNG
# ===============================================================

# Preview-Modus hat Vorrang (braucht keinen echten Login)
if is_preview_mode():
    user_id = st.session_state.get("current_user_id", "preview_user")
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
# DATEN LADEN
# ===============================================================

def load_user_data():
    """Laedt alle User-Daten fuer die React-Komponente."""
    stats = get_user_stats(user_id)

    # XP und Level berechnen
    total_xp = stats.get('xp_total', 0)
    current_streak = stats.get('current_streak', 0)
    level_info = calculate_level(total_xp)

    # Gesammelte Schaetze
    collected_treasures = get_collected_treasures(user_id)

    # Fortschritt pro Insel laden
    user_progress = {}
    for island_id in ISLANDS.keys():
        progress = get_island_progress(user_id, island_id)
        if progress:
            user_progress[island_id] = {
                "video_watched": progress.get("video_watched", False),
                "explanation_read": progress.get("explanation_read", False),
                "quiz_passed": progress.get("quiz_passed", False),
                "challenge_completed": progress.get("challenge_completed", False),
                "treasures_collected": [t[1] for t in collected_treasures if t[0] == island_id]
            }

    return {
        "xp": total_xp,
        "streak": current_streak,
        "level": level_info if isinstance(level_info, int) else level_info.get("level", 1),
        "progress": user_progress,
        "collected_treasures": collected_treasures
    }

def convert_islands_for_react():
    """Konvertiert die Insel-Daten ins React-Format."""
    react_islands = []

    for island_id, island in ISLANDS.items():
        week = island.get("week")
        if week is None:
            week = 99  # Flexible Inseln ans Ende

        react_island = {
            "id": island_id,
            "name": island.get("name", island_id),
            "icon": island.get("icon", "🏝️"),
            "color": island.get("color", "#3b82f6"),
            "week": week,
            "treasures": [
                {
                    "name": t.get("name", "Schatz"),
                    "icon": t.get("name", "💎")[:2] if t.get("name") else "💎",
                    "xp": t.get("xp", 50)
                }
                for t in island.get("treasures", [])
            ],
            # Neue Felder fuer Tutorial-Insel
            "type": island.get("type"),
            "tutorial_steps": island.get("tutorial_steps"),
            "has_quiz": island.get("has_quiz", True),
            "has_challenge": island.get("has_challenge", True),
        }
        react_islands.append(react_island)

    # Nach Woche sortieren
    react_islands.sort(key=lambda x: x["week"])
    return react_islands

def create_hero_data(user_data):
    """Erstellt die Hero-Daten fuer React."""
    level = user_data.get("level", 1)
    xp = user_data.get("xp", 0)

    # XP fuer naechstes Level berechnen (vereinfacht)
    xp_for_current = sum([100 * (1.5 ** i) for i in range(level - 1)]) if level > 1 else 0
    xp_for_next = int(100 * (1.5 ** (level - 1)))
    xp_in_level = int(xp - xp_for_current)

    # User-Name aus Session holen
    user = get_current_user()
    user_name = "Lern-Held"
    if user:
        user_name = user.get("name", user.get("username", "Lern-Held"))

    return {
        "name": user_name,
        "avatar": "warrior",  # TODO: Avatar-Auswahl implementieren
        "level": level,
        "xp": max(0, xp_in_level),
        "xp_to_next_level": xp_for_next,
        "gold": user_data.get("xp", 0) // 10,  # Gold = XP / 10
        "items": [],  # TODO: Items-System implementieren
        "titles": []  # TODO: Titel-System implementieren
    }

# ===============================================================
# HAUPTBEREICH
# ===============================================================

# Preview-Banner
if is_preview_mode():
    render_preview_banner()

# Pruefen ob React-Komponente verfuegbar ist
if not HAS_REACT_COMPONENT:
    st.error("""
    ⚠️ Die React-Komponente konnte nicht geladen werden.

    Bitte sicherstellen, dass:
    1. Die Komponente gebaut wurde: `cd components/rpg_schatzkarte/frontend && npm run build`
    2. Der Build-Ordner existiert: `components/rpg_schatzkarte/frontend/build/`
    """)
    st.stop()

# Daten laden
user_data = load_user_data()
islands = convert_islands_for_react()
hero_data = create_hero_data(user_data)
unlocked_islands = get_unlocked_islands(user_id)

# Aktuelle Insel bestimmen: Erste Insel mit unvollstaendigem Fortschritt
current_island = None
if unlocked_islands:
    progress = user_data.get("progress", {})
    for island_id in unlocked_islands:
        p = progress.get(island_id, {})
        # Pruefe ob alle 4 Quests abgeschlossen sind
        all_done = (
            p.get("video_watched", False) and
            p.get("explanation_read", False) and
            p.get("quiz_passed", False) and
            p.get("challenge_completed", False)
        )
        if not all_done:
            current_island = island_id
            break
    # Fallback: Wenn alle fertig, keine Markierung
    # (oder man koennte die letzte zeigen)

# ===============================================================
# REACT SCHATZKARTE RENDERN
# ===============================================================

# Minimales CSS fuer Streamlit-Anpassungen
st.markdown("""
<style>
    /* Streamlit-Container auf volle Breite */
    .stMainBlockContainer {
        padding-top: 1rem;
        padding-left: 1rem;
        padding-right: 1rem;
    }

    /* iframe auf volle Hoehe */
    iframe[title="components.rpg_schatzkarte.rpg_schatzkarte"] {
        min-height: 750px !important;
    }
</style>
""", unsafe_allow_html=True)

# Altersstufe aus Session-State holen
age_group = st.session_state.get("current_user_age_group", "unterstufe")

# React-Komponente aufrufen
result = rpg_schatzkarte(
    islands=islands,
    user_progress=user_data.get("progress", {}),
    hero_data=hero_data,
    unlocked_islands=unlocked_islands,
    current_island=current_island,
    age_group=age_group,
    height=750,
    key="rpg_schatzkarte"
)

# ===============================================================
# AKTIONEN VERARBEITEN (mit Duplikat-Schutz)
# ===============================================================

if result:
    action = result.get("action")
    island_id = result.get("islandId")

    # Duplikat-Schutz: gleiche Aktion nicht doppelt verarbeiten
    action_key = f"{action}_{island_id}_{result.get('questType', '')}_{result.get('treasureId', '')}"
    last_action = st.session_state.get("last_schatzkarte_action", "")

    if action_key != last_action:
        st.session_state["last_schatzkarte_action"] = action_key

        if action == "quest_completed":
            quest_type = result.get("questType")

            # Fortschritt speichern
            progress_key = {
                "wisdom": "video_watched",
                "scroll": "explanation_read",
                "battle": "quiz_passed",
                "challenge": "challenge_completed"
            }.get(quest_type)

            if progress_key and island_id:
                # complete_island_action vergibt automatisch XP
                earned = complete_island_action(user_id, island_id, progress_key)
                if earned > 0:
                    st.toast(f"✅ Quest abgeschlossen! +{earned} XP", icon="⭐")

        elif action == "treasure_collected":
            treasure_id = result.get("treasureId")
            xp_earned = result.get("xpEarned", 0)

            if island_id and treasure_id:
                # save_treasure_collected vergibt automatisch XP
                was_new = save_treasure_collected(user_id, island_id, treasure_id, xp_earned)
                if was_new:
                    st.balloons()
                    st.toast(f"💎 Schatz gesammelt! +{xp_earned} XP", icon="🎉")

# ===============================================================
# SIDEBAR (optional - fuer Entwickler)
# ===============================================================

with st.sidebar:
    if is_preview_mode():
        with st.expander("🔧 Entwickler-Optionen", expanded=False):
            st.write(f"**User ID:** {user_id}")
            st.write(f"**Level:** {hero_data['level']}")
            st.write(f"**XP:** {user_data['xp']}")
            st.write(f"**Freigeschaltet:** {len(unlocked_islands)} Inseln")

            col1, col2 = st.columns(2)
            with col1:
                if st.button("🔄 Neu laden"):
                    st.rerun()
            with col2:
                if st.button("🗑️ Reset", type="secondary"):
                    # Fortschritt aus Datenbank loeschen
                    from schatzkarte.map_db import get_connection
                    conn = get_connection()
                    c = conn.cursor()
                    c.execute("DELETE FROM island_progress WHERE user_id=?", (user_id,))
                    c.execute("DELETE FROM user_treasures WHERE user_id=?", (user_id,))
                    conn.commit()
                    conn.close()
                    # Session-State zuruecksetzen
                    st.session_state["last_schatzkarte_action"] = ""
                    st.toast("🗑️ Fortschritt zurückgesetzt!", icon="✅")
                    st.rerun()
