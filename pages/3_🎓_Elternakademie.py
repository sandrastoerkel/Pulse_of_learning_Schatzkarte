"""
Elternakademie

Evidenzbasierte Erfassung elterlicher Unterstützung und familiärer Lernumgebung.
Direkt anschlussfähig an Hatties Feedback-Forschung und interventionsfähig.

Skalen-Gruppen:
1. Direkte Elternunterstützung (EMOSUPS, PARINVOL, SUCHOME)
2. Familiäre Lernumgebung (HEDRES, ICTRES, CULTPOSS)
3. Eltern-Kind-Interaktionsmuster (CURSUPP, PERFEED)
"""

import streamlit as st

st.set_page_config(
    page_title="Eltern-Unterstützungs-Diagnostik",
    page_icon="🎓",
    layout="wide"
)

from utils.feature_flags import ENABLE_PISA
if not ENABLE_PISA:
    st.info("PISA-Analyse ist derzeit deaktiviert. Aktiviere ENABLE_PISA in utils/feature_flags.py")
    st.stop()

import pandas as pd
import json
from datetime import datetime
from pathlib import Path
import sys
sys.path.append('..')

from utils.coaching_db import (
    get_all_students, search_students, get_student_by_id,
    save_assessment, get_student_summary, create_student
)
from utils.scale_info import get_scale_info
from utils.questionnaire_builder import (
    load_items_for_scales, group_items_by_scale, estimate_questionnaire_duration
)
from utils.german_labels import add_german_labels_to_value_labels

# ============================================
# ELTERN-UNTERSTÜTZUNGS CONFIGURATION
# ============================================

# Kategorisierung der Skalen
PARENT_SUPPORT_CATEGORIES = {
    'Direkte Elternunterstützung': {
        'scales': ['EMOSUPS', 'PARINVOL', 'SUCHOME'],
        'description': 'Emotionale Unterstützung, Schulbeteiligung und Lernhilfe zu Hause',
        'icon': '💝',
        'duration_estimate': 10
    },
    'Familiäre Lernumgebung': {
        'scales': ['HEDRES', 'ICTRES', 'CULTPOSS'],
        'description': 'Bildungsressourcen, digitale Ausstattung und kulturelle Güter',
        'icon': '🏠',
        'duration_estimate': 8
    },
    'Eltern-Kind-Interaktionsmuster': {
        'scales': ['CURSUPP', 'PERFEED'],
        'description': 'Förderung von Neugier und Qualität des elterlichen Feedbacks',
        'icon': '💬',
        'duration_estimate': 7
    }
}

