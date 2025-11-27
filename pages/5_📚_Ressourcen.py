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

# Import aus ausgelagerten Modulen
from utils.ressourcen.content_database import CONTENT_DATABASE
from utils.ressourcen.helpers import (
    embed_youtube,
    render_video_section,
    render_tipps_section,
    render_wissenschaft_section
)
from utils.ressourcen.matheff_content import render_matheff_altersstufen

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
# TRY TO IMPORT GAMIFICATION WIDGET (optional)
# ============================================

try:
    from utils.hattie_challenge_widget import render_hattie_challenge_widget
    from utils.bandura_sources_widget import render_bandura_sources_widget
    from utils.user_system import render_user_login, is_logged_in, get_current_user_id
    HAS_GAMIFICATION = True
except ImportError:
    HAS_GAMIFICATION = False

# ============================================
# CONTENT DATABASE - ausgelagert nach utils/ressourcen/content_database.py
# ============================================
# CONTENT_DATABASE wird jetzt importiert aus utils.ressourcen.content_database

_INLINE_CONTENT_DATABASE_REMOVED = {
    # ============================================
    # RANG 1: SELBSTWIRKSAMKEIT (d = 0.92)
    # ============================================
    "MATHEFF": {
        "name_de": "Mental stark (Selbstwirksamkeit)",
        "name_schueler": "Mental stark",
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
                "id": "QRiNRz2LKzQ",
                "title": "Was ist Selbstwirksamkeit?",
                "creator": "Stiftung Gesundheitswissen",
                "duration_min": 2,
                "url": "https://www.youtube.com/watch?v=QRiNRz2LKzQ",
                "score": 9.0,
                "views": "Empfohlen",
                "warum_hilft": """
                **Was du in 2 Minuten lernst:**

                Selbstwirksame Menschen sehen schwierige Aufgaben als **Herausforderung** - nicht als Bedrohung.
                Das erhöht die Chance, sie auch wirklich zu schaffen!

                **So baust du Selbstwirksamkeit auf:**

                1. **Eigene Erfolge erleben** - Wenn du etwas durch eigene Kraft schaffst, traust du dir beim nächsten Mal mehr zu

                2. **Von anderen lernen** - Schau dir an, wie Leute wie DU Probleme lösen. Wenn die das können, kannst du es auch!

                3. **Ermutigung annehmen** - Wenn Menschen, denen du vertraust, an dich glauben, hilft das

                4. **Auf deine Gefühle achten** - Wie du dich fühlst, beeinflusst, wie du Situationen meisterst
                """,
                "kernbotschaft": "Selbstwirksamkeit ist wie ein Muskel: Je öfter du Herausforderungen meisterst, desto stärker wird dein Glaube an dich selbst!",
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
            "hattie_d": "0.92 + 1.33",
            "hattie_rank": "3 + 2",
            "pisa_impact": "+40 Punkte (r = +0.40)",
            "erklaerung": """
            **Zwei der stärksten Hattie-Faktoren kombiniert:**

            - **Self-Efficacy** (d = 0.92, Rang #3) - Bandura's Selbstwirksamkeitstheorie
            - **Student Expectations** (d = 1.33, Rang #2) - Hattie's stärkster Schüler-Faktor!

            **Die 4 Quellen der Selbstwirksamkeit (Bandura 1997):**
            1. **Erfolgserlebnisse** (stärkste Quelle!) - Gestufte Aufgaben, Erfolge dokumentieren
            2. **Vorbilder** - "Wenn die das kann, kann ich es auch!"
            3. **Zuspruch** - Spezifisches Feedback: "Du hast die Methode richtig angewandt"
            4. **Körperliche Signale** - Angst reduzieren, positive Lernatmosphäre

            **WICHTIG:** Nicht "Du bist schlau" - sondern "Du hast gut gearbeitet"!

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
                "titel": "💭 Stärkende Selbstgespräche (Kognitive Umstrukturierung)",
                "beschreibung": """
                **Übe diese hilfreichen Gedanken:**

                💪 *"Ich kann das lernen, wenn ich übe."*

                💪 *"Ich habe mich vorbereitet."*

                💪 *"Schritt für Schritt schaffe ich das."*

                *Positive Selbstgespräche verändern, wie du dich fühlst!*

                Basiert auf **Kognitiver Verhaltenstherapie (Beck, 1979)**
                """,
                "dauer": "Täglich üben",
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

            **Growth Mindset – Sätze, die dein Gehirn stärken:**

            🌱 *"Ich kann das lernen, wenn ich übe."*

            🌱 *"Das ist eine Herausforderung – ich wachse daran."*

            🌱 *"Fehler zeigen mir, wo ich noch lernen kann."*

            🌱 *"Anstrengung macht mich besser."*

            **Hattie d = 0.36** - unterstützt Selbstwirksamkeit

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
# HELPER FUNCTIONS - ausgelagert nach utils/ressourcen/helpers.py
# ============================================
# Die Helper-Funktionen werden jetzt importiert aus utils.ressourcen.helpers

def _removed_embed_youtube(video_id: str, title: str = ""):
    """AUSGELAGERT - Bettet YouTube-Video ein"""
    
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    if HAS_PLAYER:
        st_player(url)
    else:
        # st.video unterstützt YouTube direkt
        st.video(url)

def _removed_render_video_section(videos: list, color: str):
    """AUSGELAGERT - Rendert die Video-Sektion"""
    
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

def _removed_render_tipps_section(tipps: list, color: str):
    """AUSGELAGERT - Rendert die Tipps-Sektion"""
    
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

def _removed_render_wissenschaft_section(wissenschaft: dict, color: str):
    """AUSGELAGERT - Rendert die Wissenschafts-Sektion"""
    
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
# SPEZIELLE RENDERING-FUNKTION FÜR MATHEFF - ausgelagert nach utils/ressourcen/matheff_content.py
# ============================================
# render_matheff_altersstufen wird jetzt importiert aus utils.ressourcen.matheff_content

def _removed_render_matheff_altersstufen(color: str):
    """AUSGELAGERT - Rendert die Selbstwirksamkeits-Ressource mit Challenges + Theorie-Tabs"""

    tab_interaktiv, tab_theorie = st.tabs([
        "🎮 Challenges",
        "📚 Theorie dahinter"
    ])

    # ==========================================
    # TAB 1: INTERAKTIV (Hattie + Bandura Challenge)
    # ==========================================
    with tab_interaktiv:
        st.header("🎮 Challenges")

        col1, col2 = st.columns([2, 1])

        with col1:
            st.markdown("""
            Trainiere deine Selbstwirksamkeit durch **realistische Selbsteinschätzung** –
            basierend auf John Hattie's Forschung zu "Student Expectations" (d = 1.33).

            **So funktioniert's:**
            1. Wähle ein Fach und beschreibe deine Aufgabe
            2. Schätze ehrlich: Wie viele Punkte wirst du schaffen?
            3. Mach die Aufgabe und trag dein echtes Ergebnis ein
            4. Sammle XP und Badges!
            """)

        with col2:
            st.info("""
            🔬 **Wissenschaft:**

            Wenn du deine eigene Erwartung
            übertriffst, speichert dein
            Gehirn: *"Ich kann mehr als
            ich dachte!"*

            Das ist Selbstwirksamkeit
            in Aktion.
            """)

        st.divider()

        # Gamification Widgets einbinden
        if HAS_GAMIFICATION:
            # Hattie-Challenge
            render_hattie_challenge_widget(compact=False, color=color)

            # Trenner zwischen den beiden Challenges
            st.markdown("---")
            st.markdown("")

            # Bandura-Challenge
            render_bandura_sources_widget(compact=False, color="#9C27B0")
        else:
            st.warning("""
            ⚠️ **Gamification-Module nicht gefunden.**

            Die interaktiven Challenges benötigen zusätzliche Module.
            Bitte stelle sicher, dass folgende Dateien im `utils/` Ordner vorhanden sind:
            - `gamification_db.py`
            - `gamification_ui.py`
            - `hattie_challenge_widget.py`
            - `bandura_sources_widget.py`
            """)

            # Fallback: Einfache manuelle Version
            st.markdown("---")
            st.subheader("📝 Manuelle Challenge (ohne Gamification)")

            with st.expander("🎯 Hattie-Challenge (Erwartungen)", expanded=True):
                st.markdown("""
                **Schritt 1:** Schreibe auf ein Blatt:
                - Fach: ____________
                - Aufgabe: ____________
                - Meine Schätzung: ____ Punkte

                **Schritt 2:** Mach die Aufgabe!

                **Schritt 3:** Trag ein:
                - Echtes Ergebnis: ____ Punkte
                - Differenz: ____

                **Schritt 4:** Reflexion:
                - Lag ich richtig? Warum/warum nicht?
                - Was kann ich beim nächsten Mal besser einschätzen?
                """)

            with st.expander("🧠 Bandura-Challenge (4 Quellen)", expanded=False):
                st.markdown("""
                Dokumentiere täglich deine Erfahrungen in den **4 Quellen der Selbstwirksamkeit**:

                **🏆 Mastery (Eigener Erfolg):**
                - Was habe ich heute geschafft?

                **👀 Vicarious (Vorbild-Lernen):**
                - Von wem habe ich gelernt? Wer hat mich inspiriert?

                **💬 Persuasion (Ermutigung):**
                - Welche ermutigenden Worte habe ich bekommen/gegeben?

                **🧘 Physiological (Körper-Management):**
                - Wie bin ich mit Stress umgegangen?

                **Ziel:** Alle 4 Quellen jeden Tag mindestens einmal aktivieren!
                """)

    # ==========================================
    # TAB 2: THEORIE DAHINTER (mit Altersstufen-Auswahl)
    # ==========================================
    with tab_theorie:
        # Altersstufen-Auswahl als Buttons
        st.markdown("### Wähle deine Altersstufe:")

        col1, col2, col3, col4, col5 = st.columns(5)

        # Session State für Altersstufe initialisieren
        if "selected_age_group" not in st.session_state:
            st.session_state.selected_age_group = "grundschule"

        with col1:
            if st.button("🎒 Grundschule\n(1-4)", key="btn_gs", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group == "grundschule" else "secondary"):
                st.session_state.selected_age_group = "grundschule"
                st.rerun()

        with col2:
            if st.button("📚 Unterstufe\n(5-7)", key="btn_us", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group == "unterstufe" else "secondary"):
                st.session_state.selected_age_group = "unterstufe"
                st.rerun()

        with col3:
            if st.button("🎯 Mittelstufe\n(8-10)", key="btn_ms", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group == "mittelstufe" else "secondary"):
                st.session_state.selected_age_group = "mittelstufe"
                st.rerun()

        with col4:
            if st.button("🎓 Oberstufe\n(11-13)", key="btn_os", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group == "oberstufe" else "secondary"):
                st.session_state.selected_age_group = "oberstufe"
                st.rerun()

        with col5:
            if st.button("👩‍🏫 Pädagogen", key="btn_ped", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group == "paedagogen" else "secondary"):
                st.session_state.selected_age_group = "paedagogen"
                st.rerun()

        st.divider()

        # ==========================================
        # GRUNDSCHULE CONTENT
        # ==========================================
        if st.session_state.selected_age_group == "grundschule":
            st.header("💪 Mental stark – Für kleine Helden")

            st.subheader("🎯 Was ist das eigentlich?")
            st.markdown("""
            Stell dir vor, du stehst vor einer richtig schweren Aufgabe. Vielleicht eine Mathe-Aufgabe,
            die du noch nie gemacht hast. Oder du sollst zum ersten Mal alleine Fahrrad fahren.

            **Was denkst du dann?**
            """)

            col1, col2 = st.columns(2)
            with col1:
                st.error('❌ "Das kann ich sowieso nicht..."')
            with col2:
                st.success('✅ "Das ist schwer, aber ich probier\'s mal!"')

            st.markdown("**Der Unterschied ist RIESIG.**")

            st.info("""
            Wenn du glaubst, dass du etwas schaffen kannst – dann schaffst du es auch viel öfter!
            Das nennen Forscher **"Selbstwirksamkeit"**. Ein langes Wort für: *"Ich weiß, dass ich Sachen lernen kann."*
            """)

            st.subheader("🔬 Was die Forscher herausgefunden haben")
            st.markdown("""
            Ein schlauer Forscher namens **John Hattie** hat sich gefragt: Was hilft Kindern am meisten beim Lernen?

            Er hat gaaaaanz viele Studien gelesen (mehr als du Bücher in deiner Schule hast!) und etwas Spannendes entdeckt:
            """)

            st.success("""
            **Kinder, die sich selbst Ziele setzen und dann MEHR schaffen als sie dachten –
            die werden immer besser und selbstbewusster!**
            """)

            st.markdown("""
            Das ist wie bei einem Videospiel: Wenn du einen Level schaffst, von dem du dachtest
            *"Das schaff ich nie!"* – dann traust du dir den nächsten Level auch zu!
            """)

            st.subheader("🌟 Die 4 Superhelden-Kräfte (nach Bandura)")
            st.markdown("Ein anderer Forscher, **Albert Bandura**, hat herausgefunden, wie man diese Superkraft bekommt:")

            with st.expander("🏆 **1. Kleine Siege sammeln**", expanded=True):
                st.markdown("""
                Jedes Mal wenn du etwas schaffst, wird dein "Ich-schaff-das-Muskel" stärker!

                **💡 Tipp:** Mach große Aufgaben klein.
                Statt *"Ich lerne alle Malaufgaben"* → *"Heute lerne ich nur die 3er-Reihe."*
                """)

            with st.expander("👀 **2. Von anderen abgucken (erlaubt!)**"):
                st.markdown("""
                Wenn dein Freund etwas Schweres schafft, denkst du: *"Hey, wenn der das kann, kann ich das auch!"*

                **💡 Tipp:** Such dir jemanden, der auch mal Probleme hatte – und frag, wie er es gelernt hat.
                """)

            with st.expander("💬 **3. Aufmunterung hilft**"):
                st.markdown("""
                Wenn Mama, Papa oder dein Lehrer sagt *"Du schaffst das!"* – dann glaubst du es auch mehr.

                **💡 Tipp:** Du kannst dir das auch selbst sagen! Sag dir: *"Ich probier's einfach mal."*
                """)

            with st.expander("😌 **4. Ruhig bleiben**"):
                st.markdown("""
                Wenn dein Herz schnell klopft vor einer Aufgabe, denk dran:
                Das ist nicht Angst, das ist **AUFREGUNG**! Dein Körper macht sich bereit!

                **💡 Tipp:** Atme 3x tief ein und aus. Dann geht's los!
                """)

            st.subheader("🎮 Die Hattie-Challenge: Übertreffe dich selbst!")
            st.markdown("**So funktioniert's:**")
            st.markdown("""
            1. **Vor der Aufgabe:** Schreib auf, wie viele Aufgaben du richtig haben wirst (deine Schätzung)
            2. **Mach die Aufgabe**
            3. **Danach:** Vergleiche! Hast du MEHR geschafft als du dachtest?
            """)

            col1, col2 = st.columns(2)
            with col1:
                st.success("**Wenn JA:** 🎉 Super! Dein Gehirn merkt sich: *'Ich kann mehr als ich denke!'*")
            with col2:
                st.info("**Wenn NEIN:** 🤔 Kein Problem! Frag dich: *'Was kann ich beim nächsten Mal anders machen?'*")

            st.subheader("📝 Mein Superhelden-Tagebuch")
            st.markdown("Jeden Tag aufschreiben:")
            st.markdown("""
            | Was habe ich heute geschafft? | War es schwer? | Wie habe ich mich gefühlt? |
            |------------------------------|----------------|---------------------------|
            | 3er-Reihe gelernt | Ja! | 💪 Stolz! |
            | Aufsatz geschrieben | Mittel | 😊 Zufrieden |
            """)

            st.subheader("💬 Deine Superhelden-Sätze")
            st.markdown("""
            **Sag dir diese Sätze – sie machen dich stärker:**

            🌟 *"Ich lerne noch!"*

            🌟 *"Das ist schwer – aber ich probier's!"*

            🌟 *"Ich vergleiche mich mit mir von gestern."*

            🌟 *"Jeder Fehler bringt mich weiter."*
            """)

            st.success("💡 **Das Wichtigste in einem Satz:** Du wirst nicht besser, weil du schlau bist. Du wirst besser, weil du ÜBST und nicht aufgibst!")

        # ==========================================
        # UNTERSTUFE CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "unterstufe":
            st.header("💪 Mental stark – Dein Gehirn ist trainierbar")

            # Video-Platzhalter
            with st.container():
                st.markdown("---")
                # TODO: Video-Bereich - hier können später Videos eingebettet werden
                st.markdown("---")

            st.subheader("🎯 Eine Entdeckung, die alles verändert")

            st.success("""
            **Forscher haben etwas Unglaubliches herausgefunden:**

            Dein Gehirn funktioniert wie ein Muskel. Je mehr du übst, desto stärker wird es.

            Das nennt man **Neuroplastizität** – und es bedeutet:
            **Deine Fähigkeiten sind nicht festgelegt. Sie können wachsen.**
            """)

            st.info("""
            Das ist keine Motivation-Floskel – das ist Biologie.
            Beim Lernen bilden sich neue Verbindungen zwischen Nervenzellen.
            Buchstäblich: **Dein Gehirn baut sich um, wenn du übst.**
            """)

            st.subheader("🔬 Was sagt die Wissenschaft?")
            st.markdown("""
            **John Hattie** hat über **80 Millionen Schüler** untersucht (kein Witz!).
            Er wollte wissen: Was macht den Unterschied zwischen erfolgreichen und weniger erfolgreichen Schülern?

            **Das Ergebnis:**
            - Nicht Intelligenz.
            - Nicht die Schule.
            - Nicht mal die Lehrer (sorry, Lehrer).
            """)

            st.success("""
            **Sondern: Wie du über dich selbst denkst.**

            Schüler, die glauben, dass sie eine Aufgabe schaffen können, schaffen sie auch öfter.

            Das nennt man **Selbstwirksamkeit** – und die hat eine Effektstärke von **0.63** (alles über 0.40 ist richtig gut!).
            """)

            st.subheader("🧠 Die 4 Quellen deiner Selbstwirksamkeit (Bandura)")
            st.markdown("Der Psychologe **Albert Bandura** hat erforscht, woher dieses 'Ich-schaff-das-Gefühl' kommt:")

            with st.expander("🏆 **1. Echte Erfolgserlebnisse (Die Stärkste!)**", expanded=True):
                st.markdown("""
                Nichts überzeugt dein Gehirn mehr als: **Du hast es selbst geschafft.**

                **Das Problem:** Wenn eine Aufgabe zu groß ist, gibst du vielleicht auf, bevor du Erfolg hast.

                **Die Lösung:** Zerlege große Aufgaben in Mini-Aufgaben.
                """)
                st.markdown("""
                | ❌ Zu groß | ✅ Mini-Aufgabe |
                |-----------|----------------|
                | "Ich lerne für die Mathe-Arbeit" | "Ich mache heute 10 Bruch-Aufgaben" |
                | "Ich werde besser in Englisch" | "Ich lerne heute 5 Vokabeln" |
                """)
                st.info("**Wichtig:** Schreib auf, was du geschafft hast! Dein Gehirn vergisst Erfolge schneller als Misserfolge.")

            with st.expander("👀 **2. Von anderen lernen**"):
                st.markdown("""
                Wenn du siehst, wie jemand **ÄHNLICHES** wie du etwas schafft,
                denkt dein Gehirn: *"Okay, scheint also möglich zu sein..."*

                **⚠️ Achtung:** Es muss jemand sein, der dir ähnlich ist!
                Wenn ein Mathe-Genie die Aufgabe löst, hilft dir das nicht.
                Aber wenn dein Kumpel, der auch Probleme hatte, es erklärt – das wirkt!

                **💡 Tipp:** Frag Klassenkameraden: *"Wie hast du das verstanden?"*
                """)

            with st.expander("💬 **3. Was andere zu dir sagen**"):
                st.markdown("""
                Wenn Lehrer oder Eltern sagen *"Du schaffst das!"* – hilft das.
                **ABER:** Nur wenn du es ihnen glaubst.

                **Noch stärker:** Sag es dir selbst.
                """)
                st.success('**Dein neuer innerer Spruch:** "Das ist schwer. Aber schwer heißt nicht unmöglich."')

            with st.expander("😤 **4. Dein Körper-Feeling**"):
                st.markdown("Schwitzige Hände vor dem Test? Herzklopfen?")
                st.markdown("**Das ist ein gutes Zeichen!** Dein Körper macht sich bereit.")

                st.success("""
                **Sag dir:**

                🚀 *"Ich bin aufgeregt – mein Körper ist bereit!"*

                🚀 *"Diese Energie hilft mir, mein Bestes zu geben!"*
                """)

                st.info("**Fun Fact:** Aufregung und Nervosität fühlen sich körperlich fast gleich an. Der Unterschied liegt nur in dem, was du dir sagst!")

            st.subheader("🎯 Die Hattie-Methode: Erwartungen übertreffen")
            st.markdown("Hattie nennt das **'Student Expectations'** – und es ist eine der stärksten Methoden überhaupt.")
            st.markdown("""
            **So geht's:**
            1. **Vor dem Test/der Aufgabe:** Schätze realistisch: *"Ich werde wahrscheinlich eine 3 bekommen."*
            2. **Gib dein Bestes**
            3. **Nach dem Ergebnis:** Wenn du BESSER bist als deine Schätzung → **BOOM!** Dein Selbstvertrauen steigt.
            """)
            st.warning("**Der Trick:** Deine Schätzung muss ehrlich sein. Nicht zu niedrig (um sicher zu gehen), nicht zu hoch (um cool zu wirken).")

            st.subheader("📊 Selbstcheck: Wie ist deine Selbstwirksamkeit?")
            st.markdown("Beantworte ehrlich (1 = stimmt gar nicht, 5 = stimmt total):")
            st.markdown("""
            | Aussage | 1 | 2 | 3 | 4 | 5 |
            |---------|---|---|---|---|---|
            | Wenn ich übe, werde ich besser | | | | | |
            | Auch schwere Aufgaben kann ich lösen, wenn ich dranbleibe | | | | | |
            | Fehler sind Teil des Lernens | | | | | |
            | Ich kann mich selbst motivieren | | | | | |
            """)
            st.markdown("""
            **Auswertung:**
            - **16-20:** Du bist auf einem guten Weg!
            - **11-15:** Da geht noch was – nutze die Strategien!
            - **4-10:** Kein Problem, aber fang HEUTE an, daran zu arbeiten.
            """)

            st.success('💡 **Das Wichtigste:** Dein Gehirn glaubt, was du ihm oft genug sagst. Also sag ihm das Richtige.')

        # ==========================================
        # MITTELSTUFE CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "mittelstufe":
            st.header("💪 Mental stark – Die Psychologie hinter deinem Erfolg")

            # Video-Platzhalter
            with st.container():
                st.markdown("---")
                # TODO: Video-Bereich - hier können später Videos eingebettet werden
                st.markdown("---")

            st.subheader("🎯 Warum das hier wichtig ist")
            st.markdown("""
            Du stehst vor dem Übertritt, vor Abschlussprüfungen, vor wichtigen Entscheidungen.
            Und mal ehrlich: **Der Druck ist real.**

            Aber hier ist die Sache: Es geht nicht nur darum, was du KANNST.
            Es geht darum, was du **GLAUBST**, dass du kannst.

            *Und das ist keine Esoterik – das ist Wissenschaft.*
            """)

            st.subheader("📊 Die Daten sprechen – weltweit")
            st.markdown("""
            **PISA 2022** ist die weltweit größte Bildungsstudie:
            - **690.000 Schüler** getestet
            - **81 Länder** – von Singapur bis Finnland, von Brasilien bis Japan
            - Repräsentiert **29 Millionen** 15-Jährige weltweit

            Forscher haben mit Machine Learning (XGBoost, SHAP) analysiert:
            *Was bestimmt den Mathe-Erfolg – überall auf der Welt?*
            """)

            st.success("""
            **Das Ergebnis – und es gilt WELTWEIT:**

            **Mathematische Selbstwirksamkeit** ist der stärkste Prädiktor für Mathematikleistung.

            ✅ In westlichen Ländern (Deutschland, Finnland, Dänemark)
            ✅ In asiatischen Top-Performern (Singapur, Korea, Japan, Taiwan)
            ✅ In **ALLEN 81** untersuchten Bildungssystemen

            Stärker als der sozioökonomische Hintergrund. Stärker als die Schule. Stärker als wie viel du übst.
            """)

            st.info("""
            **Was heißt das konkret?**

            Zwei Schüler mit dem GLEICHEN Wissen können völlig unterschiedlich abschneiden –
            je nachdem, wie sehr sie an sich glauben.

            Und das ist kein kulturelles Artefakt – es ist ein **universelles Prinzip**.
            """)

            st.subheader("🧠 Hattie: Was wirklich funktioniert")
            st.markdown("John Hattie hat in seiner Meta-Analyse (über 1.400 Studien, 300 Millionen Schüler) Folgendes gefunden:")
            st.markdown("""
            | Faktor | Effektstärke | Was es bedeutet |
            |--------|--------------|-----------------|
            | Selbstwirksamkeit | 0.63 | Starker Effekt |
            | Selbst-Einschätzung | 1.33 | Mega-Effekt |
            | Hausaufgaben | 0.29 | Schwacher Effekt |
            | Klassengröße | 0.21 | Kaum Effekt |
            """)
            st.warning("**Die Kernbotschaft:** Was DU denkst, hat mehr Einfluss als äußere Umstände.")

            with st.expander("📉 **Zum Vergleich: Mathe-Angst (ANXMAT)**"):
                st.markdown("""
                Die Kehrseite der Selbstwirksamkeit ist **Mathe-Angst** – und auch hier sind die PISA-Daten eindeutig:

                - **Ein Punkt mehr** auf dem Angst-Index = **18 Punkte weniger** in Mathe (OECD-Durchschnitt)
                - Der Anteil nervöser Schüler ist **gestiegen**: 31% (2012) → 39% (2022)
                - In **JEDEM** der 81 Bildungssysteme ist Angst negativ mit Leistung korreliert

                **Die gute Nachricht:** Selbstwirksamkeit und Angst hängen zusammen.
                Wenn du deine Selbstwirksamkeit stärkst, sinkt automatisch die Angst.
                """)

            st.subheader("🔄 Die Bandura-Theorie: So entsteht Selbstwirksamkeit")
            st.markdown("**Albert Bandura** (Stanford-Psychologe, einer der meistzitierten Wissenschaftler überhaupt) hat **vier Quellen** identifiziert:")

            with st.expander("🏆 **1. Mastery Experiences (Meisterschaftserfahrungen)**", expanded=True):
                st.markdown("""
                > *"Mastery experiences are the most powerful driver of self-efficacy
                > because they provide authentic evidence of whether one can succeed."*

                **Übersetzt:** Nichts überzeugt dich so sehr wie dein eigener Erfolg.

                **Aber Achtung:** Es müssen ECHTE Herausforderungen sein.
                Wenn alles zu leicht ist, lernst du nichts über deine Fähigkeiten.
                """)
                st.info("""
                **Strategie: Progressive Overload**
                - Woche 1: 10 einfache Aufgaben
                - Woche 2: 10 mittlere Aufgaben
                - Woche 3: 5 schwere Aufgaben
                - → Du merkst: *"Hey, ich kann das steigern!"*
                """)

            with st.expander("👀 **2. Vicarious Experiences (Stellvertretende Erfahrungen)**"):
                st.markdown("""
                > *"Seeing people similar to oneself succeed by sustained effort
                > raises observers' beliefs that they too possess the capabilities."*

                **Der Schlüssel:** Die Person muss dir ÄHNLICH sein.
                - Ein Mathegenie als Vorbild? ❌ Nicht hilfreich.
                - Ein Klassenkamerad, der auch kämpfen musste? ✅ Sehr hilfreich.

                **Konkret:**
                - Frag Leute, die es geschafft haben: *"Was war dein Weg?"*
                - Schau dir YouTube-Tutorials von "normalen" Leuten an, nicht nur von Profis
                - Lerngruppen mit unterschiedlichen Levels
                """)

            with st.expander("💬 **3. Verbal Persuasion (Soziale Überzeugung)**"):
                st.markdown("""
                Ermutigung hilft – **ABER:** Die Person muss glaubwürdig sein.

                Wenn dein Mathe-Lehrer sagt *"Du kannst das"* und du weißt, dass er dich kennt, wirkt das.
                Wenn jemand Fremdes das sagt, eher nicht.

                **Noch wichtiger: Dein Selbstgespräch**

                Forschung zeigt: Die Art, wie du mit dir selbst sprichst, beeinflusst deine Leistung messbar.
                """)
                st.success("""
                **Sätze, die dich stärker machen:**

                💪 *"Das ist noch eine Herausforderung für mich."*

                💪 *"Meine Vorbereitung hat sich ausgezahlt."*

                💪 *"Ich werde mein Bestes geben."*

                💪 *"Ich kann das lernen, wenn ich dranbleibe."*
                """)

            with st.expander("😤 **4. Physiological & Emotional States**"):
                st.markdown("""
                Dein Körper sendet Signale. Dein Gehirn interpretiert sie.

                **Reframing-Technik:** Herzklopfen und schneller Atem bedeuten:
                *"Ich bin aktiviert und bereit!"*

                Das ist wissenschaftlich fundiert – körperliche Aktivierung
                kann Leistung verbessern, wenn du sie positiv interpretierst.
                """)
                st.info("""
                **Praktische Tools:**
                - **Box Breathing:** 4 Sek. ein, 4 Sek. halten, 4 Sek. aus, 4 Sek. halten
                - **Power Posing:** 2 Min. aufrechte Haltung vor wichtigen Situationen
                - **Schlaf:** Deine Selbstwirksamkeit sinkt messbar bei Schlafmangel
                """)

            st.subheader("🎯 Die Hattie-Strategie: Student Expectations")
            st.markdown("""
            **So funktioniert's:**
            1. **Vor der Prüfung:** Schreibe deine realistische Erwartung auf (Note oder Punktzahl)
            2. **Lerne mit dem Ziel, diese Erwartung zu übertreffen**
            3. **Nach der Prüfung:** Vergleiche Erwartung vs. Ergebnis
            """)
            st.success("""
            **Warum das funktioniert:**

            Wenn du ÜBER deiner Erwartung liegst, speichert dein Gehirn: *"Ich kann mehr als ich denke."*

            Das ist keine Motivation-Trickserei – das ist, wie dein Selbstbild tatsächlich entsteht.
            """)

            st.subheader("📊 Fehler-Analyse: Dein Detektiv-Modus")
            st.markdown("**Nach einem Misserfolg:** Werde zum Detektiv und analysiere.")

            st.info("""
            **Deine Analyse-Fragen:**

            🔍 *"Welcher Teil war das Problem?"*

            🔍 *"Was fehlte mir? Zeit? Wissen? Übung?"*

            🔍 *"Was mache ich beim nächsten Mal anders?"*

            🔍 *"Welche Strategie könnte besser funktionieren?"*
            """)

            st.success("""
            **Der Trick:** Schreibe Erfolg deiner Anstrengung zu – das motiviert dich weiterzumachen.
            Und wenn etwas nicht klappt: Es lag an der Strategie, nicht an dir. Strategien kann man ändern.
            """)

            st.success("""
            💡 **Das Wichtigste:**

            Selbstwirksamkeit ist keine fixe Eigenschaft – sie ist **trainierbar wie ein Muskel**.
            Und die PISA-Daten zeigen: Sie ist der wichtigste Prädiktor für deinen Erfolg.
            """)

        # ==========================================
        # OBERSTUFE CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "oberstufe":
            st.header("💪 Mental stark – Selbstwirksamkeit als Meta-Kompetenz")

            # Video-Platzhalter
            with st.container():
                st.markdown("---")
                # TODO: Video-Bereich - hier können später Videos eingebettet werden
                st.markdown("---")

            st.subheader("🎯 Warum das jetzt relevant ist")
            st.markdown("""
            Du bist kurz vor dem Abitur. Vielleicht vor der Entscheidung für Studium oder Ausbildung.
            Die Anforderungen steigen – aber auch deine Fähigkeit, damit umzugehen.

            **Hier ist die Realität:** Nach der Schule gibt es keine Noten mehr.
            Aber das Prinzip der Selbstwirksamkeit bleibt der entscheidende Faktor für deinen Erfolg –
            im Studium, im Beruf, im Leben.
            """)

            st.subheader("🔬 Die empirische Basis")

            with st.expander("📊 **PISA 2022: Die weltweit größte Bildungsstudie**", expanded=True):
                st.markdown("""
                **Die Zahlen:**
                - **690.000** getestete Schüler
                - **81** Länder und Volkswirtschaften
                - Repräsentiert **29 Millionen** 15-Jährige weltweit
                - Veröffentlicht am 5. Dezember 2023

                Machine Learning Analysen (XGBoost, SHAP) über multiple Bildungssysteme zeigen:

                > *"MATHEFF (Mathematical Self-Efficacy) emerged as the most influential factor
                > affecting mathematical literacy."*

                **Die Partial Dependence Plots zeigen:**
                - MATHEFF > -0.5 tendiert zu erhöhten Mathematikleistungen
                - ANXMAT (Mathe-Angst) < 0 korreliert ebenfalls positiv

                **Implikation:** Die psychologische Disposition hat mehr prädiktive Kraft als strukturelle Faktoren.
                """)

                st.info("""
                **Warum das so bedeutsam ist:**

                Dieser Befund ist **kulturübergreifend repliziert** – er gilt sowohl für
                individualistische (westliche) als auch für kollektivistische (asiatische) Kulturen.

                Das bedeutet: Es ist kein kulturelles Artefakt, sondern ein **universelles Prinzip**.
                """)

            with st.expander("📚 **Hattie's Visible Learning (2017/2018)**"):
                st.markdown("""
                | Faktor | Effektstärke | Rang |
                |--------|--------------|------|
                | Collective Teacher Efficacy | 1.57 | 1 |
                | Self-Reported Grades | 1.33 | 2 |
                | Self-Efficacy | 0.63 | Top 20 |
                | Socioeconomic Status | 0.52 | - |

                **Interpretation:** Selbstbezogene Variablen (Erwartungen, Selbstwirksamkeit)
                haben höhere Effektstärken als externe Faktoren.
                """)

            st.subheader("🧠 Banduras Selbstwirksamkeitstheorie: Vertiefung")
            st.markdown("""
            **Albert Bandura** definiert Selbstwirksamkeit als:

            > *"People's beliefs about their capabilities to produce designated levels of performance
            > that exercise influence over events that affect their lives."*

            Dies ist **domänenspezifisch** – du kannst hohe Selbstwirksamkeit in Chemie
            und niedrige in Literatur haben.
            """)

            st.markdown("**Die vier Informationsquellen (hierarchisch geordnet):**")

            with st.expander("🏆 **1. Enactive Mastery Experiences**", expanded=True):
                st.markdown("""
                Die stärkste Quelle. Warum?

                > *"Direct evidence of successful performance provides authentic evidence of mastery."*

                **Kognitionspsychologischer Mechanismus:** Erfolgreiche Erfahrungen werden als
                Evidenz für zukünftige Kompetenz encodiert.

                **Aber:** Der Kontext matters. Ein Erfolg bei einer trivialen Aufgabe stärkt nicht.
                Der Erfolg muss auf eine **HERAUSFORDERUNG** folgen.
                """)
                st.info("""
                **Strategische Implikation:**
                - **Deliberate Practice:** Aufgaben knapp über deinem aktuellen Niveau
                - **Scaffolding:** Komplexe Aufgaben in bewältigbare Chunks
                - **Dokumentation:** Erfolge explizit festhalten (Portfolio, Journal)
                """)

            with st.expander("👀 **2. Vicarious Experiences**"):
                st.markdown("""
                Die Wirkung hängt von der wahrgenommenen Ähnlichkeit zum Modell ab.

                > *"The greater the assumed similarity, the more persuasive are the models'
                > successes and failures."*

                **In der Praxis:**
                - **Peer Learning > Expert Learning** für Selbstwirksamkeit
                - **Coping Models** (die Schwierigkeiten überwinden) > **Mastery Models** (die alles perfekt können)
                """)

            with st.expander("💬 **3. Verbal Persuasion**"):
                st.markdown("""
                Wirksam, aber nur unter bestimmten Bedingungen:
                - Glaubwürdigkeit der Quelle
                - Konsistenz mit eigener Erfahrung
                - Spezifität des Feedbacks

                **Selbstgerichtete verbale Persuasion (Self-Talk):**

                Forschung zeigt messbare Leistungsunterschiede zwischen:
                - **Motivational Self-Talk** (*"Ich kann das"*)
                - **Instructional Self-Talk** (*"Nächster Schritt ist..."*)
                """)

            with st.expander("😤 **4. Physiological & Affective States**"):
                st.markdown("""
                Die Interpretation somatischer Signale ist entscheidend:

                > *"It is not the sheer intensity of emotional and physical reactions that is important
                > but rather how they are perceived and interpreted."*

                **Reappraisal-Technik:** Angst-Arousal als Performance-Bereitschaft reframen.

                Studien zeigen: Probanden, die angewiesen wurden, ihre Nervosität als "Aufregung"
                zu interpretieren, performten signifikant besser.
                """)

            st.subheader("🎯 Hatties 'Student Expectations': Mechanismus und Anwendung")
            st.markdown("""
            Hattie bezeichnet dies als einen der stärksten Einflussfaktoren (**d = 1.33**).

            **Der psychologische Mechanismus:**
            1. Du setzt eine Erwartung (basierend auf bisheriger Performanz)
            2. Du performst
            3. Wenn Performanz > Erwartung: Positive Diskrepanz → Selbstwirksamkeit ↑
            4. Neue, höhere Baseline-Erwartung
            """)
            st.warning("""
            **Kritischer Punkt:** Die Erwartung muss realistisch sein.
            Zu niedrige Erwartungen (um "sicher" zu übertreffen) funktionieren nicht –
            das Gehirn ist nicht so leicht zu täuschen.
            """)
            st.info("""
            **Implementierung:**
            1. Führe ein Erwartungs-Log vor jeder signifikanten Leistungssituation
            2. Reflektiere systematisch: Erwartung vs. Outcome
            3. Analysiere: Was erklärt die Diskrepanz?
            """)

            st.subheader("🔄 Integration: Selbstwirksamkeit als sich selbst verstärkender Zyklus")
            st.markdown("""
            ```
            Hohe Selbstwirksamkeit
                    ↓
            Höhere Anstrengung & Persistenz
                    ↓
            Bessere Strategiewahl
                    ↓
            Höhere Erfolgswahrscheinlichkeit
                    ↓
            Mastery Experience
                    ↓
            Noch höhere Selbstwirksamkeit
            ```

            *Das Inverse gilt auch – weshalb Intervention früh ansetzen muss.*
            """)

            st.subheader("📊 Selbstdiagnostik: Woher kommt deine Selbstwirksamkeit?")
            st.markdown("Reflektiere für ein spezifisches Fach:")
            st.markdown("""
            | Quelle | Deine Situation | Stärke (1-5) |
            |--------|-----------------|--------------|
            | Mastery Experiences | Welche Erfolge hattest du in diesem Fach? | |
            | Vicarious Experiences | Kennst du Peers, die ähnliche Herausforderungen gemeistert haben? | |
            | Verbal Persuasion | Welches Feedback hast du bekommen? Von wem? | |
            | Physiological States | Wie fühlst du dich körperlich vor Prüfungen in diesem Fach? | |
            """)
            st.info("**Intervention:** Fokussiere auf die schwächste Quelle.")

            st.subheader("🎓 Transfer auf Post-Schule")
            st.markdown("""
            Selbstwirksamkeit ist ein Prädiktor für:
            - Studienerfolg (stärker als Abiturnote)
            - Berufliche Leistung
            - Karriereentwicklung
            - Lebenszufriedenheit
            """)
            st.success("""
            **Das Prinzip bleibt gleich:**
            1. Setze herausfordernde, aber erreichbare Ziele
            2. Dokumentiere Erfolge
            3. Suche relevante Vorbilder
            4. Manage deinen physiologischen Zustand
            5. Übertreffe systematisch deine Erwartungen
            """)

            st.success("""
            💡 **Das Wichtigste:**

            Selbstwirksamkeit ist nicht, wie kompetent du BIST – sondern wie kompetent du GLAUBST zu sein.
            Und dieser Glaube ist trainierbar, evidenzbasiert beeinflussbar, und einer der stärksten
            Prädiktoren für Erfolg, die wir kennen.
            """)

        # ==========================================
        # PÄDAGOGEN CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "paedagogen":
            st.header("💪 Mental stark – Für Pädagogen")

            st.info("""
            🚧 **Dieser Bereich wird gerade erstellt.**

            Hier finden Sie bald:
            - Didaktische Implementierungshinweise
            - Materialien für den Unterricht
            - Evidenzbasierte Empfehlungen zur Förderung der Selbstwirksamkeit
            """)

    # Zusammenfassungs-Box am Ende
    st.divider()
    st.subheader("📋 Zusammenfassung aller Altersstufen")
    st.markdown("""
    | Altersstufe | Kernbotschaft | Hauptstrategie |
    |-------------|---------------|----------------|
    | 🎒 Grundschule | "Probieren macht Meister" | Kleine Erfolge feiern |
    | 📚 Unterstufe | "Dein Gehirn ist trainierbar" | Erwartungen setzen & übertreffen |
    | 🎯 Mittelstufe | "Was du denkst, bestimmt was du schaffst" | Die 4 Quellen aktiv nutzen |
    | 🎓 Oberstufe | "Selbstwirksamkeit ist trainierbare Meta-Kompetenz" | Systematische Selbstdiagnostik & Intervention |
    | 👩‍🏫 Pädagogen | "Selbstwirksamkeit systematisch fördern" | Evidenzbasierte Unterrichtsgestaltung |
    """)

# ============================================
# SPEZIELLE RENDERING-FUNKTION FÜR EXT_LEARNSTRAT (Cleverer lernen)
# ============================================

def render_learnstrat_altersstufen(color: str):
    """Rendert die Lernstrategien-Ressource mit Challenges + Theorie-Tabs"""

    tab_interaktiv, tab_theorie = st.tabs([
        "🎮 Challenges",
        "📚 Theorie dahinter"
    ])

    # ==========================================
    # TAB 1: CHALLENGES (Platzhalter)
    # ==========================================
    with tab_interaktiv:
        st.header("🎮 Challenges")

        st.info("""
        🚧 **Hier entstehen bald interaktive Lernstrategie-Challenges!**

        Geplant:
        - 📝 Active Recall Challenge
        - ⏰ Pomodoro-Tracker
        - 🗺️ Mind Map Creator
        """)

    # ==========================================
    # TAB 2: THEORIE DAHINTER (mit Altersstufen-Auswahl)
    # ==========================================
    with tab_theorie:
        # Altersstufen-Auswahl als Buttons
        st.markdown("### Wähle deine Altersstufe:")

        col1, col2, col3, col4, col5 = st.columns(5)

        # Session State für Altersstufe initialisieren (separater Key für Learnstrat)
        if "selected_age_group_learnstrat" not in st.session_state:
            st.session_state.selected_age_group_learnstrat = "grundschule"

        with col1:
            if st.button("🎒 Grundschule\n(1-4)", key="btn_ls_gs", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_learnstrat == "grundschule" else "secondary"):
                st.session_state.selected_age_group_learnstrat = "grundschule"
                st.rerun()

        with col2:
            if st.button("📚 Unterstufe\n(5-7)", key="btn_ls_us", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_learnstrat == "unterstufe" else "secondary"):
                st.session_state.selected_age_group_learnstrat = "unterstufe"
                st.rerun()

        with col3:
            if st.button("🎯 Mittelstufe\n(8-10)", key="btn_ls_ms", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_learnstrat == "mittelstufe" else "secondary"):
                st.session_state.selected_age_group_learnstrat = "mittelstufe"
                st.rerun()

        with col4:
            if st.button("🎓 Oberstufe\n(11-13)", key="btn_ls_os", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_learnstrat == "oberstufe" else "secondary"):
                st.session_state.selected_age_group_learnstrat = "oberstufe"
                st.rerun()

        with col5:
            if st.button("👩‍🏫 Pädagogen", key="btn_ls_ped", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_learnstrat == "paedagogen" else "secondary"):
                st.session_state.selected_age_group_learnstrat = "paedagogen"
                st.rerun()

        st.divider()

        # ==========================================
        # GRUNDSCHULE CONTENT (Original MaiThink-Style)
        # ==========================================
        if st.session_state.selected_age_group_learnstrat == "grundschule":
            st.header("🧠 CLEVERER LERNEN")
            st.markdown("**Die Wissenschaft sagt: Du machst es falsch. Aber keine Sorge – wir fixen das jetzt.**")

            # ========== PLOT TWIST INTRO ==========
            st.markdown("### ⚡ PLOT TWIST: Mehr lernen ≠ Besser lernen")

            st.markdown("""
            Stell dir vor, du lernst 5 Stunden für eine Prüfung. Du liest alles dreimal durch, markierst die wichtigsten Stellen gelb, schreibst eine Zusammenfassung. Du fühlst dich super vorbereitet.

            Und dann? Schreibst du eine 4.

            Deine Freundin hat nur 2 Stunden gelernt. Sie schreibt eine 1.

            Ist sie einfach schlauer? **Nein.** Sie lernt nur ANDERS. Und jetzt kommt's: Die Wissenschaft weiß seit über 100 Jahren, welche Methoden funktionieren. Die Schule hat's dir nur nie erzählt.
            """)

            # ========== INHALTSVERZEICHNIS ==========
            with st.expander("📋 Was dich erwartet"):
                st.markdown("""
- Das Problem: Warum Schule dir das Falsche beibringt
- Die Wissenschaft: Was WIRKLICH funktioniert (mit Zahlen!)
- Die 7 Power-Techniken (speziell für dich angepasst)
- Transfer: Das Geheimnis der Überflieger
- Birkenbihl-Methode: Der Faden-Trick
- Das Paradox: Warum sich gutes Lernen schlecht anfühlt
                """)

            st.divider()

            # ========== 1. DAS PROBLEM ==========
            st.markdown("### 1. 🚫 Das Problem: Die Schule hat's verbockt")

            st.markdown("""
            *"Schreib das auf, dann merkst du's dir!"*

            Diesen Satz hast du wahrscheinlich tausendmal gehört. Und er ist... falsch. Zumindest so, wie die Schule ihn meint.
            """)

            with st.expander("Was die meisten Schüler machen"):
                st.markdown("""
- Text mehrmals durchlesen (*"Wird schon hängenbleiben..."*)
- Wichtiges gelb markieren (*Sieht produktiv aus!*)
- Zusammenfassung schreiben (*Dauert ewig...*)
- Am Abend vorher alles reinprügeln (*Cramming!*)

🎬 **PLOT TWIST:** Alle diese Methoden sind wissenschaftlich gesehen... meh.

Forscher von der Kent State University (Dunlosky et al., 2013) haben 10 beliebte Lerntechniken untersucht. Ergebnis: **Die Techniken, die Schüler am häufigsten nutzen, sind am wenigsten effektiv.** Autsch.
                """)

            st.divider()

            # ========== 2. DIE WISSENSCHAFT ==========
            st.markdown("### 2. 🔬 Die Wissenschaft: Effektstärken erklärt")

            st.markdown("""
            *"Okay, aber woher weißt du, dass das stimmt?"*

            Gute Frage! Hier kommt **John Hattie** ins Spiel. Der Neuseeländer hat über 1.800 Meta-Studien mit mehr als 300 Millionen Schülern ausgewertet. Das ist wie... ALLE Studien zum Thema Lernen, die es gibt. Zusammengefasst.
            """)

            with st.expander("Was ist eine 'Effektstärke' (d)?"):
                st.markdown("""
Stell dir vor, du misst, wie viel Schüler in einem Jahr lernen. Das ist der Normalfall. Jetzt fragst du: Bringt Methode X mehr oder weniger als dieses eine Jahr?

- **d = 0.40** → Ein Jahr Lernfortschritt (der Durchschnitt)
- **d > 0.40** → Mehr als ein Jahr! 🎉
- **d < 0.40** → Weniger als ein Jahr 😕
- **d = 0.80** → Zwei Jahre Fortschritt in einem Jahr! 🚀

🎬 **Die Top-Effektstärken für Lernstrategien:**

| Technik | Effektstärke | Bewertung |
|---------|--------------|-----------|
| Selbsttest (Retrieval) | d = 0.58 | ⭐⭐⭐ High Utility |
| Verteiltes Lernen | d = 0.60 | ⭐⭐⭐ High Utility |
| Feynman-Methode | d = 0.75 | ⭐⭐⭐ Sehr hoch! |
| Markieren | d = 0.36 | ❌ Low Utility |
| Wiederlesen | d = 0.36 | ❌ Low Utility |
                """)

            st.divider()

            # ========== 3. DIE 7 POWER-TECHNIKEN ==========
            st.markdown("### 3. 💪 Die 7 Power-Techniken")

            st.markdown("""
            Jetzt wird's praktisch. Hier sind die 7 Techniken, die nachweislich funktionieren – speziell für dich angepasst!
            """)

            # ----- TECHNIK 1: Retrieval Practice -----
            with st.expander("⚡ **Technik 1: Retrieval Practice (Selbsttest)** – Effektstärke: d = 0.58"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn. Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er. Wiederlesen ist, als würdest du den Pfad nur anschauen. Abrufen ist, ihn tatsächlich zu gehen.

---

**🎒 So geht's für dich (GRUNDSCHULE):**

- **"Buch zu, Augen zu, erzähl mir, was du gerade gelesen hast!"**
- Mach ein Spiel daraus: Wer kann sich an die meisten Sachen erinnern?
- Benutze Bildkarten und dreh sie um – was war auf der Karte?
- Eltern können fragen: *"Was hast du heute in der Schule gelernt?"* (Und wirklich nachfragen, nicht nur nicken!)
                """)

            # ----- TECHNIK 2: Spaced Repetition -----
            with st.expander("📅 **Technik 2: Spaced Repetition (Zeitversetzt wiederholen)** – Effektstärke: d = 0.60"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Dein Gehirn vergisst. Schnell. Die Vergessenskurve (Ebbinghaus, 1885 – ja, das wissen wir seit über 100 Jahren!) zeigt: Nach 24 Stunden hast du 70% vergessen. ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher. Mit jeder Wiederholung hält das Wissen länger.

💡 **Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

---

**🎒 So geht's für dich (GRUNDSCHULE):**

- *"Weißt du noch, was wir gestern gelernt haben? Und vorgestern?"*
- Eltern: Baut kleine Quiz-Momente in den Alltag ein. Beim Abendessen: *"Was war nochmal...?"*
- Macht einen Wochen-Rückblick am Sonntag: *"Was haben wir diese Woche alles gelernt?"*
- **Sticker-Kalender:** Jedes Mal, wenn wiederholt wird, gibt's einen Sticker!
                """)

            # ----- TECHNIK 3: Feynman-Methode -----
            with st.expander("👶 **Technik 3: Feynman-Methode (Erklär's einem 10-Jährigen)** – Effektstärke: d = 0.75"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Richard Feynman war Nobelpreisträger für Physik und legendär dafür, komplizierte Sachen einfach zu erklären. Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

---

**🎒 So geht's für dich (GRUNDSCHULE):**

- **"Erklär's deinem Teddy!"** Oder: Spiel Lehrer! Stell deine Kuscheltiere in eine Reihe und erkläre ihnen, was du gelernt hast.
- Wenn du stecken bleibst, weißt du, was du nochmal nachschauen musst.
- **Bonus:** Geschwister unterrichten! (Die fragen nämlich wirklich nach, wenn sie's nicht verstehen.)
                """)

            # ----- TECHNIK 4: Interleaving -----
            with st.expander("🔀 **Technik 4: Interleaving (Mischen statt Blocken)** – Effektstärke: d = 0.67"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B. Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C... Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist. Das trainiert dein Gehirn, Unterschiede zu erkennen.

🎬 **Fun Fact:** Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!

---

**🎒 So geht's für dich (GRUNDSCHULE):**

- Beim Üben abwechseln: Mal eine Aufgabe Plus, dann Minus, dann Plus, dann Minus. Nicht erst 10x Plus und dann 10x Minus.
- Bei Vokabeln: Nicht alle Tiere, dann alle Farben – sondern bunt gemischt!
- Spiele wie **Memory** trainieren das automatisch.
                """)

            # ----- TECHNIK 5: Loci-Methode -----
            with st.expander("🏰 **Technik 5: Loci-Methode (Gedächtnispalast)** – Effektstärke: d = 0.65"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Diese Methode nutzen Gedächtnis-Weltmeister! Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst. Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

---

**🎒 So geht's für dich (GRUNDSCHULE):**

- *"Stell dir vor, ein Apfel liegt auf deinem Bett!"*
- **Kinderzimmer-Rundgang:** Tür = erste Vokabel, Bett = zweite, Schrank = dritte...
- Je verrückter die Bilder, desto besser! Der Apfel tanzt auf dem Bett? SUPER, das merkst du dir!
                """)

            # ----- TECHNIK 6: Pomodoro -----
            with st.expander("🍅 **Technik 6: Pomodoro-Technik (25 + 5)** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach. Die Pomodoro-Technik nutzt das: 25 Min fokussiert arbeiten, dann 5 Min echte Pause (nicht Handy!). Nach 4 Runden: 15-30 Min längere Pause.

---

**🎒 So geht's für dich (GRUNDSCHULE):**

- **Kürzere Intervalle:** 10-15 Min lernen, dann 5 Min Bewegungspause (Hampelmann, Tanzen, Rennen).
- Eine Sanduhr oder Timer macht's spannend. *"Schaffst du es, bis die Zeit abläuft konzentriert zu bleiben?"*
                """)

            # ----- TECHNIK 7: Lernen durch Lehren -----
            with st.expander("👥 **Technik 7: Lernen durch Lehren** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

*"Wer lehrt, lernt doppelt."* Das ist nicht nur ein Spruch. Wenn du jemandem etwas erklärst, musst du: 1) Es selbst verstehen, 2) Es in klare Worte fassen, 3) Auf Fragen reagieren. Das ist Elaboration, Retrieval Practice und Metakognition in einem!

---

**🎒 So geht's für dich (GRUNDSCHULE):**

- **Geschwister-Schule!** Der Große erklärt dem Kleinen.
- Oder: Eltern spielen dumm. *"Mama/Papa versteht das nicht, kannst du es mir erklären?"*
- Das Kind muss erklären, und dabei lernt es selbst am meisten.
                """)

            st.divider()

            # ========== 4. TRANSFER ==========
            st.markdown("### 4. 🎯 Transfer: Das Geheimnis der Überflieger")

            with st.expander("Warum klappt's in der Klausur nicht?"):
                st.markdown("""
*"Ich hab's doch gelernt! Warum klappt's in der Klausur nicht?"*

Das ist die Frage aller Fragen. Und die Antwort ist: **TRANSFER**. Transfer bedeutet, Gelerntes in NEUEN Situationen anzuwenden. Und hier ist der Witz: Transfer passiert nicht automatisch. Dein Gehirn klebt Wissen gerne an den Kontext, in dem du es gelernt hast.

**Near Transfer vs. Far Transfer:**
- **Near Transfer:** Ähnliche Situation. Du lernst 2+3=5, dann kannst du auch 2+4=6 lösen.
- **Far Transfer:** Ganz andere Situation. Du lernst logisches Denken in Mathe – und wendest es auf ein moralisches Dilemma an.

🎬 **Die unangenehme Wahrheit:** Far Transfer ist SCHWER. Aber trainierbar!

**Wie trainiert man Transfer?**
- **"Wo noch?"-Frage:** Nach jedem Thema fragen: *"Wo könnte ich das noch anwenden?"*
- **Prinzipien benennen:** Nicht nur "wie", sondern "warum". Was ist die Regel dahinter?
- **Verschiedene Kontexte:** Dasselbe Konzept in verschiedenen Situationen üben.
- **Analogien bilden:** *"Das ist wie..."* Verbindungen zwischen Fächern finden.
                """)

            st.divider()

            # ========== 5. BIRKENBIHL ==========
            st.markdown("### 5. 🧵 Birkenbihl-Methode: Der Faden-Trick")

            with st.expander("Schreib auf, was DU denkst!"):
                st.markdown("""
*"Schreib nicht auf, was ich sage. Schreib auf, was DU denkst!"*

Vera F. Birkenbihl war eine deutsche Lernexpertin und hat etwas Radikales behauptet: Die Art, wie die Schule dir Notizen-Machen beigebracht hat, ist falsch.

**Das "Faden"-Prinzip:**

Birkenbihl sagt: Jede neue Information braucht einen "Faden" – einen Anknüpfungspunkt in deinem bestehenden Wissen. Ohne Faden geht Information *"hier rein, da raus"*. Mit Faden bleibt sie hängen.

**Beispiel:** Du hörst das Wort "Adipositas". Ohne Faden = *"Hä?"* Mit Faden (= Fettleibigkeit) = *"Aaah, ich verstehe!"* Ab jetzt fällt dir das Wort überall auf.

**📚 Praktische Anwendung:**
- Bei Vorträgen: Nicht mitschreiben, was der Redner sagt. Sondern: Was fällt mir dazu ein? Welche Erfahrung habe ich damit?
- Beim Lesen: Am Rand notieren: *"Das erinnert mich an..."* *"Das widerspricht dem, was ich über X weiß..."*
- Bei neuen Begriffen: Sofort eine Eselsbrücke zu etwas Bekanntem bauen.
                """)

            st.divider()

            # ========== 6. DAS PARADOX ==========
            st.markdown("### 6. 🔄 Das Paradox: Warum sich gutes Lernen falsch anfühlt")

            with st.expander("Das Fluency-Problem"):
                st.markdown("""
*"Ich hab so viel gelernt und fühle mich trotzdem unsicher..."*

Das ist NORMAL. Und es ist sogar ein GUTES Zeichen!

**Das Fluency-Problem:**

Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an. Das nennt man "Fluency". Dein Gehirn sagt: *"Hey, das kenn ich doch! Muss ich also wissen!"* Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

🎬 **Die Studie, die alles verändert:**

Forscher ließen Studenten auf zwei Arten lernen:
- Gruppe A: Wiederlesen (fühlte sich gut an)
- Gruppe B: Retrieval Practice (fühlte sich anstrengend an)

**Ergebnis:** Gruppe A fühlte sich 62% vorbereitet. Gruppe B nur 53% vorbereitet.
**Aber:** Gruppe B schnitt im Test **54% BESSER** ab!

**"Desirable Difficulties" (Erwünschte Schwierigkeiten):**

Der Psychologe Robert Bjork nennt das "desirable difficulties". Bestimmte Schwierigkeiten beim Lernen sind GUT, weil sie das Gehirn zwingen, härter zu arbeiten.

🎯 **Die Take-Away Message:**
- Wenn Lernen sich leicht anfühlt, lernst du wahrscheinlich nicht viel.
- Wenn Lernen sich anstrengend anfühlt, bist du auf dem richtigen Weg.

**Vertrau der Wissenschaft, nicht deinem Gefühl!**
                """)

            st.divider()

            # ========== QUICK REFERENCE ==========
            st.markdown("### ✨ Quick Reference: Alle Techniken auf einen Blick")

            st.markdown("""
| Technik | Evidenz | Quelle | Tipp für dich |
|---------|---------|--------|---------------|
| 🔄 Active Recall | 🟢 HOCH | Dunlosky 2013, Roediger 2006 | Täglich 5 Min Quiz |
| 📅 Spaced Repetition | 🟢 HOCH | Dunlosky 2013, Cepeda 2006 | Sticker-Kalender |
| 👶 Feynman-Methode | 🟢 HOCH | Dunlosky 2013 (Elaboration) | Teddy unterrichten |
| 🏰 Loci-Methode | 🟡 MITTEL | Dunlosky 2013 (Mnemonics) | Zimmer-Rundgang |
| 🗺️ Mind Mapping | 🟡 MITTEL | Farrand 2002, Nesbit 2006 | Bunte Bilder malen |
| 🍅 Pomodoro | 🟡 MITTEL | Cirillo 2006 | 10-15 Min + Pause |
| 👥 Lehren | 🟢 HOCH | Dunlosky 2013, Fiorella 2013 | Geschwister-Schule |

💡 **Zur Einordnung:**
- 🟢 HOCH = Mehrere hochwertige Studien bestätigen die Wirksamkeit
- 🟡 MITTEL = Gute Evidenz, aber weniger umfangreich erforscht oder kontextabhängig

🚀 **Jetzt bist du dran.** Pick EINE Technik. Probier sie EINE Woche aus. Und dann: Staune.
            """)

        # ==========================================
        # UNTERSTUFE CONTENT (Original MaiThink-Style)
        # ==========================================
        elif st.session_state.selected_age_group_learnstrat == "unterstufe":
            st.header("🧠 CLEVERER LERNEN")
            st.markdown("**Die Wissenschaft sagt: Du machst es falsch. Aber keine Sorge – wir fixen das jetzt.**")

            # ========== PLOT TWIST INTRO ==========
            st.markdown("### ⚡ PLOT TWIST: Mehr lernen ≠ Besser lernen")

            st.markdown("""
            Stell dir vor, du lernst 5 Stunden für eine Prüfung. Du liest alles dreimal durch, markierst die wichtigsten Stellen gelb, schreibst eine Zusammenfassung. Du fühlst dich super vorbereitet.

            Und dann? Schreibst du eine 4.

            Deine Freundin hat nur 2 Stunden gelernt. Sie schreibt eine 1.

            Ist sie einfach schlauer? **Nein.** Sie lernt nur ANDERS. Und jetzt kommt's: Die Wissenschaft weiß seit über 100 Jahren, welche Methoden funktionieren. Die Schule hat's dir nur nie erzählt.
            """)

            # ========== INHALTSVERZEICHNIS ==========
            with st.expander("📋 Was dich erwartet"):
                st.markdown("""
- Das Problem: Warum Schule dir das Falsche beibringt
- Die Wissenschaft: Was WIRKLICH funktioniert (mit Zahlen!)
- Die 7 Power-Techniken (speziell für dich angepasst)
- Transfer: Das Geheimnis der Überflieger
- Birkenbihl-Methode: Der Faden-Trick
- Das Paradox: Warum sich gutes Lernen schlecht anfühlt
                """)

            st.divider()

            # ========== 1. DAS PROBLEM ==========
            st.markdown("### 1. 🚫 Das Problem: Die Schule hat's verbockt")

            st.markdown("""
            *"Schreib das auf, dann merkst du's dir!"*

            Diesen Satz hast du wahrscheinlich tausendmal gehört. Und er ist... falsch. Zumindest so, wie die Schule ihn meint.
            """)

            with st.expander("Was die meisten Schüler machen"):
                st.markdown("""
- Text mehrmals durchlesen (*"Wird schon hängenbleiben..."*)
- Wichtiges gelb markieren (*Sieht produktiv aus!*)
- Zusammenfassung schreiben (*Dauert ewig...*)
- Am Abend vorher alles reinprügeln (*Cramming!*)

🎬 **PLOT TWIST:** Alle diese Methoden sind wissenschaftlich gesehen... meh.

Forscher von der Kent State University (Dunlosky et al., 2013) haben 10 beliebte Lerntechniken untersucht. Ergebnis: **Die Techniken, die Schüler am häufigsten nutzen, sind am wenigsten effektiv.** Autsch.

📊 **Die Wahrheit in Zahlen:**

Siehst du das Muster? Die Methoden, die sich GUT anfühlen, funktionieren oft SCHLECHT. Und die Methoden, die sich ANSTRENGEND anfühlen, funktionieren am BESTEN. Das Gehirn ist ein Troll.
                """)

            st.divider()

            # ========== 2. DIE WISSENSCHAFT ==========
            st.markdown("### 2. 🔬 Die Wissenschaft: Effektstärken erklärt")

            st.markdown("""
            *"Okay, aber woher weißt du, dass das stimmt?"*

            Gute Frage! Hier kommt **John Hattie** ins Spiel. Der Neuseeländer hat über 1.800 Meta-Studien mit mehr als 300 Millionen Schülern ausgewertet. Das ist wie... ALLE Studien zum Thema Lernen, die es gibt. Zusammengefasst.
            """)

            with st.expander("Was ist eine 'Effektstärke' (d)?"):
                st.markdown("""
Stell dir vor, du misst, wie viel Schüler in einem Jahr lernen. Das ist der Normalfall. Jetzt fragst du: Bringt Methode X mehr oder weniger als dieses eine Jahr?

- **d = 0.40** → Ein Jahr Lernfortschritt (der Durchschnitt)
- **d > 0.40** → Mehr als ein Jahr! 🎉
- **d < 0.40** → Weniger als ein Jahr 😕
- **d = 0.80** → Zwei Jahre Fortschritt in einem Jahr! 🚀

🎬 **Die Top-Effektstärken für Lernstrategien:**

| Technik | Effektstärke | Bewertung |
|---------|--------------|-----------|
| Selbsttest (Retrieval) | d = 0.58 | ⭐⭐⭐ High Utility |
| Verteiltes Lernen | d = 0.60 | ⭐⭐⭐ High Utility |
| Feynman-Methode | d = 0.75 | ⭐⭐⭐ Sehr hoch! |
| Markieren | d = 0.36 | ❌ Low Utility |
| Wiederlesen | d = 0.36 | ❌ Low Utility |
                """)

            st.divider()

            # ========== 3. DIE 7 POWER-TECHNIKEN ==========
            st.markdown("### 3. 💪 Die 7 Power-Techniken")

            st.markdown("""
            Jetzt wird's praktisch. Hier sind die 7 Techniken, die nachweislich funktionieren – speziell für dich angepasst!
            """)

            # ----- TECHNIK 1: Retrieval Practice -----
            with st.expander("⚡ **Technik 1: Retrieval Practice (Selbsttest)** – Effektstärke: d = 0.58"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn. Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er. Wiederlesen ist, als würdest du den Pfad nur anschauen. Abrufen ist, ihn tatsächlich zu gehen.

---

**📗 So geht's für dich (UNTERSTUFE):**

- **Karteikarten sind dein bester Freund!** Schreib auf die Vorderseite die Frage, auf die Rückseite die Antwort.
- **WICHTIG:** Erst versuchen zu antworten, DANN umdrehen.
- **Apps wie Anki oder Quizlet** machen das automatisch.
- **Challenge:** Kannst du die ganze Karteikarten-Box durchgehen, ohne zu spicken?
                """)

            # ----- TECHNIK 2: Spaced Repetition -----
            with st.expander("📅 **Technik 2: Spaced Repetition (Zeitversetzt wiederholen)** – Effektstärke: d = 0.60"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Dein Gehirn vergisst. Schnell. Die Vergessenskurve (Ebbinghaus, 1885 – ja, das wissen wir seit über 100 Jahren!) zeigt: Nach 24 Stunden hast du 70% vergessen. ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher. Mit jeder Wiederholung hält das Wissen länger.

💡 **Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

---

**📗 So geht's für dich (UNTERSTUFE):**

- **Lernplan erstellen!** Nicht: "Ich lerne am Wochenende vor der Arbeit." Sondern: "Ich lerne heute 30 Min, übermorgen 15 Min, in einer Woche nochmal 10 Min."
- **Apps helfen:** Anki sagt dir automatisch, wann du was wiederholen sollst. Das nennt sich Spaced Repetition Software (SRS).
                """)

            # ----- TECHNIK 3: Feynman-Methode -----
            with st.expander("👶 **Technik 3: Feynman-Methode (Erklär's einem 10-Jährigen)** – Effektstärke: d = 0.75"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Richard Feynman war Nobelpreisträger für Physik und legendär dafür, komplizierte Sachen einfach zu erklären. Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

---

**📗 So geht's für dich (UNTERSTUFE):**

- Stell dir vor, ein Grundschüler fragt dich: *"Was sind Brüche?"* oder *"Was ist Fotosynthese?"*
- **Kannst du es SO erklären, dass er es versteht? Ohne Fachbegriffe?**
- Schreib deine Erklärung auf. Dann lies sie laut vor. Klingt es wie ein Mensch redet? Wenn nicht, vereinfache!
                """)

            # ----- TECHNIK 4: Interleaving -----
            with st.expander("🔀 **Technik 4: Interleaving (Mischen statt Blocken)** – Effektstärke: d = 0.67"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B. Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C... Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist. Das trainiert dein Gehirn, Unterschiede zu erkennen.

🎬 **Fun Fact:** Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!

---

**📗 So geht's für dich (UNTERSTUFE):**

- **Erstelle gemischte Übungsblätter!** Statt 10 Bruchaufgaben, dann 10 Dezimalaufgaben → Mische sie!
- **Bei Sprachen:** Nicht erst alle Verben im Präsens, dann alle im Perfekt. Sondern: Ein Satz Präsens, ein Satz Perfekt, einer Präsens...
                """)

            # ----- TECHNIK 5: Loci-Methode -----
            with st.expander("🏰 **Technik 5: Loci-Methode (Gedächtnispalast)** – Effektstärke: d = 0.65"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Diese Methode nutzen Gedächtnis-Weltmeister! Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst. Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

---

**📗 So geht's für dich (UNTERSTUFE):**

- **Schulweg nutzen!** Von zuhause bis zum Klassenraum – jede Station = ein Merkpunkt.
- **Historische Ereignisse?** Häng sie an deinen Schulweg. Die Französische Revolution passiert am Bäcker, Napoleon steht an der Ampel...
                """)

            # ----- TECHNIK 6: Pomodoro -----
            with st.expander("🍅 **Technik 6: Pomodoro-Technik (25 + 5)** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach. Die Pomodoro-Technik nutzt das: 25 Min fokussiert arbeiten, dann 5 Min echte Pause (nicht Handy!). Nach 4 Runden: 15-30 Min längere Pause.

---

**📗 So geht's für dich (UNTERSTUFE):**

- **Klassisches Pomodoro:** 25 + 5.
- **Handy in einen anderen Raum!**
- Die Pause ist ECHTE Pause: Aufstehen, Wasser holen, Fenster öffnen, Dehnübungen.
- **NICHT:** Social Media "kurz checken".
                """)

            # ----- TECHNIK 7: Lernen durch Lehren -----
            with st.expander("👥 **Technik 7: Lernen durch Lehren** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

*"Wer lehrt, lernt doppelt."* Das ist nicht nur ein Spruch. Wenn du jemandem etwas erklärst, musst du: 1) Es selbst verstehen, 2) Es in klare Worte fassen, 3) Auf Fragen reagieren. Das ist Elaboration, Retrieval Practice und Metakognition in einem!

