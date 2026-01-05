"""
📊 Auswertung - Deine Ergebnisse

Zeigt dem Schüler seine Screening-Ergebnisse auf der 1-4 Skala
MIT HATTIE-INTERPRETATION TAB + SCHNELLZUGRIFF ZUR RESSOURCEN-SEITE

Version: 2.2 - Kombiniert Hattie-Features mit Ressourcen-Links
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import json
import sys
sys.path.append('..')

from utils.coaching_db import get_student_by_id, get_latest_assessment
from utils.scale_info import get_scale_info
from utils.evidence_integration import (
    get_evidence,
    get_hattie_info,
    get_pisa_info,
    interpret_score_with_evidence,
    get_all_scales_with_evidence,
    format_hattie_badge,
    format_pisa_badge
)
from utils.page_config import get_page_path

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Deine Auswertung",
    page_icon="📊",
    layout="wide"
)

# ============================================
# CONSTANTS
# ============================================

# Negative Skalen: Bei diesen bedeutet NIEDRIG = GUT, HOCH = SCHLECHT
NEGATIVE_SCALES = ['ANXMAT', 'BULLIED']

# NEU: Skalen mit Ressourcen-Seite verfügbar
# Enthält sowohl PISA-Skalen als auch externe evidenzbasierte Skalen (EXT_)
SCALES_WITH_RESOURCES = [
    # PISA-Skalen
    'MATHEFF', 'ANXMAT', 'GROSAGR', 'PERSEVAGR', 'TEACHSUP', 'BELONG', 'BULLIED',
    # Externe evidenzbasierte Skalen
    'EXT_LEARNSTRAT', 'EXT_METACOG', 'EXT_MOTIV', 'EXT_FOCUS'
]

# ============================================
# HELPER FUNCTIONS (Original)
# ============================================

def is_negative_scale(scale_code):
    """Prüft ob eine Skala invers ist (niedrig = gut)"""
    return scale_code in NEGATIVE_SCALES

def is_score_good(score, scale_code):
    """Prüft ob ein Score 'gut' ist - berücksichtigt inverse Skalen"""
    if is_negative_scale(scale_code):
        return score < 2.5  # Bei ANXMAT/BULLIED: niedrig = gut
    else:
        return score >= 3.0  # Bei normalen Skalen: hoch = gut

def is_score_critical(score, scale_code):
    """Prüft ob ein Score 'kritisch' ist - berücksichtigt inverse Skalen"""
    if is_negative_scale(scale_code):
        return score >= 3.0  # Bei ANXMAT/BULLIED: hoch = kritisch
    else:
        return score < 2.5  # Bei normalen Skalen: niedrig = kritisch

def extract_scales_from_responses(responses):
    """Extrahiert Skalen aus Responses"""

    # Mapping von PISA Item-Codes zu Skalen
    PISA_ITEM_TO_SCALE = {
        'ST290': 'MATHEFF',
        'ST291': 'MATHEFF',
        'ST292': 'ANXMAT',
        'ST268': 'PERSEVAGR',
        'ST034': 'BELONG',
        'ST270': 'TEACHSUP',
        'ST038': 'BULLIED',
    }

    scales = {}

    for item_name in responses.keys():
        scale_name = None

        # Check if it's a custom item (GENEFF_Q01, etc.)
        if '_Q' in item_name:
            scale_name = item_name.split('_Q')[0]

        # Check if it's a PISA item (ST290Q01JA, etc.)
        elif item_name.startswith('ST'):
            item_prefix = item_name[:5]
            scale_name = PISA_ITEM_TO_SCALE.get(item_prefix)

        # Add to scales dict
        if scale_name:
            if scale_name not in scales:
                scales[scale_name] = []
            scales[scale_name].append(item_name)

    return scales

def calculate_scale_score(responses, scale_items):
    """Berechnet Skalen-Score aus Item-Antworten

    WICHTIG: Einige PISA-Items verwenden umgekehrte Skalen:
    - PISA: 1=Strongly agree, 4=Strongly disagree
    - Unsere App: 1=Stimmt gar nicht, 4=Stimmt genau

    Diese Items werden automatisch umgekehrt (5 - Wert)
    """

    # Items die umgekehrt werden müssen (PISA: 1=agree, 4=disagree)
    REVERSE_CODED_PREFIXES = ['ST292', 'ST034', 'ST270']

    values = []
    for item in scale_items:
        if item in responses:
            try:
                val = float(responses[item])
                if 1 <= val <= 4:
                    # Prüfe ob Item umgekehrt werden muss
                    needs_reversal = any(item.startswith(prefix) for prefix in REVERSE_CODED_PREFIXES)
                    if needs_reversal:
                        val = 5 - val  # Umkehrung: 1→4, 2→3, 3→2, 4→1
                    values.append(val)
            except:
                pass

    if values:
        return sum(values) / len(values)
    return None

def interpret_score(score, scale_code):
    """Gibt eine einfache Interpretation des Scores"""

    # Nutze globale Konstante für negative Skalen
    is_negative = is_negative_scale(scale_code)

    if is_negative:
        if score >= 3.5:
            return "🔴 Hoch", "#ff9999", "Dieser Bereich braucht besondere Aufmerksamkeit."
        elif score >= 3.0:
            return "🟠 Erhöht", "#FFA500", "Hier gibt es Entwicklungspotenzial."
        elif score >= 2.5:
            return "🟡 Mittel", "#FFD700", "Solide Ausgangsbasis - mit Luft nach oben."
        elif score >= 2.0:
            return "🟢 Niedrig", "#90EE90", "Gut! Du liegst hier im positiven Bereich."
        else:
            return "🟢 Sehr niedrig", "#00cc88", "Ausgezeichnet! Dieser Bereich ist eine echte Stärke."
    else:
        if score >= 3.5:
            return "🟢 Sehr gut", "#00cc88", "Ausgezeichnet! Dieser Bereich ist eine echte Stärke."
        elif score >= 3.0:
            return "🟢 Gut", "#90EE90", "Gut! Du liegst hier über dem Durchschnitt."
        elif score >= 2.5:
            return "🟡 Mittel", "#FFD700", "Solide Ausgangsbasis - mit Luft nach oben."
        elif score >= 2.0:
            return "🟠 Unterdurchschnitt", "#FFA500", "Hier gibt es Entwicklungspotenzial."
        else:
            return "🔴 Niedrig", "#ff9999", "Dieser Bereich braucht besondere Aufmerksamkeit."

def create_bar_chart(scores_df):
    """Erstellt Balkendiagramm aller Skalen"""
    scores_df = scores_df.sort_values('Wert', ascending=True)

    fig = go.Figure()

    colors = []
    for idx, row in scores_df.iterrows():
        val = row['Wert']
        scale_code = row['scale_code']
        _, color, _ = interpret_score(val, scale_code)
        colors.append(color)

    fig.add_trace(go.Bar(
        y=scores_df['Bereich'],
        x=scores_df['Wert'],
        orientation='h',
        marker_color=colors,
        text=scores_df['Wert'].apply(lambda x: f'{x:.2f}'),
        textposition='outside',
        showlegend=False
    ))

    fig.add_vline(x=2.5, line_dash="dash", line_color="gray",
                  annotation_text="Mittel", annotation_position="top")

    fig.update_layout(
        title="Deine Werte im Überblick",
        xaxis_title="Wert (1 = niedrig, 4 = hoch)",
        yaxis_title="",
        height=400,
        xaxis_range=[0, 4.5],
        showlegend=False
    )

    return fig


# ============================================
# NEU: NAVIGATION ZUR RESSOURCEN-SEITE
# ============================================

def navigate_to_resources(scale_name):
    """Navigiert zur Ressourcen-Seite für eine bestimmte Skala"""
    st.session_state.selected_factor = scale_name
    st.switch_page(get_page_path("ressourcen"))


# ============================================
# HATTIE-INTERPRETATION HELPER FUNCTIONS
# ============================================

def get_effect_size_category(d_value):
    """Kategorisiert Effektstärke nach Hattie"""
    if d_value >= 0.8:
        return "🟢 Sehr hoch", "#00cc88", "Exzellenter Einfluss!"
    elif d_value >= 0.6:
        return "🔵 Hoch", "#4ecdc4", "Starker Einfluss"
    elif d_value >= 0.4:
        return "🟡 Mittel", "#FFD700", "Überdurchschnittlich"
    else:
        return "⚪ Gering", "#808080", "Unter Durchschnitt"

def create_effect_size_visualization(d_value):
    """Erstellt eine Gauge-Visualisierung für die Effektstärke"""
    
    # Bestimme Farbe
    if d_value >= 0.8:
        bar_color = "#00cc88"
    elif d_value >= 0.6:
        bar_color = "#4ecdc4"  
    elif d_value >= 0.4:
        bar_color = "#FFD700"
    else:
        bar_color = "#808080"
    
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=d_value,
        domain={'x': [0, 1], 'y': [0, 1]},
        number={'suffix': "", 'font': {'size': 24}},
        gauge={
            'axis': {'range': [0, 1.2], 'tickwidth': 1, 'tickcolor': "darkgray",
                    'tickvals': [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2],
                    'ticktext': ['0', '0.2', '0.4\n(Umschlag)', '0.6', '0.8', '1.0', '1.2']},
            'bar': {'color': bar_color, 'thickness': 0.75},
            'bgcolor': "white",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 0.2], 'color': '#f0f0f0'},
                {'range': [0.2, 0.4], 'color': '#e0e0e0'},
                {'range': [0.4, 0.6], 'color': '#fff3cd'},
                {'range': [0.6, 0.8], 'color': '#cce5ff'},
                {'range': [0.8, 1.2], 'color': '#d4edda'}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 3},
                'thickness': 0.8,
                'value': 0.4
            }
        }
    ))
    
    fig.update_layout(
        height=180,
        margin=dict(l=20, r=20, t=30, b=10),
        font={'size': 12}
    )
    
    return fig

def explain_effect_size(d_value):
    """Erklärt die Effektstärke schülerfreundlich"""
    years = d_value / 0.4  # d=0.4 ≈ 1 Jahr Lernfortschritt
    
    if d_value >= 0.8:
        return f"""
