"""
🚀 Transfer-Challenge Content
=============================

Challenge 2: Das Geheimnis der Überflieger
Wissenschaftlich fundiert: Effektstärke d=0.75-0.86 (Hattie)

Transfer = Wissen von einer Situation auf andere übertragen
- Near Transfer: Ähnliche Situationen
- Far Transfer: Komplett verschiedene Situationen
- Brückenprinzipien: Das PRINZIP erkennen

Quellen:
- Hattie (2023): Transfer strategies d=0.86
- Perkins & Salomon (1992): Hugging & Bridging
- Thorndike (1901): Common-elements theory
"""

from typing import Dict, Any, List

# ============================================
# EFFEKTSTÄRKE
# ============================================

TRANSFER_EFFECT_SIZE = 0.86  # Eine der höchsten überhaupt!

# ============================================
# XP KONFIGURATION
# ============================================

TRANSFER_XP = {
    "phase_discovery": 30,      # Phase 1: Das Geheimnis entdecken
    "phase_near": 30,           # Phase 2: Near Transfer
    "phase_far": 35,            # Phase 3: Far Transfer (schwieriger!)
    "phase_bridging": 30,       # Phase 4: Brückenprinzipien
    "transfer_check": 25,       # Finale: Transfer-Check bestanden
    "creative_bonus": 10,       # Bonus für besonders kreative Analogien
}

# ============================================
# PHASE 1: DAS TRANSFER-GEHEIMNIS
# ============================================

