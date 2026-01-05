# -*- coding: utf-8 -*-
"""Modal-System für Insel-Content auf der Schatzkarte."""

import streamlit as st
from typing import Dict, Any, Optional, List
from schatzkarte.map_data import ISLANDS
from schatzkarte.map_db import (
    get_island_progress,
    complete_island_action,
    get_island_progress_percentage,
    save_treasure_collected,
    is_treasure_collected,
    XP_REWARDS
)

# Content-Datenbank importieren
try:
    from utils.ressourcen.content_database import CONTENT_DATABASE
except ImportError:
    CONTENT_DATABASE = {}

# Altersgerechte Content-Funktionen importieren
try:
    from utils.ressourcen.matheff_content import (
        render_matheff_grundschule,
        render_matheff_unterstufe
    )
    HAS_MATHEFF_CONTENT = True
except ImportError:
    HAS_MATHEFF_CONTENT = False

# ===============================================================
# INSEL → CONTENT MAPPING
# ===============================================================

# Verbindet Insel-IDs mit Content-Quellen aus der Ressourcen-Seite
ISLAND_CONTENT_MAP = {
    # Feste Inseln
    "start": None,  # Nur Willkommen, kein Content
    "festung": "MATHEFF",  # Selbstwirksamkeit
    "werkzeuge": "EXT_LEARNSTRAT",  # Lernstrategien
    "bruecken": "EXT_LEARNSTRAT",  # Transfer (Teil von Lernstrategien)
    "faeden": "EXT_LEARNSTRAT",  # Birkenbihl (Teil von Lernstrategien)

    # Flexible Inseln
    "spiegel_see": "EXT_METACOG",  # Metakognition
    "vulkan": "EXT_MOTIV",  # Motivation
    "ruhe_oase": "ANXMAT",  # Angstreduktion
    "ausdauer_gipfel": "PERSEVAGR",  # Ausdauer
    "fokus_leuchtturm": "EXT_FOCUS",  # Fokus
    "wachstum_garten": "GROSAGR",  # Growth Mindset
    "lehrer_turm": "TEACHSUP",  # Lehrer-Beziehung
    "wohlfuehl_dorf": "BELONG",  # Zugehörigkeit
    "schutz_burg": "BULLIED",  # Anti-Mobbing

    # Finale
    "meister_berg": None,  # Reflexion, kein externer Content
}

# ===============================================================
# QUIZ-DATEN FÜR JEDE INSEL
# ===============================================================

