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
        
        "altersstufen": {
            "grundschule": {
                "intro": "Stell dir vor, du hast eine magische Tomate! 🍅 Diese Tomate hilft dir, dich beim Lernen zu konzentrieren. So funktioniert's: Du stellst einen Timer auf 15 Minuten und lernst, bis er klingelt. Dann darfst du 5 Minuten spielen!",
                "duration": 15,
                "break_duration": 5,
                "exercise": {
                    "title": "Deine erste Tomate!",
                    "instruction": "Male ein Bild von deinem Lieblingstier. Starte den Timer und male, bis er klingelt!",
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
        "core_idea": "Erkläre es so einfach, dass ein Kind es versteht!",
        "science_fact": "Wenn du etwas erklären kannst, hast du es wirklich verstanden. Lücken werden sofort sichtbar!",
        
        "altersstufen": {
            "grundschule": {
                "intro": "Stell dir vor, du bist Lehrer! 👨‍🏫 Erkläre deinem Kuscheltier, was du gelernt hast. Wenn du nicht weiterkommst, musst du nochmal nachschauen. So merkst du, was du wirklich verstanden hast!",
                "exercise": {
                    "title": "Teddy-Lehrer",
                    "instruction": "Erkläre deinem Kuscheltier (oder einem Familienmitglied), warum der Himmel blau ist – so einfach wie möglich!",
                    "topic_suggestion": "Warum ist der Himmel blau?",
                },
                "fun_fact": "Richard Feynman war ein berühmter Wissenschaftler, der sogar den Nobelpreis gewonnen hat! 🏆",
            },
            "unterstufe": {
                "intro": "Die Feynman-Methode ist ein Trick vom Nobelpreisträger Richard Feynman: Erkläre ein Thema so, als wärst du ein Lehrer für Grundschüler. Keine Fachbegriffe! Wenn du hängst, hast du's nicht verstanden.",
                "exercise": {
                    "title": "Erklärbär-Challenge",
                    "instruction": "Erkläre 'Photosynthese' (oder dein aktuelles Thema) in 3 einfachen Sätzen. Keine Fachbegriffe!",
                    "topic_suggestion": "Photosynthese",
                },
                "fun_fact": "Feynman sagte: 'Ich kann nichts erschaffen, was ich nicht verstehen kann.'",
            },
            "mittelstufe": {
                "intro": "Die Feynman-Technik in 4 Schritten: 1) Thema wählen, 2) Einem Kind erklären, 3) Lücken identifizieren, 4) Vereinfachen & mit Analogien arbeiten. Effektstärke (Elaboration): d=0.56.",
                "exercise": {
                    "title": "Analogie-Finder",
                    "instruction": "Wähle ein schwieriges Konzept. Finde 3 Analogien aus dem Alltag, die es erklären.",
                    "topic_suggestion": "Wie funktioniert das Internet?",
                },
                "fun_fact": "Einstein: 'Wenn du es einem Sechsjährigen nicht erklären kannst, verstehst du es selbst nicht.'",
            },
            "oberstufe": {
                "intro": "Die Feynman-Technik ist eine elaborative Lernstrategie. Durch das Externalisieren von Wissen werden Verständnislücken sichtbar. Die Verwendung von Analogien aktiviert vorhandenes Wissen und fördert Transfer.",
                "exercise": {
                    "title": "Peer Teaching",
                    "instruction": "Erkläre einem Mitschüler ein Thema, das du gerade lernst. Lass dir Fragen stellen!",
                    "topic_suggestion": None,
                },
                "fun_fact": "Feynman-Vorlesungen sind frei auf YouTube – inspirierend und verständlich!",
            },
            "paedagogen": {
                "intro": "Die Feynman-Methode kombiniert Elaboration (d=0.56) mit Self-Explanation. Sie macht implizites Wissen explizit und identifiziert Verständnislücken durch den Zwang zur Vereinfachung.",
                "implementation": "Lassen Sie Schüler sich gegenseitig unterrichten (Peer Teaching). Bewerten Sie die Qualität der Erklärung, nicht nur das Fachwissen.",
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
        
        "altersstufen": {
            "grundschule": {
                "intro": "Stell dir vor, du pflanzt ein Sämling 🌱. Du gießt ihn nicht alles auf einmal, sondern jeden Tag ein bisschen. Beim Lernen ist es genauso! Lerne etwas heute, morgen wieder, dann in 3 Tagen. So wächst das Wissen!",
                "exercise": {
                    "title": "Wissens-Kalender",
                    "instruction": "Lerne heute 5 neue Wörter. Schreib in deinen Kalender: Morgen wiederholen, in 3 Tagen nochmal, in 1 Woche nochmal!",
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
        "effect_note": "Self-Explanation: d=0.54 (Hattie)",
        "core_idea": "Erkläre anderen, was du gelernt hast – du lernst dabei am meisten!",
        "science_fact": "Wer lehrt, muss verstehen. Das Erklären zwingt dich, Lücken zu füllen!",
        
        "altersstufen": {
            "grundschule": {
                "intro": "Wusstest du, dass du am meisten lernst, wenn du anderen etwas erklärst? 🤔 Wenn du deiner Mama, deinem Papa oder deinen Freunden zeigst, was du gelernt hast, merkt dein Gehirn es sich viel besser!",
                "exercise": {
                    "title": "Mini-Lehrer sein",
                    "instruction": "Erkläre einem Familienmitglied, was du heute in der Schule gelernt hast. Benutze Bilder oder spiel es vor!",
                    "partner_needed": True,
                },
                "fun_fact": "Lehrer lernen oft mehr als ihre Schüler – weil sie alles erklären müssen!",
            },
            "unterstufe": {
                "intro": "Der Protégé-Effekt: Wenn du jemandem etwas beibringst, lernst DU am meisten! Dein Gehirn arbeitet härter, weil du Fragen beantworten musst und alles klar erklären willst.",
                "exercise": {
                    "title": "Lern-Tandem",
                    "instruction": "Finde einen Lernpartner. Ihr erklärt euch gegenseitig ein Thema – ohne Notizen!",
                    "partner_needed": True,
                },
                "fun_fact": "Studien zeigen: Schüler, die anderen etwas beibringen, behalten 90% – beim Lesen nur 10%!",
            },
            "mittelstufe": {
                "intro": "Der 'Protégé Effect' zeigt: Wer lehrt, lernt doppelt. Das Vorbereiten einer Erklärung aktiviert tiefe Verarbeitung. Fragen der 'Schüler' decken eigene Lücken auf. Effektstärke (Self-Explanation): d=0.54.",
                "exercise": {
                    "title": "YouTube-Teacher",
                    "instruction": "Nimm ein 2-Minuten-Erklärvideo auf (nur für dich). Schau es an – wo stockst du?",
                    "partner_needed": False,
                },
                "fun_fact": "Viele YouTuber sagen: 'Ich hab beim Video-Machen mehr gelernt als in der Schule!'",
            },
            "oberstufe": {
                "intro": "Lernen durch Lehren (LdL) kombiniert mehrere wirksame Strategien: Elaboration, Self-Explanation und Social Learning. Die Notwendigkeit, Stoff didaktisch aufzubereiten, erzwingt tiefere kognitive Verarbeitung.",
                "exercise": {
                    "title": "Peer-Tutoring",
                    "instruction": "Organisiere eine Lerngruppe. Jeder bereitet ein Thema vor und 'unterrichtet' es – mit Fragen!",
                    "partner_needed": True,
                },
                "fun_fact": "Jean-Pol Martin entwickelte LdL in den 80ern für den Französischunterricht – heute weltweit genutzt!",
            },
            "paedagogen": {
                "intro": "Lernen durch Lehren (LdL) nach Jean-Pol Martin nutzt den Protégé-Effekt: Lehrende strukturieren Wissen tiefer und füllen Lücken proaktiv. Kombiniert mit Peer-Learning entstehen zusätzliche soziale Lerneffekte.",
                "implementation": "Lassen Sie Schüler Mini-Lektionen vorbereiten und halten. Varianten: Expertengruppen, Lerntandems, gegenseitige Quiz-Erstellung.",
                "research_note": "Martin, J.-P. (2004). Lernen durch Lehren. Die Schulleitung.",
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
