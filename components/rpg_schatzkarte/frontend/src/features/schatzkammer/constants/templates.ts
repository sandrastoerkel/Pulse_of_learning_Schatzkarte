/**
 * Raum-Templates Konfiguration
 * 
 * Jedes Template definiert:
 * - Metadaten (Name, Beschreibung, Zielgruppe)
 * - Slots (Ablageplätze für Stationen)
 * 
 * Koordinatensystem: 0-1000 (x) × 0-600 (y), normalisiert
 * Wird zur Laufzeit auf die tatsächliche Viewport-Größe skaliert.
 */

import type { TemplateId, RoomTemplate, Slot } from '../types';

// =============================================================================
// WIZARD TOWER (Zaubererturm)
// =============================================================================

const WIZARD_TOWER_SLOTS: Slot[] = [
  {
    id: 'wt-bookshelf',
    label: 'Bücherregal',
    x: 110,
    y: 200,
    width: 80,
    height: 120,
  },
  {
    id: 'wt-mirror',
    label: 'Magischer Spiegel',
    x: 220,
    y: 80,
    width: 70,
    height: 100,
  },
  {
    id: 'wt-globe',
    label: 'Globus',
    x: 340,
    y: 240,
    width: 60,
    height: 60,
  },
  {
    id: 'wt-table',
    label: 'Großer Tisch',
    x: 500,
    y: 480,
    width: 140,
    height: 80,
  },
  {
    id: 'wt-telescope',
    label: 'Teleskop',
    x: 680,
    y: 160,
    width: 50,
    height: 100,
  },
  {
    id: 'wt-window',
    label: 'Fenster',
    x: 820,
    y: 140,
    width: 80,
    height: 100,
  },
  {
    id: 'wt-cauldron',
    label: 'Zauberkessel',
    x: 125,
    y: 480,
    width: 70,
    height: 70,
  },
  {
    id: 'wt-crystal',
    label: 'Kristallkugel',
    x: 720,
    y: 500,
    width: 50,
    height: 50,
  },
  {
    id: 'wt-chest',
    label: 'Alte Truhe',
    x: 850,
    y: 540,
    width: 80,
    height: 50,
  },
  {
    id: 'wt-armor',
    label: 'Ritterrüstung',
    x: 200,
    y: 400,
    width: 50,
    height: 100,
  },
  {
    id: 'wt-portrait',
    label: 'Zauberer-Portrait',
    x: 480,
    y: 100,
    width: 80,
    height: 100,
  },
  {
    id: 'wt-shelf',
    label: 'Wandregal',
    x: 600,
    y: 310,
    width: 90,
    height: 50,
  },
];

// =============================================================================
// PIRATE CAVE (Piratenhöhle)
// =============================================================================

const PIRATE_CAVE_SLOTS: Slot[] = [
  {
    id: 'pc-treasure-pile',
    label: 'Schatzhaufen',
    x: 150,
    y: 480,
    width: 120,
    height: 80,
  },
  {
    id: 'pc-ship-wheel',
    label: 'Steuerrad',
    x: 100,
    y: 180,
    width: 80,
    height: 80,
  },
  {
    id: 'pc-map-table',
    label: 'Kartentisch',
    x: 450,
    y: 350,
    width: 140,
    height: 80,
  },
  {
    id: 'pc-anchor',
    label: 'Anker',
    x: 850,
    y: 450,
    width: 70,
    height: 100,
  },
  {
    id: 'pc-barrel',
    label: 'Rumfass',
    x: 700,
    y: 520,
    width: 60,
    height: 60,
  },
  {
    id: 'pc-cannon',
    label: 'Kanone',
    x: 300,
    y: 520,
    width: 100,
    height: 50,
  },
  {
    id: 'pc-lantern',
    label: 'Schiffslaterne',
    x: 250,
    y: 120,
    width: 40,
    height: 60,
  },
  {
    id: 'pc-flag',
    label: 'Piratenflagge',
    x: 500,
    y: 80,
    width: 100,
    height: 80,
  },
  {
    id: 'pc-skeleton',
    label: 'Skelett',
    x: 800,
    y: 200,
    width: 60,
    height: 120,
  },
  {
    id: 'pc-chest',
    label: 'Schatztruhe',
    x: 600,
    y: 480,
    width: 80,
    height: 60,
  },
];

// =============================================================================
// SPACE STATION (Raumstation)
// =============================================================================