**🎯 Effektstärke d = {d_value} - Das ist SEHR STARK!**

Eine Effektstärke von {d_value} bedeutet: Dieser Faktor entspricht etwa **{years:.1f} Jahren 
zusätzlichem Lernfortschritt**! Das ist einer der stärksten Faktoren, die Hattie in über 
2.100 Studien mit 400 Millionen Schülern gefunden hat.

*Zum Vergleich: d = 0.40 ist der "Umschlagpunkt" - ab hier lohnt sich eine Maßnahme wirklich.*
        """
    elif d_value >= 0.6:
        return f"""
**🎯 Effektstärke d = {d_value} - Das ist STARK!**

Eine Effektstärke von {d_value} entspricht etwa **{years:.1f} Jahren zusätzlichem Lernfortschritt**. 
Wer hier gut aufgestellt ist, hat einen echten Vorteil beim Lernen!

*Zum Vergleich: d = 0.40 ist der "Umschlagpunkt" - dieser Faktor liegt deutlich darüber.*
        """
    elif d_value >= 0.4:
        return f"""
**🎯 Effektstärke d = {d_value} - Überdurchschnittlich**

d = 0.40 ist Hatties "Umschlagpunkt" - ab hier lohnt sich eine Maßnahme wirklich. 
Mit d = {d_value} liegt dieser Faktor **über dem Durchschnitt** aller 252 untersuchten 
Einflüsse auf Schulerfolg.

