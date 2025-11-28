"""
🧵 Birkenbihl-Challenge Content
===============================

Challenge 3: Die Birkenbihl-Methode
Basierend auf Vera F. Birkenbihl's Lehren (Original-Seminar-Transkript)

Kernkonzepte:
1. Nicht aufschreiben was DER ANDERE sagt – sondern was DU denkst!
2. Eigene Gedanken = Fäden im Wissensnetz
3. Mit Faden = leicht, ohne Faden = schwer (hat nichts mit Intelligenz zu tun!)
4. Neues Wissen an bestehende Fäden "anhängen"

Vera Birkenbihl: "Lernen Sie aufzuschreiben was SIE SELBER denken!"
"""

from typing import Dict, Any, List

# ============================================
# EFFEKTSTÄRKE & INFO
# ============================================

BIRKENBIHL_INFO = {
    "name": "Birkenbihl-Methode",
    "creator": "Vera F. Birkenbihl (1946-2011)",
    "core_principle": "Nicht aufschreiben was der andere sagt – sondern was DU denkst!",
    "effect_note": "Keine direkte Effektstärke gemessen, aber kombiniert Elaboration (d=0.56) mit Active Recall",
}

# ============================================
# XP KONFIGURATION
# ============================================

BIRKENBIHL_XP = {
    "phase_faden": 30,           # Phase 1: Das Faden-Prinzip
    "phase_eigene_gedanken": 35, # Phase 2: Eigene Gedanken notieren
    "phase_wissensnetz": 30,     # Phase 3: Wissensnetz bauen
    "phase_anwenden": 30,        # Phase 4: Im Alltag anwenden
    "birkenbihl_check": 25,      # Finale: Birkenbihl-Check
    "experiment_bonus": 15,      # Bonus für Live-Experiment
}

# ============================================
# PHASE 1: DAS FADEN-PRINZIP
# ============================================

