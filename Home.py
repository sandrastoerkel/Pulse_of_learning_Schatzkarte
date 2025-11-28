"""
🎓 Pulse of Learning - Lerncoaching-Plattform

Evidenzbasierte Lerndiagnostik und -förderung auf Basis von PISA 2022

Version: 1.0 Commercial
"""

import streamlit as st
import sys
sys.path.append('.')

from utils.coaching_db import init_database

# ============================================
# PAGE CONFIG
# ============================================

st.set_page_config(
    page_title="Pulse of Learning - Lerncoaching",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================
# PASSWORT-SCHUTZ
# ============================================

def check_password():
    """Prüft ob das richtige Passwort eingegeben wurde."""
    if "password_correct" not in st.session_state:
        st.session_state.password_correct = False

    if st.session_state.password_correct:
        return True

    st.title("🔐 Pulse of Learning")
    st.markdown("### Bitte Passwort eingeben")

    password = st.text_input("Passwort:", type="password", key="password_input")

    if st.button("Einloggen"):
        if password == "2904":
            st.session_state.password_correct = True
            st.rerun()
        else:
            st.error("Falsches Passwort!")

    return False

if not check_password():
    st.stop()

# ============================================
# DATABASE INITIALIZATION
# ============================================

# Initialize database
init_database()

# ============================================
# MAIN APP
# ============================================

st.title("🎓 Pulse of Learning")
st.markdown("### Evidenzbasierte Lerndiagnostik und -förderung")

st.markdown("""
Willkommen bei **Pulse of Learning** – Ihrer professionellen Plattform für
wissenschaftlich fundierte Lerndiagnostik und individualisierte Förderplanung.

---

### 📊 Was bietet diese Plattform?

Diese Anwendung kombiniert **PISA-Forschung** mit **praktischer Lernförderung**:

1. **PISA-Forschungsgrundlage** 📖
   - Verstehen Sie die wissenschaftlichen Grundlagen
   - Erfahren Sie, welche Faktoren Lernerfolg beeinflussen
   - Basiert auf 6.116 deutschen PISA-Schülern

2. **Elternakademie** 🎓
   - Informationsmaterial für Eltern
   - Erklärung wichtiger Konzepte
   - Handlungsempfehlungen für zuhause

3. **Screening-Diagnostik** 🔍
   - Standardisierte PISA-Fragebögen
   - Schnelles Screening (15 Min) oder umfassende Diagnostik (45 Min)
   - Individuelle Schülerprofile erstellen

4. **Auswertung mit Hattie-Interpretation** 📊
   - Visuelle Darstellung der Ergebnisse
   - Vergleich mit PISA-Benchmarks
   - Evidenzbasierte Handlungsempfehlungen nach Hattie

5. **Ressourcen & Interventionen** 📚
   - Konkrete Fördermaßnahmen für jeden Bereich
   - Videos, Artikel, Übungen
   - Wissenschaftlich fundierte Interventionen

---

### 🎯 Für wen ist diese Plattform?

✅ **Lehrkräfte**: Identifizieren Sie Stärken und Förderbedarf Ihrer Schüler

✅ **Schulleitungen**: Datenbasierte Schulentwicklung

✅ **Lerncoaches**: Professionelle Diagnostik und Förderplanung

✅ **Eltern**: Verstehen Sie die Lernsituation Ihres Kindes besser

---

### 🔬 Wissenschaftliche Fundierung

Alle Instrumente basieren auf:

- **PISA 2022**: Weltweit größte Schulleistungsstudie (OECD)
- **Validierte Skalen**: IRT-skaliert, hohe Reliabilität (Cronbach's α > 0.70)
- **Evidenzbasierte Interventionen**: Nach Hattie, Bandura, Dweck u.a.
- **Machine Learning**: XGBoost-Modelle zur Identifikation relevanter Faktoren

---

### 🚀 Los geht's!

Wählen Sie eine Seite aus der **Sidebar** (links):

""")

col1, col2, col3 = st.columns(3)

with col1:
    st.info("""
    **📖 Neu hier?**

    Starten Sie mit der
    **PISA-Forschungsgrundlage**

    → Verstehen Sie die Theorie
    """)

with col2:
    st.success("""
    **🔍 Screening durchführen?**

    Gehen Sie zur
    **Screening-Diagnostik**

    → Schüler erfassen und testen
    """)

with col3:
    st.warning("""
    **📊 Ergebnisse ansehen?**

    Besuchen Sie die
    **Auswertung**

    → Analyse und Empfehlungen
    """)

st.divider()

# ============================================
# QUICK START GUIDE
# ============================================

with st.expander("📘 Quick Start Guide", expanded=False):
    st.markdown("""
    ### Schnellstart in 5 Schritten:

    #### 1️⃣ **Grundlagen verstehen** (5 Min)
    - Lesen Sie die **PISA-Forschungsgrundlage** (Seite 1)
    - Verstehen Sie die Quadranten-Analyse
    - Lernen Sie die wichtigsten Einflussfaktoren kennen

    #### 2️⃣ **Schüler anlegen** (2 Min)
    - Gehen Sie zur **Screening-Diagnostik** (Seite 3)
    - Klicken Sie auf "➕ Neuer Schüler"
    - Geben Sie Name, Klasse, Geschlecht ein

    #### 3️⃣ **Screening durchführen** (15-45 Min)
    - Wählen Sie Screening-Level:
      - **Level 1**: Schnell-Screening (15 Min, 4 Skalen)
      - **Level 2**: Standard-Screening (30 Min, 7 Skalen)
      - **Level 3**: Umfassendes Screening (45 Min, 10 Skalen)
    - Schüler beantwortet die Fragen
    - Speichern Sie die Ergebnisse

    #### 4️⃣ **Ergebnisse analysieren** (5 Min)
    - Öffnen Sie die **Auswertung** (Seite 4)
    - Sehen Sie Ampel-System und PISA-Vergleich
    - Lesen Sie die Hattie-Interpretation
    - Identifizieren Sie Stärken und Förderbedarf

    #### 5️⃣ **Maßnahmen umsetzen** (variabel)
    - Klicken Sie auf **Ressourcen** (Seite 5)
    - Wählen Sie passende Interventionen
    - Nutzen Sie Videos, Übungen, Materialien
    - Dokumentieren Sie den Fortschritt

    ---

    **💡 Tipp**: Speichern Sie diese Seite als Lesezeichen für schnellen Zugriff!
    """)

# ============================================
# FEATURE HIGHLIGHTS
# ============================================

st.markdown("### ✨ Highlights dieser Plattform")

highlight_cols = st.columns(2)

with highlight_cols[0]:
    st.markdown("""
    **🔬 Wissenschaftlich fundiert**
    - Original PISA-Skalen
    - Validierte Instrumente
    - Evidenzbasierte Empfehlungen

    **📊 Aussagekräftige Diagnostik**
    - Standardisierte Fragebögen
    - PISA-Benchmark-Vergleich
    - Individuelle Schülerprofile

    **🎯 Handlungsorientiert**
    - Konkrete Fördermaßnahmen
    - Priorisierung nach Wirksamkeit
    - Materialien und Übungen
    """)

with highlight_cols[1]:
    st.markdown("""
    **👥 Nutzerfreundlich**
    - Intuitive Bedienung
    - Klare Visualisierungen
    - Keine Installation nötig

    **💾 Datenschutzkonform**
    - Lokale Datenspeicherung
    - Keine Cloud-Übertragung
    - DSGVO-konform

    **🔄 Flexibel**
    - Verschiedene Screening-Level
    - Anpassbar an Schulstufen
    - Wiederholbare Messungen
    """)

st.divider()

# ============================================
# FOOTER
# ============================================

st.markdown("""
<div style="text-align: center; color: #888; font-size: 14px; padding: 20px;">
    <p>
        <strong>Pulse of Learning</strong> – Lerncoaching-Plattform v1.0<br>
        Basierend auf PISA 2022 Deutschland (N=6.116)<br>
        <br>
        📧 Kontakt: <a href="mailto:info@pulseoflearning.de">info@pulseoflearning.de</a><br>
        📖 Dokumentation: <a href="https://github.com/sandrastoerkel/Pulse_of_Learning_Commercial">GitHub</a>
    </p>
    <p style="font-size: 12px; margin-top: 10px;">
        © 2025 Sandra Störkel. Alle Rechte vorbehalten.<br>
        PISA® ist eine eingetragene Marke der OECD.
    </p>
</div>
""", unsafe_allow_html=True)

# ============================================
# SIDEBAR INFO
# ============================================

with st.sidebar:
    st.image("https://via.placeholder.com/300x100/4CAF50/FFFFFF?text=Pulse+of+Learning", use_container_width=True)

    st.divider()

    st.markdown("### 🎓 Navigation")
    st.markdown("""
    **1. PISA-Forschungsgrundlage**
    Wissenschaftliche Basis

    **2. Elternakademie**
    Informationsmaterial

    **3. Screening-Diagnostik**
    Schüler testen

    **4. Auswertung**
    Ergebnisse analysieren

    **5. Ressourcen**
    Fördermaßnahmen
    """)

    st.divider()

    st.success("""
    **💡 Erste Schritte**

    1. Grundlagen lesen
    2. Schüler anlegen
    3. Screening durchführen
    4. Ergebnisse auswerten
    5. Maßnahmen umsetzen
    """)

    st.divider()

    st.info("""
    **📊 Aktueller Stand**

    - PISA 2022 Daten
    - 58+ validierte Skalen
    - 200+ Fragebogen-Items
    - Hattie-Effektstärken
    """)