*Das entspricht etwa {years:.1f} Jahr(en) Lernfortschritt.*
        """
    else:
        return f"""
**🎯 Effektstärke d = {d_value} - Unter dem Durchschnitt**

Mit d = {d_value} liegt dieser Faktor unter dem Umschlagpunkt (d = 0.40). Das heißt 
nicht, dass er unwichtig ist - aber andere Faktoren haben einen größeren Einfluss 
auf deinen Lernerfolg.
        """

def get_personalized_message(scale_name, score, hattie_data, evidence):
    """Erstellt personalisierte Nachricht basierend auf Schüler-Wert UND Hattie-Forschung"""
    
    if not hattie_data:
        return None
        
    d_value = hattie_data.get('d', 0)
    factor = hattie_data.get('factor', scale_name)
    rank = hattie_data.get('rank', '?')
    
    # Nutze zentrale Hilfsfunktionen für Skalentyp
    is_good = is_score_good(score, scale_name)
    is_critical = is_score_critical(score, scale_name)
    is_negative = is_negative_scale(scale_name)
    
    # Personalisierte Nachricht
    if is_good and d_value >= 0.6:
        return f"""
✨ **Super Nachricht für dich!**

Du hast mit **{score:.2f}** einen guten Wert in diesem Bereich - und laut Hattie's 
Forschung (d = {d_value}, Rang {rank} von 252) ist genau dieser Faktor einer der 
wichtigsten für Schulerfolg überhaupt!

**Das bedeutet:** Du hast hier eine echte Stärke, die dir beim Lernen hilft. Nutze sie!
        """
    elif is_good and d_value >= 0.4:
        return f"""
✅ **Gut gemacht!**

Dein Wert von **{score:.2f}** zeigt, dass du hier gut aufgestellt bist. Laut Hattie 
(d = {d_value}) ist das ein überdurchschnittlich wichtiger Faktor.

**Tipp:** Behalte diesen Bereich im Blick - er hilft dir beim Lernen!
        """
    elif is_critical and d_value >= 0.6:
        return f"""
⚠️ **Wichtiger Entwicklungsbereich!**

Dein aktueller Wert liegt bei **{score:.2f}**. Die Forschung zeigt: Genau dieser 
Faktor hat eine sehr hohe Effektstärke (d = {d_value}, Rang {rank} von 252)!

**Das heißt:** Wenn du hier arbeitest, kannst du besonders viel erreichen. 
Kleine Verbesserungen hier haben große Wirkung!
        """
    elif is_critical:
        return f"""
💡 **Entwicklungspotenzial**

Mit einem Wert von **{score:.2f}** gibt es hier Raum für Verbesserung. 
Laut Hattie (d = {d_value}) ist das ein Faktor, der deinen Lernerfolg beeinflusst.

**Tipp:** Schau dir die Empfehlungen unten an - kleine Schritte können helfen!
        """
    else:
        return f"""
📊 **Dein Wert: {score:.2f}**

