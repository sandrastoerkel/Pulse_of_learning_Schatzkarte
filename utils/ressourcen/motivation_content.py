"""
Wieder Bock aufs Lernen (EXT_MOTIV) Content mit Altersstufen.

Enthält die render_motivation_altersstufen Funktion für die Ressourcen-Seite.
Basiert auf: Deci & Ryan (Selbstbestimmungstheorie), Hattie (Visible Learning),
Birkenbihl (Gehirn-gerechtes Lernen), PISA 2022.

Stil: MaiThink X (Mai Thi Nguyen-Kim) - wissenschaftlich fundiert, aber cool erklärt.

ÄNDERUNGEN v2.0:
- Tab "🎮 Challenges" ruft jetzt das interaktive Widget auf
- Neues Motivation-Challenge-System mit SDT-basiertem Gamification
- XP, Badges, Streaks, Zertifikate
"""

import streamlit as st
import sqlite3
from typing import Optional, Callable

# ============================================
# IMPORT DES NEUEN MOTIVATION-CHALLENGE-MODULS
# ============================================
# Passe den Import-Pfad an deine Projektstruktur an:
# Option 1: Wenn in utils/motivation_challenges/
# from utils.motivation_challenges import render_motivation_challenge, init_motivation_tables

# Option 2: Wenn im gleichen Ordner
# from .motivation_challenges import render_motivation_challenge, init_motivation_tables

# Für Entwicklung: Try-Except mit Fallback
try:
    from utils.motivation_challenges import (
        render_motivation_challenge,
        init_motivation_tables,
        get_user_motivation_stats,
        GRUNDBEDUERFNISSE,
    )
    WIDGET_AVAILABLE = True
except ImportError:
    try:
        from motivation_challenges import (
            render_motivation_challenge,
            init_motivation_tables,
            get_user_motivation_stats,
            GRUNDBEDUERFNISSE,
        )
        WIDGET_AVAILABLE = True
    except ImportError:
        WIDGET_AVAILABLE = False


def render_motivation_altersstufen(
    color: str,
    conn: Optional[sqlite3.Connection] = None,
    user_data: Optional[dict] = None,
    xp_callback: Optional[Callable] = None
):
    """
    Rendert die Motivations-Ressource mit Challenges + Theorie-Tabs.
    
    Args:
        color: Farbe für das Styling (z.B. "#22c55e")
        conn: SQLite Connection für Gamification (optional für Widget)
        user_data: Dict mit user_id, display_name, age_group (optional für Widget)
        xp_callback: Callback für XP-Vergabe (optional)
    
    Beispiel-Aufruf:
        render_motivation_altersstufen(
            color="#22c55e",
            conn=st.session_state.get("db_connection"),
            user_data={
                "user_id": st.session_state.get("user_id", "guest"),
                "display_name": st.session_state.get("display_name", "Gast"),
                "age_group": st.session_state.get("age_group", "unterstufe"),
            },
            xp_callback=add_user_xp  # Optional
        )
    """

    # Session State für Tab-Auswahl (Default: Theorie zuerst)
    if "motivation_tab" not in st.session_state:
        st.session_state.motivation_tab = "theorie"

    # Große auffällige Auswahl-Buttons (Theorie zuerst, dann Challenges)
    col1, col2 = st.columns(2)

    with col1:
        is_theorie = st.session_state.motivation_tab == "theorie"
        if is_theorie:
            st.markdown(f"""
            <div style="background: {color}; color: white; padding: 20px; border-radius: 12px;
                        text-align: center; cursor: default;">
                <div style="font-size: 2em;">▶️</div>
                <div style="font-size: 1.2em; font-weight: bold;">Tutorial</div>
                <div style="font-size: 0.85em; opacity: 0.9;">Videos & Erklärungen</div>
            </div>
            """, unsafe_allow_html=True)
        else:
            if st.button("▶️\nTutorial\nVideos & Erklärungen", key="btn_motivation_theorie", use_container_width=True):
                st.session_state.motivation_tab = "theorie"
                st.rerun()

    with col2:
        is_challenges = st.session_state.motivation_tab == "challenges"
        if is_challenges:
            st.markdown(f"""
            <div style="background: {color}; color: white; padding: 20px; border-radius: 12px;
                        text-align: center; cursor: default;">
                <div style="font-size: 2em;">🎮</div>
                <div style="font-size: 1.2em; font-weight: bold;">Challenges</div>
                <div style="font-size: 0.85em; opacity: 0.9;">Interaktive Übungen</div>
            </div>
            """, unsafe_allow_html=True)
        else:
            if st.button("🎮\nChallenges\nInteraktive Übungen", key="btn_motivation_challenges", use_container_width=True):
                st.session_state.motivation_tab = "challenges"
                st.rerun()

    st.divider()

    # ==========================================
    # THEORIE-Bereich (kommt zuerst - Default)
    # ==========================================
    if st.session_state.motivation_tab == "theorie":
        _render_theorie_tab()

    # ==========================================
    # CHALLENGES-Bereich (kommt nach Theorie)
    # ==========================================
    else:
        _render_challenges_tab(conn, user_data, xp_callback)

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
# TAB 1: CHALLENGES (NEU MIT WIDGET)
# ============================================

def _render_challenges_tab(
    conn: Optional[sqlite3.Connection],
    user_data: Optional[dict],
    xp_callback: Optional[Callable]
):
    """Rendert den Challenges-Tab mit interaktivem Widget oder Fallback."""
    
    st.header("🎮 Motivations-Challenges")
    
    # ─────────────────────────────────────────
    # PRÜFUNG: Widget verfügbar + User eingeloggt?
    # ─────────────────────────────────────────
    
    widget_ready = (
        WIDGET_AVAILABLE and 
        conn is not None and 
        user_data is not None and
        user_data.get("user_id")
    )
    
    if widget_ready:
        # ═══════════════════════════════════════
        # INTERAKTIVES WIDGET RENDERN
        # ═══════════════════════════════════════
        
        # Tabellen initialisieren (idempotent)
        init_motivation_tables(conn)
        
        # Widget aufrufen
        render_motivation_challenge(
            user_data=user_data,
            conn=conn,
            xp_callback=xp_callback
        )
        
    else:
        # ═══════════════════════════════════════
        # FALLBACK: Platzhalter + Manuelle Version
        # ═══════════════════════════════════════
        
        _render_challenges_fallback()


def _render_challenges_fallback():
    """Fallback-Anzeige wenn Widget nicht verfügbar oder User nicht eingeloggt."""
    
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

    # Login-Hinweis
    if not WIDGET_AVAILABLE:
        st.warning("""
        ⚠️ **Modul nicht gefunden**
        
        Das Motivation-Challenge-Modul konnte nicht geladen werden.
        Bitte stelle sicher, dass der Ordner `motivation_challenges/` 
        in `utils/` vorhanden ist.
        """)
    else:
        st.info("""
        🔐 **Bitte einloggen für interaktive Challenges!**
        
        Mit Login kannst du:
        - Interaktive Challenges durchführen
        - XP sammeln und Badges verdienen
        - Deinen Fortschritt speichern
        - Streak aufbauen
        
        Schau solange im Tab "Theorie dahinter" vorbei – 
        da findest du alle Strategien!
        """)

    # Manuelle Version (ohne Login nutzbar)
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


# ============================================
# TAB 2: THEORIE (UNVERÄNDERT)
# ============================================

def _render_theorie_tab():
    """Rendert den Theorie-Tab basierend auf User-Altersstufe."""

    # Altersstufe aus User-Profil holen (oben gewählt)
    age_group = st.session_state.get("current_user_age_group", "grundschule")

    # Content je nach Altersstufe
    if age_group == "grundschule":
        _render_grundschule_content()
    elif age_group == "unterstufe":
        _render_unterstufe_content()
    elif age_group == "mittelstufe":
        _render_mittelstufe_content()
    elif age_group == "oberstufe":
        _render_oberstufe_content()
    elif age_group == "paedagogen":
        _render_paedagogen_content()
    else:
        # Fallback
        _render_unterstufe_content()