# Skalen-Details
SCALE_DETAILS = {
    'EMOSUPS': {
        'name': 'Emotionale Unterstützung',
        'description': 'Interesse der Eltern, emotionale Verfügbarkeit, Ermutigung',
        'interventions': {
            'low': '⚠️ Beziehungsarbeit: Elterncoaching zu aktivem Zuhören, "Präsent sein", regelmäßige Gespräche über Schule',
            'medium': '✓ Weiter festigen: Interesse zeigen, nachfragen, emotionale Verfügbarkeit aufrechterhalten',
            'high': '✓ Ressource nutzen: Starke emotionale Basis für Lernunterstützung nutzen'
        },
        'warning': None
    },
    'PARINVOL': {
        'name': 'Schulbeteiligung',
        'description': 'Teilnahme an Elternabenden und Schulaktivitäten',
        'interventions': {
            'low': '💡 Niedrigschwellige Angebote: Kurze Gespräche, digitale Formate, flexible Termine',
            'medium': '✓ Engagement erhalten: Regelmäßige Information, Einbindung in Schulprojekte',
            'high': '✓ Multiplikator-Rolle: Als Vermittler zu anderen Eltern, Mitgestaltung'
        },
        'warning': None
    },
    'SUCHOME': {
        'name': 'Lernunterstützung zu Hause',
        'description': 'Konkrete Unterstützung beim Lernen und bei Hausaufgaben',
        'interventions': {
            'low': '💡 Qualität vor Quantität: Weg vom "Erklären", hin zum "Fragen stellen" (Hattie!)',
            'medium': '⚠️ Qualität prüfen: Viel Hilfe ≠ gute Hilfe! Art der Unterstützung reflektieren',
            'high': '⚠️ VORSICHT: Kann kontraproduktiv sein! Prüfen: Überbehütung? Autonomie des Kindes?'
        },
        'warning': '⚠️ WICHTIG: Hohe Werte können auch problematisch sein! Oft ist weniger, aber qualitativ bessere Unterstützung wirksamer.'
    },
    'HEDRES': {
        'name': 'Bildungsressourcen zu Hause',
        'description': 'Schreibtisch, ruhiger Lernplatz, Bücher, Nachschlagewerke',
        'interventions': {
            'low': '🛠️ Praktische Hilfe: Lernplatz einrichten, Grundausstattung beschaffen (ggf. Unterstützung vermitteln)',
            'medium': '✓ Optimieren: Lernumgebung verbessern, Ablenkungen reduzieren',
            'high': '✓ Gut ausgestattet: Ressourcen gezielt für Lernprojekte nutzen'
        },
        'warning': None
    },
    'ICTRES': {
        'name': 'Digitale Ausstattung',
        'description': 'Computer, Internet, Software für Lernen',
        'interventions': {
            'low': '🛠️ Digitale Grundausstattung: Zugang zu Geräten ermöglichen, ggf. Schulgeräte/Förderung',
            'medium': '💡 Medienkompetenz: Sinnvolle Nutzung digitaler Ressourcen für Lernen',
            'high': '✓ Digital kompetent: Fortgeschrittene Lerntools und Plattformen nutzen'
        },
        'warning': None
    },
    'CULTPOSS': {
        'name': 'Kulturelle Güter',
        'description': 'Klassische Literatur, Kunstwerke, Musikinstrumente',
        'interventions': {
            'low': '💡 Kulturelle Teilhabe: Bibliotheksausweis, Museumsbesuche, Musik hören/machen',
            'medium': '✓ Erweitern: Vielfältige kulturelle Erfahrungen ermöglichen',
            'high': '✓ Musikbildung: Besonders relevant für musikalische Förderung! Instrumente aktiv nutzen'
        },
        'warning': '🎵 Für Musikbildungsforschung besonders relevant!'
    },
    'CURSUPP': {
        'name': 'Förderung von Neugier',
        'description': 'Ermutigung zu Fragen, Interesse an Neuem, Wissbegierde unterstützen',
        'interventions': {
            'low': '💡 Fragen willkommen heißen: "Ich weiß nicht" ist ok, gemeinsam erforschen, Neugier belohnen',
            'medium': '✓ Verstärken: Aktiv Fragen anregen, Entdeckungen gemeinsam machen',
            'high': '✓ Intrinsische Motivation: Kind als selbstständiger Forscher, eigenständige Projekte'
        },
        'warning': '🔬 Sehr interventionsfähig durch Elternbildung! Direkte Auswirkung auf Lernmotivation.'
    },
    'PERFEED': {
        'name': 'Qualität des Eltern-Feedbacks',
        'description': 'Art und Qualität der elterlichen Rückmeldungen',
        'interventions': {
            'low': '⚠️ Feedback-Training: PROZESSBEZOGEN statt personenbezogen (Hattie!). "Du hast dich angestrengt" statt "Du bist schlau"',
            'medium': '💡 Qualität steigern: Spezifisches, konstruktives Feedback, auf Lernprozess fokussieren',
            'high': '✓ Wirksames Feedback: Hatties Prinzipien werden umgesetzt, weiter verfeinern'
        },
        'warning': '🎯 Direkt anschlussfähig an Hatties Feedback-Forschung! Kann Lehrkraft-Feedback verstärken oder konterkarieren.'
    }
}

