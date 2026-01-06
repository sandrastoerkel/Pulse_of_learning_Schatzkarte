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
        "description": "Willkommen auf deiner Lernreise!",
        "type": "tutorial",  # Spezieller Typ fuer Tutorial-Insel
        "content": {
            "welcome_video_url": "",  # Platzhalter - URL kommt spaeter
            "show_group_chat_link": True,
        },
        # Tutorial-Schritte im Nintendo-Stil (eins nach dem anderen)
        "tutorial_steps": [
            {
                "id": "welcome",
                "title": "🎬 Willkommen, Entdecker!",
                "type": "video",
                "description": "Schau dir das kurze Video an und erfahre, was dich erwartet!",
                "placeholder": True,  # Video kommt spaeter
            },
            {
                "id": "how_it_works",
                "title": "🗺️ So funktioniert's",
                "type": "explanation",
                "content": """
**Deine Reise in 4 einfachen Schritten:**

🏝️ **1. Inseln erkunden**
Jede Insel hat ein Thema. Klicke auf eine Insel, um sie zu besuchen.

📺 **2. Video anschauen**
Auf jeder Insel wartet ein kurzes Video mit spannenden Tipps.

📜 **3. Wissen sammeln**
Lies die Erklaerung und entdecke neue Strategien.

💎 **4. Schaetze finden**
Sammle Schaetze und verdiene XP fuer deinen Fortschritt!

---

**🔮 Was noch kommt...**

⚔️ *Quiz-Kaempfe* - Bald kannst du dein Wissen in spannenden Kaempfen testen!
Wie bei einem Bossfight: Jede richtige Antwort macht Schaden!

🏆 *Challenges* - Wochen-Aufgaben warten auf dich!
Setze das Gelernte im echten Leben um und werde zum Meister.

*(Diese Features schalten sich frei, wenn du die ersten Inseln erkundet hast)*
""",
            },
            {
                "id": "group_chat",
                "title": "👥 Deine Lerngruppe",
                "type": "link",
                "description": "Tritt deiner Gruppe bei und tausche dich mit anderen Entdeckern aus!",
                "placeholder": True,  # Link kommt spaeter
            },
        ],
        "treasures": [
            {
                "id": "kompass",
                "name": "🧭 Kompass der Reise",
                "description": "Du hast das Tutorial abgeschlossen! Dein Kompass zeigt dir den Weg.",
                "xp": 20,
            }
        ],
        # Keine Quiz/Challenge im Starthafen
        "has_quiz": False,
        "has_challenge": False,
    },

    "festung": {
        "name": "Festung der Stärke",
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
        "week": 4,
        "treasures": [
            {"id": "faden", "name": "🧵 Faden-Spule", "xp": 50},
            {"id": "netz", "name": "🕸 Netz-Karte", "xp": 60},
        ]
    },

    "bruecken": {
        "name": "Insel der Bruecken",
        "icon": "🌉",
        "color": "#fff176",
        "week": 3,
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
        "type": "flexible",
        "treasures": [
            {"id": "spiegel", "name": "🪞 Spiegel der Erkenntnis", "xp": 50},
        ]
    },

    "vulkan": {
        "name": "Vulkan der Motivation",
        "icon": "🔥",
        "color": "#ef5350",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "flamme", "name": "🔥 Freiheits-Flamme", "xp": 50},
        ]
    },

    "ruhe_oase": {
        "name": "Ruhe-Oase",
        "icon": "😌",
        "color": "#80deea",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "atem", "name": "🌬 Atem-Brunnen", "xp": 50},
        ]
    },

    "ausdauer_gipfel": {
        "name": "Ausdauer-Gipfel",
        "icon": "🏆",
        "color": "#ffcc80",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "seil", "name": "🧗 Kletter-Seil", "xp": 50},
        ]
    },

    "fokus_leuchtturm": {
        "name": "Fokus-Leuchtturm",
        "icon": "🎯",
        "color": "#ffab91",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "licht", "name": "💡 Fokus-Licht", "xp": 50},
        ]
    },

    "wachstum_garten": {
        "name": "Wachstums-Garten",
        "icon": "🌱",
        "color": "#c5e1a5",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "noch", "name": "🌱 Das Wort 'NOCH'", "xp": 50},
        ]
    },

    "lehrer_turm": {
        "name": "Lehrer-Turm",
        "icon": "🏫",
        "color": "#b39ddb",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "fragen", "name": "❓ Frage-Schluessel", "xp": 50},
        ]
    },

    "wohlfuehl_dorf": {
        "name": "Wohlfühl-Dorf",
        "icon": "🏠",
        "color": "#a5d6a7",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "platz", "name": "🏡 Mein Platz", "xp": 50},
        ]
    },

    "schutz_burg": {
        "name": "Schutz-Burg",
        "icon": "🛡",
        "color": "#f48fb1",
        "week": None,
        "type": "flexible",
        "treasures": [
            {"id": "schild", "name": "🛡 Grenzen-Schild", "xp": 50},
        ]
    },

    # ======= FINALE (Woche 12) =======

    "meister_berg": {
        "name": "Berg der Meisterschaft",
        "icon": "⛰️",
        "color": "#ffd700",
        "week": 12,
        "description": "Du hast es geschafft! Zeit zum Feiern und Reflektieren.",
        "type": "finale",
        "content": {
            "is_group_event": True,
            "reflection_questions": [
                "Was habe ich in den 12 Wochen gelernt?",
                "Welche Technik hat mir am meisten geholfen?",
                "Was hat sich fuer mich veraendert?",
                "Was moechte ich weiter anwenden?",
            ]
        },
        "treasures": [
            {
                "id": "meister_krone",
                "name": "👑 Meister-Krone",
                "description": "Du bist jetzt ein Lern-Meister!",
                "xp": 500,
            }
        ]
    },
}

def get_island(island_id):
    return ISLANDS.get(island_id)

if __name__ == "__main__":
    print(f"Inseln: {len(ISLANDS)}")
    for k, v in ISLANDS.items():
        print(f"  {v['icon']} {v['name']}")
