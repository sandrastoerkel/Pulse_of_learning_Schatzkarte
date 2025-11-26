"""
Evidence Integration: Hattie + PISA Wissenschaftliche Einordnung

Dieses Modul verbindet:
- PISA 2022 Skalen mit Hattie-Effektstärken
- Schülerfreundliche Erklärungen
- Wissenschaftliche Begründungen
- Konkrete Handlungsempfehlungen

Basierend auf:
- Hattie, J. (2023). Visible Learning: The Sequel (252 Faktoren)
- PISA 2022 Deutschland (6.116 Schüler, XGBoost-Analyse)
- Sandra's Feature Importance Analyse (R² = 0.77)
"""

# ============================================
# HATTIE-PISA MAPPING
# ============================================

EVIDENCE_DATABASE = {
    # ============================================
    # KERN-FAKTOREN (Top 3 aus XGBoost)
    # ============================================
    
    "MATHEFF": {
        "name_de": "Mathematische Selbstwirksamkeit",
        "name_schueler": "Wie sehr du dir Mathe zutraust",
        
        # Wissenschaftliche Daten
        "hattie": {
            "factor": "Self-Efficacy",
            "d": 0.92,
            "rank": 3,
            "category": "Student",
            "source": "Hattie 2023, Visible Learning: The Sequel"
        },
        "pisa": {
            "correlation": 0.567,
            "variance_explained": "40-54%",
            "points_impact": "+42 Punkte",
            "source": "PISA 2022 Deutschland, XGBoost-Analyse"
        },
        "xgboost_rank": 1,
        "intervention_priority": "HÖCHSTE",
        
        # Schülerfreundliche Erklärung
        "erklaerung_schueler": """
Selbstwirksamkeit bedeutet: Wie sehr glaubst du, dass du eine Aufgabe schaffen kannst?

Das ist NICHT dasselbe wie Intelligenz! Es geht darum, ob du dir zutraust, 
auch schwierige Aufgaben zu lösen - und ob du dranbleibst, wenn es schwer wird.

Warum ist das so wichtig? Weil Schüler, die sich mehr zutrauen:
• Länger an schwierigen Aufgaben dranbleiben
• Weniger Angst vor Fehlern haben
• Bessere Lernstrategien entwickeln
• Am Ende bessere Noten bekommen
        """,
        
        "warum_wichtig": """
Die PISA-Studie zeigt: Selbstwirksamkeit erklärt 40-54% der Unterschiede 
in Mathe-Leistungen. Das ist der STÄRKSTE Faktor, den du selbst verändern kannst!

Hattie's Forschung (über 300 Millionen Schüler weltweit) bestätigt: 
Effektstärke d = 0.92 - das ist einer der höchsten Werte überhaupt.
        """,
        
        "was_tun": {
            "sofort": [
                "Starte mit Aufgaben, die du SICHER schaffst - sammle Erfolge",
                "Sage 'Ich kann das NOCH nicht' statt 'Ich kann das nicht'",
                "Führe ein Erfolgs-Tagebuch: Was habe ich heute geschafft?"
            ],
            "diese_woche": [
                "Finde heraus, welche Mathe-Themen du eigentlich KANNST",
                "Erkläre einem Freund etwas, das du verstanden hast",
                "Setze dir ein kleines, erreichbares Ziel für diese Woche"
            ],
            "langfristig": [
                "Baue schrittweise Schwierigkeit auf (nicht zu schnell!)",
                "Lerne aus Fehlern: Was kann ich nächstes Mal besser machen?",
                "Suche dir einen Lernpartner oder Mentor"
            ]
        },
        
        "scale_type": "positive",  # Höher = besser
        "thresholds": {
            "kritisch": 2.0,
            "beobachten": 2.5,
            "gut": 3.0
        }
    },
    
    "ANXMAT": {
        "name_de": "Mathematikangst",
        "name_schueler": "Wie nervös dich Mathe macht",
        
        "hattie": {
            "factor": "Reducing Anxiety",
            "d": 0.42,
            "rank": 56,
            "category": "Student",
            "source": "Hattie 2023"
        },
        "pisa": {
            "correlation": -0.38,
            "variance_explained": "ca. 15%",
            "points_impact": "-35 Punkte bei hoher Angst",
            "source": "PISA 2022 Deutschland"
        },
        "xgboost_rank": 2,
        "intervention_priority": "SEHR HOCH",
        
        "erklaerung_schueler": """
Mathe-Angst ist das Gefühl von Nervosität, Sorge oder sogar Panik, 
wenn du an Mathe denkst oder Mathe-Aufgaben machen musst.

Wichtig zu wissen: Das hat NICHTS mit deiner Intelligenz zu tun!
Viele sehr schlaue Menschen haben Mathe-Angst - und sie lässt sich reduzieren.

Das Problem ist: Angst blockiert dein Gehirn. Wenn du gestresst bist,
kann dein Arbeitsgedächtnis nicht richtig funktionieren - du vergisst
Dinge, die du eigentlich weißt.
        """,
        
        "warum_wichtig": """
PISA zeigt: Schüler mit hoher Mathe-Angst schneiden im Durchschnitt 
35 Punkte schlechter ab - das entspricht fast einem ganzen Schuljahr!

Die gute Nachricht: Angst ist NICHT angeboren. Sie entsteht durch 
negative Erfahrungen - und kann durch positive Erfahrungen wieder abgebaut werden.
        """,
        
        "was_tun": {
            "sofort": [
                "Atme 3x tief durch, bevor du eine Mathe-Aufgabe anfängst",
                "Sage dir: 'Ich bin gerade nervös, und das ist okay'",
                "Fange mit der leichtesten Aufgabe an - nicht mit der schwersten"
            ],
            "diese_woche": [
                "Übe Mathe in entspannter Atmosphäre (Musik, bequemer Platz)",
                "Teile große Aufgaben in kleine Schritte auf",
                "Belohne dich selbst nach dem Üben (nicht nur nach guten Noten!)"
            ],
            "langfristig": [
                "Sprich mit jemandem über deine Angst (Lehrer, Eltern, Freunde)",
                "Sammle positive Mathe-Erfahrungen - egal wie klein",
                "Lerne Entspannungstechniken (z.B. vor Klassenarbeiten)"
            ]
        },
        
        "scale_type": "negative",  # Niedriger = besser
        "thresholds": {
            "kritisch": 3.5,
            "beobachten": 3.0,
            "gut": 2.5
        }
    },
    
    "PERSEVAGR": {
        "name_de": "Ausdauer & Durchhaltevermögen",
        "name_schueler": "Wie lange du dranbleibst, wenn es schwer wird",
        
        "hattie": {
            "factor": "Persistence/Effort",
            "d": 0.77,
            "rank": 15,
            "category": "Student",
            "source": "Hattie 2023"
        },
        "pisa": {
            "correlation": 0.35,
            "variance_explained": "ca. 12%",
            "points_impact": "+28 Punkte",
            "source": "PISA 2022 Deutschland"
        },
        "xgboost_rank": 3,
        "intervention_priority": "HOCH",
        
        "erklaerung_schueler": """
Ausdauer bedeutet: Bleibst du dran, auch wenn eine Aufgabe schwer ist?
Oder gibst du schnell auf?

Das ist wie ein Muskel - je mehr du ihn trainierst, desto stärker wird er.
Und hier ist das Geheimnis: Die erfolgreichsten Menschen sind nicht die 
Schlauesten, sondern die, die am längsten dranbleiben!
        """,
        
        "warum_wichtig": """
Die PISA-Forschung zeigt: Schüler mit hoher Ausdauer erreichen im Durchschnitt 
28 Punkte mehr - selbst wenn sie nicht die "Schlauesten" sind.

Hattie's Effektstärke d = 0.77 zeigt: Durchhalten ist einer der wichtigsten 
Faktoren für Schulerfolg überhaupt.
        """,
        
        "was_tun": {
            "sofort": [
                "Wenn du aufgeben willst: Versuche es noch 5 Minuten",
                "Sage dir: 'Das ist schwer, aber ich kann es lernen'",
                "Mache kurze Pausen, aber gib nicht auf"
            ],
            "diese_woche": [
                "Setze dir ein Ziel und halte es durch - egal wie klein",
                "Feiere jeden Tag, an dem du drangeblieben bist",
                "Finde heraus, was dich ablenkt - und reduziere es"
            ],
            "langfristig": [
                "Entwickle Routinen (gleiche Zeit, gleicher Ort zum Lernen)",
                "Finde einen Lernpartner, der dich motiviert",
                "Denke langfristig: Wo willst du in einem Jahr sein?"
            ]
        },
        
        "scale_type": "positive",
        "thresholds": {
            "kritisch": 2.0,
            "beobachten": 2.5,
            "gut": 3.0
        }
    },
    
    # ============================================
    # STUFE 2: VERTIEFUNGS-FAKTOREN
    # ============================================
    
    "GROSAGR": {
        "name_de": "Growth Mindset",
        "name_schueler": "Glaubst du, dass du dich verbessern kannst?",
        
        "hattie": {
            "factor": "Growth Mindset",
            "d": 0.64,
            "rank": 28,
            "category": "Student",
            "source": "Hattie 2023, Dweck 2006"
        },
        "pisa": {
            "correlation": 0.28,
            "variance_explained": "ca. 8%",
            "points_impact": "+31 Punkte Lesen, +23 Punkte Mathe",
            "source": "PISA 2022 Deutschland"
        },
        "xgboost_rank": 4,
        "intervention_priority": "HOCH",
        
        "erklaerung_schueler": """
Growth Mindset bedeutet: Du glaubst, dass deine Fähigkeiten wachsen können.
Das Gegenteil ist "Fixed Mindset": Die Überzeugung, dass Talent angeboren ist.

Die Wahrheit ist: Dein Gehirn verändert sich ständig! Jedes Mal, wenn du 
etwas Neues lernst, bilden sich neue Verbindungen zwischen deinen Gehirnzellen.

Du bist NICHT "gut in Mathe" oder "schlecht in Mathe" - du bist jemand, 
der Mathe lernen kann (oder noch nicht gelernt hat).
        """,
        
        "warum_wichtig": """
Carol Dweck's Forschung (Stanford University) zeigt: Schüler mit Growth Mindset
verbessern sich schneller - weil sie Fehler als Lernchancen sehen, nicht als Beweis
für mangelndes Talent.

PISA 2022: Schüler mit Growth Mindset erreichen +31 Punkte beim Lesen!
        """,
        
        "was_tun": {
            "sofort": [
                "Ersetze 'Ich kann das nicht' durch 'Ich kann das NOCH nicht'",
                "Sieh Fehler als Hinweis, was du noch lernen kannst",
                "Frage dich: 'Was kann ich aus dieser Situation lernen?'"
            ],
            "diese_woche": [
                "Schreibe auf: 3 Dinge, die du dieses Jahr NEU gelernt hast",
                "Erinnere dich: Du konntest nicht immer lesen/schreiben - du hast es GELERNT",
                "Suche nach Beispielen von Menschen, die sich verbessert haben"
            ],
            "langfristig": [
                "Feiere Anstrengung, nicht nur Ergebnisse",
                "Suche aktiv nach Herausforderungen (nicht nur einfache Aufgaben)",
                "Lerne von Kritik - sie hilft dir, besser zu werden"
            ]
        },
        
        "scale_type": "positive",
        "thresholds": {
            "kritisch": 2.0,
            "beobachten": 2.5,
            "gut": 3.0
        }
    },
    
    "TEACHSUP": {
        "name_de": "Wahrgenommene Lehrerunterstützung",
        "name_schueler": "Wie sehr dein Lehrer dir hilft",
        
        "hattie": {
            "factor": "Teacher-Student Relationships",
            "d": 0.72,
            "rank": 18,
            "category": "Teacher",
            "source": "Hattie 2023, Cornelius-White 2007"
        },
        "pisa": {
            "correlation": 0.25,
            "variance_explained": "ca. 6%",
            "points_impact": "+25 Punkte",
            "source": "PISA 2022 Deutschland"
        },
        "xgboost_rank": 6,
        "intervention_priority": "MITTEL",
        
        "erklaerung_schueler": """
Dieser Wert zeigt, wie sehr du das Gefühl hast, dass deine Lehrer 
dir helfen und dich unterstützen.

Wichtig: Das ist DEINE Wahrnehmung. Manchmal helfen Lehrer mehr, 
als wir es bemerken - oder wir trauen uns nicht, nach Hilfe zu fragen.

Eine gute Beziehung zu Lehrern macht Lernen einfacher, weil du dich 
traust, Fragen zu stellen und Fehler zu machen.
        """,
        
        "warum_wichtig": """
Hattie's Forschung zeigt: Die Lehrer-Schüler-Beziehung hat eine Effektstärke 
von d = 0.72 - das ist sehr hoch!

Es geht nicht darum, dass dein Lehrer dein "Freund" ist, sondern darum, 
dass du dich unterstützt fühlst und weißt, dass du Fragen stellen kannst.
        """,
        
        "was_tun": {
            "sofort": [
                "Stelle eine Frage im Unterricht (auch wenn es dir schwer fällt)",
                "Gehe in die Sprechstunde oder frage nach der Stunde",
                "Sage 'Ich verstehe das nicht' - das ist keine Schwäche!"
            ],
            "diese_woche": [
                "Bedanke dich bei einem Lehrer, der dir geholfen hat",
                "Frage konkret: 'Können Sie mir erklären, wie...?'",
                "Zeige, dass du dich bemühst - Lehrer helfen gerne engagierten Schülern"
            ],
            "langfristig": [
                "Baue eine positive Beziehung auf - sei respektvoll und interessiert",
                "Nutze alle Hilfsangebote (Nachhilfe, Förderunterricht)",
                "Sprich offen über Probleme - je früher, desto besser"
            ]
        },
        
        "scale_type": "positive",
        "thresholds": {
            "kritisch": 2.0,
            "beobachten": 2.5,
            "gut": 3.0
        }
    },
    
    "BELONG": {
        "name_de": "Zugehörigkeitsgefühl zur Schule",
        "name_schueler": "Wie wohl du dich in der Schule fühlst",
        
        "hattie": {
            "factor": "Sense of Belonging",
            "d": 0.52,
            "rank": 42,
            "category": "School",
            "source": "Hattie 2023"
        },
        "pisa": {
            "correlation": 0.18,
            "variance_explained": "ca. 3%",
            "points_impact": "+18 Punkte",
            "source": "PISA 2022 Deutschland"
        },
        "xgboost_rank": 8,
        "intervention_priority": "MITTEL",
        
        "erklaerung_schueler": """
Zugehörigkeit bedeutet: Fühlst du dich als Teil der Schulgemeinschaft?
Hast du Freunde? Fühlst du dich akzeptiert?

Das beeinflusst dein Lernen mehr, als du vielleicht denkst! Wenn du dich 
wohlfühlst, bist du entspannter, konzentrierter und motivierter.

Wenn du dich nicht zugehörig fühlst, ist es schwerer, dich auf den 
Unterricht zu konzentrieren.
        """,
        
        "warum_wichtig": """
PISA zeigt: Schüler, die sich zugehörig fühlen, erreichen im Schnitt 
18 Punkte mehr. 

Außerdem: Wer sich wohlfühlt, geht lieber zur Schule - und lernt dadurch 
automatisch mehr.
        """,
        
        "was_tun": {
            "sofort": [
                "Sprich mit jemandem in deiner Klasse, mit dem du noch nicht viel geredet hast",
                "Hilf einem Mitschüler bei etwas",
                "Nimm an einer Schulaktivität teil (AG, Sport, Musik)"
            ],
            "diese_woche": [
                "Finde eine Gruppe oder AG, die dich interessiert",
                "Lade jemanden ein, gemeinsam zu lernen",
                "Engagiere dich für etwas in der Schule"
            ],
            "langfristig": [
                "Baue echte Freundschaften auf - Qualität vor Quantität",
                "Wenn du Probleme hast: Sprich mit Vertrauenslehrer oder Schulpsychologe",
                "Denk dran: Jeder fühlt sich manchmal außen vor - du bist nicht allein"
            ]
        },
        
        "scale_type": "positive",
        "thresholds": {
            "kritisch": 2.0,
            "beobachten": 2.5,
            "gut": 3.0
        }
    },
    
    "MATHPERS": {
        "name_de": "Mathematische Ausdauer",
        "name_schueler": "Wie lange du bei Mathe-Problemen dranbleibst",

        "hattie": {
            "factor": "Deliberate Practice",
            "d": 0.79,
            "rank": 12,
            "category": "Student",
            "source": "Hattie 2023, Ericsson 2006"
        },
        "pisa": {
            "correlation": 0.32,
            "variance_explained": "ca. 10%",
            "points_impact": "+28 Punkte",
            "source": "PISA 2022 Deutschland"
        },
        "xgboost_rank": 7,
        "intervention_priority": "HOCH",

        "erklaerung_schueler": """
Mathematische Ausdauer ist spezifisch für Mathe: Wie lange arbeitest du
an einem Mathe-Problem, bevor du aufgibst?

Die besten Mathematiker sind nicht die, die sofort die Lösung sehen -
sondern die, die am längsten nachdenken und verschiedene Wege probieren.

Jedes Mal, wenn du an einem Problem dranbleibst, trainierst du dein
mathematisches Denken!
        """,

        "warum_wichtig": """
Hattie's Forschung zu "Deliberate Practice" (gezieltes Üben) zeigt
eine Effektstärke von d = 0.79 - einer der höchsten Werte!

Es geht nicht darum, MEHR zu üben, sondern AUSDAUERNDER und GEZIELTER.
        """,

        "was_tun": {
            "sofort": [
                "Wenn du nicht weiterkommst: Warte 2 Minuten, bevor du aufgibst",
                "Probiere einen anderen Lösungsweg",
                "Zeichne das Problem oder schreibe es in eigenen Worten auf"
            ],
            "diese_woche": [
                "Wähle EIN schwieriges Problem pro Tag und arbeite 10 Min daran",
                "Schreibe auf, wo du nicht weiterkommst - und frage dann gezielt",
                "Feiere, wenn du ein schwieriges Problem gelöst hast"
            ],
            "langfristig": [
                "Trainiere systematisch: Fang leicht an, steigere langsam",
                "Lerne verschiedene Problemlöse-Strategien",
                "Verstehe: Fehler sind der Beweis, dass du es versuchst!"
            ]
        },

        "scale_type": "positive",
        "thresholds": {
            "kritisch": 2.0,
            "beobachten": 2.5,
            "gut": 3.0
        }
    },

    # ============================================
    # EXTERNE FAKTOREN (nicht aus PISA, aber evidenzbasiert)
    # ============================================

    "EXT_LEARNSTRAT": {
        "name_de": "Lernstrategien",
        "name_schueler": "Cleverer lernen - 7 Techniken die funktionieren",

        "hattie": {
            "factor": "Transfer Strategies / Study Skills",
            "d": 0.86,
            "rank": 5,
            "category": "Student",
            "source": "Hattie 2023, Dunlosky et al. 2013"
        },
        "pisa": {
            "correlation": None,
            "variance_explained": "Nicht direkt gemessen",
            "points_impact": "Indirekt über andere Faktoren",
            "source": "Kombinierte Evidenz"
        },
        "xgboost_rank": None,
        "intervention_priority": "SEHR HOCH",

        "erklaerung_schueler": """
Es gibt Lerntechniken, die wissenschaftlich bewiesen besser funktionieren!

Die 7 wichtigsten:
1. Active Recall - Sich selbst abfragen (d=0.58)
2. Spaced Repetition - Zeitversetzt wiederholen (d=0.60)
3. Feynman-Methode - Einfach erklären (d=0.75)
4. Loci-Methode - Mit Orten verbinden (d=0.65)
5. Mind Mapping - Visuell darstellen (d=0.54)
6. Pomodoro - 25 Min fokussiert, 5 Min Pause (d=0.53)
7. Lernen durch Lehren - Anderen erklären (d=0.53)
        """,

        "warum_wichtig": """
Nicht MEHR lernen, sondern CLEVERER lernen!

Diese Techniken nutzen, wie dein Gehirn wirklich funktioniert.
Sie sind seit Jahrzehnten erforscht und bestätigt.
        """,

        "was_tun": {
            "sofort": [
                "Statt nur lesen: Buch zuklappen und aufschreiben, was du weißt",
                "Pomodoro-Timer stellen: 25 Min fokussiert lernen",
                "Erkläre jemandem (oder dir selbst), was du gelernt hast"
            ],
            "diese_woche": [
                "Probiere Active Recall mit Karteikarten",
                "Erstelle eine Mind Map zu einem Thema",
                "Installiere Anki oder Quizlet für Spaced Repetition"
            ],
            "langfristig": [
                "Finde heraus, welche Techniken für dich am besten funktionieren",
                "Kombiniere mehrere Techniken",
                "Mache gute Lerngewohnheiten zur Routine"
            ]
        },

        "scale_type": "external",
        "thresholds": None
    },

    "EXT_METACOG": {
        "name_de": "Metakognition",
        "name_schueler": "Über dein Lernen nachdenken",

        "hattie": {
            "factor": "Metacognitive Strategies",
            "d": 0.69,
            "rank": 17,
            "category": "Student",
            "source": "Hattie 2023"
        },
        "pisa": {
            "correlation": None,
            "variance_explained": "Indirekt gemessen",
            "points_impact": "Hoher indirekter Einfluss",
            "source": "Kombinierte Evidenz"
        },
        "xgboost_rank": None,
        "intervention_priority": "HOCH",

        "erklaerung_schueler": """
Metakognition = Über das eigene Lernen nachdenken.

Die 3 Phasen:
- VOR dem Lernen: Was weiß ich? Was will ich lernen? Welche Strategie?
- WÄHREND dem Lernen: Verstehe ich? Funktioniert meine Methode?
- NACH dem Lernen: Was hat funktioniert? Was mache ich anders?

Wer sein Lernen reflektiert, lernt besser!
        """,

        "warum_wichtig": """
Hattie d = 0.69 - einer der wichtigsten Schüler-Faktoren!

Metakognition ist wie ein "innerer Coach", der dein Lernen verbessert.
        """,

        "was_tun": {
            "sofort": [
                "Vor dem Lernen: 'Was will ich heute lernen?'",
                "Zwischendurch: 'Verstehe ich das wirklich?'",
                "Danach: 'Was war mein größter Lernfortschritt?'"
            ],
            "diese_woche": [
                "Schätze, wie lange eine Aufgabe dauert - dann miss nach",
                "Schreibe auf, welche Lernmethoden gut funktioniert haben",
                "Frage dich bei Fehlern: 'Was kann ich daraus lernen?'"
            ],
            "langfristig": [
                "Führe ein kurzes Lerntagebuch",
                "Entwickle Routinen für Planung und Reflexion",
                "Werde zum Experten für DEIN Lernen"
            ]
        },

        "scale_type": "external",
        "thresholds": None
    },

    "EXT_MOTIV": {
        "name_de": "Lernmotivation",
        "name_schueler": "Wieder Bock aufs Lernen",

        "hattie": {
            "factor": "Motivation",
            "d": 0.48,
            "rank": 51,
            "category": "Student",
            "source": "Hattie 2023"
        },
        "pisa": {
            "correlation": None,
            "variance_explained": "Ca. 50% berichten Motivationsprobleme",
            "points_impact": "Hoher Einfluss auf Engagement",
            "source": "PISA 2022"
        },
        "xgboost_rank": None,
        "intervention_priority": "HOCH",

        "erklaerung_schueler": """
Ca. 50% der Schüler berichten von fehlender Lernmotivation (PISA 2022).

Du bist also nicht allein! Und Motivation lässt sich aufbauen.

Wichtig: Finde DEINE Gründe zum Lernen - nicht die deiner Eltern oder Lehrer.
        """,

        "warum_wichtig": """
Hattie d = 0.48 (Motivation) und d = 0.57 (Mastery Goals)

Motivations-Killer vermeiden:
- Zu große Ziele
- Nur auf Noten fokussieren
- Sich mit anderen vergleichen
        """,

        "was_tun": {
            "sofort": [
                "Frage dich: 'Was interessiert MICH an diesem Thema?'",
                "Setze dir ein kleines, erreichbares Ziel für heute",
                "Belohne dich nach getaner Arbeit"
            ],
            "diese_woche": [
                "Finde Verbindungen zwischen Lerninhalten und deinem Leben",
                "Mache sichtbar, was du schon geschafft hast (Done-Liste)",
                "Lerne mit anderen zusammen - gemeinsam macht's mehr Spaß"
            ],
            "langfristig": [
                "Finde DEINE Ziele - nicht die deiner Eltern",
                "Fokussiere auf Lernen, nicht nur auf Noten",
                "Vergleiche dich mit dir selbst von gestern"
            ]
        },

        "scale_type": "external",
        "thresholds": None
    },

    "EXT_FOCUS": {
        "name_de": "Fokus und Konzentration",
        "name_schueler": "Fokus halten - Ablenkungen besiegen",

        "hattie": {
            "factor": "Reducing Disruptions",
            "d": 0.34,
            "rank": 78,
            "category": "Classroom",
            "source": "Hattie 2023"
        },
        "pisa": {
            "correlation": None,
            "variance_explained": "28% werden durch Geräte abgelenkt",
            "points_impact": "Negativer Einfluss bei Ablenkung",
            "source": "PISA 2022 Deutschland"
        },
        "xgboost_rank": None,
        "intervention_priority": "MITTEL",

        "erklaerung_schueler": """
PISA 2022: 28% der deutschen Schüler können nicht ungestört arbeiten,
28% werden durch digitale Geräte abgelenkt.

Das ist kein Willens-Problem - es ist ein Umgebungs-Problem!

Mach es dir leicht, fokussiert zu bleiben.
        """,

        "warum_wichtig": """
Hattie d = 0.34 - auch "kleinere" Effekte summieren sich!

Forschung zeigt:
- Allein die Anwesenheit des Handys reduziert Konzentration
- Multitasking funktioniert nicht - das Gehirn wechselt nur schnell
- Routinen reduzieren den Bedarf an Willenskraft
        """,

        "was_tun": {
            "sofort": [
                "Handy in anderen Raum legen (nicht nur lautlos!)",
                "Timer stellen: 25 Min fokussiert, 5 Min Pause",
                "Schreibtisch aufräumen, bevor du anfängst"
            ],
            "diese_woche": [
                "Installiere einen App-Blocker (Forest, Freedom)",
                "Finde deinen besten Lernort (wo kannst du dich konzentrieren?)",
                "Etabliere feste Lernzeiten"
            ],
            "langfristig": [
                "Mache fokussiertes Lernen zur Gewohnheit",
                "Gestalte deine Umgebung für Konzentration",
                "Lerne, Ablenkungen zu bemerken und zurückzukommen"
            ]
        },

        "scale_type": "external",
        "thresholds": None
    }
}