Dieser Faktor hat laut Hattie eine Effektstärke von d = {d_value} 
(Rang {rank} von 252 Faktoren).
        """

def render_hattie_scale_box(scale_name, scale_display, score, evidence):
    """Rendert eine schöne Box für eine Skala mit Hattie-Daten"""
    
    hattie = evidence.get('hattie', {}) if evidence else {}
    pisa = evidence.get('pisa', {}) if evidence else {}
    
    if not hattie:
        # Keine Hattie-Daten verfügbar
        st.info(f"""
        **{scale_display}** - Dein Wert: {score:.2f} / 4.0
        
        ℹ️ Für diesen Bereich liegen keine Hattie-Forschungsdaten vor. 
        Das bedeutet nicht, dass er unwichtig ist - er wurde nur in Hatties 
        Synthese nicht separat untersucht.
        """)
        return
    
    d_value = hattie.get('d', 0)
    rank = hattie.get('rank', '?')
    factor = hattie.get('factor', scale_name)
    category = hattie.get('category', 'Student')
    source = hattie.get('source', 'Hattie 2023')
    
    # Effektstärken-Kategorie
    effect_label, effect_color, effect_desc = get_effect_size_category(d_value)
    
    # Status des Schülers
    status_text, status_color, status_msg = interpret_score(score, scale_name)
    
    # Expander mit allen Details
    with st.expander(f"**{scale_display}** - Dein Wert: {score:.2f} | Hattie: d = {d_value} ({effect_label})", expanded=False):
        
        col1, col2 = st.columns([1, 1])
        
        with col1:
            st.markdown("### 📊 Dein Ergebnis")
            
            # Score-Anzeige
            st.markdown(f"""
            <div style="background: {status_color}33; border: 2px solid {status_color}; 
                        border-radius: 15px; padding: 20px; text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 0; color: {status_color};">{score:.2f} / 4.0</h2>
                <p style="margin: 5px 0 0 0; font-size: 1.1em;">{status_text}</p>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown(f"*{status_msg}*")
        
        with col2:
            st.markdown("### 🔬 Hattie-Forschung")
            
            # Effektstärke-Visualisierung
            fig = create_effect_size_visualization(d_value)
            st.plotly_chart(fig, use_container_width=True, key=f"hattie_effect_{scale_name}")
            
            st.markdown(f"""
            - **Faktor:** {factor}
            - **Rang:** #{rank} von 252 Faktoren
            - **Kategorie:** {category}
            """)
        
        st.divider()
        
        # Effektstärke-Erklärung
        st.markdown(explain_effect_size(d_value))
        
        # Personalisierte Nachricht
        personal_msg = get_personalized_message(scale_name, score, hattie, evidence)
        if personal_msg:
            st.markdown(personal_msg)
        
        # PISA-Daten wenn vorhanden
        if pisa:
            st.divider()
            st.markdown("### 📈 PISA 2022 Deutschland")
            
            impact = pisa.get('points_impact', '?')
            variance = pisa.get('variance_explained', '?')
            correlation = pisa.get('correlation', '?')
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Punkte-Impact", impact)
            with col2:
                st.metric("Erklärt", variance)
            with col3:
                st.metric("Korrelation", f"r = {correlation}")
        
        # Tipps wenn vorhanden
        if evidence and 'was_tun' in evidence:
            st.divider()
            st.markdown("### 💡 Was kannst du tun?")
            
            tipps = evidence.get('was_tun', {})
            
            tab1, tab2, tab3 = st.tabs(["🚀 Sofort", "📅 Diese Woche", "🎯 Langfristig"])
            
            with tab1:
                for tipp in tipps.get('sofort', []):
                    st.markdown(f"- {tipp}")
            
            with tab2:
                for tipp in tipps.get('diese_woche', []):
                    st.markdown(f"- {tipp}")
            
            with tab3:
                for tipp in tipps.get('langfristig', []):
                    st.markdown(f"- {tipp}")


# ============================================
# MAIN PAGE
# ============================================

st.title("📊 Deine Auswertung")
st.markdown("**Hier siehst du deine Ergebnisse aus dem Screening**")
st.divider()

# Check if screening data exists
if 'screening_responses' not in st.session_state or not st.session_state.screening_responses:
    if 'screening_student_id' in st.session_state:
        assessment = get_latest_assessment(st.session_state.screening_student_id)
        if assessment:
            results = json.loads(assessment['results'])
            st.session_state.screening_responses = results.get('item_responses', {})
            st.info(f"📂 Auswertung vom {assessment['assessment_date']} geladen")
        else:
            st.warning("⚠️ Keine Screening-Daten vorhanden. Bitte führe zuerst ein Screening durch.")
            st.page_link(get_page_path("screening"), label="➡️ Zum Screening", icon="📝")
            st.stop()
    else:
        st.warning("⚠️ Kein Schüler ausgewählt.")
        st.page_link(get_page_path("screening"), label="➡️ Zum Screening", icon="📝")
        st.stop()

# Get student info
student = None
if 'screening_student_id' in st.session_state:
    student = get_student_by_id(st.session_state.screening_student_id)
    if student:
        st.success(f"👤 **{student['student_code']}** | Klasse: {student.get('class', 'N/A')}")