---

**📗 So geht's für dich (UNTERSTUFE):**

- **Lerngruppen!** Aber nicht gemeinsam schweigend lernen. Sondern: Jeder wird Experte für ein Thema und erklärt es den anderen.
- Oder: Sich gegenseitig Quizfragen stellen. **Der Erklärer lernt mehr als der Zuhörer!**
                """)

            st.divider()

            # ========== 4. TRANSFER ==========
            st.markdown("### 4. 🎯 Transfer: Das Geheimnis der Überflieger")

            with st.expander("Warum klappt's in der Klausur nicht?"):
                st.markdown("""
*"Ich hab's doch gelernt! Warum klappt's in der Klausur nicht?"*

Das ist die Frage aller Fragen. Und die Antwort ist: **TRANSFER**. Transfer bedeutet, Gelerntes in NEUEN Situationen anzuwenden. Und hier ist der Witz: Transfer passiert nicht automatisch. Dein Gehirn klebt Wissen gerne an den Kontext, in dem du es gelernt hast.

**Near Transfer vs. Far Transfer:**
- **Near Transfer:** Ähnliche Situation. Du lernst 2+3=5, dann kannst du auch 2+4=6 lösen.
- **Far Transfer:** Ganz andere Situation. Du lernst logisches Denken in Mathe – und wendest es auf ein moralisches Dilemma an.

