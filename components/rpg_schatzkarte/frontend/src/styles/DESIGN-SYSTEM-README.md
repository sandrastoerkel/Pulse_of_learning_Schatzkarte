# CLAUDE-CODE-INSTRUCTIONS.md
# Schatzkarte UI Redesign — Implementierungs-Anleitung für Claude Code

## Übersicht

Dieses Paket enthält die **vollständig überarbeiteten** CSS- und TypeScript-Dateien für das Schatzkarte UI-Redesign. Das Designsystem wechselt von einem "Fantasy RPG" Look (Gold/Braun/Pergament) zu einem **"Cool UI / Warm Map"** System.

### Kern-Philosophie
- **UI Chrome** (Panels, Buttons, Modals) → Kühles Petrol-Blau, professionell
- **Map World** (Inseln, SVG-Icons, Wellen) → Bleibt warm/illustriert  
- **Feedback** (Rewards, XP, Achievements) → Farbige Akzente, NUR wenn verdient

---

## Dateien in diesem Paket

| Datei | Pfad im Projekt | Status |
|-------|-----------------|--------|
| `design-tokens.css` | `src/styles/design-tokens.css` | **NEU** — Single Source of Truth |
| `illustrated-map.css` | `src/styles/illustrated-map.css` | **KOMPLETT ÜBERARBEITET** |
| `rpg-theme.css` | `src/styles/rpg-theme.css` | **KOMPLETT ÜBERARBEITET** |
| `reward-modal.css` | `src/components/mini-games/reward-modal.css` | **KOMPLETT ÜBERARBEITET** |
| `theme.ts` | `src/config/theme.ts` UND `src/components/schatzkammer/constants/theme.ts` | **KOMPLETT ÜBERARBEITET** |

---

## Implementierungs-Reihenfolge

### Phase 1: Design Tokens einbinden

1. **Erstelle** `src/styles/design-tokens.css` mit dem Inhalt der mitgelieferten Datei
2. **Importiere** design-tokens.css als ERSTE CSS-Datei in deinem Einstiegspunkt:

```tsx
// In App.tsx oder index.tsx — MUSS vor allen anderen CSS-Imports stehen
import './styles/design-tokens.css';
import './styles/rpg-theme.css';
import './styles/illustrated-map.css';
```

3. **Prüfe** ob die Ladereihenfolge stimmt: `design-tokens.css` → `rpg-theme.css` → `illustrated-map.css`

### Phase 2: CSS-Dateien ersetzen

1. **Ersetze** `rpg-theme.css` mit der mitgelieferten Version
2. **Ersetze** `illustrated-map.css` mit der mitgelieferten Version
3. **Ersetze** `reward-modal.css` (in der mini-games Komponente) mit der mitgelieferten Version

### Phase 3: TypeScript Theme Sync

1. **Ersetze** `src/config/theme.ts` mit der mitgelieferten Version
2. **Ersetze** `src/components/schatzkammer/constants/theme.ts` mit **derselben** Datei
   - ⚠️ Diese Datei ist ein Duplikat. Idealerweise als Re-Export umbauen:
   ```ts
   // schatzkammer/constants/theme.ts — wird zu Re-Export
   export * from '../../../config/theme';
   ```
   - Falls Import-Pfade Probleme machen: Beide Dateien identisch halten

### Phase 4: Suche nach verbleibenden Hardcoded-Farben

Führe folgende Suche im gesamten Projekt durch:

```bash
# Finde alle TSX/CSS-Dateien die noch alte Farben verwenden
grep -rn "#FFD700\|#ffd700\|#3d2914\|#8b5a2b\|#f5e6d3\|#f4e4bc" src/ --include="*.tsx" --include="*.css" --include="*.ts"
```

Für jeden Fund:
- `#FFD700` / `#ffd700` → Ersetze durch `var(--fb-reward)` (CSS) oder `FEEDBACK.reward` (TS)
- `#3d2914` / `#8b5a2b` → Ersetze durch `var(--ui-surface)` (CSS) oder `UI.surface` (TS)
- `#f5e6d3` / `#f4e4bc` → Ersetze durch `var(--ui-text)` (CSS) oder `UI.text` (TS)

---

## Design Token Referenz

### UI Layer (`--ui-*`) — Interface Chrome