# ============================================
# PRIVATE HELPER FUNCTIONS FÜR ALTERSSTUFEN
# (UNVERÄNDERT - Original Content)
# ============================================

def _render_grundschule_content():
    """Rendert den Grundschul-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Grundschule")
    st.caption("Für Kinder (1.-4. Klasse) und ihre Eltern")

    # ========== VIDEO-PLATZHALTER ==========
    st.info("🎬 **Video kommt bald!** Hier erscheint ein erklärendes Video zum Thema.")
    # Später ersetzen mit:
    # st.video("https://youtube.com/watch?v=DEIN_VIDEO_LINK")
    # =======================================

    st.markdown("""
    ### 🦸 Du bist ein Entdecker!

    Weißt du, was Forscher und Entdecker machen? Sie stellen Fragen!

    - **Warum ist der Himmel blau?**
    - **Wie funktioniert ein Handy?**
    - **Woher kommt die Milch wirklich?**

    Und dann suchen sie die Antworten. Das ist Lernen! Nicht langweilig,
    sondern wie eine Schatzsuche 🏴‍☠️
    """)

    # 3 Superkräfte
    st.subheader("🦸 Die 3 Superkräfte der Motivation")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        #### 🎯 Superkraft 1: ICH WILL
        
        **Frag dich:** "WOZU lerne ich das?"
        
        **Beispiel:**
        - ❌ "Ich MUSS Mathe lernen"
        - ✅ "Ich lerne Mathe, damit ich mein 
             Taschengeld selbst zählen kann!"
        
        **Trick:** Finde DEINEN Grund!
        """)

    with col2:
        st.markdown("""
        #### 💪 Superkraft 2: ICH KANN
        
        **Sammle Beweise, dass du schlau bist!**
        
        **So geht's:**
        - Schreib auf, was du GESTERN 
          noch nicht konntest
        - Und was du HEUTE kannst!
        
        **Beispiel:**
        "Gestern wusste ich nicht, wie man
        'Schmetterling' schreibt. Heute schon!"
        """)

    with col3:
        st.markdown("""
        #### 👫 Superkraft 3: WIR ZUSAMMEN
        
        **Lernen macht mehr Spaß mit Freunden!**
        
        **Ideen:**
        - Frag einen Freund/eine Freundin 
          zum Lernen
        - Erkläre jemandem was du gelernt hast
        - Macht ein Quiz zusammen!
        
        **Geheimnis:** Wer erklärt, lernt doppelt!
        """)

    # Tipps für Eltern
    with st.expander("👨‍👩‍👧 Tipps für Eltern"):
        st.markdown("""
        **Die 3 Grundbedürfnisse (vereinfacht):**
        
        1. **Autonomie = "Ich darf mitentscheiden"**
           - Lassen Sie Ihr Kind wählen (Reihenfolge, Ort, Zeit)
           - "Möchtest du zuerst Mathe oder Deutsch?"
        
        2. **Kompetenz = "Ich schaffe das"**
           - Fokus auf Fortschritt, nicht Perfektion
           - "Gestern konntest du 3, heute 5 Aufgaben!"
        
        3. **Verbundenheit = "Jemand glaubt an mich"**
           - Interesse zeigen, nicht kontrollieren
           - "Erzähl mir, was du heute gelernt hast!"
        
        **⚠️ Achtung: Belohnungen können schaden!**
        "Wenn du eine 1 schreibst, bekommst du..." 
        → Untergräbt die Eigenfreude
        
        **Besser:** Anerkennung der Anstrengung
        "Ich sehe, wie viel du geübt hast!" ✅
        """)

    # Quick Reference
    st.success("""
    ### ⚡ Quick Reference – Grundschule
    
    | Problem | Lösung |
    |---------|--------|
    | "Ich hab keinen Bock!" | Finde DEIN Warum! |
    | "Das ist zu schwer!" | Schau, was du SCHON kannst! |
    | "Das ist langweilig!" | Lern mit einem Freund! |
    | "Ich kann das nicht!" | Du kannst es NOCH nicht! |
    """)


