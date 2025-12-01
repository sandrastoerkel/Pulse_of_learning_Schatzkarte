"""
Wieder Bock aufs Lernen (EXT_MOTIV) Content mit Altersstufen.

Enthält die render_motivation_altersstufen Funktion für die Ressourcen-Seite.
Basiert auf: Deci & Ryan (Selbstbestimmungstheorie), Hattie (Visible Learning),
Birkenbihl (Gehirn-gerechtes Lernen), PISA 2022.

Stil: MaiThink X (Mai Thi Nguyen-Kim) - wissenschaftlich fundiert, aber cool erklärt.
"""

import streamlit as st


def render_motivation_altersstufen(color: str):
    """Rendert die Motivations-Ressource mit Challenges + Theorie-Tabs"""

    tab_interaktiv, tab_theorie = st.tabs([
        "🎮 Challenges",
        "📚 Theorie dahinter"
    ])

    # ==========================================
    # TAB 1: CHALLENGES (Platzhalter)
    # ==========================================
    with tab_interaktiv:
        st.header("🎮 Motivations-Challenges")

        col1, col2 = st.columns([2, 1])

        with col1:
            st.markdown("""
            Trainiere deine Motivation durch **konkrete Aktionen** –
            basierend auf der Selbstbestimmungstheorie (Deci & Ryan).

            **So funktioniert's:**
            1. Identifiziere, was dir gerade fehlt (Sinn? Erfolge? Menschen?)
            2. Wähle eine passende Mini-Challenge
            3. Dokumentiere deine Erfahrung
            4. Sammle XP und Badges!
            """)

        with col2:
            st.info("""
            🔬 **Wissenschaft:**

            Motivation entsteht, wenn
            3 Grundbedürfnisse erfüllt sind:
            - **Autonomie** (Ich entscheide)
            - **Kompetenz** (Ich kann das)
            - **Verbundenheit** (Ich gehöre dazu)

            *(Deci & Ryan, 1985)*
            """)

        st.divider()

        # Platzhalter für zukünftige Challenges
        st.info("""
        🚧 **Interaktive Motivations-Challenges werden entwickelt...**

        Geplante Challenges:
        - 🎯 **Die ABC-Challenge:** Aktiviere dein Vorwissen in 3 Minuten
        - 🤝 **Die Buddy-Challenge:** Finde deinen Lern-Partner
        - 🧠 **Die WOZU-Challenge:** Finde deinen persönlichen Grund
        - ⚡ **Die Mikro-Entscheidungs-Challenge:** Hol dir Kontrolle zurück

        Schau solange im Tab "Theorie dahinter" vorbei – da findest du alle Strategien!
        """)

        # Fallback: Manuelle Version
        st.markdown("---")
        st.subheader("📝 Schnellstart (ohne Login)")

        with st.expander("🎯 Die 5-Minuten-Motivation", expanded=True):
            st.markdown("""
            **Wenn du JETZT keinen Bock hast, mach das:**

            | Schritt | Frage | Deine Antwort |
            |---------|-------|---------------|
            | 1️⃣ WOZU? | "Wenn ich das kann, dann..." | _______________ |
            | 2️⃣ WAS WEISS ICH? | ABC-Liste (A-Z, 3 Min) | ___ Wörter |
            | 3️⃣ WER HILFT? | Buddy anschreiben | Name: ___________ |
            | 4️⃣ WAS ENTSCHEIDE ICH? | Wann, Wo, Womit? | _______________ |
            | 5️⃣ WORST CASE? | "Das Schlimmste wäre..." | _______________ |

            **Warum das funktioniert:** Jeder Schritt erfüllt ein Grundbedürfnis
            (Sinn → Kompetenz → Verbundenheit → Autonomie → Angst reduzieren).
            """)

        with st.expander("🧠 Die ABC-Liste nach Birkenbihl", expanded=False):
            st.markdown("""
            **So geht's:**
            1. Schreib A-Z untereinander auf ein Blatt
            2. Wähle dein Thema (z.B. "Französische Revolution")
            3. Schreib zu jedem Buchstaben, was dir einfällt
            4. Spring rum – nicht von A nach Z, sondern wie's kommt!
            5. Zähl die Wörter

            **Mach das VOR und NACH dem Lernen.**
            Die Differenz = Dein sichtbarer Fortschritt = Dopamin = Motivation 🔥

            *"Das Alphabet ist wie ein Haken, an dem dein Wissen hängt."*
            – Vera F. Birkenbihl
            """)

    # ==========================================
    # TAB 2: THEORIE DAHINTER (mit Altersstufen-Auswahl)
    # ==========================================
    with tab_theorie:
        # Altersstufen-Auswahl als Buttons
        st.markdown("### Wähle deine Altersstufe:")

        col1, col2, col3, col4, col5 = st.columns(5)

        # Session State für Altersstufe initialisieren (separater Key für Motivation)
        if "selected_age_group_motivation" not in st.session_state:
            st.session_state.selected_age_group_motivation = "mittelstufe"

        with col1:
            if st.button("🎒 Grundschule\n(1-4)", key="btn_motiv_gs", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_motivation == "grundschule" else "secondary"):
                st.session_state.selected_age_group_motivation = "grundschule"
                st.rerun()

        with col2:
            if st.button("📚 Unterstufe\n(5-7)", key="btn_motiv_us", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_motivation == "unterstufe" else "secondary"):
                st.session_state.selected_age_group_motivation = "unterstufe"
                st.rerun()

        with col3:
            if st.button("🎯 Mittelstufe\n(8-10)", key="btn_motiv_ms", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_motivation == "mittelstufe" else "secondary"):
                st.session_state.selected_age_group_motivation = "mittelstufe"
                st.rerun()

        with col4:
            if st.button("🎓 Oberstufe\n(11-13)", key="btn_motiv_os", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_motivation == "oberstufe" else "secondary"):
                st.session_state.selected_age_group_motivation = "oberstufe"
                st.rerun()

        with col5:
            if st.button("👩‍🏫 Pädagogen", key="btn_motiv_ped", use_container_width=True,
                        type="primary" if st.session_state.selected_age_group_motivation == "paedagogen" else "secondary"):
                st.session_state.selected_age_group_motivation = "paedagogen"
                st.rerun()

        st.divider()

        # Content je nach Altersstufe
        if st.session_state.selected_age_group_motivation == "grundschule":
            _render_grundschule_content()
        elif st.session_state.selected_age_group_motivation == "unterstufe":
            _render_unterstufe_content()
        elif st.session_state.selected_age_group_motivation == "mittelstufe":
            _render_mittelstufe_content()
        elif st.session_state.selected_age_group_motivation == "oberstufe":
            _render_oberstufe_content()
        elif st.session_state.selected_age_group_motivation == "paedagogen":
            _render_paedagogen_content()

    # ==========================================
    # ZUSAMMENFASSUNG AM ENDE (außerhalb der Tabs)
    # ==========================================
    st.divider()
    st.subheader("📋 Zusammenfassung aller Altersstufen")
    st.markdown("""
    | Altersstufe | Kernbotschaft | Hauptstrategie |
    |-------------|---------------|----------------|
    | 🎒 Grundschule | "Entdecker-Modus AN!" | Neugier wecken, kleine Erfolge feiern |
    | 📚 Unterstufe | "Finde DEINEN Grund" | ABC-Liste, Lern-Buddy finden |
    | 🎯 Mittelstufe | "Hack dein Gehirn" | 5-Schritte-Plan, Deep statt Surface |
    | 🎓 Oberstufe | "Die Forschung ist auf deiner Seite" | Selbstdiagnostik, wissenschaftliche Strategien |
    | 👩‍🏫 Pädagogen | "Autonomie fördern, nicht erzwingen" | Wahlmöglichkeiten, Relevanz zeigen |
    """)


