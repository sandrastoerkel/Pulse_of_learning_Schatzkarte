// ============================================
// ShopItems.ts - Avatar Shop Item-Katalog
// Mit echten Avataaars-Mappings
// ============================================

import type { ShopItem, ItemSlot } from '@/types/legacy-ui';

export const SHOP_ITEMS: ShopItem[] = [
  // ═══════════════════════════════════════
  // HÜTE (slot: 'hat') - Ändern topType
  // ═══════════════════════════════════════
  {
    id: 'winter-hat-red',
    name: 'Wintermütze Rot',
    description: 'Warm und gemütlich! (GRATIS)',
    icon: '🧢',
    slot: 'hat',
    price: 0,
    rarity: 'common',
    avataaarsMapping: {
      property: 'topType',
      value: 'WinterHat1'
    }
  },
  {
    id: 'winter-hat-blue',
    name: 'Wintermütze Blau',
    description: 'Coole blaue Mütze',
    icon: '🧢',
    slot: 'hat',
    price: 50,
    rarity: 'common',
    avataaarsMapping: {
      property: 'topType',
      value: 'WinterHat2'
    }
  },
  {
    id: 'winter-hat-green',
    name: 'Wintermütze Grün',
    description: 'Natur-Look Mütze',
    icon: '🧢',
    slot: 'hat',
    price: 50,
    rarity: 'common',
    avataaarsMapping: {
      property: 'topType',
      value: 'WinterHat3'
    }
  },
  {
    id: 'classic-hat',
    name: 'Klassischer Hut',
    description: 'Zeitloser Stil',
    icon: '🎩',
    slot: 'hat',
    price: 100,
    rarity: 'rare',
    avataaarsMapping: {
      property: 'topType',
      value: 'Hat'
    }
  },
  {
    id: 'turban',
    name: 'Eleganter Turban',
    description: 'Königlicher Look',
    icon: '👳',
    slot: 'hat',
    price: 150,
    rarity: 'rare',
    avataaarsMapping: {
      property: 'topType',
      value: 'Turban'
    }
  },
  {
    id: 'hijab',
    name: 'Hijab',
    description: 'Elegant und stilvoll',
    icon: '🧕',
    slot: 'hat',
    price: 80,
    rarity: 'common',
    avataaarsMapping: {
      property: 'topType',
      value: 'Hijab'
    }
  },
  {
    id: 'pirate-eyepatch',
    name: 'Piraten-Look',
    description: 'Arr! Augenklappe!',
    icon: '🏴‍☠️',
    slot: 'hat',
    price: 120,
    rarity: 'rare',
    avataaarsMapping: {
      property: 'topType',
      value: 'Eyepatch'
    }
  },

  // ═══════════════════════════════════════
  // BRILLEN (slot: 'glasses') - Ändern accessoriesType
  // ═══════════════════════════════════════
  {
    id: 'sunglasses',
    name: 'Sonnenbrille',
    description: 'Cool und stylisch! (GRATIS)',
    icon: '😎',
    slot: 'glasses',
    price: 0,
    rarity: 'common',
    avataaarsMapping: {
      property: 'accessoriesType',
      value: 'Sunglasses'
    }
  },
  {
    id: 'round-glasses',
    name: 'Runde Brille',
    description: 'Hipster-Style',
    icon: '👓',
    slot: 'glasses',
    price: 60,
    rarity: 'common',
    avataaarsMapping: {
      property: 'accessoriesType',
      value: 'Round'
    }
  },
  {
    id: 'prescription-glasses',
    name: 'Lesebrille',
    description: 'Für kluge Köpfe',
    icon: '🤓',
    slot: 'glasses',
    price: 50,
    rarity: 'common',
    avataaarsMapping: {
      property: 'accessoriesType',
      value: 'Prescription01'
    }
  },
  {
    id: 'prescription-glasses-2',
    name: 'Designer-Brille',
    description: 'Moderner Look',
    icon: '👁️',
    slot: 'glasses',
    price: 80,
    rarity: 'rare',
    avataaarsMapping: {
      property: 'accessoriesType',
      value: 'Prescription02'
    }
  },
  {
    id: 'wayfarers',
    name: 'Wayfarer',
    description: 'Klassiker!',
    icon: '🕶️',
    slot: 'glasses',
    price: 100,
    rarity: 'rare',
    avataaarsMapping: {
      property: 'accessoriesType',
      value: 'Wayfarers'
    }
  },
  {
    id: 'kurt-glasses',
    name: 'Kurt-Brille',
    description: 'Rockstar-Vibes',
    icon: '🎸',
    slot: 'glasses',
    price: 150,
    rarity: 'epic',
    avataaarsMapping: {
      property: 'accessoriesType',
      value: 'Kurt'
    }
  },

  // ═══════════════════════════════════════
  // EFFEKTE (slot: 'effect') - Aura um Avatar
  // ═══════════════════════════════════════
  {
    id: 'sparkle-aura',
    name: 'Glitzeraura',
    description: 'Funkelt wunderschön',
    icon: '✨',
    slot: 'effect',
    price: 150,
    rarity: 'rare',
    visualData: { color: 'rgba(255, 215, 0, 0.4)' }
  },
  {
    id: 'fire-aura',
    name: 'Feueraura',
    description: 'Brennende Leidenschaft',
    icon: '🔥',
    slot: 'effect',
    price: 250,
    rarity: 'epic',
    visualData: { color: 'rgba(255, 100, 50, 0.4)' }
  },
  {
    id: 'ice-aura',
    name: 'Eisaura',
    description: 'Kühl und fokussiert',
    icon: '❄️',
    slot: 'effect',
    price: 250,
    rarity: 'epic',
    visualData: { color: 'rgba(100, 200, 255, 0.4)' }
  },
  {
    id: 'rainbow-aura',
    name: 'Regenbogen',
    description: 'Alle Farben des Regenbogens!',
    icon: '🌈',
    slot: 'effect',
    price: 500,
    rarity: 'legendary',
    visualData: { color: 'linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6)' }
  },
  {
    id: 'nature-aura',
    name: 'Naturaura',
    description: 'Im Einklang mit der Natur',
    icon: '🌿',
    slot: 'effect',
    price: 200,
    rarity: 'rare',
    visualData: { color: 'rgba(100, 200, 100, 0.4)' }
  },

  // ═══════════════════════════════════════
  // RAHMEN (slot: 'frame') - Rahmen um Avatar
  // ═══════════════════════════════════════
  {
    id: 'gold-frame',
    name: 'Goldrahmen',
    description: 'Glänzend und edel',
    icon: '🥇',
    slot: 'frame',
    price: 150,
    rarity: 'rare',
    visualData: { borderColor: 'var(--fb-reward)' }
  },
  {
    id: 'diamond-frame',
    name: 'Diamantrahmen',
    description: 'Strahlend schön',
    icon: '💎',
    slot: 'frame',
    price: 400,
    rarity: 'legendary',
    visualData: { borderColor: '#00BFFF' }
  },
  {
    id: 'nature-frame',
    name: 'Naturrahmen',
    description: 'Natürlich schön',
    icon: '🌿',
    slot: 'frame',
    price: 100,
    rarity: 'common',
    visualData: { borderColor: '#4ade80' }
  },
  {
    id: 'fire-frame',
    name: 'Feuerrahmen',
    description: 'Heiß!',
    icon: '🔥',
    slot: 'frame',
    price: 180,
    rarity: 'rare',
    visualData: { borderColor: '#ff6b35' }
  },
  {
    id: 'purple-frame',
    name: 'Mystischer Rahmen',
    description: 'Geheimnisvoll',
    icon: '🔮',
    slot: 'frame',
    price: 120,
    rarity: 'rare',
    visualData: { borderColor: '#9b59b6' }
  }
];

// ═══════════════════════════════════════
// HELPER FUNKTIONEN
// ═══════════════════════════════════════

export function getItemsBySlot(slot: ItemSlot): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.slot === slot);
}

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id);
}

export function getItemsByRarity(rarity: ShopItem['rarity']): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.rarity === rarity);
}

// Kategorie-Definitionen für die Tab-Navigation
// Nur noch hat, glasses, effect, frame (accessory und cape entfernt da keine Avataaars-Mappings)
export const SHOP_CATEGORIES: { slot: ItemSlot; icon: string; label: string }[] = [
  { slot: 'hat', icon: '🧢', label: 'Hüte' },
  { slot: 'glasses', icon: '👓', label: 'Brillen' },
  { slot: 'effect', icon: '✨', label: 'Effekte' },
  { slot: 'frame', icon: '🖼️', label: 'Rahmen' }
];