def _render_unterstufe_content():
    """Rendert den Unterstufen-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Unterstufe")
    st.caption("Für Schüler:innen der Klassen 5-7")

    # ========== VIDEO-PLATZHALTER ==========
    st.info("🎬 **Video kommt bald!** Hier erscheint ein erklärendes Video zum Thema.")
    # Später ersetzen mit:
    # st.video("https://youtube.com/watch?v=DEIN_VIDEO_LINK")
    # =======================================

    st.markdown("""
    ### 💡 Motivation ist kein Zufall – sie hat Regeln!

    Forscher haben herausgefunden: Es gibt **3 Dinge**, die uns motivieren.
    Und die gute Nachricht: Du kannst sie selbst beeinflussen!
    """)

    # Die 3 Säulen
    st.subheader("🏛️ Die 3 Säulen der Motivation")

    tab1, tab2, tab3 = st.tabs(["🎯 Autonomie", "💪 Kompetenz", "👥 Verbundenheit"])

    with tab1:
        st.markdown("""
        ### 🎯 Säule 1: Autonomie
        **= Das Gefühl, selbst zu entscheiden**

        **Warum wichtig?**
        Wenn dir jemand sagt "Du MUSST das machen!", 
        hast du direkt weniger Lust. Das ist normal!

        **Was du tun kannst:**
        1. **Finde DEIN Wozu:**
           "Wozu brauche ICH das?" (nicht: warum sagt der Lehrer das)
        
        2. **Triff kleine Entscheidungen:**
           - WANN lerne ich? (Nach dem Essen? Nach einer Pause?)
           - WO lerne ich? (Schreibtisch? Küche? Bibliothek?)
           - WOMIT fange ich an? (Leichtes zuerst? Schweres zuerst?)
        
        3. **Mach dir bewusst:** 
           DU entscheidest, ob du lernst – nicht deine Eltern!
           (Ja, auch wenn es sich nicht so anfühlt 😄)

        **Fun Fact:** 
        In Experimenten waren Menschen 40% motivierter, 
        wenn sie zwischen zwei fast gleichen Optionen wählen durften!
        """)

    with tab2:
        st.markdown("""
        ### 💪 Säule 2: Kompetenz
        **= Das Gefühl, etwas zu können**

        **Das Problem:**
        Wenn du denkst "Ich kann das eh nicht", 
        ist die Motivation futsch.

        **Die Lösung: Beweise sammeln!**

        **Technik 1: Die ABC-Liste (nach Birkenbihl)**
        1. Schreib A-Z untereinander
        2. Wähle ein Thema (z.B. "Mittelalter")
        3. Schreib zu jedem Buchstaben, was dir einfällt
        4. Zähl die Wörter!

        **Mach das VOR und NACH dem Lernen.**
        Vorher: 8 Wörter → Nachher: 23 Wörter = Sichtbarer Fortschritt!

        **Technik 2: Das "Noch nicht"-Mindset**
        - ❌ "Ich kann kein Englisch"
        - ✅ "Ich kann NOCH NICHT so gut Englisch"

        Das kleine Wort "noch" macht einen riesigen Unterschied!
        """)

    with tab3:
        st.markdown("""
        ### 👥 Säule 3: Verbundenheit
        **= Das Gefühl, dazuzugehören**

        **Überraschung:**
        34% deiner Motivation kommt von deinen Mitschülern!
        (Das haben Forscher in einer Studie herausgefunden)

        **Was du tun kannst:**

        **1. Finde einen Lern-Buddy**
        - Jemand, mit dem du dich gegenseitig abfragen kannst
        - Muss nicht dein bester Freund sein!
        - Tipp: Schreib heute noch jemanden an!

        **2. Erkläre anderen, was du gelernt hast**
        - Deiner Familie
        - Deinen Freunden
        - (Oder deinem Haustier 🐕)
        
        **Warum? Wer erklärt, versteht besser!**

        **3. Frag um Hilfe**
        - Das ist KEINE Schwäche!
        - Lehrer:innen freuen sich meistens über Fragen
        """)

    # Quick Reference
    st.success("""
    ### ⚡ Der 5-Minuten-Motivations-Hack

    Wenn du NULL Bock hast, mach genau DAS:

    | Schritt | Was du machst | Warum |
    |---------|---------------|-------|
    | 1️⃣ | Frag dich: "WOZU brauche ICH das?" | Autonomie |
    | 2️⃣ | Mach eine ABC-Liste (3 Min) | Kompetenz |
    | 3️⃣ | Schreib einem Buddy | Verbundenheit |
    | 4️⃣ | Entscheide: Wann, Wo, Womit? | Autonomie |
    | 5️⃣ | Stell einen Timer auf 25 Min | Start! |
    """)


def _render_mittelstufe_content():
    """Rendert den Mittelstufen-Content für Motivation."""
    st.header("🔥 Wieder Bock aufs Lernen – Mittelstufe")
    st.caption("Für Schüler:innen der Klassen 8-10")

    # ========== VIDEO-PLATZHALTER ==========
    st.info("🎬 **Video kommt bald!** Hier erscheint ein erklärendes Video zum Thema.")
    # Später ersetzen mit:
    # st.video("https://youtube.com/watch?v=DEIN_VIDEO_LINK")
    # =======================================

    st.markdown("""
    ### 🧠 Die Wissenschaft der Motivation

    Du weißt wahrscheinlich schon: Motivation kommt nicht einfach so.
    Aber wusstest du, dass es dafür **eine richtige Theorie** gibt?

    Die **Selbstbestimmungstheorie** (Self-Determination Theory, SDT) 
    von Deci & Ryan ist eine der am besten erforschten Theorien der Psychologie.
    """)

    # SDT erklärt
    st.subheader("📊 Die 3 psychologischen Grundbedürfnisse")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(label="🎯 Autonomie", value="Selbstbestimmung", 
                 delta="Ich entscheide selbst")
        st.caption("""
        Das Gefühl, dass deine Handlungen 
        von dir selbst ausgehen und nicht 
        von außen kontrolliert werden.
        """)

    with col2:
        st.metric(label="💪 Kompetenz", value="Wirksamkeit", 
                 delta="Ich kann das")
        st.caption("""
        Das Gefühl, Herausforderungen 
        bewältigen zu können und darin 
        besser zu werden.
        """)

    with col3:
        st.metric(label="👥 Verbundenheit", value="Zugehörigkeit", 
                 delta="Ich gehöre dazu")
        st.caption("""
        Das Gefühl, mit anderen Menschen 
        verbunden zu sein und von ihnen 
        akzeptiert zu werden.
        """)

    st.info("""
    **Wichtig:** Wenn EINES dieser Bedürfnisse nicht erfüllt ist, 
    leidet deine Motivation. Das ist keine Charakterschwäche – das ist Psychologie!
    """)

    # Der 5-Schritte-Plan
    st.subheader("📋 Der 5-Schritte-Plan gegen Motivationslosigkeit")

    with st.expander("**Schritt 1: Selbstdiagnose – Was fehlt dir?**", expanded=True):
        st.markdown("""
        Frag dich ehrlich:
        
        | Frage | Wenn JA → Problem |
        |-------|-------------------|
        | "Ich sehe keinen Sinn darin" | Autonomie fehlt |
        | "Ich fühle mich gezwungen" | Autonomie fehlt |
        | "Ich glaube, ich schaff das nicht" | Kompetenz fehlt |
        | "Ich hab keine Ahnung, wo ich anfangen soll" | Kompetenz fehlt |
        | "Alle anderen sind besser" | Kompetenz fehlt |
        | "Keiner unterstützt mich" | Verbundenheit fehlt |
        | "Es interessiert niemanden" | Verbundenheit fehlt |
        
        **Dein Ziel:** Finde heraus, welches Grundbedürfnis bei dir gerade zu kurz kommt.
        """)

    with st.expander("**Schritt 2: Die WOZU-Frage (Autonomie)**"):
        st.markdown("""
        **Statt "Warum muss ich das?" frag: "WOZU brauche ICH das?"**
        
        Der Unterschied:
        - "Warum?" → Sucht nach Schuld/Ursache → Führt zu Widerstand
        - "WOZU?" → Sucht nach Sinn/Ziel → Führt zu Motivation
        
        **Übung:**
        Nimm ein Fach, das du hasst. Beantworte:
        
        1. "Wozu könnte ich [Fach] in meinem Leben brauchen?"
        2. "Was könnte ich damit anfangen, wenn ich es kann?"
        3. "Welches Problem könnte ich damit lösen?"
        
        **Wichtig:** Die Antwort muss für DICH stimmen, nicht für deine Eltern!
        """)

    with st.expander("**Schritt 3: Die ABC-Liste (Kompetenz)**"):
        st.markdown("""
        **Die Birkenbihl-Methode, um dein Vorwissen zu aktivieren:**
        
        1. Schreib A-Z untereinander auf ein Blatt
        2. Wähle dein Thema
        3. Schreib zu jedem Buchstaben, was dir einfällt (3 Minuten)
        4. Zähl die ausgefüllten Buchstaben
        
        **Warum das funktioniert:**
        - Du siehst, was du SCHON weißt (Kompetenzerleben!)
        - Dein Gehirn aktiviert Vorwissen (besseres Lernen)
        - Nach dem Lernen: Wiederholen → Fortschritt sichtbar!
        
        **Pro-Tipp:** Mach die Liste VORHER und NACHHER.
        Die Differenz = Dein messbarer Fortschritt = Dopamin = Motivation
        """)

    with st.expander("**Schritt 4: Der Buddy-Effekt (Verbundenheit)**"):
        st.markdown("""
        **Fakt:** 34% deiner Motivation kommt von Mitschülern (SELF-Studie).
        
        **So nutzt du das:**
        
        **Option 1: Lern-Buddy finden**
        - Jemand aus deiner Klasse
        - Ihr fragt euch gegenseitig ab
        - Ihr erklärt euch schwierige Sachen
        
        **Option 2: Erklär-Methode**
        - Erkläre deiner Familie/Freunden, was du lernst
        - Wer erklärt, versteht besser (bewiesener Effekt!)
        
        **Option 3: Study-Session**
        - Lernt zusammen (in Person oder online)
        - Tipp: Pomodoro-Technik (25 min lernen, 5 min Pause)
        
        **Wichtig:** "Gruppenarbeit" ≠ effektives Peer-Learning!
        Strukturiert es: Wer erklärt was? Wann wird abgefragt?
        """)

    with st.expander("**Schritt 5: Mikro-Entscheidungen (Autonomie-Boost)**"):
        st.markdown("""
        **Kleine Entscheidungen = Großer Motivationsgewinn**
        
        Auch wenn du das Thema nicht wählen kannst, 
        kannst du IMMER noch entscheiden:
        
        | Was | Optionen |
        |-----|----------|
        | ⏰ WANN? | Morgens / Nachmittags / Abends |
        | 📍 WO? | Schreibtisch / Küche / Bibliothek / Draußen |
        | 📱 WOMIT? | Buch / App / Videos / Karteikarten |
        | 📋 WELCHE REIHENFOLGE? | Leicht → Schwer oder umgekehrt |
        | ⏱️ WIE LANGE? | 25 Min / 45 Min / 2 Stunden |
        
        **Das Gefühl:** "ICH habe das entschieden!"
        (Auch wenn du trotzdem Mathe lernst 😄)
        """)

    # Deep vs Surface Learning
    st.subheader("🧠 Deep Learning vs. Surface Learning")

    st.markdown("""
    **Aus der Forschung (Hattie, 2009):**
    
    | Ansatz | Beschreibung | Effektstärke |
    |--------|--------------|--------------|
    | **Deep Learning** | Verstehen, Verknüpfen, Anwenden | d = 0.69 ✅ |
    | **Surface Learning** | Auswendiglernen ohne Verstehen | d = -0.11 ❌ |
    
    **Was bedeutet das?**
    - Effektstärke > 0.40 = guter Effekt
    - Effektstärke < 0 = NEGATIVER Effekt!
    
    **Surface Learning schadet also tatsächlich!** 😱
    """)

    col1, col2 = st.columns(2)
    with col1:
        st.error("""
        **❌ Surface Learning:**
        - Text mehrmals durchlesen
        - Alles markieren
        - Definitionen auswendig lernen
        - Hoffen, dass man es wiedererkennt
        """)
    with col2:
        st.success("""
        **✅ Deep Learning:**
        - Sich selbst Fragen stellen
        - Verbindungen zu anderen Themen suchen
        - Jemand anderem erklären
        - Anwendungsbeispiele finden
        """)


def _render_oberstufe_content():
    """
    Rendert den Oberstufen-Content für Motivation.
    Neu: Praktisch, direkt, mit echtem Verständnis für Abi-Stress.
    """
    st.header("🔥 Wieder Bock aufs Lernen – Oberstufe")
    st.caption("Für alle, die gerade im Abi-Stress stecken (Klasse 11-13)")

    # ========== VIDEO-PLATZHALTER ==========
    st.info("🎬 **Video kommt bald!** Hier erscheint ein erklärendes Video zum Thema.")
    # Später ersetzen mit:
    # st.video("https://youtube.com/watch?v=DEIN_VIDEO_LINK")
    # =======================================

    # ══════════════════════════════════════════
    # EINSTIEG: REAL TALK
    # ══════════════════════════════════════════
    st.markdown("""