# Extract scales and calculate scores
scales_dict = extract_scales_from_responses(st.session_state.screening_responses)

# Prepare data
scores_data = []
for scale_name, items in scales_dict.items():
    student_score = calculate_scale_score(st.session_state.screening_responses, items)
    if student_score:
        scale_info = get_scale_info(scale_name)
        scale_display = scale_info.get('name_de', scale_name) if scale_info else scale_name

        scores_data.append({
            'scale_code': scale_name,
            'Bereich': scale_display,
            'Wert': student_score,
            'items_count': len(items)
        })

if not scores_data:
    st.error("Keine Daten zum Auswerten gefunden.")
    st.stop()

scores_df = pd.DataFrame(scores_data)


# ============================================
# TABS
# ============================================

tab1, tab2, tab3, tab4 = st.tabs([
    "📈 Überblick", 
    "🔍 Details", 
    "📚 Hattie-Interpretation",
    "📋 Zusammenfassung"
])


# ============================================
# TAB 1: OVERVIEW + SCHNELLZUGRIFF
# ============================================

with tab1:
    st.header("📈 Überblick")
    
    # Bar chart
    fig = create_bar_chart(scores_df)
    st.plotly_chart(fig, use_container_width=True, key="overview_bar_chart")
    
    st.info("""
    💡 **Interpretation:**
    - **3.5 - 4.0**: Sehr gut (Stärke!)
    - **3.0 - 3.5**: Gut (Über dem Durchschnitt)
    - **2.5 - 3.0**: Mittel (Solide Basis)
    - **2.0 - 2.5**: Unterdurchschnitt (Entwicklungspotenzial)
    - **1.0 - 2.0**: Niedrig (Besondere Aufmerksamkeit)
    """)
    
    # NEU: Schnellzugriff zu Ressourcen
    st.divider()
    st.subheader("🚀 Schnellzugriff: Videos & Tipps")
    
    # Finde Bereiche mit Entwicklungspotenzial
    development_areas = []
    for _, row in scores_df.iterrows():
        scale_code = row['scale_code']
        score = row['Wert']
        if not is_score_good(score, scale_code) and scale_code in SCALES_WITH_RESOURCES:
            development_areas.append({
                'scale_code': scale_code,
                'display': row['Bereich'],
                'score': score
            })
    
    if development_areas:
        st.markdown("**Hier gibt es Entwicklungspotenzial - klicke für Videos & Tipps:**")
        
        cols = st.columns(min(len(development_areas), 3))
        for i, area in enumerate(development_areas[:3]):
            with cols[i]:
                if st.button(f"🎬 {area['display']}", key=f"quick_{area['scale_code']}", use_container_width=True):
                    navigate_to_resources(area['scale_code'])
    else:
        st.success("✅ Alle Bereiche im guten Bereich! Trotzdem kannst du dir die Tipps ansehen:")
        
        cols = st.columns(3)
        for i, scale in enumerate(['MATHEFF', 'GROSAGR', 'PERSEVAGR']):
            with cols[i]:
                scale_info = get_scale_info(scale)
                display = scale_info.get('name_de', scale) if scale_info else scale
                if st.button(f"💡 {display}", key=f"tip_{scale}", use_container_width=True):
                    navigate_to_resources(scale)


# ============================================
# TAB 2: DETAILS + RESSOURCEN-BUTTONS
# ============================================