🎬 **Die unangenehme Wahrheit:** Far Transfer ist SCHWER. Aber trainierbar!

**Wie trainiert man Transfer?**
- **"Wo noch?"-Frage:** Nach jedem Thema fragen: *"Wo könnte ich das noch anwenden?"*
- **Prinzipien benennen:** Nicht nur "wie", sondern "warum". Was ist die Regel dahinter?
- **Verschiedene Kontexte:** Dasselbe Konzept in verschiedenen Situationen üben.
- **Analogien bilden:** *"Das ist wie..."* Verbindungen zwischen Fächern finden.
                """)

            st.divider()

            # ========== 5. BIRKENBIHL ==========
            st.markdown("### 5. 🧵 Birkenbihl-Methode: Der Faden-Trick")

            with st.expander("Schreib auf, was DU denkst!"):
                st.markdown("""
*"Schreib nicht auf, was ich sage. Schreib auf, was DU denkst!"*

Vera F. Birkenbihl war eine deutsche Lernexpertin und hat etwas Radikales behauptet: Die Art, wie die Schule dir Notizen-Machen beigebracht hat, ist falsch.

**Das "Faden"-Prinzip:**

Birkenbihl sagt: Jede neue Information braucht einen "Faden" – einen Anknüpfungspunkt in deinem bestehenden Wissen. Ohne Faden geht Information *"hier rein, da raus"*. Mit Faden bleibt sie hängen.

