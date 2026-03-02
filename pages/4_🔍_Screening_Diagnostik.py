"""
Screening-Diagnostik: Evidenzbasierte Schnell-Diagnostik

Zweistufiges Screening-System:
1. Stufe 1 (10 Min): Kern-Diagnostik mit Top-3-Prädiktoren
2. Stufe 2 (15 Min): Vertiefung je nach Screening-Ergebnis

Basierend auf XGBoost-Analyse und Interventionsfähigkeit
"""

import streamlit as st

st.set_page_config(
    page_title="Screening-Diagnostik",
    page_icon="🔍",
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
from utils.scale_info import SCALE_CATEGORIES, get_scale_info
from utils.questionnaire_builder import (
    load_items_for_scales, group_items_by_scale, estimate_questionnaire_duration
)
from utils.grade_specific_items import (
    extract_grade_from_class, adapt_matheff_for_grade
)
from utils.german_labels import add_german_labels_to_value_labels

# ============================================
# SCREENING CONFIGURATION
# ============================================

# Stufe 1: Schnell-Screening (15 Min)
SCREENING_LEVEL_1 = {
    'name': 'Schnell-Screening',
    'duration': 15,
    'scales': ['MATHEFF', 'ANXMAT', 'PERSEVAGR', 'GENEFF'],
    'description': 'Kern-Diagnostik: PISA-Skalen (MATHEFF, ANXMAT, PERSEVAGR) + Allgemeine Selbstwirksamkeit (GENEFF)'
}

# Stufe 2: Vertiefung (zusätzlich 15 Min)
SCREENING_LEVEL_2 = {
    'name': 'Vertiefungs-Diagnostik',
    'duration': 15,
    'scales': ['GROSAGR', 'TEACHSUP', 'BELONG', 'MATHPERS'],
    'description': 'Lernstrategien und Schulkontext-Faktoren für gezielte Interventionen'
}

# Interventions-Mapping
INTERVENTION_MAPPING = {
    'MATHEFF': {
        'low': 'Erfolgserlebnisse schaffen, Scaffolding, schrittweiser Aufbau',
        'medium': 'Herausfordernde Aufgaben mit Unterstützung',
        'high': 'Komplexe Problemstellungen, Peer-Teaching'
    },
    'ANXMAT': {
        'low': 'Weiterhin positive Lernatmosphäre',
        'medium': 'Entspannungstechniken, positive Verstärkung',
        'high': 'Systematisches Angst-Management, therapeutische Unterstützung'
    },
    'PERSEVAGR': {
        'low': 'Growth-Mindset-Training, kleine erreichbare Ziele',
        'medium': 'Strategien zur Selbstmotivation',
        'high': 'Langfristige Projekte, Mentoring-Rolle'
    },
    'GENEFF': {
        'low': 'Erfolgserlebnisse in verschiedenen Fächern, positive Verstärkung',
        'medium': 'Selbstreflexion über Stärken, Kompetenzerleben fördern',
        'high': 'Verantwortungsvolle Aufgaben, Selbstständigkeit fördern'
    },
    'GROSAGR': {
        'low': 'Explizites Growth-Mindset-Training',
        'medium': 'Reflexion über Lernprozesse',
        'high': 'Eigenverantwortliches Lernen fördern'
    },
    'TEACHSUP': {
        'low': 'Beziehungsarbeit intensivieren, 1:1-Gespräche',
        'medium': 'Feedback-Kultur stärken',
        'high': 'Autonomie und Eigenverantwortung fördern'
    },
    'BELONG': {
        'low': 'Peer-Learning, Gruppenarbeit, soziale Integration',
        'medium': 'Klassengemeinschaft stärken',
        'high': 'Leadership-Rollen anbieten'
    },
    'MATHPERS': {
        'low': 'Anstrengungsbereitschaft durch Erfolgserlebnisse',
        'medium': 'Strategien zur Problemlösung vermitteln',
        'high': 'Komplexe mathematische Projekte'
    }
}

# ============================================
# SESSION STATE
# ============================================

if 'screening_student_id' not in st.session_state:
    st.session_state.screening_student_id = None

if 'screening_level' not in st.session_state:
    st.session_state.screening_level = 1  # Start with level 1

if 'screening_responses' not in st.session_state:
    st.session_state.screening_responses = {}

if 'show_screening_form' not in st.session_state:
    st.session_state.show_screening_form = False

if 'additional_scales_level1' not in st.session_state:
    st.session_state.additional_scales_level1 = []

if 'additional_scales_level2' not in st.session_state:
    st.session_state.additional_scales_level2 = []

# ============================================
# SIDEBAR: STUDENT SELECTION/CREATION
# ============================================

st.sidebar.header("👨‍🎓 Schüler-Auswahl")

# Tab 1: Existing students
# Tab 2: New student
student_tab1, student_tab2 = st.sidebar.tabs(["Bestehend", "Neu anlegen"])

with student_tab1:
    st.markdown("**Schüler suchen:**")
    search_term = st.text_input("Suchbegriff (Code/Klasse)", key="sidebar_search_student", label_visibility="collapsed")

    if search_term:
        students_df = search_students(search_term)
    else:
        students_df = get_all_students(active_only=True)

    if not students_df.empty:
        # Format for display
        students_df['created_date_short'] = pd.to_datetime(students_df['created_date']).dt.strftime('%d.%m.%Y')

        # Create selection
        for idx, row in students_df.iterrows():
            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown(f"**{row['student_code']}**")
                st.caption(f"Klasse: {row['class'] or 'N/A'} | Erstellt: {row['created_date_short']}")
            with col2:
                if st.button("Wählen", key=f"sidebar_select_{row['id']}"):
                    st.session_state.screening_student_id = row['id']
                    st.session_state.screening_level = 1
                    st.session_state.screening_responses = {}
                    st.session_state.show_screening_form = False
                    st.rerun()
    else:
        st.info("Keine Schüler gefunden")

with student_tab2:
    st.markdown("**Neuen Schüler anlegen:**")

    with st.form("new_student_form_screening"):
        new_code = st.text_input(
            "Pseudonym/Code*",
            help="DSGVO-konform: Verwenden Sie ein Pseudonym (z.B. 'S001', 'Max_M')"
        )
        new_class = st.text_input("Klasse (optional)", placeholder="z.B. 7a")
        new_year = st.text_input("Schuljahr (optional)", placeholder="z.B. 2024/2025")
        new_notes = st.text_area("Notizen (optional)", placeholder="Zusätzliche Informationen...")

        submitted = st.form_submit_button("➕ Schüler anlegen", type="primary")

        if submitted:
            if not new_code:
                st.error("Bitte Pseudonym/Code eingeben!")
            else:
                try:
                    student_id = create_student(
                        student_code=new_code,
                        class_name=new_class if new_class else None,
                        school_year=new_year if new_year else None,
                        notes=new_notes if new_notes else None
                    )
                    st.success(f"✅ Schüler '{new_code}' erfolgreich angelegt!")
                    st.session_state.screening_student_id = student_id
                    st.session_state.screening_level = 1
                    st.session_state.screening_responses = {}
                    st.session_state.show_screening_form = False
                    st.rerun()
                except Exception as e:
                    st.error(f"Fehler beim Anlegen: {str(e)}")

# ============================================
# TITLE
# ============================================

st.title("🔍 Screening-Diagnostik")
st.markdown("**Evidenzbasiertes Zweistufen-Screening für gezielte Interventionen**")
st.divider()

# ============================================
# INFO BOX
# ============================================

col1, col2 = st.columns(2)

with col1:
    st.info(f"""
    **📊 Stufe 1: Schnell-Screening ({SCREENING_LEVEL_1['duration']} Min)**

    Basierend auf XGBoost Top-Prädiktoren:
    - {get_scale_info('MATHEFF')['name_de']}
    - {get_scale_info('ANXMAT')['name_de']}
    - {get_scale_info('PERSEVAGR')['name_de']}

    → Schnelle Identifikation von Interventionsbedarf
    """)

with col2:
    st.info(f"""
    **🎯 Stufe 2: Vertiefung (+{SCREENING_LEVEL_2['duration']} Min)**

    Lernstrategien & Schulkontext:
    - {get_scale_info('GROSAGR')['name_de']}
    - {get_scale_info('TEACHSUP')['name_de']}
    - {get_scale_info('BELONG')['name_de']}
    - {get_scale_info('MATHPERS')['name_de']}

    → Gezielte Interventionszuordnung
    """)

# ============================================
# SCREENING WORKFLOW
# ============================================

if st.session_state.screening_student_id:
    student = get_student_by_id(st.session_state.screening_student_id)

    st.success(f"✅ **Ausgewählter Schüler:** {student['student_code']} | Klasse: {student['class'] or 'N/A'}")

    # Tabs for screening levels
    tab1, tab2, tab3 = st.tabs([
        f"📊 Stufe 1: Schnell-Screening ({SCREENING_LEVEL_1['duration']} Min)",
        f"🎯 Stufe 2: Vertiefung (+{SCREENING_LEVEL_2['duration']} Min)",
        "📋 Ergebnisse & Interventionen"
    ])

    # ============================================
    # TAB 1: LEVEL 1 SCREENING
    # ============================================

    with tab1:
        st.markdown(f"**{SCREENING_LEVEL_1['description']}**")
        st.write("")

        # Dynamische Spaltenanzahl basierend auf Anzahl der Skalen
        num_scales = len(SCREENING_LEVEL_1['scales'])
        cols = st.columns(num_scales)

        for idx, scale in enumerate(SCREENING_LEVEL_1['scales']):
            with cols[idx]:
                info = get_scale_info(scale)
                st.metric(
                    label=info['name_de'],
                    value=scale,
                    help=info.get('description_de', '')
                )

        st.write("")
        st.divider()

        # Option to add more scales
        st.markdown("**➕ Zusätzliche Skalen hinzufügen (optional):**")

        # Create list of all available scales except Level 1
        all_available_scales = []
        for category, category_data in SCALE_CATEGORIES.items():
            all_available_scales.extend(category_data["scales"])

        # Remove Level 1 scales from available list
        available_for_addition = [s for s in all_available_scales if s not in SCREENING_LEVEL_1['scales']]

        # Create options with labels
        scale_options_l1 = {}
        for scale in available_for_addition:
            info = get_scale_info(scale)
            if info:
                scale_options_l1[f"{scale} - {info['name_de']}"] = scale
            else:
                scale_options_l1[scale] = scale

        additional_selected_l1 = st.multiselect(
            "Wählen Sie zusätzliche Skalen:",
            options=list(scale_options_l1.keys()),
            key="additional_scales_l1_selector",
            help="Optional: Fügen Sie weitere Skalen hinzu für eine umfassendere Diagnostik"
        )

        # Convert back to scale codes
        st.session_state.additional_scales_level1 = [scale_options_l1[label] for label in additional_selected_l1]

        # Show total (remove duplicates)
        total_scales_l1 = SCREENING_LEVEL_1['scales'] + st.session_state.additional_scales_level1
        total_scales_l1 = list(dict.fromkeys(total_scales_l1))  # Remove duplicates while preserving order

        if st.session_state.additional_scales_level1:
            unique_additional = [s for s in st.session_state.additional_scales_level1 if s not in SCREENING_LEVEL_1['scales']]
            st.info(f"📊 **Gesamt:** {len(total_scales_l1)} Skalen ({len(SCREENING_LEVEL_1['scales'])} Standard + {len(unique_additional)} Zusätzliche)")

        st.write("")

        if st.button("🚀 Screening Stufe 1 starten", type="primary", use_container_width=True):
            st.session_state.show_screening_form = True
            st.session_state.screening_level = 1
            st.session_state.current_scales = total_scales_l1
            st.rerun()

    # ============================================
    # TAB 2: LEVEL 2 SCREENING
    # ============================================

    with tab2:
        st.markdown(f"**{SCREENING_LEVEL_2['description']}**")
        st.write("")

        col1, col2 = st.columns(2)

        for idx, scale in enumerate(SCREENING_LEVEL_2['scales']):
            col = col1 if idx < 2 else col2
            with col:
                info = get_scale_info(scale)
                st.metric(
                    label=info['name_de'],
                    value=scale,
                    help=info.get('description_de', '')
                )

        st.write("")
        st.divider()

        # Option to add more scales
        st.markdown("**➕ Zusätzliche Skalen hinzufügen (optional):**")

        # Create list of all available scales except Level 2
        all_available_scales_l2 = []
        for category, category_data in SCALE_CATEGORIES.items():
            all_available_scales_l2.extend(category_data["scales"])

        # Remove Level 2 scales from available list
        available_for_addition_l2 = [s for s in all_available_scales_l2 if s not in SCREENING_LEVEL_2['scales']]

        # Create options with labels
        scale_options_l2 = {}
        for scale in available_for_addition_l2:
            info = get_scale_info(scale)
            if info:
                scale_options_l2[f"{scale} - {info['name_de']}"] = scale
            else:
                scale_options_l2[scale] = scale

        additional_selected_l2 = st.multiselect(
            "Wählen Sie zusätzliche Skalen:",
            options=list(scale_options_l2.keys()),
            key="additional_scales_l2_selector",
            help="Optional: Fügen Sie weitere Skalen hinzu für eine umfassendere Diagnostik"
        )

        # Convert back to scale codes
        st.session_state.additional_scales_level2 = [scale_options_l2[label] for label in additional_selected_l2]

        # Show items preview for selected scales
        if st.session_state.additional_scales_level2:
            st.markdown("**🔍 Vorschau der zusätzlichen Items:**")

            with st.expander(f"📋 {len(st.session_state.additional_scales_level2)} Skala(n) ausgewählt - Items anzeigen"):
                for scale_code in st.session_state.additional_scales_level2:
                    info = get_scale_info(scale_code)
                    st.markdown(f"**{scale_code} - {info['name_de']}**")
                    st.caption(f"_{info.get('description_de', '')}_")

                    # Load items for this scale
                    try:
                        items, _, _ = load_items_for_scales([scale_code])
                        st.markdown(f"*Anzahl Items: {len(items)}*")

                        # Show first 3 items as preview
                        for idx, item in enumerate(items[:3], 1):
                            question_text = item.get('question_text_de', item.get('question_text_en', 'N/A'))
                            st.markdown(f"{idx}. {question_text}")

                        if len(items) > 3:
                            st.caption(f"... und {len(items) - 3} weitere Items")
                    except Exception as e:
                        st.warning(f"Items konnten nicht geladen werden: {str(e)}")

                    st.divider()

        # Show total (remove duplicates)
        total_scales_l2 = SCREENING_LEVEL_2['scales'] + st.session_state.additional_scales_level2
        total_scales_l2 = list(dict.fromkeys(total_scales_l2))  # Remove duplicates while preserving order

        if st.session_state.additional_scales_level2:
            unique_additional = [s for s in st.session_state.additional_scales_level2 if s not in SCREENING_LEVEL_2['scales']]
            st.info(f"📊 **Gesamt:** {len(total_scales_l2)} Skalen ({len(SCREENING_LEVEL_2['scales'])} Standard + {len(unique_additional)} Zusätzliche)")

        st.write("")

        if st.button("🎯 Vertiefungs-Diagnostik starten", type="primary", use_container_width=True):
            st.session_state.show_screening_form = True
            st.session_state.screening_level = 2
            st.session_state.current_scales = total_scales_l2
            st.rerun()

        st.write("")
        st.info("💡 **Tipp:** Vertiefung empfohlen bei auffälligen Stufe-1-Werten oder zur gezielten Interventionsplanung")

    # ============================================
    # TAB 3: RESULTS
    # ============================================

    with tab3:
        st.subheader("📊 Bisherige Assessments")

        summary = get_student_summary(st.session_state.screening_student_id)
        total_assessments = summary.get('total_assessments', 0)

        if total_assessments > 0:
            st.info(f"**{total_assessments} Assessment(s)** für {student['student_code']} gefunden")

            # TODO: Display assessment history and intervention recommendations
            st.markdown("_Detaillierte Auswertung in Entwicklung_")
        else:
            st.warning("Noch keine Screening-Ergebnisse vorhanden")

else:
    st.info("👈 Bitte wähle einen Schüler in der Sidebar aus oder lege einen neuen an, um das Screening zu starten")

# ============================================
# SCREENING FORM (wenn aktiviert)
# ============================================

if st.session_state.get('show_screening_form', False):
    st.divider()
    st.header("📝 Fragebogen ausfüllen")

    student = get_student_by_id(st.session_state.screening_student_id)
    current_level = st.session_state.screening_level
    current_scales = st.session_state.current_scales

    level_name = SCREENING_LEVEL_1['name'] if current_level == 1 else SCREENING_LEVEL_2['name']

    # Extract grade from student class
    student_grade = extract_grade_from_class(student.get('class'))

    if student_grade:
        st.info(f"""
        **Schüler:** {student['student_code']} | **Klasse:** {student.get('class')} (Stufe {student_grade}) | **Level:** {level_name} | **Skalen:** {len(current_scales)}
        """)
    else:
        st.info(f"""
        **Schüler:** {student['student_code']} | **Level:** {level_name} | **Skalen:** {len(current_scales)}
        """)
        st.warning("⚠️ Klassenstufe nicht erkannt - verwende Standard-MATHEFF-Items (Klasse 8)")

    # Load items with grade-specific adaptation
    if 'MATHEFF' in current_scales and student_grade:
        # Load other scales normally
        other_scales = [s for s in current_scales if s != 'MATHEFF']

        if other_scales:
            other_items, other_labels, other_fragestamm = load_items_for_scales(other_scales)
        else:
            other_items, other_labels, other_fragestamm = [], {}, {}

        # Load grade-specific MATHEFF items
        matheff_items_orig, _, _ = load_items_for_scales(['MATHEFF'])
        matheff_items, matheff_labels, matheff_fragestamm = adapt_matheff_for_grade(
            student_grade, matheff_items_orig
        )

        # Combine all items
        items = other_items + matheff_items
        value_labels = {**other_labels, **matheff_labels}
        fragestamm = {**other_fragestamm, 'MATHEFF': matheff_fragestamm}

        # Add German labels to other scales (matheff_labels already have German labels)
        value_labels = add_german_labels_to_value_labels(value_labels, items)

        # Show grade info
        st.success(f"✅ MATHEFF-Items angepasst für Klassenstufe {student_grade}")
    else:
        # Standard loading without grade adaptation
        items, value_labels, fragestamm = load_items_for_scales(current_scales)

    # Add German labels
    value_labels = add_german_labels_to_value_labels(value_labels, items)

    # Deduplicate items by variable_name to avoid duplicate keys in Streamlit
    seen_variables = set()
    unique_items = []
    for item in items:
        var_name = item['variable_name']
        if var_name not in seen_variables:
            seen_variables.add(var_name)
            unique_items.append(item)

    grouped_items = group_items_by_scale(unique_items)

    # Initialize responses
    if 'screening_responses' not in st.session_state:
        st.session_state.screening_responses = {}

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

                # Fallback labels
                likert_4_labels = {
                    1: "Stimme überhaupt nicht zu",
                    2: "Stimme eher nicht zu",
                    3: "Stimme eher zu",
                    4: "Stimme völlig zu"
                }

                options = []
                option_values = []
                for idx, row in valid_labels.iterrows():
                    value = row['value']
                    label = row.get('label_de')
                    if label is None or label == '' or label == 'None':
                        label = row.get('label')
                    if label is None or label == '' or label == 'None':
                        label = likert_4_labels.get(value, f'Option {value}')

                    options.append(label)
                    option_values.append(value)

                # Display question with horizontal radio buttons
                st.markdown(f"**{question_text}**")

                response = st.radio(
                    label="Antwort",
                    options=options,
                    key=f"screening_q_{variable_name}",
                    horizontal=True,
                    label_visibility="collapsed",
                    index=None
                )

                if response:
                    response_value = option_values[options.index(response)]
                    st.session_state.screening_responses[variable_name] = response_value

                st.markdown("---")

    # Buttons
    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        if st.button("✅ Absenden", type="primary"):
            total_items = len(items)
            answered = len(st.session_state.screening_responses)

            if answered < total_items:
                st.error(f"Bitte alle Fragen beantworten ({answered}/{total_items})")
            else:
                try:
                    results_dict = {
                        'screening_level': current_level,
                        'item_responses': st.session_state.screening_responses,
                        'scales': list(current_scales),
                        'timestamp': datetime.now().isoformat()
                    }

                    assessment_id = save_assessment(
                        student_id=st.session_state.screening_student_id,
                        results_dict=results_dict,
                        notes=f"Screening Stufe {current_level} ({len(current_scales)} Skalen, {total_items} Items)"
                    )

                    st.success(f"✅ Screening erfolgreich gespeichert (Assessment #{assessment_id})")
                    st.balloons()

                    st.session_state.screening_responses = {}
                    st.session_state.show_screening_form = False
                    st.rerun()

                except Exception as e:
                    st.error(f"Fehler beim Speichern: {e}")

    with col2:
        if st.button("❌ Abbrechen"):
            st.session_state.screening_responses = {}
            st.session_state.show_screening_form = False
            st.rerun()

# ============================================
# SIDEBAR: INFO
# ============================================

st.sidebar.header("ℹ️ Über Screening-Diagnostik")

st.sidebar.markdown("""
### Evidenzbasierter Ansatz

**Stufe 1** identifiziert schnell Interventionsbedarf bei:
- Selbstwirksamkeit
- Mathematikangst
- Ausdauer

**Stufe 2** vertieft für gezielte Interventionen:
- Growth Mindset
- Lehrerbeziehung
- Soziale Integration

### Interventions-Matching

Niedrige Werte → Spezifische Förderung
Hohe Werte → Herausforderung & Autonomie
""")

st.sidebar.divider()

st.sidebar.markdown("""
**📚 Basis:**
- XGBoost Feature Importance
- Interventionsfähigkeit
- Demokratische Validierung
""")
