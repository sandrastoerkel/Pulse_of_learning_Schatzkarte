"""
📚 Lernstrategie-Challenge Content
==================================

Wissenschaftlich fundierte Lerntechniken mit Effektstärken nach Hattie/Dunlosky.
Altersstufen-spezifische Inhalte für Grundschule bis Oberstufe.

Quellen:
- Donoghue & Hattie (2021): Meta-Analyse mit 242 Studien, 169.179 Teilnehmern
- Dunlosky et al. (2013): Improving Students' Learning With Effective Learning Techniques
- Rohrer et al. (2015): Interleaving Study (4. Klasse, d=1.21)
"""

from typing import Dict, Any, List

# ============================================
# EFFEKTSTÄRKEN (Hattie/Dunlosky)
# ============================================

EFFECT_SIZES = {
    "distributed_practice": 0.79,    # Spaced Repetition - STÄRKSTE!
    "practice_testing": 0.74,        # Active Recall
    "interleaved_practice": 0.56,    # Interleaving (aber Rohrer-Studie: d=1.21!)
    "elaboration": 0.56,             # Feynman-Methode (Teil davon)
    "mnemonics": 0.50,               # Loci-Methode (Teil davon)
    "self_explanation": 0.54,        # Lernen durch Lehren (Teil davon)
    "time_management": None,         # Pomodoro - nicht direkt gemessen
}

# ============================================
# XP KONFIGURATION FÜR CHALLENGES
# ============================================

CHALLENGE_XP = {
    "technique_discovered": 10,      # Technik kennengelernt
    "exercise_completed": 15,        # Übung gemacht
    "reflection_done": 5,            # Bewertung abgegeben
    "all_techniques_done": 50,       # Bonus: Alle 7 geschafft
    "top3_selected": 25,             # Top 3 ausgewählt
    "certificate_earned": 20,        # Zertifikat erhalten
}

# ============================================
# DIE 7 POWERTECHNIKEN
# ============================================
# Reihenfolge: Nach Leichtigkeit des Einstiegs (für schnelle Erfolgserlebnisse)