ISLAND_QUIZZES = {
    "festung": {
        "title": "Quiz: Selbstwirksamkeit",
        "questions": [
            {
                "question": "Was ist Selbstwirksamkeit?",
                "options": [
                    "Das Vertrauen, eine bestimmte Aufgabe schaffen zu können",
                    "Allgemeines Selbstbewusstsein",
                    "Wie beliebt man bei anderen ist",
                    "Wie schlau man ist"
                ],
                "correct": 0,
                "explanation": "Selbstwirksamkeit ist aufgabenbezogen: 'Ich kann DIESE Aufgabe schaffen!'"
            },
            {
                "question": "Was ist die stärkste Quelle für Selbstwirksamkeit?",
                "options": [
                    "Lob von anderen",
                    "Eigene Erfolgserlebnisse",
                    "Gute Noten",
                    "Viel Schlaf"
                ],
                "correct": 1,
                "explanation": "Eigene Erfolge sind am wirkungsvollsten - deshalb kleine Schritte machen und Erfolge feiern!"
            },
            {
                "question": "Was hilft NICHT bei Selbstwirksamkeit?",
                "options": [
                    "Kleine Erfolge sammeln",
                    "Von Vorbildern lernen",
                    "Sagen 'Du bist schlau'",
                    "Ermutigung von anderen"
                ],
                "correct": 2,
                "explanation": "Besser: 'Du hast gut gearbeitet' statt 'Du bist schlau' - Anstrengung loben!"
            }
        ]
    },
    "werkzeuge": {
        "title": "Quiz: Lernstrategien",
        "questions": [
            {
                "question": "Was ist Active Recall?",
                "options": [
                    "Text mehrfach durchlesen",
                    "Sich selbst abfragen ohne hinzuschauen",
                    "Zusammenfassungen abschreiben",
                    "Laut vorlesen"
                ],
                "correct": 1,
                "explanation": "Active Recall bedeutet, aktiv aus dem Gedächtnis abzurufen - viel effektiver als nur lesen!"
            },
            {
                "question": "Wie funktioniert die Pomodoro-Technik?",
                "options": [
                    "1 Stunde lernen, dann lange Pause",
                    "25 Min fokussiert lernen, 5 Min Pause",
                    "Nur morgens lernen",
                    "Mit Musik lernen"
                ],
                "correct": 1,
                "explanation": "25 Minuten fokussiert, 5 Minuten Pause - das hält die Konzentration hoch!"
            },
            {
                "question": "Was ist die Feynman-Methode?",
                "options": [
                    "Viel auswendig lernen",
                    "Ein Thema so erklären, dass ein Kind es versteht",
                    "Nachts lernen",
                    "Mit Karteikarten üben"
                ],
                "correct": 1,
                "explanation": "Wenn du es einfach erklären kannst, hast du es wirklich verstanden!"
            }
        ]
    },
    "bruecken": {
        "title": "Quiz: Transfer",
        "questions": [
            {
                "question": "Was bedeutet 'Transfer' beim Lernen?",
                "options": [
                    "Wissen von einem Bereich auf andere anwenden",
                    "Notizen abschreiben",
                    "Daten übertragen",
                    "Schule wechseln"
                ],
                "correct": 0,
                "explanation": "Transfer bedeutet, Gelerntes in neuen Situationen anzuwenden!"
            },
            {
                "question": "Warum ist Transfer wichtig?",
                "options": [
                    "Für bessere Noten",
                    "Damit Wissen im echten Leben nützlich ist",
                    "Für den Lehrer",
                    "Zum Angeben"
                ],
                "correct": 1,
                "explanation": "Echtes Verstehen zeigt sich darin, Wissen auch anderswo anwenden zu können!"
            }
        ]
    },
    "faeden": {
        "title": "Quiz: Birkenbihl-Methode",
        "questions": [
            {
                "question": "Was ist der Kern der Birkenbihl-Methode?",
                "options": [
                    "Viel auswendig lernen",
                    "Gehirn-gerecht lernen statt passiv abschreiben",
                    "Nur Videos schauen",
                    "Streng nach Plan lernen"
                ],
                "correct": 1,
                "explanation": "Birkenbihl sagt: Aktiviere dein Gehirn! Nicht passiv konsumieren."
            },
            {
                "question": "Was ist eine ABC-Liste?",
                "options": [
                    "Eine Einkaufsliste",
                    "A-Z schreiben und zu jedem Buchstaben Begriffe zum Thema finden",
                    "Das Alphabet üben",
                    "Eine Checkliste"
                ],
                "correct": 1,
                "explanation": "Die ABC-Liste aktiviert Vorwissen und zeigt sichtbaren Lernfortschritt!"
            }
        ]
    },
    "spiegel_see": {
        "title": "Quiz: Selbstreflexion",
        "questions": [
            {
                "question": "Was ist Metakognition?",
                "options": [
                    "Über das eigene Lernen nachdenken",
                    "Mathematik lernen",
                    "Schnell lesen",
                    "Viel wissen"
                ],
                "correct": 0,
                "explanation": "Meta = über, Kognition = Denken → Über das eigene Denken nachdenken!"
            },
            {
                "question": "Wann solltest du über dein Lernen nachdenken?",
                "options": [
                    "Nur nach Prüfungen",
                    "Vor, während und nach dem Lernen",
                    "Nie, das lenkt ab",
                    "Nur wenn es nicht klappt"
                ],
                "correct": 1,
                "explanation": "Planen (vorher), Überwachen (während), Reflektieren (nachher) - alle 3 Phasen!"
            }
        ]
    },
    "vulkan": {
        "title": "Quiz: Motivation",
        "questions": [
            {
                "question": "Was sind die 3 Grundbedürfnisse für Motivation?",
                "options": [
                    "Geld, Ruhm, Erfolg",
                    "Autonomie, Kompetenz, Verbundenheit",
                    "Essen, Schlafen, Sport",
                    "Gute Noten, Lob, Belohnung"
                ],
                "correct": 1,
                "explanation": "Selbstbestimmungstheorie: Autonomie (selbst entscheiden), Kompetenz (können), Verbundenheit (dazugehören)!"
            },
            {
                "question": "Was ist intrinsische Motivation?",
                "options": [
                    "Motivation durch Belohnung",
                    "Motivation von innen - weil es Spaß macht",
                    "Motivation durch Druck",
                    "Motivation durch Noten"
                ],
                "correct": 1,
                "explanation": "Intrinsisch = von innen. Du lernst, weil es dich interessiert!"
            }
        ]
    },
    "ruhe_oase": {
        "title": "Quiz: Entspannung",
        "questions": [
            {
                "question": "Warum blockiert Angst das Lernen?",
                "options": [
                    "Man ist zu müde",
                    "Das Arbeitsgedächtnis wird blockiert",
                    "Man vergisst alles",
                    "Die Augen werden schlechter"
                ],
                "correct": 1,
                "explanation": "Bei Angst aktiviert der Körper 'Kampf oder Flucht' - kein Platz zum Denken!"
            },
            {
                "question": "Was hilft bei Prüfungsangst?",
                "options": [
                    "Gar nicht an die Prüfung denken",
                    "Tiefes Atmen und positive Selbstgespräche",
                    "Mehr Kaffee trinken",
                    "Die Nacht durchlernen"
                ],
                "correct": 1,
                "explanation": "4 Sekunden einatmen, 4 halten, 4 ausatmen - beruhigt sofort!"
            }
        ]
    },
    "ausdauer_gipfel": {
        "title": "Quiz: Durchhaltevermögen",
        "questions": [
            {
                "question": "Was ist 'Grit'?",
                "options": [
                    "Intelligenz",
                    "Ausdauer + Leidenschaft für langfristige Ziele",
                    "Talent",
                    "Glück"
                ],
                "correct": 1,
                "explanation": "Angela Duckworth: Grit ist wichtiger als IQ für langfristigen Erfolg!"
            },
            {
                "question": "Was hilft beim Dranbleiben?",
                "options": [
                    "Alles auf einmal machen",
                    "Große Aufgaben in kleine Schritte teilen",
                    "Nur einfache Sachen machen",
                    "Aufgeben, wenn es schwer wird"
                ],
                "correct": 1,
                "explanation": "Kleine Schritte = kleine Erfolge = Motivation weiterzumachen!"
            }
        ]
    },
    "fokus_leuchtturm": {
        "title": "Quiz: Konzentration",
        "questions": [
            {
                "question": "Was passiert, wenn das Handy auf dem Tisch liegt (auch lautlos)?",
                "options": [
                    "Nichts, es ist ja aus",
                    "Die Konzentration sinkt trotzdem",
                    "Man lernt besser",
                    "Man wird schneller"
                ],
                "correct": 1,
                "explanation": "Studien zeigen: Allein die ANWESENHEIT des Handys lenkt ab!"
            },
            {
                "question": "Wie viel Prozent der deutschen Schüler werden durch Geräte abgelenkt?",
                "options": [
                    "5%",
                    "15%",
                    "28%",
                    "50%"
                ],
                "correct": 2,
                "explanation": "PISA 2022: 28% werden durch digitale Geräte beim Lernen abgelenkt!"
            }
        ]
    },
    "wachstum_garten": {
        "title": "Quiz: Growth Mindset",
        "questions": [
            {
                "question": "Was ist Growth Mindset?",
                "options": [
                    "Man ist entweder schlau oder nicht",
                    "Fähigkeiten können durch Anstrengung wachsen",
                    "Nur Talent zählt",
                    "Lernen bringt nichts"
                ],
                "correct": 1,
                "explanation": "Dein Gehirn kann wachsen wie ein Muskel - durch Übung und Anstrengung!"
            },
            {
                "question": "Welches kleine Wort macht einen großen Unterschied?",
                "options": [
                    "ABER",
                    "NOCH",
                    "NIE",
                    "IMMER"
                ],
                "correct": 1,
                "explanation": "'Ich kann das NOCH nicht' öffnet die Tür zum Wachstum!"
            }
        ]
    },
    "lehrer_turm": {
        "title": "Quiz: Lehrer-Kommunikation",
        "questions": [
            {
                "question": "Warum ist Nachfragen im Unterricht gut?",
                "options": [
                    "Man bekommt bessere Noten geschenkt",
                    "Es zeigt Interesse und klärt Unklarheiten",
                    "Lehrer mögen das nicht",
                    "Es ist peinlich"
                ],
                "correct": 1,
                "explanation": "Nachfragen ist kein Zeichen von Schwäche - Lehrer schätzen aktive Schüler!"
            }
        ]
    },
    "wohlfuehl_dorf": {
        "title": "Quiz: Zugehörigkeit",
        "questions": [
            {
                "question": "Warum ist Zugehörigkeitsgefühl wichtig für Lernen?",
                "options": [
                    "Man muss beliebt sein für gute Noten",
                    "Wer sich wohlfühlt, ist entspannter und konzentrierter",
                    "Es ist nicht wichtig",
                    "Nur für die Pause relevant"
                ],
                "correct": 1,
                "explanation": "Zugehörigkeit ist ein Grundbedürfnis - es beeinflusst Wohlbefinden UND Leistung!"
            }
        ]
    },
    "schutz_burg": {
        "title": "Quiz: Grenzen setzen",
        "questions": [
            {
                "question": "Was ist der erste Schritt bei Mobbing?",
                "options": [
                    "Zurückschlagen",
                    "Mit einer Vertrauensperson sprechen",
                    "Ignorieren und hoffen, dass es aufhört",
                    "Schule wechseln"
                ],
                "correct": 1,
                "explanation": "Hilfe holen ist KEINE Schwäche - es ist der klügste erste Schritt!"
            }
        ]
    }
}