PHASE_1_CONTENT = {
    "title": "Das Transfer-Geheimnis",
    "icon": "🔮",
    "core_concept": "Überflieger sind nicht schlauer – sie können ihr Wissen ÜBERTRAGEN!",
    "effect_note": "Transfer-Strategien: d=0.86 – einer der stärksten Lerneffekte überhaupt!",
    
    "altersstufen": {
        "grundschule": {
            "title": "Das Transfer-Geheimnis",
            "icon": "🔮",

            "hook": """**Eine Überraschung: Überflieger sind gar nicht schlauer!** 🌟

Kennst du Kinder, die in vielen Fächern gut sind?
Mathe, Deutsch, Sachkunde – sie können einfach alles?

Viele glauben: Diese Kinder sind besonders schlau geboren.
**Das stimmt aber nicht!**

Forscher haben genau hingeschaut.
Und sie haben etwas Spannendes entdeckt.""",

            "mythos_buster": """**Was viele glauben:** "Manche Kinder sind einfach Überflieger."

**Was wirklich stimmt:** Überflieger kennen einen besonderen Trick.
Sie können ihr Wissen ÜBERTRAGEN.

Das bedeutet: Was sie an einer Stelle lernen, nutzen sie auch woanders.
Wie ein Schlüssel, der viele Türen öffnet.

**Und das Beste?**
Diesen Trick kann jeder lernen. Auch du!""",

            "wissenschaft_einfach": """**Was haben Forscher herausgefunden?**

Wissenschaftler haben viele Schüler beobachtet.
Einige lernten ganz normal. Andere lernten den Transfer-Trick dazu.

Das Ergebnis war erstaunlich:
Die Kinder mit dem Transfer-Trick waren viel erfolgreicher! 📊

Stell dir das so vor:
- Ohne Transfer: Du lernst 10 Dinge auswendig.
- Mit Transfer: Du lernst 10 Dinge und kannst sie in 100 Situationen anwenden!

Das ist, als würdest du ein Werkzeug bekommen, das überall funktioniert.""",

            "gaming_beispiel": """**Kennst du das vom Spielen?** 🎮

Stell dir vor, du lernst ein neues Brettspiel.
Am Anfang verstehst du die Regeln noch nicht so gut.
Aber irgendwann macht es "Klick" – du verstehst, wie das Spiel funktioniert!

Ab dann kannst du auch ähnliche Spiele viel schneller lernen.
Weil du das PRINZIP verstanden hast.

Genau DAS ist Transfer:
Ein Prinzip einmal verstehen und dann überall anwenden.""",

            "alltag_beispiel": """**Wie Lisa Schwimmen und Radfahren verband** 🚴

Lisa lernte gerade Schwimmen.
Ihre Trainerin sagte: "Nicht aufgeben! Jeder braucht am Anfang Zeit."

Lisa übte jeden Tag ein bisschen. Brustschwimmen, Kraulen, Tauchen.
Nach einigen Wochen konnte sie es!

Dann wollte Lisa Fahrradfahren ohne Stützräder lernen.
Am Anfang wackelte sie und hatte Angst.

Aber dann dachte sie: "Moment mal – das ist ja wie beim Schwimmen!"
- Nicht aufgeben
- Jeden Tag ein bisschen üben
- Es wird langsam besser

**DAS ist Transfer.**
Was beim Schwimmen half, half auch beim Radfahren!""",

            "story": """**Wie Tim sein Lego-Wissen nutzte** 🧱

Tim baute liebend gern mit Lego.
Er hatte einen Trick: Erst die Anleitung genau anschauen, dann Schritt für Schritt bauen.

Eines Tages hatte er eine schwere Sachkunde-Aufgabe.
Er sollte beschreiben, wie eine Pflanze wächst.

Tim überlegte: "Das ist ja wie bei Lego!"

1. ANSCHAUEN: Was soll ich genau machen?
2. SCHRITT FÜR SCHRITT: Erst der Samen, dann die Wurzeln, dann der Stängel...
3. FERTIG: Am Ende die Blüte!

Er schrieb alles der Reihe nach auf.
Seine Lehrerin war begeistert!

**Das Geheimnis?** Der gleiche Trick funktioniert überall!""",

            "mini_experiment": """**Probiere es selbst aus!** 🧪

Denk an etwas, das du richtig gut kannst.
Vielleicht Fußball? Oder Malen? Oder ein Instrument?

Jetzt überlege:
Was ist dein besonderer Trick dabei?

Zum Beispiel:
- Beim Fußball: "Immer zum Ball schauen!"
- Beim Malen: "Erst grob, dann die Details."
- Beim Flöte spielen: "Langsam anfangen, dann schneller werden."

Und jetzt die spannende Frage:
Wo könnte dir der GLEICHE Trick in der Schule helfen?

- Immer hinschauen → Beim Lesen genau auf die Wörter achten?
- Erst grob, dann Details → Beim Aufsatz erst die Ideen, dann ausformulieren?
- Langsam anfangen → Beim Rechnen erst die leichten Aufgaben?""",

            "uebertritt_beispiel": """**Das hilft dir beim Übertritt!** 🎒

Bald kommst du auf eine neue Schule.
Dort gibt es neue Fächer wie Englisch oder Geschichte.

Das klingt vielleicht schwierig.
Aber mit Transfer wird es leichter!

Denn vieles, was du jetzt schon kannst, hilft dir auch dort:
- Texte verstehen → Hilft in JEDEM Fach
- Sauber schreiben → Hilft bei JEDER Arbeit
- Gut zuhören → Hilft in JEDER Stunde

**Du fängst nicht bei Null an!**
Du nimmst dein Wissen mit – und wendest es neu an.""",

            "exercise": {
                "title": "Dein Transfer-Moment! ⭐",
                "instruction": "Fülle die Lücken aus:",
                "template": """
**1. Ich bin gut in:** _____________
(z.B. Fußball, Schwimmen, Lego bauen, Malen, Musik...)

**2. Mein besonderer Trick dabei ist:** _____________
(Was machst du, damit es gut klappt?)

**3. Dieser Trick könnte mir auch helfen bei:** _____________
(In welchem Schulfach? Bei welcher Aufgabe?)

**4. Weil:** _____________
(Warum ist es ähnlich?)
""",
                "beispiel_loesung": """
**1. Ich bin gut in:** Lego bauen

**2. Mein besonderer Trick:** Erst die Anleitung lesen, dann Schritt für Schritt bauen

**3. Das hilft mir auch bei:** Textaufgaben in Mathe

**4. Weil:** Auch da muss ich erst genau lesen, was ich machen soll!
""",
                "prompt": "Fülle die Lücken aus:",
            },

            "take_home": """**Das darfst du dir merken:** 🧠

Überflieger sind nicht schlauer als andere.
Sie können ihr Wissen einfach gut ÜBERTRAGEN.

Das Geheimnis: Sie erkennen das Prinzip hinter den Dingen.
Ein Prinzip lernt man einmal.
Dann kann man es überall anwenden.

**Du kannst das auch lernen!**""",

            "fun_fact": """**Wusstest du das?**
Wissenschaftler sagen: Wer gut im Übertragen ist, wird in ALLEN Fächern besser!
Nicht nur in einem – in allen gleichzeitig.
Das ist fast wie eine Superkraft! 🦸""",

            "eltern_tipp": """💡 **Für Eltern:**
Fragen Sie beim Üben: "Kennst du etwas Ähnliches? Wo hast du so etwas schon mal gemacht?"
Das trainiert Transfer ganz automatisch!""",
        },

        "unterstufe": {
            "title": "Das Transfer-Geheimnis",
            "icon": "🔮",

            "hook": """**Warum verstehen manche Leute einfach ALLES?** 🤔

Du kennst sie. Die, bei denen es einfach klickt.
Neue Themen? Kein Problem. Andere Fächer? Auch kein Problem.

Die meisten denken: "Die sind halt schlau."
**Überraschung: Das stimmt nicht.**

Forscher haben das untersucht.
Was sie gefunden haben, ist beeindruckend.""",

            "mythos_buster": """**Der Mythos:** "Entweder man ist schlau oder nicht."

**Die Realität:** Es gibt einen Skill, den fast niemand kennt.
Er heißt **Transfer**.

Transfer = Wissen von einer Situation auf andere übertragen.

Das ist kein Talent. Das ist eine Technik.
Und die kannst du lernen.""",

            "wissenschaft": """**Was sagt die Wissenschaft?**

Forscher haben über 200 Studien ausgewertet.
Effektstärke von Transfer-Strategien: **d=0.86**

Was heißt das?
- Durchschnittliche Lernmethode: d=0.40
- Transfer: d=0.86 = **mehr als doppelt so effektiv!**

Konkret: Wenn du Transfer beherrschst,
lernst du mit dem gleichen Aufwand VIEL mehr.""",

            "alltag_beispiel": """**So funktioniert das im echten Leben:**

Du lernst in Mathe: Gleichungen lösen.
"Was ich links mache, muss ich rechts auch machen."

Dann in Physik: Formeln umstellen.
Moment... das ist ja das GLEICHE Prinzip!

Ohne Transfer: Du lernst beides komplett neu.
Mit Transfer: Du erkennst das Muster und sparst Zeit.

**Ein Prinzip. Zwei Fächer. Doppelter Nutzen.**""",

            "gaming_beispiel": """**Kennst du das aus Games?** 🎮

In Fortnite lernst du: Ressourcen einteilen.
Nicht alles auf einmal ausgeben. Priorisieren.

Und dann merkst du:
Das ist wie Taschengeld einteilen!
Oder Zeit für Hausaufgaben planen!

**Gaming-Skills sind echte Skills.**
Du musst sie nur übertragen.""",

            "story": """**Wie Tom durch Minecraft besser in Erdkunde wurde** 🗺️

Tom liebte Minecraft. Er baute riesige Welten.
Dabei lernte er: Erst erkunden, dann planen, dann bauen.

In Erdkunde sollten sie eine Karte analysieren.
Die anderen starrten ratlos auf das Blatt.

Tom dachte: "Das ist wie eine neue Minecraft-Welt!"
Er erkundete systematisch: Flüsse, Berge, Städte.
Dann plante er seine Antwort. Dann schrieb er.

Seine Lehrerin war beeindruckt.
Tom grinste. Er hatte transferiert.

**Das Prinzip "Erkunden → Planen → Handeln" funktioniert überall.**""",

            "exercise": {
                "title": "Finde deine Transfer-Chancen! 🔍",
                "instruction": "Denk an etwas, das du außerhalb der Schule gut kannst.",
                "template": """
Ich bin gut in: _____________
(Gaming, Sport, Musik, Kunst, Social Media...)

Das Prinzip dabei ist: _____________
(Was ist der Trick? Die Strategie?)

Das könnte mir in der Schule helfen bei: _____________

Weil: _____________
""",
                "beispiele": [
                    "YouTube-Videos schneiden → Präsentationen strukturieren (beides braucht guten Aufbau)",
                    "Social-Media-Trends erkennen → Muster in Geschichte erkennen",
                    "Minecraft-Redstone → Logik in Mathe verstehen",
                ],
            },

            "take_home": """**Das Wichtigste:**

Transfer ist der Unterschied zwischen
"viel lernen" und "smart lernen".

Frag dich bei jedem neuen Thema:
**"Wo hab ich so was Ähnliches schon mal gemacht?"**

Dann bist du auf dem Weg zum Überflieger.""",

            "fun_fact": """**Erstaunlicher Fakt:**
Die erfolgreichsten Leute sind nicht die mit dem meisten Wissen.
Es sind die, die ihr Wissen am besten ANWENDEN können.
Das ist Transfer. Und du lernst es gerade. 💪""",
        },

        "mittelstufe": {
            "title": "Das Transfer-Geheimnis",
            "icon": "🔮",

            "hook": """**Warum sind manche Leute in fast allem gut?** 🤔

Das ist keine rhetorische Frage. Forscher haben das untersucht.
Die Antwort ist überraschend – und sie hat nichts mit IQ zu tun.

Der Unterschied zwischen durchschnittlichen und herausragenden Lernern
liegt nicht im WIE VIEL. Sondern im WIE.

Und dieses WIE hat einen Namen: **Transfer**.""",

            "wissenschaft": """**Die Zahlen sprechen für sich:**

Hattie & Donoghue (2016) haben über 800 Meta-Analysen ausgewertet.
Das sind Daten von Millionen von Lernenden.

**Ergebnis:**
- Transfer-Strategien: **d=0.86**
- Durchschnitt aller Lernmethoden: d=0.40

Was bedeutet das konkret?
Eine Effektstärke von 0.86 entspricht einem Leistungsvorsprung von etwa **1,5 Schuljahren**.

Mit anderen Worten: Wer Transfer beherrscht, lernt so effektiv,
als hätte er anderthalb Jahre Vorsprung.""",

            "definition": """**Was ist Transfer genau?**

Transfer bezeichnet die Fähigkeit, Wissen und Kompetenzen
aus einem Kontext in einen neuen, anderen Kontext zu übertragen.

**Zwei Arten:**
- **Near Transfer:** Zwischen ähnlichen Situationen (leichter)
- **Far Transfer:** Zwischen verschiedenen Domänen (schwieriger, aber wertvoller)

**Der Kern:** Nicht das Wissen selbst ist entscheidend,
sondern die Fähigkeit, das zugrundeliegende PRINZIP zu erkennen und anzuwenden.""",

            "mythos_vs_realitaet": """**Mythos vs. Realität:**

❌ **Mythos:** "Manche Menschen sind einfach vielseitig begabt."
✅ **Realität:** Sie haben gelernt, Muster zu erkennen und zu übertragen.

❌ **Mythos:** "Jedes Fach braucht komplett anderes Wissen."
✅ **Realität:** Viele Prinzipien sind fächerübergreifend anwendbar.

❌ **Mythos:** "Transfer passiert automatisch, wenn man genug lernt."
✅ **Realität:** Transfer muss aktiv trainiert werden – er passiert NICHT von selbst.""",

            "relevanz": """**Warum ist das für DICH relevant?**

1. **Schule:** Weniger Lernaufwand bei besseren Ergebnissen
2. **Prüfungen:** Auch unbekannte Aufgabentypen lösen können
3. **Zukunft:** In einer sich ändernden Welt ist Anpassungsfähigkeit key
4. **KI-Zeitalter:** ChatGPT kann Fakten. Menschen können transferieren.

Transfer ist die Kompetenz, die dich von einer KI unterscheidet.
Und sie ist die Kompetenz, die in Zukunft am meisten zählt.""",

            "beispiel": """**Konkretes Beispiel:**

**Situation:** Du lernst in Physik das Konzept des Gleichgewichts.
Ein System ist im Gleichgewicht, wenn sich entgegengesetzte Kräfte ausgleichen.

**Near Transfer:**
Chemie – Chemisches Gleichgewicht (Le Chatelier)

**Far Transfer:**
- Wirtschaft – Angebot und Nachfrage
- Politik – Gewaltenteilung
- Psychologie – Work-Life-Balance
- Ökosysteme – Räuber-Beute-Verhältnis

**Ein Prinzip. Fünf völlig verschiedene Anwendungen.**""",

            "exercise": {
                "title": "Transfer-Potenzial erkennen",
                "instruction": "Wähle ein Konzept aus dem aktuellen Unterricht und analysiere sein Transfer-Potenzial.",
                "template": """
**Konzept:** _____________
**Fach:** _____________

**Das zugrundeliegende Prinzip:** _____________

**Near Transfer (ähnlicher Kontext):** _____________

**Far Transfer (anderer Bereich):** _____________

**Warum funktioniert der Transfer?** _____________
""",
            },

            "take_home": """**Key Takeaway:**

Transfer ist keine Begabung. Es ist ein trainierbarer Skill.

Effektstärke d=0.86 bedeutet:
Du kannst deine Lerneffizienz mehr als verdoppeln.

**Die Frage ist nicht: "Wie viel weißt du?"
Die Frage ist: "Wie gut kannst du es anwenden?"**""",
        },

        "oberstufe": {
            "title": "Transfer – Die Metakompetenz",
            "icon": "🔮",

            "hook": """**Eine unbequeme Wahrheit über Bildung:**

Das meiste, was du in der Schule lernst, wirst du vergessen.
Studien zeigen: Nach einem Jahr sind 60-80% des Faktenwissens weg.

Aber es gibt etwas, das bleibt: Die Fähigkeit zu transferieren.

Transfer ist keine Lernmethode unter vielen.
Es ist die Kompetenz, die alle anderen Kompetenzen verbindet.
Und sie wird in der Schule kaum explizit gelehrt.""",

            "wissenschaftlicher_hintergrund": """**Der wissenschaftliche Hintergrund:**

**Hattie & Donoghue (2016): "Learning Strategies: A Synthesis and Conceptual Model"**
- Metaanalyse von 228 Studien
- Transfer-Strategien: **d=0.86** (Rang 6 von 252 Faktoren)
- Zum Vergleich: Durchschnitt aller Interventionen d=0.40

**Theoretische Grundlagen:**

1. **Thorndike & Woodworth (1901):** Common-Elements Theory
   - Transfer basiert auf gemeinsamen Elementen zwischen Situationen
   - Je mehr Überlappung, desto leichter der Transfer

2. **Perkins & Salomon (1992):** Hugging & Bridging
   - Hugging: Lernsituationen der Anwendung ähnlich machen
   - Bridging: Explizit Verbindungen zwischen Kontexten herstellen

3. **Barnett & Ceci (2002):** Taxonomie des Transfers
   - Systematisierung von Near und Far Transfer
   - Dimensionen: Wissensdomäne, physischer Kontext, zeitlicher Abstand""",

            "drei_ebenen_modell": """**Hatties Drei-Ebenen-Modell des Lernens:**

**Ebene 1: Surface Learning (Oberflächenlernen)**
- Fakten, Vokabeln, Prozeduren
- Wichtig als Grundlage
- Strategien: Zusammenfassen, Notizen, Mnemoniken

**Ebene 2: Deep Learning (Tiefenlernen)**
- Zusammenhänge verstehen
- Konzeptuelle Strukturen erkennen
- Strategien: Elaboration, Concept Mapping, Selbsterklärung

**Ebene 3: Transfer**
- Wissen auf neue Kontexte anwenden
- Metakognition erforderlich
- Strategien: Analogiebildung, Prinzipienextraktion, Perspektivwechsel

**Kritische Einsicht:**
Die meisten Prüfungen testen Ebene 1 und 2.
Aber im Leben brauchst du vor allem Ebene 3.""",

            "metakognition": """**Transfer und Metakognition:**

Transfer ist ohne Metakognition nicht möglich.
Du musst ÜBER dein Denken nachdenken.

**Die drei metakognitiven Kernprozesse:**

1. **Planen:**
   - Welche Strategie könnte hier funktionieren?
   - Was weiß ich bereits, das relevant sein könnte?

2. **Monitoring:**
   - Funktioniert mein Ansatz?
   - Erkenne ich relevante Muster?

3. **Evaluieren:**
   - Hat der Transfer funktioniert?
   - Was kann ich für die Zukunft lernen?

**Konkretes Beispiel – Mathe-Aufgabe mit Metakognition:**

*Aufgabe: "Finde das Rechteck mit maximalem Flächeninhalt bei gegebenem Umfang."*

**1. Planen (vor dem Lösen):**
"Das ist eine Optimierungsaufgabe. Ich kenne ähnliche aus der Analysis.
Prinzip: Extremwertaufgabe → Ableitung = 0 setzen."

**2. Monitoring (während des Lösens):**
"Ich habe eine Gleichung mit zwei Variablen. Passt das?
Nein – ich brauche eine Nebenbedingung. Der Umfang ist gegeben!"

**3. Evaluieren (nach dem Lösen):**
"Meine Analogie zur Analysis hat funktioniert.
Für die Zukunft: Bei 'maximieren/minimieren' → Extremwertproblem."

**Selbstreflexionsfrage:**
"Denke ich gerade über das Problem nach – oder über mein Denken über das Problem?"
Letzteres ist Metakognition.""",

            "implikationen_abitur": """**Implikationen für das Abitur:**

**Das Problem:**
- Abituraufgaben sind oft neu formuliert
- Reine Reproduktion reicht nicht
- Transfer wird implizit gefordert, aber nicht gelehrt

**Die Lösung:**
- Lerne nicht Aufgabentypen, lerne Prinzipien
- Übe mit unbekannten Aufgaben, nicht nur mit bekannten
- Frag bei jedem Thema: "Was ist das Prinzip? Wo gilt es noch?"

**Praktische Abitur-Strategien:**

**1. Aufgaben nach Prinzipien kategorisieren:**
Beim Lernen nicht fragen "Welches Kapitel?" sondern "Welches Prinzip?"
→ Erstelle eine Prinzip-Sammlung für deine LKs

**2. Systematisches Variieren beim Üben:**
- Gleiche Aufgabe mit anderen Zahlen
- Gleiches Prinzip in anderem Kontext
- Typische Abituraufgabe umformulieren

**3. Transfer-Fragen beim Lernen:**
- "Wo habe ich dieses Prinzip schon gesehen?"
- "In welchem anderen Fach gilt das auch?"
- "Was wäre, wenn die Aufgabe anders gestellt wäre?"

**Strategischer Vorteil:**
Wer Transfer beherrscht, kann auch unbekannte Aufgaben lösen.
Das ist der Unterschied zwischen "gut vorbereitet" und "wirklich kompetent".""",

            "exercise": {
                "title": "Metakognitive Transferanalyse",
                "instruction": "Wähle ein Konzept aus deinem Leistungskurs und analysiere es systematisch.",
                "template": """
**Konzept:** _____________
**Fach:** _____________

**Oberflächenstruktur:**
Was sind die offensichtlichen Merkmale? _____________

**Tiefenstruktur:**
Was ist das zugrundeliegende Prinzip? _____________

**Abstraktionsebenen:**
- Konkret: _____________
- Abstrakt: _____________
- Maximal abstrakt: _____________

**Near Transfer zu:** _____________
**Far Transfer zu:** _____________

**Metakognitive Reflexion:**
- Wie bin ich auf diese Verbindungen gekommen?
- Was hat meinen Denkprozess geleitet?
""",
                "beispiel": """
**BEISPIEL: Gleichungslösen (Mathe LK)**

**Konzept:** Algebraische Gleichungen lösen
**Fach:** Mathematik

**Oberflächenstruktur:**
Variablen (x, y), Zahlen, Gleichheitszeichen, Umformungsregeln, Äquivalenzumformungen

**Tiefenstruktur:**
Das Unbekannte systematisch vom Bekannten isolieren

**Abstraktionsebenen:**
- Konkret: 2x + 5 = 15 lösen → x = 5
- Abstrakt: ax + b = c lösen → x = (c-b)/a
- Maximal abstrakt: "Das Gesuchte von allem anderen trennen"

**Near Transfer zu:** Formeln umstellen in Physik (v = s/t → s = v·t)
**Far Transfer zu:** Variablenisolation bei Optimierungsaufgaben, Analyse von Argumentationsstrukturen (Prämissen von Schlussfolgerung trennen)

**Metakognitive Reflexion:**
- Ich erkannte das Muster "Isolieren" aus früheren Algebra-Aufgaben
- Mein Denkprozess: "Was ist unbekannt? Wie bekomme ich es allein auf eine Seite?"
- Die Abstraktion "Gesuchtes vom Rest trennen" half mir, auch Nicht-Mathe-Probleme zu strukturieren
""",
            },

            "take_home": """**Kernaussage:**

Transfer ist die Brücke zwischen Wissen und Kompetenz.

In einer Welt, in der Fakten jederzeit verfügbar sind,
ist die Fähigkeit zur Anwendung das eigentliche Kapital.

d=0.86 – Das ist nicht nur eine Zahl.
Das ist der Unterschied zwischen Lernen und Verstehen.""",
        },

        "paedagogen": {
            "title": "Transfer – Stand der Forschung",
            "icon": "🔮",

            "einfuehrung": """**Transfer als Kernkompetenz:**

Transfer ist das zentrale Ziel von Bildung – und gleichzeitig ihr größtes ungelöstes Problem.

Hattie (2023) bezeichnet Transfer als "das Kennzeichen tiefen Lernens" und
weist ihm mit d=0.86 eine der höchsten Effektstärken zu.

Dennoch: Transfer wird in den meisten Curricula nicht explizit gelehrt.
Die Forschung zeigt klar: Transfer passiert NICHT automatisch.
Er muss aktiv gefördert werden.""",

            "forschungsstand": """**Übersicht zum Forschungsstand:**

**1. Klassische Theorien:**

**Thorndike & Woodworth (1901): Common-Elements Theory**
- Transfer basiert auf gemeinsamen Elementen zwischen Situationen
- Kritik: Zu mechanistisch, erklärt nicht Far Transfer
- Relevanz: Grundlage für Near Transfer

**Perkins & Salomon (1992): Hugging & Bridging**
- Hugging: Lernsituationen der Anwendung ähnlich gestalten
- Bridging: Explizit Verbindungen zwischen Kontexten herstellen
- Relevanz: Praktische Unterrichtsstrategien

**Barnett & Ceci (2002): Taxonomie des Transfers**
- 6 Dimensionen: Wissensdomäne, physischer Kontext, zeitlicher Abstand,
  funktionaler Kontext, sozialer Kontext, Modalität
- Relevanz: Systematisierung von Near vs. Far Transfer

**2. Aktuelle Meta-Analysen:**

**Hattie & Donoghue (2016): Learning Strategies: A Synthesis and Conceptual Model**
- Über 800 Meta-Analysen (aktuell 1.200+)
- Transfer-Strategien: d=0.86
- Drei-Phasen-Modell: Surface → Deep → Transfer

**Sala & Gobet (2019): Cognitive training does not enhance general cognition**
- Far Transfer ist selten und schwierig
- Kritische Perspektive auf "Gehirntraining"
- Relevanz: Realistische Erwartungen formulieren""",

            "dreiphasenmodell": """**Hatties Drei-Phasen-Modell im Detail:**

**Phase 1: Surface Learning**
- Ziel: Grundlegende Fakten und Prozeduren erwerben
- Effektive Strategien: Zusammenfassen (d=0.79), Unterstreichen (d=0.53),
  Notizen machen (d=0.50), Mnemoniken (d=0.76)
- Wichtig: Grundlage für alles Weitere

**Phase 2: Deep Learning**
- Ziel: Konzeptuelle Zusammenhänge verstehen
- Effektive Strategien: Elaboration (d=0.75), Organisation (d=0.85),
  Selbsterklärung (d=0.64), Concept Mapping (d=0.60)
- Wichtig: Verständnis der Tiefenstruktur

**Phase 3: Transfer**
- Ziel: Wissen auf neue Kontexte anwenden
- Effektive Strategien: Ähnlichkeiten/Unterschiede erkennen (d=1.32),
  Analogien bilden (d=0.84), Problemlösung (d=0.68)
- Kritisch: Metakognition erforderlich

**Didaktische Implikation:**
Strategien müssen zur Lernphase passen.
Analogien in Phase 1 verwirren.
Mnemoniken in Phase 3 reichen nicht.""",

            "metakognition": """**Die Rolle der Metakognition:**

Transfer erfordert Metakognition (Veenman et al., 2006).
Metakognition erklärt 17% der Varianz in Schulleistungen –
unabhängig von Intelligenz.

**Drei Komponenten:**
1. **Metakognitives Wissen:** Wissen über eigenes Denken
2. **Metakognitive Regulation:** Planen, Überwachen, Evaluieren
3. **Metakognitive Erfahrungen:** Bewusstheit während des Denkens

**Förderung im Unterricht:**
- Lautes Denken modellieren
- Reflexionsphasen einbauen
- Strategiewahl explizit thematisieren
- Selbstbewertung fördern""",

            "forschungsfragen": """**Offene Forschungsfragen:**

1. **Wie weit kann Transfer gehen?**
   - Far Transfer bleibt kontrovers
   - Grenzen noch nicht klar definiert

2. **Wie kann Transfer explizit gelehrt werden?**
   - Verschiedene Programme mit unterschiedlichem Erfolg
   - Konsens: Explizites Training wirkt

3. **Welche Rolle spielt Expertise?**
   - Experten transferieren besser
   - Henne-Ei-Problem: Expertise durch Transfer oder Transfer durch Expertise?

4. **Transfer und KI:**
   - Was bleibt menschlich, wenn KI Fakten liefert?
   - Transfer als USP menschlichen Denkens?""",

            "unterrichtssequenz": """**4-Wochen Transfer-Training (Beispiel-Sequenz):**

**Woche 1: Sensibilisierung**
- Montag: Was ist Transfer? (Hattie-Daten vorstellen)
- Mittwoch: Near Transfer erkennen (Übungen innerhalb des Fachs)
- Freitag: Reflexion: "Wo hast du diese Woche transferiert?"

**Woche 2: Near Transfer intensiv**
- Prinzip identifizieren → in 3 Varianten üben
- Fächerübergreifende Partnerarbeit: "Wo gilt dieses Prinzip noch?"
- Lerntagebuch: Transfer-Momente notieren

**Woche 3: Far Transfer einführen**
- Analogie-Training: Struktur-Mapping üben
- Hugging (Gemeinsamkeiten) vs. Bridging (abstrahieren)
- Kreativ-Session: Ungewöhnliche Verbindungen suchen

**Woche 4: Integration & Metakognition**
- Schüler präsentieren eigene Transfer-Beispiele
- Reflexion: "Wie hat sich dein Denken verändert?"
- Checkliste erstellen: "Meine Transfer-Fragen"

**Praxistipp:**
Venn-Diagramm für Analogie-Training nutzen:
Zwei Kreise (Domäne A und B), Überlappung = gemeinsames Prinzip""",

            "schueler_diagnose": """**Typische Transfer-Schwierigkeiten (Diagnose):**

**Typ 1: "Erkennt Muster nicht" (30-40% der Schüler)**
- Symptom: Sieht keine Verbindung zwischen ähnlichen Aufgaben
- Diagnose: Bei Variation der Oberfläche verloren
- Intervention: Explizit Tiefenstruktur herausarbeiten, Kategorisieren üben

**Typ 2: "Findet keine Fächer-Verbindungen" (20-30%)**
- Symptom: "Das ist Mathe, das hat mit Deutsch nichts zu tun"
- Diagnose: Domänendenken, keine Abstraktion
- Intervention: Brückenprinzipien explizit einführen, Team-Teaching

**Typ 3: "Analogien sind falsch" (10-15%)**
- Symptom: Zieht oberflächliche statt strukturelle Parallelen
- Diagnose: Fokus auf irrelevante Merkmale
- Intervention: Struktur-Mapping trainieren, Gegenbeispiele diskutieren

**Typ 4: "Transfer-Training bringt nichts" (10-15%)**
- Symptom: Keine Fortschritte trotz Training
- Diagnose: Oft fehlt Basiswissen oder metakognitive Kompetenz
- Intervention: Erst Surface Learning sicherstellen, dann erneut Transfer

**Checkliste für Unterrichtseinheiten:**
☐ VOR: Ist das Prinzip klar identifiziert?
☐ WÄHREND: Habe ich das Prinzip explizit benannt?
☐ NACH: Gab es Transfer-Reflexion?""",

            "literaturhinweise": """**Weiterführende Literatur:**

**Grundlegend:**
- Hattie, J. (2023). Visible Learning: The Sequel. Routledge.
- Perkins, D. & Salomon, G. (1992). Transfer of Learning. International Encyclopedia of Education.

**Vertiefend:**
- Barnett, S.M. & Ceci, S.J. (2002). When and where do we apply what we learn? A taxonomy for far transfer.
- Bransford, J.D. & Schwartz, D.L. (1999). Rethinking transfer: A simple proposal with multiple implications.

**Kritisch:**
- Sala, G. & Gobet, F. (2019). Cognitive training does not enhance general cognition.""",
        },
    },
}

