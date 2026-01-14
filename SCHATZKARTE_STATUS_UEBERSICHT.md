# Schatzkarte - Status Übersicht
## Stand: 14. Januar 2025

---

# Änderungen vom 14. Januar 2025

## Karten-Anpassungen
- Hintergrundbild auf 115% Breite gestreckt (keine blauen Ränder mehr)
- Alle 15 Inseln gleichmäßig auf der Landmasse verteilt (y: 12-85)

## Video-Chat Integration (NEU!)
Neues Feature für Lerngruppen:

| Komponente | Beschreibung |
|------------|--------------|
| `VideoChat/` | Neue Komponenten für Jitsi Meet |
| `ScreenShareHelper.jsx` | Kindgerechte Screen-Sharing-Anleitung |
| `SchatzkarteMeetingWithScreenShare.jsx` | Meeting-Komponente |
| `useMeeting.ts` | React Hook für Meeting-Zugriff |
| `lerngruppen_db.py` | Meeting-Tabellen + Funktionen |
| `7_👥_Lerngruppen.py` | Neuer Tab "📹 Video-Treffen" |

### So funktioniert's:
1. **👥 Lerngruppen** → Tab **📹 Video-Treffen**
2. Lerngruppe auswählen
3. Treffen planen (Tag, Uhrzeit, Dauer)
4. **🚀 Jetzt beitreten** klicken
5. Mit Google anmelden (nur Coach als Moderator)

### Wichtig:
- **Coach:** Muss sich mit Google anmelden (Moderator-Rechte)
- **Kinder:** Keine Anmeldung nötig, warten im Warteraum

### Bug-Fixes:
- Migration für `status`-Spalte in `group_members`
- Korrektur `jitsi_room_name` Feldname

---

# Übersicht auf einen Blick

## Design-Status aller Inseln

| Icon | Insel | Design |
|:----:|-------|:------:|
| 🏰 | Festung der Stärke | ✅ |
| 🔧 | Insel der 7 Werkzeuge | ✅ |
| 🌉 | Insel der Brücken | ✅ |
| 🧵 | Insel der Fäden | ✅ |
| 🧠 | Spiegel-See | ✅ |
| 🔥 | Vulkan der Motivation | ✅ |
| 😌 | Ruhe-Oase | ✅ |
| 🏆 | Ausdauer-Gipfel | ✅ |
| 🎯 | Fokus-Leuchtturm | ✅ |
| 🌱 | Wachstums-Garten | ✅ |
| 🏫 | Lehrer-Turm | ✅ |
| 🏠 | Wohlfühl-Dorf | ✅ |
| 🛡️ | Schutz-Burg | ✅ |
| ⛰️ | Berg der Meisterschaft | ✅ |

**Alle 14 Inseln haben jetzt das neue animierte Design-System!**

---

# Detaillierter Inhalts-Status

## Legende

| Symbol | Bedeutung |
|:------:|-----------|
| ✅ | Fertig |
| ⚠️ | Vorhanden, aber Placeholder/unvollständig |
| ❌ | Fehlt noch |
| 🚧 | In Arbeit |

---

## 1. Festung der Stärke

| Komponente | Grundschule | Unterstufe | Mittelstufe |
|------------|:-----------:|:----------:|:-----------:|
| **Scroll-Content** | ✅ | ✅ | ✅ |
| **Video** | ✅ YouTube | ✅ | ✅ |
| **Quiz** | ✅ 9 Fragen | ✅ | ❌ |
| **Challenge** | ✅ Bandura/Hattie Schiffe | | |
| **Experience** | ✅ FestungIslandExperience.tsx | | |
| **CSS** | ✅ festung-island.css | | |

**Was fehlt:** Quiz für Mittelstufe

---

## 2. Insel der 7 Werkzeuge