# ===============================================================
# CSS FÜR MODAL
# ===============================================================

def get_modal_css() -> str:
    """CSS für das Modal-System."""
    return """
    <style>
    .island-modal-header {
        text-align: center;
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 20px;
    }

    .island-modal-header h1 {
        margin: 10px 0 5px 0;
        font-size: 1.8em;
    }

    .island-modal-header p {
        margin: 0;
        opacity: 0.9;
    }

    .progress-section {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 15px 20px;
        margin-bottom: 20px;
    }

    .progress-bar-container {
        background: #e0e0e0;
        border-radius: 10px;
        height: 12px;
        margin-top: 10px;
        overflow: hidden;
    }

    .progress-bar-fill {
        height: 100%;
        border-radius: 10px;
        transition: width 0.5s ease;
    }

    .action-card {
        background: white;
        border: 2px solid #e0e0e0;
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .action-card.completed {
        border-color: #4caf50;
        background: #e8f5e9;
    }

    .action-icon {
        font-size: 1.5em;
        margin-right: 15px;
    }

    .action-info {
        flex: 1;
    }

    .action-title {
        font-weight: bold;
        margin-bottom: 3px;
    }

    .action-xp {
        font-size: 0.85em;
        color: #666;
    }

    .action-status {
        font-size: 1.5em;
    }

    .treasure-item {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        background: #fff8e1;
        border: 1px solid #ffc107;
        border-radius: 8px;
        margin-bottom: 8px;
    }

    .treasure-item.collected {
        background: #e8f5e9;
        border-color: #4caf50;
    }

    .treasure-icon {
        font-size: 1.3em;
        margin-right: 12px;
    }

    .treasure-name {
        flex: 1;
        font-weight: 500;
    }

    .treasure-xp {
        color: #666;
        font-size: 0.9em;
    }
    </style>
    """