**Beispiel:** Du hörst das Wort "Adipositas". Ohne Faden = *"Hä?"* Mit Faden (= Fettleibigkeit) = *"Aaah, ich verstehe!"* Ab jetzt fällt dir das Wort überall auf.

**📚 Praktische Anwendung:**
- Bei Vorträgen: Nicht mitschreiben, was der Redner sagt. Sondern: Was fällt mir dazu ein? Welche Erfahrung habe ich damit?
- Beim Lesen: Am Rand notieren: *"Das erinnert mich an..."* *"Das widerspricht dem, was ich über X weiß..."*
- Bei neuen Begriffen: Sofort eine Eselsbrücke zu etwas Bekanntem bauen.
                """)

            st.divider()

            # ========== 6. DAS PARADOX ==========
            st.markdown("### 6. 🔄 Das Paradox: Warum sich gutes Lernen falsch anfühlt")

            with st.expander("Das Fluency-Problem"):
                st.markdown("""
*"Ich hab so viel gelernt und fühle mich trotzdem unsicher..."*

Das ist NORMAL. Und es ist sogar ein GUTES Zeichen!

**Das Fluency-Problem:**

Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an. Das nennt man "Fluency". Dein Gehirn sagt: *"Hey, das kenn ich doch! Muss ich also wissen!"* Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

