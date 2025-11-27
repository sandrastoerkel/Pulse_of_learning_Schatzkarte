"""
Selbstwirksamkeit (MATHEFF) Content mit Altersstufen.

Enthält die render_matheff_altersstufen Funktion für die Ressourcen-Seite.
"""

import streamlit as st

# Versuche Gamification-Module zu importieren
try:
    from utils.hattie_challenge_widget import render_hattie_challenge_widget
    from utils.bandura_sources_widget import render_bandura_sources_widget
    HAS_GAMIFICATION = True
except ImportError:
    HAS_GAMIFICATION = False


def render_matheff_altersstufen(color: str):
    """Rendert die Selbstwirksamkeits-Ressource mit Challenges + Theorie-Tabs"""

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
            _render_grundschule_content()

        # ==========================================
        # UNTERSTUFE CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "unterstufe":
            _render_unterstufe_content()

        # ==========================================
        # MITTELSTUFE CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "mittelstufe":
            _render_mittelstufe_content()

        # ==========================================
        # OBERSTUFE CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "oberstufe":
            _render_oberstufe_content()

        # ==========================================
        # PÄDAGOGEN CONTENT
        # ==========================================
        elif st.session_state.selected_age_group == "paedagogen":
            _render_paedagogen_content()

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
# PRIVATE HELPER FUNCTIONS
# ============================================

def _render_grundschule_content():
    """Rendert den Grundschule-Content für Selbstwirksamkeit."""
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


def _render_unterstufe_content():
    """Rendert den Unterstufe-Content für Selbstwirksamkeit."""
    st.header("💪 Mental stark – Dein Gehirn ist trainierbar")

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


def _render_mittelstufe_content():
    """Rendert den Mittelstufe-Content für Selbstwirksamkeit."""
    st.header("💪 Mental stark – Die Psychologie hinter deinem Erfolg")

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


def _render_oberstufe_content():
    """Rendert den Oberstufe-Content für Selbstwirksamkeit."""
    st.header("💪 Mental stark – Selbstwirksamkeit als Meta-Kompetenz")

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


def _render_paedagogen_content():
    """Rendert den Pädagogen-Content für Selbstwirksamkeit."""
    st.header("💪 Mental stark – Für Pädagogen")

    st.info("""
    🚧 **Dieser Bereich wird gerade erstellt.**

    Hier finden Sie bald:
    - Didaktische Implementierungshinweise
    - Materialien für den Unterricht
    - Evidenzbasierte Empfehlungen zur Förderung der Selbstwirksamkeit
    """)
