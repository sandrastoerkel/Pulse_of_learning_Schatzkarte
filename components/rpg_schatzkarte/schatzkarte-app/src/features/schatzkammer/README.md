# Schatzkammer Loci-System

## ✅ Alle Schritte abgeschlossen

| Schritt | Status |
|---------|--------|
| 1 - Fundament (Types + Constants) | ✅ |
| 2 - State Management (Hooks) | ✅ |
| 3 - Chamber-Komponenten | ✅ |
| 4 - Room-Komponenten | ✅ |
| 5 - Modals | ✅ |
| 6 - SVG-Hintergründe | ✅ |

**Gesamt: 33 Dateien, ~10.000 Zeilen TypeScript/React**

---

### Struktur

```
schatzkammer/
├── index.ts                    # Public API (182 Zeilen)
├── types/
│   └── index.ts                # TypeScript-Definitionen (396 Zeilen)
├── constants/
│   ├── index.ts                # Zentrale Exports
│   ├── artifacts.ts            # Artefakt-Typen
│   ├── templates.ts            # 6 Raum-Templates (687 Zeilen)
│   └── theme.ts                # Farben, XP, Animationen
├── utils/
│   └── index.ts                # Utility-Funktionen (351 Zeilen)
├── hooks/
│   ├── index.ts                # Hook-Exports
│   ├── lociRoomReducer.ts      # Reducer für Loci-Raum (526 Zeilen)
│   ├── useLociRoom.ts          # Hook für Raum-State (392 Zeilen)
│   ├── chamberReducer.ts       # Reducer für Übersicht (250 Zeilen)
│   ├── useChamber.ts           # Hook für Chamber-State (293 Zeilen)
│   └── useSpacedRepetition.ts  # Spaced Repetition Logik (302 Zeilen)
└── components/
    ├── index.ts                # Komponenten-Exports (52 Zeilen)
    ├── chamber/
    │   ├── ChamberOverview.tsx # Hauptseite (468 Zeilen)
    │   ├── RoomCard.tsx        # Raum-Karte (350 Zeilen)
    │   ├── CreateRoomModal.tsx # Neuer Raum (549 Zeilen)
    │   └── DeleteRoomModal.tsx # Lösch-Dialog (283 Zeilen)
    ├── room/
    │   ├── LociRoom.tsx        # Haupt-Container (356 Zeilen)
    │   ├── Slot.tsx            # Interaktiver Slot (281 Zeilen)
    │   ├── JourneyPath.tsx     # SVG-Pfad (280 Zeilen)
    │   └── RoomHeader.tsx      # Header mit Modi (357 Zeilen)
    ├── modals/
    │   ├── StationModal.tsx    # View/Edit/Journey (709 Zeilen)
    │   ├── AddStationModal.tsx # Neue Station (569 Zeilen)
    │   ├── ResultsModal.tsx    # Rundgang-Ergebnis (432 Zeilen)
    │   └── OrderPanel.tsx      # Reihenfolge-Editor (329 Zeilen)
    └── backgrounds/
        ├── index.ts            # Exports + Mapping
        ├── WizardTower.tsx     # Zaubererturm (313 Zeilen)
        ├── PirateCave.tsx      # Piratenhöhle (352 Zeilen)
        └── SpaceStation.tsx    # Raumstation (356 Zeilen)
```

---

## Schritt 6: SVG-Hintergründe

### WizardTower (Zaubererturm)

Magische Atmosphäre mit:
- Steinmauer-Textur
- Bücherregal mit Büchern
- Magischer Spiegel mit Edelsteinen
- Schwebende Kerzen mit Glow
- Zaubertrank-Kessel mit Blasen
- Kristallkugel auf Ständer
- Teleskop
- Ritterrüstung
- Fenster mit Sternen und Mond
- Wandfackeln
- Magische Runen auf dem Boden
- Spinnweben in den Ecken
- Funkelnde Sterne

### PirateCave (Piratenhöhle)

Höhlenatmosphäre mit:
- Stalaktiten an der Decke
- Felswände mit Textur
- Wasserpool mit Wellen
- Schatzhaufen mit Goldmünzen und Edelsteinen
- Steuerrad
- Kartentisch mit Schatzkarte
- Großer Anker
- Rumfässer (stehend + liegend)
- Kanone mit Kanonenkugeln
- Schiffslaterne
- Piratenflagge (Totenkopf)
- Skelett
- Schatztruhe mit überlaufendem Gold
- Wandfackeln
- Seil