with tab2:
    st.header("🔍 Details zu den einzelnen Bereichen")
    
    for idx, row in scores_df.iterrows():
        scale_name = row['scale_code']
        scale_display = row['Bereich']
        score = row['Wert']
        
        status_text, status_color, status_msg = interpret_score(score, scale_name)
        
        with st.expander(f"**{scale_display}** - Dein Wert: {score:.2f} / 4.0", expanded=False):
            
            col1, col2 = st.columns([1, 2])
            
            with col1:
                fig = go.Figure(go.Indicator(
                    mode="gauge+number",
                    value=score,
                    domain={'x': [0, 1], 'y': [0, 1]},
                    gauge={
                        'axis': {'range': [1, 4], 'tickwidth': 1},
                        'bar': {'color': status_color},
                        'steps': [
                            {'range': [1, 2], 'color': '#ffcccc'},
                            {'range': [2, 2.5], 'color': '#ffe6cc'},
                            {'range': [2.5, 3], 'color': '#ffffcc'},
                            {'range': [3, 3.5], 'color': '#e6ffcc'},
                            {'range': [3.5, 4], 'color': '#ccffcc'}
                        ],
                        'threshold': {
                            'line': {'color': "black", 'width': 2},
                            'thickness': 0.75,
                            'value': 2.5
                        }
                    },
                    number={'suffix': " / 4.0", 'font': {'size': 20}}
                ))
                fig.update_layout(height=200, margin=dict(l=20, r=20, t=30, b=20))
                st.plotly_chart(fig, use_container_width=True, key=f"gauge_{scale_name}")
            
            with col2:
                st.markdown(f"""
                <div style="background: {status_color}; padding: 20px; border-radius: 10px; text-align: center;">
                    <h3 style="margin: 0;">{status_text}</h3>
                    <p style="margin: 10px 0;">{status_msg}</p>
                </div>
                """, unsafe_allow_html=True)
            
            # Scale-specific interpretations
            st.markdown("### 💡 Was bedeutet das für dich?")
            
            if scale_name == "MATHEFF":
                if score >= 3.0:
                    st.success("✅ **Starkes mathematisches Selbstvertrauen!** Du traust dir zu, auch schwierige Mathe-Aufgaben zu lösen.")
                else:
                    st.warning("💡 **Selbstvertrauen aufbauen:** Arbeite an kleinen Erfolgserlebnissen und feiere deine Fortschritte!")
            
            elif scale_name == "ANXMAT":
                if score >= 3.0:
                    st.warning("⚠️ **Hohe Mathe-Angst:** Du fühlst dich bei Mathe-Aufgaben oft unsicher. Das ist normal und daran kann man arbeiten!")
                else:
                    st.success("✅ **Wenig Mathe-Angst:** Du bleibst bei Mathe-Aufgaben relativ entspannt. Das ist eine Stärke!")
            
            elif scale_name == "PERSEVAGR":
                if score >= 3.0:
                    st.success("✅ **Hohe Ausdauer:** Du gibst nicht so schnell auf. Das ist eine Schlüsselkompetenz!")
                else:
                    st.info("💡 **Ausdauer trainieren:** Setze dir kleine, erreichbare Ziele und belohne dich für Fortschritte.")
            
            # NEU: Button zur Ressourcen-Seite
            if scale_name in SCALES_WITH_RESOURCES:
                st.divider()
                if st.button(f"🎬 Videos & Tipps zu '{scale_display}'", key=f"detail_resource_{scale_name}", use_container_width=True):
                    navigate_to_resources(scale_name)


# ============================================
# TAB 3: HATTIE-INTERPRETATION + RESSOURCEN-BUTTONS
# ============================================