# ============================================
# PRIVATE HELPER FUNCTIONS FÜR ALTERSSTUFEN
# ============================================

def _render_grundschule_content():
    """Rendert den Grundschul-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Grundschule")
    st.caption("Für Kinder (1.-4. Klasse) und ihre Eltern")

    st.markdown("""
    ### 🦸 Du bist ein Entdecker!

    Weißt du, was Forscher und Entdecker machen? Sie stellen Fragen!

    - **Warum ist der Himmel blau?**
    - **Wie funktioniert ein Handy?**
    - **Woher kommt die Milch wirklich?**

    Und dann suchen sie die Antworten. Das ist Lernen! Nicht langweilig,
    sondern wie eine Schatzsuche. 🗺️
    """)

    with st.expander("🎯 **Trick 1: Die Warum-Frage**", expanded=True):
        st.markdown("""
        Wenn du etwas lernst, frag dich:

        > **"Warum ist das cool?"**

        **Beispiele:**
        - Rechnen → *"Damit ich weiß, ob mein Taschengeld reicht!"*
        - Lesen → *"Damit ich die Minecraft-Anleitungen verstehe!"*
        - Schreiben → *"Damit ich meiner Oma einen Brief schicken kann!"*

        Wenn du einen Grund findest, macht Lernen mehr Spaß!
        """)

    with st.expander("🌟 **Trick 2: Kleine Erfolge sammeln**"):
        st.markdown("""
        Mach dir eine **Erfolgs-Schatzkiste**! 📦

        Jedes Mal wenn du etwas geschafft hast:
        - Schreib es auf einen Zettel
        - Wirf den Zettel in die Kiste
        - Wenn du traurig bist: Lies die Zettel!

        **Beispiele für Erfolge:**
        - ✅ Ich hab 5 neue Wörter gelernt
        - ✅ Ich hab eine Mathe-Aufgabe alleine gelöst
        - ✅ Ich hab ein Buch fertig gelesen

        *Dein Gehirn liebt es, Erfolge zu sammeln!*
        """)

    with st.expander("👀 **Trick 3: Schau anderen zu**"):
        st.markdown("""
        Kennst du jemanden, der etwas gut kann?

        - Dein großer Bruder kann gut rechnen?
        - Deine Freundin kann toll malen?
        - Dein Papa kann Geschichten erzählen?

        **Frag sie:** *"Wie hast du das gelernt?"*

        Meistens sagen sie: *"Am Anfang konnte ich das auch nicht!"*

        Das bedeutet: **DU kannst das auch lernen!** 💪
        """)

    with st.expander("🎮 **Trick 4: Mach ein Spiel draus**"):
        st.markdown("""
        Lernen ist wie ein Computerspiel:
        - Du startest auf Level 1
        - Du übst und wirst besser
        - Manchmal verlierst du – aber dann versuchst du es nochmal!
        - Irgendwann schaffst du das Level!

        **Idee:** Gib dir selbst Punkte!
        - 1 Punkt für jede Aufgabe, die du versuchst
        - 2 Punkte für jede Aufgabe, die du schaffst
        - 5 Punkte, wenn du etwas Neues verstehst!

        Wie viele Punkte schaffst du heute? 🎯
        """)

    # Quick Reference Box
    st.success("""
    ### ✨ Das Wichtigste für Grundschüler:

    1. **Frag "WARUM?"** – Finde heraus, wozu du das brauchst
    2. **Sammel Erfolge** – Schreib auf, was du geschafft hast
    3. **Frag andere** – Jeder hat mal klein angefangen
    4. **Mach ein Spiel draus** – Gib dir selbst Punkte!

    *"Jeder Experte war mal ein Anfänger!"* 🌱
    """)


def _render_unterstufe_content():
    """Rendert den Unterstufen-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Unterstufe")
    st.caption("Für Schüler der 5.-7. Klasse")

    st.markdown("""
    ### Die unbequeme Wahrheit

    Okay, lass uns ehrlich sein: Manchmal ist Schule echt nervig.

    **Die gute Nachricht:** Das liegt meistens nicht an dir.
    **Die noch bessere Nachricht:** Du kannst was dagegen tun.

    Hier sind die Tricks, die wirklich funktionieren – laut Wissenschaft,
    nicht laut "das haben wir schon immer so gemacht".
    """)

    with st.expander("🎯 **Trick 1: Finde DEINEN Grund**", expanded=True):
        st.markdown("""
        Die meisten Schüler lernen für:
        - Die Note ❌
        - Die Eltern ❌
        - Den Lehrer ❌

        Das Problem: Dein Gehirn findet das langweilig.

        **Besser:** Finde DEINEN Grund!

        | Fach | Nerviger Grund | DEIN Grund |
        |------|----------------|------------|
        | Englisch | "Ich muss das für die Arbeit können" | "Ich kann YouTube-Videos ohne Untertitel gucken" |
        | Mathe | "Das kommt in der Prüfung dran" | "Ich kann ausrechnen, ob der Sale wirklich günstiger ist" |
        | Bio | "Steht im Lehrplan" | "Ich verstehe, warum ich nach Sport so kaputt bin" |

        **Deine Aufgabe:** Schreib zu einem Fach auf:
        > *"Wenn ich das kann, dann kann ich __________."*
        """)

    with st.expander("📝 **Trick 2: Die ABC-Liste**"):
        st.markdown("""
        Das ist ein Trick von Vera F. Birkenbihl (eine berühmte Lernforscherin).

        **So geht's:**
        1. Schreib A bis Z untereinander auf ein Blatt
        2. Wähle ein Thema (z.B. "Das Römische Reich")
        3. Schreib zu jedem Buchstaben, was dir einfällt
        4. Spring rum – nicht von A nach Z!
        5. Zähl die Wörter

        **Beispiel:**
        ```
        A - Augustus, Armee
        B - Brot und Spiele
        C - Cäsar
        D - (noch leer)
        E - Expansion
        ...
        ```

        **Der Trick:** Mach das VOR und NACH dem Lernen.
        - Vorher: 12 Wörter
        - Nachher: 28 Wörter
        - **Dein Fortschritt: +16 Wörter!** 🎉

        Das ist SICHTBAR. Und dein Gehirn liebt sichtbaren Fortschritt!
        """)

    with st.expander("👥 **Trick 3: Hol dir einen Buddy**"):
        st.markdown("""
        **Fun Fact:** Eine Studie aus Greifswald hat 1.088 Schüler gefragt:
        *"Wer motiviert dich?"*

        | Quelle | Prozent |
        |--------|---------|
        | **Andere Schüler** | **34%** |
        | Ich selbst | 29% |
        | Lehrer UND Schüler | 27% |
        | Nur Lehrer | 10% |

        **Das heißt:** Deine Freunde sind dein größter Motivations-Hack!

        **So geht's:**
        1. Such dir einen Lern-Buddy (WhatsApp, Discord, egal)
        2. Ihr lernt getrennt
        3. Ihr trefft euch und erklärt euch gegenseitig
        4. Wer's nicht erklären kann, hat's nicht verstanden

        *"Wenn du etwas nicht einfach erklären kannst,
        hast du es nicht verstanden."* – Albert Einstein
        """)

    with st.expander("🚫 **Trick 4: Motivations-Killer vermeiden**"):
        st.markdown("""
        Diese Dinge killen deine Motivation:

        | Killer | Warum | Was stattdessen |
        |--------|-------|-----------------|
        | "Ich MUSS das lernen" | Dein Gehirn hasst Zwang | "Ich WILL das verstehen" |
        | Alles auf einmal | Überforderung | Kleine Häppchen (25 Min) |
        | Nur lesen, nicht machen | Langweilig | Selbst Fragen beantworten |
        | Alleine kämpfen | Frustrierend | Buddy fragen |
        | Kein Ziel | Sinnlos-Gefühl | "Wozu brauche ich das?" |

        **Der schlimmste Killer:** Nur für die Note lernen!

        Forscher nennen das "Surface Motivation" – und die hat laut
        John Hattie einen **NEGATIVEN Effekt** (d = -0.11).

        Lies das nochmal: Nur für die Note lernen macht dich SCHLECHTER. 🤯
        """)

    # Quick Reference Box
    st.success("""
    ### ⚡ Quick Reference – Unterstufe

    **Wenn du keinen Bock hast:**

    1. **WOZU?** → Finde DEINEN Grund ("Wenn ich das kann, dann...")
    2. **ABC-Liste** → Zeigt dir deinen Fortschritt
    3. **Buddy** → Schreib jetzt jemandem: "Wollen wir zusammen lernen?"
    4. **Killer vermeiden** → Nicht "müssen", sondern "wollen"

    *"Motivation kommt nicht VOR dem Anfangen – sondern WÄHREND."*
    """)