🎬 **Die Studie, die alles verändert:**

Forscher ließen Studenten auf zwei Arten lernen:
- Gruppe A: Wiederlesen (fühlte sich gut an)
- Gruppe B: Retrieval Practice (fühlte sich anstrengend an)

**Ergebnis:** Gruppe A fühlte sich 62% vorbereitet. Gruppe B nur 53% vorbereitet.
**Aber:** Gruppe B schnitt im Test **54% BESSER** ab!

**"Desirable Difficulties" (Erwünschte Schwierigkeiten):**

Der Psychologe Robert Bjork nennt das "desirable difficulties". Bestimmte Schwierigkeiten beim Lernen sind GUT, weil sie das Gehirn zwingen, härter zu arbeiten.

🎯 **Die Take-Away Message:**
- Wenn Lernen sich leicht anfühlt, lernst du wahrscheinlich nicht viel.
- Wenn Lernen sich anstrengend anfühlt, bist du auf dem richtigen Weg.

**Vertrau der Wissenschaft, nicht deinem Gefühl!**
                """)

            st.divider()

            # ========== QUICK REFERENCE ==========
            st.markdown("### ✨ Quick Reference: Alle Techniken auf einen Blick")

            st.markdown("""
| Technik | Evidenz | Quelle | Tipp für dich |
|---------|---------|--------|---------------|
| 🔄 Active Recall | 🟢 HOCH | Dunlosky 2013, Roediger 2006 | Karteikarten + Quiz |
| 📅 Spaced Repetition | 🟢 HOCH | Dunlosky 2013, Cepeda 2006 | Anki/Quizlet nutzen |
| 👶 Feynman-Methode | 🟢 HOCH | Dunlosky 2013 (Elaboration) | Grundschüler erklären |
| 🏰 Loci-Methode | 🟡 MITTEL | Dunlosky 2013 (Mnemonics) | Schulweg nutzen |
| 🗺️ Mind Mapping | 🟡 MITTEL | Farrand 2002, Nesbit 2006 | Themen-Mindmap |
| 🍅 Pomodoro | 🟡 MITTEL | Cirillo 2006 | 25 + 5 |
| 👥 Lehren | 🟢 HOCH | Dunlosky 2013, Fiorella 2013 | Lerngruppen |

💡 **Zur Einordnung:**
- 🟢 HOCH = Mehrere hochwertige Studien bestätigen die Wirksamkeit
- 🟡 MITTEL = Gute Evidenz, aber weniger umfangreich erforscht oder kontextabhängig

🚀 **Jetzt bist du dran.** Pick EINE Technik. Probier sie EINE Woche aus. Und dann: Staune.
            """)

        # ==========================================
        # MITTELSTUFE CONTENT (Original MaiThink-Style)
        # ==========================================
        elif st.session_state.selected_age_group_learnstrat == "mittelstufe":
            st.header("🧠 CLEVERER LERNEN")
            st.markdown("**Die Wissenschaft sagt: Du machst es falsch. Aber keine Sorge – wir fixen das jetzt.**")

            # ========== PLOT TWIST INTRO ==========
            st.markdown("### ⚡ PLOT TWIST: Mehr lernen ≠ Besser lernen")

            st.markdown("""
            Stell dir vor, du lernst 5 Stunden für eine Prüfung. Du liest alles dreimal durch, markierst die wichtigsten Stellen gelb, schreibst eine Zusammenfassung. Du fühlst dich super vorbereitet.

            Und dann? Schreibst du eine 4.

            Deine Freundin hat nur 2 Stunden gelernt. Sie schreibt eine 1.

            Ist sie einfach schlauer? **Nein.** Sie lernt nur ANDERS. Und jetzt kommt's: Die Wissenschaft weiß seit über 100 Jahren, welche Methoden funktionieren. Die Schule hat's dir nur nie erzählt.
            """)

            # ========== INHALTSVERZEICHNIS ==========
            with st.expander("📋 Was dich erwartet"):
                st.markdown("""
- Das Problem: Warum Schule dir das Falsche beibringt
- Die Wissenschaft: Was WIRKLICH funktioniert (mit Zahlen!)
- Die 7 Power-Techniken (speziell für dich angepasst)
- Transfer: Das Geheimnis der Überflieger
- Birkenbihl-Methode: Der Faden-Trick
- Das Paradox: Warum sich gutes Lernen schlecht anfühlt
                """)

            st.divider()

            # ========== 1. DAS PROBLEM ==========
            st.markdown("### 1. 🚫 Das Problem: Die Schule hat's verbockt")

            st.markdown("""
            *"Schreib das auf, dann merkst du's dir!"*

            Diesen Satz hast du wahrscheinlich tausendmal gehört. Und er ist... falsch. Zumindest so, wie die Schule ihn meint.
            """)

            with st.expander("Was die meisten Schüler machen"):
                st.markdown("""
- Text mehrmals durchlesen (*"Wird schon hängenbleiben..."*)
- Wichtiges gelb markieren (*Sieht produktiv aus!*)
- Zusammenfassung schreiben (*Dauert ewig...*)
- Am Abend vorher alles reinprügeln (*Cramming!*)

🎬 **PLOT TWIST:** Alle diese Methoden sind wissenschaftlich gesehen... meh.

Forscher von der Kent State University (Dunlosky et al., 2013) haben 10 beliebte Lerntechniken untersucht. Ergebnis: **Die Techniken, die Schüler am häufigsten nutzen, sind am wenigsten effektiv.** Autsch.

📊 **Die Wahrheit in Zahlen:**

Siehst du das Muster? Die Methoden, die sich GUT anfühlen, funktionieren oft SCHLECHT. Und die Methoden, die sich ANSTRENGEND anfühlen, funktionieren am BESTEN. Das Gehirn ist ein Troll.
                """)

            st.divider()

            # ========== 2. DIE WISSENSCHAFT ==========
            st.markdown("### 2. 🔬 Die Wissenschaft: Effektstärken erklärt")

            st.markdown("""
            *"Okay, aber woher weißt du, dass das stimmt?"*

            Gute Frage! Hier kommt **John Hattie** ins Spiel. Der Neuseeländer hat über 1.800 Meta-Studien mit mehr als 300 Millionen Schülern ausgewertet. Das ist wie... ALLE Studien zum Thema Lernen, die es gibt. Zusammengefasst.
            """)

            with st.expander("Was ist eine 'Effektstärke' (d)?"):
                st.markdown("""
Stell dir vor, du misst, wie viel Schüler in einem Jahr lernen. Das ist der Normalfall. Jetzt fragst du: Bringt Methode X mehr oder weniger als dieses eine Jahr?

- **d = 0.40** → Ein Jahr Lernfortschritt (der Durchschnitt)
- **d > 0.40** → Mehr als ein Jahr! 🎉
- **d < 0.40** → Weniger als ein Jahr 😕
- **d = 0.80** → Zwei Jahre Fortschritt in einem Jahr! 🚀

🎬 **Die Top-Effektstärken für Lernstrategien:**