| Komponente | Grundschule | Unterstufe | Mittelstufe |
|------------|:-----------:|:----------:|:-----------:|
| **Scroll-Content** | ✅ | ✅ | ✅ |
| **Video** | ⚠️ Placeholder | ⚠️ | ⚠️ |
| **Quiz** | ✅ 15 Fragen | ❌ | ❌ |
| **Challenge** | ✅ 7 Powertechniken | | |
| **Experience** | ✅ WerkzeugeIslandExperience.tsx | | |
| **CSS** | ✅ werkzeuge-island.css | | |

**Was fehlt:** Video URL, Quiz für Unterstufe & Mittelstufe

---

## 3. Insel der Brücken

| Komponente | Grundschule | Unterstufe | Mittelstufe |
|------------|:-----------:|:----------:|:-----------:|
| **Scroll-Content** | ✅ | ✅ | ✅ |
| **Video** | ⚠️ Placeholder | ⚠️ | ⚠️ |
| **Quiz** | ✅ | ✅ | ✅ |
| **Challenge** | ✅ TransferChallenge | | |
| **Experience** | ✅ BrueckenIslandExperience.tsx | | |
| **CSS** | ✅ bruecken-island.css | | |

**Was fehlt:** Video URL

---

## 4. Insel der Fäden

| Komponente | Grundschule | Unterstufe | Mittelstufe |
|------------|:-----------:|:----------:|:-----------:|
| **Scroll-Content** | ✅ Birkenbihl | ✅ | ✅ |
| **Video** | ⚠️ Placeholder | ⚠️ | ⚠️ |
| **Quiz** | ❌ | ❌ | ❌ |
| **Challenge** | ✅ FaedenChallenge | | |
| **Experience** | ✅ FaedenIslandExperience.tsx | | |
| **CSS** | ✅ faeden-island.css | | |

**Was fehlt:** Video URL, Quiz für alle Stufen

---

## 5-14. Weitere Inseln (Design fertig, Inhalt fehlt)

Diese Inseln haben das neue Design-System, aber noch keinen Inhalt:

| # | Insel | Thema (geplant) | Status |
|:-:|-------|-----------------|:------:|
| 5 | 🧠 Spiegel-See | Metakognition | 🚧 Coming Soon |
| 6 | 🔥 Vulkan der Motivation | Intrinsische Motivation | 🚧 Coming Soon |
| 7 | 😌 Ruhe-Oase | Stressmanagement | 🚧 Coming Soon |
| 8 | 🏆 Ausdauer-Gipfel | Durchhaltevermögen (Grit) | 🚧 Coming Soon |
| 9 | 🎯 Fokus-Leuchtturm | Konzentration | 🚧 Coming Soon |
| 10 | 🌱 Wachstums-Garten | Growth Mindset | 🚧 Coming Soon |
| 11 | 🏫 Lehrer-Turm | Lehrer-Feedback | 🚧 Coming Soon |
| 12 | 🏠 Wohlfühl-Dorf | Lernumgebung | 🚧 Coming Soon |
| 13 | 🛡️ Schutz-Burg | Grenzen setzen | 🚧 Coming Soon |
| 14 | ⛰️ Berg der Meisterschaft | Finale / Reflexion | 🚧 Coming Soon |

---

# Globale Komponenten

| Komponente | Status | Beschreibung |
|------------|:------:|--------------|
| 🔑 Bandura-Schiff | ✅ | "Der goldene Schlüssel" - 4 Quellen der Selbstwirksamkeit |
| 💪 Hattie-Schiff | ✅ | "Superpower" - Selbsteinschätzung trainieren |
| 📓 Superhelden-Tagebuch | ✅ | Tägliche Erfolge aufschreiben (nur Grundschule) |
| 🧠 Brainy | ✅ | Maskottchen mit Hilfe-Tipps |
| ⚔️ BattleQuiz | ✅ | Quiz mit Leben-System |
| 🎓 Lerntechniken-Zertifikat | ✅ | PNG-Download für Werkzeuge-Insel |
| 📹 Video-Chat | ✅ | Jitsi Meet für Lerngruppen (Coach plant, Kinder treten bei) |

---

# Was fehlt noch? (Priorisiert)

## Hohe Priorität

