# -*- coding: utf-8 -*-
"""Insel-Daten fuer die Schatzkarte."""

# Feste Inseln (Woche 1-4)
FIXED_ISLANDS = ["festung", "werkzeuge", "faeden", "bruecken"]

# Flexible Inseln (Woche 5-13)
FLEXIBLE_ISLANDS = [
    "spiegel_see", "vulkan", "ruhe_oase", "ausdauer_gipfel",
    "fokus_leuchtturm", "wachstum_garten", "lehrer_turm",
    "wohlfuehl_dorf", "schutz_burg"
]

# Finale Insel (Woche 14)
FINALE_ISLAND = "meister_berg"

# Alle Inseln
ISLANDS = {
    "start": {
        "name": "Starthafen",
        "icon": "🚢",
        "color": "#4fc3f7",
        "week": 0,
        "treasures": [
            {"id": "kompass", "name": "🧭 Kompass", "xp": 20},
        ]
    },

    "festung": {
        "name": "Festung der Staerke",
        "icon": "💪",
        "color": "#ffb74d",
        "week": 1,
        "treasures": [
            {"id": "kleine_siege", "name": "💎 Kleine Siege", "xp": 50},
            {"id": "vorbilder", "name": "💎 Vorbilder", "xp": 50},
            {"id": "aufmunterung", "name": "💎 Aufmunterung", "xp": 50},
            {"id": "ruhig_bleiben", "name": "💎 Ruhig bleiben", "xp": 50},
        ]
    },

    "werkzeuge": {
        "name": "Insel der 7 Werkzeuge",
        "icon": "🔧",
        "color": "#81c784",
        "week": 2,
        "treasures": [
            {"id": "pomodoro", "name": "🍅 Magische Tomate", "xp": 50},
            {"id": "active_recall", "name": "🔄 Erinnerungs-Spiegel", "xp": 50},
            {"id": "feynman", "name": "👶 Teddy-Brille", "xp": 50},
        ]
    },

    "faeden": {
        "name": "Insel der Faeden",
        "icon": "🧵",
        "color": "#ba68c8",
        "week": 3,
        "treasures": [
            {"id": "faden", "name": "🧵 Faden-Spule", "xp": 50},
            {"id": "netz", "name": "🕸 Netz-Karte", "xp": 60},
        ]
    },

    "bruecken": {
        "name": "Insel der Bruecken",
        "icon": "🌉",
        "color": "#fff176",
        "week": 4,
        "treasures": [
            {"id": "bridge_1", "name": "🌉 Teil weg = Minus", "xp": 60},
            {"id": "bridge_2", "name": "🌉 Mehrere gleiche = Mal", "xp": 60},
        ]
    },

    # ======= FLEXIBLE INSELN (Woche 5-13) =======

    "spiegel_see": {
        "name": "Spiegel-See",
        "icon": "🧠",
        "color": "#90caf9",
        "week": None,
        "treasures": [
            {"id": "spiegel", "name": "🪞 Spiegel der Erkenntnis", "xp": 50},
        ]
    },

    "vulkan": {
        "name": "Vulkan der Motivation",
        "icon": "🔥",
        "color": "#ef5350",
        "week": None,
        "treasures": [
            {"id": "flamme", "name": "🔥 Freiheits-Flamme", "xp": 50},
        ]
    },

    "ruhe_oase": {
        "name": "Ruhe-Oase",
        "icon": "😌",
        "color": "#80deea",
        "week": None,
        "treasures": [
            {"id": "atem", "name": "🌬 Atem-Brunnen", "xp": 50},
        ]
    },

    "ausdauer_gipfel": {
        "name": "Ausdauer-Gipfel",
        "icon": "🏆",
        "color": "#ffcc80",
        "week": None,
        "treasures": [
            {"id": "seil", "name": "🧗 Kletter-Seil", "xp": 50},
        ]
    },

    "fokus_leuchtturm": {
        "name": "Fokus-Leuchtturm",
        "icon": "🎯",
        "color": "#ffab91",
        "week": None,
        "treasures": [
            {"id": "licht", "name": "💡 Fokus-Licht", "xp": 50},
        ]
    },

    "wachstum_garten": {
        "name": "Wachstums-Garten",
        "icon": "🌱",
        "color": "#c5e1a5",
        "week": None,
        "treasures": [
            {"id": "noch", "name": "🌱 Das Wort 'NOCH'", "xp": 50},
        ]
    },

    "lehrer_turm": {
        "name": "Lehrer-Turm",
        "icon": "🏫",
        "color": "#b39ddb",
        "week": None,
        "treasures": [
            {"id": "fragen", "name": "❓ Frage-Schluessel", "xp": 50},
        ]
    },

    "wohlfuehl_dorf": {
        "name": "Wohlfuehl-Dorf",
        "icon": "🏠",
        "color": "#a5d6a7",
        "week": None,
        "treasures": [
            {"id": "platz", "name": "🏡 Mein Platz", "xp": 50},
        ]
    },

    "schutz_burg": {
        "name": "Schutz-Burg",
        "icon": "🛡",
        "color": "#f48fb1",
        "week": None,
        "treasures": [
            {"id": "schild", "name": "🛡 Grenzen-Schild", "xp": 50},
        ]
    },

    # ======= FINALE (Woche 14) =======

    "meister_berg": {
        "name": "Berg der Meisterschaft",
        "icon": "⛰",
        "color": "#ffd700",
        "week": 14,
        "treasures": [
            {"id": "krone", "name": "👑 Meister-Krone", "xp": 100},
        ]
    },
}

def get_island(island_id):
    return ISLANDS.get(island_id)

if __name__ == "__main__":
    print(f"Inseln: {len(ISLANDS)}")
    for k, v in ISLANDS.items():
        print(f"  {v['icon']} {v['name']}")
