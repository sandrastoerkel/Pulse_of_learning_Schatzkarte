# -*- coding: utf-8 -*-
"""Insel-Daten für die Schatzkarte - ERWEITERT mit Polarstern."""

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
        "type": "tutorial",  # Spezieller Typ für Tutorial-Insel
        "content": {
            "welcome_video_url": "",  # Platzhalter - URL kommt später
            "show_group_chat_link": True,
        },
        # Tutorial-Schritte im Nintendo-Stil (eins nach dem anderen)
        # ERWEITERT um Polarstern!
        "tutorial_steps": [
            {
                "id": "welcome",
                "title": "🎬 Willkommen, Entdecker!",
                "type": "video",
                "description": "Schau dir das kurze Video an und erfahre, was dich erwartet!",
                "placeholder": True,  # Video kommt später
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
Lies die Erklärung und entdecke neue Strategien.

💎 **4. Schätze finden**
Sammle Schätze und verdiene XP für deinen Fortschritt!

---

**🔮 Was noch kommt...**

⚔️ *Quiz-Kämpfe* - Bald kannst du dein Wissen in spannenden Kämpfen testen!
Wie bei einem Bossfight: Jede richtige Antwort macht Schaden!

🏆 *Challenges* - Wochen-Aufgaben warten auf dich!
Setze das Gelernte im echten Leben um und werde zum Meister.

*(Diese Features schalten sich frei, wenn du die ersten Inseln erkundet hast)*
""",
            },
            # ⭐ NEU: POLARSTERN TUTORIAL-STEP
            {
                "id": "polarstern",
                "title": "⭐ Dein Polarstern",
                "type": "goal_setting",
                "description": "Setze deine Ziele und Träume - dein Polarstern zeigt dir den Weg!",
                "content": """
**⭐ Der Polarstern zeigt dir den Weg!**

Wie echte Seefahrer nutzen wir den Polarstern zur Navigation.
Er hilft dir, deine **Ziele und Träume** immer im Blick zu behalten.

**Die 3 magischen Fragen:**

🎯 **Wo will ich hin?**
Was ist dein Ziel? Was möchtest du erreichen?

📍 **Wo bin ich jetzt?**
Wie sieht es gerade bei dir aus?

🛤️ **Wie komme ich dahin?**
Was wirst du konkret tun?

---

**Du kannst verschiedene Ziele setzen:**

🎯 Schulische Ziele (Noten, Fächer)
🚀 Berufswünsche (Was willst du mal werden?)
💪 Persönliche Ziele (Ängste überwinden)
🎨 Hobbys & Talente (Neues lernen)
👥 Soziale Ziele (Freundschaften)
✨ Große Träume (Deine Visionen!)

**Klicke auf den pulsierenden Stern oben rechts, um deinen ersten Polarstern zu setzen!**
""",
                "xp_reward": 20,  # XP für das Lesen des Polarstern-Tutorials
            },
            {
                "id": "group_chat",
                "title": "👥 Deine Lerngruppe",
                "type": "link",
                "description": "Tritt deiner Gruppe bei und tausche dich mit anderen Entdeckern aus!",
                "placeholder": True,  # Link kommt später
            },
        ],
        "treasures": [
            {
                "id": "kompass",
                "name": "🧭 Kompass der Reise",
                "description": "Du hast das Tutorial abgeschlossen! Dein Kompass zeigt dir den Weg.",
                "xp": 20,
            },
            # ⭐ NEU: Polarstern-Schatz
            {
                "id": "erster_stern",
                "name": "⭐ Erster Stern",
                "description": "Du hast deinen ersten Polarstern gesetzt! Dein Weg ist jetzt klar.",
                "xp": 30,
                "unlock_condition": "polarstern_first_goal",  # Wird freigeschaltet wenn erstes Ziel gesetzt
            },
        ],
        # Keine Quiz/Challenge im Starthafen
        "has_quiz": False,
        "has_challenge": False,
    },

    "festung": {
        "name": "Mental stark",
        "icon": "💪",
        "color": "#ffb74d",
        "week": 1,
        "description": "Entdecke die Kraft der Selbstwirksamkeit!",
        "treasures": [
            {"id": "kleine_siege", "name": "💎 Kleine Siege", "xp": 50},
            {"id": "vorbilder", "name": "💎 Vorbilder", "xp": 50},
            {"id": "aufmunterung", "name": "💎 Aufmunterung", "xp": 50},
            {"id": "ruhig_bleiben", "name": "💎 Ruhig bleiben", "xp": 50},
        ]
    },

    "werkzeuge": {
        "name": "Cleverer lernen",
        "icon": "📚",
        "color": "#81c784",
        "week": 2,
        "description": "Lerne die besten Lernstrategien kennen!",
        "treasures": [
            {"id": "pomodoro", "name": "🍅 Magische Tomate", "xp": 50},
            {"id": "active_recall", "name": "🔄 Erinnerungs-Spiegel", "xp": 50},
            {"id": "feynman", "name": "👶 Teddy-Brille", "xp": 50},
        ]
    },

    "faeden": {
        "name": "Insel der Fäden",
        "icon": "🧵",
        "color": "#ba68c8",
        "week": 4,
        "description": "Verknüpfe dein Wissen wie ein Netz!",
        "treasures": [
            {"id": "faden", "name": "🧵 Faden-Spule", "xp": 50},
            {"id": "netz", "name": "🕸 Netz-Karte", "xp": 60},
        ]
    },

    "bruecken": {
        "name": "Transferlernen",
        "icon": "🌉",
        "color": "#fff176",
        "week": 3,
        "description": "Übertrage dein Wissen in neue Situationen!",
        "treasures": [
            {"id": "bridge_1", "name": "🌉 Teil weg = Minus", "xp": 60},
            {"id": "bridge_2", "name": "🌉 Mehrere gleiche = Mal", "xp": 60},
        ]
    },

    # ======= FLEXIBLE INSELN (Woche 5-13) =======

    "spiegel_see": {
        "name": "Über dein Lernen nachdenken",
        "icon": "🧠",
        "color": "#90caf9",
        "week": None,
        "type": "flexible",
        "description": "Reflektiere über dein eigenes Lernen!",
        "treasures": [
            {"id": "spiegel", "name": "🪞 Spiegel der Erkenntnis", "xp": 50},
        ]
    },

    "vulkan": {
        "name": "Was dich antreibt",
        "icon": "🔥",
        "color": "#ef5350",
        "week": None,
        "type": "flexible",
        "description": "Entfache dein inneres Feuer!",
        "treasures": [
            {"id": "flamme", "name": "🔥 Freiheits-Flamme", "xp": 50},
        ]
    },

    "ruhe_oase": {
        "name": "Weniger Stress beim Lernen",
        "icon": "😌",
        "color": "#80deea",
        "week": None,
        "type": "flexible",
        "description": "Lerne, mit Prüfungsangst umzugehen!",
        "treasures": [
            {"id": "atem", "name": "🌬 Atem-Brunnen", "xp": 50},
        ]
    },

    "ausdauer_gipfel": {
        "name": "Länger dranbleiben können",
        "icon": "🏆",
        "color": "#ffcc80",
        "week": None,
        "type": "flexible",
        "description": "Trainiere dein Durchhaltevermögen!",
        "treasures": [
            {"id": "seil", "name": "🧗 Kletter-Seil", "xp": 50},
        ]
    },

    "fokus_leuchtturm": {
        "name": "Fokus halten",
        "icon": "🎯",
        "color": "#ffab91",
        "week": None,
        "type": "flexible",
        "description": "Schärfe deine Konzentration!",
        "treasures": [
            {"id": "licht", "name": "💡 Fokus-Licht", "xp": 50},
        ]
    },

    "wachstum_garten": {
        "name": "Glauben, dass du wachsen kannst",
        "icon": "🌱",
        "color": "#c5e1a5",
        "week": None,
        "type": "flexible",
        "description": "Entwickle ein Growth Mindset!",
        "treasures": [
            {"id": "noch", "name": "🌱 Das Wort 'NOCH'", "xp": 50},
        ]
    },

    "lehrer_turm": {
        "name": "Besser mit Lehrern klarkommen",
        "icon": "🏫",
        "color": "#b39ddb",
        "week": None,
        "type": "flexible",
        "description": "Baue gute Beziehungen zu Lehrern auf!",
        "treasures": [
            {"id": "fragen", "name": "❓ Frage-Schlüssel", "xp": 50},
        ]
    },

    "wohlfuehl_dorf": {
        "name": "Dich in der Schule wohlfühlen",
        "icon": "🏠",
        "color": "#a5d6a7",
        "week": None,
        "type": "flexible",
        "description": "Finde deinen Platz in der Klasse!",
        "treasures": [
            {"id": "platz", "name": "🏡 Mein Platz", "xp": 50},
        ]
    },

    "schutz_burg": {
        "name": "Wenn andere dich fertig machen",
        "icon": "🛡",
        "color": "#f48fb1",
        "week": None,
        "type": "flexible",
        "description": "Lerne, dich zu schützen und Grenzen zu setzen!",
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
                "Was hat sich für mich verändert?",
                "Was möchte ich weiter anwenden?",
            ],
            # ⭐ NEU: Polarstern-Reflexion am Ende
            "polarstern_reflection": {
                "title": "⭐ Deine Polarstern-Reise",
                "questions": [
                    "Welche Ziele hast du erreicht?",
                    "Was hast du über dich selbst gelernt?",
                    "Welche neuen Ziele möchtest du setzen?",
                ]
            }
        },
        "treasures": [
            {
                "id": "meister_krone",
                "name": "👑 Meister-Krone",
                "description": "Du bist jetzt ein Lern-Meister!",
                "xp": 500,
            },
            # ⭐ NEU: Polarstern-Meister Schatz
            {
                "id": "polarstern_meister",
                "name": "⭐ Polarstern-Meister",
                "description": "Du hast gelernt, deine Ziele zu verfolgen!",
                "xp": 200,
                "unlock_condition": "polarstern_3_achieved",  # 3+ Ziele erreicht
            },
        ]
    },
}


def get_island(island_id):
    """Gibt eine Insel zurück."""
    return ISLANDS.get(island_id)


def get_islands_by_week(week: int):
    """Gibt alle Inseln für eine bestimmte Woche zurück."""
    return {k: v for k, v in ISLANDS.items() if v.get("week") == week}


def get_flexible_islands():
    """Gibt alle flexiblen Inseln zurück."""
    return {k: v for k, v in ISLANDS.items() if v.get("type") == "flexible"}


def get_polarstern_tutorial_content(age_group: str = 'unterstufe') -> dict:
    """
    Gibt den altersgerechten Polarstern-Tutorial-Content zurück.
    
    Args:
        age_group: 'grundschule', 'unterstufe', 'mittelstufe', 'oberstufe'
    
    Returns:
        dict mit title, description, content
    """
    contents = {
        'grundschule': {
            "title": "⭐ Dein Wunsch-Stern!",
            "description": "Was wünschst du dir? Der Polarstern hilft dir, deine Träume zu erreichen!",
            "content": """
**⭐ Der Polarstern ist dein Wunsch-Stern!**

Weißt du, wie Piraten früher den Weg gefunden haben? 
Sie haben nach dem Polarstern geschaut! 🏴‍☠️

Dein Polarstern hilft dir auch, deinen Weg zu finden.
Du kannst ihm deine **Wünsche und Träume** erzählen!

**Die 3 Zauber-Fragen:**

🎯 **Was wünsche ich mir?**
Was möchtest du können oder erreichen?

📍 **Wie ist es jetzt?**
Wie gut kannst du es schon?

🛤️ **Was kann ich tun?**
Welche kleinen Schritte kannst du machen?

---

**Du kannst alles Mögliche wünschen:**

🎯 Bessere Noten
🚀 Was du mal werden willst
💪 Mutiger werden
🎨 Etwas Neues lernen
👥 Neue Freunde finden
✨ Deinen größten Traum!

**Klicke auf den leuchtenden Stern oben rechts!** ⭐
""",
        },
        'unterstufe': {
            "title": "⭐ Dein Polarstern",
            "description": "Setze deine Ziele und Träume - dein Polarstern zeigt dir den Weg!",
            "content": ISLANDS["start"]["tutorial_steps"][2]["content"],  # Standard-Content
        },
        'mittelstufe': {
            "title": "⭐ Dein Polarstern - Ziele setzen",
            "description": "Definiere klare Ziele und Strategien für deinen Erfolg.",
            "content": """
**⭐ Der Polarstern - Dein Kompass für Erfolg**

Erfolgreiche Menschen haben eines gemeinsam: Sie setzen sich **klare Ziele** 
und wissen, wie sie diese erreichen wollen.

**Die 3 Schlüsselfragen (aus der Zielsetzungsforschung):**

🎯 **Ziel definieren** - Was genau will ich erreichen?
Je konkreter, desto besser. "Besser in Mathe" ist vage, 
"Note 2 in der nächsten Klausur" ist messbar.

📍 **Standort bestimmen** - Wo stehe ich gerade?
Ehrliche Selbsteinschätzung ist der erste Schritt.

🛤️ **Strategie planen** - Wie komme ich dahin?
Welche konkreten Schritte werde ich unternehmen?

---

**Zielkategorien:**

🎯 **Schulisch** - Noten, Prüfungen, Fächer
🚀 **Beruflich** - Praktika, Berufsorientierung
💪 **Persönlich** - Soft Skills, Gewohnheiten
🎨 **Interessen** - Hobbys, Talente entwickeln
👥 **Sozial** - Netzwerk, Teamfähigkeit

**Tipp:** Setze 2-3 Ziele gleichzeitig, nicht mehr.
Überprüfe sie wöchentlich und passe sie an.
""",
        },
        'oberstufe': {
            "title": "⭐ Polarstern - Strategische Zielplanung",
            "description": "Professionelle Zielsetzung für Abitur, Studium und Karriere.",
            "content": """
**⭐ Der Polarstern - Professionelle Zielplanung**

Die Methode basiert auf dem **OKR-Framework** (Objectives and Key Results), 
das von Google und anderen erfolgreichen Unternehmen genutzt wird.

**Die 3 Kernfragen:**

🎯 **Objective** - Was ist mein übergeordnetes Ziel?
Formuliere ein inspirierendes, aber erreichbares Ziel.

📍 **Current State** - Wo stehe ich aktuell?
Ehrliche Gap-Analyse zwischen Ist und Soll.

🛤️ **Key Results** - Welche messbaren Ergebnisse strebe ich an?
Definiere 2-3 konkrete, messbare Zwischenziele.

---

**Zielkategorien für die Oberstufe:**

🎯 **Akademisch** - Abiturnote, NC, Klausurvorbereitung
🚀 **Karriere** - Studienorientierung, Gap Year, Bewerbungen
💪 **Persönlich** - Stressmanagement, Work-Life-Balance
🎨 **Portfolio** - Projekte, Engagement, Zertifikate

**Best Practices:**
- SMART-Kriterien anwenden (Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert)
- Wöchentliche Reviews durchführen
- Ziele schriftlich festhalten und visualisieren
- Accountability Partner einbinden
""",
        }
    }
    
    return contents.get(age_group, contents['unterstufe'])


if __name__ == "__main__":
    print(f"Inseln: {len(ISLANDS)}")
    for k, v in ISLANDS.items():
        print(f"  {v['icon']} {v['name']}")
    
    print("\n⭐ Polarstern-Tutorial für Grundschule:")
    content = get_polarstern_tutorial_content('grundschule')
    print(f"  Title: {content['title']}")