# ===============================================================
# MODAL RENDERING
# ===============================================================

def render_island_modal(island_id: str, user_id: str, is_preview: bool = False):
    """
    Rendert das komplette Insel-Modal.

    Args:
        island_id: Die ID der Insel
        user_id: Die User-ID
        is_preview: Ob Preview-Modus aktiv ist
    """
    island = ISLANDS.get(island_id)
    if not island:
        st.error(f"Insel '{island_id}' nicht gefunden.")
        return

    # CSS einbinden
    st.markdown(get_modal_css(), unsafe_allow_html=True)

    # Zurück-Button
    col1, col2, col3 = st.columns([1, 2, 1])
    with col3:
        if st.button("❌ Zurück zur Karte", key="close_island_modal", type="primary"):
            st.session_state.modal_island = None
            st.rerun()

    # Header
    color = island.get("color", "#667eea")
    st.markdown(f"""
    <div class="island-modal-header" style="background: linear-gradient(135deg, {color} 0%, {color}cc 100%); color: white;">
        <div style="font-size: 3em;">{island.get('icon', '🏝️')}</div>
        <h1>{island.get('name', 'Unbekannte Insel')}</h1>
        <p>{island.get('description', '')}</p>
    </div>
    """, unsafe_allow_html=True)

    # Je nach Insel-Typ unterschiedlichen Content zeigen
    island_type = island.get("type")

    if island_type == "welcome":
        _render_welcome_modal(island, user_id, is_preview)
    elif island_type == "finale":
        _render_finale_modal(island, user_id, is_preview)
    else:
        _render_standard_modal(island_id, island, user_id, is_preview)