# Diagnostik-Kombinationen für gezielte Elternberatung
DIAGNOSTIC_COMBINATIONS = {
    'Emotionale Basis prüfen': {
        'scales': ['EMOSUPS', 'PERFEED'],
        'rationale': 'Ist emotionale Grundlage vorhanden? Wie wird Feedback gegeben?',
        'intervention_focus': 'Beziehungsarbeit und Feedback-Qualität'
    },
    'Lernunterstützung optimieren': {
        'scales': ['SUCHOME', 'PERFEED', 'MATHEFF'],
        'rationale': 'Wie wird konkret unterstützt? Wirkt die Unterstützung? (Über MATHEFF des Kindes prüfbar)',
        'intervention_focus': 'Qualität statt Quantität der Unterstützung'
    },
    'Lernumgebung gestalten': {
        'scales': ['HEDRES', 'ICTRES', 'CURSUPP'],
        'rationale': 'Sind Ressourcen vorhanden? Wird Neugier gefördert?',
        'intervention_focus': 'Praktische Interventionen + Neugier fördern'
    },
    'Schule-Eltern-Partnerschaft': {
        'scales': ['PARINVOL', 'EMOSUPS'],
        'rationale': 'Engagement-Level der Eltern und emotionale Unterstützung',
        'intervention_focus': 'Brücke zwischen Schule und Elternhaus'
    }
}

# ============================================
# HEADER
# ============================================

st.title("🎓 Elternakademie")

# ============================================
# ANKÜNDIGUNG: ELTERN-WORKSHOP
# ============================================

st.markdown("""
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
    <h3 style="margin: 0 0 15px 0;">🎉 Bald verfügbar: Eltern-Workshop „Wirksames Feedback"</h3>
    <p style="margin: 0 0 15px 0; font-size: 1.1em;">
        <strong>Wichtig vorab:</strong> Alles, was Sie als Eltern für Ihr Kind tun, hilft ihm – Sie sind immer hilfreich! 💪
    </p>
    <p style="margin: 0 0 15px 0;">
        In diesem Workshop geht es darum, wie Sie Ihr Kind nach wissenschaftlichen Erkenntnissen
        <em>noch gezielter</em> unterstützen können.
    </p>
    <p style="margin: 0; opacity: 0.9;">
        <strong>Was Sie lernen werden:</strong><br>
        ✓ Die 4 Feedback-Typen nach Hattie (was wirkt am besten?)<br>
        ✓ Prozess-Lob vs. Personen-Lob (kleiner Unterschied, große Wirkung)<br>
        ✓ Konkrete Satzbausteine für den Alltag<br>
        ✓ Wie Sie mit Ihrem Kind über Schule sprechen können
    </p>
</div>
""", unsafe_allow_html=True)

st.markdown("""
### Evidenzbasierte Erfassung elterlicher Unterstützung

Erfasst **acht Dimensionen** elterlicher Unterstützung und familiärer Lernumgebung,
die direkt interventionsfähig sind und an **Hatties Feedback-Forschung** anschlussfähig.

**Besonderheit:** Diese Diagnostik zeigt nicht nur WO Eltern ansetzen müssen,
sondern ermöglicht durch Kombination mit YouTube-Analysen auch konkrete Anleitung WIE sie es umsetzen können.
""")

# ============================================
# SCALE CATEGORIES OVERVIEW
# ============================================

st.markdown("---")
st.subheader("📊 Skalen-Übersicht")

cols = st.columns(3)
for idx, (category_name, category_info) in enumerate(PARENT_SUPPORT_CATEGORIES.items()):
    with cols[idx]:
        st.markdown(f"### {category_info['icon']} {category_name}")
        st.markdown(f"*{category_info['description']}*")
        st.markdown(f"**Dauer:** ~{category_info['duration_estimate']} Min")

        for scale in category_info['scales']:
            scale_details = SCALE_DETAILS.get(scale, {})
            with st.expander(f"📋 {scale_details.get('name', scale)}"):
                st.markdown(f"**{scale_details.get('description', 'Keine Beschreibung')}**")

                if scale_details.get('warning'):
                    st.warning(scale_details['warning'])

                st.markdown("**Interventionen:**")
                for level, intervention in scale_details.get('interventions', {}).items():
                    st.markdown(f"- **{level.upper()}:** {intervention}")

# ============================================
# DIAGNOSTIC COMBINATIONS
# ============================================

