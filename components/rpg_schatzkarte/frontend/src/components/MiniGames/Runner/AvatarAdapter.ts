// ============================================
// AVATAR ADAPTER
// Konvertiert Avataaars-Types zu Canvas-kompatiblen Farben
// ============================================

import type { AvatarVisuals, SkinColor, HairColor, ClotheColor, TopType, ClotheType, EyeType, MouthType, EyebrowType } from '../../../types';

// === CANVAS-KOMPATIBLE AVATAR-STRUKTUR ===
export interface CanvasAvatarVisuals {
  // Farben (Hex-Werte)
  skinTone: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  eyeColor: string;

  // Styles (vereinfacht für Canvas-Rendering)
  headShape: 'round' | 'oval' | 'square' | 'heart' | 'long';
  hairStyle: 'short' | 'medium' | 'long' | 'curly' | 'spiky' | 'bald' | 'ponytail' | 'afro' | 'braids' | 'bun' | 'mohawk';
  shirtStyle: 'tshirt' | 'hoodie' | 'polo' | 'vest' | 'sweater' | 'sportshirt';
  eyeStyle: 'round' | 'almond' | 'big' | 'sleepy' | 'happy' | 'narrow';
  mouthStyle: 'smile' | 'grin' | 'neutral' | 'small' | 'open';
  eyebrowStyle: 'normal' | 'thick' | 'thin' | 'arched' | 'angry' | 'worried';

  // Original Avataaars-Werte (für Referenz)
  original: AvatarVisuals;
}

// === FARB-MAPPINGS ===

const SKIN_COLOR_MAP: Record<SkinColor, string> = {
  Tanned: '#FD9841',
  Yellow: '#F8D25C',
  Pale: '#FFDBB4',
  Light: '#EDB98A',
  Brown: '#D08B5B',
  DarkBrown: '#AE5D29',
  Black: '#614335',
};

const HAIR_COLOR_MAP: Record<HairColor, string> = {
  Auburn: '#A55728',
  Black: '#2C1B18',
  Blonde: '#B58143',
  BlondeGolden: '#D6B370',
  Brown: '#724133',
  BrownDark: '#4A312C',
  PastelPink: '#F59797',
  Blue: '#000fdb',
  Platinum: '#ECDCBF',
  Red: '#C93305',
  SilverGray: '#E8E1E1',
};

const CLOTHE_COLOR_MAP: Record<ClotheColor, string> = {
  Black: '#262E33',
  Blue01: '#65C9FF',
  Blue02: '#5199E4',
  Blue03: '#25557C',
  Gray01: '#E6E6E6',
  Gray02: '#929598',
  Heather: '#3C4F5C',
  PastelBlue: '#B1E2FF',
  PastelGreen: '#A7FFC4',
  PastelOrange: '#FFDEB5',
  PastelRed: '#FFAFB9',
  PastelYellow: '#FFFFB1',
  Pink: '#FF488E',
  Red: '#FF5C5C',
  White: '#FFFFFF',
};

// === STYLE-MAPPINGS ===

// TopType → vereinfachter HairStyle
function mapTopTypeToHairStyle(topType: TopType): CanvasAvatarVisuals['hairStyle'] {
  // Kurze Haare
  if (topType.startsWith('ShortHair')) {
    if (topType.includes('Curly')) return 'curly';
    if (topType.includes('Frizzle')) return 'spiky';
    if (topType.includes('Dreads')) return 'medium';
    return 'short';
  }

  // Lange Haare
  if (topType.startsWith('LongHair')) {
    if (topType.includes('Curly') || topType.includes('Curvy')) return 'curly';
    if (topType.includes('Fro')) return 'afro';
    if (topType.includes('Bun') || topType.includes('Ponytail')) return 'ponytail';
    if (topType.includes('Bob') || topType.includes('NotTooLong')) return 'medium';
    return 'long';
  }

  // Keine Haare
  if (topType === 'NoHair' || topType === 'Eyepatch') return 'bald';

  // Mützen/Hüte - zeigen als kurze Haare
  if (topType.includes('Hat') || topType === 'Turban' || topType === 'Hijab') return 'short';

  return 'short';
}