def _render_welcome_modal(island: dict, user_id: str, is_preview: bool):
    """Rendert das Modal für den Starthafen."""
    content = island.get("content", {})

    # Begrüßungsvideo
    video_url = content.get("welcome_video_url", "")
    if video_url:
        st.subheader("🎬 Willkommensvideo")
        st.video(video_url)
    else:
        st.info("🎬 **Begrüßungsvideo** - Kommt bald!")

    # Gruppenchat
    if content.get("show_group_chat_link"):
        st.markdown("---")
        st.subheader("💬 Gruppenchat")
        st.markdown("""
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 20px; border-radius: 12px;">
            <p style="margin: 0;">
                Tritt unserem Gruppenchat bei und tausche dich mit anderen Lernenden aus!
            </p>
            <p style="margin: 10px 0 0 0; font-size: 0.9em; opacity: 0.7;">
                (Link wird hier eingefügt)
            </p>
        </div>
        """, unsafe_allow_html=True)

    # Schätze
    st.markdown("---")
    _render_treasures_section(island, "start", user_id, is_preview)


def _render_finale_modal(island: dict, user_id: str, is_preview: bool):
    """Rendert das Modal für den Berg der Meisterschaft."""
    content = island.get("content", {})

    # Gruppen-Event Hinweis
    if content.get("is_group_event"):
        st.success("🎉 **Gruppen-Event!** Diese Insel feiern wir gemeinsam!")

    # Reflexionsfragen
    questions = content.get("reflection_questions", [])
    if questions:
        st.subheader("📝 Reflexionsfragen")
        st.markdown("Nimm dir Zeit, über deine Lernreise nachzudenken:")

        for i, question in enumerate(questions, 1):
            st.markdown(f"""
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;
                        margin-bottom: 10px; border-left: 4px solid #ffd700;">
                <strong>{i}.</strong> {question}
            </div>
            """, unsafe_allow_html=True)

    # Schätze
    st.markdown("---")
    _render_treasures_section(island, "meister_berg", user_id, is_preview)