| Token | Wert | Verwendung |
|-------|------|------------|
| `--ui-base` | `#0c1a2a` | Tiefster Hintergrund |
| `--ui-surface` | `#163045` | Panels, Cards, Modals |
| `--ui-surface-hover` | `#1c3a55` | Hover-States |
| `--ui-border` | `#1e3a52` | Alle Ränder |
| `--ui-text` | `#e2e8f0` | Primärtext (kühles Weiß) |
| `--ui-text-muted` | `#8899aa` | Sekundärtext |
| `--ui-text-disabled` | `#556677` | Deaktivierter Text |
| `--ui-action` | `#0ea5e9` | CTAs, Links (Cyan) |
| `--ui-action-hover` | `#38bdf8` | Hover-State des CTA |
| `--ui-action-subtle` | `rgba(14,165,233,0.12)` | Hintergrund bei Selection |

### Feedback Layer (`--fb-*`) — Nur bei verdienten Momenten

| Token | Wert | Wann |
|-------|------|------|
| `--fb-success` | `#34d399` | Richtige Antwort, Abschluss |
| `--fb-reward` | `#f59e0b` | Gold verdient, XP gewonnen |
| `--fb-epic` | `#a855f7` | Seltene Achievements, Level-Up |
| `--fb-error` | `#ef4444` | Falsche Antwort, Gefahr |

### Map Layer (`--map-*`) — NUR auf der Kartenfläche

| Token | Wert | Verwendung |
|-------|------|------------|
| `--map-gold` | `#c9a227` | SVG-Icon Glows (nur Map) |
| `--map-ocean` | `#1a3a5c` | Ozean-Hintergrund |
| `--map-sand` | `#f5deb3` | Inseln, Sand |

**⚠️ NIEMALS Map-Tokens in UI-Panels, Modals oder Buttons verwenden!**

---

## Verbotene Muster (BANNED)

### Farben in UI-Elementen
```css
/* ❌ VERBOTEN in Panels/Modals/Buttons */
color: #FFD700;
background: linear-gradient(135deg, #3d2914, #2a1d0f);
border: 3px solid #c9a227;
color: #f5e6d3;

/* ✅ RICHTIG */
color: var(--ui-text);
background: var(--ui-surface);
border: 2px solid var(--ui-border);
color: var(--ui-text);
```

### Infinite Animationen
```css
/* ❌ VERBOTEN — kein infinite in dekorativen Elementen */
animation: goldShine 2s ease-in-out infinite;
animation: brainPulse 2s ease-in-out infinite;
animation: shopBounce 2s ease-in-out infinite;
animation: companion-glow-pulse 3s ease-in-out infinite;
animation: currentPulse 2s ease-in-out infinite;

/* ✅ ERLAUBT — einmalige, JS-getriggerte Animationen */
animation: goldPopup 1s ease-out forwards;
animation: levelUp 2s ease-out forwards;
animation: confettiFall 3s ease-out forwards;
```

**Einzige Ausnahme:** Map-Elemente (Schiffe, Wellen) dürfen `infinite` verwenden, weil sie zur Map-Welt gehören.

### Fonts
```css
/* ❌ VERBOTEN in UI */
font-family: 'Cinzel', serif;
font-family: 'Georgia', serif;

/* ✅ RICHTIG in UI */
font-family: var(--font-ui);  /* = Inter, system-ui, sans-serif */

/* ✅ ERLAUBT nur für Karten-Labels */
font-family: var(--font-map); /* = Cinzel */
```

---

## Komponenten-Spezifische Hinweise

### Buttons — 3-Stufen-Hierarchie

```css
/* Primary CTA (einmal pro Screen) */
.btn-primary {
  background: var(--ui-action);
  color: var(--ui-base);
}

/* Secondary (häufig) */
.btn-secondary {
  background: var(--ui-surface);
  color: var(--ui-text);
  border: 1px solid var(--ui-border);
}

/* Ghost/Danger */
.btn-danger {
  background: var(--fb-error);
  color: white;
}
```

### Bottom-Nav Widgets (Memory-Game, Runner, Avatar-Shop)

Alle Bottom-Nav Widgets folgen dem **gleichen** Pattern:
```css
.widget {
  background: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: 14px;
}
.widget:hover {
  border-color: var(--ui-action);
  background: var(--ui-surface-hover);
}
/* KEINE Gradients, KEINE infinite Animationen, KEIN Gold-Border */
```

### Modals

