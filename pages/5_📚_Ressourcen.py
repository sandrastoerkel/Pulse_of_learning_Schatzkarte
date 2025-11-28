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
    from utils.user_system import render_user_login, is_logged_in, get_current_user_id, get_current_user
    HAS_GAMIFICATION = True
except ImportError:
    HAS_GAMIFICATION = False

# ============================================
# TRY TO IMPORT LEARNSTRAT CHALLENGES (optional)
# ============================================

try:
    from utils.learnstrat_challenges import (
        render_powertechniken_challenge,
        render_transfer_challenge,
        render_birkenbihl_challenge,
        init_learnstrat_tables
    )
    import sqlite3
    HAS_LEARNSTRAT = True
except ImportError:
    HAS_LEARNSTRAT = False

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
    # TAB 1: CHALLENGES
    # ==========================================
    with tab_interaktiv:
        if HAS_LEARNSTRAT and HAS_GAMIFICATION and is_logged_in():
            # User ist eingeloggt - zeige die Challenges
            user = get_current_user()
            if user:
                # DB Connection für die Challenges
                from utils.gamification_db import get_db_path
                conn = sqlite3.connect(get_db_path())

                # XP Callback definieren
                def award_xp_callback(user_id, xp, reason):
                    """Vergibt XP an den User."""
                    from utils.gamification_db import update_user_stats, get_or_create_user
                    user_data = get_or_create_user(user_id)
                    current_streak = user_data.get("current_streak", 0)
                    update_user_stats(user_id, xp, current_streak)

                # Sub-Tabs für verschiedene Challenges
                challenge_tab1, challenge_tab2, challenge_tab3 = st.tabs([
                    "💪 Die 7 Powertechniken",
                    "🚀 Das Geheimnis der Überflieger",
                    "🧠 Die Birkenbihl-Methode"
                ])

                with challenge_tab1:
                    st.caption("Challenge 1: Wissenschaftlich fundierte Lerntechniken kennenlernen")
                    render_powertechniken_challenge(
                        user=user,
                        conn=conn,
                        xp_callback=award_xp_callback
                    )

                with challenge_tab2:
                    st.caption("Challenge 2: Transfer-Strategien (Effektstärke d=0.86!)")
                    render_transfer_challenge(
                        user=user,
                        conn=conn,
                        xp_callback=award_xp_callback
                    )

                with challenge_tab3:
                    st.caption("Challenge 3: Die Birkenbihl-Methode (nach Vera F. Birkenbihl)")
                    render_birkenbihl_challenge(
                        user=user,
                        conn=conn,
                        xp_callback=award_xp_callback
                    )

                conn.close()
            else:
                st.warning("Fehler beim Laden des Benutzerprofils.")
        elif HAS_LEARNSTRAT and HAS_GAMIFICATION and not is_logged_in():
            # Module vorhanden, aber User nicht eingeloggt
            st.info("🔐 **Bitte melde dich oben an, um die interaktiven Challenges zu nutzen!**")
            render_user_login()
        else:
            # Module nicht verfügbar - Platzhalter
            st.header("🎮 Challenges")
            st.info("""
            🚧 **Interaktive Lernstrategie-Challenges werden geladen...**

            Falls diese Nachricht bestehen bleibt, fehlen möglicherweise Module.
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