# ============================================
# PHASE 2: NEAR TRANSFER
# ============================================

PHASE_2_CONTENT = {
    "title": "Near Transfer",
    "icon": "🎯",
    "core_concept": "Transfer zwischen ÄHNLICHEN Situationen – der erste Schritt!",
    
    "altersstufen": {
        "grundschule": {
            "title": "Near Transfer – Ähnliches erkennen",
            "icon": "🎯",

            "hook": """**Hast du das auch schon erlebt?** 🎯

Du lernst etwas Neues – und denkst: "Das kommt mir bekannt vor!"
Zum Beispiel beim Rechnen: Erst 3 + 4, dann 30 + 40.
Oder beim Schreiben: Erst "Hund", dann "Mund".

Das Tolle daran: Du musst nicht alles neu lernen!
Du kannst nutzen, was du schon kannst.

Das nennt man **Near Transfer**.
"Near" ist Englisch und bedeutet "nah".
Du überträgst auf etwas Ähnliches.""",

            "was_ist_near_transfer": """**Was ist Near Transfer genau?**

Near Transfer bedeutet: Du erkennst, dass zwei Dinge ähnlich sind.
Und du nutzt dein Wissen von dem einen für das andere.

Beispiele:
- Du kannst 3 + 4 rechnen? Dann kannst du auch 30 + 40!
- Du kannst "Hund" schreiben? Dann kannst du auch "Mund" schreiben!
- Du kannst langsam Fahrrad fahren? Dann schaffst du es auch schneller!

Das PRINZIP bleibt immer gleich.
Nur die Zahlen oder Wörter ändern sich.""",

            "gaming_beispiel": """**Kennst du das vom Spielen?** 🎲

Stell dir ein Brettspiel vor:
- Erst spielst du eine leichte Runde.
- Dann wird es schwieriger. Aber die Regeln bleiben gleich!

Oder beim Puzzeln:
- Erst machst du ein kleines Puzzle.
- Dann ein größeres. Der Trick ist derselbe: Ecken und Ränder zuerst!

**Der Schlüssel:** Finde heraus, was GLEICH bleibt!""",

            "uebertritt_beispiel": """**So hilft dir das in der Schule:** 📚

In Heimat- und Sachkunde hast du gelernt, wie eine Gemeinde funktioniert:
Bürgermeister, Gemeinderat, Rathaus.

Jetzt lernst du das Thema "Bayern".
Ist das ganz neu? Nein, nicht wirklich!

- Die Gemeinde hat einen Bürgermeister → Bayern hat einen Ministerpräsidenten
- Die Gemeinde hat einen Gemeinderat → Bayern hat einen Landtag
- Die Gemeinde hat ein Rathaus → Bayern hat eine Staatskanzlei

**Das gleiche Prinzip, nur größer!**
Das ist Near Transfer.""",

            "interaktiv": {
                "title": "Finde die Ähnlichkeit! 🔍",
                "intro": "Bei diesen Aufgaben ist das Prinzip gleich:",
                "aufgaben": [
                    {
                        "level_1": "Du rechnest: 5 + 3 = 8",
                        "level_2": "Jetzt rechne: 50 + 30 = ?",
                        "prinzip": "Addieren (Plusrechnen) funktioniert immer gleich!",
                        "antwort": "80",
                        "erklaerung": "Du rechnest genauso, nur mit einer Null mehr. Das Prinzip bleibt!",
                    },
                    {
                        "level_1": "Du schreibst eine Geschichte mit Anfang, Mitte und Ende",
                        "level_2": "Jetzt sollst du einen Bericht schreiben. Was brauchst du auch hier?",
                        "prinzip": "Texte haben immer eine Struktur!",
                        "antwort": "Auch Anfang, Mitte und Ende (Einleitung, Hauptteil, Schluss)",
                        "erklaerung": "Egal ob Geschichte oder Bericht – die Struktur ist gleich!",
                    },
                    {
                        "level_1": "Du lernst Wörter, indem du sie mehrmals schreibst",
                        "level_2": "Jetzt sollst du das Einmaleins lernen. Wie machst du das?",
                        "prinzip": "Wiederholung hilft beim Lernen!",
                        "antwort": "Auch mehrmals üben und wiederholen!",
                        "erklaerung": "Die gleiche Methode funktioniert für verschiedene Sachen.",
                    },
                ],
            },

            "fehler_vermeiden": """**Darauf solltest du achten:** ⚠️

Manchmal denken Kinder: "Das ist ja was ganz anderes!"
Dann fangen sie ganz von vorne an.

Aber halt! Frag dich lieber:
**"Wo habe ich so etwas Ähnliches schon mal gemacht?"**

Meistens findest du etwas.
Und dann wird die Aufgabe viel leichter!""",

            "story": """**Wie Finn die Mathe-Probe schaffte** 📈

Finn übte fleißig Textaufgaben.
Er rechnete: "3 Kinder teilen 12 Gummibärchen. Wie viele bekommt jeder?"

In der Probe stand aber eine andere Aufgabe:
"4 Freunde teilen 20 Sticker. Wie viele bekommt jeder?"

Finn dachte zuerst: "Oh nein! Das habe ich nie geübt!"

Aber dann erinnerte er sich an Transfer.
Er fragte sich: "Was ist das PRINZIP dahinter?"

Das Prinzip war: **Teilen** bedeutet Menge geteilt durch Anzahl.

Also rechnete er: 20 : 4 = 5 Sticker für jeden.

Finn hatte die Sticker-Aufgabe nie geübt.
Aber er kannte das PRINZIP.
Und das hat gereicht! ✅""",

            "exercise": {
                "title": "Dein Near-Transfer-Training! ⭐",
                "instruction": "Finde das gemeinsame Prinzip bei diesen Paaren:",
                "paare": [
                    {"a": "Schwimmen lernen", "b": "Fahrrad fahren lernen", "prinzip": "Am Anfang ist es schwer, aber mit Übung wird es leichter"},
                    {"a": "Lesen üben", "b": "Flöte spielen üben", "prinzip": "Jeden Tag ein bisschen üben bringt am meisten"},
                    {"a": "Zimmer aufräumen", "b": "Schulranzen packen", "prinzip": "Alles hat seinen festen Platz"},
                ],
                "eigene_aufgabe": "Finde selbst zwei Dinge mit dem gleichen Prinzip!",
                "prompt": "Schreibe hier deine Antwort:",
            },

            "take_home": """**Das darfst du dir merken:** 🧠

Near Transfer bedeutet:
Ähnliches erkennen und dein Wissen übertragen.

Frag dich bei neuen Aufgaben immer:
**"Das kenne ich doch irgendwoher!"**

Dann bist du schon auf dem richtigen Weg.""",

            "fun_fact": """**Wusstest du das?**
Alle Profis nutzen Near Transfer!
Fußballspieler übertragen ihre Tricks auf neue Spielsituationen.
Musiker übertragen Rhythmen auf neue Lieder.
Und du? Du kannst das auch! ⚽🎵""",
        },

        "unterstufe": {
            "title": "Near Transfer – Das gleiche Prinzip!",
            "icon": "🎯",

            "hook": """**Kennst du das Gefühl?** 🎯

Neue Aufgabe. Aber irgendwie... kommt dir das bekannt vor?
"Das hab ich doch schon mal gemacht!"

Das ist Near Transfer.
Und es ist eine wichtige Fähigkeit.""",

            "was_ist_near_transfer": """**Near Transfer = Ähnliches erkennen**

"Near" = nah. Du überträgst auf ähnliche Situationen.

Beispiele:
- Gleichung lösen (2x + 5 = 15) → Andere Gleichung (3x + 7 = 22)
- Inhaltsangabe für Geschichte → Inhaltsangabe für Film
- Vokabeln mit Karteikarten → Formeln mit Karteikarten

**Das Prinzip bleibt gleich. Die Details ändern sich.**""",

            "schul_beispiele": """**Near Transfer in der Schule:**

**Mathe:**
- Bruchrechnung → Prozentrechnung (beides ist Teile vom Ganzen)
- Flächenberechnung Rechteck → Flächenberechnung Parallelogramm

**Deutsch:**
- Gedichtanalyse → Liedtextanalyse (gleiche Stilmittel!)
- Argumentation schreiben → Debatte führen

**Sprachen:**
- Englisch-Grammatik → Französisch-Grammatik (ähnliche Strukturen)
- Vokabel-Lernmethode → Für JEDE Sprache nutzbar""",

            "gaming_connection": """**Near Transfer im Gaming:** 🎮

Level 1 geschafft? Level 2 ist ähnlich, nur schwerer.
Du musst nicht neu lernen – du TRANSFERIERST.

- Mario Kart: Leichte Strecke → Schwere Strecke (gleiche Steuerung)
- Fortnite: Normaler Modus → Arena (gleiche Skills, mehr Druck)
- Minecraft: Kleines Haus → Großes Haus (gleiches Prinzip)

**In der Schule ist es genauso!**""",

            "interaktiv": {
                "title": "Spot the Transfer! 🔍",
                "intro": "Welches Prinzip verbindet diese Paare?",
                "aufgaben": [
                    {
                        "situation_a": "Gleichung lösen: x isolieren",
                        "situation_b": "Formel umstellen: gesuchte Größe isolieren",
                        "prinzip": "Immer die gesuchte Variable alleine auf eine Seite bringen",
                    },
                    {
                        "situation_a": "Buchvorstellung vorbereiten",
                        "situation_b": "Referat in Bio vorbereiten",
                        "prinzip": "Struktur: Einleitung, Hauptteil, Schluss + Visualisierung",
                    },
                    {
                        "situation_a": "Im Fußball: Spielzüge analysieren",
                        "situation_b": "In Geschichte: Kriegsstrategien analysieren",
                        "prinzip": "Ursache-Wirkung verstehen, Taktik erkennen",
                    },
                ],
            },

            "fehler_vermeiden": """**Typischer Fehler:** ⚠️

"Das ist ein ANDERES Thema, also muss ich neu anfangen."

**Nope!** Frag dich immer:
- Was ist hier GLEICH wie vorher?
- Welche Methode hat schon mal funktioniert?

Meistens findest du was.
Und dann sparst du richtig Zeit.""",

            "exercise": {
                "title": "Dein Near-Transfer-Check! ✅",
                "instruction": "Nimm ein aktuelles Thema aus der Schule. Finde den Near Transfer!",
                "template": """
Aktuelles Thema: _____________
Fach: _____________

Das ist ähnlich wie: _____________
(anderes Thema, vielleicht anderes Fach)

Das gemeinsame Prinzip ist: _____________

Diese Methode nutze ich für beides: _____________
""",
            },

            "take_home": """**Merksatz:**

Near Transfer = Muster erkennen.

Wenn etwas neu aussieht, frag:
**"Was ist hier eigentlich GLEICH wie bei dem, was ich schon kann?"**

Das ist der erste Schritt zum Überflieger.""",
        },

        "mittelstufe": {
            "title": "Near Transfer – Strukturelle Ähnlichkeit",
            "icon": "🎯",

            "hook": """**Das Oberflächliche täuscht.** 🎯

Zwei Aufgaben können völlig unterschiedlich AUSSEHEN –
und trotzdem die GLEICHE Struktur haben.

Experten erkennen das. Anfänger nicht.
Der Unterschied? Sie schauen auf verschiedene Ebenen.""",

            "theorie": """**Die zwei Ebenen jeder Aufgabe:**

**1. Oberflächenstruktur:**
- Das Thema, die Begriffe, der Kontext
- Was sofort ins Auge springt
- Oft irreführend!

**2. Tiefenstruktur:**
- Das zugrundeliegende Prinzip
- Die Lösungsstrategie
- Die mathematische/logische Struktur

**Der Schlüssel zum Near Transfer:**
Ignoriere die Oberfläche. Suche die Tiefenstruktur.""",

            "beispiele": """**Beispiele für versteckte Ähnlichkeiten:**

**Mathematik:**
| Oberfläche (verschieden) | Tiefenstruktur (gleich) |
|--------------------------|-------------------------|
| Quadratische Gleichung lösen | Nullstellen einer Parabel | abc-Formel |
| Prozentrechnung | Zinsrechnung | Anteil vom Ganzen |
| Pythagoras im Dreieck | Abstand zweier Punkte | a² + b² = c² |

**Deutsch/Sprachen:**
| Oberfläche (verschieden) | Tiefenstruktur (gleich) |
|--------------------------|-------------------------|
| Gedichtanalyse | Redeanalyse | Stilmittel + Intention |
| Englisch Passiv | Deutsch Passiv | Subjekt-Objekt-Tausch |
| Erörterung | Debatte | These + Argumente + Fazit |

**Naturwissenschaften:**
| Oberfläche (verschieden) | Tiefenstruktur (gleich) |
|--------------------------|-------------------------|
| pH-Wert (Chemie) | Dezibel (Physik) | Logarithmische Skala |
| Zellteilung (Bio) | Exponentielles Wachstum (Mathe) | Verdopplung |
| Energieerhaltung | Massenerhaltung | Erhaltungssatz |""",

            "strategie": """**So trainierst du Near Transfer:**

**Schritt 1: Kategorisieren statt auswendig lernen**
Frag bei jeder Aufgabe: "Welcher TYP von Aufgabe ist das?"

**Schritt 2: Prinzipien formulieren**
Schreib das Lösungsprinzip in eigenen Worten auf.
Nicht die Lösung. Das PRINZIP.

**Schritt 3: Verbindungen suchen**
"Wo habe ich dieses Prinzip schon mal gesehen?"

**Schritt 4: Bewusst variieren**
Übe das gleiche Prinzip mit verschiedenen Oberflächen.""",

            "warnung": """**Achtung: Typische Falle!** ⚠️

Viele Schüler lernen Aufgaben statt Prinzipien.
Sie können Aufgabe 3 aus dem Buch.
Aber eine leicht veränderte Version? Keine Chance.

**Das Problem:** Sie haben die Oberfläche gelernt, nicht die Struktur.

**Die Lösung:** Frag dich immer:
"Könnte ich das auch lösen, wenn die Zahlen/Namen/Kontexte anders wären?"

Wenn nein: Du hast noch nicht das Prinzip verstanden.""",

            "exercise": {
                "title": "Tiefenstruktur-Analyse",
                "instruction": "Finde die gemeinsame Tiefenstruktur dieser Aufgabenpaare:",
                "aufgaben": [
                    {
                        "aufgabe_a": "Berechne die Fläche eines Trapezes mit a=5, c=3, h=4",
                        "aufgabe_b": "Berechne den Durchschnitt der Zahlen 5, 5, 3, 3",
                        "tipp": "Beide verwenden das Konzept des Mittelwerts...",
                        "loesung": """**Tiefenstruktur:** Mittelwert berechnen

**Trapez:** A = (a+c)/2 × h = (5+3)/2 × 4 = 4 × 4 = 16
→ Der Durchschnitt der parallelen Seiten wird mit der Höhe multipliziert.

**Zahlen:** (5+5+3+3)/4 = 16/4 = 4
→ Oder vereinfacht: (5+3)/2 = 4

**Gemeinsames Prinzip:** "Zwei Werte mitteln" ist die Kernoperation bei beiden Aufgaben.""",
                    },
                    {
                        "aufgabe_a": "Analysiere die Metaphern in Goethes Gedicht",
                        "aufgabe_b": "Analysiere die Werbetechniken in diesem Spot",
                        "tipp": "Beide fragen nach Stilmitteln und ihrer Wirkung...",
                        "loesung": """**Tiefenstruktur:** Stilmittel identifizieren und Wirkung analysieren

**Gedicht:** Metaphern → erzeugen emotionale Bilder → Wirkung auf Leser

**Werbung:** Techniken (z.B. Wiederholung, Testimonials) → erzeugen Kaufimpuls → Wirkung auf Zuschauer

**Gemeinsames Prinzip:** "Ein Ausdrucksmittel hat eine beabsichtigte Wirkung auf den Empfänger."
Analyse-Schema: 1. Mittel identifizieren → 2. Wirkung beschreiben → 3. Intention erklären""",
                    },
                ],
            },

            "take_home": """**Merksatz:**

Near Transfer = Tiefenstruktur erkennen.

Experten sehen Muster, wo Anfänger nur Unterschiede sehen.
Train dein Auge für Strukturen, nicht für Oberflächen.""",
        },

        "oberstufe": {
            "title": "Near Transfer – Strukturelle Analogien",
            "icon": "🎯",

            "theorie": """**Theoretischer Rahmen:**

Nach Thorndike & Woodworth (1901) basiert Transfer auf
gemeinsamen Elementen zwischen Ausgangs- und Zielsituation.

**Je mehr Elemente überlappen, desto wahrscheinlicher der Transfer:**
- Gleiche Prozeduren
- Ähnliche Kontexte
- Verwandte Konzepte
- Zeitliche Nähe zum Lernen

**Das Problem der oberflächlichen Ähnlichkeit:**
Lernende werden oft von irrelevanten Oberflächenmerkmalen abgelenkt.
Experten hingegen erkennen die strukturelle Tiefe.""",

            "experten_vs_novizen": """**Was unterscheidet Experten von Novizen?**

**Chi, Feltovich & Glaser (1981):** Kategorisierungsstudie

Physik-Aufgaben sollten sortiert werden.
- **Novizen:** Sortierten nach Oberfläche (Aufgaben mit Rampen, mit Federn...)
- **Experten:** Sortierten nach Prinzipien (Energieerhaltung, Newton 2...)

**Die Implikation:**
Experten haben ein anderes mentales Schema.
Sie sehen Prinzipien, wo Novizen nur Oberflächen sehen.

**Für dich:**
Trainiere, Aufgaben nach Prinzipien zu kategorisieren.
Das ist der Weg vom Novizen zum Experten.""",

            "fachuebergreifend": """**Near Transfer in der Oberstufe:**

**Mathematik ↔ Physik:**
| Mathe-Konzept | Physik-Anwendung |
|---------------|------------------|
| Differentialrechnung | Momentangeschwindigkeit |
| Integralrechnung | Fläche unter v-t-Graph |
| Vektorrechnung | Kräftezerlegung |
| Exponentialfunktion | Radioaktiver Zerfall |

**Deutsch ↔ Geschichte/PoWi:**
| Deutsch-Kompetenz | Transfer |
|-------------------|----------|
| Quellenanalyse | Historische Quellenarbeit |
| Argumentationsstruktur | Politische Analyse |
| Stilmittel erkennen | Propaganda analysieren |

**Biologie ↔ Chemie:**
| Bio-Konzept | Chemie-Konzept |
|-------------|----------------|
| Enzyme | Katalyse |
| Osmose | Diffusion |
| Zellatmung | Redoxreaktion |""",

            "strategie": """**Strategien für systematischen Near Transfer:**

**1. Prinzipien-Inventar anlegen**
Führe eine Liste der Kernprinzipien pro Fach.
Suche aktiv nach Überschneidungen.

**2. Aufgabentypen kategorisieren**
Nicht: "Das ist Aufgabe 5 aus Kapitel 3"
Sondern: "Das ist ein Optimierungsproblem unter Nebenbedingungen"

**3. Lösungsstrategien abstrahieren**
Nicht: "Hier muss ich die abc-Formel anwenden"
Sondern: "Hier muss ich Nullstellen finden"

**4. Bewusst variieren**
Übe das gleiche Prinzip in verschiedenen Kontexten.
Das trainiert strukturelles Denken.""",

            "exercise": {
                "title": "Prinzipien-Mapping über Fächer",
                "instruction": "Wähle ein Kernprinzip und finde strukturelle Entsprechungen in mindestens 4 Fächern.",
                "template": """
**Gewähltes Prinzip:** _____________

**Anwendung in Mathe:** _____________
Wie zeigt sich das Prinzip hier? _____________

**Anwendung in Naturwissenschaft:** _____________
Wie zeigt sich das Prinzip hier? _____________

**Anwendung in Geisteswissenschaft:** _____________
Wie zeigt sich das Prinzip hier? _____________

**Anwendung in Sprache:** _____________
Wie zeigt sich das Prinzip hier? _____________

**Gemeinsame Tiefenstruktur:** _____________
""",
            },

            "take_home": """**Fazit:**

Near Transfer ist trainierbar.
Der Schlüssel: Strukturelles Denken entwickeln.

Frag bei jeder Aufgabe: "Welches Prinzip steckt dahinter?"
Frag bei jedem Prinzip: "Wo gilt das noch?"

Das macht den Unterschied zwischen Wissen und Verstehen.""",
        },

        "paedagogen": {
            "title": "Near Transfer im Unterricht fördern",
            "icon": "🎯",

            "strategien_hugging": """**Strategie 1: Hugging (Perkins & Salomon)**

Hugging bedeutet: Lernsituationen so gestalten, dass sie der späteren
Anwendungssituation möglichst ähnlich sind.

**Prinzipien:**
1. Authentische Probleme verwenden
2. Kontextreiche Aufgaben stellen
3. Anwendungssituationen simulieren
4. Transferierte Situationen in Prüfungen abfragen

**Konkrete Umsetzung:**
- Statt: "Berechne 3x + 5 = 14"
- Besser: "Du willst dir ein Spiel kaufen. Es kostet X Euro..."

**Statt:** Abstrakte Grammatikübungen
**Besser:** Fehlerhafte Texte korrigieren lassen

**Statt:** Formel anwenden
**Besser:** Experiment durchführen, bei dem die Formel gilt""",

            "strategien_bridging": """**Strategie 2: Bridging (Perkins & Salomon)**

Bridging bedeutet: Explizit Brücken zwischen Kontexten bauen.

**Leitfragen für Schüler:**
- "Wo hast du so etwas Ähnliches schon mal gesehen?"
- "In welchem anderen Fach gilt dieses Prinzip auch?"
- "Wo im Alltag begegnest du diesem Muster?"

**Konkrete Umsetzung:**

**Am Ende jeder Einheit:**
"Was ist das Prinzip, das wir gelernt haben?
Wo könnte es noch gelten?"

**Bei neuem Stoff:**
"Das ist ähnlich wie... Wer erkennt die Verbindung?"

**Fächerübergreifende Projekte:**
Explizit die Verbindungen zwischen den Fächern thematisieren.""",

            "vergleichende_analyse": """**Strategie 3: Vergleichende Analyse**

Systematischer Vergleich fördert strukturelles Denken.

**Technik: Venn-Diagramm**
- Was ist gleich? (Überlappung)
- Was ist verschieden? (Außenbereiche)
- Was ist das gemeinsame Prinzip?

**Beispiel Mathematik:**
Quadratische Gleichungen vs. Parabel-Nullstellen
- Unterschied: Formulierung, Kontext
- Gemeinsamkeit: Gleiche Lösungsmethode

**Beispiel Geschichte:**
Französische Revolution vs. Russische Revolution
- Unterschiede: Zeit, Ort, Akteure
- Gemeinsamkeiten: Strukturelle Muster (Unzufriedenheit, Eskalation, Radikalisierung)""",

            "kategorisierung": """**Strategie 4: Prinzipienbasierte Kategorisierung**

Nach Chi et al. (1981): Experten kategorisieren nach Tiefenstruktur,
Novizen nach Oberflächenmerkmalen.

**Training:**
1. Aufgabensammlung erstellen
2. Schüler bitten, diese zu sortieren
3. Sortierung besprechen: Nach Oberfläche oder Struktur?
4. Prinzipienbasierte Kategorien einführen

**Beispiel Physik:**
- Novizen: "Aufgaben mit Rampen", "Aufgaben mit Federn"
- Experten: "Energieerhaltung", "Impulserhaltung", "Newton 2"

**Konkret im Unterricht:**
"Welcher AUFGABENTYP ist das?" (nicht: "Welche Formel?")
"Was ist das PRINZIP dahinter?" (nicht: "Was steht im Buch?")""",

            "uebungsdesign": """**Strategie 5: Transfer-orientiertes Übungsdesign**

**Variierte Übung:**
Das gleiche Prinzip in verschiedenen Kontexten üben.

Statt: 10 identische Aufgaben
Besser: 5 Aufgaben mit variierender Oberfläche, gleichem Prinzip

**Interleaved Practice:**
Verschiedene Aufgabentypen mischen statt blocken.

Forschung zeigt: Kurzfristig schwieriger, langfristig besser für Transfer.

**Elaborative Interrogation:**
Warum funktioniert das? Warum ist das so?

Diese Fragen fördern tiefes Verständnis und damit Transfer.""",

            "checkliste": """**Checkliste für transferförderlichen Unterricht:**

☐ Werden Prinzipien explizit benannt?
☐ Werden Verbindungen zu anderen Themen/Fächern hergestellt?
☐ Werden Aufgaben variiert (gleiche Struktur, andere Oberfläche)?
☐ Werden Schüler gefragt: "Wo gilt das noch?"
☐ Wird Kategorisierung nach Prinzipien geübt?
☐ Sind Prüfungsaufgaben auf Transfer ausgelegt?
☐ Wird Metakognition thematisiert?
☐ Werden authentische Anwendungskontexte verwendet?""",
        },
    },
}