### SpaceStation (Raumstation)

Futuristisches Sci-Fi-Design mit:
- Sternenfeld-Hintergrund
- Entfernter Planet mit Ringen
- Nebel-Effekte
- Kontrollpulte mit Bildschirmen
- Hexagon-Muster
- Roboter-Assistent mit leuchtenden Augen
- Hologramm-Display (rotierender Planet)
- Labor-Station mit Mikroskop
- Kryo-Kapsel
- Frachtraum mit Kisten
- Kommunikations-Array
- Hydroponik-Garten
- Raumanzug
- Reaktorkern mit Glow
- Airlock-Tür
- Decken-/Bodenbeleuchtung

---

## Verwendung

### Hintergründe mit LociRoom

```tsx
import { LociRoom, WizardTower, getBackgroundComponent } from './schatzkammer';

// Option 1: Direkte Komponente
<LociRoom
  room={room}
  stations={stations}
  BackgroundComponent={WizardTower}
  // ...
/>

// Option 2: Automatisch basierend auf Template
const Background = getBackgroundComponent(room.templateId);
<LociRoom
  room={room}
  stations={stations}
  BackgroundComponent={Background}
  // ...
/>
```

### BACKGROUND_COMPONENTS Mapping

```ts
import { BACKGROUND_COMPONENTS } from './schatzkammer';

// Aktuell verfügbar:
// 'wizard-tower' → WizardTower
// 'pirate-cave' → PirateCave  
// 'space-station' → SpaceStation

// Fehlende Templates (können später hinzugefügt werden):
// 'dragon-castle' → DragonCastle
// 'ancient-temple' → AncientTemple
// 'treehouse' → Treehouse
```

---

## SVG Design-Patterns

### Gradients

Jeder Hintergrund verwendet:
- Background-Gradient (Atmosphäre)
- Metall/Material-Gradients
- Glow-Effekte (radial)

### Filters

- `glow` - Weicher Leuchteffekt
- `strong-glow` - Intensiver Leuchteffekt
- `shadow` - Drop-Shadow

### Patterns

- Texturen (Stein, Hex-Grid)
- Wiederholende Elemente

### Responsive Scaling

```tsx
<WizardTower scale={0.8} />
```

Der `scale`-Parameter wird auf width/height angewendet, viewBox bleibt konstant (1000×600).

---

## Statistiken (Final)

| Schritt | Dateien | Zeilen |
|---------|---------|--------|
| 1 - Types & Constants | 7 | ~2.000 |
| 2 - Hooks | 6 | ~1.800 |
| 3 - Chamber Components | 6 | ~1.700 |
| 4 - Room Components | 5 | ~1.300 |
| 5 - Modals | 5 | ~2.100 |
| 6 - Backgrounds | 4 | ~1.100 |
| **Gesamt** | **33** | **~10.000** |

**TypeScript: `strict: true`, 0 Fehler**

---

## Features Übersicht

### Loci-Methode
- 6 thematische Raum-Templates
- 8-14 Slots pro Template
- Visueller Rundgang-Pfad
- Slot-basierte Stationen

### Gamification
- XP-System (Mastered/Almost/Practice)
- Perfect-Bonus (+25 XP)
- Status-Badges und Farben
- Konfetti-Animation bei Erfolg

### Spaced Repetition
- Review-Intervalle (1/3/7 Tage)
- Prioritäts-Algorithmus
- Optimale Journey-Reihenfolge
- Review-Erinnerungen

### UI/UX
- Gold-Theme (Schatzkarte-Branding)
- Dark Mode
- Responsive Design
- Keyboard-Support
- Animationen (Glow, Pulse, Float)

---

## Integration

Das Modul ist vollständig self-contained und kann direkt in ein React-Projekt integriert werden:

```tsx
import {
  // Hooks
  useChamber,
  useLociRoom,
  useSpacedRepetition,
  
  // Components
  ChamberOverview,
  LociRoom,
  StationModal,
  
  // Backgrounds
  getBackgroundComponent,
  
  // Types
  Room,
  Station,
  TemplateId,
} from './features/schatzkammer';
```