| Technik | Effektstärke | Bewertung |
|---------|--------------|-----------|
| Selbsttest (Retrieval) | d = 0.58 | ⭐⭐⭐ High Utility |
| Verteiltes Lernen | d = 0.60 | ⭐⭐⭐ High Utility |
| Feynman-Methode | d = 0.75 | ⭐⭐⭐ Sehr hoch! |
| Markieren | d = 0.36 | ❌ Low Utility |
| Wiederlesen | d = 0.36 | ❌ Low Utility |
                """)

            st.divider()

            # ========== 3. DIE 7 POWER-TECHNIKEN ==========
            st.markdown("### 3. 💪 Die 7 Power-Techniken")

            st.markdown("""
            Jetzt wird's praktisch. Hier sind die 7 Techniken, die nachweislich funktionieren – speziell für dich angepasst!
            """)

            # ----- TECHNIK 1: Retrieval Practice -----
            with st.expander("⚡ **Technik 1: Retrieval Practice (Selbsttest)** – Effektstärke: d = 0.58"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn. Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er. Wiederlesen ist, als würdest du den Pfad nur anschauen. Abrufen ist, ihn tatsächlich zu gehen.

---

**📘 So geht's für dich (MITTELSTUFE):**

- **Blatt-Papier-Methode:** Lies ein Kapitel, leg das Buch weg, nimm ein leeres Blatt und schreib ALLES auf, was du noch weißt. Dann vergleichen. Die Lücken? Das sind genau die Stellen, die du nochmal anschauen musst.
- **Pro-Tipp:** Bevor du ein neues Thema anfängst, teste dich kurz zum alten Thema. Das nennt man "interleaved retrieval".
                """)

            # ----- TECHNIK 2: Spaced Repetition -----
            with st.expander("📅 **Technik 2: Spaced Repetition (Zeitversetzt wiederholen)** – Effektstärke: d = 0.60"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Dein Gehirn vergisst. Schnell. Die Vergessenskurve (Ebbinghaus, 1885 – ja, das wissen wir seit über 100 Jahren!) zeigt: Nach 24 Stunden hast du 70% vergessen. ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher. Mit jeder Wiederholung hält das Wissen länger.

💡 **Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

---

**📘 So geht's für dich (MITTELSTUFE):**

- **Baue "Mini-Reviews" in deinen Alltag:** Jeden Tag 10 Minuten alten Stoff durchgehen. Nutze Wartezeiten: Bus, Pause, vor dem Einschlafen.
- **Pro-Tipp:** Erstelle einen "Spiral-Lernplan" – jede Woche kommt ein altes Thema zurück, während du ein neues lernst.
                """)

            # ----- TECHNIK 3: Feynman-Methode -----
            with st.expander("👶 **Technik 3: Feynman-Methode (Erklär's einem 10-Jährigen)** – Effektstärke: d = 0.75"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Richard Feynman war Nobelpreisträger für Physik und legendär dafür, komplizierte Sachen einfach zu erklären. Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

---

**📘 So geht's für dich (MITTELSTUFE):**

**Der 4-Schritte-Prozess:**
1. Wähle ein Konzept.
2. Erkläre es schriftlich in einfachen Worten.
3. Identifiziere Lücken – wo stockst du?
4. Zurück zum Material, dann nochmal erklären.

**Pro-Tipp:** Nimm dich dabei auf! Höre dir die Aufnahme an. Wo klingst du unsicher?
                """)

            # ----- TECHNIK 4: Interleaving -----
            with st.expander("🔀 **Technik 4: Interleaving (Mischen statt Blocken)** – Effektstärke: d = 0.67"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B. Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C... Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist. Das trainiert dein Gehirn, Unterschiede zu erkennen.

🎬 **Fun Fact:** Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!

---

**📘 So geht's für dich (MITTELSTUFE):**

- **Hausaufgaben mischen!** Mach nicht erst alle Mathe-Hausaufgaben, dann alle Deutsch-Hausaufgaben. Wechsle: 15 Min Mathe, 15 Min Deutsch, 15 Min Mathe...
- Ja, das fühlt sich weniger "effizient" an. Aber dein Gehirn lernt so, zwischen verschiedenen Denkmodi zu wechseln.
                """)

            # ----- TECHNIK 5: Loci-Methode -----
            with st.expander("🏰 **Technik 5: Loci-Methode (Gedächtnispalast)** – Effektstärke: d = 0.65"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Diese Methode nutzen Gedächtnis-Weltmeister! Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst. Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

---

**📘 So geht's für dich (MITTELSTUFE):**

- **Bau mehrere "Paläste"!** Einen fürs Fach A, einen fürs Fach B. Je mehr Details du dir vorstellst (Farben, Geräusche, Gerüche), desto besser.
- **Pro-Tipp:** Kombiniere mit Interleaving – geh mal rückwärts durch deinen Palast!
                """)

            # ----- TECHNIK 6: Pomodoro -----
            with st.expander("🍅 **Technik 6: Pomodoro-Technik (25 + 5)** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach. Die Pomodoro-Technik nutzt das: 25 Min fokussiert arbeiten, dann 5 Min echte Pause (nicht Handy!). Nach 4 Runden: 15-30 Min längere Pause.

---

**📘 So geht's für dich (MITTELSTUFE):**

- **Variiere:** Schwieriges = kürzere Pomodoros (20 Min). Leichteres = längere (30 Min).
- **Führe ein Pomodoro-Protokoll:** Wie viele schaffst du pro Lernsession? Versuche, dich selbst zu übertrumpfen.
                """)

            # ----- TECHNIK 7: Lernen durch Lehren -----
            with st.expander("👥 **Technik 7: Lernen durch Lehren** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

*"Wer lehrt, lernt doppelt."* Das ist nicht nur ein Spruch. Wenn du jemandem etwas erklärst, musst du: 1) Es selbst verstehen, 2) Es in klare Worte fassen, 3) Auf Fragen reagieren. Das ist Elaboration, Retrieval Practice und Metakognition in einem!

---

**📘 So geht's für dich (MITTELSTUFE):**

- **"Erklärvideo"-Methode:** Stell dir vor, du machst ein YouTube-Video. Wie würdest du das Thema erklären? Schreib ein Skript. Sprich es laut. Merkst du, wo du unsicher bist? Genau da musst du nochmal nachlesen.
                """)

            st.divider()

            # ========== 4. TRANSFER ==========
            st.markdown("### 4. 🎯 Transfer: Das Geheimnis der Überflieger")

            with st.expander("Warum klappt's in der Klausur nicht?"):
                st.markdown("""
*"Ich hab's doch gelernt! Warum klappt's in der Klausur nicht?"*

Das ist die Frage aller Fragen. Und die Antwort ist: **TRANSFER**. Transfer bedeutet, Gelerntes in NEUEN Situationen anzuwenden. Und hier ist der Witz: Transfer passiert nicht automatisch. Dein Gehirn klebt Wissen gerne an den Kontext, in dem du es gelernt hast.

**Near Transfer vs. Far Transfer:**
- **Near Transfer:** Ähnliche Situation. Du lernst 2+3=5, dann kannst du auch 2+4=6 lösen.
- **Far Transfer:** Ganz andere Situation. Du lernst logisches Denken in Mathe – und wendest es auf ein moralisches Dilemma an.

🎬 **Die unangenehme Wahrheit:** Far Transfer ist SCHWER. Aber trainierbar!

**Wie trainiert man Transfer?**
- **"Wo noch?"-Frage:** Nach jedem Thema fragen: *"Wo könnte ich das noch anwenden?"*
- **Prinzipien benennen:** Nicht nur "wie", sondern "warum". Was ist die Regel dahinter?
- **Verschiedene Kontexte:** Dasselbe Konzept in verschiedenen Situationen üben.
- **Analogien bilden:** *"Das ist wie..."* Verbindungen zwischen Fächern finden.
                """)

            st.divider()

            # ========== 5. BIRKENBIHL ==========
            st.markdown("### 5. 🧵 Birkenbihl-Methode: Der Faden-Trick")

            with st.expander("Schreib auf, was DU denkst!"):
                st.markdown("""
*"Schreib nicht auf, was ich sage. Schreib auf, was DU denkst!"*

Vera F. Birkenbihl war eine deutsche Lernexpertin und hat etwas Radikales behauptet: Die Art, wie die Schule dir Notizen-Machen beigebracht hat, ist falsch.

**Das "Faden"-Prinzip:**

Birkenbihl sagt: Jede neue Information braucht einen "Faden" – einen Anknüpfungspunkt in deinem bestehenden Wissen. Ohne Faden geht Information *"hier rein, da raus"*. Mit Faden bleibt sie hängen.

**Beispiel:** Du hörst das Wort "Adipositas". Ohne Faden = *"Hä?"* Mit Faden (= Fettleibigkeit) = *"Aaah, ich verstehe!"* Ab jetzt fällt dir das Wort überall auf.

**📚 Praktische Anwendung:**
- Bei Vorträgen: Nicht mitschreiben, was der Redner sagt. Sondern: Was fällt mir dazu ein? Welche Erfahrung habe ich damit?
- Beim Lesen: Am Rand notieren: *"Das erinnert mich an..."* *"Das widerspricht dem, was ich über X weiß..."*
- Bei neuen Begriffen: Sofort eine Eselsbrücke zu etwas Bekanntem bauen.
                """)

            st.divider()

            # ========== 6. DAS PARADOX ==========
            st.markdown("### 6. 🔄 Das Paradox: Warum sich gutes Lernen falsch anfühlt")

            with st.expander("Das Fluency-Problem"):
                st.markdown("""
*"Ich hab so viel gelernt und fühle mich trotzdem unsicher..."*

Das ist NORMAL. Und es ist sogar ein GUTES Zeichen!

**Das Fluency-Problem:**

Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an. Das nennt man "Fluency". Dein Gehirn sagt: *"Hey, das kenn ich doch! Muss ich also wissen!"* Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

🎬 **Die Studie, die alles verändert:**

Forscher ließen Studenten auf zwei Arten lernen:
- Gruppe A: Wiederlesen (fühlte sich gut an)
- Gruppe B: Retrieval Practice (fühlte sich anstrengend an)

**Ergebnis:** Gruppe A fühlte sich 62% vorbereitet. Gruppe B nur 53% vorbereitet.
**Aber:** Gruppe B schnitt im Test **54% BESSER** ab!

**"Desirable Difficulties" (Erwünschte Schwierigkeiten):**

Der Psychologe Robert Bjork nennt das "desirable difficulties". Bestimmte Schwierigkeiten beim Lernen sind GUT, weil sie das Gehirn zwingen, härter zu arbeiten.

🎯 **Die Take-Away Message:**
- Wenn Lernen sich leicht anfühlt, lernst du wahrscheinlich nicht viel.
- Wenn Lernen sich anstrengend anfühlt, bist du auf dem richtigen Weg.

**Vertrau der Wissenschaft, nicht deinem Gefühl!**
                """)

            st.divider()

            # ========== QUICK REFERENCE ==========
            st.markdown("### ✨ Quick Reference: Alle Techniken auf einen Blick")

            st.markdown("""
| Technik | Evidenz | Quelle | Tipp für dich |
|---------|---------|--------|---------------|
| 🔄 Active Recall | 🟢 HOCH | Dunlosky 2013, Roediger 2006 | Blatt-Papier-Methode |
| 📅 Spaced Repetition | 🟢 HOCH | Dunlosky 2013, Cepeda 2006 | Spiral-Lernplan |
| 👶 Feynman-Methode | 🟢 HOCH | Dunlosky 2013 (Elaboration) | 4-Schritte-Prozess |
| 🏰 Loci-Methode | 🟡 MITTEL | Dunlosky 2013 (Mnemonics) | Mehrere Paläste |
| 🗺️ Mind Mapping | 🟡 MITTEL | Farrand 2002, Nesbit 2006 | Struktur-Mindmap |
| 🍅 Pomodoro | 🟡 MITTEL | Cirillo 2006 | Protokoll führen |
| 👥 Lehren | 🟢 HOCH | Dunlosky 2013, Fiorella 2013 | Erklärvideo-Methode |

💡 **Zur Einordnung:**
- 🟢 HOCH = Mehrere hochwertige Studien bestätigen die Wirksamkeit
- 🟡 MITTEL = Gute Evidenz, aber weniger umfangreich erforscht oder kontextabhängig

🚀 **Jetzt bist du dran.** Pick EINE Technik. Probier sie EINE Woche aus. Und dann: Staune.
            """)

        # ==========================================
        # OBERSTUFE CONTENT (Original MaiThink-Style)
        # ==========================================
        elif st.session_state.selected_age_group_learnstrat == "oberstufe":
            st.header("🧠 CLEVERER LERNEN")
            st.markdown("**Die Wissenschaft sagt: Du machst es falsch. Aber keine Sorge – wir fixen das jetzt.**")

            # ========== PLOT TWIST INTRO ==========
            st.markdown("### ⚡ PLOT TWIST: Mehr lernen ≠ Besser lernen")

            st.markdown("""
            Stell dir vor, du lernst 5 Stunden für eine Prüfung. Du liest alles dreimal durch, markierst die wichtigsten Stellen gelb, schreibst eine Zusammenfassung. Du fühlst dich super vorbereitet.

            Und dann? Schreibst du eine 4.

            Deine Freundin hat nur 2 Stunden gelernt. Sie schreibt eine 1.

            Ist sie einfach schlauer? **Nein.** Sie lernt nur ANDERS. Und jetzt kommt's: Die Wissenschaft weiß seit über 100 Jahren, welche Methoden funktionieren. Die Schule hat's dir nur nie erzählt.
            """)

            # ========== INHALTSVERZEICHNIS ==========
            with st.expander("📋 Was dich erwartet"):
                st.markdown("""
- Das Problem: Warum Schule dir das Falsche beibringt
- Die Wissenschaft: Was WIRKLICH funktioniert (mit Zahlen!)
- Die 7 Power-Techniken (speziell für dich angepasst)
- Transfer: Das Geheimnis der Überflieger
- Birkenbihl-Methode: Der Faden-Trick
- Das Paradox: Warum sich gutes Lernen schlecht anfühlt
                """)

            st.divider()

            # ========== 1. DAS PROBLEM ==========
            st.markdown("### 1. 🚫 Das Problem: Die Schule hat's verbockt")

            st.markdown("""
            *"Schreib das auf, dann merkst du's dir!"*

            Diesen Satz hast du wahrscheinlich tausendmal gehört. Und er ist... falsch. Zumindest so, wie die Schule ihn meint.
            """)

            with st.expander("Was die meisten Schüler machen"):
                st.markdown("""
- Text mehrmals durchlesen (*"Wird schon hängenbleiben..."*)
- Wichtiges gelb markieren (*Sieht produktiv aus!*)
- Zusammenfassung schreiben (*Dauert ewig...*)
- Am Abend vorher alles reinprügeln (*Cramming!*)

🎬 **PLOT TWIST:** Alle diese Methoden sind wissenschaftlich gesehen... meh.

Forscher von der Kent State University (Dunlosky et al., 2013) haben 10 beliebte Lerntechniken untersucht. Ergebnis: **Die Techniken, die Schüler am häufigsten nutzen, sind am wenigsten effektiv.** Autsch.

📊 **Die Wahrheit in Zahlen:**

Siehst du das Muster? Die Methoden, die sich GUT anfühlen, funktionieren oft SCHLECHT. Und die Methoden, die sich ANSTRENGEND anfühlen, funktionieren am BESTEN. Das Gehirn ist ein Troll.
                """)

            st.divider()

            # ========== 2. DIE WISSENSCHAFT ==========
            st.markdown("### 2. 🔬 Die Wissenschaft: Effektstärken erklärt")

            st.markdown("""
            *"Okay, aber woher weißt du, dass das stimmt?"*

            Gute Frage! Hier kommt **John Hattie** ins Spiel. Der Neuseeländer hat über 1.800 Meta-Studien mit mehr als 300 Millionen Schülern ausgewertet. Das ist wie... ALLE Studien zum Thema Lernen, die es gibt. Zusammengefasst.
            """)

            with st.expander("Was ist eine 'Effektstärke' (d)?"):
                st.markdown("""
Stell dir vor, du misst, wie viel Schüler in einem Jahr lernen. Das ist der Normalfall. Jetzt fragst du: Bringt Methode X mehr oder weniger als dieses eine Jahr?

- **d = 0.40** → Ein Jahr Lernfortschritt (der Durchschnitt)
- **d > 0.40** → Mehr als ein Jahr! 🎉
- **d < 0.40** → Weniger als ein Jahr 😕
- **d = 0.80** → Zwei Jahre Fortschritt in einem Jahr! 🚀

🎬 **Die Top-Effektstärken für Lernstrategien:**

| Technik | Effektstärke | Bewertung |
|---------|--------------|-----------|
| Selbsttest (Retrieval) | d = 0.58 | ⭐⭐⭐ High Utility |
| Verteiltes Lernen | d = 0.60 | ⭐⭐⭐ High Utility |
| Feynman-Methode | d = 0.75 | ⭐⭐⭐ Sehr hoch! |
| Markieren | d = 0.36 | ❌ Low Utility |
| Wiederlesen | d = 0.36 | ❌ Low Utility |
                """)

            st.divider()

            # ========== 3. DIE 7 POWER-TECHNIKEN ==========
            st.markdown("### 3. 💪 Die 7 Power-Techniken")

            st.markdown("""
            Jetzt wird's praktisch. Hier sind die 7 Techniken, die nachweislich funktionieren – speziell für dich angepasst!
            """)

            # ----- TECHNIK 1: Retrieval Practice -----
            with st.expander("⚡ **Technik 1: Retrieval Practice (Selbsttest)** – Effektstärke: d = 0.58"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Jedes Mal, wenn du etwas aus deinem Gedächtnis ABRUFST (statt es nur wieder zu lesen), verstärkst du die Verbindung im Gehirn. Das ist wie ein Trampelpfad: Je öfter du ihn gehst, desto breiter wird er. Wiederlesen ist, als würdest du den Pfad nur anschauen. Abrufen ist, ihn tatsächlich zu gehen.

---

**🎓 So geht's für dich (OBERSTUFE):**

- **Erstelle eigene Prüfungsfragen!** Wenn du ein Thema durchgearbeitet hast, überleg: "Was würde der Lehrer mich fragen?" Dann beantworte diese Fragen, ohne ins Material zu schauen.
- **Noch besser:** Tausch Fragen mit Mitschülern aus. Was jemand anderes wichtig findet, hast du vielleicht übersehen.
                """)

            # ----- TECHNIK 2: Spaced Repetition -----
            with st.expander("📅 **Technik 2: Spaced Repetition (Zeitversetzt wiederholen)** – Effektstärke: d = 0.60"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Dein Gehirn vergisst. Schnell. Die Vergessenskurve (Ebbinghaus, 1885 – ja, das wissen wir seit über 100 Jahren!) zeigt: Nach 24 Stunden hast du 70% vergessen. ABER: Wenn du wiederholst, BEVOR du vergessen hast, wird die Kurve flacher. Mit jeder Wiederholung hält das Wissen länger.

💡 **Die goldene Regel:** 1 Tag → 3 Tage → 1 Woche → 2 Wochen → 1 Monat

---

**🎓 So geht's für dich (OBERSTUFE):**

- **Erstelle einen Jahres-Lernplan!** Für's Abi: Fang früh an, verteile den Stoff über Monate.
- **Kombiniere Spaced Repetition mit Retrieval Practice.** Beispiel: Jeden Sonntag 30 Min "Was weiß ich noch von letzter Woche?" + 30 Min "Was weiß ich noch von letztem Monat?"
                """)

            # ----- TECHNIK 3: Feynman-Methode -----
            with st.expander("👶 **Technik 3: Feynman-Methode (Erklär's einem 10-Jährigen)** – Effektstärke: d = 0.75"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Richard Feynman war Nobelpreisträger für Physik und legendär dafür, komplizierte Sachen einfach zu erklären. Seine Methode: **Wenn du etwas nicht einfach erklären kannst, hast du es nicht verstanden.**

> *"Was ich nicht erschaffen kann, verstehe ich nicht."* – Richard Feynman

---

**🎓 So geht's für dich (OBERSTUFE):**

- **Nächstes Level: Analogien!** Erkläre Quantenphysik mit einer Fußball-Analogie. Erkläre die Französische Revolution mit einem Beispiel aus der Schule. Je verrückter die Analogie, desto besser bleibt's hängen.
- **Ultramodus:** Erstelle ein YouTube-Erklärvideo (auch wenn du's nicht hochlädst). Die Vorbereitung zwingt dich, ALLES zu verstehen.
                """)

            # ----- TECHNIK 4: Interleaving -----
            with st.expander("🔀 **Technik 4: Interleaving (Mischen statt Blocken)** – Effektstärke: d = 0.67"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Die meisten lernen "geblockt": Erst 20 Mathe-Aufgaben zum Thema A, dann 20 zum Thema B. Fühlt sich effektiv an. **IST ES ABER NICHT.**

Interleaving heißt: Aufgaben mischen! A, B, C, A, B, C... Warum? Weil du bei jeder Aufgabe erst erkennen musst, WELCHES Problem das überhaupt ist. Das trainiert dein Gehirn, Unterschiede zu erkennen.

🎬 **Fun Fact:** Physik-Studenten, die mit Interleaving lernten, schnitten 125% besser ab – obwohl sie sich schlechter fühlten!

---

**🎓 So geht's für dich (OBERSTUFE):**

- **"Problem First":** Bei jeder Übungsaufgabe musst du ZUERST identifizieren, welches Konzept überhaupt gefragt ist, bevor du anfängst. Das ist genau das, was in Klausuren passiert – und das musst du trainieren.
- **Pro-Tipp:** Erstelle "alte Klausuren"-Simulationen mit gemischten Themen aus dem ganzen Jahr.
                """)

            # ----- TECHNIK 5: Loci-Methode -----
            with st.expander("🏰 **Technik 5: Loci-Methode (Gedächtnispalast)** – Effektstärke: d = 0.65"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Diese Methode nutzen Gedächtnis-Weltmeister! Funktioniert so: Du "gehst" im Kopf durch einen bekannten Ort (dein Zimmer, Schulweg) und "platzierst" an jedem Punkt einen Begriff, den du dir merken willst. Warum funktioniert das? Das Gehirn ist super darin, sich Orte zu merken – viel besser als abstrakte Listen.

---

**🎓 So geht's für dich (OBERSTUFE):**

- **Für komplexe Systeme (Biologie, Geschichte):** Bau einen "Themenpark" im Kopf. Jede Zone ist ein Unterthema.
- **Die Zelle? Ein Vergnügungspark.** Der Zellkern ist das Schloss, die Mitochondrien sind die Stromgeneratoren, die Ribosomen die Imbissbuden (sie "produzieren" etwas)...
                """)

            # ----- TECHNIK 6: Pomodoro -----
            with st.expander("🍅 **Technik 6: Pomodoro-Technik (25 + 5)** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

Das Gehirn kann sich nicht ewig konzentrieren. Nach etwa 25 Minuten lässt die Aufmerksamkeit nach. Die Pomodoro-Technik nutzt das: 25 Min fokussiert arbeiten, dann 5 Min echte Pause (nicht Handy!). Nach 4 Runden: 15-30 Min längere Pause.

---

**🎓 So geht's für dich (OBERSTUFE):**

- **Kombiniere Pomodoro mit anderen Techniken!** Pomodoro 1: Retrieval Practice. Pomodoro 2: Feynman-Methode. Pomodoro 3: Neues Material. Pomodoro 4: Interleaving-Übungen.
- **Apps wie Forest** machen's zum Spiel – und spenden echte Bäume!
                """)

            # ----- TECHNIK 7: Lernen durch Lehren -----
            with st.expander("👥 **Technik 7: Lernen durch Lehren** – Effektstärke: d = 0.53"):
                st.markdown("""
**🧪 Die Wissenschaft dahinter:**

*"Wer lehrt, lernt doppelt."* Das ist nicht nur ein Spruch. Wenn du jemandem etwas erklärst, musst du: 1) Es selbst verstehen, 2) Es in klare Worte fassen, 3) Auf Fragen reagieren. Das ist Elaboration, Retrieval Practice und Metakognition in einem!

---

**🎓 So geht's für dich (OBERSTUFE):**

- **Nachhilfe geben!** Ernsthaft: Den Stoff jüngeren Schülern erklären ist die beste Wiederholung.
- Oder: **Debattier-Format.** Nimm eine Position ein und verteidige sie. Dann wechsle die Seite und argumentiere dagegen. Das zwingt dich, ALLE Aspekte zu verstehen.
                """)

            st.divider()

            # ========== 4. TRANSFER ==========
            st.markdown("### 4. 🎯 Transfer: Das Geheimnis der Überflieger")

            with st.expander("Warum klappt's in der Klausur nicht?"):
                st.markdown("""
*"Ich hab's doch gelernt! Warum klappt's in der Klausur nicht?"*

Das ist die Frage aller Fragen. Und die Antwort ist: **TRANSFER**. Transfer bedeutet, Gelerntes in NEUEN Situationen anzuwenden. Und hier ist der Witz: Transfer passiert nicht automatisch. Dein Gehirn klebt Wissen gerne an den Kontext, in dem du es gelernt hast.

**Near Transfer vs. Far Transfer:**
- **Near Transfer:** Ähnliche Situation. Du lernst 2+3=5, dann kannst du auch 2+4=6 lösen.
- **Far Transfer:** Ganz andere Situation. Du lernst logisches Denken in Mathe – und wendest es auf ein moralisches Dilemma an.

🎬 **Die unangenehme Wahrheit:** Far Transfer ist SCHWER. Aber trainierbar!

**Wie trainiert man Transfer?**
- **"Wo noch?"-Frage:** Nach jedem Thema fragen: *"Wo könnte ich das noch anwenden?"*
- **Prinzipien benennen:** Nicht nur "wie", sondern "warum". Was ist die Regel dahinter?
- **Verschiedene Kontexte:** Dasselbe Konzept in verschiedenen Situationen üben.
- **Analogien bilden:** *"Das ist wie..."* Verbindungen zwischen Fächern finden.
                """)

            st.divider()

            # ========== 5. BIRKENBIHL ==========
            st.markdown("### 5. 🧵 Birkenbihl-Methode: Der Faden-Trick")

            with st.expander("Schreib auf, was DU denkst!"):
                st.markdown("""
*"Schreib nicht auf, was ich sage. Schreib auf, was DU denkst!"*

Vera F. Birkenbihl war eine deutsche Lernexpertin und hat etwas Radikales behauptet: Die Art, wie die Schule dir Notizen-Machen beigebracht hat, ist falsch.

**Das "Faden"-Prinzip:**

Birkenbihl sagt: Jede neue Information braucht einen "Faden" – einen Anknüpfungspunkt in deinem bestehenden Wissen. Ohne Faden geht Information *"hier rein, da raus"*. Mit Faden bleibt sie hängen.

**Beispiel:** Du hörst das Wort "Adipositas". Ohne Faden = *"Hä?"* Mit Faden (= Fettleibigkeit) = *"Aaah, ich verstehe!"* Ab jetzt fällt dir das Wort überall auf.

**📚 Praktische Anwendung:**
- Bei Vorträgen: Nicht mitschreiben, was der Redner sagt. Sondern: Was fällt mir dazu ein? Welche Erfahrung habe ich damit?
- Beim Lesen: Am Rand notieren: *"Das erinnert mich an..."* *"Das widerspricht dem, was ich über X weiß..."*
- Bei neuen Begriffen: Sofort eine Eselsbrücke zu etwas Bekanntem bauen.
                """)

            st.divider()

            # ========== 6. DAS PARADOX ==========
            st.markdown("### 6. 🔄 Das Paradox: Warum sich gutes Lernen falsch anfühlt")

            with st.expander("Das Fluency-Problem"):
                st.markdown("""
*"Ich hab so viel gelernt und fühle mich trotzdem unsicher..."*

Das ist NORMAL. Und es ist sogar ein GUTES Zeichen!

**Das Fluency-Problem:**

Wenn du einen Text dreimal durchliest, fühlt er sich "vertraut" an. Das nennt man "Fluency". Dein Gehirn sagt: *"Hey, das kenn ich doch! Muss ich also wissen!"* Aber: Etwas wiederzuerkennen ist nicht dasselbe wie es zu WISSEN.

🎬 **Die Studie, die alles verändert:**

Forscher ließen Studenten auf zwei Arten lernen:
- Gruppe A: Wiederlesen (fühlte sich gut an)
- Gruppe B: Retrieval Practice (fühlte sich anstrengend an)

**Ergebnis:** Gruppe A fühlte sich 62% vorbereitet. Gruppe B nur 53% vorbereitet.
**Aber:** Gruppe B schnitt im Test **54% BESSER** ab!

**"Desirable Difficulties" (Erwünschte Schwierigkeiten):**

Der Psychologe Robert Bjork nennt das "desirable difficulties". Bestimmte Schwierigkeiten beim Lernen sind GUT, weil sie das Gehirn zwingen, härter zu arbeiten.

🎯 **Die Take-Away Message:**
- Wenn Lernen sich leicht anfühlt, lernst du wahrscheinlich nicht viel.
- Wenn Lernen sich anstrengend anfühlt, bist du auf dem richtigen Weg.

**Vertrau der Wissenschaft, nicht deinem Gefühl!**
                """)

            st.divider()

            # ========== QUICK REFERENCE ==========
            st.markdown("### ✨ Quick Reference: Alle Techniken auf einen Blick")

            st.markdown("""
| Technik | Evidenz | Quelle | Tipp für dich |
|---------|---------|--------|---------------|
| 🔄 Active Recall | 🟢 HOCH | Dunlosky 2013, Roediger 2006 | Eigene Prüfungsfragen |
| 📅 Spaced Repetition | 🟢 HOCH | Dunlosky 2013, Cepeda 2006 | Abi-Jahresplan |
| 👶 Feynman-Methode | 🟢 HOCH | Dunlosky 2013 (Elaboration) | YouTube-Erklärvideo |
| 🏰 Loci-Methode | 🟡 MITTEL | Dunlosky 2013 (Mnemonics) | Themenpark im Kopf |
| 🗺️ Mind Mapping | 🟡 MITTEL | Farrand 2002, Nesbit 2006 | Prüfungs-Mindmap |
| 🍅 Pomodoro | 🟡 MITTEL | Cirillo 2006 | Mit Techniken kombinieren |
| 👥 Lehren | 🟢 HOCH | Dunlosky 2013, Fiorella 2013 | Nachhilfe geben |

💡 **Zur Einordnung:**
- 🟢 HOCH = Mehrere hochwertige Studien bestätigen die Wirksamkeit
- 🟡 MITTEL = Gute Evidenz, aber weniger umfangreich erforscht oder kontextabhängig

🚀 **Jetzt bist du dran.** Pick EINE Technik. Probier sie EINE Woche aus. Und dann: Staune.
            """)

        # ==========================================
        # PÄDAGOGEN CONTENT
        # ==========================================
        elif st.session_state.selected_age_group_learnstrat == "paedagogen":
            st.header("📚 Pädagogische Grundlage: Cleverer Lernen")
            st.markdown("*Wissenschaftliche Basis für evidenzbasierte Lernstrategien*")

            # ========== 1. ÜBERBLICK ==========
            with st.expander("**1. Überblick: Was funktioniert beim Lernen?**", expanded=True):
                st.markdown("""
**1.1 Die Kernfrage der Lernforschung**

Die Lernforschung beschäftigt sich seit über 140 Jahren mit einer zentralen Frage: Welche Methoden führen zu nachhaltigem, anwendbarem Wissen? Bereits 1885 untersuchte Hermann Ebbinghaus die Vergessenskurve, 1909 folgte Abbott mit Studien zur Abrufpraxis. Trotz dieser langen Forschungstradition zeigen Umfragen bis heute, dass viele Schüler und Studierende ineffektive Strategien bevorzugen und die wirksamsten Methoden kaum kennen.

**1.2 Die zwei großen Meta-Studien**

*John Hattie: Visible Learning (2009, aktualisiert 2023)*

John Hattie synthetisierte über 1.800 Meta-Analysen mit mehr als 300 Millionen Schülern weltweit. Er entwickelte das Konzept der Effektstärke (Cohen's d) als Maß für die Wirksamkeit von Unterrichtsmethoden. Der "Hinge Point" von d = 0.40 entspricht etwa einem Jahr Lernfortschritt und dient als Schwellenwert: Methoden darüber haben überdurchschnittlichen Einfluss auf den Lernerfolg.

Die aktualisierte Datenbank (Visible Learning MetaX) umfasst mittlerweile 320+ Einflussfaktoren. Die durchschnittliche Effektstärke aller untersuchten Interventionen liegt bei d = 0.40.

*John Dunlosky et al.: Improving Students' Learning (2013)*

Dunlosky und Kollegen (Kent State University, Duke University, University of Wisconsin-Madison, University of Virginia) analysierten zehn populäre Lerntechniken systematisch nach vier Kriterien: Generalisierbarkeit über verschiedene Lernmaterialien, Generalisierbarkeit über verschiedene Lernbedingungen, Generalisierbarkeit über verschiedene Schülercharakteristiken, und Generalisierbarkeit über verschiedene Outcome-Maße.

Das Ergebnis war eine Einteilung in hohe, moderate und niedrige Nützlichkeit.

**1.3 Die Donoghue & Hattie Meta-Analyse (2021)**

Diese Meta-Analyse vereinte beide Forschungsstränge und analysierte 242 Studien mit 1.619 Effekten und 169.179 Teilnehmern. Der Gesamtmittelwert lag bei d = 0.56, deutlich über Hatties Hinge Point. Die Studie bestätigte die Rangfolge der Techniken und identifizierte wichtige Moderatoren wie Feedback, Transfer-Distanz und Fähigkeitsniveau der Lernenden.
                """)

            # ========== 2. STRATEGIEN IM DETAIL ==========
            with st.expander("**2. Die evidenzbasierten Lernstrategien im Detail**"):
                st.markdown("""
**2.1 Strategien mit hoher Wirksamkeit**

*2.1.1 Distributed Practice / Spacing (Zeitversetztes Lernen) – Effektstärke: d = 0.60 (Dunlosky: "High Utility")*

**Definition:** Verteilung des Lernens über mehrere Zeitpunkte statt massiertes Lernen in einer Sitzung (Cramming).

**Mechanismus:** Die Vergessenskurve nach Ebbinghaus zeigt, dass wir Gelerntes exponentiell vergessen. Durch zeitversetzte Wiederholung wird das Vergessen unterbrochen und die Gedächtnisspur jedes Mal verstärkt. Der optimale Abstand zwischen Wiederholungen hängt vom gewünschten Behaltensintervall ab: Für eine Prüfung in einer Woche sind kürzere Abstände sinnvoll, für langfristiges Behalten längere.

**Forschungsgrundlage:** Cepeda et al. (2006) führten eine umfassende Meta-Analyse durch und fanden robuste Spacing-Effekte über alle Altersgruppen, Materialtypen und Testformate hinweg. Die optimale Verteilung folgt etwa der Regel: Der Abstand zwischen Lernsitzungen sollte 10-20% des gewünschten Behaltensintervalls betragen.

**Praktische Umsetzung:** Lernstoff auf mehrere Tage/Wochen verteilen. Wiederholungsintervalle systematisch erweitern (1 Tag → 3 Tage → 1 Woche → 2 Wochen). Digitale Tools wie Anki oder Quizlet nutzen, die Spaced Repetition Algorithmen implementieren.

*2.1.2 Retrieval Practice / Practice Testing (Abrufübung) – Effektstärke: d = 0.58 (Dunlosky: "High Utility")*

**Definition:** Aktives Abrufen von Information aus dem Gedächtnis, statt passives Wiederlesen oder Betrachten.

**Mechanismus:** Der "Testing Effect" oder "Retrieval Practice Effect" beschreibt das Phänomen, dass der Akt des Abrufens selbst das Gedächtnis stärkt – unabhängig von zusätzlichem Lernen. Beim Abrufen werden Gedächtnisspuren reaktiviert und neu konsolidiert, was sie robuster und zugänglicher macht. Zusätzlich verbessert Retrieval Practice die Fähigkeit, Wissen in neuen Kontexten anzuwenden (Transfer).

**Forschungsgrundlage:** Roediger & Butler (2011) dokumentierten in ihrer Übersichtsarbeit "The critical role of retrieval practice in long-term retention" die umfangreiche Evidenz für diese Strategie. Besonders bemerkenswert: Selbst wenn beim ersten Abrufversuch Fehler gemacht werden, führt die Kombination aus Abrufversuch und anschließendem Feedback zu besserem Lernen als reines Wiederlesen.

**Praktische Umsetzung:** Karteikarten (physisch oder digital), selbst erstellte Quizfragen, "Blatt-Papier-Methode" (Buch schließen, aufschreiben was man erinnert), Fragen am Kapitelende beantworten BEVOR man die Antworten nachschlägt.

*2.1.3 Elaboration / Elaborative Interrogation (Ausarbeitung) – Effektstärke: d = 0.75 (Feynman-Methode), d = 0.42 (Elaborative Interrogation)*

**Definition:** Elaboration bedeutet, neue Information mit bestehendem Wissen zu verknüpfen, indem man sie erklärt, hinterfragt oder in eigene Worte fasst.

**Mechanismus:** Beim Elaborieren werden neue Informationen in bestehende Wissensstrukturen (Schemata) integriert. Je mehr Verknüpfungen entstehen, desto mehr "Abrufpfade" existieren später. Die Frage "Warum ist das so?" zwingt das Gehirn, kausale Zusammenhänge zu konstruieren und aktiviert tiefere Verarbeitungsprozesse.

**Forschungsgrundlage:** Dunlosky et al. (2013) zeigten, dass Elaborative Interrogation besonders effektiv ist, wenn Lernende bereits Vorwissen zum Thema haben. Die Effekte sind robust über verschiedene Altersgruppen (von Grundschülern bis Erwachsenen) und Materialtypen.

**Die Feynman-Methode:** Richard Feynman, Nobelpreisträger für Physik, entwickelte eine spezifische Elaborationstechnik: 1) Wähle ein Konzept, 2) Erkläre es so, dass ein 10-Jähriger es verstehen würde, 3) Identifiziere Lücken in deiner Erklärung → zurück zum Material, 4) Vereinfache und verwende Analogien. Der Kern: "Was du nicht einfach erklären kannst, hast du nicht verstanden."

**Praktische Umsetzung:** "Warum?"-Fragen zu jedem neuen Fakt stellen, Konzepte laut erklären (der Wand, dem Haustier, einem imaginären Schüler), Analogien und Beispiele aus dem eigenen Leben finden, Zusammenhänge zu anderen Fächern herstellen.

*2.1.4 Interleaved Practice (Vermischtes Üben) – Effektstärke: d = 0.67 (für visuelle Kategorien), variabel für andere Bereiche*

**Definition:** Abwechselndes Üben verschiedener Problemtypen oder Themen innerhalb einer Lernsitzung, im Gegensatz zu "Blocked Practice" (ein Thema nach dem anderen).

**Mechanismus:** Zwei Hauptmechanismen erklären den Interleaving-Effekt: 1) Discriminative Contrast Hypothesis: Durch das Abwechseln werden Unterschiede zwischen Konzepten deutlicher. Das Gehirn lernt nicht nur "Was ist A?", sondern auch "Wie unterscheidet sich A von B und C?" 2) Retrieval-Hypothese: Bei jedem Wechsel muss die passende Strategie/Formel aktiv aus dem Gedächtnis abgerufen werden, was den Retrieval-Practice-Effekt aktiviert.

**Forschungsgrundlage:** Eine Studie mit Physik-Studierenden (Pan et al., 2021) zeigte beeindruckende Ergebnisse: Bei Überraschungstests mit neuen, anspruchsvolleren Aufgaben zeigten Studierende nach Interleaved Practice 50% bessere Leistungen bei Test 1 und 125% bessere Leistungen bei Test 2 im Vergleich zu Blocked Practice. Rohrer et al. (2015) demonstrierten ähnliche Effekte bei Siebtklässlern in Mathematik über einen Zeitraum von mehreren Monaten.

**Das Paradox des Interleaving:** Trotz besserer objektiver Leistung bewerten Lernende Interleaving subjektiv als schwieriger und glauben fälschlicherweise, weniger gelernt zu haben. Dieses Paradox ist pädagogisch bedeutsam: Effektive Methoden fühlen sich oft anstrengender an.

**Praktische Umsetzung:** Mathematik: Verschiedene Aufgabentypen mischen statt 20 gleiche Aufgaben hintereinander. Sprachen: Grammatikthemen abwechseln statt ein Thema bis zur Erschöpfung üben. Musik: Zwischen Tonleitern, Akkorden und Stücken wechseln. Sport: Verschiedene Schlagarten im Tennis abwechselnd üben.

**2.2 Strategien mit moderater Wirksamkeit**

*2.2.1 Self-Explanation (Selbsterklärung) – Effektstärke: d = 0.55*

**Definition:** Sich selbst erklären, wie neue Information mit bereits Bekanntem zusammenhängt oder wie man zu einer Lösung gekommen ist.

**Mechanismus:** Self-Explanation fördert die Integration neuer Information in bestehende Wissensstrukturen und macht implizites Wissen explizit. Besonders wirksam ist es bei der Arbeit mit Lösungsbeispielen (Worked Examples).

**Forschungsgrundlage:** Chi et al. (1989) zeigten, dass "gute" Lerner sich spontan mehr selbst erklären als "schwache" Lerner. Wichtig: Self-Explanation wirkt besonders gut für Far-Transfer-Aufgaben, also für die Anwendung in neuen Kontexten.

*2.2.2 Dual Coding (Doppelte Kodierung) – Effektstärke: d = 0.54 (Mind Mapping), variabel für andere Formen*

**Definition:** Information sowohl verbal als auch visuell verarbeiten und darstellen.

**Mechanismus:** Nach Paivios Dual Coding Theory (1971) werden verbale und bildliche Informationen in separaten, aber verbundenen Systemen verarbeitet. Wenn beide Systeme aktiviert werden, entstehen mehr Gedächtnisspuren und Abrufpfade.

**Praktische Umsetzung:** Mind Maps erstellen, Skizzen und Diagramme zu Texten zeichnen, Infografiken nutzen oder erstellen, beim Lesen innere Bilder erzeugen.

*2.2.3 Concrete Examples (Konkrete Beispiele) – Effektstärke: Variabel, aber konsistent positiv*

**Definition:** Abstrakte Konzepte durch konkrete, anschauliche Beispiele illustrieren.

**Mechanismus:** Konkrete Beispiele aktivieren mehr sensorische und kontextuelle Gedächtnissysteme. Sie schaffen "Anker" im Gedächtnis, von denen aus abstrakte Prinzipien rekonstruiert werden können.

**Praktische Umsetzung:** Für jedes abstrakte Konzept mindestens zwei konkrete Beispiele finden, Beispiele aus verschiedenen Kontexten wählen (fördert Transfer), eigene Beispiele aus dem Alltag konstruieren.

**2.3 Strategien mit niedriger Wirksamkeit**

*2.3.1 Highlighting / Underlining (Markieren / Unterstreichen) – Effektstärke: d = 0.36 (unter dem Hinge Point)*

**Problem:** Markieren ist passiv und erfordert keine tiefe Verarbeitung. Es erzeugt die Illusion des Lernens, da markierter Text beim Wiederlesen "bekannt" erscheint. Viele Studierende markieren zu viel, wodurch der potenzielle Fokussierungseffekt verloren geht.

**Forschungsgrundlage:** Dunlosky et al. (2013) stuften Highlighting als "Low Utility" ein, da die Evidenz für Lernvorteile schwach und inkonsistent ist.

*2.3.2 Rereading (Wiederlesen) – Effektstärke: Gering bis moderat, aber ineffizient*

**Problem:** Wiederlesen erzeugt "Fluency" – das Material fühlt sich vertraut an – was fälschlicherweise als Lernen interpretiert wird. Der Zeitaufwand-Nutzen-Verhältnis ist schlecht im Vergleich zu Retrieval Practice.

**Forschungsgrundlage:** Studien zeigen konsistent, dass ein einmaliges Lesen gefolgt von Retrieval Practice effektiver ist als mehrmaliges Wiederlesen.

*2.3.3 Summarization (Zusammenfassen) – Effektstärke: d = 0.42 (moderat, aber mit Einschränkungen)*

**Problem:** Die Qualität von Zusammenfassungen variiert stark. Ohne Training produzieren viele Lernende oberflächliche oder unvollständige Zusammenfassungen. Effektiv ist Zusammenfassen nur, wenn es gut gemacht wird, was erhebliches Training voraussetzt.
                """)

            # ========== 3. TRANSFER ==========
            with st.expander("**3. Transfer-Strategien: Die Königsdisziplin**"):
                st.markdown("""
**3.1 Die Bedeutung von Transfer**

Transfer – die Fähigkeit, Gelerntes in neuen Kontexten anzuwenden – ist das ultimative Ziel von Bildung. Hattie (2023) betont: "Transfer ist das Kennzeichen von tiefem Lernen und kann nicht ohne metakognitive Beteiligung stattfinden."

Die Meta-Analyse von Donoghue & Hattie (2021) fand für Transfer-Strategien eine beeindruckende Effektstärke von d = 0.86.

**3.2 Arten des Transfers**

*Near Transfer:* Anwendung in ähnlichen Kontexten (z.B. Addition zweistelliger Zahlen → Addition dreistelliger Zahlen). Relativ leicht zu erreichen.

*Far Transfer:* Anwendung in unähnlichen Kontexten (z.B. mathematisches Problemlösen → Textanalyse). Schwieriger zu erreichen und erfordert explizites Training.

**3.3 Warum Transfer oft scheitert**

Trotz der zentralen Bedeutung scheitert Transfer häufig. Die Hauptgründe sind: Oberflächliches Verständnis (nur Prozedur gelernt, nicht zugrundeliegende Prinzipien), Kontext-Bindung (Wissen zu stark an den Lernkontext gebunden – "träges Wissen"), fehlende Metakognition (nicht erkannt, wann und wo das Wissen anwendbar ist), und mangelnde Übung (Transfer wird nicht explizit geübt).

**3.4 Strategien zur Förderung von Transfer**

*Hugging (nach Perkins & Salomon, 1992):* Die Lernsituation wird der späteren Anwendungssituation möglichst ähnlich gestaltet. Authentische Aufgaben und Kontexte, Simulation realer Bedingungen, unmittelbares Feedback.

*Bridging (nach Perkins & Salomon, 1992):* Explizite Verbindungen zwischen Lernkontext und anderen Kontexten herstellen. "Wo könnte ich das noch anwenden?", Analogien zwischen verschiedenen Kontexten identifizieren, abstrakte Prinzipien explizit formulieren.

Die Kombination beider Strategien ist am effektivsten: Hugging schafft die Basis, Bridging fördert die Generalisierung.
                """)

            # ========== 4. BIRKENBIHL ==========
            with st.expander("**4. Die Birkenbihl-Methode: Assoziatives Lernen**"):
                st.markdown("""
**4.1 Vera F. Birkenbihl**

Vera F. Birkenbihl (1946-2011) war eine deutsche Managementtrainerin und Sachbuchautorin, die Methoden für "gehirngerechtes Lernen" entwickelte. Ihr Ansatz betont die aktive, assoziative Verarbeitung von Information.

**4.2 Das Kernprinzip: "Eigene Gedanken notieren"**

*Traditionelle Methode:* Aufschreiben, was der Lehrer sagt. Versuch, möglichst vollständig zu protokollieren. Passives Aufnehmen.

*Birkenbihl-Methode:* Aufschreiben, was man SELBST denkt, während man zuhört. Eigene Assoziationen, Fragen, Verbindungen festhalten. Aktives Verarbeiten.

**4.3 Das "Faden"-Konzept (Wissensnetz-Theorie)**

Birkenbihl verwendete die Metapher des "Fadens" im Wissensnetz. Ihre Kernidee: Ohne einen "Faden" (Anknüpfungspunkt) geht neue Information "hier rein, da raus".

Beispiel: Wenn jemand das Wort "Adipositas" hört, ohne zu wissen, dass es "Fettleibigkeit" bedeutet, hat die Information keinen Faden – sie kann nicht verankert werden.

Mit einem Faden hingegen: Die Information wird an bestehendes Wissen geknüpft. Sobald ein Faden existiert, wird die Information "überall" bemerkt (Baader-Meinhof-Phänomen). Eigene Assoziationen sind besonders starke Fäden, weil sie bereits im Wissensnetz verankert sind.

**4.4 Wissenschaftliche Einordnung**

Birkenbihl formulierte ihre Ideen vor allem praktisch und intuitiv. Die moderne Lernforschung liefert für viele ihrer Konzepte empirische Unterstützung:

"Eigene Gedanken notieren" entspricht der Elaboration-Strategie. "Fäden im Wissensnetz" entspricht der "Prior Knowledge Activation" (d = 0.93). "Assoziationen bilden" entspricht der "Elaborative Interrogation".

Birkenbihl war ihrer Zeit in vielen Punkten voraus, auch wenn ihre Methoden nicht alle wissenschaftlich validiert wurden.
                """)

            # ========== 5. METAKOGNITION ==========
            with st.expander("**5. Metakognition: Die Steuerungszentrale**"):
                st.markdown("""
**5.1 Definition und Bedeutung**

Metakognition – wörtlich "Denken über das Denken" – bezeichnet das Bewusstsein über und die Kontrolle von eigenen kognitiven Prozessen. John Flavell (1979) prägte den Begriff und unterschied zwei Hauptkomponenten:

*Metacognitive Knowledge (Wissen über Kognition):* Wissen über eigene Stärken und Schwächen, über Aufgabenanforderungen und über Strategien.

*Metacognitive Regulation (Steuerung der Kognition):* Die aktive Kontrolle über den eigenen Lernprozess durch Planung, Überwachung und Evaluation.

Hattie berichtet eine Effektstärke von d = 0.69 für metakognitive Strategien.

**5.2 Die drei Phasen der metakognitiven Regulation**

*Vor dem Lernen (Planen):* Was weiß ich schon über dieses Thema? Was ist mein Ziel? Welche Strategie passt zu diesem Material und meinem Ziel?

*Während des Lernens (Überwachen):* Verstehe ich das gerade? Funktioniert meine Strategie? Muss ich etwas ändern?

*Nach dem Lernen (Evaluieren):* Was hat funktioniert, was nicht? Habe ich mein Ziel erreicht? Was würde ich nächstes Mal anders machen?

**5.3 Die Verbindung zu Transfer**

Metakognition ist entscheidend für Transfer, weil sie die bewusste Reflexion ermöglicht: "Wo könnte ich dieses Wissen noch anwenden?" Nur wer sein Lernen bewusst steuert, kann erkennen, wann Strategien auf neue Probleme anwendbar sind.
                """)

            # ========== 6. McDaniel-Einstein ==========
            with st.expander("**6. Das McDaniel-Einstein-Framework**"):
                st.markdown("""
**6.1 Das Problem: Warum wenden Schüler keine effektiven Strategien an?**

Obwohl effektive Lernstrategien seit über einem Jahrhundert bekannt sind, zeigen Umfragen konsistent, dass die meisten Schüler und Studierende sie nicht anwenden. McDaniel & Einstein (2025) analysierten dieses Phänomen und entwickelten ein Framework für erfolgreiches Strategietraining.

**6.2 Die vier Komponenten für erfolgreichen Transfer**

Das Framework identifiziert vier notwendige Komponenten, die alle präsent sein müssen:

*1. Deklaratives Wissen (WELCHE):* Welche Strategien funktionieren tatsächlich? Viele Lernende kennen die effektivsten Strategien schlicht nicht. Sie greifen auf intuitive, aber ineffektive Methoden zurück.

*2. Prozedurales Wissen (WANN & WIE):* Wann und wie wendet man die Strategie konkret an? Es reicht nicht zu wissen, dass Spaced Practice funktioniert – man muss wissen, wie man es praktisch umsetzt.

*3. Konzeptuelles Verständnis (WARUM):* Warum funktioniert die Strategie? Wer versteht, dass Spacing das Vergessen unterbricht und die Gedächtnisspur stärkt, kann die Strategie flexibler anwenden und auf neue Situationen übertragen.

*4. Überzeugung / Glaube (GLAUBE):* Der Glaube, dass die Strategie für mich persönlich funktioniert. Dies ist vielleicht die kritischste Komponente. Ohne persönliche Überzeugung keine nachhaltige Anwendung.

**6.3 Die Bedeutung der vierten Komponente**

Besonders die vierte Komponente ist kritisch: Selbst wenn Schüler wissen, welche Strategien funktionieren (1), wie man sie anwendet (2) und warum sie funktionieren (3), wenden sie sie nicht an, wenn sie nicht glauben, dass sie für sie persönlich wirksam sind (4). Dieser Glaube kann nur durch eigene Erfahrung entstehen – durch kontrolliertes Selbstexperiment.
                """)

            # ========== 7. PARADOX ==========
            with st.expander("**7. Das Paradox der effektiven Lernstrategien**"):
                st.markdown("""
**7.1 Das Phänomen**

Die effektivsten Lernstrategien fühlen sich subjektiv oft schwieriger und weniger erfolgreich an als weniger effektive Strategien. Dies ist ein gut dokumentiertes Phänomen mit erheblichen pädagogischen Implikationen.

**7.2 Empirische Belege**

*Beispiel Interleaving:* In der bereits zitierten Studie zeigten Studierende nach Interleaved Practice 50-125% bessere Leistungen. Gleichzeitig bewerteten sie Interleaving subjektiv als schwieriger und glaubten, weniger gelernt zu haben.

*Beispiel Active Learning:* Deslauriers et al. (2019) verglichen aktives und passives Lernen in Physik-Kursen. Ergebnis: 62,5% der Studierenden fühlten sich nach passivem Lernen besser vorbereitet. Aber: Aktives Lernen führte zu 54% besseren Testergebnissen.

**7.3 Erklärung: Die Fluency-Illusion**

Passives Lernen (Wiederlesen, Zuhören) erzeugt "Fluency" – das Material fühlt sich vertraut an. Diese Vertrautheit wird fälschlicherweise als Lernerfolg interpretiert. Robert Bjork prägte den Begriff "Desirable Difficulties": Bestimmte Schwierigkeiten (wie der Aufwand beim Retrieval Practice) verlangsamen kurzfristig das Lernen, verbessern aber langfristige Behaltens- und Transferleistung.

**7.4 Pädagogische Konsequenzen**

Dieses Paradox hat wichtige Implikationen: Lernende über das Paradox aufklären. "Schwerer" bedeutet oft "besser" für langfristiges Lernen. Die langfristige Perspektive betonen – nicht nur die nächste Prüfung. Durchhaltevermögen fördern, wenn Strategien sich "falsch" anfühlen.
                """)

            # ========== 8. INTEGRATION ==========
            with st.expander("**8. Integration: Ein kohärentes Modell**"):
                st.markdown("""
**8.1 Die drei Ebenen des Lernens**

Hattie unterscheidet drei Ebenen des Lernens, für die unterschiedliche Strategien optimal sind:

*Surface Learning (Oberflächenlernen):* Faktenwissen, Terminologie, Grundfähigkeiten. Hier sind besonders wirksam: Retrieval Practice, Spaced Practice, Mnemonics.

*Deep Learning (Tiefenlernen):* Zusammenhänge verstehen, Prinzipien erkennen, konzeptuelles Verständnis. Hier sind besonders wirksam: Elaboration, Self-Explanation, Concept Mapping.

*Transfer Learning:* Anwendung in neuen, unbekannten Kontexten. Hier sind besonders wirksam: Interleaving, Multiple Contexts, Bridging.

Hatties wichtige Erkenntnis: "Was und wann sind gleichermaßen wichtig. Ansätze, die oberflächliches Lernen fördern, funktionieren nicht gleich gut für tiefes Lernen, und umgekehrt."

**8.2 Die Verbindung zu Selbstwirksamkeit**

Alle Lernstrategien sind wirkungslos ohne Motivation und Selbstwirksamkeit. Die Überzeugung "Ich kann das lernen" (Hattie: d = 0.92) ist Voraussetzung für: die Bereitschaft, anstrengende Strategien anzuwenden; Durchhaltevermögen bei Schwierigkeiten; die Motivation, sich selbst zu testen.

Umgekehrt stärkt erfolgreiches Lernen die Selbstwirksamkeit – ein positiver Kreislauf, der sich selbst verstärkt.
                """)

            # ========== 9. ZUSAMMENFASSUNG ==========
            with st.expander("**9. Zusammenfassung: Die Kernprinzipien**"):
                st.markdown("""
**9.1 Die evidenzbasierten Top-Strategien**

Nach aktueller Forschungslage (Donoghue & Hattie, 2021) sind die wirksamsten Lernstrategien:

1. Transfer Strategien (d = 0.86) – Anwendung in neuen Kontexten üben
2. Elaboration / Feynman-Methode (d = 0.75) – Verknüpfung mit Vorwissen
3. Interleaved Practice (d = 0.67) – Unterschiede zwischen Konzepten erkennen
4. Spaced Practice (d = 0.60) – Vergessenskurve durch Wiederholung unterbrechen
5. Retrieval Practice (d = 0.58) – Aktiver Abruf statt passivem Wiederlesen
6. Self-Explanation (d = 0.55) – Integration in bestehende Wissensstrukturen
7. Dual Coding (d = 0.54) – Nutzung mehrerer Gedächtnissysteme

**9.2 Die Meta-Prinzipien**

Aus der Gesamtschau der Forschung lassen sich folgende übergreifende Prinzipien ableiten:

1. Aktiv vor passiv: Alles, was aktive Verarbeitung erfordert, schlägt passives Aufnehmen.
2. Verteilt vor massiert: Über Zeit verteiltes Lernen schlägt Cramming.
3. Gemischt vor geblockt: Abwechslung schlägt monotone Wiederholung.
4. Verstehen vor Auswendiglernen: Tiefes Verständnis ermöglicht Transfer.
5. Schwieriger fühlt sich oft besser an: "Desirable difficulties" verbessern langfristiges Lernen.
6. Metakognition ist der Schlüssel: Wer sein Lernen steuert, lernt besser.
7. Transfer muss geübt werden: Er geschieht nicht automatisch.

**9.3 Die vier Säulen des Strategie-Trainings (nach McDaniel & Einstein)**

Für erfolgreiche Strategievermittlung müssen alle vier Komponenten adressiert werden:

1. WELCHE Strategien funktionieren (deklaratives Wissen)
2. WANN & WIE man sie anwendet (prozedurales Wissen)
3. WARUM sie funktionieren (konzeptuelles Verständnis)
4. GLAUBE, dass sie für mich funktionieren (persönliche Überzeugung durch Erfahrung)
                """)

            # ========== 10. QUELLEN ==========
            with st.expander("**10. Quellenverzeichnis**"):
                st.markdown("""
**Primärquellen**

Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. Psychological Science in the Public Interest, 14(1), 4-58.

Hattie, J. (2009). Visible Learning: A Synthesis of Over 800 Meta-Analyses Relating to Achievement. London: Routledge.

Hattie, J. (2023). Visible Learning: The Sequel – A Synthesis of Over 2,100 Meta-Analyses Relating to Achievement. London: Routledge.

Donoghue, G. M., & Hattie, J. A. (2021). A Meta-Analysis of Ten Learning Techniques. Frontiers in Education, 6, 581216.

**Spacing und Retrieval Practice**

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354-380.

Roediger, H. L., & Butler, A. C. (2011). The critical role of retrieval practice in long-term retention. Trends in Cognitive Sciences, 15(1), 20-27.

**Interleaving**

Pan, S. C., Tajran, J., Lovelett, J., Osber, J., & Rickard, T. C. (2019). Does interleaved practice enhance foreign language learning? The effects of training schedule on Spanish verb conjugation skills. Journal of Educational Psychology, 111(7), 1172-1188.

Rohrer, D., Dedrick, R. F., & Stershic, S. (2015). Interleaved practice improves mathematics learning. Journal of Educational Psychology, 107(3), 900-908.

**Weitere Quellen**

Perkins, D. N., & Salomon, G. (1992). Transfer of learning. In T. Husen & T. N. Postlethwaite (Eds.), International Encyclopedia of Education (2nd ed.). Oxford: Pergamon Press.

Flavell, J. H. (1979). Metacognition and cognitive monitoring: A new area of cognitive-developmental inquiry. American Psychologist, 34(10), 906-911.

Birkenbihl, V. F. (2013). Stroh im Kopf? Vom Gehirn-Besitzer zum Gehirn-Benutzer (55. Aufl.). München: mvg Verlag.

McDaniel, M. A., & Einstein, G. O. (2025). Training and Transfer of Effective Learning Strategies: The Classroom as Experiment. Educational Psychology Review.

Bjork, R. A., & Bjork, E. L. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In M. A. Gernsbacher et al. (Eds.), Psychology and the real world: Essays illustrating fundamental contributions to society (pp. 56-64). New York: Worth Publishers.

Deslauriers, L., McCarty, L. S., Miller, K., Callaghan, K., & Kestin, G. (2019). Measuring actual learning versus feeling of learning in response to being actively engaged in the classroom. Proceedings of the National Academy of Sciences, 116(39), 19251-19257.
                """)

    # Zusammenfassungs-Box am Ende
    st.divider()
    st.subheader("📋 Die 7 Techniken auf einen Blick")
    st.markdown("""
| Technik | Evidenz | Quelle | Kernidee |
|---------|---------|--------|----------|
| 🔄 Active Recall | 🟢 HOCH | Dunlosky 2013, Roediger 2006 | Sich selbst abfragen statt nur lesen |
| 📅 Spaced Repetition | 🟢 HOCH | Dunlosky 2013, Cepeda 2006 | In wachsenden Abständen wiederholen |
| 👶 Feynman-Methode | 🟢 HOCH | Dunlosky 2013 (Elaboration) | So einfach erklären, dass ein Kind es versteht |
| 🏰 Loci-Methode | 🟡 MITTEL | Dunlosky 2013 (Mnemonics) | Mit bekannten Orten verknüpfen |
| 🗺️ Mind Mapping | 🟡 MITTEL | Farrand 2002, Nesbit 2006 | Visuell als Gedankenkarte darstellen |
| 🍅 Pomodoro | 🟡 MITTEL | Cirillo 2006 (keine RCTs) | 25 Min fokussiert, 5 Min Pause |
| 👥 Lehren | 🟢 HOCH | Dunlosky 2013, Fiorella 2013 | Anderen erklären = doppelt lernen |

💡 **Zur Einordnung:**
- 🟢 HOCH = Mehrere hochwertige Studien bestätigen die Wirksamkeit
- 🟡 MITTEL = Gute Evidenz, aber weniger umfangreich erforscht oder kontextabhängig
- Quellen: Dunlosky et al. (2013) "Improving Students' Learning", Hattie (2023) "Visible Learning"
    """)

# ============================================
# MAIN APP
# ============================================

# ============================================
# BENUTZER-LOGIN (für Gamification)
# ============================================

if HAS_GAMIFICATION:
    render_user_login()

    # Nur fortfahren wenn eingeloggt
    if not is_logged_in():
        st.stop()

st.divider()

# URL-Parameter oder Session State
query_params = st.query_params
factor_from_url = query_params.get('factor', None)

if factor_from_url and factor_from_url in CONTENT_DATABASE:
    st.session_state.selected_factor = factor_from_url
elif 'selected_factor' not in st.session_state or st.session_state.selected_factor not in CONTENT_DATABASE:
    st.session_state.selected_factor = 'MATHEFF'  # Default

factor = st.session_state.selected_factor

# ============================================
# SIDEBAR-NAVIGATION
# ============================================

with st.sidebar:
    st.markdown("### 📚 Wähle einen Bereich:")
    for key, val in CONTENT_DATABASE.items():
        btn_icon = val.get('icon', '📚')
        btn_name = val.get('name_schueler', key)
        is_selected = (key == factor)
        btn_type = "primary" if is_selected else "secondary"
        if st.button(
            f"{btn_icon} {btn_name}",
            key=f"sidebar_nav_{key}",
            use_container_width=True,
            type=btn_type
        ):
            st.session_state.selected_factor = key
            st.rerun()

# ============================================
# INHALT DES AUSGEWÄHLTEN BEREICHS
# ============================================

# Hole Content
content = CONTENT_DATABASE.get(factor, {})
if not content:
    st.error("Bereich nicht gefunden.")
    st.stop()

icon = content.get('icon', '📚')
name = content.get('name_de', factor)
color = content.get('color', '#667eea')

# Header
st.markdown(f"""
<div style="background: linear-gradient(135deg, {color} 0%, {color}aa 100%);
            color: white; padding: 40px; border-radius: 20px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 2.5em;">{icon} {name}</h1>
</div>
""", unsafe_allow_html=True)

# Kurzinfo-Box (vorher in Sidebar)
wissenschaft = content.get('wissenschaft', {})
col_intro, col_info = st.columns([3, 1])

with col_intro:
    # Intro Text
    st.markdown(content.get('intro_text', ''))

with col_info:
    st.markdown(f"""
    <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; border-left: 4px solid {color};">
        <strong>{icon} Kurzinfo</strong><br><br>
        <strong>Hattie d:</strong> {wissenschaft.get('hattie_d', '?')}<br>
        <strong>Rang:</strong> #{wissenschaft.get('hattie_rank', '?')} / 252<br>
        <strong>PISA:</strong> {wissenschaft.get('pisa_impact', '?')}
    </div>
    """, unsafe_allow_html=True)

st.divider()

# ============================================
# TABS
# ============================================

# Spezialbehandlung für MATHEFF (Selbstwirksamkeit) und EXT_LEARNSTRAT (Cleverer lernen) mit Altersstufen-Tabs
if factor == "MATHEFF":
    render_matheff_altersstufen(color)
elif factor == "EXT_LEARNSTRAT":
    render_learnstrat_altersstufen(color)
else:
    # Standard-Tabs für alle anderen Ressourcen
    tab1, tab2, tab3 = st.tabs(["💡 Tipps & Übungen", "🔬 Wissenschaft", "🎬 Videos"])

    with tab1:
        st.header("💡 Tipps & Übungen")
        st.markdown("Konkrete Strategien, die du sofort anwenden kannst.")
        render_tipps_section(content.get('tipps', []), color)

    with tab2:
        st.header("🔬 Was sagt die Wissenschaft?")
        render_wissenschaft_section(content.get('wissenschaft', {}), color)

    with tab3:
        st.header("🎬 Empfohlene Videos")
        st.markdown("Diese Videos wurden wissenschaftlich analysiert und helfen nachweislich bei diesem Thema.")
        render_video_section(content.get('videos', []), color)

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