with tab3:
    st.header("📚 Interpretation nach Hattie's Visible Learning")
    
    # Einleitung
    st.markdown("""
    ### Was ist Hattie's Visible Learning?
    
    John Hattie ist einer der einflussreichsten Bildungsforscher weltweit. In seinem Werk 
    **"Visible Learning: The Sequel" (2023)** hat er über **2.100 Meta-Analysen** mit mehr 
    als **400 Millionen Schülern** aus der ganzen Welt ausgewertet.
    
    Das Ergebnis: Eine Liste von **252 Faktoren**, die den Schulerfolg beeinflussen - 
    sortiert nach ihrer **Effektstärke (d-Wert)**.
    """)
    
    # Erklärung der Effektstärken
    with st.expander("🎓 Was bedeuten die Effektstärken?", expanded=False):
        st.markdown("""
        **Die Effektstärke (d-Wert)** zeigt, wie stark ein Faktor das Lernen beeinflusst:
        
        | d-Wert | Bedeutung | Entspricht etwa... |
        |--------|-----------|-------------------|
        | **d ≥ 0.8** | 🟢 Sehr hoch | ~2 Jahre Lernfortschritt |
        | **d ≥ 0.6** | 🔵 Hoch | ~1.5 Jahre Lernfortschritt |
        | **d ≥ 0.4** | 🟡 Mittel (Umschlagpunkt) | ~1 Jahr Lernfortschritt |
        | **d < 0.4** | ⚪ Gering | Unter Durchschnitt |
        
        **Der "Umschlagpunkt" d = 0.40:** Ab dieser Effektstärke lohnt sich eine Maßnahme 
        wirklich - sie bringt mehr als der Durchschnitt aller untersuchten Faktoren.
        
        *Quelle: Hattie, J. (2023). Visible Learning: The Sequel. Routledge.*
        """)
    
    st.divider()
    
    # Für jede Skala die Hattie-Interpretation
    st.subheader("🎯 Deine Ergebnisse im Licht der Forschung")
    
    # Sortiere nach Hattie-Effektstärke (wichtigste zuerst)
    scales_with_hattie = []
    for idx, row in scores_df.iterrows():
        scale_name = row['scale_code']
        evidence = get_evidence(scale_name)
        hattie = get_hattie_info(scale_name)
        d_value = hattie.get('d', 0) if hattie else 0
        
        scales_with_hattie.append({
            'scale_name': scale_name,
            'scale_display': row['Bereich'],
            'score': row['Wert'],
            'd_value': d_value,
            'evidence': evidence,
            'hattie': hattie
        })
    
    # Sortiere nach d-Wert (absteigend)
    scales_with_hattie.sort(key=lambda x: x['d_value'], reverse=True)
    
    # Render jede Skala
    for item in scales_with_hattie:
        render_hattie_scale_box(
            item['scale_name'],
            item['scale_display'],
            item['score'],
            item['evidence']
        )
        
        # NEU: Button zur Ressourcen-Seite nach jeder Box
        if item['scale_name'] in SCALES_WITH_RESOURCES:
            btn_type = "primary" if not is_score_good(item['score'], item['scale_name']) else "secondary"
            if st.button(f"🎬 Videos & Tipps zu '{item['scale_display']}'", 
                        key=f"hattie_resource_{item['scale_name']}", 
                        use_container_width=True,
                        type=btn_type):
                navigate_to_resources(item['scale_name'])
            st.markdown("")
    
    st.divider()
    
    # Zusammenfassung: Top-Prioritäten
    st.subheader("🏆 Deine Top-Prioritäten nach Hattie")
    
    # Finde Skalen mit hoher Effektstärke UND Verbesserungspotenzial
    priority_items = []
    for item in scales_with_hattie:
        if item['d_value'] >= 0.4:  # Nur relevante Faktoren
            scale_name = item['scale_name']
            score = item['score']
            
            # Nutze zentrale Hilfsfunktionen
            needs_work = not is_score_good(score, scale_name)
            
            priority_items.append({
                **item,
                'needs_work': needs_work,
                'priority_score': item['d_value'] * (1.5 if needs_work else 0.8)
            })
    
    # Sortiere nach Priorität
    priority_items.sort(key=lambda x: x['priority_score'], reverse=True)
    
    if priority_items:
        # Top 3 Prioritäten
        st.markdown("**Wo du am meisten erreichen kannst:**")
        
        for i, item in enumerate(priority_items[:3], 1):
            emoji = "🥇" if i == 1 else ("🥈" if i == 2 else "🥉")
            status = "⚠️ Entwicklungspotenzial" if item['needs_work'] else "✅ Gut aufgestellt"
            
            # NEU: Zwei Spalten mit Button
            col1, col2 = st.columns([3, 1])
            
            with col1:
                st.markdown(f"""
                {emoji} **{item['scale_display']}**
                - Dein Wert: {item['score']:.2f} | Hattie d = {item['d_value']} 
                - Status: {status}
                - Warum wichtig: Rang #{item['hattie'].get('rank', '?')} von 252 Faktoren
                """)
            
            with col2:
                if item['scale_name'] in SCALES_WITH_RESOURCES:
                    if st.button(f"🎬 Tipps", key=f"prio_{item['scale_name']}", use_container_width=True):
                        navigate_to_resources(item['scale_name'])
        
        # Handlungsempfehlung
        st.divider()
        st.markdown("### 💪 Dein Aktionsplan")
        
        top_priority = priority_items[0] if priority_items else None
        if top_priority and top_priority['needs_work']:
            st.success(f"""
            **Fokussiere dich auf: {top_priority['scale_display']}**
            
            Mit einer Effektstärke von d = {top_priority['d_value']} hat dieser Faktor 
            den größten Hebel für deinen Lernerfolg. Kleine Verbesserungen hier können 
            einen großen Unterschied machen!
            """)
            
            # NEU: Großer Aktions-Button
            if top_priority['scale_name'] in SCALES_WITH_RESOURCES:
                if st.button(f"🎬 Jetzt Videos & Tipps zu '{top_priority['scale_display']}' ansehen", 
                            key="main_action_btn", 
                            use_container_width=True,
                            type="primary"):
                    navigate_to_resources(top_priority['scale_name'])
                    
        elif top_priority:
            st.success(f"""
            **Super!** Du bist in den wichtigsten Bereichen gut aufgestellt.
            
            Deine Stärke **{top_priority['scale_display']}** (d = {top_priority['d_value']}) 
            ist einer der einflussreichsten Faktoren für Schulerfolg - und du hast hier 
            einen guten Wert von {top_priority['score']:.2f}. Nutze diese Stärke!
            """)
    
    # Quellenangabe
    st.divider()
    st.caption("""
    **Quellen:**
    - Hattie, J. (2023). *Visible Learning: The Sequel.* London: Routledge.
    - OECD (2023). *PISA 2022 Results.* Paris: OECD Publishing.
    - Visible Learning MetaX Database: www.visiblelearningmetax.com
    """)


# ============================================
# TAB 4: SUMMARY + RESSOURCEN-BUTTONS
# ============================================