st.markdown("---")
st.subheader("🎯 Diagnostik-Kombinationen für Elternberatung")

st.markdown("""
Kombinationen von Skalen für gezielte Interventionsplanung:
""")

cols = st.columns(2)
for idx, (combo_name, combo_info) in enumerate(DIAGNOSTIC_COMBINATIONS.items()):
    with cols[idx % 2]:
        with st.expander(f"💡 {combo_name}"):
            st.markdown(f"**Skalen:** {', '.join(combo_info['scales'])}")
            st.markdown(f"**Rationale:** {combo_info['rationale']}")
            st.markdown(f"**Interventionsfokus:** {combo_info['intervention_focus']}")

# ============================================
# STUDENT SELECTION
# ============================================

st.markdown("---")
st.subheader("👤 Schüler auswählen")

# Student search/selection
col1, col2 = st.columns([3, 1])

with col1:
    search_term = st.text_input(
        "Schüler suchen",
        placeholder="Name, Vorname, Klasse oder Schüler-Code...",
        help="Suche nach Name, Klasse oder Schüler-Code"
    )

with col2:
    if st.button("➕ Neuer Schüler", use_container_width=True):
        st.session_state.show_create_student = True

# Show create student form if requested
if st.session_state.get('show_create_student', False):
    with st.form("create_student_form"):
        st.subheader("Neuen Schüler anlegen")

        student_code = st.text_input("Schüler-Code / Pseudonym*",
                                      help="DSGVO-konformer Code (z.B. S001, Max_M_2024)")
        class_name = st.text_input("Klasse (optional)", placeholder="z.B. 8a, 10b")
        school_year = st.text_input("Schuljahr (optional)", placeholder="z.B. 2024/2025")
        notes = st.text_area("Notizen (optional)", placeholder="Zusätzliche Informationen...")

        col1, col2 = st.columns(2)
        with col1:
            submitted = st.form_submit_button("Schüler anlegen", type="primary")
        with col2:
            cancelled = st.form_submit_button("Abbrechen")

        if submitted:
            if student_code:
                try:
                    student_id = create_student(
                        student_code=student_code,
                        class_name=class_name if class_name else None,
                        school_year=school_year if school_year else None,
                        notes=notes if notes else None
                    )
                    st.success(f"✅ Schüler '{student_code}' erfolgreich angelegt!")
                    st.session_state.selected_student_id = student_id
                    st.session_state.show_create_student = False
                    st.rerun()
                except Exception as e:
                    st.error(f"Fehler beim Anlegen: {e}")
            else:
                st.error("Bitte Schüler-Code eingeben!")

        if cancelled:
            st.session_state.show_create_student = False
            st.rerun()

# Get students based on search
if search_term:
    students = search_students(search_term)
else:
    students = get_all_students()

if not students.empty:
    # Display students as selectable cards
    st.markdown("#### Verfügbare Schüler")

    for idx, student in students.iterrows():
        col1, col2 = st.columns([3, 1])

        with col1:
            st.markdown(f"**{student['student_code']}**")
            st.caption(f"Klasse: {student['class'] or 'N/A'}")
        with col2:
            if st.button("Auswählen", key=f"select_{student['id']}", use_container_width=True):
                st.session_state.selected_student_id = student['id']
                st.rerun()
else:
    st.info("Keine Schüler gefunden. Legen Sie einen neuen Schüler an.")

# ============================================
# ASSESSMENT INTERFACE
# ============================================

