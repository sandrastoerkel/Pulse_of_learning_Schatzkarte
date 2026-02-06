// ============================================
// Guest Mode Configuration
// Speichert welche Inseln für Gäste freigeschaltet sind
// ============================================

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

export interface GuestModeConfig {
  unlockedIslands: string[];
  bannerText: string;
  showBanner: boolean;
}

// ═══════════════════════════════════════
// DEFAULTS & PRESETS
// ═══════════════════════════════════════

export const DEFAULT_BANNER_TEXT = 'Du erkundest die Schatzkarte als Gast. Melde dich an, um deinen Fortschritt zu speichern!';

export const DEFAULT_GUEST_CONFIG: GuestModeConfig = {
  unlockedIslands: ['start', 'festung', 'werkzeuge'],
  bannerText: DEFAULT_BANNER_TEXT,
  showBanner: true,
};

// Preset-Definitionen
export const GUEST_PRESETS = {
  minimal: {
    name: 'Minimal',
    description: 'Nur Starthafen',
    islands: ['start'],
  },
  standard: {
    name: 'Standard',
    description: '3 Kern-Inseln',
    islands: ['start', 'festung', 'werkzeuge'],
  },
  erweitert: {
    name: 'Erweitert',
    description: '6 Inseln zum Erkunden',
    islands: ['start', 'festung', 'werkzeuge', 'bruecken', 'faeden', 'spiegel_see'],
  },
  alle: {
    name: 'Alle',
    description: 'Komplette Karte',
    islands: [
      'start', 'festung', 'werkzeuge', 'bruecken', 'faeden',
      'spiegel_see', 'vulkan', 'ruhe_oase', 'ausdauer_gipfel',
      'fokus_leuchtturm', 'wachstum_garten', 'lehrer_turm',
      'wohlfuehl_dorf', 'schutz_burg', 'meister_berg'
    ],
  },
} as const;

export type PresetKey = keyof typeof GUEST_PRESETS;

// ═══════════════════════════════════════
// LOCALSTORAGE
// ═══════════════════════════════════════

const STORAGE_KEY = 'schatzkarte_guest_config';

export function loadGuestConfig(): GuestModeConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_GUEST_CONFIG,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn('Fehler beim Laden der Gast-Konfiguration:', e);
  }
  return DEFAULT_GUEST_CONFIG;
}

export function saveGuestConfig(config: GuestModeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Fehler beim Speichern der Gast-Konfiguration:', e);
  }
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════

export function getActivePreset(unlockedIslands: string[]): PresetKey | null {
  for (const [key, preset] of Object.entries(GUEST_PRESETS)) {
    if (
      preset.islands.length === unlockedIslands.length &&
      preset.islands.every(id => unlockedIslands.includes(id))
    ) {
      return key as PresetKey;
    }
  }
  return null; // Custom configuration
}