def _render_mittelstufe_content():
    """Rendert den Mittelstufen-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Mittelstufe")
    st.caption("Für Schüler der 8.-10. Klasse")

    st.markdown("""
    ### Das Motivations-Problem, das du kennst

    Hand aufs Herz: Wann hattest du das letzte Mal *richtig* Bock zu lernen?

    Nicht dieses "ich muss noch für die Klausur lernen"-Gefühl.
    Sondern echtes Interesse. Diese Neugier, bei der du vergisst, auf die Uhr zu schauen.

    Falls du jetzt denkst: *"Äh, nie?"* – dann bist du nicht allein.

    **PISA 2022:** Nur **59%** der deutschen Schüler können sich selbst zum Lernen motivieren.
    Das heißt: Fast die Hälfte von euch sitzt in der Schule und denkt: *"Warum bin ich hier?"*

    **Plot Twist:** Das liegt nicht an dir. Das liegt am System.
    """)

    with st.expander("🧠 **Die Wissenschaft: Was dein Gehirn WIRKLICH braucht**", expanded=True):
        st.markdown("""
        Die Psychologen Edward Deci und Richard Ryan haben das erforscht.
        Ergebnis: Dein Gehirn braucht **drei Dinge**, um motiviert zu sein:

        | Grundbedürfnis | Bedeutet | Wenn's fehlt |
        |----------------|----------|--------------|
        | **🎯 Autonomie** | Ich entscheide selbst | "Ich MUSS das" → Kein Bock |
        | **💪 Kompetenz** | Ich kann das schaffen | "Ich bin zu dumm" → Aufgeben |
        | **👥 Verbundenheit** | Ich gehöre dazu | "Keiner hilft mir" → Frust |

        **Das ist keine Meinung – das ist Forschung.**
        Die Selbstbestimmungstheorie ist eine der am besten belegten Theorien der Psychologie.

        **Und jetzt kommt's:** Die Schule ignoriert oft alle drei. 🤷
        - Du entscheidest nicht, WAS du lernst (Autonomie ❌)
        - Du siehst selten deinen Fortschritt (Kompetenz ❌)
        - Du lernst oft alleine (Verbundenheit ❌)

        Kein Wunder, dass du keinen Bock hast!
        """)

    with st.expander("📊 **Der Plot Twist: Surface vs. Deep Learning**"):
        st.markdown("""
        John Hattie hat über **1.800 Meta-Studien** mit **300 Millionen Schülern** analysiert.
        Sein Ergebnis wird dich überraschen:

        | Art der Motivation | Effektstärke | Bedeutung |
        |--------------------|--------------|-----------|
        | **Deep Motivation** (Verstehen wollen) | d = 0.69 | 🔥 Sehr wirksam! |
        | Allgemeine Motivation | d = 0.42 | ✅ Okay |
        | **Surface Motivation** (Nur für die Note) | d = -0.11 | ❌ **SCHADET!** |

        Lies das nochmal: **Nur für die Note zu lernen hat einen NEGATIVEN Effekt.**

        Das ist, als würdest du ins Fitnessstudio gehen, aber nur um ein Selfie zu machen.
        Technisch warst du da. Aber fitter wirst du davon nicht.

        **Was ist Deep Motivation?**
        - Du willst es VERSTEHEN, nicht nur auswendig lernen
        - Du fragst "Warum?" und "Wie hängt das zusammen?"
        - Du verbindest neues Wissen mit dem, was du schon weißt

        **Was ist Surface Motivation?**
        - Du lernst nur, was "drankommt"
        - Du merkst dir Fakten, ohne sie zu verstehen
        - Nach der Klausur ist alles wieder weg
        """)

    with st.expander("⚠️ **Der Korrumpierungseffekt: Warum Belohnungen gefährlich sind**"):
        st.markdown("""
        *"Wenn du eine Eins schreibst, kriegst du 20 Euro."*

        Klingt nach einem guten Deal, oder?

        **Plot Twist:** Der Psychologe Edward Deci hat 1971 ein Experiment gemacht.
        Kinder sollten Puzzles lösen. Eine Gruppe wurde belohnt, die andere nicht.

        **Ergebnis:** Die belohnten Kinder hatten DANACH **weniger Interesse**
        an den Puzzles als die nicht-belohnten!

        Das nennt sich **Korrumpierungseffekt**:
        > Externe Belohnungen können deine innere Motivation zerstören.

        Dein Gehirn denkt: *"Ah, ich mache das nur wegen des Geldes.
        Also ist es wohl langweilig."*

        **Aber Achtung:** Das passiert nur, wenn du die Belohnung als **Kontrolle** empfindest.
        Wenn du sie als **Feedback** siehst ("Hey, das hast du echt gut gemacht!"),
        kann sie sogar helfen.

        **Die Regel:** Lob > Geld. Fortschritt sehen > Belohnung kriegen.
        """)

    with st.expander("🛠️ **Der 5-Schritte-Plan: So kriegst du wieder Bock**", expanded=True):
        st.markdown("""
        Hier ist der konkrete Plan, wenn die Motivation im Keller ist:

        ---

        **SCHRITT 1: Finde DEINEN Grund (3 Min)**

        Nicht "Ich lerne für die Klausur", sondern:
        > **"Was wäre cool, wenn ich das könnte?"**

        Schreib auf: *"Wenn ich [Thema] kann, dann kann ich __________."*

        ---

        **SCHRITT 2: Mach eine ABC-Liste (5 Min)**

        Das ist ein Trick von Vera F. Birkenbihl:
        1. A-Z untereinander schreiben
        2. Thema wählen
        3. Zu jedem Buchstaben schreiben, was dir einfällt
        4. Zählen: ___ Wörter

        **Mach das VOR und NACH dem Lernen.** Die Differenz ist dein Fortschritt!

        ---

        **SCHRITT 3: Hol dir einen Buddy**

        34% der Motivation kommt von anderen Schülern (Greifswald-Studie).

        Schreib JETZT jemandem: *"Hey, wollen wir zusammen für ___ lernen?"*

        ---

        **SCHRITT 4: Triff Mikro-Entscheidungen**

        Du kannst nicht entscheiden, WAS du lernst. Aber du kannst entscheiden:
        - **WANN:** Jetzt? Nach dem Essen? Morgens?
        - **WO:** Schreibtisch? Café? Bett? (Ja, das ist erlaubt)
        - **WIE LANGE:** 25 Min Pomodoro? 45 Min Blöcke?
        - **WOMIT:** Buch? Video? Karteikarten?

        Jede Mini-Entscheidung gibt dir Kontrolle zurück. Dein Gehirn denkt:
        *"Okay, ICH mache das hier. Nicht jemand anderes."*

        ---

        **SCHRITT 5: Senke den Druck**

        Frag dich: *"Was passiert WIRKLICH, wenn ich das verkacke?"*

        Meistens: Eine schlechte Note. Nicht cool, aber auch nicht das Ende der Welt.

        Und dann: *"Kann ich damit leben?"*

        Spoiler: Ja, kannst du.
        """)

    with st.expander("⏰ **Prokrastination: Warum du aufschiebst (und was hilft)**"):
        st.markdown("""
        Prokrastination ist nicht Faulheit. Es ist ein Bewältigungsmechanismus.

        **Warum du aufschiebst:**
        | Grund | Was dein Gehirn denkt | Was hilft |
        |-------|----------------------|-----------|
        | Angst vor Versagen | "Wenn ich's nicht versuche, kann ich auch nicht scheitern" | Worst Case durchdenken |
        | Überforderung | "Das ist zu viel, ich weiß nicht wo anfangen" | Kleinster möglicher Schritt |
        | Perfektionismus | "Wenn ich's nicht perfekt mache, lohnt es sich nicht" | "Fertig > Perfekt" |
        | Kein Sinn | "Wozu brauche ich das überhaupt?" | DEINEN Grund finden |

        **Der beste Anti-Prokrastinations-Trick:**

        > **Die 2-Minuten-Regel:** Wenn etwas weniger als 2 Minuten dauert, mach es JETZT.

        Und für größere Sachen:

        > **Die Kleinster-Schritt-Regel:** Was ist der KLEINSTE Schritt, den du machen kannst?

        Nicht: "Ich muss das ganze Kapitel lernen"
        Sondern: "Ich lese die erste Seite"

        Dein Gehirn hat weniger Angst vor kleinen Aufgaben.
        Und meistens machst du dann eh weiter.
        """)

    # Die Notfall-Karte
    st.warning("""
    ### 🆘 NOTFALL-KARTE (Screenshot machen!)

    ```
    WENN ICH KEINEN BOCK HABE:

    1. WOZU?      → "Wenn ich das kann, dann..."
    2. ABC-LISTE  → 3 Min, zeigt was ich schon weiß
    3. BUDDY      → Jemanden anschreiben
    4. ENTSCHEIDE → Wann, Wo, Wie
    5. WORST CASE → "Das Schlimmste wäre... und das überlebe ich"
    ```
    """)

    # Quick Reference
    st.success("""
    ### ⚡ Das Wichtigste – Mittelstufe

    1. **Surface Learning schadet** (d = -0.11) → Lerne zum VERSTEHEN, nicht für die Note
    2. **3 Grundbedürfnisse:** Autonomie + Kompetenz + Verbundenheit = Motivation
    3. **Belohnungen können schaden** (Korrumpierungseffekt) → Fortschritt > Belohnung
    4. **34% der Motivation** kommt von Mitschülern → Buddy suchen!
    5. **5-Schritte-Plan:** WOZU → ABC-Liste → Buddy → Mikro-Entscheidungen → Druck senken

    *"Motivation kommt nicht vor dem Anfangen – sondern während."*
    """)


def _render_oberstufe_content():
    """Rendert den Oberstufen-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Oberstufe")
    st.caption("Für Schüler der 11.-13. Klasse")

    st.markdown("""
    ### Die wissenschaftliche Perspektive

    Du bist alt genug für die ungeschönte Wahrheit.
    Also hier sind die Daten – und was sie für dich bedeuten.
    """)

    # PISA-Daten
    with st.expander("📊 **PISA 2022: Die Zahlen, die niemand gerne hört**", expanded=True):
        st.markdown("""
        **Die harten Fakten aus Deutschland:**

        | Indikator | Wert | Trend |
        |-----------|------|-------|
        | Können sich selbst motivieren | 59% | OECD-Durchschnitt |
        | Mathe als Lieblingsfach | 38% | Stabil |
        | Mathe-Angst | 39% | **+8pp seit 2012** |
        | Freude/Interesse an Mathe | Gesunken | Signifikant seit 2012 |
        | Instrumentelle Motivation | Gesunken | "Nur noch geringer Teil erkennt Wert für Beruf" |

        **Der Trend ist eindeutig:** Die Motivation deutscher Schüler verschlechtert sich.

        **Aber:** Das ist kein individuelles Problem. Das ist ein systemisches Problem.
        Und das bedeutet: Mit den richtigen Strategien kannst du das System hacken.
        """)

    # Selbstbestimmungstheorie
    with st.expander("🧠 **Selbstbestimmungstheorie (Deci & Ryan, 1985/2000)**"):
        st.markdown("""
        Die SDT (Self-Determination Theory) ist eine der am besten belegten
        Motivationstheorien in der Psychologie.

        **Das Modell:**

        ```
        Drei psychologische Grundbedürfnisse:
        ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
        │  AUTONOMIE  │ + │  KOMPETENZ  │ + │VERBUNDENHEIT│ = Intrinsische Motivation
        └─────────────┘   └─────────────┘   └─────────────┘
        ```

        **Die Definitionen:**

        | Bedürfnis | Definition | Im Schulkontext |
        |-----------|------------|-----------------|
        | **Autonomie** | Eigene Entscheidungen treffen, Kontrolle über Handeln | Wahlmöglichkeiten bei Aufgaben, eigene Lernwege |
        | **Kompetenz** | Fähigkeiten entwickeln, Herausforderungen meistern | Erfolgserlebnisse, angemessene Schwierigkeit |
        | **Verbundenheit** | Dazugehören, akzeptiert werden | Lerngruppen, gute Lehrer-Schüler-Beziehung |

        **Empirischer Befund (SELF-Studie Greifswald, n=1.088):**

        Woher kommt die Motivation deutscher 7./8.-Klässler?
        - 34% durch Mitschüler (größte Gruppe!)
        - 29% selbst-motiviert
        - 27% durch Lehrer UND Mitschüler
        - 10% nur durch Lehrer

        **Vergleich mit Kanada:** Dort brauchen 57% Lehrer UND Mitschüler.
        Deutschland ist autonomieorientierter – was Vor- und Nachteile hat.
        """)

    # Hattie Deep vs Surface
    with st.expander("📈 **Hattie: Deep Motivation vs. Surface Motivation**"):
        st.markdown("""
        John Hattie analysierte über 1.800 Meta-Analysen mit 300+ Millionen Schülern.

        **Die Effektstärken:**

        | Faktor | Effektstärke (d) | Interpretation |
        |--------|------------------|----------------|
        | **Deep motivation and approach** | **0.69** | Sehr wirksam |
        | Motivation (allgemein) | 0.42 | Über Schwellenwert |
        | Reducing anxiety | 0.42 | Über Schwellenwert |
        | Mastery goals | 0.06 | Gering |
        | Performance goals | -0.01 | Kein Effekt |
        | **Surface motivation and approach** | **-0.11** | **Negativ!** |

        **Der kritische Befund:** Surface Motivation SCHADET.

        **Was ist der Unterschied?**

        | | Deep Approach | Surface Approach |
        |-|---------------|------------------|
        | **Motiv** | Verstehen wollen, intrinsisches Interesse | Angst vor Versagen, nur Note |
        | **Strategie** | Verbinden, Strukturieren, Hinterfragen | Auswendiglernen, Wiederholen |
        | **Emotion** | Neugier, Engagement | Stress, Druck |
        | **Ergebnis** | Langfristige Retention, Transfer | Schnelles Vergessen |

        **Wichtig (Biggs, 2001):**
        > Deep/Surface ist keine feste Eigenschaft des Schülers,
        > sondern eine Reaktion auf die Lernumgebung.

        Das heißt: Du kannst deinen Ansatz ÄNDERN.
        """)

    # Korrumpierungseffekt
    with st.expander("⚠️ **Der Korrumpierungseffekt (Overjustification Effect)**"):
        st.markdown("""
        **Das Experiment (Deci, 1971):**

        Kinder lösten Puzzles. Gruppe A wurde belohnt, Gruppe B nicht.

        **Ergebnis:** Nach Beendigung der Belohnung spielten die belohnten Kinder
        WENIGER mit den Puzzles als die nicht-belohnten.

        **Erklärung:**
        Extrinsische Belohnungen "überschreiben" intrinsische Motivation.
        Das Gehirn schließt: "Ich mache das nur wegen der Belohnung → Es ist wohl nicht interessant."

        **Aber:** Der Effekt hängt von der Wahrnehmung ab.

        | Belohnung als... | Effekt |
        |------------------|--------|
        | Kontrolle/Druck | Negativ (Korrumpierung) |
        | Feedback/Anerkennung | Positiv oder neutral |

        **Praktische Konsequenz:**
        - Noten als informatives Feedback → Okay
        - Noten als Druckmittel → Motivation sinkt

        **Für dich:** Fokussiere auf Fortschritt, nicht auf die Note.
        Die Note ist ein Nebenprodukt des Lernens, nicht das Ziel.
        """)

    # Birkenbihl
    with st.expander("🧠 **Vera F. Birkenbihl: Gehirn-gerechtes Lernen**"):
        st.markdown("""
        Vera F. Birkenbihl (1946-2011) war Pionierin des "gehirn-gerechten Lernens".

        **Ihre Definition:**
        > "Gehirn-gerecht = Der Arbeitsweise des Gehirns entsprechend."

        **Die Neuromechanismen:**

        | Mechanismus | Bedeutung | Lernstrategie |
        |-------------|-----------|---------------|
        | **Vergleichen** | Gehirn fragt: "Kenne ich das?" | Neues mit Bekanntem verbinden |
        | **Assoziieren** | Alles wird verknüpft | ABC-Listen, KaWa, Mind Maps |
        | **Abstrahieren** | Regeln automatisch ableiten | Viele Beispiele zeigen |
        | **Imitieren** | Lernen durch Beobachten | Vorbilder, Peer Learning |
        | **Feedback** | Sofortige Rückmeldung nötig | Self-Testing, Erklären |

        **Das Problem der Schule (laut Birkenbihl):**
        > "90% des Unterrichts ignoriert diese Mechanismen."

        **Ihre bekanntesten Methoden:**

        **1. ABC-Liste:**
        - A-Z untereinander
        - Thema wählen
        - Assoziationen aufschreiben (nicht linear!)
        - Vorwissen aktivieren

        **2. KaWa (Kreativ-Analograffiti-Wort-Assoziationen):**
        - Schlüsselwort in die Mitte
        - Zu jedem Buchstaben Assoziationen
        - Visuell/kreativ gestalten

        **YouTube-Empfehlungen:**
        - "Vera Birkenbihl: Genial Lernen"
        - "Vera Birkenbihl: ABC-Techniken"
        - "Vera Birkenbihl: Warum lernen wir das nicht in der Schule?"
        """)

    # Selbstdiagnostik
    st.subheader("🔍 Selbstdiagnostik: Was fehlt DIR?")

    st.markdown("""
    Beantworte ehrlich:

    | Frage | Ja | Nein |
    |-------|-----|------|
    | Ich weiß, WOZU ich das lerne (nicht nur "für die Note") | ⬜ | ⬜ |
    | Ich sehe meinen Fortschritt beim Lernen | ⬜ | ⬜ |
    | Ich habe jemanden, mit dem ich lerne | ⬜ | ⬜ |
    | Ich habe Kontrolle über WANN/WO/WIE ich lerne | ⬜ | ⬜ |
    | Ich fühle mich nicht übermäßig gestresst | ⬜ | ⬜ |
    """)

    st.info("""
    **Auswertung:**
    - 5x Ja → Du bist gut aufgestellt!
    - 3-4x Ja → Fokussiere auf die Nein-Bereiche
    - 0-2x Ja → Starte mit dem 5-Schritte-Plan (siehe unten)

    **Die Fragen entsprechen:**
    1. Sinn/Autonomie (Deci & Ryan)
    2. Kompetenz (Deci & Ryan)
    3. Verbundenheit (Deci & Ryan)
    4. Autonomie (Deci & Ryan)
    5. Angstreduktion (Hattie: d = 0.42)
    """)

    # Transfer auf Post-Schule
    with st.expander("🎓 **Transfer: Studium, Ausbildung, Beruf**"):
        st.markdown("""
        Die gleichen Prinzipien gelten nach der Schule:

        **Im Studium:**
        - Autonomie noch wichtiger (weniger externe Struktur)
        - Lerngruppen sind Gold wert (Verbundenheit)
        - Prüfungsangst ist häufig → Strategien früh etablieren

        **In der Ausbildung:**
        - Theorie-Praxis-Transfer = Deep Learning
        - Relevanz oft klarer (gut für Motivation!)
        - Feedback von Ausbildern nutzen

        **Im Beruf:**
        - Intrinsische Motivation = Arbeitszufriedenheit
        - Weiterbildung nur mit "eigenem Grund" nachhaltig
        - Die 3 Grundbedürfnisse gelten auch für Arbeitsmotivation

        **Studie:** Selbstbestimmungstheorie ist einer der stärksten Prädiktoren für:
        - Berufliche Leistung
        - Karriereentwicklung
        - Lebenszufriedenheit
        """)

    # Quick Reference
    st.success("""
    ### ⚡ Quick Reference – Oberstufe

    **Die Wissenschaft sagt:**
    - **Deep Motivation (d = 0.69)** >> Surface Motivation (d = -0.11)
    - **3 Grundbedürfnisse:** Autonomie + Kompetenz + Verbundenheit
    - **34% der Motivation** kommt von Peers (SELF-Studie)
    - **Korrumpierungseffekt:** Belohnungen können schaden
    - **Birkenbihl:** Nutze die Neuromechanismen (ABC-Listen, etc.)

    **Dein 5-Schritte-Plan:**
    1. WOZU? → Deinen Grund finden
    2. ABC-Liste → Fortschritt sichtbar machen
    3. Buddy → Nicht alleine kämpfen
    4. Mikro-Entscheidungen → Kontrolle zurückholen
    5. Worst Case → Druck senken

    *"Die beste Motivation ist die, die du nicht brauchst – weil du das Thema interessant findest."*
    """)