### Okay, lass uns ehrlich sein.

Du sitzt da, hast eigentlich 3 Klausuren, solltest lernen – und stattdessen scrollst du hier rum.
Oder jemand hat dir den Link geschickt. Oder du suchst verzweifelt nach *irgendwas*, das hilft.

**Hier ist, was du wissen musst:**
- Das Abi ist stressig. Das ist Fakt, nicht deine Schuld.
- 51% aller Oberstufenschüler fühlen sich gestresst (DAK-Studie).
- 10-20% haben echte Prüfungsangst – nicht nur "nervös sein".
- Die Anforderungen sind real. Der Druck ist real.

**Aber:** Du bist nicht machtlos. Es gibt Sachen, die funktionieren. Wissenschaftlich bewiesen.
Keine Motivationssprüche. Keine "Denk positiv!"-Bullshit. Konkrete Strategien.
    """)

    st.divider()

    # ══════════════════════════════════════════
    # SELBSTDIAGNOSE
    # ══════════════════════════════════════════
    st.subheader("🔍 Schritt 1: Was ist eigentlich dein Problem?")

    st.markdown("""
Bevor du irgendwas machst: Finde raus, **was** dir fehlt. Nicht jede Unlust ist gleich.
Die Forschung sagt: Es gibt **3 Grundbedürfnisse**, die erfüllt sein müssen, damit Motivation funktioniert.
    """)

    with st.expander("**Mach den Quick-Check (30 Sekunden)**", expanded=True):
        st.markdown("""
Lies die Aussagen. Welche treffen auf dich zu?

**🎯 GRUPPE A – Autonomie (= "Ich entscheide selbst")**
- [ ] "Ich fühle mich gezwungen, das zu lernen"
- [ ] "Das bringt mir doch eh nichts"
- [ ] "Ich weiß nicht, wozu ich das brauche"
- [ ] "Meine Eltern/Lehrer nerven mich damit"

**💪 GRUPPE B – Kompetenz (= "Ich kann das")**
- [ ] "Ich versteh das einfach nicht"
- [ ] "Ich weiß nicht, wo ich anfangen soll"
- [ ] "Alle anderen sind besser als ich"
- [ ] "Ich hab Angst, zu versagen"

**👥 GRUPPE C – Verbundenheit (= "Ich bin nicht allein")**
- [ ] "Keiner unterstützt mich"
- [ ] "Ich fühl mich allein damit"
- [ ] "Es interessiert niemanden, wie's mir geht"
- [ ] "Ich hab niemanden zum Lernen/Fragen"

---

**Auswertung:**
- Viele Kreuze bei **A**? → Du brauchst einen **persönlichen Grund**
- Viele Kreuze bei **B**? → Du brauchst **Erfolgserlebnisse** und einen Plan
- Viele Kreuze bei **C**? → Du brauchst **Menschen**
- Überall verteilt? → Normal. Arbeite an dem, was am meisten nervt.
        """)

    st.divider()

    # ══════════════════════════════════════════
    # PROBLEM A: AUTONOMIE
    # ══════════════════════════════════════════
    st.subheader("🎯 Problem A: 'Wozu soll ich das lernen?'")

    with st.expander("**Die ehrliche Antwort + was du tun kannst**"):
        st.markdown("""
**Real talk:** Ja, vieles wirst du nie wieder brauchen. Gedichtanalysen im Job? Wahrscheinlich nicht.

**Aber hier ist der Trick:**

Du lernst nicht *nur* den Inhalt. Du lernst:
- Wie du dich durch Shit durchbeißt, auf den du keinen Bock hast (= Berufsleben)
- Wie du komplizierte Sachen verstehst (= jeder Job, der gut bezahlt wird)
- Wie du unter Druck funktionierst (= Bewerbungen, Deadlines, Stress)

**Das Abi ist ein Filter.** Nicht weil der Stoff so wichtig ist – sondern weil es zeigt:
"Dieser Mensch kann sich organisieren und Ziele erreichen."

---

**Dein Move:**

1. **Finde DEINEN Grund.** Nicht den von deinen Eltern.
   - Willst du studieren? Welcher NC?
   - Willst du Geld verdienen? Was für Jobs interessieren dich?
   - Willst du ins Ausland? Welche Voraussetzungen?

2. **Mach kleine Entscheidungen selbst:**
   - WANN lernst du? (Nicht: wann sagen deine Eltern)
   - WO lernst du? (Zimmer, Bib, Café?)
   - WOMIT fängst du an?
   - WELCHE Musik läuft?

**Fun Fact:** Studien zeigen: Allein die Illusion von Kontrolle steigert die Motivation um 40%.
Also: Selbst wenn du den Stoff nicht wählen kannst – wähl alles andere.
        """)

    # ══════════════════════════════════════════
    # PROBLEM B: KOMPETENZ
    # ══════════════════════════════════════════
    st.subheader("💪 Problem B: 'Ich check das nicht / Ich schaff das nicht'")

    with st.expander("**Prüfungsangst & Überforderung – was wirklich hilft**"):
        st.markdown("""
**Wichtig:** Das Gefühl "Ich kann das nicht" ist oft nicht wahr. Es ist ein Gefühl.

**Woher kommt's?**
- Zu viel auf einmal (Overwhelm)
- Keine Erfolgserlebnisse (du siehst nur, was fehlt)
- Vergleich mit anderen (immer schlecht für die Psyche)
- Echte Wissenslücken (fixbar!)

---

**Strategie 1: Die "Ich bin nicht bei Null"-Übung**

Bevor du lernst, mach eine **ABC-Liste** (Birkenbihl-Methode):
1. Schreib A-Z auf ein Blatt
2. Notier zu jedem Buchstaben, was du zum Thema schon weißt
3. Zähl die ausgefüllten Buchstaben

**Beispiel:** Thema "Französische Revolution"
- A: Adel, Absolutismus
- B: Bastille
- C: ...
- R: Robespierre
- usw.

**Warum das funktioniert:** Du siehst, dass du nicht bei Null startest.
Das beruhigt das Gehirn und macht Platz für Neues.

