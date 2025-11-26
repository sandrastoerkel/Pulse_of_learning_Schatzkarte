"""
📚 Ressourcen - Videos & Tipps zur Verbesserung

Diese Seite zeigt Content (Videos, Tipps, Materialien) für einen bestimmten Faktor.
Der Faktor wird über st.session_state.selected_factor oder URL-Parameter übergeben.

Basiert auf:
- streamlit-player für YouTube-Embeds
- Best Practices aus GitHub Education Apps
"""

import streamlit as st
import json
from pathlib import Path
import sys
sys.path.append('..')

from utils.scale_info import get_scale_info
from utils.evidence_integration import get_evidence, get_hattie_info, get_pisa_info

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Ressourcen & Tipps",
    page_icon="📚",
    layout="wide"
)

# ============================================
# TRY TO IMPORT STREAMLIT-PLAYER (optional)
# ============================================

try:
    from streamlit_player import st_player
    HAS_PLAYER = True
except ImportError:
    HAS_PLAYER = False

# ============================================
# CONTENT DATABASE (inline für Standalone)
# ============================================

CONTENT_DATABASE = {
    # ============================================
    # RANG 1: SELBSTWIRKSAMKEIT (d = 0.92)
    # ============================================
    "MATHEFF": {
        "name_de": "Ich schaff das! (Selbstwirksamkeit)",
        "name_schueler": "Ich schaff das!",
        "icon": "💪",
        "color": "#667eea",

        "intro_text": """
        **Selbstwirksamkeit** ist das Vertrauen, eine bestimmte Aufgabe erfolgreich bewältigen zu können.

        Nicht allgemeines Selbstvertrauen, sondern **aufgabenbezogen**: "Ich kann diese Matheaufgabe lösen"
        oder "Ich kann dieses Referat halten".

        **Kernbotschaft:** Du kannst mehr, als du denkst - und jeder Erfolg beweist es dir!
        """,

        "videos": [
            {
                "id": "CiPhJj7fDX4",
                "title": "Sich alles merken - Gehirn-gerecht lernen",
                "creator": "Vera F. Birkenbihl",
                "duration_min": 12,
                "url": "https://www.youtube.com/watch?v=CiPhJj7fDX4",
                "score": 8.7,
                "views": "917.000+",
                "warum_hilft": """
                Dieses Video zeigt dir eine Lernmethode, die wirklich funktioniert.

                Ein Schüler schrieb in den Kommentaren:
                > "Ich habe die Klasse wiederholen müssen, aber jetzt läuft es eins a.
                > Die Lehrer fragten, wie ich mich so verbessert habe."

                Wenn du merkst, dass Lernen funktioniert, wächst dein Selbstvertrauen automatisch!
                """,
                "kernbotschaft": "Statt passiv abzuschreiben → eigene Gedanken aktivieren. Das Gehirn lernt besser, wenn DU denkst!",
                "validated": True
            }
        ],

        "tipps": [
            {
                "titel": "🏆 Erfolgs-Tagebuch führen",
                "beschreibung": """
                Schreibe **jeden Abend** auf: Was habe ich heute geschafft?

                - Auch kleine Erfolge zählen!
                - "Ich habe eine schwierige Aufgabe zu Ende gebracht"
                - "Ich habe im Unterricht eine Frage gestellt"

                Nach einer Woche wirst du sehen: Du schaffst mehr als du denkst!

                *Basiert auf Bandura's "Mastery Experiences" - die stärkste Quelle für Selbstwirksamkeit*
                """,
                "dauer": "5 Min/Tag",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🔍 Ähnliche Erfolge erinnern",
                "beschreibung": """
                **Vor schwierigen Aufgaben frage dich:**

                "Wann habe ich etwas Ähnliches schon mal geschafft?"

                Du hast bestimmt schon Herausforderungen gemeistert!
                Erinnere dich daran - es zeigt dir, dass du es wieder kannst.
                """,
                "dauer": "Sofort",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🧩 Schwieriges in kleine Schritte teilen",
                "beschreibung": """
                Eine große Aufgabe wirkt **unmöglich**.

                Teile sie in **kleine Schritte**:
                1. Was ist der ERSTE kleine Schritt?
                2. Nur diesen einen Schritt machen
                3. Erfolg feiern!
                4. Dann den nächsten

                *Gestufte Aufgaben (leicht → mittel → schwer) bauen Selbstwirksamkeit auf*
                """,
                "dauer": "Vor jeder großen Aufgabe",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "👥 Von Vorbildern lernen",
                "beschreibung": """
                **"Wenn die/der das kann, kann ich es auch!"**

                Suche nach Erfolgsgeschichten von Schülern, die ähnliche Probleme hatten.

                Nutze **Peer-Tutoring**: Lass dir von Mitschülern helfen oder erkläre
                anderen etwas - beide Seiten profitieren!

                *Nach Bandura: "Vicarious Experiences" - Vorbilder stärken den Glauben an dich selbst*
                """,
                "dauer": "Diese Woche",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.92,
            "hattie_rank": 3,
            "pisa_impact": "+40 Punkte (r = +0.40)",
            "erklaerung": """
            **Theorie:** Bandura's Selbstwirksamkeitstheorie (1997)

            **Die 4 Quellen der Selbstwirksamkeit:**
            1. **Erfolgserlebnisse** (stärkste Quelle!) - Gestufte Aufgaben, Erfolge dokumentieren
            2. **Vorbilder** - "Wenn die das kann, kann ich es auch!"
            3. **Zuspruch** - Spezifisches Feedback: "Du hast die Methode richtig angewandt"
            4. **Körperliche Signale** - Angst reduzieren, positive Lernatmosphäre

            **WICHTIG:** Nicht "Du bist schlau" - sondern "Du hast gut gearbeitet"!

            **Hattie:** d = 0.92 (Rang #3 von 252 Faktoren) - der stärkste Schüler-Faktor!
            **PISA 2022:** r = +0.40 - einer der wichtigsten Faktoren für Schulerfolg
            """
        }
    },

    # ============================================
    # RANG 2: LERNSTRATEGIEN (d = 0.86) - NEU!
    # ============================================
    "EXT_LEARNSTRAT": {
        "name_de": "Cleverer lernen - 7 Techniken",
        "name_schueler": "Cleverer lernen",
        "icon": "📚",
        "color": "#3498db",

        "intro_text": """
        Es gibt **7 Lerntechniken**, die wissenschaftlich bewiesen funktionieren!

        Diese Techniken nutzen, wie dein Gehirn wirklich arbeitet - nicht gegen es, sondern mit ihm.

        **Kernbotschaft:** Nicht MEHR lernen, sondern CLEVERER lernen!
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "🔄 Active Recall - Sich selbst abfragen",
                "beschreibung": """
                **Nicht nur lesen - sich selbst abfragen!**

                So geht's:
                - Karteikarten ohne hinzuschauen durchgehen
                - Blatt Papier: Was weiß ich noch?
                - Buch zuklappen und aufschreiben, was du behalten hast

                *Stärkt neuronale Verbindungen - viel effektiver als nur lesen!*

                **Hattie d = 0.58**
                """,
                "dauer": "Bei jedem Lernen",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📅 Spaced Repetition - Zeitversetzt wiederholen",
                "beschreibung": """
                **Nicht alles auf einmal pauken!**

                Wiederhole in wachsenden Abständen:
                - 1 Tag → 3 Tage → 1 Woche → 2 Wochen

                Apps wie **Anki** oder **Quizlet** machen das automatisch.

                *Nutzt die Vergessenskurve von Ebbinghaus - du behältst mehr mit weniger Aufwand!*

                **Hattie d = 0.60**
                """,
                "dauer": "Langfristig",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "👶 Feynman-Methode - Erkläre es einfach",
                "beschreibung": """
                **Erkläre das Thema so, dass ein 10-Jähriger es versteht.**

                So geht's:
                1. Wähle ein Thema
                2. Erkläre es in einfachen Worten
                3. Wo stockst du? → Das ist eine Wissenslücke!
                4. Zurück zum Material, dann nochmal erklären

                *"Was du nicht erklären kannst, hast du nicht verstanden"*

                **Hattie d = 0.75**
                """,
                "dauer": "10-15 Min pro Thema",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🏰 Loci-Methode / Gedächtnispalast",
                "beschreibung": """
                **Verbinde Lernstoff mit Orten, die du kennst.**

                So geht's:
                1. Wähle einen bekannten Weg (z.B. durch dein Zimmer)
                2. Jeder Ort = ein Begriff/Fakt
                3. Mental "abwandern" zum Erinnern

                *Seit der Antike bewährt - funktioniert besonders gut für Listen!*

                **Hattie d = 0.65**
                """,
                "dauer": "15 Min zum Einrichten",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🗺️ Mind Mapping",
                "beschreibung": """
                **Themen visuell als Verzweigungen darstellen.**

                So geht's:
                1. Hauptthema in die Mitte
                2. Zweige für Unterthemen
                3. Farben und Symbole nutzen

                *Das Gehirn verarbeitet visuelle Info schneller als Text!*

                **Hattie d = 0.54**
                """,
                "dauer": "10-20 Min",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🍅 Pomodoro-Technik",
                "beschreibung": """
                **25 Minuten fokussiert lernen, 5 Minuten Pause.**

                So geht's:
                1. Timer auf 25 Min stellen
                2. Konzentriert arbeiten (keine Ablenkung!)
                3. Nach 25 Min: 5 Min Pause
                4. Nach 4 Runden: 15-30 Min längere Pause

                *Ideal bei Konzentrationsproblemen!*

                **Hattie d = 0.53**
                """,
                "dauer": "25+5 Min Zyklen",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "👥 Lernen durch Lehren",
                "beschreibung": """
                **Anderen den Stoff erklären.**

                So geht's:
                - In Lerngruppen: Jeder wird Experte für ein Thema
                - Oder: Tu so, als würdest du unterrichten
                - Erkläre es deiner Wand, deinem Haustier...

                *Beide Seiten profitieren - wer lehrt, lernt doppelt!*

                **Hattie d = 0.53**
                """,
                "dauer": "Je nach Thema",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.86,
            "hattie_rank": 5,
            "pisa_impact": "Kombiniert verschiedene Strategien",
            "erklaerung": """
            **Die 7 Techniken und ihre Effektstärken:**

            | Technik | Hattie d | Was es macht |
            |---------|----------|--------------|
            | Feynman-Methode | 0.75 | Erkläre es so einfach wie möglich |
            | Loci-Methode | 0.65 | Verbinde mit Orten |
            | Spaced Repetition | 0.60 | Wiederhole zeitversetzt |
            | Active Recall | 0.58 | Sich selbst abfragen |
            | Mind Mapping | 0.54 | Visuell darstellen |
            | Pomodoro | 0.53 | 25 Min fokussiert, 5 Min Pause |
            | Lernen durch Lehren | 0.53 | Anderen erklären |

            **Transfer Strategies (Hattie d = 0.86)**: Die Fähigkeit, Gelerntes anzuwenden.

            *Quellen: Dunlosky et al. (2013), Hattie (2023)*
            """
        }
    },

    # ============================================
    # RANG 3: LEHRER-BEZIEHUNG (d = 0.75)
    # ============================================
    "TEACHSUP": {
        "name_de": "Besser mit Lehrern klarkommen",
        "name_schueler": "Besser mit Lehrern klarkommen",
        "icon": "🏫",
        "color": "#9c27b0",

        "intro_text": """
        **Gute Kommunikation mit Lehrern = bessere Noten**

        Es geht nicht darum, der "Liebling" zu sein - sondern darum, dass du dich traust,
        Fragen zu stellen und Hilfe zu holen.

        **Kernbotschaft:** Nachfragen ist kein Zeichen von Schwäche - es zeigt Interesse!
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "❓ Nachfragen wenn etwas unklar ist",
                "beschreibung": """
                **Nachfragen ist kein Zeichen von Schwäche!**

                Im Gegenteil: Lehrer schätzen Schüler, die aktiv mitdenken.

                Trau dich: "Können Sie das nochmal erklären?" oder
                "Ich verstehe den Teil nicht - können Sie mir helfen?"
                """,
                "dauer": "Im Unterricht",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📝 Feedback aktiv einfordern",
                "beschreibung": """
                **Frage konkret: "Was kann ich besser machen?"**

                Statt nur auf Noten zu warten:
                - "Was war gut an meiner Arbeit?"
                - "Wo kann ich mich noch verbessern?"
                - "Haben Sie Tipps für mich?"

                *Die meisten Lehrer freuen sich über so engagierte Schüler!*
                """,
                "dauer": "Nach Arbeiten/Tests",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🗓️ Sprechstunden nutzen",
                "beschreibung": """
                **Sprechstunden sind DAFÜR da, genutzt zu werden!**

                Viele Schüler trauen sich nicht - aber genau das ist der Ort für:
                - Fragen, die im Unterricht zu lang wären
                - Persönliche Lernziele besprechen
                - Bei Problemen früh das Gespräch suchen

                *Je früher du Probleme ansprichst, desto einfacher die Lösung!*
                """,
                "dauer": "Bei Bedarf",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.75,
            "hattie_rank": 12,
            "pisa_impact": "+28 Punkte (r = +0.28)",
            "erklaerung": """
            **Warum ist die Lehrer-Beziehung so wichtig?**

            - **Hattie d = 0.75** (Teacher clarity)
            - **Hattie d = 0.70** (Feedback)
            - **PISA r = +0.28** - signifikanter Einfluss auf Leistung

            Es geht nicht darum, dass Lehrer deine "Freunde" sind - sondern dass:
            - Du dich traust, Fragen zu stellen
            - Du weißt, wo du stehst (Feedback)
            - Du bei Problemen früh Hilfe bekommst
            """
        }
    },

    # ============================================
    # RANG 4: METAKOGNITION (d = 0.69) - NEU/Optional
    # ============================================
    "EXT_METACOG": {
        "name_de": "Über dein Lernen nachdenken (Metakognition)",
        "name_schueler": "Über dein Lernen nachdenken",
        "icon": "🧠",
        "color": "#9b59b6",

        "intro_text": """
        **Metakognition** = Über das eigene Lernen nachdenken.

        Wer versteht, WIE er lernt, kann besser lernen!

        **Kernbotschaft:** Nimm dir Zeit, dein Lernen zu planen und zu reflektieren.
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "🎯 VOR dem Lernen planen",
                "beschreibung": """
                **Frage dich vor jeder Lernsession:**

                - "Was weiß ich schon über dieses Thema?"
                - "Was will ich heute lernen?"
                - "Welche Strategie nutze ich?"

                *5 Minuten Planung sparen 30 Minuten Chaos!*
                """,
                "dauer": "5 Min vor dem Lernen",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🔍 WÄHREND dem Lernen checken",
                "beschreibung": """
                **Frage dich zwischendurch:**

                - "Verstehe ich das wirklich?"
                - "Funktioniert meine Strategie?"
                - "Brauche ich etwas anderes?"

                *Wenn etwas nicht funktioniert - wechsle die Methode!*
                """,
                "dauer": "Alle 20-30 Min",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📊 NACH dem Lernen reflektieren",
                "beschreibung": """
                **Frage dich am Ende:**

                - "Was hat heute funktioniert?"
                - "Was mache ich nächstes Mal anders?"
                - "Was war mein größter Lernfortschritt?"

                *Diese 2 Minuten Reflexion machen dich jede Woche besser!*
                """,
                "dauer": "2 Min nach dem Lernen",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "⏱️ Lernzeit-Schätzung",
                "beschreibung": """
                **Einfache Übung zur Selbsteinschätzung:**

                1. Schätze: "Wie lange brauche ich für diese Aufgabe?"
                2. Mach die Aufgabe und stopp die Zeit
                3. Vergleiche: Wie gut war deine Schätzung?

                *Je öfter du das machst, desto besser kannst du planen!*
                """,
                "dauer": "Bei jeder Aufgabe",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.69,
            "hattie_rank": 17,
            "pisa_impact": "Hoher indirekter Einfluss",
            "erklaerung": """
            **Die 3 Phasen der Metakognition:**

            | Phase | Fragen |
            |-------|--------|
            | **Vor dem Lernen** | Was weiß ich? Was will ich lernen? Welche Strategie? |
            | **Während** | Verstehe ich? Funktioniert meine Strategie? |
            | **Danach** | Was hat funktioniert? Was mache ich anders? |

            **Hattie d = 0.69** - einer der wichtigsten Faktoren!

            Metakognition ist wie ein "innerer Coach", der dein Lernen verbessert.
            """
        }
    },

    # ============================================
    # RANG 5: AUSDAUER (d = 0.53)
    # ============================================
    "PERSEVAGR": {
        "name_de": "Länger dranbleiben können (Persistenz)",
        "name_schueler": "Länger dranbleiben können",
        "icon": "🏅",
        "color": "#ff9800",

        "intro_text": """
        **Durchhalten zahlt sich aus - auch wenn es schwer wird!**

        Die erfolgreichsten Menschen sind nicht die Schlauesten, sondern die,
        die am **längsten dranbleiben**.

        **Kernbotschaft:** Ausdauer ist wie ein Muskel - je mehr du sie trainierst, desto stärker wird sie!
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "🧩 Große Aufgaben in kleine Schritte teilen",
                "beschreibung": """
                Eine riesige Aufgabe wirkt **unmöglich**.

                Teile sie in **kleine Schritte**:
                1. Was ist der ERSTE kleine Schritt?
                2. Nur diesen einen Schritt machen
                3. Dann den nächsten

                *Plötzlich ist die "unmögliche" Aufgabe machbar!*
                """,
                "dauer": "Vor jeder großen Aufgabe",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "⏱️ Die 'Noch 5 Minuten'-Regel",
                "beschreibung": """
                **Wenn du aufgeben willst - versuche es noch 5 Minuten!**

                Warum funktioniert das?
                - Oft kommt der Durchbruch kurz vor dem Aufgeben
                - Du trainierst dein Gehirn, weiterzumachen
                - 5 Minuten sind kurz genug, um es zu versuchen

                *Wenn du nach 5 Min immer noch nicht weiterkommst? Dann hast du es wenigstens versucht!*
                """,
                "dauer": "5 Min extra",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📊 Fortschritt sichtbar machen",
                "beschreibung": """
                **Führe ein Lerntagebuch oder nutze Checklisten.**

                - Hake erledigte Aufgaben ab
                - Schau zurück, was du schon geschafft hast
                - Feiere jeden Fortschritt!

                *Sichtbarer Fortschritt motiviert zum Weitermachen.*
                """,
                "dauer": "5 Min/Tag",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🎁 Belohnungen nach Etappen",
                "beschreibung": """
                **Plane kleine Belohnungen für erreichte Ziele.**

                Beispiele:
                - Nach 1 Stunde Lernen: 10 Min Lieblingsserie
                - Nach fertigem Kapitel: Lieblingssnack
                - Nach bestandener Prüfung: etwas Besonderes

                *Dein Gehirn lernt: Dranbleiben lohnt sich!*
                """,
                "dauer": "Bei jedem Ziel",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "💪 Frühere Erfolge erinnern",
                "beschreibung": """
                **Wenn es schwer wird, erinnere dich:**

                "Das habe ich auch schon geschafft!"

                Denk an Situationen, wo du fast aufgegeben hast -
                und dann doch durchgehalten hast.

                *Du hast es schon einmal geschafft. Du kannst es wieder!*
                """,
                "dauer": "Sofort",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.53,
            "hattie_rank": 38,
            "pisa_impact": "Teil der Selbstwirksamkeit",
            "erklaerung": """
            **Warum ist Ausdauer so wichtig?**

            - **Hattie d = 0.53** - überdurchschnittlicher Einfluss
            - **Angela Duckworth**: "Grit" (Ausdauer + Leidenschaft) ist wichtiger als IQ

            **Die Formel für Erfolg:**
            Talent × Anstrengung = Fähigkeit
            Fähigkeit × Anstrengung = Erfolg

            *Anstrengung zählt doppelt!*
            """
        }
    },

    # ============================================
    # RANG 6: MOTIVATION (d = 0.48) - NEU!
    # ============================================
    "EXT_MOTIV": {
        "name_de": "Wieder Bock aufs Lernen (Motivation)",
        "name_schueler": "Wieder Bock aufs Lernen",
        "icon": "🔥",
        "color": "#e74c3c",

        "intro_text": """
        Ca. **50% der Schüler** berichten von fehlender Lernmotivation (PISA 2022).

        Du bist also nicht allein! Und es gibt Wege, die Motivation wiederzufinden.

        **Kernbotschaft:** Finde DEINE Gründe zum Lernen - nicht die deiner Eltern oder Lehrer.
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "🎯 Eigene Ziele finden",
                "beschreibung": """
                **Nicht nur für Eltern/Lehrer lernen!**

                Frage dich:
                - Was will ICH erreichen?
                - Wofür brauche ich das?
                - Was interessiert MICH daran?

                *Eigene Ziele motivieren viel stärker als Ziele von anderen!*
                """,
                "dauer": "10 Min Reflexion",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "❓ Relevanz entdecken",
                "beschreibung": """
                **"Warum ist das wichtig für MICH?"**

                Suche nach Verbindungen zu:
                - Deinen Hobbys
                - Deinem Traumberuf
                - Alltagssituationen

                *Wenn du den Sinn siehst, lernst du automatisch motivierter!*
                """,
                "dauer": "Bei jedem neuen Thema",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "✨ Kleine Erfolge sichtbar machen",
                "beschreibung": """
                **Jeder Fortschritt zählt!**

                - Führe eine "Done"-Liste (was du geschafft hast)
                - Nutze Checklisten
                - Feiere auch kleine Siege

                *Sichtbarer Fortschritt = mehr Motivation für den nächsten Schritt*
                """,
                "dauer": "2 Min/Tag",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "👥 Mit anderen lernen",
                "beschreibung": """
                **Gemeinsam macht's mehr Spaß!**

                - Lerngruppen bilden
                - Sich gegenseitig erklären
                - Gemeinsame Ziele setzen

                *Soziale Verbindung ist ein starker Motivator!*
                """,
                "dauer": "Diese Woche organisieren",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": False
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.48,
            "hattie_rank": 51,
            "pisa_impact": "Ca. 50% berichten fehlende Motivation",
            "erklaerung": """
            **Hattie-Forschung zu Motivation:**

            - **Motivation d = 0.48**
            - **Mastery Goals d = 0.57** (Ziel: etwas LERNEN, nicht nur gute Note)

            **Motivations-Killer vermeiden:**
            - Zu große Ziele auf einmal
            - Nur auf Noten fokussieren
            - Sich mit anderen vergleichen

            **Stattdessen:**
            - Kleine, erreichbare Ziele
            - Fokus auf LERNEN, nicht nur Ergebnis
            - Mit dir selbst von gestern vergleichen
            """
        }
    },

    # ============================================
    # RANG 7: ZUGEHÖRIGKEIT (d = 0.46)
    # ============================================
    "BELONG": {
        "name_de": "Dich in der Schule wohlfühlen (Zugehörigkeit)",
        "name_schueler": "Dich in der Schule wohlfühlen",
        "icon": "🏠",
        "color": "#e91e63",

        "intro_text": """
        **Zugehörigkeitsgefühl** ("Sense of Belonging") ist entscheidend für Wohlbefinden UND Lernerfolg!

        Wenn du dich wohlfühlst und dazugehörst, bist du entspannter und konzentrierter.

        **Kernbotschaft:** Du gehörst hierher - und es gibt Wege, dich mehr zugehörig zu fühlen!
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "👋 Kontakte zu Mitschülern pflegen",
                "beschreibung": """
                **Kleine Gesten machen den Unterschied:**

                - Grüße Mitschüler morgens
                - Frage, wie es ihnen geht
                - Biete Hilfe an

                *Freundschaften entstehen durch regelmäßige kleine Kontakte!*
                """,
                "dauer": "Täglich",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🎯 Bei Aktivitäten mitmachen",
                "beschreibung": """
                **AGs, Projekte, Sportgruppen - probier etwas aus!**

                Dort triffst du Gleichgesinnte und fühlst dich als Teil von etwas.

                Was interessiert dich?
                - Sport-AG
                - Musik/Theater
                - Schülerzeitung
                - MINT-Projekte

                *Du musst nicht überall dabei sein - aber finde ETWAS!*
                """,
                "dauer": "Dieses Halbjahr",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": False
            },
            {
                "titel": "🤝 Hilfe anbieten und annehmen",
                "beschreibung": """
                **Gegenseitige Hilfe stärkt Verbindungen!**

                - Biete an, etwas zu erklären
                - Traue dich, um Hilfe zu bitten
                - Lerngruppen bilden

                *Wer gibt UND nimmt, baut echte Beziehungen auf!*
                """,
                "dauer": "Bei Gelegenheit",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "👤 Einen 'Buddy' finden",
                "beschreibung": """
                **Finde eine Person, mit der du dich gut verstehst.**

                Das muss keine "beste Freundschaft" sein -
                jemand zum Quatschen und gemeinsam Lernen reicht!

                *Eine gute Verbindung kann alles verändern.*
                """,
                "dauer": "Diese Woche",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.46,
            "hattie_rank": 48,
            "pisa_impact": "+25 Punkte (r = +0.25)",
            "erklaerung": """
            **PISA 2022:** Zugehörigkeitsgefühl ist entscheidend für:
            - Wohlbefinden in der Schule
            - Lernmotivation
            - Schulerfolg (r = +0.25)

            **Hattie d = 0.46** (Belonging) - überdurchschnittlicher Einfluss

            Wer sich zugehörig fühlt:
            - Geht lieber zur Schule
            - Ist entspannter und konzentrierter
            - Lernt automatisch besser
            """
        }
    },

    # ============================================
    # RANG 8: ANGSTREDUKTION (d = 0.42)
    # ============================================
    "ANXMAT": {
        "name_de": "Weniger Stress beim Lernen",
        "name_schueler": "Weniger Stress beim Lernen",
        "icon": "😌",
        "color": "#4ecdc4",

        "intro_text": """
        **Prüfungsangst und Lernstress** sind weit verbreitet - und haben NICHTS mit Intelligenz zu tun!

        Angst blockiert das Arbeitsgedächtnis. Du vergisst Dinge, die du eigentlich weißt!

        **Kernbotschaft:** Weniger Angst = mehr Kapazität zum Denken!
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "💭 Gedanken verändern (Kognitive Umstrukturierung)",
                "beschreibung": """
                **Ersetze negative durch hilfreiche Gedanken:**

                - "Ich bin schlecht in..." → "Ich kann es lernen, wenn ich übe"
                - "Ich werde versagen" → "Ich habe mich vorbereitet"

                *Übe positive Selbstgespräche - sie verändern, wie du dich fühlst!*

                Basiert auf **Kognitiver Verhaltenstherapie (Beck, 1979)**
                """,
                "dauer": "Bei jedem negativen Gedanken",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🌬️ Körper beruhigen (Atemtechnik)",
                "beschreibung": """
                **Tiefes Atmen beruhigt dein Nervensystem sofort:**

                1. **4 Sekunden einatmen**
                2. **4 Sekunden halten**
                3. **4 Sekunden ausatmen**

                Wiederhole 3-5x. Funktioniert vor Prüfungen, bei Nervosität, immer!

                *Dein Körper signalisiert dem Gehirn: "Alles okay, entspann dich!"*
                """,
                "dauer": "30 Sekunden",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🎓 Fehlerkultur entwickeln",
                "beschreibung": """
                **Fehler = Lernchance, nicht Versagen!**

                - Frage dich: "Was kann ich daraus lernen?"
                - Prozess wichtiger als Ergebnis
                - Jeder Experte hat mal als Anfänger angefangen

                *Die erfolgreichsten Menschen machen die meisten Fehler - weil sie am meisten ausprobieren!*
                """,
                "dauer": "Bei jedem Fehler",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📅 Gute Vorbereitung",
                "beschreibung": """
                **Rechtzeitig anfangen reduziert Stress!**

                - Lernplan erstellen
                - In kleinen Schritten vorbereiten
                - Prüfungssimulation üben

                *Wenn du gut vorbereitet bist, hast du weniger Grund zur Angst!*
                """,
                "dauer": "Ab 1 Woche vor der Prüfung",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.42,
            "hattie_rank": 56,
            "pisa_impact": "-30 Punkte bei hoher Angst (r = -0.30)",
            "erklaerung": """
            **Theorie:** Kognitive Verhaltenstherapie (Beck, 1979)

            **Warum blockiert Angst das Lernen?**
            - Angst aktiviert "Kampf oder Flucht"-Modus
            - Das **Arbeitsgedächtnis** wird blockiert
            - Du vergisst Dinge, die du eigentlich weißt!

            **PISA 2022:** r = -0.30 - Angst korreliert NEGATIV mit Leistung!
            Schüler mit hoher Angst erreichen **ca. 30 Punkte weniger**.

            **Hattie d = 0.42** (Reducing Anxiety) - überdurchschnittlich wirksam
            """
        }
    },

    # ============================================
    # RANG 9: GROWTH MINDSET (d = 0.36)
    # ============================================
    "GROSAGR": {
        "name_de": "Glauben, dass du wachsen kannst (Growth Mindset)",
        "name_schueler": "Glauben, dass du wachsen kannst",
        "icon": "🌱",
        "color": "#00cc88",

        "intro_text": """
        **Growth Mindset** = Die Überzeugung, dass Intelligenz und Fähigkeiten **nicht festgelegt** sind,
        sondern durch Anstrengung wachsen können.

        **Unterschied zu Selbstwirksamkeit:**
        - **Selbstwirksamkeit:** "Ich kann DIESE Aufgabe schaffen" (aufgabenbezogen)
        - **Growth Mindset:** "Meine Fähigkeiten können wachsen" (generelle Einstellung)

        **Kernbotschaft:** Dein Gehirn kann wachsen - wie ein Muskel!
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "✨ Das Wort 'NOCH' einbauen",
                "beschreibung": """
                **Ein kleines Wort verändert alles:**

                - ❌ "Ich kann das nicht" → ✅ "Ich kann das **NOCH** nicht"
                - ❌ "Ich verstehe das nicht" → ✅ "Ich verstehe das **NOCH** nicht"

                *Dieses eine Wort öffnet die Tür zum Wachstum!*
                """,
                "dauer": "Sofort",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "💪 Anstrengung loben, nicht Talent",
                "beschreibung": """
                **Sage dir selbst:**

                - ✅ "Ich habe mich angestrengt"
                - ❌ Nicht: "Ich bin schlau"

                *Anstrengung kannst du kontrollieren - "Schlausein" nicht!*

                Wenn du Anstrengung wertschätzt, versuchst du mehr.
                Wenn du nur Talent wertschätzt, gibst du bei Schwierigkeiten auf.
                """,
                "dauer": "Nach jeder Aufgabe",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📝 Fehler als Information nutzen",
                "beschreibung": """
                **Fehler zeigen dir, wo du noch lernen kannst!**

                Fixed Mindset: "Fehler beweisen, dass ich dumm bin"
                Growth Mindset: "Fehler zeigen mir, wo ich wachsen kann"

                *Frage dich: "Was kann ich aus diesem Fehler lernen?"*
                """,
                "dauer": "Bei jedem Fehler",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🔙 An eigene Fortschritte erinnern",
                "beschreibung": """
                **Denk daran, was du schon alles gelernt hast:**

                - Du konntest nicht immer lesen
                - Du konntest nicht immer Rad fahren
                - Du konntest nicht immer...

                *Du hast schon so viel gelernt - warum sollte das aufhören?*
                """,
                "dauer": "Sofort",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.36,
            "hattie_rank": 68,
            "pisa_impact": "Moderat positiv",
            "erklaerung": """
            **Theorie:** Carol Dweck (2006) - Stanford University

            **Fixed vs. Growth Mindset:**

            | Fixed Mindset | Growth Mindset |
            |---------------|----------------|
            | "Ich bin halt schlecht in Mathe" | "Ich kann Mathe lernen, wenn ich übe" |
            | "Das ist zu schwer für mich" | "Das ist eine Herausforderung" |
            | "Fehler zeigen, dass ich dumm bin" | "Fehler zeigen, wo ich lernen kann" |
            | "Anstrengung heißt, ich bin nicht begabt" | "Anstrengung macht mich besser" |

            **Hattie d = 0.36** - unterstützt Selbstwirksamkeit, aber allein weniger wirksam

            *Quelle: Dweck (2006), Macnamara & Burgoyne (2022)*
            """
        }
    },

    # ============================================
    # RANG 10: FOKUS (d = 0.34) - NEU!
    # ============================================
    "EXT_FOCUS": {
        "name_de": "Fokus halten - Ablenkungen besiegen",
        "name_schueler": "Fokus halten",
        "icon": "📵",
        "color": "#1abc9c",

        "intro_text": """
        **PISA 2022:**
        - 28% der deutschen Schüler können nicht ungestört arbeiten
        - 28% werden durch digitale Geräte abgelenkt

        Das ist kein Willens-Problem - es ist ein **Umgebungs-Problem!**

        **Kernbotschaft:** Mach es dir leicht, fokussiert zu bleiben!
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "📱 Handy-freie Lernzonen einrichten",
                "beschreibung": """
                **Das Handy in einen anderen Raum legen!**

                Nicht nur auf lautlos - wirklich WEG.

                Studien zeigen: Allein die ANWESENHEIT des Handys
                reduziert die Konzentration - auch wenn es aus ist!

                *Mach es dir leicht, nicht abgelenkt zu werden.*
                """,
                "dauer": "Beim Lernen",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🍅 Pomodoro-Technik nutzen",
                "beschreibung": """
                **25 Minuten fokussiert, 5 Minuten Pause.**

                1. Timer auf 25 Min
                2. Konzentriert arbeiten (keine Ablenkung!)
                3. Nach 25 Min: 5 Min Pause
                4. Nach 4 Runden: längere Pause

                *In den Pausen darfst du aufs Handy - das macht es einfacher!*
                """,
                "dauer": "25+5 Min Zyklen",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🚫 App-Blocker verwenden",
                "beschreibung": """
                **Apps, die dich von anderen Apps abhalten:**

                - **Forest** - Bäume wachsen, während du fokussiert bist
                - **Freedom** - Blockiert Apps/Websites für bestimmte Zeit
                - **Fokus-Modus** in iOS/Android

                *Nutze Technologie, um dich vor Technologie zu schützen!*
                """,
                "dauer": "Einmal einrichten",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "⏰ Feste Lernzeiten etablieren",
                "beschreibung": """
                **Gleiche Zeit, gleicher Ort = Routine!**

                - Dein Gehirn stellt sich auf "Lernmodus" ein
                - Weniger Entscheidungen = weniger Willenskraft nötig
                - Routine ist stärker als Motivation

                *Nach ein paar Wochen wird Lernen automatisch!*
                """,
                "dauer": "1 Woche zum Etablieren",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🪑 Lernumgebung optimieren",
                "beschreibung": """
                **Aufgeräumter Schreibtisch, gutes Licht, frische Luft.**

                Checklist:
                - [ ] Schreibtisch aufgeräumt?
                - [ ] Gutes Licht?
                - [ ] Fenster auf für frische Luft?
                - [ ] Alle Materialien bereit?
                - [ ] Handy weg?

                *Eine gute Umgebung macht Fokus einfacher!*
                """,
                "dauer": "5 Min Vorbereitung",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.34,
            "hattie_rank": 78,
            "pisa_impact": "28% werden durch Geräte abgelenkt",
            "erklaerung": """
            **PISA 2022 Deutschland:**
            - 28% können nicht ungestört arbeiten
            - 28% werden durch digitale Geräte abgelenkt

            **Hattie d = 0.34** (Reducing disruptions)

            **Forschung zeigt:**
            - Allein die ANWESENHEIT des Handys reduziert Konzentration
            - Multitasking funktioniert nicht - das Gehirn wechselt nur schnell hin und her
            - Routinen reduzieren den Bedarf an Willenskraft

            *Mach es dir leicht, fokussiert zu bleiben - gestalte deine Umgebung!*
            """
        }
    },

    # ============================================
    # RANG 11: ANTI-MOBBING (d = 0.33)
    # ============================================
    "BULLIED": {
        "name_de": "Wenn andere dich fertig machen (Anti-Mobbing)",
        "name_schueler": "Wenn andere dich fertig machen",
        "icon": "👥",
        "color": "#f44336",

        "intro_text": """
        **PISA 2022:** 23% der Schüler werden mindestens ein paar Mal pro Monat von Mitschülern drangsaliert.

        **Wichtig zu wissen:**
        - Du bist NICHT schuld!
        - Hilfe holen ist KEINE Schwäche
        - Du bist nicht allein!

        **Kernbotschaft:** Niemand muss das alleine durchstehen.
        """,

        "videos": [],

        "tipps": [
            {
                "titel": "🗣️ Vertrauensperson finden",
                "beschreibung": """
                **Such dir einen Erwachsenen, dem du vertraust:**

                - Eltern
                - Lehrer
                - Schulsozialarbeit
                - Schulpsychologe

                *Du musst das nicht alleine durchstehen!*
                """,
                "dauer": "Diese Woche",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "👥 Nicht alleine bleiben",
                "beschreibung": """
                **Bleib mit Freunden zusammen.**

                - In der Pause
                - Auf dem Schulweg
                - In der Mensa

                *In der Gruppe bist du weniger angreifbar.*
                """,
                "dauer": "Ab sofort",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📝 Dokumentieren",
                "beschreibung": """
                **Schreibe auf, was passiert:**

                - Wann?
                - Wo?
                - Wer?
                - Was genau?

                *Das hilft, wenn du mit Erwachsenen sprichst.*
                """,
                "dauer": "Bei jedem Vorfall",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            },
            {
                "titel": "🛑 Grenzen setzen lernen",
                "beschreibung": """
                **Du hast das Recht, NEIN zu sagen.**

                - Klar und deutlich
                - Nicht erklären oder rechtfertigen
                - Weggehen ist okay

                *Manchmal hilft Ignorieren - manchmal braucht es mehr.*
                """,
                "dauer": "Bei Bedarf",
                "schwierigkeit": "mittel",
                "sofort_umsetzbar": True
            },
            {
                "titel": "📞 Hilfe holen",
                "beschreibung": """
                **Es gibt anonyme Hilfe:**

                - **Nummer gegen Kummer:** 116 111 (kostenlos!)
                - **Online:** www.nummergegenkummer.de

                *Anrufen ist keine Schwäche - es ist ein kluger Schritt!*
                """,
                "dauer": "Jederzeit",
                "schwierigkeit": "leicht",
                "sofort_umsetzbar": True
            }
        ],

        "wissenschaft": {
            "hattie_d": 0.33,
            "hattie_rank": 82,
            "pisa_impact": "-40 Punkte bei Mobbing-Erfahrungen",
            "erklaerung": """
            **PISA 2022:** 23% der Schüler werden mindestens ein paar Mal
            pro Monat von Mitschülern drangsaliert.

            **Hattie d = 0.33** (Reducing bullying)

            **Folgen von Mobbing:**
            - Schlechtere Schulleistungen (bis zu -40 PISA-Punkte)
            - Weniger Wohlbefinden
            - Höheres Risiko für psychische Probleme

            **Wichtig:** Hilfe suchen ist der erste Schritt zur Besserung!

            *Niemand muss das alleine durchstehen.*
            """
        }
    }
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def embed_youtube(video_id: str, title: str = ""):
    """Bettet YouTube-Video ein"""
    
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    if HAS_PLAYER:
        st_player(url)
    else:
        # st.video unterstützt YouTube direkt
        st.video(url)

def render_video_section(videos: list, color: str):
    """Rendert die Video-Sektion"""
    
    if not videos:
        st.info("🎬 Videos für diesen Bereich werden gerade analysiert. Schau bald wieder vorbei!")
        return
    
    validated_videos = [v for v in videos if v.get('validated', False)]
    
    if not validated_videos:
        st.info("🎬 Videos für diesen Bereich werden gerade analysiert. Schau bald wieder vorbei!")
        return
    
    for video in validated_videos:
        st.markdown(f"""
        <div style="background: white; border-radius: 15px; padding: 5px; 
                    margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border-left: 5px solid {color};">
        </div>
        """, unsafe_allow_html=True)
        
        col1, col2 = st.columns([3, 2])
        
        with col1:
            # Video einbetten
            embed_youtube(video['id'], video.get('title', ''))
        
        with col2:
            st.markdown(f"### {video.get('title', 'Video')}")
            st.markdown(f"**{video.get('creator', '')}** · {video.get('duration_min', '?')} Min")
            
            if video.get('views'):
                st.markdown(f"👁️ {video.get('views')} Views")
            if video.get('score'):
                st.success(f"⭐ **Validierungs-Score: {video.get('score')}/10**")
            
            st.markdown("---")
            
            if video.get('kernbotschaft'):
                st.info(f"**💡 Kernbotschaft:** {video.get('kernbotschaft')}")
        
        # Warum hilft dieses Video?
        if video.get('warum_hilft'):
            with st.expander("🎯 Warum hilft dir dieses Video?", expanded=False):
                st.markdown(video.get('warum_hilft'))
        
        st.markdown("---")

def render_tipps_section(tipps: list, color: str):
    """Rendert die Tipps-Sektion"""
    
    if not tipps:
        st.info("💡 Tipps für diesen Bereich werden gerade zusammengestellt.")
        return
    
    # Sortiere: Sofort umsetzbar und leicht zuerst
    sofort = [t for t in tipps if t.get('sofort_umsetzbar', False) and t.get('schwierigkeit') == 'leicht']
    spaeter = [t for t in tipps if t not in sofort]
    
    if sofort:
        st.markdown("### ⚡ Sofort umsetzbar")
        for tipp in sofort:
            with st.expander(f"{tipp.get('titel', 'Tipp')} · ⏱️ {tipp.get('dauer', '')}", expanded=False):
                st.markdown(tipp.get('beschreibung', ''))
    
    if spaeter:
        st.markdown("### 📅 Mit etwas Übung")
        for tipp in spaeter:
            with st.expander(f"{tipp.get('titel', 'Tipp')} · ⏱️ {tipp.get('dauer', '')}", expanded=False):
                st.markdown(tipp.get('beschreibung', ''))

def render_wissenschaft_section(wissenschaft: dict, color: str):
    """Rendert die Wissenschafts-Sektion"""
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        d = wissenschaft.get('hattie_d', 0)
        if d >= 0.8:
            delta = "Sehr hoch!"
        elif d >= 0.6:
            delta = "Hoch"
        elif d >= 0.4:
            delta = "Überdurchschnittlich"
        else:
            delta = None
        st.metric("Hattie-Effektstärke", f"d = {d}", delta)
    
    with col2:
        st.metric("Hattie-Rang", f"#{wissenschaft.get('hattie_rank', '?')} / 252")
    
    with col3:
        st.metric("PISA-Einfluss", wissenschaft.get('pisa_impact', '?'))
    
    if wissenschaft.get('erklaerung'):
        st.markdown("---")
        st.markdown(wissenschaft.get('erklaerung'))

# ============================================
# MAIN APP
# ============================================

# URL-Parameter oder Session State
query_params = st.query_params
factor_from_url = query_params.get('factor', None)

if factor_from_url and factor_from_url in CONTENT_DATABASE:
    st.session_state.selected_factor = factor_from_url
elif 'selected_factor' not in st.session_state or st.session_state.selected_factor not in CONTENT_DATABASE:
    st.session_state.selected_factor = 'MATHEFF'  # Default

# Sidebar: Faktor-Auswahl
st.sidebar.header("📚 Bereich wählen")

factor_options = {
    content.get('name_schueler', key): key 
    for key, content in CONTENT_DATABASE.items()
}

# Finde aktuellen Index
current_factor = st.session_state.selected_factor
try:
    current_index = list(factor_options.values()).index(current_factor)
except ValueError:
    current_index = 0

selected_display = st.sidebar.selectbox(
    "Wähle einen Bereich:",
    options=list(factor_options.keys()),
    index=current_index
)

st.session_state.selected_factor = factor_options[selected_display]
factor = st.session_state.selected_factor

# Hole Content
content = CONTENT_DATABASE.get(factor, {})
if not content:
    st.error("Bereich nicht gefunden.")
    st.stop()

# ============================================
# HEADER
# ============================================

icon = content.get('icon', '📚')
name = content.get('name_de', factor)
color = content.get('color', '#667eea')

st.markdown(f"""
<div style="background: linear-gradient(135deg, {color} 0%, {color}aa 100%); 
            color: white; padding: 40px; border-radius: 20px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 2.5em;">{icon} {name}</h1>
</div>
""", unsafe_allow_html=True)

# Intro Text
st.markdown(content.get('intro_text', ''))

st.divider()

# ============================================
# TABS
# ============================================

tab1, tab2, tab3 = st.tabs(["🎬 Videos", "💡 Tipps & Übungen", "🔬 Wissenschaft"])

with tab1:
    st.header("🎬 Empfohlene Videos")
    st.markdown("Diese Videos wurden wissenschaftlich analysiert und helfen nachweislich bei diesem Thema.")
    render_video_section(content.get('videos', []), color)

with tab2:
    st.header("💡 Tipps & Übungen")
    st.markdown("Konkrete Strategien, die du sofort anwenden kannst.")
    render_tipps_section(content.get('tipps', []), color)

with tab3:
    st.header("🔬 Was sagt die Wissenschaft?")
    render_wissenschaft_section(content.get('wissenschaft', {}), color)

# ============================================
# FOOTER
# ============================================

st.divider()

col1, col2 = st.columns(2)

with col1:
    if st.button("⬅️ Zurück zur Auswertung", use_container_width=True):
        st.switch_page("pages/4_📊_Auswertung.py")

with col2:
    st.markdown("""
    <div style="text-align: right; color: #888; font-size: 14px; padding-top: 8px;">
        💡 Tipp: Fang mit EINEM Video oder EINEM Tipp an!
    </div>
    """, unsafe_allow_html=True)

# ============================================
# SIDEBAR INFO
# ============================================

st.sidebar.divider()

wissenschaft = content.get('wissenschaft', {})
st.sidebar.markdown(f"""
### {icon} Kurzinfo

| | |
|---|---|
| **Hattie d** | {wissenschaft.get('hattie_d', '?')} |
| **Rang** | #{wissenschaft.get('hattie_rank', '?')} |
| **PISA** | {wissenschaft.get('pisa_impact', '?')} |
""")

st.sidebar.divider()

# Quick Links zu anderen Bereichen
st.sidebar.markdown("### 🔗 Andere Bereiche")
for key, val in CONTENT_DATABASE.items():
    if key != factor:
        btn_icon = val.get('icon', '📚')
        btn_name = val.get('name_schueler', key)[:25]
        if st.sidebar.button(f"{btn_icon} {btn_name}", key=f"nav_{key}", use_container_width=True):
            st.session_state.selected_factor = key
            st.rerun()
