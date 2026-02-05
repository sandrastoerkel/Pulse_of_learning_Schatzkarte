# Claude Code Prompt für Schatzkammer-Integration

Kopiere diesen Prompt und passe ihn an dein Projekt an:

---

## PROMPT START

Ich möchte das Schatzkammer Loci-System in mein bestehendes Schatzkarte-Projekt integrieren.

### Kontext

Das Schatzkammer-Modul ist ein vollständiges React/TypeScript Feature (~10.000 Zeilen) das die Loci-Methode (Gedächtnispalast) implementiert. Es enthält:

- **Types:** Alle Datenstrukturen (Station, Room, Chamber)
- **Constants:** 6 Raum-Templates, Farb-Theme, XP-Konfiguration
- **Hooks:** State Management mit useReducer (useLociRoom, useChamber)
- **Components:** ChamberOverview, LociRoom, Modals, SVG-Backgrounds

### Mein bestehendes Projekt

[HIER DEINE PROJEKT-INFOS EINFÜGEN, z.B.:]
- Framework: React 18 + TypeScript + Vite
- Styling: [Tailwind / CSS Modules / Inline Styles]
- State: [Zustand / Context / etc.]
- Routing: [React Router / Next.js / etc.]
- Backend: [Supabase / Firebase / localStorage]

### Aufgabe

1. **Lies zuerst `CLAUDE_CODE_BRIEFING.md`** für Überblick
2. **Integriere das Modul** in mein Projekt unter `src/features/schatzkammer/`
3. **Passe an:**
   - [Falls nötig: Styling an mein Theme anpassen]
   - [Falls nötig: Routing einrichten]
   - [Falls nötig: Daten-Persistenz anbinden]

### Dateien

Die Dateien sind im Ordner `schatzkammer/` organisiert. Wichtigste zuerst:
- `CLAUDE_CODE_BRIEFING.md` - Überblick (ZUERST LESEN)
- `types/index.ts` - Alle TypeScript-Typen
- `constants/templates.ts` - Raum-Templates
- `hooks/useLociRoom.ts` - Haupt-State-Hook
- `components/room/LociRoom.tsx` - Haupt-Komponente

### Erwartetes Ergebnis

- Schatzkammer ist als Feature-Modul integriert
- Routing zu `/schatzkammer` und `/schatzkammer/room/:id`
- Daten werden [in localStorage / Supabase / etc.] gespeichert
- Alles kompiliert ohne TypeScript-Fehler

---

## PROMPT ENDE

---

## Alternative: Schrittweise Integration

Falls das Projekt zu groß ist, kannst du schrittweise vorgehen:

### Schritt 1: Basis
```
Lies CLAUDE_CODE_BRIEFING.md und types/index.ts.
Erstelle die Ordnerstruktur und kopiere die Type-Definitionen.
```

### Schritt 2: Constants
```
Integriere constants/. Passe ggf. die Farben an mein Theme an.
```

### Schritt 3: Hooks
```
Integriere hooks/. Prüfe ob useReducer-Pattern zu meinem Projekt passt.
```

### Schritt 4: Components
```
Integriere components/ schrittweise:
1. chamber/ (Übersicht)
2. room/ (Loci-Raum)
3. modals/ (Dialoge)
4. backgrounds/ (SVGs)
```

### Schritt 5: Routing + Persistenz
```
Richte Routing ein und verbinde mit meinem Daten-Layer.
```