PHASE_1_CONTENT = {
    "title": "Das Faden-Prinzip",
    "icon": "🧵",
    "core_concept": "Mit Faden = leicht, ohne Faden = schwer!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """**Stell dir dein Gehirn wie ein Spinnennetz vor!** 🕸️

Jedes Mal wenn du etwas lernst, ist das wie ein neuer Faden im Netz.

Wenn jemand dir etwas Neues erzählt und du hast schon einen Faden dazu – 
dann kannst du das Neue einfach dranhängen! Easy! ✨

Aber wenn du KEINEN Faden hast? 
Dann ist es wie wenn eine Fliege am Netz vorbeifliegt – sie bleibt nicht hängen! 🪰

**Das Geheimnis:** Du musst erst einen Faden haben, dann bleibt alles hängen!""",
            
            "story": """**Die Geschichte vom Zauberwort** ✨

Lea hörte im Radio ein komisches Wort: "Meteorologie"

Sie dachte: "Häh? Was soll das sein?" – und vergaß es sofort.

Eine Woche später lernte sie in der Schule über das Wetter.
Die Lehrerin sagte: "Wetter-Forscher heißen Meteorologen!"

Lea dachte: "Aha! Meteor... wie die Sternschnuppen! Und -logie wie bei Zoo-logie!"

Plötzlich hatte sie FÄDEN! Und jetzt vergisst sie das Wort nie mehr.

**Das Geheimnis:** Sobald du einen Faden hast, bleibt alles hängen!""",
            
            "experiment": {
                "title": "Das Faden-Experiment! 🔬",
                "instruction": """Vera Birkenbihl hat dieses Experiment mit tausenden Menschen gemacht!

**So geht's:**
1. Ich sage dir gleich 5 Wörter
2. Du darfst sie NICHT aufschreiben!
3. Du darfst sie dir NICHT merken wollen!
4. Du schreibst nur auf: "Was fällt MIR dazu ein?"

**Beispiel:** Ich sage "Drache" 🐉
Du schreibst: "Feuer, fliegen, Minecraft, cool"
(NICHT das Wort "Drache"!)""",
                "words": [
                    {"word": "Eiscreme", "icon": "🍦", "hint": "Was fällt dir ein? Sommer? Lieblings­sorte?"},
                    {"word": "Skateboard", "icon": "🛹", "hint": "Tricks? Park? YouTube-Videos?"},
                    {"word": "Regenbogen", "icon": "🌈", "hint": "Farben? Nach dem Regen? Einhorn?"},
                    {"word": "Rakete", "icon": "🚀", "hint": "Weltraum? Silvester? SpaceX?"},
                    {"word": "Dinosaurier", "icon": "🦖", "hint": "T-Rex? Jurassic Park? Ausgestorben?"},
                ],
            },
            
            "fun_fact": "Vera Birkenbihl sagte: 'Ob etwas leicht oder schwer ist, hat nur damit zu tun, ob du einen Faden hast – nicht wie schlau du bist!' 🧠",
        },
        
        "unterstufe": {
            "intro": """**Die wichtigste Lern-Erkenntnis überhaupt!** 🎯

Vera Birkenbihl hat etwas Revolutionäres entdeckt:

> "Wir haben in der Schule gelernt: Wenn wir uns was merken wollen, 
> aufschreiben. **Das ist FALSCH!**"

Was ist richtig?
- ❌ NICHT aufschreiben was der Lehrer sagt
- ✅ Aufschreiben was DU SELBER denkst!

**Warum?** Dein Gehirn ist wie ein Netz aus Fäden.
Neues Wissen muss an einen bestehenden Faden "andocken".
Ohne Faden? Geht rein, geht raus. Weg.
Mit Faden? Bleibt für immer!""",
            
            "story": """**Das "Adipös"-Beispiel von Vera Birkenbihl**

Birkenbihl fragte ihr Publikum:
"Hören Sie ein- bis zweimal pro Woche das Wort 'adipös' in den Nachrichten?"

Alle sagten: "Nein, nie gehört!"

Sie erklärte: "Adipositas = Fettleibigkeit. Adipös = übergewichtig."

Dann sagte sie: "Ab heute werden Sie das Wort ÜBERALL hören!"

**Warum?** Vorher war das Wort nur eine "Klangwolke" – 
es ging rein und raus, weil kein Faden da war.

Jetzt HABEN sie einen Faden – und plötzlich fällt es ihnen auf!

**Das ist das Faden-Prinzip:** Ohne Faden = unsichtbar. Mit Faden = überall!""",
            
            "experiment": {
                "title": "Das Birkenbihl-Experiment! 🔬",
                "instruction": """Das Original-Experiment aus Birkenbihl's Seminar!

**Die Regeln:**
1. Ich nenne dir 5 Begriffe
2. Du darfst sie NICHT aufschreiben
3. Du darfst sie dir NICHT merken wollen!
4. Du schreibst NUR auf: Was fällt DIR dazu ein?

**Wichtig:** Beobachte dein eigenes Denken!
Was für Bilder tauchen auf? Welche Erinnerungen?""",
                "words": [
                    {"word": "Schreibmaschine", "icon": "⌨️", "hint": "Oma? Klackern? Retro?"},
                    {"word": "Mähdrescher", "icon": "🚜", "hint": "Bauernhof? Ernte? Riesig?"},
                    {"word": "Leuchtstoffröhre", "icon": "💡", "hint": "Schule? Flackern? Kalt?"},
                    {"word": "Fernsehen", "icon": "📺", "hint": "Netflix? Abends? Serien?"},
                    {"word": "Transistor", "icon": "🔌", "hint": "Technik? Physik? Klein?"},
                ],
            },
            
            "fun_fact": "Das waren die Original-Wörter aus Birkenbihl's Seminar! Sie hat über 30.000 Menschen damit getestet! 📊",
        },
        
        "mittelstufe": {
            "intro": """**Das Faden-Prinzip: Warum Lernen manchmal "schwer" scheint**

Vera F. Birkenbihl revolutionierte unser Verständnis vom Lernen:

> "Ob etwas leicht oder schwer ist, hat NUR damit zu tun, 
> ob Sie einen Faden haben. Es hat NICHTS mit Intelligenz zu tun!"

**Das Modell:**
- Dein Gehirn = Wissensnetz aus verbundenen Fäden
- Neues Wissen = muss an bestehenden Faden "andocken"
- Kein Faden da = Information "prallt ab"
- Faden vorhanden = Information "hängt sich dran"

**Die Konsequenz:**
Bevor du etwas Neues lernst, finde deinen FADEN!
Frag dich: "Was weiß ich SCHON darüber? Was fällt mir dazu ein?"

So aktivierst du dein bestehendes Netz – und das Neue kann andocken.""",
            
            "story": """**Das Meeting-Beispiel**

Birkenbihl beschreibt folgende Situation:

Du sitzt in einem Meeting. Thema: Dienstwagen-Regelung.
Dir fällt ein: "Damals bei Firma X hat Dietrich es geschafft, 
ein Auto mit Sonnendach zu bekommen, obwohl er kein Anrecht hatte!"

**Was tust du?**
- ❌ FALSCH: Aufschreiben was der Chef sagt
- ✅ RICHTIG: "Dietrich" notieren!

**Warum?**
"Dietrich" ist DEIN Faden. An diesem Faden hängt deine Erfahrung.
Wenn du "Dietrich" liest, fällt dir ALLES wieder ein!

Das Meeting-Thema hat deinen "Dietrich-Faden" aktiviert.
Du notierst deinen Faden – und das neue Wissen hängt sich dran.""",
            
            "experiment": {
                "title": "Das wissenschaftliche Experiment 🔬",
                "instruction": """Birkenbihl's Original-Experiment (30.000+ Teilnehmer!)

**Ablauf:**
1. Du hörst 5 Fachbegriffe
2. Du schreibst NICHT die Begriffe auf!
3. Du notierst NUR: Was fällt MIR dazu ein?
4. Danach prüfen wir: Wie viel erinnerst du?

**Die Erkenntnis:**
Wer seine eigenen Gedanken notiert, erinnert MEHR
als wer versucht, die Wörter auswendig zu lernen!""",
                "words": [
                    {"word": "Schreibmaschine", "icon": "⌨️", "hint": "Assoziationen notieren!"},
                    {"word": "Mähdrescher", "icon": "🚜", "hint": "Deine Bilder, Erinnerungen!"},
                    {"word": "Leuchtstoffröhre", "icon": "💡", "hint": "Was verbindest DU damit?"},
                    {"word": "Fernsehen", "icon": "📺", "hint": "Persönliche Assoziationen!"},
                    {"word": "Transistor", "icon": "🔌", "hint": "Egal wie wenig – notiere es!"},
                ],
            },
            
            "fun_fact": "Birkenbihl trainierte Top-Manager bei IBM, Siemens und BMW mit dieser Methode! 💼",
        },
        
        "oberstufe": {
            "intro": """**Das Faden-Prinzip: Neurobiologische Grundlagen**

Vera F. Birkenbihl (1946-2011) war ihrer Zeit weit voraus.
Ihre Methoden werden heute durch Neurowissenschaften bestätigt.

**Das Konzept:**
"Fäden" entsprechen neuronalen Verbindungen (Synapsen).
Neues Wissen kann nur "andocken", wenn es aktivierte Netzwerke gibt.

**Birkenbihl's Experiment zeigt:**
- Passive Aufnahme (Mitschreiben was andere sagen) = schwache Enkodierung
- Aktive Elaboration (eigene Assoziationen) = starke Enkodierung

**Die Regel:**
> "Lernen Sie aufzuschreiben was SIE SELBER denken, 
> nicht was der andere sagt!"

Dies entspricht dem Elaboration-Effekt (d=0.56 nach Hattie) 
kombiniert mit Self-Reference-Effekt (tiefere Verarbeitung 
durch persönlichen Bezug).""",
            
            "story": """**Das Adipositas-Phänomen**

Birkenbihl fragte: "Hören Sie 1-2x pro Woche 'adipös' in den Nachrichten?"

Publikum: "Nein, nie!"

Sie erklärt: "Adipositas = Fettleibigkeit. Es ist ein medizinischer Fachbegriff."

Dann die Vorhersage: "Ab heute werden Sie das Wort ÜBERALL hören!"

**Neurobiologische Erklärung:**
Ohne semantisches Netzwerk zum Begriff = "Klangwolke" (keine Verarbeitung)
Mit aktiviertem Netzwerk = Reticular Activating System filtert es durch

**Das ist Priming + Baader-Meinhof-Phänomen:**
Sobald ein "Faden" existiert, wird das Pattern erkannt.""",
            
            "experiment": {
                "title": "Replikation des Original-Experiments 🔬",
                "instruction": """Birkenbihl führte dieses Experiment mit über 30.000 Teilnehmern durch.

**Protokoll:**
1. Präsentation von 5 Begriffen
2. Instruktion: NICHT memorieren, NUR eigene Assoziationen notieren
3. Ablenkungsaufgabe (Zeichnen)
4. Freie Reproduktion der Begriffe

**Hypothese:**
Die Gruppe mit Assoziationen erinnert mehr als 
eine Kontrollgruppe, die aktiv memorieren sollte.

**Mechanismus:**
Elaborative Rehearsal > Maintenance Rehearsal""",
                "words": [
                    {"word": "Schreibmaschine", "icon": "⌨️", "hint": "Semantische Assoziationen"},
                    {"word": "Mähdrescher", "icon": "🚜", "hint": "Episodische Erinnerungen"},
                    {"word": "Leuchtstoffröhre", "icon": "💡", "hint": "Sensorische Verknüpfungen"},
                    {"word": "Fernsehen", "icon": "📺", "hint": "Emotionale Konnotationen"},
                    {"word": "Transistor", "icon": "🔌", "hint": "Konzeptuelle Verbindungen"},
                ],
            },
            
            "fun_fact": "Birkenbihl nannte sich selbst 'Gehirn-Benutzerin' – sie brachte komplexe Neurowissenschaft in alltagstaugliche Methoden! 🧠",
        },
        
        "paedagogen": {
            "intro": """**Das Faden-Prinzip nach Vera F. Birkenbihl**

Birkenbihl's Methoden kombinieren mehrere evidenzbasierte Prinzipien:
- Elaborative Rehearsal (statt Maintenance Rehearsal)
- Self-Reference Effect
- Aktivierung von Vorwissen (Advance Organizers)
- Metakognition ("eigenes Denken beobachten")

**Kernaussage:**
> "Wir haben in der Schule gelernt, aufzuschreiben was der andere sagt.
> Das ist FALSCH. Lernen Sie aufzuschreiben was SIE SELBER denken!"

**Neurobiologische Validierung:**
- Tiefere Verarbeitung durch persönliche Assoziationen
- Aktivierung bestehender neuronaler Netzwerke
- Bessere Enkodierung durch Selbst-Bezug""",
            
            "implementation": """**Implementation im Unterricht:**

1. **Faden-Aktivierung vor neuem Stoff**
   - "Was wisst ihr schon darüber?"
   - "Was fällt euch spontan dazu ein?"
   - Mind-Maps der Vorerfahrungen

2. **Während des Inputs**
   - Schüler notieren IHRE Assoziationen
   - Nicht: Tafelanschrieb kopieren
   - Sondern: "Was denke ICH dazu?"

3. **Das Birkenbihl-Experiment im Unterricht**
   - 5 Begriffe nennen (nicht aufschreiben lassen!)
   - Nur eigene Assoziationen notieren
   - Später: Freie Reproduktion testen
   - Reflexion: Was hat funktioniert?

4. **"Faden suchen" als Routine**
   - Bei jedem neuen Thema: "Wo ist mein Faden?"
   - Kein Faden? Erst einen bauen!

**Video-Empfehlung (für Pädagogen):**
Vera F. Birkenbihl: "Gehirn-gerechtes Lernen" (YouTube: CiPhJj7fDX4)""",
            
            "research_note": "Birkenbihl, V. F. (2001). Stroh im Kopf? mvg Verlag. | Craik & Tulving (1975). Levels of Processing.",
        },
    },
}

# ============================================
# PHASE 2: EIGENE GEDANKEN NOTIEREN
# ============================================

PHASE_2_CONTENT = {
    "title": "Eigene Gedanken notieren",
    "icon": "💭",
    "core_concept": "Nicht mitschreiben was der andere sagt – sondern was DU denkst!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """**Das Geheimnis der Superlerner!** 🦸

In der Schule lernt man: "Schreib auf, was die Lehrerin sagt!"

Vera Birkenbihl sagt: **Das ist FALSCH!**

Richtig ist: Schreib auf, was DU DENKST!

**Beispiel:**
Die Lehrerin sagt: "Schmetterlinge haben vier Flügel."

❌ Falsch: "Schmetterlinge haben 4 Flügel" aufschreiben
✅ Richtig: "Erinnert mich an den bunten im Garten!" aufschreiben

Warum? Weil DEIN Gedanke der Faden ist, an dem das Neue hängt!""",
            
            "exercise": {
                "title": "Gedanken-Jagd! 🎯",
                "instruction": """Ich erzähle dir kurze Fakten. Du schreibst NICHT den Fakt auf!
Du schreibst auf, was DIR dazu einfällt!

**Beispiel:**
Ich sage: "Elefanten haben ein super Gedächtnis."
Du schreibst: "Dumbo! Zoo-Ausflug! Groß!"

Bereit? Los geht's!""",
                "facts": [
                    {
                        "fact": "Delfine schlafen mit einem Auge offen!",
                        "icon": "🐬",
                        "prompt": "Was fällt DIR zu Delfinen ein?",
                    },
                    {
                        "fact": "Honig wird niemals schlecht – auch nach 1000 Jahren nicht!",
                        "icon": "🍯",
                        "prompt": "Deine Honig-Gedanken?",
                    },
                    {
                        "fact": "Oktopusse haben drei Herzen!",
                        "icon": "🐙",
                        "prompt": "Was verbindest du mit Oktopus?",
                    },
                ],
            },
            
            "fun_fact": "Wenn du deine eigenen Gedanken aufschreibst, merkt sich dein Gehirn auch den Fakt – automatisch! 🪄",
        },
        
        "unterstufe": {
            "intro": """**Die Anti-Mitschreib-Methode!** ✍️

Was macht die Schule? "Schreib mit, was der Lehrer sagt!"
Was sagt Birkenbihl? **"Das ist der größte Lernfehler!"**

**Warum ist Mitschreiben schlecht?**
- Du bist im "Kopier-Modus", nicht im "Denk-Modus"
- Dein Gehirn ist nur mit Schreiben beschäftigt
- Der Inhalt geht an dir vorbei!

**Was sollst du stattdessen tun?**
Schreib auf, was DU DENKST, während du zuhörst!

**Beispiel Meeting (Birkenbihl):**
Chef redet über Dienstwagen.
Dir fällt ein: "Dietrich hat damals einen Dienstwagen ergattert!"
→ Du schreibst: "Dietrich"
→ An "Dietrich" hängt ALLES was du brauchst!""",
            
            "exercise": {
                "title": "Der Gedanken-Test! 🧪",
                "instruction": """Ich gebe dir 3 Mini-Vorträge (je 2 Sätze).
Du schreibst NICHTS von dem auf, was ich sage!
Du schreibst NUR auf: "Was fällt MIR dazu ein?"

**Die Challenge:** Danach sollst du mir erzählen, worum es ging.
Wetten, dass du mehr weißt als wenn du mitgeschrieben hättest?""",
                "mini_lectures": [
                    {
                        "topic": "Das Sonnensystem",
                        "content": "Die Sonne macht 99,86% der Masse unseres Sonnensystems aus. Jupiter ist so groß, dass alle anderen Planeten reinpassen würden.",
                        "icon": "🌍",
                        "prompt": "Deine Gedanken zum Sonnensystem?",
                    },
                    {
                        "topic": "Musik und Gehirn",
                        "content": "Musik aktiviert mehr Hirnareale als jede andere Aktivität. Musiker haben ein größeres Corpus Callosum.",
                        "icon": "🎵",
                        "prompt": "Was verbindest du mit Musik?",
                    },
                    {
                        "topic": "Sprachen lernen",
                        "content": "Kinder können bis zu 7 Sprachen gleichzeitig lernen. Nach der Pubertät wird es schwieriger.",
                        "icon": "🗣️",
                        "prompt": "Deine Sprach-Assoziationen?",
                    },
                ],
            },
            
            "fun_fact": "Birkenbihl nannte das 'Zuhören mit dem ganzen Gehirn' – nicht nur mit den Ohren! 👂🧠",
        },
        
        "mittelstufe": {
            "intro": """**Elaboratives vs. Mechanisches Lernen**

Vera Birkenbihl unterschied zwei Arten des Notierens:

**1. Mechanisches Mitschreiben** ❌
- Kopieren was gesagt wird
- Gehirn im "Stenografie-Modus"
- Oberflächliche Verarbeitung
- Schnell vergessen!

**2. Elaboratives Notieren** ✅
- Eigene Gedanken festhalten
- Gehirn im "Versteh-Modus"
- Tiefe Verarbeitung
- Dauerhaft gespeichert!

**Die Wissenschaft dahinter:**
Craik & Tulving (1975) zeigten: "Levels of Processing"
Je tiefer die Verarbeitung, desto besser die Erinnerung.

**Eigene Gedanken = tiefste Verarbeitung** 
(Persönlicher Bezug, Emotionen, bestehendes Wissen)""",
            
            "exercise": {
                "title": "Das Levels-of-Processing Experiment 🔬",
                "instruction": """Wir machen das Experiment von Craik & Tulving!

**Setup:** 
Ich gebe dir Wörter mit verschiedenen Aufgaben:
- Gruppe A: "Ist das Wort in Großbuchstaben?" (oberflächlich)
- Gruppe B: "Reimt sich das auf ___?" (mittel)
- Gruppe C: "Passt das in den Satz: ___?" (tief)

**Vorhersage:** 
Gruppe C erinnert am meisten – obwohl sie am wenigsten "gelernt" hat!

**Deine Aufgabe:**
Bei jedem Wort: Schreib deinen persönlichen Gedanken auf!""",
                "words_experiment": [
                    {"word": "Algorithmus", "task": "Wo begegnet dir das im Alltag?"},
                    {"word": "Demokratie", "task": "Welches Erlebnis verbindest du damit?"},
                    {"word": "Photosynthese", "task": "Welches Bild siehst du vor dir?"},
                ],
            },
            
            "fun_fact": "Birkenbihl: 'Wenn Sie 90% ergänzen, merken Sie es gar nicht. So funktioniert Verstehen!' 🧩",
        },
        
        "oberstufe": {
            "intro": """**Die kognitive Basis der Birkenbihl-Methode**

**Levels of Processing (Craik & Lockhart, 1972)**
- Oberflächliche Verarbeitung: Orthografie, Phonologie
- Mittlere Verarbeitung: Syntaktische Analyse
- Tiefe Verarbeitung: Semantische, elaborative Analyse

**Self-Reference Effect (Rogers et al., 1977)**
Information mit Selbstbezug wird besser erinnert als 
Information mit semantischer Verarbeitung allein.

**Birkenbihl's Innovation:**
Kombination beider Effekte:
1. Tiefe semantische Verarbeitung (eigene Assoziationen)
2. Selbstbezug (persönliche Gedanken)

**Praktische Konsequenz:**
> "Lernen Sie nicht aufzuschreiben was der Typ quatscht.
> Lernen Sie aufzuschreiben was SIE SELBER denken!"
— Vera F. Birkenbihl""",
            
            "exercise": {
                "title": "Metakognitives Protokoll 📝",
                "instruction": """Erstelle ein "Thinking Protocol" nach Birkenbihl:

**Während du einen Text liest / Vortrag hörst:**
1. Notiere NICHT den Inhalt
2. Notiere deine GEDANKEN zum Inhalt:
   - "Das erinnert mich an..."
   - "Das widerspricht meiner Erfahrung, dass..."
   - "Interessant, weil..."
   - "Frage: Warum...?"

**Analysiere danach:**
- Wie viel vom Inhalt hast du behalten?
- Welche deiner Notizen waren besonders "produktiv"?
- Wo hattest du keine Gedanken? (= fehlender Faden!)""",
            },
            
            "fun_fact": "Birkenbihl empfahl: 'Üben Sie bei den Nachrichten!' – Perfektes tägliches Training! 📺",
        },
        
        "paedagogen": {
            "intro": """**Eigene Gedanken notieren: Didaktische Umsetzung**

**Theoretische Grundlagen:**
- Elaborative Interrogation (Pressley et al., 1987)
- Self-Explanation Effect (Chi et al., 1994)
- Generative Learning (Wittrock, 1989)

**Birkenbihl's praktische Umsetzung:**
Statt passiver Mitschrift aktive Gedankenprotokollierung.

**Herausforderung im Unterricht:**
Schüler sind konditioniert auf "Mitschreiben = fleißig".
Umdenken erfordert explizites Training und Erlaubnis!""",
            
            "implementation": """**Praktische Umsetzung:**

1. **"Gedanken-Spalte" einführen**
   - Heft in zwei Spalten teilen
   - Links: Fakten (minimal!)
   - Rechts: Eigene Gedanken (ausführlich!)

2. **"Think-Aloud" modellieren**
   - Lehrer zeigt eigene Gedanken beim Lesen
   - "Das erinnert mich an..."
   - "Ich frage mich, ob..."

3. **"Faden-Fragen" stellen**
   - "Was fällt DIR dazu ein?"
   - "Wo ist das in deinem Leben relevant?"
   - "Welche Erfahrung hast du damit?"

4. **Mitschreib-Verbot (experimentell)**
   - Eine Stunde: Nur Gedanken notieren!
   - Danach vergleichen: Was wurde behalten?
   - Reflexion: Was war anders?

5. **Nachrichten-Training (Hausaufgabe)**
   - Bei Tagesschau: Eigene Gedanken notieren
   - Am nächsten Tag: Was ist hängengeblieben?""",
            
            "research_note": "Chi, M. T. H. (1994). Eliciting self-explanations improves understanding. Cognitive Science.",
        },
    },
}