def _render_standard_modal(island_id: str, island: dict, user_id: str, is_preview: bool):
    """Rendert das Standard-Modal für normale Inseln."""

    # Fortschritt laden
    progress = get_island_progress(user_id, island_id)
    percentage = get_island_progress_percentage(user_id, island_id)
    color = island.get("color", "#667eea")

    # Content aus CONTENT_DATABASE holen
    content_key = ISLAND_CONTENT_MAP.get(island_id)
    content_data = CONTENT_DATABASE.get(content_key, {}) if content_key else {}

    # Fortschrittsanzeige
    st.markdown(f"""
    <div class="progress-section">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>📊 Dein Fortschritt</strong>
            <span style="color: {color}; font-weight: bold;">{percentage}%</span>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: {percentage}%; background: {color};"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Aktionen
    st.subheader("📚 Lernaktionen")

    # Video
    _render_video_action(
        island_id=island_id,
        user_id=user_id,
        is_preview=is_preview,
        progress=progress,
        content_data=content_data
    )

    # Erklärung
    _render_explanation_action(
        island_id=island_id,
        user_id=user_id,
        is_preview=is_preview,
        progress=progress,
        content_data=content_data
    )

    # Quiz
    _render_quiz_action(
        island_id=island_id,
        user_id=user_id,
        is_preview=is_preview,
        progress=progress
    )

    # Challenge
    _render_action_item(
        icon="🎯",
        title="Challenge abschließen",
        xp=XP_REWARDS["challenge_completed"],
        completed=progress["challenge_completed"],
        action_key=f"challenge_{island_id}",
        on_click=lambda: _handle_action(user_id, island_id, "challenge_completed", is_preview)
    )

    # Schätze
    st.markdown("---")
    _render_treasures_section(island, island_id, user_id, is_preview)


def _render_video_action(island_id: str, user_id: str, is_preview: bool, progress: dict, content_data: dict):
    """Rendert die Video-Aktion mit echtem Video-Content."""
    completed = progress["video_watched"]
    videos = content_data.get("videos", [])

    status = "✅" if completed else "⬜"
    completed_class = "completed" if completed else ""

    st.markdown(f"""
    <div class="action-card {completed_class}">
        <span class="action-icon">🎬</span>
        <div class="action-info">
            <div class="action-title">Video anschauen</div>
            <div class="action-xp">+{XP_REWARDS["video_watched"]} XP</div>
        </div>
        <span class="action-status">{status}</span>
    </div>
    """, unsafe_allow_html=True)

    # Video-Content in Expander
    if videos:
        with st.expander("🎬 Video ansehen", expanded=False):
            for video in videos:
                st.markdown(f"**{video.get('title', 'Video')}**")
                st.markdown(f"*{video.get('creator', '')}* ({video.get('duration_min', '?')} Min)")

                # Video einbetten
                video_url = video.get("url", "")
                if video_url and "youtube.com" in video_url:
                    st.video(video_url)
                elif video_url:
                    st.markdown(f"[Video ansehen]({video_url})")

                # Kernbotschaft
                if video.get("kernbotschaft"):
                    st.info(f"💡 **Kernbotschaft:** {video['kernbotschaft']}")

            # Erledigt-Button
            if not completed:
                if st.button("✅ Video geschaut - XP sammeln!", key=f"video_done_{island_id}"):
                    _handle_action(user_id, island_id, "video_watched", is_preview)
                    st.rerun()
    else:
        st.info("🎬 Video kommt bald!")
        if not completed:
            if st.button("Erledigt ✓", key=f"video_{island_id}", use_container_width=True):
                _handle_action(user_id, island_id, "video_watched", is_preview)
                st.rerun()


def _render_explanation_action(island_id: str, user_id: str, is_preview: bool, progress: dict, content_data: dict):
    """Rendert die Erklaerung-Aktion mit altersgerechtem Content."""
    completed = progress["explanation_read"]

    status = "✅" if completed else "⬜"
    completed_class = "completed" if completed else ""

    st.markdown(f"""
    <div class="action-card {completed_class}">
        <span class="action-icon">📖</span>
        <div class="action-info">
            <div class="action-title">Erklärung lesen</div>
            <div class="action-xp">+{XP_REWARDS["explanation_read"]} XP</div>
        </div>
        <span class="action-status">{status}</span>
    </div>
    """, unsafe_allow_html=True)

    # Content-Key fuer diese Insel holen
    content_key = ISLAND_CONTENT_MAP.get(island_id)

    # Altersstufe des Users holen (Schatzkarte: nur Grundschule/Unterstufe)
    age_group = st.session_state.get("current_user_age_group", "unterstufe")

    with st.expander("📖 Erklärung lesen", expanded=False):
        # Fuer MATHEFF (Festung der Staerke): Altersgerechten Content anzeigen
        if content_key == "MATHEFF" and HAS_MATHEFF_CONTENT:
            if age_group == "grundschule":
                render_matheff_grundschule()
            else:
                # Default: Unterstufe (fuer Schatzkarte)
                render_matheff_unterstufe()

        # Fuer andere Inseln: Fallback auf CONTENT_DATABASE
        elif content_data:
            # Intro-Text
            intro = content_data.get("intro_text", "")
            if intro:
                st.markdown(intro)
                st.markdown("---")

            # Tipps anzeigen
            tipps = content_data.get("tipps", [])
            if tipps:
                st.subheader("💡 Praktische Tipps")
                for tipp in tipps:
                    with st.expander(tipp.get("titel", "Tipp"), expanded=False):
                        st.markdown(tipp.get("beschreibung", ""))
                        if tipp.get("dauer"):
                            st.caption(f"⏱️ {tipp['dauer']}")

            # Wissenschaft anzeigen
            wissenschaft = content_data.get("wissenschaft", {})
            if wissenschaft:
                st.markdown("---")
                st.subheader("🔬 Wissenschaftlicher Hintergrund")
                if wissenschaft.get("hattie_d"):
                    st.metric("Hattie Effektstärke", wissenschaft["hattie_d"])
                if wissenschaft.get("erklaerung"):
                    st.markdown(wissenschaft["erklaerung"])
        else:
            st.info("📖 Erklärung kommt bald!")

        # Erledigt-Button (immer am Ende)
        st.markdown("---")
        if not completed:
            if st.button("✅ Erklärung gelesen - XP sammeln!", key=f"explanation_done_{island_id}"):
                _handle_action(user_id, island_id, "explanation_read", is_preview)
                st.rerun()
        else:
            st.success("✅ Bereits abgeschlossen!")


def _render_quiz_action(island_id: str, user_id: str, is_preview: bool, progress: dict):
    """Rendert die Quiz-Aktion mit echtem Quiz aus ISLAND_QUIZZES."""
    completed = progress["quiz_passed"]
    quiz_data = ISLAND_QUIZZES.get(island_id, {})

    status = "✅" if completed else "⬜"
    completed_class = "completed" if completed else ""

    st.markdown(f"""
    <div class="action-card {completed_class}">
        <span class="action-icon">❓</span>
        <div class="action-info">
            <div class="action-title">Quiz bestehen</div>
            <div class="action-xp">+{XP_REWARDS["quiz_passed"]} XP</div>
        </div>
        <span class="action-status">{status}</span>
    </div>
    """, unsafe_allow_html=True)

    if quiz_data and not completed:
        with st.expander("❓ Quiz starten", expanded=False):
            _render_quiz(island_id, user_id, is_preview, quiz_data)
    elif not quiz_data:
        st.info("❓ Quiz kommt bald!")
        if not completed:
            if st.button("Erledigt ✓", key=f"quiz_{island_id}", use_container_width=True):
                _handle_action(user_id, island_id, "quiz_passed", is_preview)
                st.rerun()


def _render_quiz(island_id: str, user_id: str, is_preview: bool, quiz_data: dict):
    """Rendert ein interaktives Quiz."""
    questions = quiz_data.get("questions", [])
    quiz_key = f"quiz_state_{island_id}"

    # Quiz-State initialisieren
    if quiz_key not in st.session_state:
        st.session_state[quiz_key] = {
            "current_question": 0,
            "correct_answers": 0,
            "answered": False
        }

    state = st.session_state[quiz_key]
    current_q = state["current_question"]

    if current_q < len(questions):
        q = questions[current_q]
        st.markdown(f"**Frage {current_q + 1} von {len(questions)}:**")
        st.markdown(f"### {q['question']}")

        # Antwortoptionen
        answer_key = f"answer_{island_id}_{current_q}"
        selected = st.radio(
            "Deine Antwort:",
            q["options"],
            key=answer_key,
            index=None
        )

        if selected and not state["answered"]:
            if st.button("Antwort prüfen", key=f"check_{island_id}_{current_q}"):
                correct_idx = q["correct"]
                if selected == q["options"][correct_idx]:
                    st.success("✅ Richtig!")
                    state["correct_answers"] += 1
                else:
                    st.error(f"❌ Leider falsch. Richtig wäre: {q['options'][correct_idx]}")

                if q.get("explanation"):
                    st.info(f"💡 {q['explanation']}")

                state["answered"] = True
                st.rerun()

        if state["answered"]:
            if st.button("Nächste Frage →", key=f"next_{island_id}_{current_q}"):
                state["current_question"] += 1
                state["answered"] = False
                st.rerun()
    else:
        # Quiz beendet
        total = len(questions)
        correct = state["correct_answers"]
        st.markdown(f"### Quiz beendet!")
        st.markdown(f"**Ergebnis:** {correct} von {total} richtig")

        if correct >= total * 0.5:  # Mind. 50% richtig
            st.success("🎉 Bestanden! Du erhältst deine XP!")
            if st.button("✅ XP sammeln!", key=f"quiz_complete_{island_id}"):
                _handle_action(user_id, island_id, "quiz_passed", is_preview)
                del st.session_state[quiz_key]
                st.rerun()
        else:
            st.warning("Noch nicht bestanden. Versuch es nochmal!")
            if st.button("🔄 Nochmal versuchen", key=f"quiz_retry_{island_id}"):
                del st.session_state[quiz_key]
                st.rerun()


def _render_action_item(icon: str, title: str, xp: int, completed: bool,
                        action_key: str, on_click):
    """Rendert eine einzelne Aktions-Karte."""
    status = "✅" if completed else "⬜"
    completed_class = "completed" if completed else ""

    col1, col2 = st.columns([4, 1])

    with col1:
        st.markdown(f"""
        <div class="action-card {completed_class}">
            <span class="action-icon">{icon}</span>
            <div class="action-info">
                <div class="action-title">{title}</div>
                <div class="action-xp">+{xp} XP</div>
            </div>
            <span class="action-status">{status}</span>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        if not completed:
            if st.button("Erledigt ✓", key=action_key, use_container_width=True):
                on_click()
                st.rerun()


def _handle_action(user_id: str, island_id: str, action: str, is_preview: bool):
    """Behandelt eine Aktions-Markierung."""
    if is_preview:
        # Im Preview-Modus nur Session State
        if "preview_progress" not in st.session_state:
            st.session_state.preview_progress = {}
        if island_id not in st.session_state.preview_progress:
            st.session_state.preview_progress[island_id] = {}
        st.session_state.preview_progress[island_id][action] = True
        st.toast(f"✅ +{XP_REWARDS.get(action, 0)} XP (Preview)")
    else:
        # Echte Speicherung
        xp = complete_island_action(user_id, island_id, action)
        if xp > 0:
            st.toast(f"✅ +{xp} XP verdient!")
            st.session_state.user_xp = st.session_state.get("user_xp", 0) + xp


def _render_treasures_section(island: dict, island_id: str, user_id: str, is_preview: bool):
    """Rendert die Schätze-Sektion."""
    treasures = island.get("treasures", [])
    if not treasures:
        return

    st.subheader("💎 Schätze")

    for treasure in treasures:
        treasure_id = treasure.get("id", "")
        treasure_key = f"{island_id}_{treasure_id}"

        # Prüfe ob gesammelt
        if is_preview:
            collected = treasure_key in st.session_state.get("collected_treasures", set())
        else:
            collected = is_treasure_collected(user_id, island_id, treasure_id)

        collected_class = "collected" if collected else ""
        status = "✅" if collected else ""

        col1, col2 = st.columns([4, 1])

        with col1:
            st.markdown(f"""
            <div class="treasure-item {collected_class}">
                <span class="treasure-icon">💎</span>
                <span class="treasure-name">{treasure.get('name', 'Unbekannter Schatz')}</span>
                <span class="treasure-xp">+{treasure.get('xp', 0)} XP {status}</span>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            if not collected:
                if st.button("Sammeln", key=f"collect_{treasure_key}", use_container_width=True):
                    xp = treasure.get('xp', 50)
                    if is_preview:
                        st.session_state.collected_treasures.add(treasure_key)
                        st.session_state.user_xp = st.session_state.get("user_xp", 0) + xp
                        st.toast(f"💎 +{xp} XP (Preview)")
                    else:
                        save_treasure_collected(user_id, island_id, treasure_id, xp)
                        st.session_state.collected_treasures.add(treasure_key)
                        st.session_state.user_xp = st.session_state.get("user_xp", 0) + xp
                        st.toast(f"💎 Schatz gesammelt! +{xp} XP")
                    st.rerun()
