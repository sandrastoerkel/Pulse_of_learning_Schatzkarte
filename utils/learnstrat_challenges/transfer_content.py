"""
🚀 Transfer-Challenge Content
=============================

Challenge 2: Das Geheimnis der Überflieger
Wissenschaftlich fundiert: Effektstärke d=0.75-0.86 (Hattie)

Transfer = Wissen von einer Situation auf andere übertragen
- Near Transfer: Ähnliche Situationen
- Far Transfer: Komplett verschiedene Situationen
- Brückenprinzipien: Das PRINZIP erkennen

Quellen:
- Hattie (2023): Transfer strategies d=0.86
- Perkins & Salomon (1992): Hugging & Bridging
- Thorndike (1901): Common-elements theory
"""

from typing import Dict, Any, List

# ============================================
# EFFEKTSTÄRKE
# ============================================

TRANSFER_EFFECT_SIZE = 0.86  # Eine der höchsten überhaupt!

# ============================================
# XP KONFIGURATION
# ============================================

TRANSFER_XP = {
    "phase_discovery": 30,      # Phase 1: Das Geheimnis entdecken
    "phase_near": 30,           # Phase 2: Near Transfer
    "phase_far": 35,            # Phase 3: Far Transfer (schwieriger!)
    "phase_bridging": 30,       # Phase 4: Brückenprinzipien
    "transfer_check": 25,       # Finale: Transfer-Check bestanden
    "creative_bonus": 10,       # Bonus für besonders kreative Analogien
}

# ============================================
# PHASE 1: DAS TRANSFER-GEHEIMNIS
# ============================================