# ============================================
# PHASE 3: FAR TRANSFER
# ============================================

PHASE_3_CONTENT = {
    "title": "Far Transfer",
    "icon": "🚀",
    "core_concept": "Transfer zwischen VERSCHIEDENEN Situationen – hier wird's spannend!",
    
    "altersstufen": {
        "grundschule": {
            "title": "Far Transfer – Weit übertragen",
            "icon": "🚀",

            "hook": """**Jetzt wird es richtig spannend!** 🚀

Bei Near Transfer hast du gelernt: Ähnliches erkennen.
Das war wie kleine Puzzleteile finden.

Jetzt kommt Far Transfer!
"Far" ist Englisch und bedeutet "weit".

Far Transfer heißt: Du nutzt dein Wissen in GANZ ANDEREN Bereichen.
Zum Beispiel: Was du beim Backen lernst, hilft dir in Mathe!

Klingt seltsam? Ist es aber nicht!
Das können richtige Überflieger.""",

            "was_ist_far_transfer": """**Was ist Far Transfer genau?**

Far Transfer bedeutet: Du überträgst dein Wissen auf etwas, das ganz anders aussieht.

Das ist schwieriger als Near Transfer.
Aber es ist auch viel mächtiger!

Beispiele:
- Du planst beim Schachspielen voraus → Das hilft dir auch, eine Probe vorzubereiten
- Du lernst beim Fußball im Team zu spielen → Das hilft dir bei der Gruppenarbeit
- Du bist geduldig beim Angeln → Das hilft dir auch beim Lernen schwieriger Sachen""",

            "gaming_beispiel": """**Was du beim Spielen lernst, hilft dir in der Schule!** 🎲📚

Beim Brettspiel oder Puzzle lernst du:

1. **"Erst überlegen, dann handeln."**
   → Das hilft auch beim Aufsatz: Erst überlegen, dann schreiben!

2. **"Nicht aufgeben, wenn es schwer wird."**
   → Das hilft bei schweren Mathe-Aufgaben!

3. **"Die Regeln gut lesen."**
   → Das hilft auch bei Textaufgaben: Genau lesen, was gefragt ist!

4. **"Einen Plan B haben."**
   → Das hilft überall: Was machst du, wenn der erste Weg nicht klappt?

Was du beim Spielen lernst, sind echte Lebensweisheiten!""",

            "erstaunliches_beispiel": """**Ein erstaunliches Beispiel:**

Ein Mädchen war sehr gut im Tanzen.
Sie hatte gelernt: Große Bewegungen in kleine Schritte zerlegen.

Dann hatte sie Schwierigkeiten mit langen Wörtern in Deutsch.
Sie überlegte: "Moment mal – das ist ja wie beim Tanzen!"

Sie zerlegte die langen Wörter in kleine Teile.
Wie Tanzschritte: "Don-ners-tag", "Schmet-ter-ling"

**Vom Tanzen zur Rechtschreibung!**
Das ist Far Transfer. Erstaunlich, oder?""",

            "story": """**Wie Lina durchs Backen besser in Mathe wurde** 🍰📊

Lina half ihrer Oma beim Kuchenbacken.
Oma sagte: "Heute machen wir das Doppelte. Wir haben ja Besuch."

- 2 Eier wurden zu 4 Eiern
- 250g Mehl wurden zu 500g Mehl
- 100ml Milch wurden zu 200ml Milch

Lina verstand: "Ich nehme immer alles mal 2!"

Am nächsten Tag in der Schule: Mathe. Thema Verdoppeln.
Lina musste lächeln.
"Das ist ja wie beim Kuchenbacken!"

Sie löste alle Aufgaben richtig.

Dann kam eine schwere Aufgabe zum Halbieren.
Lina überlegte... "Beim Backen halbieren wir das Rezept manchmal auch..."
Sie hatte es verstanden!

**Vom Backen zur Mathe und wieder zurück!**
Das ist die Kraft von Far Transfer.""",

            "prinzipien_finden": """**So findest du Möglichkeiten für Far Transfer:** 🔍

Frag dich bei allem, was du lernst:
**"Was ist der Trick dahinter?"**

Dann frag:
**"Wo könnte dieser Trick noch helfen?"**

Beispiele:
| Das lernst du | Der Trick dahinter | Das hilft auch bei |
|--------------|-------------|---------------|
| Teilen in Mathe | "Alles gerecht aufteilen" | Süßigkeiten mit Freunden teilen |
| Geschichten lesen | "Anfang – Mitte – Ende" | Eigene Geschichten schreiben |
| Vokabeln lernen | "Oft wiederholen" | Gedichte auswendig lernen |
""",

            "uebertritt_beispiel": """**Das hilft dir auf der neuen Schule:** 🎒

In der neuen Schule lernst du ganz neue Fächer.
Zum Beispiel Englisch oder Geschichte.

Aber viele Tricks kennst du schon!

- In Sachkunde hast du gelernt, Texte zu verstehen → Das hilft auch in Geschichte
- In Deutsch hast du gelernt, Geschichten zu schreiben → Das hilft auch bei englischen Texten
- In Mathe hast du gelernt, Schritt für Schritt zu rechnen → Das hilft auch in Physik

**Dein Wissen aus der Grundschule ist dein Schatz für die neue Schule!**""",

            "exercise": {
                "title": "Deine Far-Transfer-Aufgabe! ⭐",
                "instruction": "Das ist eine Herausforderung – aber du schaffst das!",
                "aufgaben": [
                    {
                        "quelle": "Beim Puzzle spielen lernst du: Erst die Ecken und Ränder suchen.",
                        "frage": "Wo könnte dir dieser Trick noch helfen?",
                        "tipp": "Denk daran: Zuerst das Einfache machen, dann das Schwere...",
                        "moegliche_antworten": [
                            "Bei den Hausaufgaben: Erst die leichten Aufgaben machen!",
                            "Beim Aufräumen: Erst den Boden frei räumen!",
                            "Beim Lesen: Erst die kurzen Wörter lesen!",
                        ],
                    },
                    {
                        "quelle": "Beim Fußball lernst du: Nicht immer selbst schießen. Manchmal abspielen!",
                        "frage": "Wo könnte dir dieser Trick noch helfen?",
                        "tipp": "Denk an: Zusammenarbeiten, nicht alles alleine machen...",
                        "moegliche_antworten": [
                            "Bei der Gruppenarbeit: Aufgaben aufteilen!",
                            "Zu Hause: Geschwister um Hilfe bitten!",
                            "Bei den Hausaufgaben: Nachfragen, wenn du etwas nicht verstehst!",
                        ],
                    },
                ],
                "eigene_aufgabe": """
**Jetzt bist du dran!**

**1. Etwas, das ich gerne in meiner Freizeit mache:** _____________
(z.B. Fußball, Schwimmen, Malen, Tanzen, Lesen, Basteln...)

**2. Der Trick, den ich dabei gelernt habe:** _____________
(Was macht dich dabei gut? Was ist dein Geheimnis?)

**3. Das könnte mir in der Schule helfen bei:** _____________
(Bei welchem Fach? Bei welcher Aufgabe?)
""",
                "prompt": "Fülle die Lücken aus:",
            },

            "take_home": """**Das darfst du dir merken:** 🧠

Far Transfer bedeutet: Dein Wissen überall nutzen.

Beim Spielen, beim Sport, bei deinen Hobbys –
überall lernst du etwas.
Und das hilft dir auch in der Schule!

**Finde den Trick. Nutze ihn überall.**""",

            "fun_fact": """**Wusstest du das?**
Die klügsten Menschen der Welt sind gut in Far Transfer.
Albert Einstein liebte Musik und verband sie mit Physik.
Leonardo da Vinci verband Kunst mit Wissenschaft.
Und du? Du kannst auch Verbindungen finden! 🌟""",
        },

        "unterstufe": {
            "title": "Far Transfer – Big Brain Move!",
            "icon": "🚀",

            "hook": """**Jetzt wird es noch spannender!** 🚀

Near Transfer: Ähnliches erkennen. Verstanden.
Far Transfer: KOMPLETT VERSCHIEDENE Sachen verbinden.

Das klingt ungewöhnlich. Ist aber der Profi-Schritt.
Die Leute, die das können, sind die echten Überflieger.""",

            "was_ist_far_transfer": """**Far Transfer = Weit übertragen**

Du nimmst ein Prinzip aus einem Bereich...
...und nutzt es in einem VÖLLIG anderen Bereich.

Beispiele:
- Strategie aus Schach → Planen für Klassenarbeit
- Teamwork aus Fußball → Gruppenarbeit in der Schule
- Timing aus Musik → Timing beim Präsentieren
- Kochen nach Rezept → Experimente in Chemie

**Unterschiedliche Welten. Gleiches Prinzip.**""",

            "mind_blowing_beispiel": """**Das eindrucksvollste Beispiel:** 🤯

Ein Mädchen war richtig gut im Tanzen.
Sie hatte gelernt: Komplizierte Moves in kleine Schritte zerlegen.

Dann hatte sie Probleme mit langen Texten in Deutsch.
Sie dachte: "Moment... wie beim Tanzen!"

Sie zerlegte den Text in kleine Teile.
Analysierte jeden Teil einzeln.
Setzte dann alles zusammen.

**Tanzen → Textanalyse!**
Völlig verschiedene Welten. Gleiches Prinzip.
Das ist Far Transfer.""",

            "gaming_zu_schule": """**Von Gaming zur Schule:** 🎮📚

**Minecraft:**
- "Erst Ressourcen sammeln, dann bauen"
- → Erst recherchieren, dann Aufsatz schreiben

**Roblox:**
- "Verschiedene Strategien ausprobieren"
- → Verschiedene Lösungswege in Mathe testen

**Fortnite:**
- "Zone beachten, Zeit managen"
- → Zeitmanagement bei Klassenarbeiten

**YouTube:**
- "Gutes Thumbnail = Aufmerksamkeit"
- → Gute Einleitung = Aufmerksamkeit beim Referat""",

            "prinzipien_bibliothek": """**Universelle Prinzipien, die ÜBERALL funktionieren:**

| Prinzip | Gaming-Beispiel | Schul-Beispiel |
|---------|-----------------|----------------|
| "Erst erkunden, dann handeln" | Neue Map erkunden | Aufgabe erst lesen, dann lösen |
| "Übung macht den Meister" | Skills grinden | Vokabeln wiederholen |
| "Aus Fehlern lernen" | Nach Tod analysieren | Fehler in Arbeit verstehen |
| "Teile und herrsche" | Boss in Phasen | Großes Projekt in Schritte |
| "Ressourcen managen" | Inventar organisieren | Zeit einteilen |
""",

            "story": """**Wie Lisa durch Kochen Chemie verstand** 🧪🍰

Lisa hasste Chemie. "Zu abstrakt!"
Aber sie liebte Backen.

Ihr Lehrer erklärte chemische Reaktionen.
Lisa dachte: "Moment... das ist wie Backen!"

- Zutaten = Edukte
- Mischen + Hitze = Reaktion
- Kuchen = Produkt
- Rezept = Reaktionsgleichung

Plötzlich machte Chemie Sinn.
Sie hatte das Prinzip übertragen.

**Backen → Chemie.** Far Transfer.""",

            "exercise": {
                "title": "Dein Far-Transfer-Experiment! 🔬",
                "instruction": "Das ist die Königsdisziplin. Trau dich!",
                "template": """
Etwas, das ich AUSSERHALB der Schule liebe:
_____________

Das Prinzip/der Trick dabei:
_____________

Ein Schulfach, das damit NULL zu tun hat:
_____________

Wie könnte das Prinzip dort trotzdem helfen?
_____________
""",
                "beispiel": """
Hobby: **Fußball spielen**
Prinzip: **Position halten, aber flexibel reagieren**
Schulfach: **Deutsch - Argumentation**
Transfer: **Meine Hauptthese (Position) halten, aber auf Gegenargumente reagieren!**
""",
            },

            "take_home": """**Der Big-Brain-Merksatz:**

Far Transfer = Prinzipien sind universal.

Was du beim Gaming, Sport, Musik lernst –
das sind ECHTE Skills für ECHTE Situationen.

**Finde das Prinzip. Nutze es überall.**""",
        },

        "mittelstufe": {
            "title": "Far Transfer – Domänenübergreifend denken",
            "icon": "🚀",

            "hook": """**Die Königsdisziplin.** 🚀

Near Transfer ist wichtig. Aber Far Transfer ist mächtig.

Wenn du Prinzipien aus der Physik in der Psychologie anwendest.
Wenn Gaming-Strategien dir bei Verhandlungen helfen.
Wenn Musik dein Mathe-Verständnis verbessert.

Das ist Far Transfer. Und es ist schwer – aber trainierbar.""",

            "wissenschaft": """**Was sagt die Forschung?**

Barnett & Ceci (2002) haben Far Transfer systematisch untersucht.
Ergebnis: Er ist selten – aber wenn er gelingt, extrem wertvoll.

**Warum ist Far Transfer schwierig?**
1. Die Oberflächen sind KOMPLETT unterschiedlich
2. Das Prinzip ist stärker abstrahiert
3. Man muss aktiv nach Verbindungen suchen

**Warum lohnt es sich trotzdem?**
- Kreativität entsteht durch ungewöhnliche Verbindungen
- Innovation = Far Transfer
- Problemlösung in neuen Situationen""",

            "realitaets_check": """**Realitäts-Check: Far Transfer ist selten!** ⚠️

❌ **Mythos:** "Wenn ich gut im Schachspielen bin, werde ich auch besser im logischen Denken."
✅ **Realität:** Sala & Gobet (2019) zeigen: Far Transfer bei kognitivem Training ist ~0%.

**Was bedeutet das für dich?**
- Near Transfer funktioniert oft und zuverlässig
- Far Transfer braucht gezieltes, explizites Training
- Nicht frustriert sein, wenn es nicht "automatisch" klappt

**Die gute Nachricht:**
Mit den richtigen Strategien (Abstraktion, Analogien) kannst du Far Transfer trainieren.
Es ist schwer – aber möglich!""",

            "beispiele": """**Far Transfer in Action:**

**Von Musik zu Mathematik:**
- Rhythmus = Brüche und Verhältnisse
- Harmonie = mathematische Frequenzverhältnisse
- Komposition = Strukturaufbau

**Von Sport zu Lernen:**
- Periodisierung im Training → Spaced Repetition
- Technik vor Kraft → Verständnis vor Auswendiglernen
- Regeneration → Schlaf und Pausen beim Lernen

**Von Gaming zu Projektmanagement:**
- Quest-Struktur → Aufgaben in Teilziele zerlegen
- Skill Trees → Lernpfade planen
- Boss-Strategien → Komplexe Probleme angehen

**Von Kochen zu Wissenschaft:**
- Rezept = Protokoll
- Variablen kontrollieren = Zutaten genau abmessen
- Hypothese testen = Neues Rezept ausprobieren""",

            "abstraktion": """**Der Schlüssel: Abstraktion**

Je abstrakter du ein Prinzip formulierst,
desto weiter kannst du es transferieren.

**Beispiel – Eskalation der Abstraktion:**

Konkret: "In Mathe isoliere ich x auf eine Seite."
↓
Abstrakter: "Ich bringe das Gesuchte alleine auf eine Seite."
↓
Noch abstrakter: "Ich isoliere die unbekannte Variable."
↓
Maximal abstrakt: "Ich trenne das Relevante vom Rest."

**Je höher die Abstraktionsebene, desto mehr Anwendungen:**
- Mathe: Variable isolieren
- Chemie: Stoff extrahieren
- Deutsch: Kernaussage herausarbeiten
- Alltag: Das Wesentliche vom Unwichtigen trennen""",

            "kreativitaet": """**Far Transfer und Kreativität:**

Die kreativsten Ideen entstehen durch ungewöhnliche Verbindungen.

**Steve Jobs:** Kombinierte Kalligraphie + Computer = Mac-Typografie
**Einstein:** Kombinierte Philosophie + Physik = Relativitätstheorie
**Spotify:** Kombinierte Radio + Internet + Algorithmen = Musik-Streaming

**Deine Chance:**
Je mehr verschiedene Bereiche du kennst,
desto mehr Verbindungen kannst du herstellen.

Hobbys sind keine Zeitverschwendung.
Sie sind Transfer-Ressourcen.""",

            "exercise": {
                "title": "Far-Transfer-Labor",
                "instruction": "Wähle ein Prinzip und transferiere es maximal weit.",
                "template": """
**Ausgangsprinzip aus Bereich A:** _____________

**Abstrakte Formulierung des Prinzips:** _____________

**Transfer zu Bereich B (komplett anders):** _____________

**Wie funktioniert es dort?** _____________

**Transfer zu Bereich C (noch anders):** _____________

**Was ist die gemeinsame Essenz?** _____________
""",
                "beispiel": """
**BEISPIEL: Schachstrategie → Lernen → Alltag**

**Ausgangsprinzip aus Bereich A (Schach):**
"Knappe Bedenkzeit optimal auf wichtige Züge verteilen"

**Abstrakte Formulierung des Prinzips:**
"Begrenzte Ressourcen strategisch auf Prioritäten verteilen"

**Transfer zu Bereich B (Lernen):**
"Lernzeit auf schwierige Fächer konzentrieren, statt gleichmäßig zu verteilen"

**Wie funktioniert es dort?**
Wie beim Schach priorisiere ich: Wo bringt mein Einsatz am meisten?
Schwache Fächer bekommen mehr Zeit, starke Fächer weniger.

**Transfer zu Bereich C (Alltag/Energie):**
"Energie für wichtige Entscheidungen aufsparen, Routineaufgaben automatisieren"

**Was ist die gemeinsame Essenz?**
"Ressourcen-Optimierung unter Knappheit" – Ob Zeit, Energie oder Geld:
Verteile begrenzte Ressourcen dort, wo sie den größten Effekt haben.
""",
            },

            "take_home": """**Merksatz:**

Far Transfer = Abstraktion + Kreativität.

Je abstrakter du denkst, desto weiter transferierst du.
Je mehr Bereiche du kennst, desto mehr Verbindungen möglich.

**Innovation ist nichts anderes als erfolgreicher Far Transfer.**""",
        },

        "oberstufe": {
            "title": "Far Transfer – Domänenübergreifende Innovation",
            "icon": "🚀",

            "theorie": """**Die Herausforderung des Far Transfer:**

**Barnett & Ceci (2002)** haben Far Transfer systematisch untersucht.
Ihr Befund: Er ist selten und schwierig – aber möglich.

**Dimensionen des "Far":**
- Wissensdomäne: Verschiedene Fachgebiete
- Physischer Kontext: Schule vs. Alltag vs. Beruf
- Zeitlicher Abstand: Lange her vs. gerade gelernt
- Modalität: Visuell vs. auditiv vs. kinästhetisch
- Funktionalität: Anderer Verwendungszweck

**Je mehr Dimensionen sich unterscheiden, desto schwieriger der Transfer.**""",

            "kreativitaet_und_innovation": """**Far Transfer als Grundlage von Innovation:**

**Kreativität = Verbindung des Unverbundenen**

Die kreativsten Durchbrüche entstanden durch Far Transfer:
- **Darwin:** Ökonomie → Biologie (Malthus → Evolution)
- **Einstein:** Philosophie → Physik (Mach → Relativität)
- **Gutenberg:** Weinpresse → Druckerpresse
- **Jobs:** Kalligraphie → Computer (Mac-Typografie)

**Das Muster:**
Wissen aus Bereich A + Wissen aus Bereich B = Innovation

**Die Voraussetzung:**
Breites Wissen UND die Fähigkeit, Verbindungen zu sehen.""",

            "analogisches_denken": """**Analogisches Denken – Der Motor des Far Transfer:**

**Struktur einer Analogie:**
Quelle (bekannt) → Mapping → Ziel (unbekannt)

**Beispiel: Rutherford's Atommodell**
- Quelle: Sonnensystem (bekannt)
- Mapping: Zentrum mit umkreisenden Objekten
- Ziel: Atom (Kern + Elektronen)

**Wie trainiert man analogisches Denken?**
1. Viele verschiedene Domänen kennenlernen
2. Aktiv nach Strukturähnlichkeiten suchen
3. Abstraktion üben: "Was ist die Essenz?"
4. Analogien bewusst generieren und testen

**Warnung:**
Analogien können auch irreführen.
Kritische Prüfung: Wo bricht die Analogie?""",

            "transfer_zu_studium_beruf": """**Far Transfer: Schule → Studium → Beruf**

**Was transferiert?**
- Fachspezifisches Wissen: Teilweise
- Methoden: Oft
- Prinzipien: Fast immer
- Metakognition: Auf jeden Fall

**Konkret:**
| Schulkompetenz | Studium | Beruf |
|----------------|---------|-------|
| Quellenarbeit | Wissenschaftliches Arbeiten | Research |
| Argumentation | Wissenschaftlicher Diskurs | Verhandlung |
| Projektarbeit | Gruppenarbeiten | Teamwork |
| Zeitmanagement | Selbststudium | Deadline-Management |
| Komplexe Texte verstehen | Paper lesen | Verträge/Reports |

**Die Pointe:**
Die meisten "Soft Skills" sind transferierte Schulkompetenzen.""",

            "exercise": {
                "title": "Analogie-Konstruktion",
                "instruction": "Konstruiere eine kreative Analogie zwischen zwei völlig verschiedenen Domänen.",
                "template": """
**Domäne A (bekannt):** _____________
**Kernstruktur in A:** _____________

**Domäne B (Transfer-Ziel):** _____________

**Die Analogie:**
"B ist wie A, weil..." _____________

**Was überträgt sich?** _____________

**Wo bricht die Analogie?** _____________
(Kritische Reflexion: Was funktioniert NICHT?)

**Neues Verständnis von B:** _____________
""",
            },

            "take_home": """**Fazit:**

Far Transfer ist die Basis von Kreativität und Innovation.

Er erfordert:
- Breites Wissen über verschiedene Domänen
- Abstraktionsfähigkeit
- Aktive Suche nach Verbindungen
- Kritische Prüfung der Analogien

In einer Welt der Spezialisierung ist interdisziplinäres Denken ein Wettbewerbsvorteil.""",
        },

        "paedagogen": {
            "title": "Far Transfer – Möglichkeiten und Grenzen",
            "icon": "🚀",

            "realistische_erwartungen": """**Realistische Erwartungen:**

**Was die Forschung sagt:**
Far Transfer ist schwierig und selten.

**Sala & Gobet (2019): "Cognitive training does not enhance general cognition"**
- Meta-Analyse von Gehirntrainings (Schach, Musik, Videospiele)
- Far Transfer: **Effekt nahe 0%**
- Kernaussage: Training in Bereich A verbessert nicht automatisch Bereich B

**Realistische Schüler-Quoten bei explizitem Transfer-Training:**
- Near Transfer: ~70-80% der Schüler zeigen Fortschritte
- Far Transfer: ~30-50% bei intensivem, explizitem Training
- Spontaner Far Transfer (ohne Training): ~5-10%

**Aber:**
Far Transfer ist nicht unmöglich.
Er erfordert:
1. Explizites Training mit Feedback
2. Hohe Abstraktionsfähigkeit
3. Metakognitive Kompetenz
4. Breites Vorwissen

**Didaktische Konsequenz:**
Far Transfer als Ziel, nicht als Selbstverständlichkeit.
Explizit üben, nicht dem Zufall überlassen.
Realistische Erwartungen an Eltern kommunizieren.""",

            "strategien": """**Strategien zur Förderung von Far Transfer:**

**1. Abstraktion trainieren**
Vom Konkreten zum Allgemeinen:
- Was ist hier spezifisch?
- Was ist das allgemeine Prinzip?
- Wie würde man das abstrakt formulieren?

**2. Analogisches Denken fördern**
- Explizit Analogien konstruieren lassen
- Struktur-Mapping: Was entspricht was?
- Kritische Prüfung: Wo bricht die Analogie?

**3. Interdisziplinäre Projekte**
- Bewusst fächerübergreifend arbeiten
- Die Verbindungen explizit thematisieren
- Transfer als Lernziel formulieren

**4. Breites Vorwissen aufbauen**
- Je mehr Domänen bekannt, desto mehr Transfer-Ressourcen
- Allgemeinbildung ist Transfer-Kapital""",

            "analogietraining": """**Analogietraining im Detail:**

**Stufe 1: Analogien erkennen**
- Vorgegebene Analogien analysieren
- "Was ist hier gleich, was verschieden?"

**Stufe 2: Analogien konstruieren**
- Zu einem Konzept Analogien finden
- Mehrere Domänen durchprobieren

**Stufe 3: Analogien kritisieren**
- Wo funktioniert die Analogie?
- Wo bricht sie?
- Was wäre eine bessere Analogie?

**Stufe 4: Analogien anwenden**
- Neue Probleme durch Analogie lösen
- Aus der Analogie Hypothesen ableiten

**Beispiel-Sequenz:**
1. "Das Atom ist wie ein Sonnensystem. Was entspricht was?"
2. "Finde eine eigene Analogie für X."
3. "Wo bricht die Sonnensystem-Analogie?"
4. "Nutze eine Analogie, um Y zu erklären."
""",

            "faecheruebergreifend": """**Fächerübergreifende Kooperation:**

**Mögliche Verbindungen:**

| Fach A | Fach B | Gemeinsames Prinzip |
|--------|--------|---------------------|
| Mathe: Exponentialfunktion | Bio: Populationswachstum | Exponentielles Wachstum |
| Physik: Gleichgewicht | Chemie: Le Chatelier | Systemgleichgewicht |
| Deutsch: Argumentation | PoWi: Debatte | Überzeugungsstruktur |
| Geschichte: Quellenanalyse | Deutsch: Textinterpretation | Kritische Analyse |
| Kunst: Komposition | Musik: Harmonie | Ästhetische Struktur |

**Konkrete Ideen:**
- Team-Teaching zwischen Fächern
- Gemeinsame Projekte
- Explizite Brücken im Unterricht
- Transfer als Prüfungselement""",

            "grenzen": """**Grenzen und Vorsicht:**

**Wann Far Transfer unrealistisch ist:**
- Wenn Basiswissen fehlt
- Wenn Metakognition nicht entwickelt ist
- Wenn die Domänen zu verschieden sind
- Wenn die Abstraktionsfähigkeit begrenzt ist

**Typische Fehler:**
1. Annehmen, Transfer passiert automatisch
2. Far Transfer vor Near Transfer erwarten
3. Zu wenig Zeit für Abstraktion geben
4. Nur Fakten abfragen, aber Transfer erwarten

**Realistische Progression:**
1. Erst solides Fachwissen aufbauen
2. Dann Near Transfer üben
3. Dann langsam zu Far Transfer
4. Immer mit metakognitiver Begleitung""",
        },
    },
}