# ============================================
# HILFSFUNKTIONEN
# ============================================

def get_evidence(scale_name: str) -> dict:
    """
    Holt alle Evidenz-Daten für eine Skala.
    
    Returns:
        dict mit Hattie-Daten, PISA-Daten, Erklärungen, Empfehlungen
        oder None, wenn Skala nicht gefunden
    """
    return EVIDENCE_DATABASE.get(scale_name)


def get_schueler_erklaerung(scale_name: str) -> str:
    """Holt die schülerfreundliche Erklärung für eine Skala."""
    evidence = get_evidence(scale_name)
    if evidence:
        return evidence.get("erklaerung_schueler", "Keine Erklärung verfügbar.")
    return "Keine Erklärung verfügbar."


def get_warum_wichtig(scale_name: str) -> str:
    """Holt die wissenschaftliche Begründung für eine Skala."""
    evidence = get_evidence(scale_name)
    if evidence:
        return evidence.get("warum_wichtig", "Keine Begründung verfügbar.")
    return "Keine Begründung verfügbar."


def get_was_tun(scale_name: str, zeitraum: str = "sofort") -> list:
    """
    Holt konkrete Handlungsempfehlungen.
    
    Args:
        scale_name: Name der Skala
        zeitraum: "sofort", "diese_woche", oder "langfristig"
    
    Returns:
        Liste von Empfehlungen
    """
    evidence = get_evidence(scale_name)
    if evidence and "was_tun" in evidence:
        return evidence["was_tun"].get(zeitraum, [])
    return []