# ============================================
# PHASE 3: WISSENSNETZ BAUEN
# ============================================

PHASE_3_CONTENT = {
    "title": "Wissensnetz bauen",
    "icon": "🕸️",
    "core_concept": "Je mehr Fäden, desto mehr bleibt hängen!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """**Dein Gehirn ist ein Spinnennetz!** 🕷️

Stell dir vor: Jedes Mal wenn du etwas lernst, 
kommt ein neuer Faden in dein Netz.

Je MEHR Fäden du hast, desto mehr neue Sachen bleiben hängen!

**Das Problem:** 
Manche Kinder haben zu einem Thema NULL Fäden.
Dann ist es wie ein Netz mit riesigen Löchern – alles fällt durch!

**Die Lösung:**
Erst Fäden bauen! Dann lernen!

Wie baut man Fäden? Indem man SELBER Erfahrungen macht!""",
            
            "exercise": {
                "title": "Netz-Bauer! 🕸️",
                "instruction": """Wir bauen ein Wissensnetz zu einem Thema!

**Thema: Weltraum** 🚀

Schreib in die Mitte: WELTRAUM
Dann zieh Fäden zu allem, was dir einfällt!

Mögliche Fäden:
- Sterne ⭐ (was weißt du über Sterne?)
- Mond 🌙 (warst du mal draußen bei Vollmond?)
- Raketen 🚀 (SpaceX? Filme?)
- Astronauten 👨‍🚀 (hast du einen Traum?)

Je mehr Fäden, desto besser!""",
            },
            
            "fun_fact": "Das größte Spinnennetz der Welt ist 25 Meter breit! Dein Wissensnetz kann noch viel größer werden! 🕸️",
        },
        
        "unterstufe": {
            "intro": """**Das Wissensnetz-Prinzip**

Birkenbihl erklärte: Dein Wissen ist wie ein Netz.

**Je dichter das Netz, desto mehr bleibt hängen!**

Stell dir vor:
- Thema, zu dem du VIEL weißt = dichtes Netz
- Thema, zu dem du NICHTS weißt = löchriges Netz

**Beispiel: Fußball** ⚽
Wenn du Fußball-Fan bist, hast du tausend Fäden:
Spieler, Vereine, Regeln, Stadien, eigene Erfahrungen...

Wenn jemand etwas über Fußball erzählt, bleibt ALLES hängen!

**Beispiel: Quantenphysik** ⚛️
Null Fäden? Dann geht es rein und direkt wieder raus!

**Die Lösung:** Erst Fäden bauen, dann lernen!""",
            
            "exercise": {
                "title": "Netz-Dichtigkeits-Check! 🔍",
                "instruction": """Teste, wie dicht dein Netz zu verschiedenen Themen ist!

**Methode:** 60 Sekunden pro Thema – schreib alles auf, was dir einfällt!

Je mehr du aufschreiben kannst = desto dichter dein Netz!""",
                "topics": [
                    {"topic": "Musik", "icon": "🎵", "time": 60},
                    {"topic": "Geschichte", "icon": "📜", "time": 60},
                    {"topic": "Programmieren", "icon": "💻", "time": 60},
                ],
                "reflection": "Bei welchem Thema hast du am meisten geschrieben? Da ist dein Netz am dichtesten!"
            },
            
            "fun_fact": "Birkenbihl: 'Wenn ich etwas erzähle und du 90% ergänzt, merkst du es gar nicht!' Dein Netz arbeitet automatisch! 🤖",
        },
        
        "mittelstufe": {
            "intro": """**Assoziative Netzwerke und Lerneffizienz**

Vera Birkenbihl nutzte das Modell der assoziativen Netzwerke:

**Das Konzept:**
- Wissen ist in Netzwerken organisiert (nicht linear!)
- Jeder Knoten ist mit anderen Knoten verbunden
- Aktivierung "breitet sich aus" (Spreading Activation)

**Die Konsequenz für Lernen:**
- Viele Verbindungen = schnelle Aktivierung = leichtes Lernen
- Wenige Verbindungen = langsame Aktivierung = schweres Lernen

**Birkenbihl's Beispiel "Adipositas":**
Wort ohne Netzwerk = "Klangwolke" (wird nicht verarbeitet)
Wort MIT Netzwerk = sofort erkannt, überall wahrgenommen

**Strategie:**
Vor dem Lernen: Netzwerk AKTIVIEREN oder AUFBAUEN!""",
            
            "exercise": {
                "title": "Spreading Activation Experiment 🧠",
                "instruction": """Wir testen die "Spreading Activation"!

**Aufgabe:** Ich sage ein Wort. Du hast 30 Sekunden.
Schreib ALLES auf, was dir einfällt – auch wenn es "weit weg" scheint!

**Beispiel:** "Bank"
→ Geld, Sitzen, Park, Sparkasse, Räuber, Tresor, Holz, Fluss...

Siehst du? Von "Bank" (Sitzen) zu "Fluss" (Flussufer) – alles verbunden!""",
                "words": ["Netz", "Brücke", "Schlüssel"],
            },
            
            "fun_fact": "In deinem Gehirn gibt es 86 Milliarden Neuronen mit je 7.000 Verbindungen – das größte Netzwerk im Universum! 🌌",
        },
        
        "oberstufe": {
            "intro": """**Semantische Netzwerke: Theorie und Anwendung**

**Collins & Quillian (1969): Semantische Netzwerke**
Wissen ist hierarchisch und assoziativ organisiert.
Aktivierung breitet sich entlang der Verbindungen aus.

**Collins & Loftus (1975): Spreading Activation**
Je stärker die Verbindung, desto schneller die Aktivierung.
Häufig ko-aktivierte Konzepte werden stärker verknüpft.

**Birkenbihl's praktische Interpretation:**
"Fäden" = semantische Verbindungen
"Dichtes Netz" = reich vernetztes Wissensgebiet
"Löchriges Netz" = isolierte oder fehlende Konzepte

**Lernstrategie:**
1. Bestehendes Netzwerk aktivieren (Vorwissen abrufen)
2. Neue Information an aktivierte Knoten "anhängen"
3. Bewusst Querverbindungen herstellen""",
            
            "exercise": {
                "title": "Concept Mapping nach Birkenbihl 🗺️",
                "instruction": """Erstelle eine "Wissenslandkarte" zu einem komplexen Thema:

**Methode:**
1. Zentrales Konzept in die Mitte
2. Spontane Assoziationen (1 Min) – nicht filtern!
3. Verbindungen zwischen Assoziationen ziehen
4. Lücken identifizieren ("Wo fehlen Fäden?")
5. Gezielte Fragen formulieren ("Was muss ich lernen?")

**Reflexion:**
- Wo ist dein Netz dicht? (Stärken)
- Wo sind Löcher? (Lernbedarf)
- Welche überraschenden Verbindungen gibt es?""",
            },
            
            "fun_fact": "fMRT-Studien zeigen: Semantisch verwandte Wörter aktivieren überlappende Hirnareale! 🧠",
        },
        
        "paedagogen": {
            "intro": """**Wissensnetze im Unterricht aufbauen**

**Theoretische Grundlage:**
- Semantic Network Theory (Collins & Quillian)
- Schema Theory (Bartlett, Rumelhart)
- Constructivism (Piaget, Vygotsky)

**Birkenbihl's Praxisprinzip:**
Vor dem Lernen: Netz AKTIVIEREN!
Während des Lernens: Netz ERWEITERN!
Nach dem Lernen: Netz FESTIGEN!""",
            
            "implementation": """**Implementation:**

1. **Vorwissen aktivieren (5 Min Routine)**
   - "Was wisst ihr schon über...?"
   - Mind-Map an der Tafel
   - ALLE Beiträge aufnehmen (auch "falsche"!)

2. **Lücken identifizieren**
   - "Was möchtet ihr WISSEN?"
   - Fragen sammeln
   - Neugier wecken!

3. **Querverbindungen fördern**
   - "Wo begegnet euch das noch?"
   - Fächerübergreifend denken
   - Alltagsbezüge herstellen

4. **Concept Maps erstellen lassen**
   - Regelmäßig Wissensnetze visualisieren
   - Mit früheren Maps vergleichen (Wachstum!)
   - Peer-Feedback zu Lücken

5. **"Faden-Check" vor Neuem**
   - "Habt ihr einen Faden dazu?"
   - Wenn nein: Erst Faden bauen!
   - Analogy, Beispiel, Erfahrung schaffen""",
            
            "research_note": "Novak, J. D. (1990). Concept mapping: A useful tool for science education. Journal of Research in Science Teaching.",
        },
    },
}

# ============================================
# PHASE 4: IM ALLTAG ANWENDEN
# ============================================

PHASE_4_CONTENT = {
    "title": "Im Alltag anwenden",
    "icon": "🌍",
    "core_concept": "Das Birkenbihl-Training für jeden Tag!",
    
    "altersstufen": {
        "grundschule": {
            "intro": """**Birkenbihl-Training im Alltag!** 🏋️

Du kannst die Faden-Methode ÜBERALL üben!

**Beim Fernsehen:** 📺
- Schau Nachrichten oder eine Sendung
- Schreib auf, was DIR dazu einfällt!
- Nicht was gesagt wird!

**Bei Gesprächen:** 💬
- Wenn jemand etwas erzählt
- Achte auf DEINE Gedanken dazu
- Merkst du, wie dein Gehirn Fäden sucht?

**Beim Lesen:** 📚
- Lies einen Abschnitt
- Halt an: Was fällt MIR dazu ein?
- Das sind deine Fäden!""",
            
            "exercise": {
                "title": "7-Tage-Challenge! 📆",
                "instruction": """Übe jeden Tag eine Birkenbihl-Übung!

**Montag:** Schau 5 Minuten Nachrichten. Schreib deine Gedanken auf!
**Dienstag:** Lies etwas und markiere, wo du Fäden hast.
**Mittwoch:** Wenn jemand erzählt, beobachte deine Gedanken!
**Donnerstag:** Mach ein Wissensnetz zu deinem Lieblings-Thema.
**Freitag:** Erkläre jemandem die Faden-Methode!
**Samstag:** Finde ein neues Wort und bau einen Faden dazu.
**Sonntag:** Reflektiere: Was hat sich verändert?""",
            },
            
            "fun_fact": "Birkenbihl übte jeden Tag beim Nachrichten-Schauen – bis zu ihrem Tod mit 65 Jahren! 📺",
        },
        
        "unterstufe": {
            "intro": """**Die Birkenbihl-Routine** 🔄

Vera Birkenbihl empfahl tägliches Training:

**1. Das Nachrichten-Training** 📺
> "Gucken Sie die Nachrichten und schreiben Sie 
> Ihre eigenen Gedanken auf. Nicht was gesagt wird!"

**2. Der Meeting-Modus** 💼
Bei jedem Gespräch/Vortrag:
- Beobachte, welche Fäden aktiviert werden
- Notiere DEINE Fäden, nicht den Inhalt
- Teste später: Wie viel weißt du noch?

**3. Der Lese-Check** 📖
Nach jedem Abschnitt:
- Stopp!
- Was fällt mir dazu ein?
- Welcher Faden wurde aktiviert?""",
            
            "exercise": {
                "title": "Die 30-Tage-Birkenbihl-Challenge! 🏆",
                "instruction": """Trainiere 30 Tage lang – und werde zum Faden-Meister!

**Woche 1: Nachrichten-Training**
- 5 Min/Tag Nachrichten schauen
- Eigene Gedanken notieren
- Danach: Was ist hängengeblieben?

**Woche 2: Schul-Training**
- In EINER Stunde: Nur eigene Gedanken notieren
- Vergleiche: Wie viel weißt du?

**Woche 3: Lese-Training**
- Bei jedem Text: Gedanken-Spalte!
- Links: Stichworte | Rechts: Eigene Gedanken

**Woche 4: Meister-Level**
- Kombiniere alles!
- Erkläre es einem Freund!""",
            },
            
            "fun_fact": "Nach 30 Tagen wird die Faden-Methode automatisch – dein Gehirn macht es ohne nachzudenken! 🧠",
        },
        
        "mittelstufe": {
            "intro": """**Integration in den Alltag**

Birkenbihl's Empfehlung für lebenslanges Lernen:

**Das Nachrichten-Experiment:**
> "Gucken Sie die Nachrichten – auf Video aufnehmen!
> Schreiben Sie nur Ihre eigenen Gedanken auf.
> Danach testen: Können Sie von Ihren Stichwörtern 
> rekonstruieren, worum es ging?"

**Die Erkenntnis:**
Am Anfang fühlt es sich seltsam an.
Nach einigen Wochen: Automatismus!
Der Gewinn: Besseres Verstehen, längere Erinnerung.

**Der Transfer:**
- Meetings: Eigene Fäden notieren
- Vorlesungen: Nicht mitschreiben, mitdenken!
- Bücher: Gedanken-Marginalien statt Markierungen
- Podcasts: Mental "Fäden suchen" """,
            
            "exercise": {
                "title": "Das Birkenbihl-Tagebuch 📓",
                "instruction": """Führe ein "Faden-Tagebuch" für 2 Wochen:

**Täglich notieren:**
1. Situation (Unterricht/Video/Gespräch)
2. Thema
3. Meine Fäden (was fiel mir ein?)
4. Ergebnis (wie viel behalten?)
5. Reflexion (was hat funktioniert?)

**Wöchentliche Auswertung:**
- Bei welchen Themen hatte ich viele Fäden?
- Wo fehlten Fäden?
- Wie kann ich Fäden aufbauen?""",
            },
            
            "fun_fact": "Birkenbihl trainierte Führungskräfte bei Siemens, BMW und IBM mit dieser Methode! 💼",
        },
        
        "oberstufe": {
            "intro": """**Lebenslanges Lernen mit der Birkenbihl-Methode**

**Das Prinzip der "Parallel-Aufmerksamkeit":**
Birkenbihl lehrte, zwei Ebenen gleichzeitig zu beobachten:
1. Inhalt (was wird gesagt?)
2. Eigene Reaktion (was denke ich dazu?)

**Die Meta-Kognitive Schleife:**
Input → Eigene Assoziationen → Faden-Check → Enkodierung

**Training nach Birkenbihl:**
1. Nachrichten schauen (idealerweise aufgezeichnet)
2. Nur eigene Gedanken/Fäden notieren
3. Von Notizen rekonstruieren
4. Mit Original vergleichen
5. Reflexion: Was hat funktioniert?

**Ziel:** 
Die Methode wird zum "zweiten Betriebssystem" des Gehirns.""",
            
            "exercise": {
                "title": "Wissenschaftliches Selbst-Experiment 🔬",
                "instruction": """Führe ein kontrolliertes Selbst-Experiment durch:

**Design:**
- 2 Wochen: Klassische Mitschriften
- 2 Wochen: Birkenbihl-Methode (nur eigene Gedanken)
- Gleiche Kontexte (Vorlesungen, Videos, Meetings)

**Metriken:**
- Recall nach 1 Tag (was weißt du noch?)
- Recall nach 1 Woche
- Transfer (kannst du es anwenden?)
- Subjektive Bewertung (wie fühlte es sich an?)

**Auswertung:**
- Quantitativ: Mehr/weniger erinnert?
- Qualitativ: Tieferes Verstehen?
- Präferenz: Was funktioniert für dich?""",
            },
            
            "fun_fact": "Birkenbihl war Autodidaktin – sie lernte alles selbst mit ihren eigenen Methoden! 📚",
        },
        
        "paedagogen": {
            "intro": """**Die Birkenbihl-Methode nachhaltig implementieren**

**Langfristige Integration:**
Die Methode erfordert Umdenken und Übung.
Einmalige Einführung reicht nicht!

**Stufen der Implementation:**
1. Bewusstsein schaffen (Theorie verstehen)
2. Ausprobieren (angeleitete Übungen)
3. Üben (regelmäßige Anwendung)
4. Automatisieren (unbewusste Kompetenz)
5. Reflektieren (Metakognition)""",
            
            "implementation": """**Nachhaltige Implementation:**

1. **Routine etablieren**
   - Jede Stunde 5 Min "Faden-Zeit"
   - Feste Struktur (immer gleicher Ablauf)
   - Visualisierung (Poster, Reminder)

2. **Schüler als Experten**
   - Schüler erklären Methode neuen Schülern
   - Peer-Coaching
   - Erfolgsgeschichten teilen

3. **Eltern einbeziehen**
   - Infoabend zur Methode
   - Hausaufgabe: Gemeinsam Nachrichten schauen
   - Faden-Gespräche beim Abendessen

4. **Fächerübergreifend**
   - Alle Kollegen informieren
   - Gleiche Sprache ("Faden", "Netz")
   - Gegenseitige Hospitationen

5. **Langzeit-Tracking**
   - Lern-Portfolios führen
   - Vorher/Nachher-Vergleiche
   - Schüler-Feedback systematisch sammeln

**Video-Ressource:**
Vera F. Birkenbihl Original-Seminar: YouTube "CiPhJj7fDX4" """,
            
            "research_note": "Birkenbihl, V. F. (2006). Trotzdem lehren. mvg Verlag.",
        },
    },
}

# ============================================
# FINALE: BIRKENBIHL-CHECK
# ============================================

FINALE_CONTENT = {
    "title": "Birkenbihl-Check",
    "icon": "🎓",
    "instruction": "Zeig, dass du die Faden-Methode beherrschst!",
    
    "altersstufen": {
        "grundschule": {
            "challenge": """**Dein Birkenbihl-Test!** 🧵

Beantworte diese Fragen:

1. **Was ist ein "Faden"?**
   Erkläre es so, als würdest du es einem Freund erklären!

2. **Das Experiment:**
   Ich sage dir 3 Wörter. Schreib auf, was DIR einfällt – nicht die Wörter!
   - Schokolade 🍫
   - Fußball ⚽
   - Geburtstag 🎂

3. **Wann nutzt du die Methode?**
   Nenne 2 Situationen, wo du die Faden-Methode anwenden kannst!""",
        },
        
        "unterstufe": {
            "challenge": """**Der Birkenbihl-Meister-Test!** 🧵

1. **Erkläre das Faden-Prinzip:**
   Was meinte Birkenbihl mit "Mit Faden = leicht, ohne Faden = schwer"?

2. **Das Original-Experiment:**
   Diese 5 Wörter (NICHT aufschreiben!): 
   Schreibmaschine, Mähdrescher, Leuchtstoffröhre, Fernsehen, Transistor
   
   → Schreib nur deine GEDANKEN dazu auf!
   → Wie viele Wörter kannst du danach erinnern?

3. **Anwendung:**
   Wie würdest du die Birkenbihl-Methode im nächsten Unterricht anwenden?
   Beschreibe konkret!""",
        },
        
        "mittelstufe": {
            "challenge": """**Birkenbihl-Kompetenz-Check** 🧵

1. **Theorie:**
   Erkläre den Unterschied zwischen "Mitschreiben" und "Eigene Gedanken notieren".
   Warum ist Letzteres effektiver? (Nenne die wissenschaftliche Begründung!)

2. **Praxis-Experiment:**
   Schau ein 5-minütiges Erklärvideo (z.B. auf YouTube).
   Notiere NUR deine eigenen Gedanken/Assoziationen.
   Danach: Schreib auf, was du vom Video behalten hast.
   Reflexion: Wie viel % konntest du rekonstruieren?

3. **Transfer:**
   Entwickle einen konkreten Plan, wie du die Birkenbihl-Methode 
   in den nächsten 2 Wochen in deinen Lernalltag integrierst.""",
        },
        
        "oberstufe": {
            "challenge": """**Birkenbihl-Methode: Wissenschaftliche Analyse** 🧵

1. **Theoretische Fundierung:**
   Ordne die Birkenbihl-Methode in die Lernpsychologie ein.
   Welche Konzepte werden kombiniert? (Levels of Processing, Self-Reference, 
   Spreading Activation, Elaborative Rehearsal)

2. **Empirische Überprüfung:**
   Führe das Original-Experiment mit mind. 3 Personen durch.
   Gruppe A: Soll sich die 5 Wörter merken
   Gruppe B: Soll nur Assoziationen notieren
   Vergleiche die Recall-Raten. Dokumentiere deine Ergebnisse.

3. **Kritische Reflexion:**
   Wo liegen die Grenzen der Methode?
   Bei welchen Lernaufgaben funktioniert sie besonders gut/schlecht?
   Wie könnte man sie mit anderen Methoden kombinieren?""",
        },
        
        "paedagogen": {
            "challenge": """**Birkenbihl-Methode: Implementierungsplan** 🧵

1. **Unterrichtskonzept:**
   Entwickeln Sie ein Konzept für eine Unterrichtsstunde,
   in der Sie die Birkenbihl-Methode einführen.
   Inkl. Experiment, Reflexion, Transfer.

2. **Langzeit-Implementation:**
   Skizzieren Sie einen Plan für ein Schulhalbjahr:
   - Wie führen Sie die Methode ein?
   - Wie integrieren Sie sie nachhaltig?
   - Wie messen Sie den Erfolg?

3. **Fächerübergreifende Kooperation:**
   Entwerfen Sie ein Konzept, wie die Methode schulweit
   implementiert werden könnte (inkl. Lehrerfortbildung,
   Elternkommunikation, Schüler-Peer-Training).""",
        },
    },
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_birkenbihl_content_for_age(age_group: str) -> Dict[str, Any]:
    """Gibt den kompletten Birkenbihl-Content für eine Altersstufe zurück."""
    return {
        "phase_1": {
            **PHASE_1_CONTENT,
            "content": PHASE_1_CONTENT["altersstufen"].get(age_group, PHASE_1_CONTENT["altersstufen"]["unterstufe"]),
        },
        "phase_2": {
            **PHASE_2_CONTENT,
            "content": PHASE_2_CONTENT["altersstufen"].get(age_group, PHASE_2_CONTENT["altersstufen"]["unterstufe"]),
        },
        "phase_3": {
            **PHASE_3_CONTENT,
            "content": PHASE_3_CONTENT["altersstufen"].get(age_group, PHASE_3_CONTENT["altersstufen"]["unterstufe"]),
        },
        "phase_4": {
            **PHASE_4_CONTENT,
            "content": PHASE_4_CONTENT["altersstufen"].get(age_group, PHASE_4_CONTENT["altersstufen"]["unterstufe"]),
        },
        "finale": {
            **FINALE_CONTENT,
            "content": FINALE_CONTENT["altersstufen"].get(age_group, FINALE_CONTENT["altersstufen"]["unterstufe"]),
        },
    }

def get_birkenbihl_phase_content(phase_num: int, age_group: str) -> Dict[str, Any]:
    """Gibt den Content für eine spezifische Phase zurück."""
    phases = {
        1: PHASE_1_CONTENT,
        2: PHASE_2_CONTENT,
        3: PHASE_3_CONTENT,
        4: PHASE_4_CONTENT,
        5: FINALE_CONTENT,
    }
    
    phase_data = phases.get(phase_num)
    if not phase_data:
        return None
    
    age_content = phase_data.get("altersstufen", {}).get(age_group)
    if not age_content:
        age_content = phase_data.get("altersstufen", {}).get("unterstufe", {})
    
    return {
        "title": phase_data.get("title"),
        "icon": phase_data.get("icon"),
        "core_concept": phase_data.get("core_concept", ""),
        **age_content,
    }

# ============================================
# BADGES UND ZERTIFIKATE
# ============================================

BIRKENBIHL_BADGES = {
    "faden_finder": {
        "name": "Faden-Finder",
        "icon": "🧵",
        "description": "Das Faden-Prinzip verstanden!",
        "condition": "phase_1_complete",
    },
    "gedanken_jaeger": {
        "name": "Gedanken-Jäger",
        "icon": "💭",
        "description": "Eigene Gedanken notieren gelernt!",
        "condition": "phase_2_complete",
    },
    "netz_bauer": {
        "name": "Netz-Bauer",
        "icon": "🕸️",
        "description": "Wissensnetz aufgebaut!",
        "condition": "phase_3_complete",
    },
    "alltags_anwender": {
        "name": "Alltags-Anwender",
        "icon": "🌍",
        "description": "Birkenbihl im Alltag angewendet!",
        "condition": "phase_4_complete",
    },
    "birkenbihl_meister": {
        "name": "Birkenbihl-Meister",
        "icon": "🎓",
        "description": "Die Birkenbihl-Methode gemeistert!",
        "condition": "finale_complete",
    },
}

BIRKENBIHL_CERTIFICATE = {
    "title": "Birkenbihl-Meister",
    "subtitle": "hat die Faden-Methode nach Vera F. Birkenbihl gemeistert",
    "description": "und gelernt, eigene Gedanken zum Lernen zu nutzen!",
    "skills": [
        "Das Faden-Prinzip verstanden",
        "Eigene Gedanken statt Mitschrift",
        "Wissensnetz aufgebaut",
        "Methode im Alltag anwendbar",
    ],
    "quote": "Lernen Sie aufzuschreiben was SIE SELBER denken! — Vera F. Birkenbihl",
}