# ============================================
# PHASE 4: BRÜCKENPRINZIPIEN
# ============================================

PHASE_4_CONTENT = {
    "title": "Brückenprinzipien",
    "icon": "🌉",
    "core_concept": "Das PRINZIP erkennen – der Schlüssel zu allem!",
    
    "altersstufen": {
        "grundschule": {
            "title": "Brückenprinzipien – Verbindungen finden",
            "icon": "🌉",

            "hook": """**Stell dir eine Brücke vor!** 🌉

Du stehst auf einer Seite eines Flusses.
Auf der anderen Seite ist dein Ziel.
Dazwischen ist das Wasser!

Eine Brücke verbindet beide Seiten.
Und genau so funktionieren Brückenprinzipien:
Sie verbinden verschiedene Dinge miteinander.

Mit Brückenprinzipien kannst du überall hin!""",

            "was_sind_brueckenprinzipien": """**Was sind Brückenprinzipien?**

Es gibt Weisheiten, die ÜBERALL stimmen.
Sie gelten in der Schule, zu Hause, beim Spielen – einfach überall!

Beispiele:
- **"Übung macht den Meister"** – Das gilt beim Sport, bei Musik, in Mathe, überall.
- **"Erst nachdenken, dann handeln"** – Das gilt bei Spielen, bei Proben, im ganzen Leben.
- **"Aus Fehlern lernt man"** – Das stimmt immer und überall.

Diese Weisheiten sind wie Brücken.
Sie verbinden alles miteinander.""",

            "die_wichtigsten_bruecken": """**Deine 5 wichtigsten Brücken:** 🌟

**1. Muster suchen**
   "Überall gibt es Muster und Regeln."
   → In Mathe, in der Musik, in der Sprache – finde die Regel!

**2. In kleine Teile aufteilen**
   "Große Sachen werden leichter, wenn man sie in kleine Teile teilt."
   → Lange Wörter, schwere Aufgaben, große Projekte.

**3. Vergleichen**
   "Was ist gleich? Was ist anders?"
   → Bei neuen Wörtern, bei Tieren, bei Ländern.

**4. Nach dem Grund fragen**
   "Alles hat einen Grund und eine Wirkung."
   → In Geschichte, in der Natur, im Alltag.

**5. Üben**
   "Je mehr du übst, desto besser wirst du."
   → Das gilt für ALLES!""",

            "gaming_beispiel": """**Weisheiten vom Spielen:** 🎲

Beim Spielen lernst du wichtige Dinge, die überall helfen:

**"Immer wieder versuchen"**
→ Das hilft auch beim Lernen: Nicht aufgeben!

**"Erst einen Überblick verschaffen"**
→ Das hilft bei Aufgaben: Erst lesen, dann anfangen!

**"Viel üben bringt viel"**
→ Das stimmt überall: Übung macht den Meister!

**"Zusammen geht es besser"**
→ Das hilft auch in der Schule: Arbeitet zusammen!""",

            "story": """**Die Brückenbauerin Marie** 🌉

Marie konnte wunderbar zeichnen.
Aber Mathe war für sie sehr schwer.

Ihre Lehrerin fragte: "Was machst du beim Zeichnen?"
Marie überlegte: "Ich schaue ganz genau hin. Ich achte auf jedes kleine Detail."

Die Lehrerin sagte: "Das ist ein Brückenprinzip!"

**Genau hinsehen und auf Details achten**

Das funktioniert auch in Mathe!
- Genau hinsehen: Was soll ich rechnen?
- Auf Details achten: Steht da Plus oder Minus?

Marie nutzte ihre Brücke.
Vom Zeichnen zur Mathe.
Und ihre Noten wurden besser!

Sie entdeckte: Diese Brücke führt noch viel weiter!
→ Beim Lesen (genau hinsehen)
→ In Sachkunde (genau beobachten)
→ Sogar bei Freundschaften (auf andere achten)

**Eine Brücke. Viele Ziele.**""",

            "uebertritt_beispiel": """**Deine Brücken für die neue Schule:** 🎒

Diese Brückenprinzipien helfen dir beim Übertritt:

**"Schritt für Schritt"**
In der Grundschule: Aufgaben nacheinander lösen
Auf der neuen Schule: Genauso! Eine Aufgabe nach der anderen.

**"Fragen stellen"**
In der Grundschule: Bei der Lehrerin nachfragen
Auf der neuen Schule: Genauso! Fragen ist erlaubt und wichtig.

**"Ordnung halten"**
In der Grundschule: Hefte und Bücher sortieren
Auf der neuen Schule: Genauso! Nur mit mehr Fächern.

**Diese Brücken nimmst du mit!**""",

            "exercise": {
                "title": "Brückenbauer-Training! 🏗️",
                "instruction": "Finde die Verbindung zwischen diesen Dingen:",
                "aufgaben": [
                    {
                        "sache_1": "Lego bauen",
                        "sache_2": "Sätze schreiben",
                        "bruecke": "Einzelne Teile zu etwas Großem zusammensetzen",
                    },
                    {
                        "sache_1": "Einen Fehler im Puzzle suchen",
                        "sache_2": "Einen Fehler in der Hausaufgabe finden",
                        "bruecke": "Genau hinschauen und suchen: Was stimmt nicht?",
                    },
                    {
                        "sache_1": "Kekse nach Rezept backen",
                        "sache_2": "Ein Experiment in Sachkunde machen",
                        "bruecke": "Die Anleitung Schritt für Schritt befolgen",
                    },
                ],
                "eigene_bruecke": """
**Jetzt baust du deine eigene Brücke!**

**1. Etwas, das ich gerne mache:** _____________
(z.B. Sport, Musik, Basteln, Spielen...)

**2. Etwas aus der Schule:** _____________
(z.B. Mathe, Deutsch, Sachkunde...)

**3. Die Verbindung (Brücke) ist:** _____________
(Was haben beide gemeinsam? Welche Regel gilt für beide?)
""",
                "prompt": "Fülle die Lücken aus:",
            },

            "bruecken_sammlung": """**Deine Brücken-Sammlung:** 🗝️

Sammle deine eigenen Brücken-Regeln!
Schreib sie auf und erinnere dich daran.

**Beispiele:**
- "Übung macht den Meister" (gilt beim Sport UND in der Schule)
- "Schritt für Schritt" (gilt beim Rezept UND bei Aufgaben)
- "Erst denken, dann handeln" (gilt beim Spiel UND beim Test)

**Meine Brücken-Regeln:**
1. _______________________________
2. _______________________________
3. _______________________________

**Diese Brücken gehören dir!**
Sie helfen dir in der Schule UND im Leben.""",

            "take_home": """**Das darfst du dir merken:** 🧠

Brückenprinzipien verbinden ALLES.

Finde sie.
Sammle sie.
Nutze sie.

**Eine gute Brücke trägt dich überall hin.**""",

            "fun_fact": """**Wusstest du das?**
Die besten Erfinder sind Brückenbauer!
Sie verbinden Ideen aus verschiedenen Bereichen.
So entstehen die tollsten Erfindungen.
Und du bist jetzt auch ein Brückenbauer! 🌉""",
        },

        "unterstufe": {
            "title": "Brückenprinzipien – Dein Erfolgsgeheimnis!",
            "icon": "🌉",

            "hook": """**Was wäre, wenn es Prinzipien gäbe...** 🌉

...die in JEDEM Fach funktionieren?
...die bei JEDER Aufgabe helfen?
...die du ein Leben lang nutzen kannst?

Gibt es. Sie heißen Brückenprinzipien.
Und sie sind wie Erfolgstricks fürs Lernen.""",

            "was_sind_brueckenprinzipien": """**Brückenprinzipien = Universelle Wahrheiten**

Diese Prinzipien funktionieren überall:
- In jedem Fach
- Bei jeder Aufgabe
- Im Gaming
- Im echten Leben

Sie sind wie Brücken zwischen verschiedenen Welten.
Wenn du sie kennst, kommst du überall hin.""",

            "die_top_5": """**Die 5 mächtigsten Brückenprinzipien:**

**1️⃣ Das Muster-Prinzip**
"Überall gibt es Muster und Strukturen."
→ Mathe, Musik, Sprachen, Geschichte – such das Muster!

**2️⃣ Das Zerlege-Prinzip**
"Große Probleme in kleine Teile aufteilen."
→ Schwere Aufgaben, lange Texte, komplexe Themen.

**3️⃣ Das Ursache-Wirkungs-Prinzip**
"Alles hat einen Grund und eine Folge."
→ Geschichte, Naturwissenschaften, Alltag.

**4️⃣ Das Vergleichs-Prinzip**
"Was ist gleich? Was ist anders?"
→ Vokabeln, Textvergleiche, wissenschaftliches Denken.

**5️⃣ Das Wiederholungs-Prinzip**
"Übung macht den Meister."
→ Wirklich ALLES.""",

            "bruecken_in_action": """**Brückenprinzipien in der Praxis:**

**Situation:** Schwere Mathe-Textaufgabe 😰

**Ohne Brückenprinzipien:**
"Ich versteh das nicht!" *Panik*

**Mit Brückenprinzipien:**
1. **Zerlege-Prinzip:** Was ist gegeben? Was ist gesucht?
2. **Muster-Prinzip:** Welche Art von Aufgabe ist das?
3. **Ursache-Wirkung:** Welcher Rechenweg führt zum Ziel?

Plötzlich: Die Aufgabe ist lösbar.""",

            "gaming_bruecken": """**Brücken aus dem Gaming:** 🎮

Du kennst diese Prinzipien schon – aus Spielen!

- **"Save often"** → Regelmäßig wiederholen beim Lernen
- **"Erst die Anleitung lesen"** → Erst die Aufgabe richtig lesen
- **"Level up before boss"** → Erst üben, dann Klassenarbeit
- **"Look for patterns"** → Muster erkennen
- **"Don't rage quit"** → Durchhalten, auch wenn's schwer ist""",

            "exercise": {
                "title": "Bau deine Brücken-Sammlung! 🗂️",
                "instruction": "Sammle deine eigenen Brückenprinzipien.",
                "template": """
**Meine Brückenprinzipien:**

1. _______________________________
   (Wo funktioniert das? _________)

2. _______________________________
   (Wo funktioniert das? _________)

3. _______________________________
   (Wo funktioniert das? _________)

4. _______________________________
   (Wo funktioniert das? _________)

5. _______________________________
   (Wo funktioniert das? _________)
""",
            },

            "take_home": """**Der Erfolgstrick-Merksatz:**

Brückenprinzipien sind universal.
Lerne sie einmal. Nutze sie immer.

**Die beste Investition in dein Gehirn.**""",
        },

        "mittelstufe": {
            "title": "Brückenprinzipien – Universelle Denkwerkzeuge",
            "icon": "🌉",

            "hook": """**Es gibt Prinzipien, die überall funktionieren.** 🌉

Nicht in einem Fach. In ALLEN.
Nicht in einer Situation. In JEDER.

Diese Prinzipien sind wie mentale Schweizer Taschenmesser.
Einmal gelernt, immer nützlich.""",

            "die_wichtigsten": """**Die wichtigsten Brückenprinzipien:**

**1. Ursache und Wirkung**
- Physik: Aktion = Reaktion
- Geschichte: Ereignis → Folgen
- Biologie: Reiz → Reaktion
- Wirtschaft: Entscheidung → Konsequenz

**2. Gleichgewicht und Ungleichgewicht**
- Chemie: Reaktionsgleichgewicht
- Physik: Kräftegleichgewicht
- Ökologie: Ökosystem-Balance
- Politik: Machtgleichgewicht

**3. Struktur und Funktion**
- Biologie: Form folgt Funktion
- Architektur: Design bestimmt Nutzung
- Sprache: Satzstruktur bestimmt Bedeutung
- Programmierung: Code-Struktur bestimmt Verhalten

**4. Rückkopplung (Feedback)**
- Biologie: Homöostase
- Technik: Regelkreise
- Lernen: Fehler → Anpassung
- Wirtschaft: Marktmechanismen

**5. Emergenz**
- Physik: Thermodynamik aus Teilchen
- Biologie: Bewusstsein aus Neuronen
- Gesellschaft: Kultur aus Individuen
- Sprache: Bedeutung aus Wörtern""",

            "anwendung": """**So nutzt du Brückenprinzipien:**

**Schritt 1: Identifizieren**
Bei neuem Stoff: "Welches Brückenprinzip steckt dahinter?"

**Schritt 2: Aktivieren**
"Was weiß ich schon über dieses Prinzip aus anderen Bereichen?"

**Schritt 3: Übertragen**
"Wie funktioniert das Prinzip in diesem neuen Kontext?"

**Schritt 4: Vernetzen**
"Wie hängt das mit anderen Themen zusammen?"

**Beispiel:**
Neues Thema: Angebot und Nachfrage (Wirtschaft)
→ Brückenprinzip: Gleichgewicht
→ Schon bekannt: Chemisches Gleichgewicht, Kräftegleichgewicht
→ Transfer: Preis als "Gleichgewichtspunkt" zwischen Angebot und Nachfrage""",

            "denkwerkzeuge": """**Metakognitive Denkwerkzeuge:**

Diese Fragen funktionieren IMMER:

**Analyse:**
- Was sind die Bestandteile?
- Wie hängen sie zusammen?
- Was ist Ursache, was Wirkung?

**Vergleich:**
- Was ist gleich, was verschieden?
- Was ist das Muster?

**Bewertung:**
- Was sind Vor- und Nachteile?
- Was sind die Konsequenzen?

**Synthese:**
- Wie kann ich das kombinieren?
- Was ist die Kernessenz?""",

            "exercise": {
                "title": "Brückenprinzip-Mapping",
                "instruction": "Wähle ein Brückenprinzip und finde 5 verschiedene Anwendungen.",
                "template": """
**Gewähltes Brückenprinzip:** _____________

**Anwendung 1 (Naturwissenschaft):** _____________

**Anwendung 2 (Geisteswissenschaft):** _____________

**Anwendung 3 (Alltag):** _____________

**Anwendung 4 (Hobby):** _____________

**Anwendung 5 (Zukunft/Beruf):** _____________

**Was haben alle gemeinsam?** _____________
""",
            },

            "take_home": """**Merksatz:**

Brückenprinzipien sind mentale Werkzeuge, die überall funktionieren.

Wer sie beherrscht, kann sich schneller in neue Themen einarbeiten,
komplexe Zusammenhänge verstehen und kreative Lösungen finden.

**Investiere in Prinzipien, nicht nur in Fakten.**""",
        },

        "oberstufe": {
            "title": "Brückenprinzipien – Epistemische Werkzeuge",
            "icon": "🌉",

            "einfuehrung": """**Was sind epistemische Werkzeuge?**

Epistemische Werkzeuge sind Denkstrukturen,
die domänenübergreifend Erkenntnis ermöglichen.

Sie sind nicht fachspezifisch, sondern universal.
Sie funktionieren in Physik wie in Philosophie,
in Biologie wie in Wirtschaft.

Wer diese Werkzeuge beherrscht, kann sich in jedes Thema einarbeiten.""",

            "fundamentale_prinzipien": """**Fundamentale Brückenprinzipien:**

**1. Kausalität**
- Ursache → Wirkung
- Anwendungen: Alle Naturwissenschaften, Geschichte, Recht, Medizin
- Fragen: Was verursacht was? Korrelation vs. Kausalität?

**2. Systemdenken**
- Teile + Beziehungen = Ganzes
- Anwendungen: Ökologie, Wirtschaft, Soziologie, Technik
- Fragen: Was sind die Elemente? Wie interagieren sie?

**3. Gleichgewicht und Dynamik**
- Stabilität vs. Veränderung
- Anwendungen: Physik, Chemie, Ökonomie, Politik
- Fragen: Was stabilisiert? Was destabilisiert?

**4. Evolution und Adaption**
- Variation + Selektion + Zeit = Anpassung
- Anwendungen: Biologie, Kultur, Technologie, Sprache
- Fragen: Was variiert? Was wird selektiert? Worauf wird optimiert?

**5. Information und Kommunikation**
- Sender → Code → Kanal → Empfänger → Dekodierung
- Anwendungen: Genetik, Linguistik, Technik, Psychologie
- Fragen: Was ist die Information? Wie wird sie übertragen?""",

            "anwendung": """**Praktische Anwendung:**

**Beispiel: Klimawandel – Multidisziplinäre Analyse**

Mit Brückenprinzipien:

1. **Kausalität:** CO2 → Treibhauseffekt → Erwärmung
2. **Systemdenken:** Atmosphäre, Ozeane, Eis, Biosphäre als vernetztes System
3. **Gleichgewicht:** Gestörtes Strahlungsgleichgewicht, Kipppunkte
4. **Rückkopplung:** Albedo-Effekt, Methan aus Permafrost
5. **Evolution:** Anpassung von Ökosystemen, Migration

**Der Vorteil:**
Du kannst das Thema auf mehreren Ebenen verstehen.
Und du kannst Argumente verschiedener Disziplinen einordnen.""",

            "metakognitive_tools": """**Metakognitive Denkwerkzeuge:**

**Für Analyse:**
- Was sind die konstituierenden Elemente?
- Wie ist die kausale Struktur?
- Welches Modell beschreibt das System?

**Für Synthese:**
- Was ist die Kernessenz?
- Wie lässt sich das verallgemeinern?
- Was ist die abstrakte Struktur?

**Für Evaluation:**
- Ist das Argument valide?
- Welche Prämissen werden vorausgesetzt?
- Wo liegen die Grenzen des Modells?

**Für Kreation:**
- Welche Analogien sind möglich?
- Was wäre, wenn...?
- Wie könnte man das anders denken?""",

            "exercise": {
                "title": "Multidimensionale Themenanalyse",
                "instruction": "Wähle ein komplexes Thema und analysiere es mit verschiedenen Brückenprinzipien.",
                "template": """
**Thema:** _____________

**Analyse mit Kausalität:**
Was sind Ursachen? Was sind Wirkungen?
_____________

**Analyse mit Systemdenken:**
Welche Elemente? Welche Beziehungen?
_____________

**Analyse mit Gleichgewicht:**
Was stabilisiert? Was destabilisiert?
_____________

**Analyse mit Evolution:**
Was entwickelt sich? Wohin?
_____________

**Synthese:**
Was ergibt sich aus der Kombination der Perspektiven?
_____________
""",
            },

            "take_home": """**Fazit:**

Brückenprinzipien sind das Betriebssystem des Denkens.

Fachspezifisches Wissen ist die Software – es ändert sich.
Die Prinzipien sind die Hardware – sie bleiben.

Wer die Prinzipien beherrscht, kann jede Software installieren.""",
        },

        "paedagogen": {
            "title": "Brückenprinzipien unterrichten",
            "icon": "🌉",

            "didaktik": """**Didaktik der Brückenprinzipien:**

**Das Ziel:**
Schüler sollen domänenübergreifende Denkwerkzeuge erwerben.

**Das Problem:**
Die meisten Lehrpläne sind fachspezifisch organisiert.
Brückenprinzipien werden selten explizit gelehrt.

**Die Lösung:**
Brückenprinzipien als Meta-Ebene über den Fächern.
Nicht statt, sondern zusätzlich zum Fachunterricht.""",

            "kernprinzipien": """**Die wichtigsten Brückenprinzipien für den Unterricht:**

**1. Kausalität**
- Ursache → Wirkung
- Alle Naturwissenschaften, Geschichte, Sozialkunde
- Fragen: Was verursacht was? Ist das wirklich Kausalität oder nur Korrelation?

**2. System und Emergenz**
- Teile + Beziehungen = Ganzes (oft mehr als Summe)
- Biologie, Soziologie, Wirtschaft
- Fragen: Was sind die Elemente? Wie interagieren sie?

**3. Gleichgewicht und Dynamik**
- Stabilität vs. Veränderung
- Physik, Chemie, Ökonomie, Politik
- Fragen: Was stabilisiert? Was bringt Veränderung?

**4. Struktur und Funktion**
- Form folgt Funktion
- Biologie, Architektur, Sprache
- Fragen: Warum ist X so gebaut? Was ermöglicht diese Struktur?

**5. Variation und Selektion**
- Unterschiede + Auswahl = Entwicklung
- Evolution, Kultur, Technologie
- Fragen: Was variiert? Was wird ausgewählt? Worauf wird optimiert?""",

            "vermittlungsstrategien": """**Strategien zur Vermittlung:**

**1. Explizite Benennung**
Bei jedem Thema: "Das Prinzip dahinter ist..."
Am Ende: "Wo haben wir dieses Prinzip noch gesehen?"

**2. Spiralcurriculum für Prinzipien**
Das gleiche Prinzip auf verschiedenen Komplexitätsstufen:
- Klasse 5: Kausalität in einfachen Experimenten
- Klasse 8: Kausalität vs. Korrelation
- Klasse 11: Wissenschaftstheoretische Reflexion von Kausalität

**3. Prinzipien-Portfolio**
Schüler sammeln Anwendungen der Prinzipien:
"Wo bin ich dem Prinzip X begegnet?"

**4. Prinzipien-basierte Prüfungsfragen**
Nicht: "Nenne die Formel für..."
Sondern: "Welches Prinzip erklärt...? Wo gilt es noch?"

**5. Reflexionsroutinen**
Regelmäßige Frage: "Was war das Prinzip heute?"
Wöchentlich: "Welche Verbindungen habe ich diese Woche entdeckt?"
""",

            "beispiel_einheit": """**Beispiel: Unterrichtseinheit "Gleichgewicht"**

**Woche 1: Physik**
- Kräftegleichgewicht
- Hebelgesetz
- Übung: Gleichgewichtsbedingungen

**Woche 2: Chemie**
- Chemisches Gleichgewicht
- Le Chatelier
- Übung: Gleichgewichtsverschiebung

**Woche 3: Biologie/Ökologie**
- Ökosystem-Gleichgewichte
- Räuber-Beute
- Übung: Störung und Anpassung

**Woche 4: Gesellschaft**
- Wirtschaftliches Gleichgewicht (Angebot/Nachfrage)
- Politisches Gleichgewicht (Gewaltenteilung)
- Übung: Gesellschaftliche Gleichgewichte

**Woche 5: Synthese**
- Was ist das Prinzip "Gleichgewicht"?
- Was haben alle Anwendungen gemeinsam?
- Wo bricht die Analogie?
- Eigene Anwendungen finden

**Prüfung:** Transfer auf neue Situation""",
        },
    },
}