PHASE_1_CONTENT = {
    "title": "Das Transfer-Geheimnis",
    "icon": "🔮",
    "core_concept": "Überflieger sind nicht schlauer – sie können ihr Wissen ÜBERTRAGEN!",
    "effect_note": "Transfer-Strategien: d=0.86 – einer der stärksten Lerneffekte überhaupt!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """Kennst du diese Kids, die irgendwie ALLES können? 🦸‍♀️🦸‍♂️

Die sind nicht schlauer als du! Die haben ein Geheimnis entdeckt:
Sie können ihr Wissen wie einen **Zauberspruch** überall einsetzen!

Stell dir vor: Du lernst einen mega coolen Drachen-Move in einem Spiel. 🐉
Und plötzlich merkst du: Den gleichen Move kannst du auch beim Fangen spielen benutzen!

Das nennt man **Transfer** – und DU kannst das auch lernen!""",
            
            "story": """**Die Geschichte von Mia und dem Drachen-Geheimnis** 🐲

Mia liebte ihr Drachen-Spiel. Sie hatte gelernt, wie man den Drachen im perfekten Moment ausweichen lässt.

Eines Tages beim Völkerball merkte sie: "Hey, das ist ja wie beim Drachen!" 
Sie wich genauso aus – und niemand konnte sie treffen!

Ihr Geheimnis? Sie hatte das PRINZIP verstanden: 
"Beobachte, warte, dann blitzschnell zur Seite!"

Das funktioniert bei Drachen, beim Völkerball, sogar beim Verstecken!""",
            
            "exercise": {
                "title": "Dein erster Transfer-Zauber! ✨",
                "instruction": "Denk an etwas Cooles, das du richtig gut kannst (Tanzen, Gaming, Sport...). Wo könntest du das GLEICHE Prinzip noch benutzen?",
                "examples": [
                    "🎮 Gaming-Reaktionen → Beim Sport schnell reagieren",
                    "💃 Tanz-Rhythmus → Mathe-Muster erkennen", 
                    "⚽ Ball-Timing → Musik-Takt treffen",
                ],
                "prompt": "Ich kann gut: _______ \nDas gleiche Prinzip hilft mir bei: _______",
            },
            
            "fun_fact": "Wissenschaftler haben herausgefunden: Wer Transfer lernt, wird in ALLEN Fächern besser! 🧠✨",
        },
        
        "unterstufe": {
            "intro": """Kennst du die Leute, die irgendwie alles checken? 🤔

Die haben ein Geheimnis, das die meisten nicht kennen:
Sie können ihr Wissen **übertragen** – von einer Situation zur nächsten!

Das ist wie ein Cheat-Code fürs Lernen. Und das Beste?
Jeder kann das lernen. Effektstärke d=0.86 – wissenschaftlich bewiesen!

Das bedeutet: Transfer-Strategien gehören zu den STÄRKSTEN Lernmethoden überhaupt.""",
            
            "story": """**Warum Tim plötzlich in Mathe besser wurde** 📈

Tim war gut in Fortnite. Er wusste genau, wie man Ressourcen einteilt.

Eines Tages in Mathe: Textaufgabe über Taschengeld einteilen.
Tim dachte: "Moment... das ist ja wie bei meinen Ressourcen!"

Er benutzte die GLEICHE Denkweise – und löste die Aufgabe sofort.

Das Prinzip: "Einteilen, priorisieren, nichts verschwenden"
Funktioniert bei Games, Geld, Zeit, und sogar beim Lernen!""",
            
            "exercise": {
                "title": "Find den Transfer! 🔍",
                "instruction": "Nimm etwas, das du in einem Fach gelernt hast. Überlege: Wo könnte das GLEICHE Prinzip in einem anderen Fach helfen?",
                "examples": [
                    "📊 Prozentrechnung (Mathe) → Rabatte verstehen (Alltag)",
                    "🔬 Ursache-Wirkung (Bio) → Geschichtliche Zusammenhänge",
                    "📝 Textstruktur (Deutsch) → Experiment-Bericht (Chemie)",
                ],
                "prompt": "Fach 1: _______ Thema: _______\nGleiches Prinzip in Fach 2: _______",
            },
            
            "fun_fact": "Die besten Schüler haben nicht mehr Wissen – sie können es nur besser ANWENDEN! 🎯",
        },
        
        "mittelstufe": {
            "intro": """Transfer-Strategien haben eine Effektstärke von **d=0.86** – das ist enorm!

Zum Vergleich: Der Durchschnitt aller Lernmethoden liegt bei d=0.40.
Transfer ist also mehr als doppelt so effektiv wie eine durchschnittliche Methode.

**Was ist Transfer?**
Die Fähigkeit, Wissen und Fähigkeiten aus einem Kontext 
in einen neuen, anderen Kontext zu übertragen.

**Warum ist das so mächtig?**
Weil du nicht alles neu lernen musst – du baust auf dem auf, was du schon kannst!""",
            
            "story": """**Das Muster hinter dem Erfolg**

Forscher untersuchten, was Top-Performer von anderen unterscheidet.
Das Ergebnis überraschte: Es war NICHT mehr Intelligenz oder mehr Übung.

Der Unterschied: Sie erkannten **Muster und Prinzipien**, 
die sie auf neue Situationen übertragen konnten.

Ein Beispiel aus der Studie:
- Schüler A lernt 10 verschiedene Mathe-Formeln auswendig
- Schüler B versteht DAS PRINZIP hinter den Formeln

Bei einer neuen, unbekannten Aufgabe?
Schüler B löst sie – Schüler A ist aufgeschmissen.""",
            
            "exercise": {
                "title": "Prinzipien-Extraktion 🧬",
                "instruction": "Nimm ein Konzept aus deinem aktuellen Unterricht. Extrahiere das zugrundeliegende PRINZIP und finde 2 andere Anwendungen.",
                "examples": [
                    "⚖️ Gleichgewicht (Physik) → Chemische Reaktionen, Ökosysteme, Verhandlungen",
                    "📈 Exponentielles Wachstum (Mathe) → Viren, Zinsen, Social Media",
                    "🔄 Kreisläufe (Bio) → Wasserkreislauf, Wirtschaftskreislauf, Feedback-Loops",
                ],
                "prompt": "Konzept: _______\nPrinzip dahinter: _______\nAnwendung 1: _______\nAnwendung 2: _______",
            },
            
            "fun_fact": "Einstein sagte: 'Die Definition von Wahnsinn ist, immer das Gleiche zu tun und andere Ergebnisse zu erwarten.' Transfer ist das Gegenteil! 🧠",
        },
        
        "oberstufe": {
            "intro": """**Transfer-Strategien: d=0.86 (Hattie, 2023)**

Transfer ist laut Hattie das "Kennzeichen tiefen Lernens" und kann nicht ohne 
metakognitives Engagement stattfinden.

**Die drei Ebenen der Metakognition beim Transfer:**
1. **Planen:** Strategien für neue Herausforderungen auswählen
2. **Monitoren:** Erkennen, wann eine Strategie im neuen Kontext nützlich ist
3. **Evaluieren:** Analysieren, wie gut sie funktioniert hat und warum

**Near vs. Far Transfer:**
- Near: Zwischen ähnlichen Kontexten (leichter)
- Far: Zwischen verschiedenen Domänen (schwieriger, aber wertvoller)

Thorndike (1901) zeigte: Transfer hängt von gemeinsamen Elementen ab.
Perkins & Salomon (1992) entwickelten Hugging & Bridging als Strategien.""",
            
            "story": """**Die Forschung hinter dem Transfer**

Eine Metaanalyse von über 200 Studien zeigt:
Transfer passiert NICHT automatisch – er muss aktiv gefördert werden.

Drei kritische Erkenntnisse:

1. **Oberflächliche Ähnlichkeit täuscht**
   Lernende übertragen oft nicht, weil sie die TIEFE Struktur nicht erkennen.

2. **Explizites Training wirkt**
   Wenn Transfer explizit gelehrt wird, steigt die Rate signifikant.

3. **Metakognition ist der Schlüssel**
   Wer über sein eigenes Denken nachdenkt, transferiert besser.

Die Konsequenz: Transfer ist eine erlernbare Fähigkeit, keine Begabung.""",
            
            "exercise": {
                "title": "Metakognitiver Transfer-Plan 📋",
                "instruction": "Wähle ein Konzept aus deinem Leistungskurs. Entwickle einen systematischen Transfer-Plan.",
                "examples": [
                    "🧮 Differentialrechnung → Optimierungsprobleme in Wirtschaft, Physik, Biologie",
                    "📜 Rhetorik (Deutsch) → Argumentation in PoWi, Präsentationen, Debatten",
                    "🔬 Wissenschaftliche Methode → Alle empirischen Fächer, Alltagsentscheidungen",
                ],
                "prompt": "Konzept: _______\nTiefenstruktur/Prinzip: _______\nNear Transfer zu: _______\nFar Transfer zu: _______\nMetakognitive Strategie: _______",
            },
            
            "fun_fact": "Feynman war ein Meister des Transfers – er verband Physik mit Biologie, Kunst und sogar Safeknacken! 🎯",
        },
        
        "paedagogen": {
            "intro": """**Transfer-Strategien: d=0.86 (Visible Learning MetaX)**

Transfer ist laut Hattie (2023) das Kennzeichen tiefen Lernens.
Ohne metakognitives Engagement findet kein echter Transfer statt.

**Theoretischer Hintergrund:**
- Thorndike & Woodworth (1901): Common-elements theory
- Perkins & Salomon (1992): Hugging & Bridging
- Barnett & Ceci (2002): Taxonomie für Far Transfer

**Kritische Erkenntnis:**
Far Transfer ist selten und schwierig (Sala & Gobet, 2019).
Near Transfer ist häufiger, aber auch er muss explizit gefördert werden.""",
            
            "implementation": """**Strategien für den Unterricht:**

1. **Hugging (Perkins & Salomon)**
   - Lernsituationen so gestalten, dass sie der Anwendung ähneln
   - Simulationen, authentische Probleme, kontextreiches Lernen

2. **Bridging**
   - Explizit Brücken zwischen Kontexten bauen
   - "Wo könnte dieses Prinzip noch gelten?"
   - Vergleichende Szenarien anbieten

3. **Comparative Analysis**
   - Venn-Diagramme für Konzeptvergleiche
   - "Was ist hier gleich, was ist anders?"

4. **Prinzipien-Extraktion**
   - Vom Spezifischen zum Allgemeinen
   - "Was ist das Prinzip DAHINTER?"

**Wichtig:** Transfer nicht dem Zufall überlassen – explizit lehren!""",
            
            "research_note": "Perkins, D. & Salomon, G. (1992). Transfer of Learning. International Encyclopedia of Education. | Hattie, J. (2023). Visible Learning: The Sequel.",
        },
    },
}

# ============================================
# PHASE 2: NEAR TRANSFER
# ============================================

PHASE_2_CONTENT = {
    "title": "Near Transfer",
    "icon": "🎯",
    "core_concept": "Transfer zwischen ÄHNLICHEN Situationen – der erste Schritt!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """**Near Transfer** ist wie ein Level-Up im gleichen Spiel! 🎮

Du kennst Level 1? Dann ist Level 2 ähnlich – nur ein bisschen schwerer.
Das PRINZIP bleibt gleich, nur die Details ändern sich.

Beispiel:
- Du kannst 3+2 rechnen? 
- Dann kannst du auch 30+20! (Gleiches Prinzip, größere Zahlen!)""",
            
            "exercise": {
                "title": "Level-Up Challenge! 🆙",
                "instruction": "Schau dir die Beispiele an. Was ist das GLEICHE Prinzip?",
                "scenarios": [
                    {
                        "name": "Drachen-Training",
                        "level_1": "Du weichst einem langsamen Feuerball aus",
                        "level_2": "Du weichst einem SCHNELLEN Feuerball aus",
                        "principle": "Beobachten → Timing → Ausweichen",
                    },
                    {
                        "name": "Tanz-Move",
                        "level_1": "Du tanzt den Move zum langsamen Song",
                        "level_2": "Du tanzt den GLEICHEN Move zum schnellen Song",
                        "principle": "Die Bewegung bleibt gleich, nur das Tempo ändert sich",
                    },
                    {
                        "name": "Mathe-Trick",
                        "level_1": "5 + 3 = 8",
                        "level_2": "50 + 30 = ?",
                        "principle": "Addieren funktioniert immer gleich!",
                        "answer": "80",
                    },
                ],
                "prompt": "Finde das Prinzip: Was bleibt GLEICH, was ändert sich?",
            },
            
            "fun_fact": "Near Transfer ist wie Aufwärmen – es bereitet dich auf die richtig coolen Transfers vor! 💪",
        },
        
        "unterstufe": {
            "intro": """**Near Transfer** = Wissen auf ähnliche Situationen übertragen

Das ist der "einfache" Transfer – aber auch der wichtigste erste Schritt!

Beispiele für Near Transfer:
- Rechteck-Fläche berechnen → Quadrat-Fläche berechnen (gleiche Formel!)
- Englisch-Vokabeln lernen → Spanisch-Vokabeln lernen (gleiche Methode!)
- Fahrrad fahren → E-Scooter fahren (gleiches Gleichgewichtsprinzip!)

Der Schlüssel: Erkenne, was GLEICH bleibt!""",
            
            "exercise": {
                "title": "Spot the Transfer! 🔍",
                "instruction": "Verbinde die Situationen, die das GLEICHE Prinzip nutzen.",
                "scenarios": [
                    {
                        "situation_a": "Du löst eine Gleichung: 2x + 5 = 15",
                        "situation_b": "Du löst: 3x + 7 = 22",
                        "principle": "Gleiche Lösungsstrategie: Isoliere x",
                    },
                    {
                        "situation_a": "Du schreibst eine Inhaltsangabe zu einer Geschichte",
                        "situation_b": "Du schreibst eine Inhaltsangabe zu einem Film",
                        "principle": "Gleiches Format: Wer? Was? Wo? Wann? Warum?",
                    },
                    {
                        "situation_a": "Du merkst dir Vokabeln mit Karteikarten",
                        "situation_b": "Du merkst dir Geschichtsdaten mit Karteikarten",
                        "principle": "Gleiche Methode: Active Recall + Spaced Repetition",
                    },
                ],
                "prompt": "Was ist das gemeinsame PRINZIP?",
            },
            
            "fun_fact": "Wenn du Near Transfer beherrschst, hast du schon 50% des Weges geschafft! 🎯",
        },
        
        "mittelstufe": {
            "intro": """**Near Transfer** bezeichnet den Wissenstransfer zwischen ähnlichen Kontexten.

**Warum ist das wichtig?**
Near Transfer ist die Grundlage für alles Weitere.
Wer hier scheitert, wird auch bei Far Transfer Probleme haben.

**Die Schlüsselfrage:**
"Was ist hier STRUKTURELL gleich, auch wenn es oberflächlich anders aussieht?"

**Beispiel:**
Lineare Funktion f(x) = mx + b
vs.
Lineare Funktion g(t) = at + c

→ Andere Buchstaben, GLEICHES Prinzip!""",
            
            "exercise": {
                "title": "Strukturelle Ähnlichkeit erkennen 🔬",
                "instruction": "Analysiere die Paare. Identifiziere die gemeinsame TIEFENSTRUKTUR.",
                "scenarios": [
                    {
                        "pair": ["Quadratische Gleichung lösen", "Parabel-Nullstellen finden"],
                        "surface": "Unterschiedliche Fragestellung",
                        "deep_structure": "Gleiche mathematische Operation (abc-Formel)",
                    },
                    {
                        "pair": ["Gedichtanalyse", "Redeanalyse"],
                        "surface": "Unterschiedliche Textsorte",
                        "deep_structure": "Gleiche Analysekategorien (Stilmittel, Intention, Wirkung)",
                    },
                    {
                        "pair": ["pH-Wert berechnen (Chemie)", "Dezibel berechnen (Physik)"],
                        "surface": "Unterschiedliche Fächer",
                        "deep_structure": "Gleiche Mathematik (Logarithmus)",
                    },
                ],
                "prompt": "Oberfläche vs. Tiefenstruktur – was ist der Schlüssel?",
            },
            
            "fun_fact": "Experten unterscheiden sich von Novizen hauptsächlich durch ihre Fähigkeit, Tiefenstrukturen zu erkennen! 🧠",
        },
        
        "oberstufe": {
            "intro": """**Near Transfer: Theoretischer Hintergrund**

Nach Thorndike & Woodworth (1901) hängt Transfer von 
gemeinsamen Elementen zwischen Situationen ab.

**Near Transfer** zeichnet sich aus durch:
- Hohe Oberflächenähnlichkeit
- Gleiche oder ähnliche Prozeduren
- Verwandte Domänen
- Zeitliche Nähe zum Lernen

**Problem:** Selbst Near Transfer passiert nicht automatisch.
Studien zeigen: Ohne explizite Hinweise übersehen Lernende 
oft die Verbindung zwischen ähnlichen Aufgaben.

**Lösung:** Aktives Suchen nach strukturellen Ähnlichkeiten.""",
            
            "exercise": {
                "title": "Transfer-Mapping 🗺️",
                "instruction": "Erstelle eine Transfer-Map: Welche Konzepte aus Fach A lassen sich auf Fach B übertragen?",
                "scenarios": [
                    {
                        "domain_a": "Analysis (Mathematik)",
                        "domain_b": "Kinematik (Physik)",
                        "transfers": [
                            "Ableitung → Geschwindigkeit",
                            "Integral → Zurückgelegte Strecke",
                            "Extremstellen → Umkehrpunkte",
                        ],
                    },
                    {
                        "domain_a": "Argumentationstheorie (Deutsch)",
                        "domain_b": "Wissenschaftliche Methode",
                        "transfers": [
                            "These → Hypothese",
                            "Argument → Evidenz",
                            "Gegenargument → Falsifikation",
                        ],
                    },
                ],
                "prompt": "Erstelle deine eigene Transfer-Map für zwei deiner Fächer.",
            },
            
            "fun_fact": "Interdisziplinäre Forschung basiert auf systematischem Near Transfer zwischen verwandten Feldern! 🔗",
        },
        
        "paedagogen": {
            "intro": """**Near Transfer im Unterricht**

Near Transfer ist die Voraussetzung für Far Transfer.
Ohne sichere Beherrschung von Near Transfer scheitern Lernende 
oft an komplexeren Transferaufgaben.

**Didaktische Implikationen:**
1. Variation innerhalb der Domäne anbieten
2. Explizit auf strukturelle Ähnlichkeiten hinweisen
3. "Gleich oder anders?" als Leitfrage etablieren""",
            
            "implementation": """**Konkrete Strategien:**

1. **Aufgaben-Variation**
   - Gleiche Struktur, andere Zahlen/Namen/Kontexte
   - Bewusst Oberflächenmerkmale variieren

2. **Vergleichs-Aufgaben**
   - "Vergleiche Aufgabe A und B. Was ist gleich?"
   - Explizite Reflexion über Gemeinsamkeiten

3. **Transfer-Checks**
   - Nach jeder Einheit: "Wo begegnet dir das noch?"
   - Schüler Beispiele sammeln lassen

4. **Fehler als Lernchance**
   - Wenn Transfer scheitert: "Was hast du übersehen?"
   - Metakognitive Reflexion fördern""",
            
            "research_note": "Barnett, S. M. & Ceci, S. J. (2002). When and Where Do We Apply What We Learn? A Taxonomy for Far Transfer. Psychological Bulletin.",
        },
    },
}

# ============================================
# PHASE 3: FAR TRANSFER
# ============================================

PHASE_3_CONTENT = {
    "title": "Far Transfer",
    "icon": "🚀",
    "core_concept": "Transfer zwischen VERSCHIEDENEN Situationen – hier wird's spannend!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """**Far Transfer** ist wie ein Superhelden-Power! 🦸

Du nimmst etwas, das du in EINER Sache gelernt hast...
...und benutzt es in einer KOMPLETT ANDEREN Sache!

Das ist schwieriger – aber auch VIEL cooler!

Beispiel:
- Du lernst beim Tanzen, auf den Rhythmus zu achten 💃
- Plötzlich merkst du: Mathe-Muster sind auch wie Rhythmus! 🔢
- Und beim Seilspringen hilft dir der Rhythmus auch! 🪢""",
            
            "exercise": {
                "title": "Superhelden-Transfer! 🦸‍♀️",
                "instruction": "Finde die versteckte Verbindung zwischen diesen total verschiedenen Dingen!",
                "scenarios": [
                    {
                        "thing_a": "Minecraft: Du planst, bevor du baust",
                        "thing_b": "Aufsatz: Du planst, bevor du schreibst",
                        "hidden_principle": "ERST denken, DANN machen!",
                        "icon_a": "🎮",
                        "icon_b": "✍️",
                    },
                    {
                        "thing_a": "Fußball: Du passt den Ball zum freien Spieler",
                        "thing_b": "Gruppenarbeit: Du gibst die Aufgabe an den, der sie kann",
                        "hidden_principle": "Finde den besten Weg zum Ziel!",
                        "icon_a": "⚽",
                        "icon_b": "👥",
                    },
                    {
                        "thing_a": "TikTok-Tanz: Du übst schwierige Moves extra oft",
                        "thing_b": "Vokabeln: Du übst schwierige Wörter extra oft",
                        "hidden_principle": "Mehr üben, was schwer ist!",
                        "icon_a": "💃",
                        "icon_b": "📚",
                    },
                ],
                "challenge": "Jetzt DU: Finde eine Verbindung zwischen deinem Lieblingshobby und der Schule!",
            },
            
            "fun_fact": "Die besten Erfinder können Far Transfer! Sie verbinden Ideen, die niemand vorher verbunden hat! 💡",
        },
        
        "unterstufe": {
            "intro": """**Far Transfer** = Wissen auf KOMPLETT ANDERE Situationen übertragen

Das ist der Boss-Level des Lernens! 👑

Warum ist das so mächtig?
Weil du plötzlich überall Verbindungen siehst, 
die andere nicht sehen!

**Beispiele für Far Transfer:**
- Dreisatz (Mathe) → Rezept umrechnen (Kochen) → Benzinverbrauch berechnen (Alltag)
- Storytelling (Deutsch) → Präsentationen (alle Fächer) → Social Media Posts
- Teamwork (Sport) → Gruppenarbeit (Schule) → Später im Job""",
            
            "exercise": {
                "title": "Cross-Domain Challenge! 🌍",
                "instruction": "Nimm ein Prinzip aus Spalte A und finde eine Anwendung in Spalte B!",
                "column_a": [
                    {"subject": "Mathe", "concept": "Variablen (x steht für eine Zahl)"},
                    {"subject": "Sport", "concept": "Aufwärmen vor der Belastung"},
                    {"subject": "Musik", "concept": "Wiederholung macht den Song eingängig"},
                ],
                "column_b": [
                    {"subject": "Kochen", "hint": "Platzhalter für Zutaten"},
                    {"subject": "Lernen", "hint": "Bevor es ans Eingemachte geht"},
                    {"subject": "Präsentieren", "hint": "Was soll hängen bleiben?"},
                ],
                "solutions": [
                    "Variable = Zutat im Rezept (kann man austauschen!)",
                    "Aufwärmen = Easy Thema zuerst, dann das Schwere",
                    "Wiederholung = Die Kernbotschaft mehrmals sagen",
                ],
            },
            
            "fun_fact": "Steve Jobs verband Kalligraphie mit Computern – das Ergebnis war die erste schöne Schriftart auf dem Mac! ✨",
        },
        
        "mittelstufe": {
            "intro": """**Far Transfer: Die Königsdisziplin**

Far Transfer ist schwierig – und genau deshalb so wertvoll!

**Warum ist Far Transfer schwer?**
- Die Oberfläche sieht komplett anders aus
- Man muss das PRINZIP erkennen, nicht die Details
- Es erfordert Abstraktion und Kreativität

**Die Schlüsselfrage:**
"Was ist das UNIVERSELLE Prinzip, das in beiden Situationen gilt?"

**Beispiel:**
Natürliche Selektion (Biologie) = "Das Passende überlebt"
→ Wirtschaft: Erfolgreiche Firmen überleben
→ Sprache: Nützliche Wörter bleiben erhalten
→ Memes: Lustige Memes werden geteilt und überleben""",
            
            "exercise": {
                "title": "Analogie-Maschine 🔧",
                "instruction": "Erstelle kreative Analogien zwischen völlig verschiedenen Bereichen!",
                "template": {
                    "format": "[Konzept A] ist wie [Konzept B], weil beide [gemeinsames Prinzip]",
                    "examples": [
                        {
                            "concept_a": "Das Immunsystem (Bio)",
                            "concept_b": "Ein Antivirus-Programm (IT)",
                            "principle": "Erkennt Eindringlinge und neutralisiert sie",
                        },
                        {
                            "concept_a": "Angebot und Nachfrage (Wirtschaft)",
                            "concept_b": "Chemisches Gleichgewicht",
                            "principle": "Systeme streben nach Balance",
                        },
                        {
                            "concept_a": "Feedback-Schleifen (Technik)",
                            "concept_b": "Lernen aus Fehlern",
                            "principle": "Output beeinflusst Input für Verbesserung",
                        },
                    ],
                },
                "challenge": "Erstelle 3 eigene Analogien zwischen Schulfächern und deinem Alltag!",
            },
            
            "fun_fact": "Die größten wissenschaftlichen Durchbrüche kamen oft durch Far Transfer – Darwin übertrug Wirtschaftstheorie auf Biologie! 🧬",
        },
        
        "oberstufe": {
            "intro": """**Far Transfer: Theoretische Fundierung**

Far Transfer ist laut Sala & Gobet (2019) selten und schwierig.
Dennoch ist er das Ziel jeder höheren Bildung.

**Barnett & Ceci (2002) identifizieren Dimensionen:**
- Wissensdomäne (nah ↔ fern)
- Physischer Kontext
- Zeitlicher Kontext
- Funktionaler Kontext
- Soziale Modalität

**Förderliche Faktoren:**
1. Tiefes Verständnis der Grundprinzipien
2. Explizites Abstraktionstraining
3. Vielfältige Beispiele während des Lernens
4. Metakognitive Reflexion über Transfer

**Die Herausforderung:**
Oberflächliche Unterschiede übersehen,
tiefe Strukturen erkennen.""",
            
            "exercise": {
                "title": "Interdisziplinäre Brücken 🌉",
                "instruction": "Identifiziere ein universelles Prinzip und zeige seine Anwendung in mindestens 3 verschiedenen Domänen.",
                "example": {
                    "principle": "Emergenz: Das Ganze ist mehr als die Summe seiner Teile",
                    "domains": [
                        {"field": "Biologie", "application": "Bewusstsein aus Neuronen"},
                        {"field": "Soziologie", "application": "Kultur aus Individuen"},
                        {"field": "Chemie", "application": "Wasser aus H und O"},
                        {"field": "Wirtschaft", "application": "Marktverhalten aus Einzelentscheidungen"},
                    ],
                },
                "your_turn": "Wähle: Feedback, Gleichgewicht, Evolution, Netzwerke, Selbstorganisation",
            },
            
            "fun_fact": "Elon Musk nutzt 'First Principles Thinking' – radikales Abstrahieren auf Grundprinzipien, dann Transfer auf neue Probleme. 🚀",
        },
        
        "paedagogen": {
            "intro": """**Far Transfer im Unterricht**

Far Transfer ist das ultimative Ziel, aber auch die größte Herausforderung.
Forschung zeigt: Ohne explizite Förderung passiert er selten.

**Hindernisse:**
- Lernende bleiben an Oberflächen haften
- Wissen wird kontextgebunden gespeichert
- Abstraktion erfordert kognitive Anstrengung

**Chancen:**
- Interdisziplinäres Arbeiten
- Projektbasiertes Lernen
- Real-World Problems""",
            
            "implementation": """**Strategien für Far Transfer:**

1. **Bridging (Perkins & Salomon)**
   - Explizit nach Analogien fragen
   - "Wo begegnet euch dieses Prinzip noch?"
   - Bewusst fächerübergreifend denken

2. **Abstraktion fördern**
   - Vom Beispiel zum Prinzip
   - "Was ist die REGEL dahinter?"
   - Multiple Repräsentationen nutzen

3. **Diverse Beispiele**
   - Gleiches Prinzip in verschiedenen Kontexten zeigen
   - Oberfläche variieren, Tiefenstruktur gleich halten

4. **Metakognitive Reflexion**
   - "Warum funktioniert das auch hier?"
   - Transfer-Tagebuch führen lassen

5. **Fächerübergreifende Projekte**
   - Problem aus der echten Welt
   - Wissen aus verschiedenen Fächern nötig""",
            
            "research_note": "Sala, G. & Gobet, F. (2019). Cognitive Training Does Not Enhance General Cognition. Trends in Cognitive Sciences.",
        },
    },
}

# ============================================
# PHASE 4: BRÜCKENPRINZIPIEN
# ============================================

PHASE_4_CONTENT = {
    "title": "Brückenprinzipien",
    "icon": "🌉",
    "core_concept": "Das PRINZIP erkennen – der Schlüssel zu allem!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """**Brückenprinzipien** sind wie Zauberformeln! ✨

Ein Brückenprinzip ist eine Regel, die ÜBERALL funktioniert.

Wenn du sie kennst, kannst du sie immer wieder benutzen –
egal wo, egal wann!

**Ein Beispiel:**
"Teile große Sachen in kleine Stücke!"

Das hilft bei:
- 🍕 Pizza essen (in Stücke schneiden)
- 📚 Lernen (Thema in kleine Teile)
- 🧹 Aufräumen (Zimmer in Ecken einteilen)
- 🎮 Schwierige Level (Schritt für Schritt)""",
            
            "exercise": {
                "title": "Brücken-Sammler! 🌉",
                "instruction": "Hier sind mächtige Brückenprinzipien. Finde für jedes 3 Anwendungen!",
                "principles": [
                    {
                        "principle": "Übung macht den Meister",
                        "starter_examples": ["Tanzen", "Gaming", "?"],
                        "icon": "🔄",
                    },
                    {
                        "principle": "Erst denken, dann machen",
                        "starter_examples": ["Malen", "Bauen", "?"],
                        "icon": "🧠",
                    },
                    {
                        "principle": "Zusammen ist man stärker",
                        "starter_examples": ["Fußball", "Gruppenarbeit", "?"],
                        "icon": "👥",
                    },
                ],
                "your_turn": "Erfinde dein EIGENES Brückenprinzip!",
            },
            
            "fun_fact": "Die besten Brückenprinzipien passen zu ALLEM – wie ein Universal-Schlüssel! 🔑",
        },
        
        "unterstufe": {
            "intro": """**Brückenprinzipien** = Universelle Regeln, die überall gelten

Das ist der ultimative Hack: 
Wenn du das PRINZIP verstehst, brauchst du nicht alles einzeln zu lernen!

**Die 3-Schritte-Methode:**
1. **ERKENNEN:** Was ist das Prinzip dahinter?
2. **ÜBERTRAGEN:** Wo könnte ich das noch anwenden?
3. **TESTEN:** Funktioniert es dort auch?

**Beispiel-Prinzip: "Feedback nutzen"**
- Gaming: Aus Fehlern lernen, besser werden
- Sport: Coach gibt Tipps, du verbesserst dich
- Schule: Korrektur lesen, nächstes Mal besser machen
- Social Media: Welche Posts kommen gut an?""",
            
            "exercise": {
                "title": "Prinzipien-Detektiv 🔍",
                "instruction": "Extrahiere das Brückenprinzip aus diesen Situationen!",
                "cases": [
                    {
                        "situation_1": "Du checkst das Wetter, bevor du rausgehst",
                        "situation_2": "Du liest die Aufgabe, bevor du anfängst",
                        "situation_3": "Du schaust Rezensionen, bevor du kaufst",
                        "hidden_principle": "Informiere dich VORHER!",
                    },
                    {
                        "situation_1": "Ein guter Song hat Strophe, Refrain, Strophe",
                        "situation_2": "Ein guter Aufsatz hat Einleitung, Hauptteil, Schluss",
                        "situation_3": "Ein gutes Gespräch hat Begrüßung, Inhalt, Verabschiedung",
                        "hidden_principle": "Struktur macht alles besser!",
                    },
                ],
                "challenge": "Finde ein Prinzip, das in DREI deiner Hobbys vorkommt!",
            },
            
            "fun_fact": "Warren Buffett (Milliardär) sagt: 'Ich habe nur wenige Prinzipien, aber ich wende sie überall an!' 💰",
        },
        
        "mittelstufe": {
            "intro": """**Brückenprinzipien: Abstraktion als Superkraft**

Ein Brückenprinzip ist eine abstrakte Regel, 
die in vielen verschiedenen Kontexten gilt.

**Warum sind sie so mächtig?**
- Ein Prinzip ersetzt hunderte Einzelfakten
- Transfer wird automatisch möglich
- Du erkennst Zusammenhänge, die andere übersehen

**Beispiel: Das Pareto-Prinzip (80/20-Regel)**
"80% der Ergebnisse kommen von 20% des Aufwands"

Anwendungen:
- Lernen: 20% der Themen machen 80% der Prüfung
- Wirtschaft: 20% der Kunden bringen 80% des Umsatzes
- Zeit: 20% deiner Aktivitäten bringen 80% deines Erfolgs
- Programmieren: 20% des Codes enthält 80% der Bugs""",
            
            "exercise": {
                "title": "Brückenprinzip-Werkstatt 🔧",
                "instruction": "Entwickle ein eigenes Brückenprinzip und zeige 5 Anwendungen!",
                "template": {
                    "step_1": "Beobachte: Was funktioniert in verschiedenen Bereichen gleich?",
                    "step_2": "Abstrahiere: Was ist das gemeinsame PRINZIP?",
                    "step_3": "Formuliere: Schreibe es als kurze Regel",
                    "step_4": "Teste: Finde 5 verschiedene Anwendungen",
                },
                "starter_principles": [
                    "Systeme streben nach Gleichgewicht",
                    "Kleine Veränderungen können große Auswirkungen haben",
                    "Diversität erhöht Stabilität",
                    "Feedback ermöglicht Verbesserung",
                ],
            },
            
            "fun_fact": "Charlie Munger (Investor) sammelt 'Mental Models' – Brückenprinzipien aus allen Wissenschaften! 🧠",
        },
        
        "oberstufe": {
            "intro": """**Brückenprinzipien: Mental Models**

Mental Models sind abstrakte Denkmuster, die in vielen Domänen anwendbar sind.

**Kategorien nach Charlie Munger:**
1. **Aus der Physik:** Hebelwirkung, Trägheit, Kritische Masse
2. **Aus der Biologie:** Evolution, Nische, Symbiose
3. **Aus der Psychologie:** Kognitive Verzerrungen, Anreize
4. **Aus der Mathematik:** Wahrscheinlichkeit, Exponentielles Wachstum
5. **Aus der Systemtheorie:** Feedback, Emergenz, Netzwerkeffekte

**Der Ansatz:**
- Sammle Prinzipien aus verschiedenen Disziplinen
- Verknüpfe sie zu einem "Latticework of Mental Models"
- Wende sie auf neue Probleme an

**Ziel:** Denken in Prinzipien statt in Fakten""",
            
            "exercise": {
                "title": "Mental Model Collection 📚",
                "instruction": "Erstelle deine persönliche Sammlung von Brückenprinzipien aus deinen Fächern.",
                "format": {
                    "name": "Name des Prinzips",
                    "origin": "Ursprüngliche Domäne",
                    "description": "Kurze Erklärung",
                    "applications": "3-5 andere Anwendungsbereiche",
                    "limitations": "Wo gilt es NICHT?",
                },
                "examples": [
                    {
                        "name": "Regression zur Mitte",
                        "origin": "Statistik",
                        "description": "Extreme Werte werden über Zeit moderater",
                        "applications": ["Sport", "Wirtschaft", "Gesundheit", "Psychologie"],
                        "limitations": "Bei systematischen Trends",
                    },
                    {
                        "name": "Opportunity Cost",
                        "origin": "Ökonomie",
                        "description": "Jede Entscheidung hat versteckte Kosten (was ich NICHT tue)",
                        "applications": ["Zeit", "Lernen", "Beziehungen", "Karriere"],
                        "limitations": "Bei unbegrenzten Ressourcen (selten!)",
                    },
                ],
            },
            
            "fun_fact": "Elon Musk, Bill Gates und Naval Ravikant – alle sammeln Mental Models als Denk-Werkzeuge! 🛠️",
        },
        
        "paedagogen": {
            "intro": """**Brückenprinzipien im Curriculum**

Brückenprinzipien (Mental Models) sind das Bindegewebe 
zwischen Fächern und der Schlüssel zu lebenslangem Lernen.

**Didaktischer Wert:**
- Reduktion der Stoffmenge bei höherem Transfer
- Förderung vernetzten Denkens
- Vorbereitung auf komplexe Probleme

**Herausforderung:**
Fächer werden oft isoliert unterrichtet –
Prinzipien werden nicht explizit gemacht.""",
            
            "implementation": """**Integration in den Unterricht:**

1. **Prinzipien-basierter Unterricht**
   - Jede Einheit um ein zentrales Prinzip strukturieren
   - Prinzip am Anfang benennen, am Ende transferieren

2. **Fächerübergreifende Prinzipien-Sammlung**
   - Schulweite Liste von Brückenprinzipien
   - Jedes Fach trägt bei und zeigt Anwendungen

3. **Transfer-Portfolios**
   - Schüler sammeln Prinzipien über das Schuljahr
   - Dokumentieren Anwendungen in verschiedenen Fächern

4. **Projektarbeit**
   - Komplexe Probleme, die mehrere Prinzipien erfordern
   - Explizite Reflexion: "Welche Prinzipien haben geholfen?"

5. **Analogie-Training**
   - Regelmäßig: "Dieses Konzept ist wie... weil..."
   - Kreativität und Abstraktion fördern""",
            
            "research_note": "Munger, C. (1995). The Psychology of Human Misjudgment. | Senge, P. (1990). The Fifth Discipline.",
        },
    },
}

# ============================================
# FINALE: TRANSFER-CHECK
# ============================================

FINALE_CONTENT = {
    "title": "Transfer-Check",
    "icon": "🏆",
    "instruction": "Zeig, was du gelernt hast!",
    
    "altersstufen": {
        "grundschule": {
            "challenge": """**Deine Transfer-Prüfung!** 🎯

Beantworte diese 3 Fragen:

1. **Near Transfer:** 
   Du hast gelernt, wie man einen Papierflieger faltet.
   Was könntest du mit der gleichen Falttechnik NOCH machen?

2. **Far Transfer:**
   Beim Fahrradfahren musst du das Gleichgewicht halten.
   Wo im Leben musst du sonst noch "im Gleichgewicht" bleiben?
   (Tipp: Es muss kein echtes Gleichgewicht sein!)

3. **Brückenprinzip:**
   Nenne EIN Prinzip, das du diese Woche in 3 verschiedenen Situationen benutzen könntest!""",
        },
        
        "unterstufe": {
            "challenge": """**Transfer-Meister-Test!** 🎯

Beantworte diese Fragen:

1. **Near Transfer:**
   Du beherrschst Prozentrechnung in Mathe.
   Nenne 2 ähnliche Situationen, wo du das auch anwenden kannst.

2. **Far Transfer:**
   Das Prinzip "Teile und Herrsche" (divide and conquer):
   Zeige, wie es in 3 KOMPLETT VERSCHIEDENEN Bereichen funktioniert.

3. **Brückenprinzip:**
   Formuliere ein eigenes Brückenprinzip und zeige 3 Anwendungen
   (mindestens 1 in der Schule, 1 außerhalb).""",
        },
        
        "mittelstufe": {
            "challenge": """**Transfer-Assessment** 🎯

Demonstriere deine Transfer-Fähigkeit:

1. **Near Transfer:**
   Wähle ein aktuelles Unterrichtsthema.
   Zeige 2 Variationen, wo das gleiche Prinzip gilt.

2. **Far Transfer:**
   Erstelle eine Analogie zwischen zwei verschiedenen Fächern.
   Erkläre die Tiefenstruktur, die beide verbindet.

3. **Brückenprinzip:**
   Identifiziere ein universelles Prinzip.
   Zeige seine Anwendung in: Schule, Alltag, Berufswelt, Gesellschaft.""",
        },
        
        "oberstufe": {
            "challenge": """**Metakognitiver Transfer-Nachweis** 🎯

1. **Near Transfer:**
   Analysiere zwei verwandte Konzepte aus deinem Leistungskurs.
   Zeige die strukturellen Gemeinsamkeiten und systematische Unterschiede.

2. **Far Transfer:**
   Wähle ein Konzept aus den Naturwissenschaften.
   Übertrage es auf ein Phänomen aus den Geisteswissenschaften (oder umgekehrt).
   Begründe die Validität der Analogie.

3. **Mental Model:**
   Präsentiere ein Brückenprinzip mit:
   - Ursprung (Disziplin)
   - Abstrakte Formulierung
   - 5+ Anwendungsdomänen
   - Grenzen der Anwendbarkeit""",
        },
        
        "paedagogen": {
            "challenge": """**Transfer-Implementierung** 🎯

Entwickeln Sie ein Konzept zur Transfer-Förderung:

1. **Near Transfer:**
   Beschreiben Sie, wie Sie systematische Variation in einer Unterrichtseinheit einsetzen würden.

2. **Far Transfer:**
   Entwerfen Sie eine fächerübergreifende Projektidee, die Far Transfer erfordert.

3. **Brückenprinzipien:**
   Identifizieren Sie 3 Prinzipien aus Ihrem Fach, die auch in anderen Fächern gelten.
   Skizzieren Sie eine Kooperation mit Kollegen.""",
        },
    },
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_transfer_content_for_age(age_group: str) -> Dict[str, Any]:
    """Gibt den kompletten Transfer-Content für eine Altersstufe zurück."""
    return {
        "phase_1": {
            **PHASE_1_CONTENT,
            "content": PHASE_1_CONTENT["altersstufen"].get(age_group, PHASE_1_CONTENT["altersstufen"]["unterstufe"]),
        },
        "phase_2": {
            **PHASE_2_CONTENT,
            "content": PHASE_2_CONTENT["altersstufen"].get(age_group, PHASE_2_CONTENT["altersstufen"]["unterstufe"]),
        },
        "phase_3": {
            **PHASE_3_CONTENT,
            "content": PHASE_3_CONTENT["altersstufen"].get(age_group, PHASE_3_CONTENT["altersstufen"]["unterstufe"]),
        },
        "phase_4": {
            **PHASE_4_CONTENT,
            "content": PHASE_4_CONTENT["altersstufen"].get(age_group, PHASE_4_CONTENT["altersstufen"]["unterstufe"]),
        },
        "finale": {
            **FINALE_CONTENT,
            "content": FINALE_CONTENT["altersstufen"].get(age_group, FINALE_CONTENT["altersstufen"]["unterstufe"]),
        },
    }

def get_phase_content(phase_num: int, age_group: str) -> Dict[str, Any]:
    """Gibt den Content für eine spezifische Phase zurück."""
    phases = {
        1: PHASE_1_CONTENT,
        2: PHASE_2_CONTENT,
        3: PHASE_3_CONTENT,
        4: PHASE_4_CONTENT,
        5: FINALE_CONTENT,
    }
    
    phase_data = phases.get(phase_num)
    if not phase_data:
        return None
    
    age_content = phase_data.get("altersstufen", {}).get(age_group)
    if not age_content:
        age_content = phase_data.get("altersstufen", {}).get("unterstufe", {})
    
    return {
        "title": phase_data.get("title"),
        "icon": phase_data.get("icon"),
        "core_concept": phase_data.get("core_concept", ""),
        **age_content,
    }

# ============================================
# BADGES UND ZERTIFIKATE
# ============================================

TRANSFER_BADGES = {
    "transfer_starter": {
        "name": "Transfer-Entdecker",
        "icon": "🔮",
        "description": "Das Transfer-Geheimnis entdeckt!",
        "condition": "phase_1_complete",
    },
    "near_transfer_pro": {
        "name": "Near-Transfer-Profi",
        "icon": "🎯",
        "description": "Near Transfer gemeistert!",
        "condition": "phase_2_complete",
    },
    "far_transfer_hero": {
        "name": "Far-Transfer-Held",
        "icon": "🚀",
        "description": "Far Transfer gewagt und geschafft!",
        "condition": "phase_3_complete",
    },
    "bridge_builder": {
        "name": "Brückenbauer",
        "icon": "🌉",
        "description": "Brückenprinzipien gemeistert!",
        "condition": "phase_4_complete",
    },
    "transfer_master": {
        "name": "Transfer-Meister",
        "icon": "🏆",
        "description": "Transfer-Challenge abgeschlossen!",
        "condition": "finale_complete",
    },
}

TRANSFER_CERTIFICATE = {
    "title": "Transfer-Meister",
    "subtitle": "hat das Geheimnis der Überflieger entdeckt",
    "description": "und gelernt, Wissen auf neue Situationen zu übertragen!",
    "skills": [
        "Near Transfer beherrscht",
        "Far Transfer gewagt",
        "Brückenprinzipien erkannt",
    ],
}