def get_hattie_info(scale_name: str) -> dict:
    """Holt Hattie-spezifische Informationen."""
    evidence = get_evidence(scale_name)
    if evidence:
        return evidence.get("hattie", {})
    return {}


def get_pisa_info(scale_name: str) -> dict:
    """Holt PISA-spezifische Informationen."""
    evidence = get_evidence(scale_name)
    if evidence:
        return evidence.get("pisa", {})
    return {}


def get_intervention_priority(scale_name: str) -> str:
    """Holt die Interventions-Priorität."""
    evidence = get_evidence(scale_name)
    if evidence:
        return evidence.get("intervention_priority", "UNBEKANNT")
    return "UNBEKANNT"


def get_all_scales_with_evidence() -> list:
    """Gibt Liste aller Skalen mit Evidenz-Daten zurück."""
    return list(EVIDENCE_DATABASE.keys())


def interpret_score_with_evidence(scale_name: str, score: float) -> dict:
    """
    Interpretiert einen Skalenwert mit wissenschaftlicher Einordnung.
    
    Returns:
        dict mit kategorie, farbe, empfehlung, hattie, pisa, tipps
    """
    evidence = get_evidence(scale_name)
    if not evidence:
        return {
            "kategorie": "unbekannt",
            "farbe": "#808080",
            "empfehlung": "Keine Daten verfügbar"
        }
    
    scale_type = evidence.get("scale_type", "positive")
    thresholds = evidence.get("thresholds", {"kritisch": 2.0, "beobachten": 2.5, "gut": 3.0})
    
    # Bestimme Kategorie basierend auf Typ
    if scale_type == "positive":
        # Höher = besser
        if score < thresholds["kritisch"]:
            kategorie = "kritisch"
            farbe = "#ff4b4b"
            empfehlung = "Handlungsbedarf"
        elif score < thresholds["beobachten"]:
            kategorie = "beobachten"
            farbe = "#ffa500"
            empfehlung = "Beobachten"
        else:
            kategorie = "gut"
            farbe = "#00cc88"
            empfehlung = "Gut"
    else:
        # Niedriger = besser (z.B. ANXMAT)
        if score > thresholds["kritisch"]:
            kategorie = "kritisch"
            farbe = "#ff4b4b"
            empfehlung = "Handlungsbedarf"
        elif score > thresholds["beobachten"]:
            kategorie = "beobachten"
            farbe = "#ffa500"
            empfehlung = "Beobachten"
        else:
            kategorie = "gut"
            farbe = "#00cc88"
            empfehlung = "Gut"
    
    return {
        "kategorie": kategorie,
        "farbe": farbe,
        "empfehlung": empfehlung,
        "hattie": evidence.get("hattie", {}),
        "pisa": evidence.get("pisa", {}),
        "priority": evidence.get("intervention_priority", "UNBEKANNT"),
        "tipps_sofort": evidence.get("was_tun", {}).get("sofort", []),
        "erklaerung": evidence.get("erklaerung_schueler", ""),
        "warum_wichtig": evidence.get("warum_wichtig", "")
    }