| Priorität | Aufgabe | Insel |
|:---------:|---------|-------|
| 1 | Quiz Mittelstufe | Festung |
| 2 | Quiz Unterstufe | Werkzeuge |
| 3 | Quiz Mittelstufe | Werkzeuge |
| 4 | Quiz alle Stufen | Fäden |

## Mittlere Priorität

| Priorität | Aufgabe |
|:---------:|---------|
| 5 | Video URLs für Werkzeuge, Brücken, Fäden |
| 6 | Inhalt für Spiegel-See (nächste leere Insel) |

## Niedrige Priorität

| Priorität | Aufgabe |
|:---------:|---------|
| 7-15 | Inhalt für restliche Inseln (Vulkan bis Berg) |

---

# Dateien-Übersicht

## Experience-Komponenten (alle ✅)

```
frontend/src/components/
├── ✅ FestungIslandExperience.tsx
├── ✅ WerkzeugeIslandExperience.tsx
├── ✅ BrueckenIslandExperience.tsx
├── ✅ FaedenIslandExperience.tsx
├── ✅ StarthafenIslandExperience.tsx
├── ✅ SpiegelSeeIslandExperience.tsx
├── ✅ VulkanIslandExperience.tsx
├── ✅ RuheOaseIslandExperience.tsx
├── ✅ AusdauerGipfelIslandExperience.tsx
├── ✅ FokusLeuchtturmIslandExperience.tsx
├── ✅ WachstumGartenIslandExperience.tsx
├── ✅ LehrerTurmIslandExperience.tsx
├── ✅ WohlfuehlDorfIslandExperience.tsx
├── ✅ SchutzBurgIslandExperience.tsx
└── ✅ MeisterBergIslandExperience.tsx
```

## CSS-Dateien (alle ✅)

```
frontend/src/styles/
├── ✅ festung-island.css
├── ✅ werkzeuge-island.css
├── ✅ bruecken-island.css
├── ✅ faeden-island.css
├── ✅ starthafen-island.css
├── ✅ spiegel-see-island.css
├── ✅ vulkan-island.css
├── ✅ ruhe-oase-island.css
├── ✅ ausdauer-gipfel-island.css
├── ✅ fokus-leuchtturm-island.css
├── ✅ wachstum-garten-island.css
├── ✅ lehrer-turm-island.css
├── ✅ wohlfuehl-dorf-island.css
├── ✅ schutz-burg-island.css
└── ✅ meister-berg-island.css
```

## VideoChat-Dateien (NEU 14.01.2025)

```
frontend/src/components/VideoChat/
├── ✅ ScreenShareHelper.jsx
├── ✅ SchatzkarteMeetingWithScreenShare.jsx
├── ✅ screen-share-helper.css
└── ✅ video-chat.css

frontend/src/hooks/
└── ✅ useMeeting.ts
```

## Content-Dateien

```
frontend/src/content/
├── ✅ festungContent.ts          - Scroll GS/US/MS
├── ✅ festungQuizContent.ts      - Quiz GS
├── ✅ festungQuizContent_unterstufe.ts - Quiz US
├── ❌ festungQuizContent_mittelstufe.ts - FEHLT
│
├── ✅ werkzeugeContent.ts        - Scroll GS/US/MS
├── ✅ werkzeugeQuizContent.ts    - Quiz GS
├── ❌ werkzeugeQuizContent_unterstufe.ts - FEHLT
├── ❌ werkzeugeQuizContent_mittelstufe.ts - FEHLT
│
├── ✅ brueckenContent.ts         - Scroll GS/US/MS
├── ✅ brueckenQuizContent.ts     - Quiz GS
├── ✅ brueckenQuizContent_unterstufe.ts - Quiz US
├── ✅ brueckenQuizContent_mittelstufe.ts - Quiz MS
│
├── ✅ faedenContent.ts           - Scroll GS/US/MS
├── ❌ faedenQuizContent.ts       - FEHLT (alle Stufen)
│
├── ✅ banduraContent.ts          - Global (Schiff)
└── ✅ hattieContent.ts           - Global (Schiff)
```

---

**Letzte Aktualisierung:** 14. Januar 2025