const SPACE_STATION_SLOTS: Slot[] = [
  {
    id: 'ss-control-panel',
    label: 'Kontrollpult',
    x: 450,
    y: 150,
    width: 160,
    height: 80,
  },
  {
    id: 'ss-window',
    label: 'Panoramafenster',
    x: 450,
    y: 50,
    width: 180,
    height: 80,
  },
  {
    id: 'ss-robot',
    label: 'Roboter-Assistent',
    x: 150,
    y: 350,
    width: 70,
    height: 100,
  },
  {
    id: 'ss-hologram',
    label: 'Hologramm-Display',
    x: 750,
    y: 180,
    width: 100,
    height: 100,
  },
  {
    id: 'ss-airlock',
    label: 'Luftschleuse',
    x: 900,
    y: 300,
    width: 60,
    height: 120,
  },
  {
    id: 'ss-lab',
    label: 'Labor-Station',
    x: 100,
    y: 150,
    width: 100,
    height: 80,
  },
  {
    id: 'ss-cryopod',
    label: 'Kryokapsel',
    x: 850,
    y: 500,
    width: 70,
    height: 90,
  },
  {
    id: 'ss-storage',
    label: 'Frachtraum',
    x: 250,
    y: 500,
    width: 100,
    height: 70,
  },
  {
    id: 'ss-communication',
    label: 'Kommunikations-Array',
    x: 600,
    y: 350,
    width: 80,
    height: 80,
  },
  {
    id: 'ss-plant',
    label: 'Hydroponik-Garten',
    x: 100,
    y: 500,
    width: 90,
    height: 70,
  },
  {
    id: 'ss-suit',
    label: 'Raumanzug',
    x: 350,
    y: 350,
    width: 50,
    height: 100,
  },
  {
    id: 'ss-engine',
    label: 'Antriebskern',
    x: 700,
    y: 500,
    width: 100,
    height: 80,
  },
];

// =============================================================================
// DRAGON CASTLE (Drachenburg)
// =============================================================================

const DRAGON_CASTLE_SLOTS: Slot[] = [
  {
    id: 'dc-throne',
    label: 'Thron',
    x: 450,
    y: 150,
    width: 100,
    height: 120,
  },
  {
    id: 'dc-dragon-egg',
    label: 'Drachenei',
    x: 750,
    y: 480,
    width: 60,
    height: 60,
  },
  {
    id: 'dc-fireplace',
    label: 'Kamin',
    x: 150,
    y: 200,
    width: 100,
    height: 120,
  },
  {
    id: 'dc-weapon-rack',
    label: 'Waffenständer',
    x: 850,
    y: 200,
    width: 60,
    height: 120,
  },
  {
    id: 'dc-tapestry',
    label: 'Wandteppich',
    x: 300,
    y: 80,
    width: 80,
    height: 100,
  },
  {
    id: 'dc-banquet-table',
    label: 'Bankett-Tisch',
    x: 400,
    y: 450,
    width: 180,
    height: 80,
  },
  {
    id: 'dc-shield',
    label: 'Drachenschild',
    x: 650,
    y: 100,
    width: 60,
    height: 80,
  },
  {
    id: 'dc-torch',
    label: 'Fackel',
    x: 100,
    y: 350,
    width: 40,
    height: 80,
  },
  {
    id: 'dc-treasure',
    label: 'Goldschatz',
    x: 200,
    y: 520,
    width: 100,
    height: 60,
  },
  {
    id: 'dc-statue',
    label: 'Drachenstatue',
    x: 800,
    y: 380,
    width: 80,
    height: 120,
  },
];

// =============================================================================
// ANCIENT TEMPLE (Antiker Tempel)
// =============================================================================

const ANCIENT_TEMPLE_SLOTS: Slot[] = [
  {
    id: 'at-altar',
    label: 'Altar',
    x: 450,
    y: 200,
    width: 120,
    height: 80,
  },
  {
    id: 'at-pillar-left',
    label: 'Linke Säule',
    x: 150,
    y: 150,
    width: 50,
    height: 200,
  },
  {
    id: 'at-pillar-right',
    label: 'Rechte Säule',
    x: 800,
    y: 150,
    width: 50,
    height: 200,
  },
  {
    id: 'at-statue',
    label: 'Götterstatue',
    x: 450,
    y: 80,
    width: 80,
    height: 100,
  },
  {
    id: 'at-scroll-shelf',
    label: 'Schriftrollen-Regal',
    x: 100,
    y: 400,
    width: 90,
    height: 80,
  },
  {
    id: 'at-offering-bowl',
    label: 'Opferschale',
    x: 300,
    y: 350,
    width: 60,
    height: 40,
  },
  {
    id: 'at-hieroglyphs',
    label: 'Hieroglyphen-Wand',
    x: 650,
    y: 300,
    width: 100,
    height: 80,
  },
  {
    id: 'at-sarcophagus',
    label: 'Sarkophag',
    x: 750,
    y: 480,
    width: 100,
    height: 60,
  },
  {
    id: 'at-torch-left',
    label: 'Fackel Links',
    x: 250,
    y: 180,
    width: 40,
    height: 70,
  },
  {
    id: 'at-torch-right',
    label: 'Fackel Rechts',
    x: 700,
    y: 180,
    width: 40,
    height: 70,
  },
  {
    id: 'at-treasure-chest',
    label: 'Tempelschatz',
    x: 550,
    y: 520,
    width: 80,
    height: 50,
  },
  {
    id: 'at-mysterious-pool',
    label: 'Mystischer Pool',
    x: 300,
    y: 500,
    width: 100,
    height: 60,
  },
  {
    id: 'at-mosaic',
    label: 'Bodenmosaik',
    x: 450,
    y: 400,
    width: 100,
    height: 60,
  },
  {
    id: 'at-ancient-urn',
    label: 'Antike Urne',
    x: 850,
    y: 400,
    width: 50,
    height: 70,
  },
];

