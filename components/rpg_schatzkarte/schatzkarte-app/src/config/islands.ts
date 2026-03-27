// ============================================
// Islands Config — zentrale Insel-Definition
// Quelle: frontend/src/App.tsx DEFAULT_ISLANDS (Zeile 78-98)
// ============================================

import type { Island } from '@/types/legacy-ui';

// ─── Alle 15 Inseln ─────────────────────────────────────────────────────────
// DIRECT: 1:1 aus dem alten DEFAULT_ISLANDS Array

export const DEFAULT_ISLANDS: Island[] = [
  // Base Camp
  { id: 'start', name: 'Base Camp', icon: '🏕️', color: '#4fc3f7', week: 0, treasures: [{ name: 'Kompass der Reise', icon: '🧭', xp: 20 }] },
  // Feste Inseln (Woche 1-4)
  { id: 'festung', name: 'Mental stark', icon: '💪', color: '#ffb74d', week: 1, treasures: [{ name: 'Kleine Siege', icon: '💎', xp: 50 }, { name: 'Vorbilder', icon: '💎', xp: 50 }] },
  { id: 'werkzeuge', name: 'Cleverer lernen', icon: '📚', color: '#81c784', week: 2, treasures: [{ name: 'Magische Tomate', icon: '🍅', xp: 50 }, { name: 'Erinnerungs-Spiegel', icon: '🔄', xp: 50 }] },
  { id: 'bruecken', name: 'Transferlernen', icon: '🌉', color: '#fff176', week: 3, treasures: [{ name: 'Teil weg = Minus', icon: '🌉', xp: 60 }] },
  { id: 'faeden', name: 'Station der Fäden', icon: '🧵', color: '#ba68c8', week: 4, treasures: [{ name: 'Faden-Spule', icon: '🧵', xp: 50 }, { name: 'Netz-Karte', icon: '🕸', xp: 60 }] },
  // Flexible Inseln (Woche 5-13)
  { id: 'spiegel_see', name: 'Über dein Lernen nachdenken', icon: '🧠', color: '#90caf9', week: 5, treasures: [{ name: 'Spiegel der Erkenntnis', icon: '🪞', xp: 50 }] },
  { id: 'vulkan', name: 'Was dich antreibt', icon: '🔥', color: '#ef5350', week: 6, treasures: [{ name: 'Freiheits-Flamme', icon: '🔥', xp: 50 }] },
  { id: 'ruhe_oase', name: 'Weniger Stress beim Lernen', icon: '😌', color: '#80deea', week: 7, treasures: [{ name: 'Atem-Brunnen', icon: '🌬', xp: 50 }] },
  { id: 'ausdauer_gipfel', name: 'Länger dranbleiben können', icon: '🏆', color: '#ffcc80', week: 8, treasures: [{ name: 'Kletter-Seil', icon: '🧗', xp: 50 }] },
  { id: 'fokus_leuchtturm', name: 'Fokus halten', icon: '🎯', color: '#ffab91', week: 9, treasures: [{ name: 'Fokus-Licht', icon: '💡', xp: 50 }] },
  { id: 'wachstum_garten', name: 'Glauben, dass du wachsen kannst', icon: '🌱', color: '#c5e1a5', week: 10, treasures: [{ name: 'Das Wort NOCH', icon: '🌱', xp: 50 }] },
  { id: 'lehrer_turm', name: 'Besser mit Lehrern klarkommen', icon: '🏫', color: '#b39ddb', week: 11, treasures: [{ name: 'Frage-Schlüssel', icon: '❓', xp: 50 }] },
  { id: 'wohlfuehl_dorf', name: 'Dich in der Schule wohlfühlen', icon: '🏠', color: '#a5d6a7', week: 12, treasures: [{ name: 'Mein Platz', icon: '🏡', xp: 50 }] },
  { id: 'schutz_burg', name: 'Wenn andere dich fertig machen', icon: '🛡', color: '#f48fb1', week: 13, treasures: [{ name: 'Grenzen-Schild', icon: '🛡', xp: 50 }] },
  // Finale
  { id: 'meister_berg', name: 'Berg der Meisterschaft', icon: '⛰️', color: 'var(--fb-reward)', week: 14, treasures: [{ name: 'Meister-Krone', icon: '👑', xp: 500 }] },
];

// ─── Insel-ID → Route-URL-Segment ───────────────────────────────────────────
// Mapping: Unterstriche → Bindestriche, Sonderfall 'start' → 'starthafen'
// Muss mit App.tsx Routen übereinstimmen.

export const ISLAND_ROUTES: Record<string, string> = {
  start: 'starthafen',
  festung: 'festung',
  werkzeuge: 'werkzeuge',
  bruecken: 'bruecken',
  faeden: 'faeden',
  spiegel_see: 'spiegel-see',
  vulkan: 'vulkan',
  ruhe_oase: 'ruhe-oase',
  ausdauer_gipfel: 'ausdauer-gipfel',
  fokus_leuchtturm: 'fokus-leuchtturm',
  wachstum_garten: 'wachstum-garten',
  lehrer_turm: 'lehrer-turm',
  wohlfuehl_dorf: 'wohlfuehl-dorf',
  schutz_burg: 'schutz-burg',
  meister_berg: 'meister-berg',
};

// Hilfsfunktion: Gibt die Route-URL für eine Insel-ID zurück
export function getIslandRoute(islandId: string): string {
  const segment = ISLAND_ROUTES[islandId];
  if (!segment) {
    console.warn(`No route for island: ${islandId}`);
    return '/karte';
  }
  return `/karte/${segment}`;
}
