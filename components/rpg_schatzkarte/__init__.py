"""
RPG Schatzkarte - Streamlit Custom Component
============================================

Eine interaktive Fantasy-Weltkarte für das Lern-Abenteuer.

Usage:
    from components.rpg_schatzkarte import rpg_schatzkarte

    result = rpg_schatzkarte(
        islands=ISLANDS,
        user_progress=get_user_progress(user_id),
        hero_data=get_hero_data(user_id),
        unlocked_islands=get_unlocked_islands(user_id),
        current_island=None,
        key="schatzkarte"
    )

    if result:
        # Verarbeite Aktionen (quest_completed, treasure_collected, etc.)
        handle_action(result)
"""

import os
import streamlit.components.v1 as components

# Pfad zur kompilierten React-App
_COMPONENT_NAME = "rpg_schatzkarte"

# Im Development-Modus läuft Vite auf Port 3001
# Im Production-Modus nutzen wir den build-Ordner
_RELEASE = True  # Auf False setzen für Development

if not _RELEASE:
    # Development-Modus: Vite dev server
    _component_func = components.declare_component(
        _COMPONENT_NAME,
        url="http://localhost:3001",
    )
else:
    # Production-Modus: Build-Ordner
    _parent_dir = os.path.dirname(os.path.abspath(__file__))
    _build_dir = os.path.join(_parent_dir, "frontend", "build")
    _component_func = components.declare_component(
        _COMPONENT_NAME,
        path=_build_dir
    )


def rpg_schatzkarte(
    islands: list,
    user_progress: dict = None,
    hero_data: dict = None,
    unlocked_islands: list = None,
    current_island: str = None,
    age_group: str = "grundschule",
    is_admin: bool = False,
    height: int = 700,
    key: str = None
) -> dict:
    """
    Rendert die RPG Schatzkarte Component.

    Args:
        islands: Liste der Inseln mit id, name, icon, color, week, treasures
        user_progress: Dict mit Fortschritt pro Insel-ID
        hero_data: Dict mit Held-Daten (name, avatar, level, xp, gold, items, titles)
        unlocked_islands: Liste der freigeschalteten Insel-IDs
        current_island: ID der aktuell aktiven Insel (optional)
        age_group: Altersstufe des Users (grundschule, unterstufe, mittelstufe, oberstufe, paedagoge)
        height: Höhe der Komponente in Pixeln
        key: Eindeutiger Key für die Komponente

    Returns:
        Dict mit Aktion wenn User etwas abschließt, sonst None
        - action: 'quest_completed' | 'treasure_collected' | 'xp_earned' | 'item_received' | 'bandura_entry' | 'hattie_entry'
        - islandId: Insel-ID
        - questType: 'wisdom' | 'scroll' | 'battle' | 'challenge'
        - xpEarned: Verdiente XP
        - goldEarned: Verdientes Gold (optional)
        - treasureId: Schatz-ID (optional)
        - itemId: Item-ID (optional)
        - banduraSource: Bandura-Quelle (optional)
        - description: Beschreibung (optional)
    """
    # Defaults setzen
    if user_progress is None:
        user_progress = {}
    if hero_data is None:
        hero_data = {
            "name": "Lern-Held",
            "avatar": "warrior",
            "level": 1,
            "xp": 0,
            "xp_to_next_level": 100,
            "gold": 0,
            "items": [],
            "titles": []
        }
    if unlocked_islands is None:
        unlocked_islands = [islands[0]["id"]] if islands else []

    # Komponente rendern
    component_value = _component_func(
        islands=islands,
        userProgress=user_progress,
        heroData=hero_data,
        unlockedIslands=unlocked_islands,
        currentIsland=current_island,
        ageGroup=age_group,
        isAdmin=is_admin,
        key=key,
        default=None,
    )

    return component_value


def landing_page(
    height: int = 4000,
    key: str = None
) -> dict:
    """
    Rendert die Landing Page Component.

    Args:
        height: Höhe der Komponente in Pixeln
        key: Eindeutiger Key für die Komponente

    Returns:
        Dict mit Aktion wenn User etwas klickt, sonst None
        - action: 'go_to_map' wenn User zur Schatzkarte navigieren will
    """
    # Komponente im Landing-Page-Modus rendern
    component_value = _component_func(
        view="landing",
        islands=[],
        userProgress={},
        heroData={
            "name": "Lern-Held",
            "avatar": "warrior",
            "level": 1,
            "xp": 0,
            "xp_to_next_level": 100,
            "gold": 0,
            "items": [],
            "titles": []
        },
        unlockedIslands=[],
        currentIsland=None,
        ageGroup="grundschule",
        isAdmin=False,
        key=key,
        default=None,
    )

    return component_value


# Hilfsfunktionen für die Daten-Transformation

def islands_to_react_format(islands_data: list) -> list:
    """
    Konvertiert Insel-Daten aus map_data.py in React-Format.
    """
    react_islands = []
    for island in islands_data:
        react_island = {
            "id": island.get("id", ""),
            "name": island.get("name", ""),
            "icon": island.get("icon", "🏝️"),
            "color": island.get("color", "#3b82f6"),
            "week": island.get("week", 1),
            "treasures": island.get("treasures", []),
            "quiz": island.get("quiz", None)
        }
        react_islands.append(react_island)
    return react_islands


def progress_to_react_format(db_progress: dict) -> dict:
    """
    Konvertiert Fortschritt aus der Datenbank in React-Format.
    """
    react_progress = {}
    for island_id, progress in db_progress.items():
        react_progress[island_id] = {
            "video_watched": progress.get("video_watched", False),
            "explanation_read": progress.get("explanation_read", False),
            "quiz_passed": progress.get("quiz_passed", False),
            "challenge_completed": progress.get("challenge_completed", False),
            "treasures_collected": progress.get("treasures_collected", [])
        }
    return react_progress


def hero_to_react_format(user_data: dict, xp_data: dict = None) -> dict:
    """
    Erstellt Held-Daten aus User-Daten.
    """
    # Level basierend auf XP berechnen
    total_xp = xp_data.get("total_xp", 0) if xp_data else 0
    level = 1
    xp_for_next = 100
    remaining_xp = total_xp

    while remaining_xp >= xp_for_next and level < 15:
        remaining_xp -= xp_for_next
        level += 1
        xp_for_next = int(xp_for_next * 1.5)

    return {
        "name": user_data.get("name", "Lern-Held"),
        "avatar": user_data.get("avatar", "warrior"),
        "level": level,
        "xp": remaining_xp,
        "xp_to_next_level": xp_for_next,
        "gold": xp_data.get("gold", 0) if xp_data else 0,
        "items": xp_data.get("items", []) if xp_data else [],
        "titles": xp_data.get("titles", []) if xp_data else []
    }