---

**Strategie 2: Das "Eine Sache"-Prinzip**

Wenn alles zu viel ist:
1. Schreib ALLES auf, was du lernen musst (Brain Dump)
2. Wähl EINE Sache aus. Die kleinste, die du heute schaffen kannst.
3. Mach nur das. Dann die nächste.

**Das Gehirn hasst Chaos.** Gib ihm Struktur.

---

**Strategie 3: Aktiv statt passiv**

**Was nicht funktioniert (Hattie-Studien):**
- Text mehrmals lesen (d = -0.11 – schadet!)
- Alles markieren
- Zusammenfassungen abschreiben

**Was funktioniert:**
- Dich selbst abfragen (d = 0.79)
- Alte Klausuren machen
- Jemandem erklären, was du gelernt hast
- Nach jedem Abschnitt: "Was war das Wichtigste?" aufschreiben

**Regel:** Wenn du nicht schwitzt (mental), lernst du nicht.
        """)

    with st.expander("**Spezial: Gegen Prüfungsangst**"):
        st.markdown("""
**Wenn du echte Prüfungsangst hast** (Herzrasen, Blackouts, Panik):

**Kurzfristig (vor/in der Prüfung):**

1. **4-7-8 Atmung:**
   - 4 Sekunden einatmen
   - 7 Sekunden halten
   - 8 Sekunden ausatmen
   - 3x wiederholen

2. **Körper-Trick:**
   - Drück deine Fußsohlen fest auf den Boden
   - Spür das. Fokussier dich darauf.
   - Das holt dich aus dem Kopf raus.

3. **Reframing:**
   - Statt "Ich hab Angst" → "Mein Körper ist bereit"
   - Aufregung und Angst fühlen sich gleich an. Dein Gehirn kann umlernen.

**Langfristig:**
- Prüfungssituationen üben (alte Klausuren, Timer an, alleine)
- Worst-Case durchspielen: "Was passiert WIRKLICH, wenn ich verkacke?"
- Bei echten Problemen: Schulpsychologe. Kein Witz. Hilft.

**Fakt:** 10-20% aller Schüler haben Prüfungsangst, die sie allein nicht lösen können.
Das ist nichts, wofür man sich schämen muss.
        """)

    # ══════════════════════════════════════════
    # PROBLEM C: VERBUNDENHEIT
    # ══════════════════════════════════════════
    st.subheader("👥 Problem C: 'Ich fühl mich allein damit'")

    with st.expander("**Warum andere Menschen wichtiger sind, als du denkst**"):
        st.markdown("""
**Krasse Statistik:**

Eine Studie der Uni Greifswald hat 1.088 Schüler gefragt, woher ihre Motivation kommt:

| Quelle | Anteil |
|--------|--------|
| **Mitschüler** | **34%** |
| Selbst | 29% |
| Lehrer + Mitschüler | 27% |
| Nur Lehrer | 10% |

**Das heißt:** Deine Freunde/Mitschüler sind wichtiger für deine Motivation als deine Lehrer.

---

**Was du tun kannst:**

1. **Lern-Buddy finden**
   - Muss nicht dein bester Freund sein
   - Jemand, der dieselben Klausuren hat
   - Ihr fragt euch gegenseitig ab, erklärt euch Sachen
   - Schreib heute noch jemanden an: "Hey, hast du Bock, zusammen für [Fach] zu lernen?"

2. **Discord/Gruppe für dein Fach**
   - Studienkreis/Abiturvorbereitung-Server
   - r/Abitur auf Reddit
   - Einfach googlen: "[Fach] Abitur Discord"

3. **Die Erklär-Methode**
   - Erkläre deiner Mutter/Schwester/Freund, was du gelernt hast
   - Klingt dumm, ist aber einer der effektivsten Lerntricks
   - Wer erklärt, versteht tiefer

4. **Bei echten Problemen: Hol dir Hilfe**
   - Schulpsychologe
   - Vertrauenslehrer
   - Nummer gegen Kummer: 116 111
   - Das ist kein Zeichen von Schwäche.
        """)

    st.divider()

    # ══════════════════════════════════════════
    # QUICK WINS
    # ══════════════════════════════════════════
    st.subheader("⚡ Quick Wins: Was du JETZT tun kannst")

    col1, col2 = st.columns(2)

    with col1:
        st.success("""
**Wenn du 5 Minuten hast:**
1. ABC-Liste zu deinem Thema machen
2. Eine alte Klausur-Aufgabe lösen
3. Einem Freund eine Sache erklären
4. 4-7-8 Atmung machen

**Wenn du 25 Minuten hast:**
1. Timer stellen (Pomodoro)
2. EINE Sache lernen
3. Handy in anderen Raum
4. Nach 25 Min: echte Pause
        """)

    with col2:
        st.error("""
**Was du NICHT tun solltest:**
- Text zum 5. Mal durchlesen
- Alles bunt markieren
- YouTube-"Lernvideos" schauen und denken, du lernst
- Dich mit Leuten vergleichen, die behaupten, "gar nicht gelernt" zu haben
- Nachtschichten. Schlaf > Lernen.
        """)

    # ══════════════════════════════════════════
    # DIE WISSENSCHAFT DAHINTER
    # ══════════════════════════════════════════
    with st.expander("🔬 **Für die, die's genauer wissen wollen: Die Wissenschaft**"):
        st.markdown("""
**Selbstbestimmungstheorie (Deci & Ryan):**

Die 3 Grundbedürfnisse (Autonomie, Kompetenz, Verbundenheit) sind nicht ausgedacht.
Sie wurden in über 10.000 Studien bestätigt. Weltweit. In allen Kulturen.

Wenn eins fehlt, sinkt die Motivation. Das ist keine Charakterschwäche – das ist Psychologie.

---

**Hattie's Effektstärken (aus 800+ Meta-Analysen):**

| Strategie | Effektstärke | Was das bedeutet |
|-----------|--------------|------------------|
| Selbst abfragen | d = 0.79 | Sehr wirksam |
| Verteiltes Lernen | d = 0.79 | Sehr wirksam |
| Elaboration (Verbindungen) | d = 0.75 | Sehr wirksam |
| Text mehrmals lesen | d = -0.11 | **Schadet!** |

**Die Schwelle:** d > 0.40 = "funktioniert". d < 0 = lieber nichts tun.

---

**PISA 2022 – Was über dich gesagt wird:**

- Mathe-Angst ist um 8% gestiegen (2012 → 2022)
- Nur 59% können sich selbst motivieren
- **Aber:** Selbstwirksamkeit ("Ich glaube, ich kann das") ist der stärkste Prädiktor für Erfolg.

**Das heißt:** Nicht Talent entscheidet. Nicht Intelligenz.
Sondern ob du glaubst, dass du's schaffen kannst. Und das ist trainierbar.
        """)

    # ══════════════════════════════════════════
    # ABSCHLUSS
    # ══════════════════════════════════════════
    st.success("""
### 📋 Zusammenfassung

**1. Finde raus, was dir fehlt:**
- Autonomie? → Finde DEINEN Grund, triff kleine Entscheidungen
- Kompetenz? → Kleine Schritte, aktiv lernen, Erfolge sehen
- Verbundenheit? → Lern-Buddy, erklären, Hilfe holen

**2. Nutze, was funktioniert:**
- Dich selbst abfragen > Text lesen
- Verteilt lernen > Nachtschichten
- Erklären > Markieren

**3. Sei realistisch:**
- Das Abi ist anstrengend. Das ist normal.
- Du musst nicht alles lieben. Nur durchkommen.
- Kleine Schritte > große Pläne, die du nicht machst.