if st.session_state.get('selected_student_id'):
    student = get_student_by_id(st.session_state.selected_student_id)

    st.markdown("---")
    st.subheader(f"📋 Eltern-Diagnostik für {student['student_code']}")

    # Show student info
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Schüler-Code", student['student_code'])
    with col2:
        st.metric("Klasse", student['class'] or 'N/A')

    # Scale selection
    st.markdown("### 📝 Skalen auswählen")

    st.info("💡 **Tipp:** Wählen Sie eine Diagnostik-Kombination oder einzelne Skalen für gezielte Fragestellungen.")

    # Quick selection: Diagnostic combinations
    st.markdown("#### Schnellauswahl: Diagnostik-Kombinationen")
    combo_cols = st.columns(4)

    all_scales = []
    for category in PARENT_SUPPORT_CATEGORIES.values():
        all_scales.extend(category['scales'])

    for idx, (combo_name, combo_info) in enumerate(DIAGNOSTIC_COMBINATIONS.items()):
        with combo_cols[idx]:
            if st.button(f"💡 {combo_name}", use_container_width=True):
                # Filter out MATHEFF if it's in the combination (child scale, not parent)
                st.session_state.selected_scales = [s for s in combo_info['scales'] if s in all_scales]
                st.rerun()

    # Manual selection by category
    st.markdown("#### Manuelle Auswahl nach Kategorien")

    if 'selected_scales' not in st.session_state:
        st.session_state.selected_scales = []

    for category_name, category_info in PARENT_SUPPORT_CATEGORIES.items():
        with st.expander(f"{category_info['icon']} {category_name}"):
            for scale in category_info['scales']:
                scale_details = SCALE_DETAILS.get(scale, {})
                is_selected = scale in st.session_state.selected_scales

                if st.checkbox(
                    f"{scale_details.get('name', scale)} ({scale})",
                    value=is_selected,
                    key=f"checkbox_{scale}"
                ):
                    if scale not in st.session_state.selected_scales:
                        st.session_state.selected_scales.append(scale)
                else:
                    if scale in st.session_state.selected_scales:
                        st.session_state.selected_scales.remove(scale)

                if scale_details.get('warning'):
                    st.caption(scale_details['warning'])

    # Show selected scales and duration
    if st.session_state.selected_scales:
        st.markdown("---")
        st.markdown("### ✅ Ausgewählte Skalen")

        col1, col2 = st.columns([3, 1])

        with col1:
            for scale in st.session_state.selected_scales:
                scale_details = SCALE_DETAILS.get(scale, {})
                st.markdown(f"- **{scale_details.get('name', scale)}** ({scale})")

        with col2:
            # Estimate duration
            try:
                items, _, _ = load_items_for_scales(st.session_state.selected_scales)
                duration = estimate_questionnaire_duration(items)
                st.metric("Geschätzte Dauer", f"{duration} Min")
            except Exception as e:
                st.warning(f"Konnte Dauer nicht schätzen: {e}")

        # Generate questionnaire button
        if st.button("📄 Fragebogen generieren", type="primary", use_container_width=True):
            try:
                # Load items and labels
                items, value_labels, fragestamm = load_items_for_scales(st.session_state.selected_scales)

                # Apply German labels
                value_labels = add_german_labels_to_value_labels(value_labels, items)

                # Store in session state for questionnaire display
                st.session_state.questionnaire_items = items
                st.session_state.questionnaire_value_labels = value_labels
                st.session_state.questionnaire_fragestamm = fragestamm
                st.session_state.show_questionnaire = True

                st.success("✅ Fragebogen wurde generiert!")
                st.rerun()

            except Exception as e:
                st.error(f"Fehler beim Generieren des Fragebogens: {e}")
    else:
        st.info("Bitte wählen Sie mindestens eine Skala aus.")

# ============================================
# QUESTIONNAIRE DISPLAY
# ============================================