with tab4:
    st.header("📋 Zusammenfassung")
    
    # Summary table
    summary_df = scores_df[['Bereich', 'Wert', 'scale_code']].copy()
    summary_df['Status'] = summary_df.apply(lambda row: interpret_score(row['Wert'], row['scale_code'])[0], axis=1)
    summary_df['Wert_display'] = summary_df['Wert'].apply(lambda x: f"{x:.2f}")
    summary_display = summary_df[['Bereich', 'Wert_display', 'Status']].copy()
    summary_display.columns = ['Bereich', 'Wert', 'Status']
    
    st.dataframe(summary_display, use_container_width=True, hide_index=True)
    
    # ============================================
    # STÄRKEN (korrigiert für inverse Skalen!)
    # ============================================
    st.subheader("✨ Deine Stärken")
    
    strengths = []
    for _, row in scores_df.iterrows():
        scale_code = row['scale_code']
        score = row['Wert']
        
        if is_score_good(score, scale_code):
            strengths.append(row)
    
    if strengths:
        for row in strengths:
            scale_code = row['scale_code']
            if is_negative_scale(scale_code):
                st.markdown(f"- **{row['Bereich']}**: {row['Wert']:.2f} *(niedrig = positiv!)*")
            else:
                st.markdown(f"- **{row['Bereich']}**: {row['Wert']:.2f}")
    else:
        st.info("Fokussiere dich zunächst darauf, eine solide Basis in allen Bereichen aufzubauen.")
    
    # ============================================
    # ENTWICKLUNGSBEREICHE + RESSOURCEN-BUTTONS
    # ============================================
    st.subheader("🎯 Entwicklungsbereiche")
    
    development = []
    for _, row in scores_df.iterrows():
        scale_code = row['scale_code']
        score = row['Wert']
        
        if not is_score_good(score, scale_code):
            development.append(row)
    
    # Sortiere: Kritischste zuerst
    development_sorted = sorted(development, key=lambda r: (
        -r['Wert'] if is_negative_scale(r['scale_code']) else r['Wert']
    ))
    
    if development_sorted:
        for row in development_sorted:
            scale_code = row['scale_code']
            
            # NEU: Zwei Spalten mit Button
            col1, col2 = st.columns([3, 1])
            
            with col1:
                if is_negative_scale(scale_code):
                    if scale_code == 'ANXMAT':
                        st.markdown(f"- **{row['Bereich']}**: {row['Wert']:.2f} *(hoher Wert = mehr Angst)*")
                    elif scale_code == 'BULLIED':
                        st.markdown(f"- **{row['Bereich']}**: {row['Wert']:.2f} *(hoher Wert = mehr Mobbing-Erfahrungen)*")
                    else:
                        st.markdown(f"- **{row['Bereich']}**: {row['Wert']:.2f} *(hoher Wert = negativ)*")
                else:
                    st.markdown(f"- **{row['Bereich']}**: {row['Wert']:.2f}")
            
            with col2:
                if scale_code in SCALES_WITH_RESOURCES:
                    if st.button("🎬", key=f"summary_{scale_code}", help=f"Videos & Tipps zu {row['Bereich']}"):
                        navigate_to_resources(scale_code)
    else:
        st.success("Alle Bereiche liegen im guten Bereich - weiter so!")
    
    # Hinweis zu inversen Skalen
    st.divider()
    st.info("""
    **💡 Hinweis zu Mathe-Angst und Mobbing:**
    
    Bei diesen Skalen gilt: **Niedrig = Gut!**
    - Ein niedriger Wert bei "Mathematik-Angst" bedeutet wenig Angst (positiv!)
    - Ein niedriger Wert bei "Mobbing-Erfahrungen" bedeutet wenig Mobbing (positiv!)
    """)


# ============================================
# SIDEBAR + SCHNELLZUGRIFF
# ============================================

st.sidebar.header("📊 Auswertung")

# Quick stats
avg_score = scores_df['Wert'].mean()
st.sidebar.metric("Durchschnitt", f"{avg_score:.2f} / 4.0")
st.sidebar.metric("Bereiche erfasst", len(scores_df))

# Hattie info
st.sidebar.divider()
st.sidebar.markdown("### 📚 Hattie-Integration")
scales_with_evidence = [s for s in scores_df['scale_code'] if get_hattie_info(s)]
st.sidebar.metric("Mit Hattie-Daten", f"{len(scales_with_evidence)} / {len(scores_df)}")

# NEU: Schnellzugriff zu Ressourcen
st.sidebar.divider()
st.sidebar.markdown("### 🎬 Schnellzugriff")
for scale in ['MATHEFF', 'ANXMAT', 'GROSAGR']:
    if scale in [row['scale_code'] for _, row in scores_df.iterrows()]:
        scale_info = get_scale_info(scale)
        display = scale_info.get('name_de', scale) if scale_info else scale
        if st.sidebar.button(f"📚 {display}", key=f"sidebar_{scale}", use_container_width=True):
            navigate_to_resources(scale)

st.sidebar.divider()

# Actions
if st.sidebar.button("🔄 Neues Screening", use_container_width=True):
    st.switch_page(get_page_path("screening"))

st.sidebar.divider()

# Info
st.sidebar.info("""
**ℹ️ Neu: Ressourcen-Seite**

Klicke bei jedem Bereich auf 
"🎬 Videos & Tipps" um konkrete 
Verbesserungsstrategien zu sehen!
""")

st.sidebar.caption(f"Basierend auf {sum(scores_df['items_count'])} beantworteten Fragen")