```css
.modal {
  background: var(--ui-surface);
  border: 2px solid var(--ui-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
.modal-header {
  background: var(--ui-base);
  border-bottom: 1px solid var(--ui-border);
}
.modal-close {
  background: transparent;
  color: var(--ui-text-muted);
}
```

### Progress Bars

```css
.progress-track {
  background: var(--ui-base);
  height: 8px;
  border-radius: 4px;
}
.progress-fill {
  background: linear-gradient(90deg, var(--ui-action), var(--fb-success));
  box-shadow: 0 0 6px rgba(14, 165, 233, 0.3);
}
```

### Quiz Answer States

```css
.answer-btn { border: 2px solid var(--ui-border); }
.answer-btn:hover { border-color: var(--ui-action); }
.answer-btn.correct { border-color: var(--fb-success); background: var(--fb-success-subtle); }
.answer-btn.wrong { border-color: var(--fb-error); background: var(--fb-error-subtle); }
```

---

## Inline-Styles in React-Komponenten

Suche nach hardcoded Farben in TSX-Dateien:

```bash
grep -rn "FFD700\|ffd700\|3d2914\|8b5a2b\|f5e6d3\|f4e4bc\|c9a227" src/ --include="*.tsx"
```

Ersetze Inline-Styles durch Token-Referenzen:

```tsx
// ❌ ALT
style={{ color: '#FFD700', background: '#3d2914' }}

// ✅ NEU — Option A: CSS Custom Properties
style={{ color: 'var(--fb-reward)', background: 'var(--ui-surface)' }}

// ✅ NEU — Option B: TypeScript Constants
import { UI, FEEDBACK } from '../config/theme';
style={{ color: FEEDBACK.reward, background: UI.surface }}
```

---

## TypeScript Theme Migration

### Alte Imports → Neue Imports

```tsx
// ❌ ALT
import { GOLD, DARK } from '../config/theme';
const color = GOLD.primary;  // #FFD700
const bg = DARK.base;        // #1a1a2e

// ✅ NEU
import { UI, FEEDBACK } from '../config/theme';
const color = FEEDBACK.reward;  // #f59e0b
const bg = UI.base;             // #0c1a2a
```

GOLD und DARK existieren noch als `@deprecated` Wrapper, funktionieren also weiterhin — aber neue Referenzen sollten UI/FEEDBACK verwenden.

---

## Checkliste nach Implementierung

- [ ] `design-tokens.css` wird als erstes CSS geladen
- [ ] Kein `#FFD700` mehr in UI-Komponenten (nur in Map-SVGs erlaubt)
- [ ] Kein `linear-gradient` mit Braun/Gold in Panels/Modals
- [ ] Kein `font-family: Cinzel` außer in `.map-label`
- [ ] Keine `animation: ... infinite` in UI-Elementen (nur Map-Welt)
- [ ] Alle Buttons folgen dem 3-Stufen-System
- [ ] Alle Bottom-Nav Widgets haben einheitlichen Petrol-Style
- [ ] Progress Bars: 8px Höhe, Cyan→Green Gradient
- [ ] `theme.ts` verwendet `UI` und `FEEDBACK` statt `GOLD` und `DARK`
- [ ] Schatzkammer `theme.ts` ist synced mit `config/theme.ts`

---

## Verifikation

```bash
# Quick-Check: Keine verbotenen Farben mehr in CSS
grep -rn "#FFD700\|#ffd700\|#3d2914\|#8b5a2b" src/styles/ --include="*.css" | grep -v "BANNED\|map-only\|--gold:"

# Quick-Check: Keine infinite Animationen in UI
grep -rn "infinite" src/styles/ --include="*.css" | grep -v "REMOVED\|/* \|ship\|wave\|float.*ship\|ocean"

# Quick-Check: Keine Cinzel in UI
grep -rn "Cinzel\|serif" src/styles/ --include="*.css" | grep -v "map-label\|font-map\|theme-nintendo\|theme-pixel"
```

---

## Hinweis zu Alternative-Themes

Die rpg-theme.css enthält alternative Theme-Varianten (`.theme-nintendo`, `.theme-pixel`, `.theme-space`). Diese wurden **nicht** vollständig migriert, da sie ohnehin separate Designs sind. Für die Haupt-App (Standard-Theme) sind alle Änderungen durchgeführt. Falls die Alt-Themes auch migriert werden sollen: gleiches Muster anwenden.