POWERTECHNIKEN = {
    # ─────────────────────────────────────────
    # 1. POMODORO - Super einfach, sofort umsetzbar
    # ─────────────────────────────────────────
    "pomodoro": {
        "order": 1,
        "name": "Pomodoro-Technik",
        "icon": "🍅",
        "effect_size": None,
        "effect_note": "Zeitmanagement-Methode (keine direkte Effektstärke)",
        "core_idea": "25 Minuten fokussiert lernen, dann 5 Minuten Pause",
        "science_fact": "Dein Gehirn kann sich nur 20-45 Minuten voll konzentrieren. Danach braucht es eine Pause!",
        "anwendung_bei": {
            "ideal_fuer": ["Alle Lernaufgaben", "Hausaufgaben", "Prüfungsvorbereitung", "Leseaufgaben"],
            "beispiele": ["Mathe-Hausaufgaben", "Aufsatz schreiben", "Vokabeln lernen", "Präsentation vorbereiten"],
            "hinweis": "Universell für alle Lernaufgaben geeignet - hilft bei der Konzentration!",
        },
        "kurzanleitung": "Timer auf 15-25 Min stellen → fokussiert lernen → 5 Min Pause → wiederholen",
        
        "altersstufen": {
            "grundschule": {
                "intro": "Stell dir vor, du hast eine magische Tomate! 🍅 Diese Tomate hilft dir, dich beim Lernen zu konzentrieren. So funktioniert's: Du stellst einen Timer auf 15 Minuten und lernst, bis er klingelt. Dann darfst du 5 Minuten Pause machen!",
                "duration": 15,
                "break_duration": 5,
                "exercise": {
                    "title": "Deine erste Tomate!",
                    "instruction": "Nimm dir eine Hausaufgabe oder Lernaufgabe vor (z.B. Vokabeln, Mathe-Aufgaben, Lesen). Starte den Timer und arbeite konzentriert, bis er klingelt. Kein Handy, kein Aufstehen - du schaffst das!",
                    "timer_needed": True,
                },
                "fun_fact": "Die Technik heißt 'Pomodoro', weil der Erfinder eine Küchenuhr in Form einer Tomate benutzt hat! 🍅",
            },
            "unterstufe": {
                "intro": "Kennst du das? Du willst lernen, aber nach 10 Minuten schaust du schon aufs Handy? Die Pomodoro-Technik hilft! Du lernst 20 Minuten ohne Ablenkung, dann hast du 5 Minuten verdiente Pause.",
                "duration": 20,
                "break_duration": 5,
                "exercise": {
                    "title": "Hausaufgaben-Pomodoro",
                    "instruction": "Nimm deine Hausaufgaben und starte den Timer. Leg dein Handy in ein anderes Zimmer!",
                    "timer_needed": True,
                },
                "fun_fact": "Studien zeigen: Mit Pausen lernst du mehr als ohne! Dein Gehirn verarbeitet in der Pause das Gelernte.",
            },
            "mittelstufe": {
                "intro": "Dein Gehirn ist wie ein Muskel – es ermüdet bei Dauerbelastung. Die Pomodoro-Technik nutzt das aus: 25 Minuten volle Konzentration, dann 5 Minuten Erholung. Nach 4 Pomodoros machst du eine längere Pause (15-30 Min).",
                "duration": 25,
                "break_duration": 5,
                "exercise": {
                    "title": "Lern-Session planen",
                    "instruction": "Plane deine nächste Lerneinheit: Wie viele Pomodoros brauchst du? Was machst du in den Pausen?",
                    "timer_needed": True,
                },
                "fun_fact": "Francesco Cirillo erfand die Technik in den 80ern als Student. Heute nutzen sie Millionen Menschen weltweit!",
            },
            "oberstufe": {
                "intro": "Die Pomodoro-Technik basiert auf Erkenntnissen der Kognitionspsychologie: Fokussierte Arbeitsphasen (25 Min) wechseln mit kurzen Erholungsphasen (5 Min). Dies optimiert die kognitive Leistung und verhindert mentale Erschöpfung.",
                "duration": 25,
                "break_duration": 5,
                "exercise": {
                    "title": "Produktivitäts-Experiment",
                    "instruction": "Vergleiche: Lerne ein Thema 1 Stunde am Stück vs. 2x25 Min mit Pause. Was funktioniert besser?",
                    "timer_needed": True,
                },
                "fun_fact": "Profi-Tipp: In der Pause NICHT aufs Handy! Besser: Bewegen, trinken, aus dem Fenster schauen.",
            },
            "paedagogen": {
                "intro": "Die Pomodoro-Technik ist ein niedrigschwelliges Zeitmanagement-Tool. Obwohl keine direkten Effektstärken-Studien existieren, zeigt die Forschung zu 'spaced practice', dass regelmäßige Pausen die Lerneffizienz steigern.",
                "duration": 25,
                "break_duration": 5,
                "implementation": "Führen Sie Pomodoro-Einheiten im Unterricht ein. Visualisieren Sie den Timer. Besprechen Sie mit Schülern, welche Pausenaktivitäten regenerativ wirken.",
                "research_note": "Cirillo, F. (2018). The Pomodoro Technique. Currency.",
            },
        },
    },
    
    # ─────────────────────────────────────────
    # 2. ACTIVE RECALL - Einfach zu verstehen
    # ─────────────────────────────────────────
    "active_recall": {
        "order": 2,
        "name": "Active Recall",
        "icon": "🔄",
        "effect_size": 0.74,
        "effect_note": "Practice Testing: d=0.74 (Hattie)",
        "core_idea": "Nicht nur lesen – aktiv aus dem Gedächtnis abrufen!",
        "science_fact": "Jedes Mal, wenn du versuchst, dich zu erinnern, wird die Verbindung im Gehirn stärker!",
        "anwendung_bei": {
            "ideal_fuer": ["Vokabeln", "Definitionen", "Fakten", "Formeln", "Geschichtsdaten"],
            "beispiele": ["Englisch-Vokabeln", "Mathe-Formeln", "HSU-Fakten", "Geschichte-Daten"],
            "hinweis": "Perfekt für alles, was du auswendig lernen musst!",
        },
        "kurzanleitung": "Buch/Heft schließen → aufschreiben was du weißt → vergleichen → Lücken nochmal lernen",
        
        "altersstufen": {
            "grundschule": {
                "intro": "Hier ist ein Geheimnis: Wenn du etwas lernst, mach das Buch zu und frag dich selbst ab! Das ist wie ein Spiel: 'Kannst du dich erinnern?' Jedes Mal, wenn du's schaffst, wird dein Gehirn stärker! 💪",
                "exercise": {
                    "title": "Das Erinnerungs-Spiel",
                    "instruction": "Lies diese 5 Wörter: Apfel, Hund, Sonne, Ball, Buch. Schließe jetzt die Augen und zähle sie auf!",
                    "test_words": ["Apfel", "Hund", "Sonne", "Ball", "Buch"],
                },
                "fun_fact": "Dein Gehirn hat über 86 Milliarden Nervenzellen – mehr als Sterne in der Milchstraße! 🌟",
            },
            "unterstufe": {
                "intro": "Der größte Lernfehler? Nur lesen und denken 'Hab ich verstanden!' Besser: Buch zu, versuchen zu erinnern. Das nennt man Active Recall – und es ist 3x effektiver als nochmal lesen!",
                "exercise": {
                    "title": "Selbst-Quiz",
                    "instruction": "Nimm dein letztes Lernthema. Schreib auf, was du weißt – OHNE nachzuschauen. Dann vergleiche!",
                    "test_words": None,
                },
                "fun_fact": "Wissenschaftler haben bewiesen: Sich selbst abfragen wirkt besser als 10x den Text lesen!",
            },
            "mittelstufe": {
                "intro": "Active Recall nutzt den 'Testing Effect': Das Abrufen von Informationen ist SELBST eine Lernmethode, nicht nur ein Test. Effektstärke d=0.74 – das bedeutet: Schüler, die sich selbst testen, schneiden deutlich besser ab!",
                "exercise": {
                    "title": "Karteikarten erstellen",
                    "instruction": "Erstelle 10 Karteikarten zu deinem aktuellen Lernstoff. Frage auf der einen Seite, Antwort auf der anderen.",
                    "test_words": None,
                },
                "fun_fact": "Apps wie Anki nutzen Active Recall + Spaced Repetition. Medizinstudenten schwören darauf!",
            },
            "oberstufe": {
                "intro": "Der 'Testing Effect' (Roediger & Karpicke, 2006) zeigt: Aktives Abrufen stärkt Gedächtnisspuren effektiver als passives Wiederholen. Die Effektstärke von d=0.74 macht Practice Testing zu einer der wirksamsten Lernstrategien.",
                "exercise": {
                    "title": "Elaborative Interrogation",
                    "instruction": "Nimm ein Konzept und stelle dir 'Warum?'-Fragen. Beantworte sie aus dem Gedächtnis, dann recherchiere.",
                    "test_words": None,
                },
                "fun_fact": "Feynman: 'Wenn du es nicht einfach erklären kannst, hast du es nicht verstanden.'",
            },
            "paedagogen": {
                "intro": "Practice Testing (d=0.74) gehört zu den am besten erforschten Lernstrategien. Der Testing Effect zeigt, dass Abrufübungen das Langzeitgedächtnis effektiver stärken als wiederholtes Lesen (d=0.34).",
                "implementation": "Integrieren Sie regelmäßige Low-Stakes-Tests: Eingangsquiz, Exit-Tickets, Think-Pair-Share. Wichtig: Fehler als Lernchance framen!",
                "research_note": "Roediger, H.L. & Karpicke, J.D. (2006). Test-enhanced learning. Psychological Science.",
            },
        },
    },
    
    # ─────────────────────────────────────────
    # 3. FEYNMAN-METHODE - Macht Spaß, intuitiv
    # ─────────────────────────────────────────
    "feynman": {
        "order": 3,
        "name": "Feynman-Methode",
        "icon": "👶",
        "effect_size": 0.56,
        "effect_note": "Elaboration: d=0.56 (Hattie)",
        "core_idea": "Erkläre es so einfach, dass es ein Zweitklässler versteht!",
        "science_fact": "Wenn du etwas erklären kannst, hast du es wirklich verstanden. Lücken werden sofort sichtbar!",
        "anwendung_bei": {
            "ideal_fuer": ["Komplexe Konzepte verstehen", "Zusammenhänge", "Naturwissenschaften", "Sachthemen"],
            "beispiele": ["HSU: Wie funktioniert der Wasserkreislauf?", "Mathe: Warum funktioniert Division?", "Sachthemen erklären"],
            "hinweis": "Funktioniert ALLEINE! Du brauchst keinen echten Zuhörer – nur dich selbst oder ein Kuscheltier.",
        },
        "kurzanleitung": "Thema wählen → alleine laut erklären (Kuscheltier/Spiegel) → wo stockst du? → dort nochmal lernen",

        "altersstufen": {
            "grundschule": {
                "intro": "Stell dir vor, du erklärst deinem Kuscheltier etwas! 🧸 Das Kuscheltier stellt keine Fragen – du redest einfach drauflos. Wenn du nicht mehr weiterweißt, hast du eine Lücke gefunden! Dann musst du nochmal nachschauen. Diese Methode funktioniert ganz alleine!",
                "exercise": {
                    "title": "Teddy-Erklärer",
                    "instruction": "Setz dich alleine hin und erkläre deinem Kuscheltier (oder dir selbst im Spiegel) dein aktuelles HSU-Thema. Sprich laut! Wo bleibst du hängen? Das musst du nochmal lernen!",
                    "topic_suggestion": "Dein aktuelles HSU-Thema",
                    "partner_needed": False,
                },
                "fun_fact": "Richard Feynman war ein berühmter Wissenschaftler, der sogar den Nobelpreis gewonnen hat! 🏆",
            },
            "unterstufe": {
                "intro": "Die Feynman-Methode funktioniert ganz alleine! Stell dir vor, du müsstest einem Grundschüler etwas erklären – aber du brauchst keinen echten. Rede laut vor dich hin oder nimm dich mit dem Handy auf. Wo du stockst, hast du eine Wissenslücke gefunden!",
                "exercise": {
                    "title": "Solo-Erklärbär",
                    "instruction": "Nimm dein Handy und erkläre dein aktuelles Thema in einer Sprachnachricht (nur für dich!). Keine Fachbegriffe – so einfach wie für einen Zweitklässler. Hör es dir an: Wo hast du gestockt?",
                    "topic_suggestion": "Dein aktuelles Schulthema",
                    "partner_needed": False,
                },
                "fun_fact": "Feynman sagte: 'Ich kann nichts erschaffen, was ich nicht verstehen kann.'",
            },
            "mittelstufe": {
                "intro": "Die Feynman-Technik ist dein Selbst-Check! Du brauchst niemanden – nur dich selbst. Erkläre ein Thema laut, als würdest du es einem Kind beibringen. Wo du ins Stocken gerätst, hast du deine Lücken gefunden. Das ist der Unterschied zu 'Lernen durch Lehren': Hier geht es um DEINE Lücken finden, nicht um Dialog.",
                "exercise": {
                    "title": "Lücken-Finder",
                    "instruction": "Wähle ein schwieriges Thema. Erkläre es 3 Minuten lang laut vor dich hin (oder nimm dich auf). Notiere jeden Moment, wo du unsicher warst – das sind deine Lücken!",
                    "topic_suggestion": "Ein Thema, das du glaubst verstanden zu haben",
                    "partner_needed": False,
                },
                "fun_fact": "Einstein: 'Wenn du es einem Sechsjährigen nicht erklären kannst, verstehst du es selbst nicht.'",
            },
            "oberstufe": {
                "intro": "Die Feynman-Methode ist eine Solo-Technik zur Identifikation von Verständnislücken. Anders als 'Lernen durch Lehren' brauchst du keinen Partner. Du externalisierst dein Wissen durch lautes Erklären und identifizierst Stellen, an denen dein mentales Modell unvollständig ist.",
                "exercise": {
                    "title": "Selbst-Audit",
                    "instruction": "Nimm ein Video von dir auf, in dem du ein Prüfungsthema erklärst (max. 5 Min). Schau es kritisch an: Wo vereinfachst du zu stark? Wo weichst du aus? Das sind deine Schwachstellen.",
                    "topic_suggestion": None,
                    "partner_needed": False,
                },
                "fun_fact": "Feynman-Vorlesungen sind frei auf YouTube – inspirierend und verständlich!",
            },
            "paedagogen": {
                "intro": "Die Feynman-Methode ist eine Solo-Elaborationsstrategie (d=0.56). Im Gegensatz zu 'Lernen durch Lehren' benötigt sie keinen realen Partner. Der Lernende erklärt sich selbst den Stoff und identifiziert dabei Verständnislücken durch den Zwang zur Vereinfachung.",
                "implementation": "Lassen Sie Schüler sich selbst aufnehmen (Audio/Video). Die Selbstreflexion beim Anhören zeigt Lücken auf. Wichtig: Dies ist eine Einzelübung, kein Peer-Teaching!",
                "research_note": "Chi, M.T.H. (2000). Self-explaining expository texts. The Journal of the Learning Sciences.",
            },
        },
    },
    
    # ─────────────────────────────────────────
    # 4. SPACED REPETITION - Sehr effektiv!
    # ─────────────────────────────────────────
    "spaced_repetition": {
        "order": 4,
        "name": "Spaced Repetition",
        "icon": "📅",
        "effect_size": 0.79,
        "effect_note": "Distributed Practice: d=0.79 – STÄRKSTE TECHNIK!",
        "core_idea": "Wiederhole in wachsenden Abständen: 1 Tag, 3 Tage, 1 Woche, 2 Wochen...",
        "science_fact": "Dein Gehirn vergisst nach einer 'Vergessenskurve' – Spaced Repetition unterbricht sie optimal!",
        "anwendung_bei": {
            "ideal_fuer": ["Vokabeln", "Fakten", "Formeln", "Jahreszahlen", "Definitionen"],
            "beispiele": ["Englisch-Vokabeln", "1x1 festigen", "Geschichtsdaten", "HSU-Fakten für Probe"],
            "hinweis": "DIE stärkste Technik für langfristiges Behalten! Perfekt für Prüfungsvorbereitung.",
        },
        "kurzanleitung": "Heute lernen → morgen wiederholen → in 3 Tagen → in 1 Woche → in 2 Wochen",
        
        "altersstufen": {
            "grundschule": {
                "intro": "Stell dir vor, du pflanzt einen Sämling 🌱. Du gießt ihn nicht alles auf einmal, sondern jeden Tag ein bisschen. Beim Lernen ist es genauso! Lerne etwas heute, morgen wieder, dann in 3 Tagen. So wächst das Wissen!",
                "exercise": {
                    "title": "Wissens-Kalender",
                    "instruction": "Übe heute eine Einmaleins-Reihe (z.B. die 7er-Reihe), die deutschen Fälle oder Wortarten. Schreib in deinen Kalender: Morgen wiederholen, in 3 Tagen nochmal, in 1 Woche nochmal! Tipp: Lern-Apps wie Anki fragen dich automatisch in den richtigen Abständen ab.",
                    "schedule": ["Tag 1: Lernen", "Tag 2: 1. Wiederholung", "Tag 4: 2. Wiederholung", "Tag 8: 3. Wiederholung"],
                },
                "fun_fact": "Wissenschaftler nennen das die 'Vergessenskurve' – aber du kannst sie besiegen! 💪",
            },
            "unterstufe": {
                "intro": "Das Geheimnis von Vokabel-Profis: Nicht alles auf einmal pauken! Lerne heute 10 Vokabeln, wiederhole sie morgen, dann in 3 Tagen, dann in einer Woche. Mit jedem Mal sitzt es fester im Langzeitgedächtnis.",
                "exercise": {
                    "title": "Lernplan erstellen",
                    "instruction": "Erstelle einen Wiederholungsplan für dein nächstes Vokabel-Paket: Tag 1, 2, 5, 10.",
                    "schedule": ["Tag 1: Lernen", "Tag 2: Wiederholen", "Tag 5: Wiederholen", "Tag 10: Wiederholen"],
                },
                "fun_fact": "Apps wie Anki berechnen automatisch den perfekten Wiederholungszeitpunkt!",
            },
            "mittelstufe": {
                "intro": "Spaced Repetition hat die höchste Effektstärke aller Lerntechniken (d=0.79)! Die Idee: Wiederhole kurz bevor du vergisst. Typischer Rhythmus: 1-3-7-14-30 Tage. Jede Wiederholung stärkt die neuronale Verbindung.",
                "exercise": {
                    "title": "Anki-Experiment",
                    "instruction": "Lade Anki herunter und erstelle 20 Karteikarten. Nutze es 2 Wochen täglich – beobachte den Effekt!",
                    "schedule": None,
                },
                "fun_fact": "Die Vergessenskurve wurde 1885 von Hermann Ebbinghaus entdeckt – seine Erkenntnisse gelten noch heute!",
            },
            "oberstufe": {
                "intro": "Distributed Practice (d=0.79) ist die effektstärkste Lerntechnik nach Hattie. Die Ebbinghaus-Vergessenskurve zeigt exponentiellen Verfall – optimale Wiederholungsintervalle unterbrechen diesen Prozess und maximieren die Retention.",
                "exercise": {
                    "title": "Optimierter Lernplan",
                    "instruction": "Erstelle einen Abi-Vorbereitungsplan mit gestaffelten Wiederholungen. Nutze die 1-3-7-14-30-Regel.",
                    "schedule": None,
                },
                "fun_fact": "Der Leitner-Kasten (5 Fächer) ist eine analoge Spaced-Repetition-Methode aus den 1970ern.",
            },
            "paedagogen": {
                "intro": "Distributed Practice (d=0.79) übertrifft alle anderen Lernstrategien. Der Spacing Effect zeigt: Verteiltes Lernen ist massivem Lernen (Cramming) deutlich überlegen, insbesondere für Langzeit-Retention.",
                "implementation": "Bauen Sie Wiederholungsschleifen in den Unterricht ein: Warm-ups mit altem Stoff, kumulative Tests, Spiralcurriculum. Tools: Anki, Quizlet.",
                "research_note": "Cepeda et al. (2006). Distributed practice in verbal recall tasks. Psychological Bulletin.",
            },
        },
    },
    
    # ─────────────────────────────────────────
    # 5. LERNEN DURCH LEHREN - Braucht Partner
    # ─────────────────────────────────────────
    "teaching": {
        "order": 5,
        "name": "Lernen durch Lehren",
        "icon": "👥",
        "effect_size": 0.54,
        "effect_note": "Peer Tutoring: d=0.54 (Hattie)",
        "core_idea": "Erkläre einer echten Person – und beantworte ihre Fragen!",
        "science_fact": "Der Dialog macht den Unterschied: Fragen und Nachfragen vertiefen dein Verständnis!",
        "anwendung_bei": {
            "ideal_fuer": ["Alle Themen", "Vertiefung durch Dialog", "Prüfungsvorbereitung zu zweit"],
            "beispiele": ["Geschwistern Mathe erklären", "Eltern HSU-Thema vorstellen", "Lerngruppe mit Freunden"],
            "hinweis": "Braucht einen ECHTEN Partner! Der Dialog und die Rückfragen machen diese Methode so stark.",
        },
        "kurzanleitung": "Partner finden → Thema erklären → Fragen beantworten → gemeinsam Lücken klären",

        "altersstufen": {
            "grundschule": {
                "intro": "Diese Technik brauchst du mit jemand anderem zusammen! 👨‍👩‍👧 Erkläre Mama, Papa, Oma oder einem Freund, was du gelernt hast. Das Besondere: Sie dürfen Fragen stellen! Wenn du ihre Fragen beantworten kannst, hast du es richtig verstanden.",
                "exercise": {
                    "title": "Frage-Antwort-Spiel",
                    "instruction": "Erkläre einem Familienmitglied dein Schulthema. Bitte sie, dir 3 Fragen dazu zu stellen! Kannst du alle beantworten?",
                    "partner_needed": True,
                },
                "fun_fact": "Lehrer lernen oft mehr als ihre Schüler – weil sie so viele Fragen beantworten müssen!",
            },
            "unterstufe": {
                "intro": "Der Unterschied zur Feynman-Methode: Hier brauchst du einen ECHTEN Partner, der Fragen stellt! Dein Gehirn arbeitet härter, weil du nicht weißt, was gefragt wird. Das nennt man den 'Protégé-Effekt' – du lernst durchs Lehren.",
                "exercise": {
                    "title": "Lern-Tandem",
                    "instruction": "Triff dich mit einem Freund (oder per Video-Call). Erkläre ihm 5 Minuten ein Thema – er darf unterbrechen und Fragen stellen! Dann tauscht ihr.",
                    "partner_needed": True,
                },
                "fun_fact": "Studien zeigen: Schüler, die anderen etwas beibringen, behalten 90% – beim Lesen nur 10%!",
            },
            "mittelstufe": {
                "intro": "Lernen durch Lehren braucht echte Interaktion! Anders als bei Feynman geht es nicht nur ums Erklären, sondern um den Dialog: Fragen beantworten, nachfragen, diskutieren. Erst durch die Rückfragen merkst du, wo dein Verständnis oberflächlich ist.",
                "exercise": {
                    "title": "Lehrer-Schüler-Wechsel",
                    "instruction": "Organisiere mit 1-2 Mitschülern: Jeder erklärt 10 Min ein Thema. Die anderen MÜSSEN mindestens 3 Fragen stellen. Dann Rollenwechsel!",
                    "partner_needed": True,
                },
                "fun_fact": "Viele Studenten lernen am besten in Lerngruppen – weil sie sich gegenseitig unterrichten!",
            },
            "oberstufe": {
                "intro": "Lernen durch Lehren (LdL) kombiniert Elaboration mit Social Learning. Der entscheidende Unterschied zur Feynman-Methode: Die Interaktion! Rückfragen zwingen dich, flexibel zu denken und verschiedene Erklärungsansätze zu finden.",
                "exercise": {
                    "title": "Peer-Tutoring Session",
                    "instruction": "Organisiere eine Lerngruppe (3-4 Personen). Jeder bereitet ein Thema vor und 'unterrichtet' 15 Min. Regel: Die Zuhörer müssen kritische Fragen stellen!",
                    "partner_needed": True,
                },
                "fun_fact": "Jean-Pol Martin entwickelte LdL in den 80ern – heute nutzen es Universitäten weltweit!",
            },
            "paedagogen": {
                "intro": "Lernen durch Lehren (LdL) nach Jean-Pol Martin nutzt den Protégé-Effekt UND Social Learning. Im Gegensatz zur Feynman-Methode (Solo) ist hier die Interaktion zentral: Fragen, Nachfragen und Diskussion vertiefen das Verständnis beider Seiten.",
                "implementation": "Strukturieren Sie Peer-Teaching mit klaren Rollen: Erklärer und aktive Zuhörer (mit Fragepflicht!). Varianten: Expertengruppen, Lerntandems, gegenseitige Quiz-Erstellung. Wichtig: Passives Zuhören vermeiden!",
                "research_note": "Martin, J.-P. (2004). Lernen durch Lehren. Die Schulleitung. / Roscoe & Chi (2007). Tutor learning.",
            },
        },
    },
    
    # ─────────────────────────────────────────
    # 6. LOCI-METHODE - Erfordert Übung
    # ─────────────────────────────────────────
    "loci": {
        "order": 6,
        "name": "Loci-Methode",
        "icon": "🏰",
        "effect_size": 0.50,
        "effect_note": "Mnemonics: d=0.50 (Hattie)",
        "core_idea": "Verknüpfe Lernstoff mit Orten in deinem 'Gedächtnispalast'",
        "science_fact": "Dein räumliches Gedächtnis ist extrem stark – nutze es zum Lernen!",
        "anwendung_bei": {
            "ideal_fuer": ["Listen", "Reihenfolgen", "Fakten", "Vokabeln", "Namen"],
            "beispiele": ["HSU: Pflanzennamen", "Geschichte: Ereignisreihenfolge", "Deutsch: Wortarten-Beispiele", "Planeten-Reihenfolge"],
            "hinweis": "Perfekt für Listen und Reihenfolgen! Je verrückter das Bild, desto besser merkst du es dir.",
        },
        "kurzanleitung": "Bekannten Ort vorstellen (z.B. Zimmer) → Lerninhalt an Orte 'legen' → im Kopf durchgehen",
        
        "altersstufen": {
            "grundschule": {
                "intro": "Stell dir dein Kinderzimmer vor! 🏠 Jetzt leg an jeden Ort etwas, das du lernen willst: Die Vokabel 'Hund' (dog) sitzt auf deinem Bett, 'Katze' (cat) auf dem Schreibtisch. Wenn du durchs Zimmer gehst, erinnerst du dich!",
                "exercise": {
                    "title": "Zimmer-Spaziergang",
                    "instruction": "Lerne 5 Wörter, indem du sie an 5 Orte in deinem Zimmer legst. Geh im Kopf durch – was liegt wo?",
                    "locations": ["Bett", "Schreibtisch", "Schrank", "Fenster", "Tür"],
                },
                "fun_fact": "Diese Methode nutzten schon die alten Griechen vor über 2000 Jahren! 🏛️",
            },
            "unterstufe": {
                "intro": "Die Loci-Methode (Memory Palace): Stell dir einen Ort vor, den du gut kennst – dein Zuhause, Schulweg, Lieblingsspiel. Verbinde jeden Lerninhalt mit einem Ort. Das räumliche Gedächtnis vergisst fast nie!",
                "exercise": {
                    "title": "Schulweg-Speicher",
                    "instruction": "Nutze 10 Orte auf deinem Schulweg. Lege an jeden Ort eine Vokabel – je verrückter das Bild, desto besser!",
                    "locations": None,
                },
                "fun_fact": "Gedächtnis-Weltmeister nutzen alle die Loci-Methode – sie können sich tausende Zahlen merken!",
            },
            "mittelstufe": {
                "intro": "Der Gedächtnispalast nutzt das episodische Gedächtnis: Räumliche Erinnerungen sind extrem robust. Verknüpfe abstrakte Infos (Jahreszahlen, Fakten) mit konkreten Orten. Effektstärke (Mnemonics): d=0.50.",
                "exercise": {
                    "title": "Geschichts-Palast",
                    "instruction": "Baue einen Gedächtnispalast für ein Geschichtsthema: 10 Ereignisse an 10 Orten in deinem Haus.",
                    "locations": None,
                },
                "fun_fact": "Sherlock Holmes nutzt in den Büchern einen 'Mind Palace' – basiert auf der Loci-Methode!",
            },
            "oberstufe": {
                "intro": "Die Methode der Orte (Method of Loci) nutzt die überlegene Kapazität des räumlichen Gedächtnisses. Durch Visualisierung und Verknüpfung mit bekannten Routen werden selbst abstrakte Inhalte abrufbar.",
                "exercise": {
                    "title": "Prüfungs-Palast",
                    "instruction": "Erstelle einen Gedächtnispalast für dein komplexestes Prüfungsthema. Teste ihn mit einem Freund!",
                    "locations": None,
                },
                "fun_fact": "fMRT-Studien zeigen: Gedächtnis-Champions haben normale Gehirne – nur besser trainierte Strategien!",
            },
            "paedagogen": {
                "intro": "Die Method of Loci nutzt das räumliche Gedächtnis, das evolutionär besonders gut entwickelt ist. Mnemotechniken (d=0.50) sind besonders wirksam für Faktenwissen und Listen.",
                "implementation": "Führen Sie Gedächtnispaläste als Klassen-Aktivität ein. Lassen Sie Schüler gemeinsam einen 'Klassenraum-Palast' für Unterrichtsinhalte bauen.",
                "research_note": "Bower, G.H. (1970). Imagery as a relational organizer in associative learning. Journal of Verbal Learning.",
            },
        },
    },
    
    # ─────────────────────────────────────────
    # 7. INTERLEAVING - Am komplexesten!
    # ─────────────────────────────────────────
    "interleaving": {
        "order": 7,
        "name": "Interleaved Practice",
        "icon": "🔀",
        "effect_size": 0.56,
        "effect_note": "Interleaved Practice: d=0.56 (Hattie) – aber Rohrer-Studie: d=1.21!",
        "core_idea": "Mische verschiedene Aufgabentypen – nicht alles nacheinander!",
        "science_fact": "Es fühlt sich schwerer an, ist aber VIEL effektiver! Das Gehirn lernt, Unterschiede zu erkennen.",
        "anwendung_bei": {
            "ideal_fuer": ["Mathe-Übungen", "Verschiedene Aufgabentypen", "Prüfungsvorbereitung"],
            "beispiele": ["Mathe: Plus/Minus/Mal mischen", "Deutsch: verschiedene Grammatikübungen mischen", "Lernfächer abwechseln"],
            "hinweis": "Besonders stark bei Mathe! Mische verschiedene Aufgabentypen statt 10x das Gleiche.",
        },
        "kurzanleitung": "Verschiedene Aufgabentypen mischen → nicht 10x Plus, dann 10x Minus → sondern abwechselnd",
        
        "altersstufen": {
            "grundschule": {
                "intro": "Hier ist ein Geheimtrick! 🎯 Wenn du Mathe übst, mach nicht 10 Plus-Aufgaben, dann 10 Minus-Aufgaben. Mische sie! Plus, Minus, Plus, Minus... Es fühlt sich schwerer an, aber du lernst VIEL mehr!",
                "exercise": {
                    "title": "Mathe-Mixer",
                    "instruction": "Nimm 6 Plus-Aufgaben und 6 Minus-Aufgaben. Mische sie durcheinander und löse sie!",
                    "example": ["3+2=?", "7-4=?", "5+3=?", "9-6=?", "4+4=?", "8-2=?"],
                },
                "fun_fact": "Forscher haben das mit Viertklässlern getestet: Die Misch-Gruppe war DOPPELT so gut! 🏆",
            },
            "unterstufe": {
                "intro": "Interleaving ist kontraintuitiv: Statt Aufgabentyp A (10x), dann B (10x), mischst du: A-B-A-B... Es fühlt sich schwerer an – aber in Tests schneiden Interleaver 77% besser ab! (Rohrer-Studie)",
                "exercise": {
                    "title": "Vokabel-Shuffle",
                    "instruction": "Mische Vokabeln aus verschiedenen Lektionen. Lerne sie durcheinander statt getrennt!",
                    "example": None,
                },
                "fun_fact": "Warum wirkt es? Dein Gehirn muss bei jedem Wechsel neu entscheiden – das trainiert!",
            },
            "mittelstufe": {
                "intro": "Interleaved Practice (d=0.56, aber Rohrer: d=1.21!) widerspricht der Intuition: Blocktraining fühlt sich besser an, Interleaving bringt bessere Ergebnisse. Der Grund: Discriminative Contrast – du lernst, WANN du welche Strategie anwendest.",
                "exercise": {
                    "title": "Fächer-Mix",
                    "instruction": "Lerne heute 30 Min Mathe, 30 Min Englisch, 30 Min Geschichte – aber nicht nacheinander! Wechsle alle 10 Min.",
                    "example": None,
                },
                "fun_fact": "Sportler nutzen Interleaving: Verschiedene Übungen mischen statt eine endlos wiederholen.",
            },
            "oberstufe": {
                "intro": "Interleaved Practice erzeugt 'desirable difficulties' – erwünschte Schwierigkeiten, die das Lernen vertiefen. Der Discriminative-Contrast-Hypothese zufolge lernt das Gehirn, Strategien flexibel anzuwenden statt mechanisch auszuführen.",
                "exercise": {
                    "title": "Strategie-Bewusstsein",
                    "instruction": "Mische bei der Mathe-Vorbereitung verschiedene Aufgabentypen. Analysiere: Welche Strategie brauchst du wann?",
                    "example": None,
                },
                "fun_fact": "Bjork nennt dies 'desirable difficulties' – Schwierigkeiten, die das Lernen stärken.",
            },
            "paedagogen": {
                "intro": "Interleaved Practice (d=0.56-1.21) nutzt 'desirable difficulties' (Bjork). Die Rohrer-Studie (2015) zeigte bei Viertklässlern: 77% vs. 38% korrekte Antworten nach einem Monat. Schlüssel: Discriminative Contrast.",
                "implementation": "Mischen Sie Aufgabentypen in Übungsphasen und Tests. Warnen Sie Schüler vor: Es fühlt sich schwerer an – das ist gewollt!",
                "research_note": "Rohrer et al. (2015). Interleaved practice improves mathematics learning. Journal of Educational Psychology.",
            },
        },
    },
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_technique_by_order(order: int) -> Dict[str, Any]:
    """Gibt die Technik mit der angegebenen Reihenfolge-Nummer zurück."""
    for key, technique in POWERTECHNIKEN.items():
        if technique.get("order") == order:
            return {**technique, "key": key}
    return None

def get_technique_content(technique_key: str, age_group: str) -> Dict[str, Any]:
    """Gibt den Content einer Technik für eine bestimmte Altersstufe zurück."""
    technique = POWERTECHNIKEN.get(technique_key)
    if not technique:
        return None
    
    age_content = technique.get("altersstufen", {}).get(age_group)
    if not age_content:
        # Fallback auf Unterstufe
        age_content = technique.get("altersstufen", {}).get("unterstufe", {})
    
    return {
        "key": technique_key,
        "name": technique.get("name"),
        "icon": technique.get("icon"),
        "effect_size": technique.get("effect_size"),
        "effect_note": technique.get("effect_note"),
        "core_idea": technique.get("core_idea"),
        "science_fact": technique.get("science_fact"),
        **age_content
    }

def get_all_techniques_for_age(age_group: str) -> List[Dict[str, Any]]:
    """Gibt alle Techniken für eine Altersstufe zurück, sortiert nach order."""
    techniques = []
    for key, technique in POWERTECHNIKEN.items():
        content = get_technique_content(key, age_group)
        if content:
            content["order"] = technique.get("order", 99)
            techniques.append(content)
    
    return sorted(techniques, key=lambda x: x.get("order", 99))

def get_technique_names() -> Dict[str, str]:
    """Gibt ein Dictionary mit key -> name für alle Techniken zurück."""
    return {key: tech["name"] for key, tech in POWERTECHNIKEN.items()}

def get_technique_icons() -> Dict[str, str]:
    """Gibt ein Dictionary mit key -> icon für alle Techniken zurück."""
    return {key: tech["icon"] for key, tech in POWERTECHNIKEN.items()}

# ============================================
# BADGE DEFINITIONEN
# ============================================

LEARNSTRAT_BADGES = {
    "powertechniken_entdecker": {
        "name": "Powertechniken-Entdecker",
        "icon": "🔬",
        "description": "Erste Lerntechnik ausprobiert!",
        "xp_reward": 0,
    },
    "powertechniken_meister": {
        "name": "Powertechniken-Meister",
        "icon": "🧠",
        "description": "Alle 7 Lerntechniken gemeistert!",
        "xp_reward": 50,
    },
    "top3_gefunden": {
        "name": "Meine Top 3",
        "icon": "⭐",
        "description": "Persönliche Top 3 Lerntechniken identifiziert!",
        "xp_reward": 25,
    },
    "transfer_profi": {
        "name": "Transfer-Profi",
        "icon": "🚀",
        "description": "Transfer-Challenge abgeschlossen!",
        "xp_reward": 30,
    },
    "birkenbihl_fan": {
        "name": "Birkenbihl-Entdecker",
        "icon": "🧵",
        "description": "Birkenbihl-Methode ausprobiert!",
        "xp_reward": 20,
    },
    "lerntechniken_experte": {
        "name": "Lerntechniken-Experte",
        "icon": "🎓",
        "description": "Alle 3 Lernstrategie-Challenges abgeschlossen!",
        "xp_reward": 100,
    },
}

# ============================================
# ZERTIFIKAT TEXTE
# ============================================

CERTIFICATE_TEXTS = {
    "powertechniken": {
        "title": "Lerntechniken-Entdecker",
        "subtitle": "hat erfolgreich die 7 Powertechniken kennengelernt",
        "description": "und seine persönlichen Top 3 Lernstrategien identifiziert:",
    },
    "transfer": {
        "title": "Transfer-Meister",
        "subtitle": "hat das Geheimnis der Überflieger entdeckt",
        "description": "und gelernt, Wissen auf neue Situationen zu übertragen!",
    },
    "birkenbihl": {
        "title": "Birkenbihl-Entdecker",
        "subtitle": "hat die Birkenbihl-Methode kennengelernt",
        "description": "und alternative Lernwege erkundet!",
    },
    "master": {
        "title": "Lerntechniken-Experte",
        "subtitle": "hat alle drei Lernstrategie-Challenges gemeistert",
        "description": "und ist bereit, mit wissenschaftlich fundierten Methoden zu lernen!",
    },
}

# ============================================
# ANWENDUNGSSZENARIEN - Schüler-Eingaben
# ============================================

def get_application_prompt(technique_key: str, age_group: str = "grundschule") -> Dict[str, Any]:
    """
    Gibt die Prompt-Texte für die Anwendungsszenario-Eingabe zurück.
    Statt einer Bewertung schreiben Schüler, wo sie die Technik konkret anwenden.
    """
    technique = POWERTECHNIKEN.get(technique_key)
    if not technique:
        return None

    anwendung = technique.get("anwendung_bei", {})

    # Altersgerechte Prompts
    prompts = {
        "grundschule": {
            "frage": "Bei welcher Lernaufgabe willst du diese Technik diese Woche ausprobieren?",
            "hinweis": f"💡 Tipp: {anwendung.get('hinweis', 'Diese Technik ist vielseitig einsetzbar!')}",
            "beispiele_text": "Zum Beispiel: " + ", ".join(anwendung.get("beispiele", [])[:2]),
            "placeholder": "z.B. Englisch-Vokabeln für den Test am Freitag",
        },
        "unterstufe": {
            "frage": "Für welche konkrete Lernaufgabe wirst du diese Technik in den nächsten Tagen einsetzen?",
            "hinweis": f"💡 {anwendung.get('hinweis', 'Diese Technik ist vielseitig einsetzbar!')}",
            "beispiele_text": "Beispiele: " + ", ".join(anwendung.get("beispiele", [])),
            "placeholder": "z.B. Mathe-Formeln für die Klassenarbeit",
        },
        "mittelstufe": {
            "frage": "Bei welchem Lernvorhaben wirst du diese Technik anwenden?",
            "hinweis": f"💡 {anwendung.get('hinweis', '')}",
            "beispiele_text": "Ideal für: " + ", ".join(anwendung.get("ideal_fuer", [])),
            "placeholder": "z.B. Geschichtsdaten für die Prüfung",
        },
        "oberstufe": {
            "frage": "Für welches konkrete Lernziel wirst du diese Technik einsetzen?",
            "hinweis": anwendung.get('hinweis', ''),
            "beispiele_text": "Optimal für: " + ", ".join(anwendung.get("ideal_fuer", [])),
            "placeholder": "z.B. Abi-Vorbereitung Geschichte",
        },
    }

    return {
        "technique_key": technique_key,
        "technique_name": technique.get("name"),
        "technique_icon": technique.get("icon"),
        "kurzanleitung": technique.get("kurzanleitung", technique.get("core_idea")),
        "ideal_fuer": anwendung.get("ideal_fuer", []),
        "beispiele": anwendung.get("beispiele", []),
        **prompts.get(age_group, prompts["grundschule"])
    }


def generate_techniques_overview(user_applications: Dict[str, str], age_group: str = "grundschule") -> str:
    """
    Generiert das persönliche Übersichtsdokument mit allen 7 Techniken
    und den konkreten Anwendungsszenarien des Schülers.

    Args:
        user_applications: Dict mit technique_key -> Anwendungsszenario des Schülers
                          z.B. {"loci": "HSU Pflanzennamen", "pomodoro": "Mathe-Hausaufgaben"}
        age_group: Altersstufe für altersgerechte Formulierungen

    Returns:
        Formatierter Text für das Übersichtsdokument
    """
    # Header je nach Altersstufe
    headers = {
        "grundschule": "🎯 MEINE LERNTECHNIKEN-ÜBERSICHT 🎯",
        "unterstufe": "📋 MEINE LERNTECHNIKEN-ÜBERSICHT",
        "mittelstufe": "📋 Persönliche Lerntechniken-Übersicht",
        "oberstufe": "📋 Individuelle Lernstrategie-Übersicht",
    }

    overview = f"\n{'='*50}\n"
    overview += f"{headers.get(age_group, headers['grundschule'])}\n"
    overview += f"{'='*50}\n\n"

    # Alle Techniken durchgehen (sortiert nach order)
    for technique_key in ["pomodoro", "active_recall", "feynman", "spaced_repetition", "teaching", "loci", "interleaving"]:
        technique = POWERTECHNIKEN.get(technique_key)
        if not technique:
            continue

        icon = technique.get("icon", "📚")
        name = technique.get("name", technique_key)
        kurzanleitung = technique.get("kurzanleitung", technique.get("core_idea", ""))
        user_anwendung = user_applications.get(technique_key, "")

        overview += f"{icon} {name}\n"
        overview += f"   Anleitung: {kurzanleitung}\n"

        if user_anwendung:
            overview += f"   ✅ Anwenden bei: {user_anwendung}\n"
        else:
            overview += f"   ⬚ Anwenden bei: (noch nicht festgelegt)\n"

        overview += "\n"

    overview += f"{'='*50}\n"

    # Motivierender Abschluss je nach Altersstufe
    closings = {
        "grundschule": "🌟 Super! Du hast jetzt deinen persönlichen Lernplan! 🌟",
        "unterstufe": "💪 Jetzt hast du deinen persönlichen Werkzeugkasten!",
        "mittelstufe": "Du bist bereit, mit wissenschaftlich fundierten Methoden zu lernen!",
        "oberstufe": "Nutze diese evidenzbasierten Strategien für effektives Lernen.",
    }

    overview += f"\n{closings.get(age_group, closings['grundschule'])}\n"

    return overview


def generate_techniques_overview_html(user_applications: Dict[str, str], username: str = "", age_group: str = "grundschule") -> str:
    """
    Generiert das Übersichtsdokument als HTML (für PDF-Export oder Anzeige).

    Args:
        user_applications: Dict mit technique_key -> Anwendungsszenario des Schülers
        username: Name des Schülers für die Personalisierung
        age_group: Altersstufe

    Returns:
        HTML-formatierter String
    """
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #2c3e50;">🎯 Meine Lerntechniken-Übersicht</h1>
        {"<p style='text-align: center; font-size: 1.2em;'>für " + username + "</p>" if username else ""}
        <hr style="border: 2px solid #3498db;">
    """

    for technique_key in ["pomodoro", "active_recall", "feynman", "spaced_repetition", "teaching", "loci", "interleaving"]:
        technique = POWERTECHNIKEN.get(technique_key)
        if not technique:
            continue

        icon = technique.get("icon", "📚")
        name = technique.get("name", technique_key)
        kurzanleitung = technique.get("kurzanleitung", technique.get("core_idea", ""))
        user_anwendung = user_applications.get(technique_key, "")

        bg_color = "#e8f5e9" if user_anwendung else "#fff3e0"

        html += f"""
        <div style="background: {bg_color}; border-radius: 10px; padding: 15px; margin: 10px 0;">
            <h3 style="margin: 0 0 10px 0;">{icon} {name}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Anleitung:</strong> {kurzanleitung}</p>
            <p style="margin: 5px 0; color: #2c3e50;">
                <strong>{"✅" if user_anwendung else "⬚"} Anwenden bei:</strong>
                {user_anwendung if user_anwendung else "<em>(noch nicht festgelegt)</em>"}
            </p>
        </div>
        """

    html += """
        <hr style="border: 2px solid #3498db;">
        <p style="text-align: center; font-size: 1.1em; color: #27ae60;">
            🌟 Jetzt hast du deinen persönlichen Lernplan! 🌟
        </p>
    </div>
    """

    return html


def get_technique_application_data(technique_key: str) -> Dict[str, Any]:
    """
    Gibt alle relevanten Daten für die Anwendungsszenario-Eingabe zurück.
    Wird im UI verwendet, um die Eingabefelder zu rendern.
    """
    technique = POWERTECHNIKEN.get(technique_key)
    if not technique:
        return None

    anwendung = technique.get("anwendung_bei", {})

    return {
        "key": technique_key,
        "name": technique.get("name"),
        "icon": technique.get("icon"),
        "order": technique.get("order"),
        "kurzanleitung": technique.get("kurzanleitung"),
        "core_idea": technique.get("core_idea"),
        "ideal_fuer": anwendung.get("ideal_fuer", []),
        "beispiele": anwendung.get("beispiele", []),
        "hinweis": anwendung.get("hinweis", ""),
    }