# ============================================
# FINALE: TRANSFER-CHECK
# ============================================

FINALE_CONTENT = {
    "title": "Transfer-Check",
    "icon": "🏆",
    "instruction": "Zeig, was du gelernt hast!",
    
    "altersstufen": {
        "grundschule": {
            "title": "Transfer-Abschluss – Zeig was du kannst!",
            "icon": "🏆",

            "hook": """**Jetzt kommt die Abschluss-Aufgabe!** 🏆

Du hast das Transfer-Geheimnis entdeckt.
Du kennst den kleinen Transfer (ähnliche Aufgaben erkennen).
Du beherrschst den großen Transfer (weit übertragen).
Du baust Brücken zwischen verschiedenen Bereichen.

Jetzt zeigst du, was du alles gelernt hast!

**Das hilft dir besonders beim Übertritt:**
Am Gymnasium musst du oft Wissen aus verschiedenen Fächern verbinden.
Genau das übst du hier!""",

            "zusammenfassung": """**Alles auf einen Blick:** 📋

**Transfer** = Wissen übertragen.
Einmal lernen, überall nutzen können.

**Kleiner Transfer** = Ähnliches erkennen.
Eine Aufgabe gelöst? Dann schaffst du auch ähnliche!

**Großer Transfer** = Weit übertragen.
Sport, Hobbys, Schule, Alltag – alles hängt zusammen!

**Brücken-Regeln** = Regeln, die überall gelten.
Sie verbinden ganz verschiedene Bereiche.

**Du** = Bald ein echter Überflieger! 🌟""",

            "uebertritt_bezug": """**Warum ist das für den Übertritt wichtig?**

Am Gymnasium lernst du viele neue Fächer.
Wer Transfer kann, hat es leichter:

✅ Du erkennst: "Das ist ja wie in Mathe!"
✅ Du verbindest Fächer miteinander
✅ Du löst auch unbekannte Aufgaben
✅ Du lernst schneller, weil du Brücken baust""",

            "final_challenge": {
                "title": "Die große Transfer-Prüfung!",
                "intro": "Zeig, dass du Transfer verstanden hast!",

                "aufgaben": [
                    {
                        "nummer": 1,
                        "typ": "Kleinen Transfer erkennen",
                        "frage": """Du hast gelernt, wie man die Fläche eines Rechtecks berechnet:
Länge mal Breite

Jetzt sollst du die Fläche eines Quadrats berechnen.
Was machst du?""",
                        "antwort": "Das gleiche Prinzip! Seite mal Seite (weil beim Quadrat alle Seiten gleich lang sind)",
                        "punkte": 25,
                        "uebertritt_tipp": "Am Gymnasium rechnet man mit Dreiecken, Trapezen und anderen Formen – aber das Prinzip bleibt ähnlich!",
                    },
                    {
                        "nummer": 2,
                        "typ": "Großen Transfer anwenden",
                        "frage": """Beim Zähneputzen putzt du der Reihe nach:
Erst oben rechts, dann oben links, dann unten rechts, dann unten links.

Wie könnte dir diese Ordnung beim Aufräumen deines Zimmers helfen?""",
                        "antwort": "Auch der Reihe nach vorgehen: Erst eine Ecke, dann die nächste. Nicht alles auf einmal!",
                        "punkte": 30,
                        "uebertritt_tipp": "Am Gymnasium musst du viele Hausaufgaben planen – der Reihe nach ist besser als alles durcheinander!",
                    },
                    {
                        "nummer": 3,
                        "typ": "Brücken-Regel finden",
                        "frage": """Was ist die gemeinsame Regel bei:
- Radfahren lernen
- Schwimmen lernen
- Lesen lernen""",
                        "antwort": "Übung macht den Meister! Am Anfang ist es schwer, aber mit Übung wird es immer leichter.",
                        "punkte": 30,
                        "uebertritt_tipp": "Das gilt auch für die neue Schule: Am Anfang ist alles neu, aber mit Übung wird es leichter!",
                    },
                    {
                        "nummer": 4,
                        "typ": "Eigenen Transfer erfinden",
                        "frage": """Erfinde deinen eigenen Transfer!

Nimm etwas aus deinem Lieblings-Hobby oder -Sport.
Zeig, wie dir das gleiche Prinzip in der Schule helfen kann.""",
                        "beispiel": "Beim Fußball lerne ich: Wenn etwas nicht klappt, versuche ich es nochmal anders. Das hilft mir auch bei schweren Mathe-Aufgaben!",
                        "punkte": 40,
                        "kreativ_bonus": 15,
                        "uebertritt_tipp": "Am Gymnasium lernst du viel Neues – deine Hobbys helfen dir dabei!",
                    },
                ],
            },

            "reflexion": """**Dein Transfer-Tagebuch:** 📓

Ab jetzt: Achte auf Transfer in deinem Alltag!

Wenn du merkst: "Das kenne ich doch irgendwoher!"
Dann hast du Transfer entdeckt!

Schreib es auf:
- Was war die Situation?
- Was habe ich übertragen?
- Was war die Regel dahinter?

**Je mehr du sammelst, desto besser wirst du!**

**Tipp für den Übertritt:**
Mach dir eine Liste: Was kann ich gut?
Überlege dann: Wo könnte mir das noch helfen?""",

            "zukunfts_tipps": """**So nutzt du Transfer ab jetzt:** 🌟

**Tipp 1:** Frag bei JEDER neuen Aufgabe:
"Wo habe ich so etwas Ähnliches schon gemacht?"

**Tipp 2:** Such nach der REGEL, nicht nur nach der Lösung.
Regeln kannst du immer wieder nutzen!

**Tipp 3:** Sport, Musik, Hobbys –
das ist nicht nur Spaß! Da lernst du wichtige Regeln.

**Tipp 4:** Erkläre anderen, was du gelernt hast.
Dabei merkst du die Regeln noch besser!

**Tipp 5:** Fehler sind gut!
Aus Fehlern lernst du am meisten.

**Für den Übertritt:**
Wenn am Gymnasium etwas schwer ist, frag dich:
"Wo habe ich schon mal etwas Ähnliches geschafft?"
Das gibt dir Mut!""",

            "abschluss_message": """**Herzlichen Glückwunsch!** 🎉

Du bist jetzt ein echter Transfer-Meister.

Das Geheimnis der Überflieger?
Das kennst du jetzt!

Nutze es:
- In der Schule
- Beim Übertritt aufs Gymnasium
- Im ganzen Leben

**Einmal lernen. Überall nutzen. Das ist dein Vorteil!**

🏆 AUSZEICHNUNG: Transfer-Meister 🏆""",

            "badge_info": {
                "name": "Transfer-Meister",
                "icon": "🏆",
                "beschreibung": "Hat das Geheimnis der Überflieger gelernt!",
                "xp": 150,
            },
        },

        "unterstufe": {
            "challenge": """**Transfer-Meister-Test!** 🎯

Beantworte diese Fragen:

1. **Near Transfer:**
   Du beherrschst Prozentrechnung in Mathe.
   Nenne 2 ähnliche Situationen, wo du das auch anwenden kannst.

2. **Far Transfer:**
   Das Prinzip "Teile und Herrsche" (divide and conquer):
   Zeige, wie es in 3 KOMPLETT VERSCHIEDENEN Bereichen funktioniert.

3. **Brückenprinzip:**
   Formuliere ein eigenes Brückenprinzip und zeige 3 Anwendungen
   (mindestens 1 in der Schule, 1 außerhalb).""",
        },
        
        "mittelstufe": {
            "challenge": """**Transfer-Assessment** 🎯

Demonstriere deine Transfer-Fähigkeit:

1. **Near Transfer:**
   Wähle ein aktuelles Unterrichtsthema.
   Zeige 2 Variationen, wo das gleiche Prinzip gilt.

2. **Far Transfer:**
   Erstelle eine Analogie zwischen zwei verschiedenen Fächern.
   Erkläre die Tiefenstruktur, die beide verbindet.

3. **Brückenprinzip:**
   Identifiziere ein universelles Prinzip.
   Zeige seine Anwendung in: Schule, Alltag, Berufswelt, Gesellschaft.""",
        },
        
        "oberstufe": {
            "challenge": """**Metakognitiver Transfer-Nachweis** 🎯

1. **Near Transfer:**
   Analysiere zwei verwandte Konzepte aus deinem Leistungskurs.
   Zeige die strukturellen Gemeinsamkeiten und systematische Unterschiede.

2. **Far Transfer:**
   Wähle ein Konzept aus den Naturwissenschaften.
   Übertrage es auf ein Phänomen aus den Geisteswissenschaften (oder umgekehrt).
   Begründe die Validität der Analogie.

3. **Mental Model:**
   Präsentiere ein Brückenprinzip mit:
   - Ursprung (Disziplin)
   - Abstrakte Formulierung
   - 5+ Anwendungsdomänen
   - Grenzen der Anwendbarkeit""",
        },
        
        "paedagogen": {
            "challenge": """**Transfer-Implementierung** 🎯

Entwickeln Sie ein Konzept zur Transfer-Förderung:

1. **Near Transfer:**
   Beschreiben Sie, wie Sie systematische Variation in einer Unterrichtseinheit einsetzen würden.

2. **Far Transfer:**
   Entwerfen Sie eine fächerübergreifende Projektidee, die Far Transfer erfordert.

3. **Brückenprinzipien:**
   Identifizieren Sie 3 Prinzipien aus Ihrem Fach, die auch in anderen Fächern gelten.
   Skizzieren Sie eine Kooperation mit Kollegen.""",
        },
    },
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_transfer_content_for_age(age_group: str) -> Dict[str, Any]:
    """Gibt den kompletten Transfer-Content für eine Altersstufe zurück."""
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

def get_phase_content(phase_num: int, age_group: str) -> Dict[str, Any]:
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

TRANSFER_BADGES = {
    "transfer_starter": {
        "name": "Transfer-Entdecker",
        "icon": "🔮",
        "description": "Das Transfer-Geheimnis entdeckt!",
        "condition": "phase_1_complete",
    },
    "near_transfer_pro": {
        "name": "Near-Transfer-Profi",
        "icon": "🎯",
        "description": "Near Transfer gemeistert!",
        "condition": "phase_2_complete",
    },
    "far_transfer_hero": {
        "name": "Far-Transfer-Held",
        "icon": "🚀",
        "description": "Far Transfer gewagt und geschafft!",
        "condition": "phase_3_complete",
    },
    "bridge_builder": {
        "name": "Brückenbauer",
        "icon": "🌉",
        "description": "Brückenprinzipien gemeistert!",
        "condition": "phase_4_complete",
    },
    "transfer_master": {
        "name": "Transfer-Meister",
        "icon": "🏆",
        "description": "Transfer-Challenge abgeschlossen!",
        "condition": "finale_complete",
    },
}

TRANSFER_CERTIFICATE = {
    "title": "Transfer-Meister",
    "subtitle": "hat das Geheimnis der Überflieger entdeckt",
    "description": "und gelernt, Wissen auf neue Situationen zu übertragen!",
    "skills": [
        "Near Transfer beherrscht",
        "Far Transfer gewagt",
        "Brückenprinzipien erkannt",
    ],
}