// ClotheType → vereinfachter ShirtStyle
function mapClotheTypeToShirtStyle(clotheType: ClotheType): CanvasAvatarVisuals['shirtStyle'] {
  switch (clotheType) {
    case 'Hoodie':
      return 'hoodie';
    case 'CollarSweater':
      return 'sweater';
    case 'BlazerShirt':
    case 'ShirtVNeck':
      return 'polo';
    case 'Overall':
      return 'vest';
    case 'GraphicShirt':
      return 'sportshirt';
    case 'ShirtCrewNeck':
    case 'ShirtScoopNeck':
    case 'BlazerSweater':
    default:
      return 'tshirt';
  }
}

// EyeType → vereinfachter EyeStyle
function mapEyeTypeToEyeStyle(eyeType: EyeType): CanvasAvatarVisuals['eyeStyle'] {
  switch (eyeType) {
    case 'Happy':
    case 'Hearts':
    case 'Wink':
    case 'WinkWacky':
      return 'happy';
    case 'Close':
    case 'Squint':
      return 'sleepy';
    case 'Surprised':
    case 'Dizzy':
      return 'big';
    case 'Side':
      return 'narrow';
    case 'Default':
    case 'Cry':
    case 'EyeRoll':
    default:
      return 'round';
  }
}

// MouthType → vereinfachter MouthStyle
function mapMouthTypeToMouthStyle(mouthType: MouthType): CanvasAvatarVisuals['mouthStyle'] {
  switch (mouthType) {
    case 'Smile':
    case 'Twinkle':
      return 'smile';
    case 'Tongue':
    case 'Eating':
      return 'grin';
    case 'ScreamOpen':
    case 'Vomit':
      return 'open';
    case 'Serious':
    case 'Concerned':
    case 'Disbelief':
      return 'small';
    case 'Default':
    case 'Sad':
    case 'Grimace':
    default:
      return 'neutral';
  }
}

// EyebrowType → vereinfachter EyebrowStyle
function mapEyebrowTypeToEyebrowStyle(eyebrowType: EyebrowType): CanvasAvatarVisuals['eyebrowStyle'] {
  switch (eyebrowType) {
    case 'Angry':
    case 'AngryNatural':
      return 'angry';
    case 'SadConcerned':
    case 'SadConcernedNatural':
      return 'worried';
    case 'RaisedExcited':
    case 'RaisedExcitedNatural':
      return 'arched';
    case 'UnibrowNatural':
    case 'FlatNatural':
      return 'thick';
    case 'UpDown':
    case 'UpDownNatural':
      return 'thin';
    case 'Default':
    case 'DefaultNatural':
    case 'FrownNatural':
    default:
      return 'normal';
  }
}

// === HAUPT-ADAPTER-FUNKTION ===

export function adaptAvatarForCanvas(visuals: AvatarVisuals): CanvasAvatarVisuals {
  return {
    // Farben konvertieren
    skinTone: SKIN_COLOR_MAP[visuals.skinColor] || '#EDB98A',
    hairColor: HAIR_COLOR_MAP[visuals.hairColor] || '#4A312C',
    shirtColor: CLOTHE_COLOR_MAP[visuals.clotheColor] || '#5199E4',
    pantsColor: '#3D4F5F', // Standard-Hosenfarbe (dunkelgrau)
    eyeColor: '#4A4A4A', // Standard-Augenfarbe (dunkelgrau)

    // Styles konvertieren
    headShape: 'round', // Avataaars hat keine verschiedenen Kopfformen
    hairStyle: mapTopTypeToHairStyle(visuals.topType),
    shirtStyle: mapClotheTypeToShirtStyle(visuals.clotheType),
    eyeStyle: mapEyeTypeToEyeStyle(visuals.eyeType),
    mouthStyle: mapMouthTypeToMouthStyle(visuals.mouthType),
    eyebrowStyle: mapEyebrowTypeToEyebrowStyle(visuals.eyebrowType),

    // Original beibehalten
    original: visuals,
  };
}

// === HELPER: Farbe abdunkeln/aufhellen ===

export function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}

export function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}