def _render_paedagogen_content():
    """Rendert den Pädagogen-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Für Pädagogen")
    st.caption("Didaktische Implementierung und wissenschaftliche Grundlagen")

    st.markdown("""
    ### Evidenzbasierte Motivationsförderung

    Die Forschungslage ist klar: Motivation ist nicht angeboren, sondern kontextabhängig.
    Das bedeutet: Sie ist durch didaktische Gestaltung beeinflussbar.
    """)

    # Hattie-Übersicht
    with st.expander("📊 **Hattie-Effektstärken: Motivation und verwandte Faktoren**", expanded=True):
        st.markdown("""
        | Faktor | d | Interpretation | Quelle |
        |--------|---|----------------|--------|
        | Deep motivation and approach | 0.69 | Sehr wirksam | Visible Learning |
        | Motivation | 0.42 | Über Schwellenwert | Visible Learning |
        | Reducing anxiety | 0.42 | Über Schwellenwert | Visible Learning |
        | Mastery goals | 0.06 | Gering | Visible Learning |
        | Performance goals | -0.01 | Kein Effekt | Visible Learning |
        | Surface motivation and approach | -0.11 | Negativ | Visible Learning |

        **Kritischer Befund:**
        > "Around 90% of classroom teaching and learning focuses on surface knowledge and learning."
        > – John Hattie

        **Implikation:** Der Fokus muss von Surface (Fakten reproduzieren) auf Deep (Verstehen, Verbinden) verschoben werden.
        """)

    # Selbstbestimmungstheorie
    with st.expander("🧠 **Selbstbestimmungstheorie: Implementierung im Unterricht**"):
        st.markdown("""
        **Die drei Grundbedürfnisse (Deci & Ryan, 1985, 2000):**

        | Bedürfnis | Definition | Förderung im Unterricht |
        |-----------|------------|------------------------|
        | **Autonomie** | Wahrgenommene Wahlfreiheit und Selbstbestimmung | Wahlmöglichkeiten bei Aufgaben, Mitbestimmung bei Themen, Lernwege selbst gestalten |
        | **Kompetenz** | Gefühl, Herausforderungen bewältigen zu können | Angemessene Schwierigkeit (ZPD), regelmäßiges Feedback, Erfolge sichtbar machen |
        | **Verbundenheit** | Gefühl der Zugehörigkeit und Akzeptanz | Kooperatives Lernen, positive Beziehungsgestaltung, Peer-Feedback |

        **Praktische Strategien:**

        **Autonomie fördern:**
        - "Wähle eine der drei Aufgaben aus"
        - "In welcher Reihenfolge möchtest du vorgehen?"
        - "Wie möchtest du dein Ergebnis präsentieren?"
        - Hausaufgaben mit Optionen statt Einheits-Aufgaben

        **Kompetenz fördern:**
        - Lernziele transparent machen
        - "Ich kann..."-Statements statt Themenüberschriften
        - Fortschritts-Dokumentation (Portfolio, Lerntagebuch)
        - Fehler als Lerngelegenheiten framen

        **Verbundenheit fördern:**
        - Strukturierte Gruppenarbeit (nicht nur "arbeitet zusammen")
        - Peer-Tutoring systematisch einsetzen
        - Lernpartnerschaften etablieren
        - Positives Klassenklima aktiv gestalten
        """)

    # PISA-Daten für Deutschland
    with st.expander("📈 **PISA 2022: Motivationsbefunde für Deutschland**"):
        st.markdown("""
        **Aktuelle Zahlen:**

        | Indikator | Deutschland | OECD-Schnitt | Trend |
        |-----------|-------------|--------------|-------|
        | Selbstmotivation für Schularbeit | 59% | 58% | Stabil |
        | Mathe als Lieblingsfach | 38% | 38% | Stabil |
        | Mathe-Angst | 39% | k.A. | +8pp seit 2012 |
        | Freude an Mathematik | Signifikant gesunken | - | Seit 2012 |
        | Instrumentelle Motivation (Berufsbezug) | Signifikant gesunken | - | Seit 2012 |

        **Relevante PISA-Skalen:**
        - INTMAT: Intrinsic Motivation Mathematics
        - Instrumentelle Motivation
        - Mathematik-Angst
        - Selbstwirksamkeit

        **Implikation:** Der Trend zeigt eine Verschlechterung der motivationalen Dispositionen.
        Besonders die steigende Mathe-Angst (+8pp in 10 Jahren) erfordert Intervention.
        """)

    # Korrumpierungseffekt
    with st.expander("⚠️ **Der Korrumpierungseffekt: Vorsicht bei extrinsischen Belohnungen**"):
        st.markdown("""
        **Befund (Deci, 1971; Lepper et al., 1973):**

        Extrinsische Belohnungen können intrinsische Motivation unterminieren,
        wenn sie als kontrollierend wahrgenommen werden.

        **Differenzierung:**

        | Art der Belohnung | Effekt auf Motivation |
        |-------------------|----------------------|
        | Erwartete, materielle, aufgabenkontingente Belohnung | Negativ |
        | Unerwartete Belohnung | Neutral |
        | Verbale Anerkennung / Feedback | Positiv oder neutral |
        | Kompetenz-Feedback | Positiv |

        **Praktische Konsequenzen:**
        - Noten als **informatives Feedback** nutzen, nicht als Druckmittel
        - Verbale Anerkennung > materielle Belohnung
        - Prozess-Lob > Ergebnis-Lob
        - Intrinsische Motivatoren (Interesse, Relevanz) stärken

        **Für die Praxis:**
        > "Warum ist das wichtig?" vor jedem Thema klären
        > Verbindung zu Lebenswelt der Schüler herstellen
        > Eigenverantwortung statt Kontrolle
        """)

    # SELF-Studie
    with st.expander("👥 **SELF-Studie Greifswald: Die Rolle der Peers**"):
        st.markdown("""
        **Stichprobe:** 1.088 Schüler, 7./8. Klasse, Deutschland

        **Ergebnis: Motivationsquellen deutscher Schüler:**

        | Quelle | Anteil |
        |--------|--------|
        | Mitschüler (peers) | 34% |
        | Selbst (unabhängig) | 29% |
        | Lehrer UND Mitschüler | 27% |
        | Nur Lehrer | 10% |

        **Vergleich international:**
        - Kanada: 57% brauchen Lehrer UND Mitschüler
        - Deutschland: Autonomie-orientierter

        **Implikationen:**
        1. Peer-Learning systematisch einsetzen
        2. Kooperative Lernformen strukturiert gestalten
        3. Lernpartnerschaften als feste Institution
        4. Peer-Tutoring nutzen

        **Vorsicht:** "Gruppenarbeit" ≠ kooperatives Lernen.
        Strukturierung und positive Interdependenz sind entscheidend.
        """)

    # Birkenbihl-Methoden
    with st.expander("🧠 **Birkenbihl-Methoden für den Unterricht**"):
        st.markdown("""
        Vera F. Birkenbihl (1946-2011) entwickelte "gehirn-gerechte" Lernmethoden,
        die auf Neuromechanismen basieren:

        **Nutzbare Methoden im Unterricht:**

        **1. ABC-Listen (5-10 Min)**
        - Vorwissensaktivierung zu Stundenbeginn
        - Lernstandserhebung (vor/nach Einheit)
        - Wiederholung / Zusammenfassung

        **2. KaWa (Kreativ-Analograffiti-Wort-Assoziationen)**
        - Brainstorming-Alternative
        - Begriffsklärung
        - Vernetzung von Konzepten

        **3. Das Inselmodell**
        - Unterschiedliche Wissenstände sichtbar machen
        - Anknüpfungspunkte identifizieren
        - Perspektivenwechsel üben

        **Empirische Einordnung:**
        Birkenbihls Methoden sind nicht systematisch evaluiert,
        aber konsistent mit Forschung zu:
        - Elaboration (Hattie d = 0.75)
        - Prior Knowledge Activation
        - Retrieval Practice

        **YouTube-Ressourcen für Lehrkräfte:**
        - "Vera Birkenbihl: Genial Lehren"
        - "Vera Birkenbihl: Eltern-Nachhilfe"
        - "Vera Birkenbihl: Warum lernen wir das nicht in der Schule?"
        """)

    # Deep vs Surface Learning fördern
    with st.expander("📚 **Deep Learning fördern: Konkrete Strategien**"):
        st.markdown("""
        **Aus Biggs (1987, 2001) und Hattie (2009):**

        | Surface Approach | Deep Approach |
        |------------------|---------------|
        | Auswendiglernen fördern | Verstehen fördern |
        | Faktenabruf prüfen | Transferaufgaben stellen |
        | "Was ist X?" | "Warum ist X so? Wie hängt X mit Y zusammen?" |
        | Einzelfakten | Zusammenhänge |
        | Reproduktion | Anwendung |

        **Konkrete Maßnahmen:**

        1. **Fragen-Hierarchie anpassen:**
           - Weniger: "Nenne drei Ursachen für..."
           - Mehr: "Erkläre, warum... Vergleiche... Bewerte..."

        2. **Elaborative Interrogation:**
           - "Warum ist das so?"
           - "Wie hängt das mit ... zusammen?"
           - "Was wäre wenn...?"

        3. **Self-Explanation fördern:**
           - "Erkläre deinem Nachbarn, warum..."
           - Schriftliche Erklärungen verlangen
           - Fehlererklärungen einfordern

        4. **Transfer explizit üben:**
           - Anwendung in neuen Kontexten
           - Fächerübergreifende Bezüge
           - Alltagsrelevanz herstellen

        5. **Feedback auf Prozess, nicht nur Ergebnis:**
           - "Dein Lösungsweg zeigt..."
           - "Du hast die Verbindung zu ... gut erkannt"
        """)

    # Literaturhinweise
    with st.expander("📖 **Literatur und Ressourcen**"):
        st.markdown("""
        **Primärquellen:**

        Deci, E. L., & Ryan, R. M. (1985). *Intrinsic motivation and self-determination in human behavior.* New York: Plenum.

        Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination of behavior. *Psychological Inquiry, 11*(4), 227-268.

        Hattie, J. (2009). *Visible Learning: A Synthesis of Over 800 Meta-Analyses Relating to Achievement.* London: Routledge.

        Hattie, J. (2023). *Visible Learning: The Sequel.* London: Routledge.

        Biggs, J., Kember, D., & Leung, D. Y. P. (2001). The revised two-factor Study Process Questionnaire: R-SPQ-2F. *British Journal of Educational Psychology, 71*(1), 133-149.

        Birkenbihl, V. F. (2013). *Stroh im Kopf? Vom Gehirn-Besitzer zum Gehirn-Benutzer.* (55. Aufl.). München: mvg Verlag.

        **PISA 2022:**

        OECD (2023). *PISA 2022 Results (Volume I): The State of Learning and Equity in Education.* Paris: OECD Publishing.

        **Weiterführende Literatur:**

        Reeve, J. (2009). Why teachers adopt a controlling motivating style toward students and how they can become more autonomy supportive. *Educational Psychologist, 44*(3), 159-175.

        Vansteenkiste, M., Simons, J., Stoenset, L., et al. (2004). Motivating learning, performance, and persistence: The synergistic effects of intrinsic goal contents and autonomy-supportive contexts. *Journal of Personality and Social Psychology, 87*(2), 246-260.
        """)

    # Quick Reference für Pädagogen
    st.success("""
    ### ⚡ Quick Reference – Pädagogen

    **Die Kernbotschaften:**

    1. **Surface Motivation schadet (d = -0.11)** → Deep Approach fördern
    2. **3 Grundbedürfnisse beachten:** Autonomie, Kompetenz, Verbundenheit
    3. **34% der Motivation** kommt von Peers → Kooperatives Lernen strukturiert einsetzen
    4. **Korrumpierungseffekt:** Vorsicht bei extrinsischen Belohnungen
    5. **PISA-Trend negativ:** Besonders Mathe-Angst steigt (+8pp)

    **Konkrete Maßnahmen:**
    - Wahlmöglichkeiten anbieten (Autonomie)
    - Fortschritt sichtbar machen (Kompetenz)
    - Strukturierte Gruppenarbeit (Verbundenheit)
    - "Warum ist das wichtig?" vor jedem Thema (Relevanz)
    - Prozess-Feedback > Ergebnis-Feedback
    """)

    # Hinweis auf weitere Ressourcen
    st.info("""
    📚 **Weitere Materialien:**

    - Workshop-Konzepte zur Motivationsförderung (in Entwicklung)
    - Kopiervorlagen für ABC-Listen und KaWa
    - Selbstdiagnostik-Fragebögen für Schüler
    - Eltern-Handouts zur Unterstützung zuhause
    """)