if st.session_state.get('show_questionnaire', False):
    st.markdown("---")
    st.subheader("📄 Fragebogen")

    st.info("""
    **Hinweis für Eltern:**
    - Beantworten Sie die Fragen ehrlich und aus Ihrer Perspektive
    - Es gibt keine "richtigen" oder "falschen" Antworten
    - Die Ergebnisse dienen der bestmöglichen Unterstützung Ihres Kindes
    """)

    # Get items and labels from session state
    items = st.session_state.questionnaire_items
    value_labels = st.session_state.questionnaire_value_labels
    fragestamm = st.session_state.questionnaire_fragestamm

    # Deduplicate items
    seen_variables = set()
    unique_items = []
    for item in items:
        var_name = item['variable_name']
        if var_name not in seen_variables:
            seen_variables.add(var_name)
            unique_items.append(item)

    # Group by scale
    grouped_items = group_items_by_scale(unique_items)

    # Initialize responses
    if 'eltern_responses' not in st.session_state:
        st.session_state.eltern_responses = {}

    # Display questionnaire
    for scale_name, scale_items in grouped_items.items():
        st.subheader(f"📊 {get_scale_info(scale_name)['name_de']}")

        if scale_name in fragestamm:
            st.markdown(f"*{fragestamm[scale_name]}*")

        st.write("")

        for item in scale_items:
            variable_name = item['variable_name']
            question_text = item.get('question_text_de', item.get('question_text_en', 'Keine Frage'))

            if variable_name in value_labels:
                labels_df = value_labels[variable_name]

                # Filter missing codes
                def is_valid_value(val):
                    val_str = str(val)
                    return not (val_str.startswith('.') or val_str == 'SYSTEM MISSING')

                valid_labels = labels_df[labels_df['value'].apply(is_valid_value)].copy()

                options = []
                option_values = []
                for idx, row in valid_labels.iterrows():
                    value = row['value']
                    label = row.get('label_de')
                    if label is None or label == '' or label == 'None':
                        label = row.get('label')
                    if label is None or label == '' or label == 'None':
                        label = f'Option {value}'

                    options.append(label)
                    option_values.append(value)

                # Display question with horizontal radio buttons
                st.markdown(f"**{question_text}**")

                response = st.radio(
                    label="Antwort",
                    options=options,
                    key=f"eltern_q_{variable_name}",
                    horizontal=True,
                    label_visibility="collapsed",
                    index=None
                )

                if response:
                    response_value = option_values[options.index(response)]
                    st.session_state.eltern_responses[variable_name] = response_value

                st.markdown("---")

    # Buttons
    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        if st.button("💾 Speichern"):
            if st.session_state.eltern_responses:
                st.success(f"✅ {len(st.session_state.eltern_responses)} Antworten gespeichert!")
            else:
                st.warning("Bitte beantworten Sie mindestens eine Frage.")

    with col2:
        if st.button("🔙 Zurück zur Skalenauswahl"):
            st.session_state.show_questionnaire = False
            st.rerun()

# ============================================
# HATTIE CONNECTION
# ============================================

st.markdown("---")
st.subheader("🎓 Verbindung zu Hatties Forschung")

st.markdown("""
### Eltern-Feedback → Lernerfolg

**Hatties Kernerkenntnisse** aus "Visible Learning":

1. **Feedback-Qualität** (d = 0.73): Prozessbezogenes Feedback ist wirksamer als personenbezogenes
   - ✅ "Du hast verschiedene Strategien ausprobiert"
   - ❌ "Du bist schlau"

2. **Elterliches Engagement** (d = 0.49): Wirksam wenn qualitativ hochwertig
   - ✅ Interesse zeigen, nachfragen, ermutigen
   - ❌ Überbehütung, zu viel direkte Hilfe

3. **Home Environment** (d = 0.52): Strukturierte Lernumgebung unterstützt
   - ✅ Ruhiger Lernplatz, Ressourcen verfügbar
   - ❌ Viele Ressourcen allein garantieren nicht Erfolg

### Von PISA-Diagnostik zu konkreten Eltern-Interventionen

Diese Skalen zeigen **WO** Eltern ansetzen müssen.
Ihre **YouTube-Analyse** zeigt **WIE** sie es konkret umsetzen können:

- **PERFEED niedrig** → YouTube-Training: "Wie gebe ich wirksames Feedback?"
- **CURSUPP niedrig** → YouTube-Training: "Neugier fördern ohne zu drängen"
- **SUCHOME problematisch** → YouTube-Training: "Weniger helfen, besser begleiten"
""")

# ============================================
# FOOTER
# ============================================

st.markdown("---")
st.caption("""
📚 Basierend auf PISA 2022 Daten und John Hatties "Visible Learning" (2009, 2023)
🎯 Eltern-Unterstützung ist mit d = 0.49 (mittlere Effektstärke) nachweislich wirksam
⚠️ Entscheidend ist die QUALITÄT der Unterstützung, nicht nur die Quantität
""")