**Du schaffst das.** Nicht weil ich das sage – sondern weil Tausende vor dir
es auch geschafft haben. Mit denselben Zweifeln. Demselben Stress.
    """)


def _render_paedagogen_content():
    """
    Rendert den Pädagogen-Content für Motivation.
    Basiert auf: Lernmotivation_Lehrbuch_v2.docx
    """
    st.header("📚 Lernmotivation bei Schülerinnen und Schülern")
    st.caption("Theoretische Grundlagen, empirische Befunde und Handlungsempfehlungen für die pädagogische Praxis")

    # ========== VIDEO-PLATZHALTER ==========
    st.info("🎬 **Video kommt bald!** Hier erscheint ein erklärendes Video zum Thema.")
    # Später ersetzen mit:
    # st.video("https://youtube.com/watch?v=DEIN_VIDEO_LINK")
    # =======================================

    # Abstract
    st.info("""
    **Abstract:** Dieses Kapitel bietet eine wissenschaftlich fundierte Übersicht über die Entstehung und Förderung
    von Lernmotivation. Ausgehend von der Selbstbestimmungstheorie nach Deci und Ryan werden die drei psychologischen
    Grundbedürfnisse – Autonomie, Kompetenz und soziale Eingebundenheit – als zentrale Determinanten intrinsischer
    Motivation dargestellt. Ergänzend werden die Erwartungs-Wert-Theorie, die Interesse-Theorie und die
    Attributionstheorie vorgestellt. Die Unterscheidung zwischen Deep Learning und Surface Learning nach Biggs wird
    anhand aktueller Hattie-Effektstärken empirisch eingeordnet. PISA-2022-Daten zur Motivationslage deutscher
    Schülerinnen und Schüler runden das Bild ab.
    """)

    # ══════════════════════════════════════════
    # 1. EINLEITUNG
    # ══════════════════════════════════════════
    with st.expander("**1. Einleitung: Motivation als Schlüssel zum Lernerfolg**", expanded=True):
        st.markdown("""
Die Frage, wie Lernende zu nachhaltigem und selbstständigem Lernen motiviert werden können, gehört zu den
zentralen Herausforderungen pädagogischer Praxis. Die empirische Bildungsforschung hat in den vergangenen
Jahrzehnten bedeutende Erkenntnisse zu den Mechanismen der Lernmotivation gewonnen, die jedoch in der
schulischen Praxis noch unzureichend umgesetzt werden.

**PISA-Studie 2022 – Besorgniserregende Entwicklungen:**

| Befund | Wert |
|--------|------|
| Schüler, die sich selbst für Schularbeit motivieren können | 59% |
| Schüler mit Mathematikangst (2012) | 31% |
| Schüler mit Mathematikangst (2022) | **39%** (+8pp) |

Diese Befunde unterstreichen die Notwendigkeit, motivationale Prozesse im Unterricht gezielter zu adressieren.
        """)

    # ══════════════════════════════════════════
    # 2. SELBSTBESTIMMUNGSTHEORIE
    # ══════════════════════════════════════════
    with st.expander("**2. Selbstbestimmungstheorie (Deci & Ryan)**"):
        st.markdown("""
Die **Selbstbestimmungstheorie (Self-Determination Theory, SDT)** nach Deci und Ryan (1985, 2000) stellt das
derzeit einflussreichste theoretische Rahmenwerk zur Erklärung menschlicher Motivation dar.

### 2.1 Die drei psychologischen Grundbedürfnisse

| Grundbedürfnis | Definition | Schulischer Kontext |
|----------------|------------|---------------------|
| **Autonomie** | Das Bedürfnis, eigene Entscheidungen zu treffen und Kontrolle über das eigene Handeln zu haben | Wahlmöglichkeiten bei Aufgaben, Mitbestimmung bei Lernwegen, eigene Zielsetzung |
| **Kompetenz** | Das Bedürfnis, sich als fähig zu erleben und Herausforderungen erfolgreich zu meistern | Erfolgserlebnisse, angemessene Schwierigkeit, sichtbarer Lernfortschritt |
| **Soziale Eingebundenheit** | Das Bedürfnis, dazuzugehören, akzeptiert und wertgeschätzt zu werden | Lerngruppen, positive Lehrer-Schüler-Beziehung, kooperatives Lernen |

Die Forschung zeigt konsistent, dass Lernende am besten lernen, wenn sie autonom agieren können, sich als
kompetent erleben und soziale Eingebundenheit erfahren. Die **Nichterfüllung** eines oder mehrerer dieser
Bedürfnisse führt zu einer Reduktion intrinsischer Motivation und kann langfristig zu Lernverweigerung führen.

### 2.2 Das Kontinuum der Motivation

| Motivationstyp | Charakteristik | Beispiel |
|----------------|----------------|----------|
| **Amotivation** | Fehlen jeglicher Handlungsabsicht | "Ich sehe keinen Sinn darin." |
| **Externe Regulation** | Handeln aufgrund externer Belohnung/Bestrafung | "Ich lerne, weil sonst Strafe droht." |
| **Introjizierte Regulation** | Handeln aus Schuld- oder Schamgefühlen | "Ich würde mich schlecht fühlen, wenn ich nicht lerne." |
| **Identifizierte Regulation** | Handeln, weil das Ziel persönlich wichtig ist | "Ich lerne, weil mir gute Noten wichtig sind." |
| **Integrierte Regulation** | Handeln entspricht eigenen Werten und Identität | "Lernen gehört zu dem, wer ich bin." |
| **Intrinsische Motivation** | Handeln aus Freude und Interesse an der Tätigkeit selbst | "Ich lerne, weil es mir Spaß macht." |

**Pädagogisches Ziel:** Lernende von externaler Regulation hin zu identifizierter oder intrinsischer Motivation
begleiten. Dieser Prozess wird als **Internalisierung** bezeichnet.

### 2.3 Der Korrumpierungseffekt

Ein bedeutsamer Befund der Motivationsforschung ist der sogenannte **Korrumpierungseffekt** (Overjustification Effect):

> Schülerinnen und Schüler, die für eine Tätigkeit **benotet** wurden, zeigten danach **weniger Interesse** daran,
> diese Tätigkeit freiwillig fortzusetzen, als Lernende, die für dieselbe Aufgabe keine Note erhalten hatten.
> *(Deci, Koestner & Ryan, 1999)*

**Pädagogische Konsequenz:** Noten sollten als **diagnostisches Feedback** genutzt werden, nicht als Druckmittel.
Die Art der Rückmeldung entscheidet über ihre motivationale Wirkung.
        """)

    # ══════════════════════════════════════════
    # 3. ERWARTUNGS-WERT-THEORIE
    # ══════════════════════════════════════════
    with st.expander("**3. Erwartungs-Wert-Theorie (Eccles & Wigfield)**"):
        st.markdown("""
Die **Erwartungs-Wert-Theorie** (Expectancy-Value Theory) nach Eccles und Wigfield (2002) erklärt Lernmotivation
durch zwei zentrale Faktoren:

### 3.1 Erfolgserwartung (Expectancy)

Die Erfolgserwartung bezeichnet die subjektive Einschätzung, eine Aufgabe erfolgreich bewältigen zu können.
Sie ist eng verwandt mit dem Konzept der **Selbstwirksamkeit** nach Bandura (1997). Lernende, die glauben,
eine Aufgabe schaffen zu können, zeigen höhere Anstrengungsbereitschaft und Ausdauer.

### 3.2 Subjektiver Aufgabenwert (Value)

Der subjektive Aufgabenwert setzt sich aus vier Komponenten zusammen:

| Komponente | Beschreibung |
|------------|--------------|
| **Intrinsischer Wert** | Freude und Interesse an der Tätigkeit selbst |
| **Nützlichkeitswert** | Wahrgenommene Relevanz für zukünftige Ziele (z.B. Berufswunsch) |
| **Persönliche Wichtigkeit** | Bedeutung für das Selbstkonzept und die eigene Identität |
| **Kosten** | Wahrgenommener Aufwand, Angst vor Misserfolg, entgangene Alternativen |

### Kernaussage

> **Motivation = Erwartung × Wert**