def get_priority_ranking() -> list:
    """
    Gibt die Skalen nach XGBoost-Priorität sortiert zurück.
    
    Returns:
        Liste von (scale_name, rank, priority) Tupeln
    """
    ranking = []
    for scale_name, data in EVIDENCE_DATABASE.items():
        rank = data.get("xgboost_rank", 99)
        priority = data.get("intervention_priority", "UNBEKANNT")
        ranking.append((scale_name, rank, priority))
    
    return sorted(ranking, key=lambda x: x[1])


def format_hattie_badge(scale_name: str) -> str:
    """
    Erstellt ein formatiertes Hattie-Badge für die Anzeige.
    
    Returns:
        HTML-String mit Effektstärke und Rang
    """
    hattie = get_hattie_info(scale_name)
    if not hattie:
        return ""
    
    d = hattie.get("d", 0)
    rank = hattie.get("rank", "?")
    factor = hattie.get("factor", scale_name)
    
    # Farbe basierend auf Effektstärke
    if d >= 0.8:
        color = "#00cc88"  # Grün - sehr hoch
        label = "Sehr hoher Einfluss"
    elif d >= 0.6:
        color = "#4ecdc4"  # Türkis - hoch
        label = "Hoher Einfluss"
    elif d >= 0.4:
        color = "#ffa500"  # Orange - mittel
        label = "Mittlerer Einfluss"
    else:
        color = "#ff6b6b"  # Rot - niedrig
        label = "Geringerer Einfluss"
    
    return f"""
    <div style="background: {color}22; border: 2px solid {color}; 
                border-radius: 10px; padding: 10px; margin: 5px 0;">
        <strong style="color: {color};">📊 Hattie-Forschung</strong><br>
        <span style="font-size: 1.2em; font-weight: bold;">d = {d}</span> 
        <span style="color: #666;">({label})</span><br>
        <small>Rang {rank} von 252 Faktoren | {factor}</small>
    </div>
    """


def format_pisa_badge(scale_name: str) -> str:
    """
    Erstellt ein formatiertes PISA-Badge für die Anzeige.
    
    Returns:
        HTML-String mit PISA-Korrelation und Impact
    """
    pisa = get_pisa_info(scale_name)
    if not pisa:
        return ""
    
    correlation = pisa.get("correlation", 0)
    impact = pisa.get("points_impact", "?")
    variance = pisa.get("variance_explained", "?")
    
    return f"""
    <div style="background: #667eea22; border: 2px solid #667eea; 
                border-radius: 10px; padding: 10px; margin: 5px 0;">
        <strong style="color: #667eea;">📈 PISA 2022 Deutschland</strong><br>
        <span style="font-size: 1.2em; font-weight: bold;">{impact}</span><br>
        <small>Korrelation: r = {correlation} | Erklärt {variance} der Unterschiede</small>
    </div>
    """