// =============================================================================
// TREEHOUSE (Baumhaus)
// =============================================================================

const TREEHOUSE_SLOTS: Slot[] = [
  {
    id: 'th-hammock',
    label: 'Hängematte',
    x: 150,
    y: 200,
    width: 100,
    height: 60,
  },
  {
    id: 'th-window',
    label: 'Rundes Fenster',
    x: 450,
    y: 100,
    width: 80,
    height: 80,
  },
  {
    id: 'th-rope-ladder',
    label: 'Strickleiter',
    x: 850,
    y: 350,
    width: 50,
    height: 150,
  },
  {
    id: 'th-lantern',
    label: 'Laterne',
    x: 300,
    y: 120,
    width: 40,
    height: 50,
  },
  {
    id: 'th-treehouse-desk',
    label: 'Holzschreibtisch',
    x: 600,
    y: 300,
    width: 100,
    height: 60,
  },
  {
    id: 'th-bird-nest',
    label: 'Vogelnest',
    x: 750,
    y: 100,
    width: 60,
    height: 50,
  },
  {
    id: 'th-toy-chest',
    label: 'Spielzeugkiste',
    x: 200,
    y: 450,
    width: 80,
    height: 60,
  },
  {
    id: 'th-telescope',
    label: 'Fernglas-Halter',
    x: 500,
    y: 250,
    width: 50,
    height: 60,
  },
];

// =============================================================================
// TEMPLATE REGISTRY
// =============================================================================

/**
 * Alle verfügbaren Raum-Templates
 */
export const ROOM_TEMPLATES: Record<TemplateId, RoomTemplate> = {
  'wizard-tower': {
    id: 'wizard-tower',
    name: 'Zaubererturm',
    description: 'Ein mystischer Turm voller magischer Gegenstände und alter Weisheit.',
    icon: '🧙',
    ageGroup: 'all',
    slots: WIZARD_TOWER_SLOTS,
  },
  'pirate-cave': {
    id: 'pirate-cave',
    name: 'Piratenhöhle',
    description: 'Eine geheime Höhle mit Schätzen, Karten und Abenteuer-Atmosphäre.',
    icon: '🏴‍☠️',
    ageGroup: '8-12',
    slots: PIRATE_CAVE_SLOTS,
  },
  'space-station': {
    id: 'space-station',
    name: 'Raumstation',
    description: 'Eine futuristische Station im Weltraum mit High-Tech Ausrüstung.',
    icon: '🚀',
    ageGroup: '13-18',
    slots: SPACE_STATION_SLOTS,
  },
  'dragon-castle': {
    id: 'dragon-castle',
    name: 'Drachenburg',
    description: 'Eine majestätische Burg mit Drachen-Thematik und mittelalterlichem Flair.',
    icon: '🐉',
    ageGroup: 'all',
    slots: DRAGON_CASTLE_SLOTS,
  },
  'ancient-temple': {
    id: 'ancient-temple',
    name: 'Antiker Tempel',
    description: 'Ein geheimnisvoller Tempel mit ägyptischen und griechischen Elementen.',
    icon: '🏛️',
    ageGroup: '13-18',
    slots: ANCIENT_TEMPLE_SLOTS,
  },
  'treehouse': {
    id: 'treehouse',
    name: 'Baumhaus',
    description: 'Ein gemütliches Baumhaus mitten in der Natur.',
    icon: '🌳',
    ageGroup: '8-12',
    slots: TREEHOUSE_SLOTS,
  },
};

/**
 * Template-IDs als Array (für Iterationen)
 */
export const TEMPLATE_IDS: TemplateId[] = [
  'wizard-tower',
  'pirate-cave',
  'space-station',
  'dragon-castle',
  'ancient-temple',
  'treehouse',
];

/**
 * Standard-Template für neue Räume
 */
export const DEFAULT_TEMPLATE: TemplateId = 'wizard-tower';

/**
 * Holt ein Template nach ID
 */
export function getTemplate(id: TemplateId): RoomTemplate {
  return ROOM_TEMPLATES[id];
}

/**
 * Holt alle Slots für ein Template
 */
export function getTemplateSlots(id: TemplateId): Slot[] {
  return ROOM_TEMPLATES[id].slots;
}

/**
 * Findet einen Slot nach ID innerhalb eines Templates
 */
export function findSlot(templateId: TemplateId, slotId: string): Slot | undefined {
  return ROOM_TEMPLATES[templateId].slots.find(slot => slot.id === slotId);
}

/**
 * Templates gefiltert nach Altersgruppe
 */
export function getTemplatesByAgeGroup(ageGroup: '8-12' | '13-18' | 'all'): RoomTemplate[] {
  return TEMPLATE_IDS
    .map(id => ROOM_TEMPLATES[id])
    .filter(t => t.ageGroup === ageGroup || t.ageGroup === 'all');
}