Ist einer der beiden Faktoren **null**, resultiert **keine Motivation**:
- Ein Schüler, der glaubt, Mathematik nicht zu können (**Erwartung = 0**), wird sich nicht anstrengen –
  selbst wenn er den Wert anerkennt.
- Umgekehrt wird ein Schüler, der keinen Sinn in einem Fach sieht (**Wert = 0**), trotz hoher
  Kompetenzüberzeugung wenig investieren.
        """)

    # ══════════════════════════════════════════
    # 4. INTERESSE-THEORIE
    # ══════════════════════════════════════════
    with st.expander("**4. Interesse-Theorie (Krapp & Hidi)**"):
        st.markdown("""
Die pädagogische **Interesse-Theorie** nach Krapp (1992, 2002) und Hidi (2006) unterscheidet zwischen
situationalem und individuellem Interesse.

### 4.1 Situationales vs. individuelles Interesse

| Interessentyp | Charakteristik | Pädagogische Implikation |
|---------------|----------------|--------------------------|
| **Situationales Interesse** | Kurzfristig, durch äußere Reize ausgelöst (z.B. spannende Demonstration) | Einstieg erleichtern, Aufmerksamkeit wecken |
| **Individuelles Interesse** | Langfristig, stabile Präferenz für bestimmte Gegenstandsbereiche | Vertiefte Auseinandersetzung, selbstgesteuertes Lernen |

### 4.2 Das Vier-Phasen-Modell der Interessenentwicklung

Hidi und Renninger (2006) beschreiben die Entwicklung von Interesse in vier Phasen:

1. **Ausgelöstes situationales Interesse:** Kurzfristige Aufmerksamkeit durch Überraschung, Neuheit
   oder persönliche Relevanz.
2. **Aufrechterhaltenes situationales Interesse:** Anhaltendes Engagement durch bedeutsame Aufgaben
   und Unterstützung.
3. **Entstehendes individuelles Interesse:** Beginnende eigenständige Beschäftigung mit dem Gegenstand.
4. **Gut entwickeltes individuelles Interesse:** Stabile, selbstgesteuerte Auseinandersetzung; Teil der Identität.

**Pädagogische Konsequenz:** Lehrkräfte können situationales Interesse gezielt auslösen, müssen aber
**langfristig arbeiten**, um individuelles Interesse zu entwickeln.
        """)

    # ══════════════════════════════════════════
    # 5. ATTRIBUTIONSTHEORIE
    # ══════════════════════════════════════════
    with st.expander("**5. Attributionstheorie (Weiner)**"):
        st.markdown("""
Die **Attributionstheorie** nach Weiner (1985, 2010) untersucht, wie Lernende Erfolge und Misserfolge
erklären – und welche motivationalen Konsequenzen diese Erklärungen haben.

### 5.1 Die drei Dimensionen der Ursachenzuschreibung

| Dimension | Ausprägungen | Beispiel |
|-----------|--------------|----------|
| **Lokation** | Internal (in der Person) vs. External (außerhalb) | "Ich bin klug" vs. "Die Aufgabe war leicht" |
| **Stabilität** | Stabil (über Zeit konstant) vs. Variabel (veränderlich) | "Ich bin unbegabt" vs. "Ich hatte einen schlechten Tag" |
| **Kontrollierbarkeit** | Kontrollierbar vs. Unkontrollierbar | "Ich habe nicht genug gelernt" vs. "Die Aufgabe war unfair" |

### 5.2 Günstige und ungünstige Attributionsmuster

**Günstiges Muster:**
- Erfolge werden **internal und stabil** attribuiert ("Ich bin fähig")
- Misserfolge werden **internal, variabel und kontrollierbar** attribuiert ("Ich habe zu wenig geübt")
- → Fördert Anstrengungsbereitschaft und Resilienz

**Ungünstiges Muster:**
- Misserfolge werden **internal und stabil** attribuiert ("Ich bin einfach unbegabt")
- Erfolge werden **external** attribuiert ("Ich hatte Glück")
- → Führt zu **erlernter Hilflosigkeit** und Motivationsverlust

**Pädagogische Konsequenz:** Lehrkräfte sollten Feedback so formulieren, dass es anstrengungsbezogene
Attributionen fördert:
- ✅ "Du hast das geschafft, weil du gut geübt hast"
- ❌ "Du bist eben ein Naturtalent"
        """)

    # ══════════════════════════════════════════
    # 6. DEEP VS SURFACE LEARNING
    # ══════════════════════════════════════════
    with st.expander("**6. Deep Learning versus Surface Learning (Biggs)**"):
        st.markdown("""
Das Konzept der **Lernansätze** (Approaches to Learning) wurde von John Biggs (1987) entwickelt und durch
John Hattie in die Meta-Analyse "Visible Learning" integriert.

### 6.1 Konzeptuelle Unterscheidung

| Dimension | Surface Approach | Deep Approach |
|-----------|------------------|---------------|
| **Motiv** | Extrinsische Motivation, Angst vor Versagen, Aufgabe nur erledigen wollen | Intrinsische Motivation, Neugier, persönliches Engagement |
| **Strategie** | Auswendiglernen, Fokus auf isolierte Fakten, keine Zusammenhänge herstellen | Analogien suchen, Bezug zu Vorwissen herstellen, Theoretisieren |
| **Intention** | Inhalte reproduzieren, nur für den Test lernen | Verstehen wollen, nach zugrundeliegenden Prinzipien suchen |
| **Emotion** | Angst, Druck, Langeweile | Interesse, Engagement, Flow |
| **Hattie d** | **d = −0,11** (schadet der Leistung!) | **d = 0,69** (sehr wirksam) |

Ein zentraler Befund ist die **negative Effektstärke des Surface Approach**: Das bloße Lernen für die Note
schadet der Leistung **messbar**. Demgegenüber weist der Deep Approach mit d = 0,69 einen der höchsten
Effekte in Hatties Meta-Analyse auf.

### 6.2 Kritische Einordnung

John Hattie schätzt, dass etwa **90 Prozent des Unterrichts** sich auf Surface Knowledge konzentriert.

**Wichtig:** Der Lernansatz ist **keine feste Eigenschaft** des Schülers, sondern eine **Reaktion auf die
Lernumgebung**. Unterricht kann gezielt Deep Learning fördern oder – unbeabsichtigt – Surface Learning erzwingen.
        """)

    # ══════════════════════════════════════════
    # 7. EMPIRISCHE BEFUNDE
    # ══════════════════════════════════════════
    with st.expander("**7. Empirische Befunde**"):
        st.markdown("""
### 7.1 Hattie-Effektstärken zur Motivation

| Faktor | Effektstärke d | Einordnung |
|--------|----------------|------------|
| Deep motivation and approach | **0,69** | Sehr wirksam |
| Motivation (allgemein) | 0,42 | Über Schwellenwert |
| Reducing anxiety | 0,42 | Über Schwellenwert |
| Mastery goals | 0,06 | Gering |
| Performance goals | −0,01 | Kein Effekt |
| Surface motivation | **−0,11** | **Negativ!** |

*Quelle: Visible Learning, 2023*

### 7.2 PISA 2022: Aktuelle Befunde für Deutschland

| Befund | Wert |
|--------|------|
| Schüler, die sich selbst für Schularbeit motivieren können | 59% |
| Schüler, für die Mathematik Lieblingsfach ist | 38% |
| Schüler mit Mathematikangst (2012) | 31% |
| Schüler mit Mathematikangst (2022) | **39%** |

*Quelle: OECD, 2023*

### 7.3 Greifswalder Studie: Motivationsquellen deutscher Schüler

Eine Studie der Universität Greifswald mit 1.088 Schülerinnen und Schülern der Jahrgangsstufen 7 und 8
untersuchte die Motivationsquellen deutscher Jugendlicher:

| Motivationsquelle | Anteil |
|-------------------|--------|
| Beziehung zu **Mitschülern** | **34%** |
| Selbstmotivation (unabhängig von sozialen Beziehungen) | 29% |
| Beziehung zu Lehrern und Mitschülern gemeinsam | 27% |
| Nur lehrerabhängig | 10% |

**Zentraler Befund:** Die soziale Eingebundenheit – insbesondere die **Beziehung zu Peers** – ist für
deutsche Jugendliche der wichtigste Motivator. Die Lehrkraft allein motiviert nur 10% der Lernenden.
Dies unterstreicht die Bedeutung kooperativer Lernformen.
        """)

    # ══════════════════════════════════════════
    # 8. SYNTHESE
    # ══════════════════════════════════════════
    with st.expander("**8. Synthese: Integration der Theorien**"):
        st.markdown("""
Die dargestellten Theorien ergänzen sich und beleuchten unterschiedliche Facetten der Lernmotivation:

| Theorie | Kernaussage | Pädagogischer Fokus |
|---------|-------------|---------------------|
| **Selbstbestimmungstheorie** | Motivation entsteht durch Erfüllung von Autonomie, Kompetenz und Eingebundenheit | Wahlmöglichkeiten, Erfolgserlebnisse, Beziehungsgestaltung |
| **Erwartungs-Wert-Theorie** | Motivation = Erfolgserwartung × Aufgabenwert | Selbstwirksamkeit stärken, Relevanz vermitteln |
| **Interesse-Theorie** | Interesse entwickelt sich von situational zu individuell | Neugier wecken, langfristig Interesse aufbauen |
| **Attributionstheorie** | Ursachenzuschreibungen beeinflussen zukünftige Motivation | Anstrengungsattributionen fördern, Hilflosigkeit vermeiden |
| **Deep vs. Surface Learning** | Tiefenverarbeitung ist wirksamer als Oberflächenlernen | Verständnisorientierung, Prüfungsformate anpassen |
        """)

    # ══════════════════════════════════════════
    # 9. HANDLUNGSEMPFEHLUNGEN
    # ══════════════════════════════════════════
    st.subheader("9. Handlungsempfehlungen für die pädagogische Praxis")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
### 🎯 Autonomie fördern
- Wahlmöglichkeiten bei Aufgabenstellungen anbieten (Thema, Medium, Bearbeitungsform)
- Lernende an der Unterrichtsplanung beteiligen
- Eigene Zielsetzung ermöglichen und unterstützen
- Begründungen für Lerninhalte transparent machen (Relevanz aufzeigen)

### 💪 Kompetenzerleben stärken
- Aufgaben im Bereich der proximalen Entwicklung stellen (herausfordernd, aber lösbar)
- Lernfortschritte sichtbar machen und anerkennen
- Prozessorientiertes Feedback geben: Anstrengung und Strategie betonen
- Fehler als Lerngelegenheiten rahmen, nicht als Versagen

### 👥 Soziale Eingebundenheit stärken
- Kooperative Lernformen systematisch einsetzen (Peer-Tutoring, Lernpartnerschaften)
- Positive Klassengemeinschaft fördern
- Wertschätzende Lehrer-Schüler-Beziehungen aufbauen
        """)

    with col2:
        st.markdown("""
### 💡 Interesse entwickeln
- Situationales Interesse durch Überraschung, Neuheit und Relevanz wecken
- Verbindungen zur Lebenswelt der Lernenden herstellen (Nützlichkeitswert)
- Vertiefte Beschäftigung durch anspruchsvolle, bedeutsame Aufgaben ermöglichen

### 🔄 Günstige Attributionen fördern
- Erfolge auf Anstrengung und effektive Strategien zurückführen
- Misserfolge als veränderbar und kontrollierbar rahmen
- Begabungsorientierte Zuschreibungen vermeiden ("Du bist halt gut/schlecht in...")

### 🧠 Deep Learning fördern
- Fragen nach dem "Warum" stellen, nicht nur nach dem "Was"
- Neues Wissen systematisch mit Vorwissen verbinden
- Prüfungsformate entwickeln, die Verständnis statt Reproduktion erfordern
- Noten als diagnostisches Feedback nutzen, nicht als Druckmittel
        """)

    # ══════════════════════════════════════════
    # 10. FAZIT
    # ══════════════════════════════════════════
    st.success("""
### 10. Fazit

Die Förderung von Lernmotivation erfordert ein systematisches Verständnis der zugrundeliegenden Mechanismen.
Die dargestellten Theorien – Selbstbestimmungstheorie, Erwartungs-Wert-Theorie, Interesse-Theorie und
Attributionstheorie – bieten komplementäre Zugänge, die sich in der Praxis gewinnbringend verbinden lassen.

**Die empirischen Befunde sind eindeutig:**
- Deep Motivation **wirkt** (d = 0,69)
- Surface Motivation **schadet** (d = −0,11)
- Die drei Grundbedürfnisse nach **Autonomie, Kompetenz und sozialer Eingebundenheit** müssen erfüllt sein
- **Peers** sind für deutsche Jugendliche die wichtigste Motivationsquelle (34%)

**Für die pädagogische Praxis bedeutet dies:** Unterricht muss Wahlmöglichkeiten bieten, Erfolgserlebnisse
ermöglichen, kooperative Lernformen integrieren und Interesse entwickeln. Feedback sollte anstrengungsorientiert
sein und Noten als diagnostisches Instrument dienen. Nur so kann nachhaltige Motivation entstehen, die über
das Bestehen der nächsten Prüfung hinausreicht.
    """)

    # ══════════════════════════════════════════
    # LITERATURVERZEICHNIS
    # ══════════════════════════════════════════
    with st.expander("📚 **Literaturverzeichnis**"):
        st.markdown("""
**Primärquellen:**

Bandura, A. (1997). *Self-efficacy: The exercise of control.* Freeman.

Biggs, J. B. (1987). *Student approaches to learning and studying.* Australian Council for Educational Research.

Deci, E. L., Koestner, R., & Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects
of extrinsic rewards on intrinsic motivation. *Psychological Bulletin, 125*(6), 627–668.

Deci, E. L., & Ryan, R. M. (1985). *Intrinsic motivation and self-determination in human behavior.* Plenum Press.

Deci, E. L., & Ryan, R. M. (2000). The "what" and "why" of goal pursuits: Human needs and the self-determination
of behavior. *Psychological Inquiry, 11*(4), 227–268.

Eccles, J. S., & Wigfield, A. (2002). Motivational beliefs, values, and goals. *Annual Review of Psychology, 53*, 109–132.

Hattie, J. (2009). *Visible Learning: A synthesis of over 800 meta-analyses relating to achievement.* Routledge.

Hattie, J., & Donoghue, G. M. (2016). Learning strategies: A synthesis and conceptual model. *npj Science of Learning, 1*, 16013.

Hidi, S. (2006). Interest: A unique motivational variable. *Educational Research Review, 1*(2), 69–82.

Hidi, S., & Renninger, K. A. (2006). The four-phase model of interest development. *Educational Psychologist, 41*(2), 111–127.

Krapp, A. (1992). Das Interessenkonstrukt. *Zeitschrift für Pädagogik, 38*(5), 747–768.

Krapp, A. (2002). Structural and dynamic aspects of interest development. *Learning and Instruction, 12*(4), 383–409.

OECD (2023). *PISA 2022 Results (Volume I): The State of Learning and Equity in Education.* OECD Publishing.

Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation,
social development, and well-being. *American Psychologist, 55*(1), 68–78.

Weiner, B. (1985). An attributional theory of achievement motivation and emotion. *Psychological Review, 92*(4), 548–573.

Weiner, B. (2010). The development of an attribution-based theory of motivation: A history of ideas.
*Educational Psychologist, 45*(1), 28–36.

Universität Greifswald (2019). SELF-Studie: Motivationsquellen bei Schülerinnen und Schülern der Sekundarstufe I.
Unveröffentlichter Forschungsbericht.
        """)
