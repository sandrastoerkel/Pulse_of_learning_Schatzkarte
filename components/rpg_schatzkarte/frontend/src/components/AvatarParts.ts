// ============================================
// AVATAR PARTS - Avataaars Optionen
// Basierend auf: https://getavataaars.com/
// ============================================

import type { AvatarPartOption, AvatarVisuals } from '../types';

// === FRISUREN / KOPFBEDECKUNGEN ===
export const TOP_TYPES: AvatarPartOption[] = [
  // Kurze Haare
  { id: 'ShortHairShortFlat', name: 'Kurz Glatt', icon: '💇' },
  { id: 'ShortHairShortCurly', name: 'Kurz Lockig', icon: '🌀' },
  { id: 'ShortHairShortWaved', name: 'Kurz Wellig', icon: '〰️' },
  { id: 'ShortHairShortRound', name: 'Kurz Rund', icon: '⚪' },
  { id: 'ShortHairSides', name: 'Seitenscheitel', icon: '📐' },
  { id: 'ShortHairTheCaesar', name: 'Caesar', icon: '🏛️' },
  { id: 'ShortHairTheCaesarSidePart', name: 'Caesar Seite', icon: '🏛️' },
  { id: 'ShortHairShaggy', name: 'Strubbelig', icon: '🌪️' },
  { id: 'ShortHairShaggyMullet', name: 'Vokuhila', icon: '🎸' },
  { id: 'ShortHairFrizzle', name: 'Kraus', icon: '⚡' },
  { id: 'ShortHairDreads01', name: 'Dreads Kurz', icon: '🎭' },
  { id: 'ShortHairDreads02', name: 'Dreads Lang', icon: '🎭' },

  // Lange Haare
  { id: 'LongHairStraight', name: 'Lang Glatt', icon: '👩' },
  { id: 'LongHairStraight2', name: 'Lang Glatt 2', icon: '👩' },
  { id: 'LongHairStraightStrand', name: 'Strähne', icon: '✨' },
  { id: 'LongHairNotTooLong', name: 'Mittellang', icon: '💁' },
  { id: 'LongHairBob', name: 'Bob', icon: '💇‍♀️' },
  { id: 'LongHairBun', name: 'Dutt', icon: '🍩' },
  { id: 'LongHairCurly', name: 'Lang Lockig', icon: '🌀' },
  { id: 'LongHairCurvy', name: 'Wellig Lang', icon: '🌊' },
  { id: 'LongHairBigHair', name: 'Volumen', icon: '💫' },
  { id: 'LongHairDreads', name: 'Dreads', icon: '🎭' },
  { id: 'LongHairFro', name: 'Afro', icon: '🌳' },
  { id: 'LongHairFroBand', name: 'Afro + Band', icon: '🎀' },
  { id: 'LongHairFrida', name: 'Frida', icon: '🌸' },
  { id: 'LongHairShavedSides', name: 'Undercut', icon: '✂️' },
  { id: 'LongHairMiaWallace', name: 'Pony Lang', icon: '🎬' },

  // Ohne Haare
  { id: 'NoHair', name: 'Kahl', icon: '🌕' },
  { id: 'Eyepatch', name: 'Augenklappe', icon: '🏴‍☠️' },

  // Kopfbedeckungen
  { id: 'Hat', name: 'Hut', icon: '🎩' },
  { id: 'WinterHat1', name: 'Wintermütze', icon: '🧢' },
  { id: 'WinterHat2', name: 'Bommel', icon: '❄️' },
  { id: 'WinterHat3', name: 'Beanie', icon: '🧣' },
  { id: 'WinterHat4', name: 'Strickmütze', icon: '🧶' },
  { id: 'Turban', name: 'Turban', icon: '👳' },
  { id: 'Hijab', name: 'Hijab', icon: '🧕' },
];

// === HAARFARBEN ===
export const HAIR_COLORS: AvatarPartOption[] = [
  { id: 'Black', name: 'Schwarz', icon: '⬛' },
  { id: 'BrownDark', name: 'Dunkelbraun', icon: '🟫' },
  { id: 'Brown', name: 'Braun', icon: '🤎' },
  { id: 'Auburn', name: 'Rotbraun', icon: '🔶' },
  { id: 'Red', name: 'Rot', icon: '🔴' },
  { id: 'Blonde', name: 'Blond', icon: '🟡' },
  { id: 'BlondeGolden', name: 'Goldblond', icon: '✨' },
  { id: 'Platinum', name: 'Platinblond', icon: '⬜' },
  { id: 'SilverGray', name: 'Silbergrau', icon: '🩶' },
  { id: 'PastelPink', name: 'Rosa', icon: '🩷' },
  { id: 'Blue', name: 'Blau', icon: '🔵' },
];

// === ACCESSOIRES (Brillen etc.) ===
export const ACCESSORIES_TYPES: AvatarPartOption[] = [
  { id: 'Blank', name: 'Keine', icon: '❌' },
  { id: 'Prescription01', name: 'Brille Rund', icon: '👓' },
  { id: 'Prescription02', name: 'Brille Eckig', icon: '🤓' },
  { id: 'Round', name: 'Rund Klassik', icon: '⭕' },
  { id: 'Kurt', name: 'Kurt Style', icon: '🎸' },
  { id: 'Sunglasses', name: 'Sonnenbrille', icon: '🕶️' },
  { id: 'Wayfarers', name: 'Wayfarers', icon: '😎' },
];

// === AUGENFORMEN ===
export const EYE_TYPES: AvatarPartOption[] = [
  { id: 'Default', name: 'Normal', icon: '👁️' },
  { id: 'Happy', name: 'Fröhlich', icon: '😊' },
  { id: 'Wink', name: 'Zwinkern', icon: '😉' },
  { id: 'WinkWacky', name: 'Verrückt', icon: '🤪' },
  { id: 'Surprised', name: 'Überrascht', icon: '😲' },
  { id: 'Hearts', name: 'Herzaugen', icon: '😍' },
  { id: 'Squint', name: 'Zusammengekniffen', icon: '😑' },
  { id: 'Side', name: 'Seitwärts', icon: '👀' },
  { id: 'Close', name: 'Geschlossen', icon: '😌' },
  { id: 'Cry', name: 'Weinend', icon: '😢' },
  { id: 'Dizzy', name: 'Schwindelig', icon: '😵' },
  { id: 'EyeRoll', name: 'Augenrollen', icon: '🙄' },
];

// === AUGENBRAUEN ===
export const EYEBROW_TYPES: AvatarPartOption[] = [
  { id: 'Default', name: 'Normal', icon: '➰' },
  { id: 'DefaultNatural', name: 'Natürlich', icon: '〰️' },
  { id: 'FlatNatural', name: 'Flach', icon: '➖' },
  { id: 'RaisedExcited', name: 'Aufgeregt', icon: '⬆️' },
  { id: 'RaisedExcitedNatural', name: 'Aufgeregt Nat.', icon: '↗️' },
  { id: 'SadConcerned', name: 'Besorgt', icon: '😟' },
  { id: 'SadConcernedNatural', name: 'Besorgt Nat.', icon: '😰' },
  { id: 'Angry', name: 'Wütend', icon: '😠' },
  { id: 'AngryNatural', name: 'Wütend Nat.', icon: '😤' },
  { id: 'FrownNatural', name: 'Stirnrunzeln', icon: '🙁' },
  { id: 'UnibrowNatural', name: 'Monobraue', icon: '🐛' },
  { id: 'UpDown', name: 'Auf/Ab', icon: '↕️' },
  { id: 'UpDownNatural', name: 'Auf/Ab Nat.', icon: '🔃' },
];

// === MUNDFORMEN ===
export const MOUTH_TYPES: AvatarPartOption[] = [
  { id: 'Default', name: 'Normal', icon: '😐' },
  { id: 'Smile', name: 'Lächeln', icon: '😊' },
  { id: 'Twinkle', name: 'Grinsen', icon: '😁' },
  { id: 'Eating', name: 'Essen', icon: '😋' },
  { id: 'Tongue', name: 'Zunge', icon: '😛' },
  { id: 'Serious', name: 'Ernst', icon: '😐' },
  { id: 'Concerned', name: 'Besorgt', icon: '😟' },
  { id: 'Sad', name: 'Traurig', icon: '😢' },
  { id: 'Disbelief', name: 'Ungläubig', icon: '😮' },
  { id: 'Grimace', name: 'Grimasse', icon: '😬' },
  { id: 'ScreamOpen', name: 'Schreien', icon: '😱' },
  { id: 'Vomit', name: 'Würgen', icon: '🤢' },
];

// === HAUTFARBEN ===
export const SKIN_COLORS: AvatarPartOption[] = [
  { id: 'Pale', name: 'Sehr Hell', icon: '🏻' },
  { id: 'Light', name: 'Hell', icon: '🏼' },
  { id: 'Tanned', name: 'Gebräunt', icon: '🏽' },
  { id: 'Yellow', name: 'Gelb', icon: '🟡' },
  { id: 'Brown', name: 'Braun', icon: '🏾' },
  { id: 'DarkBrown', name: 'Dunkelbraun', icon: '🏿' },
  { id: 'Black', name: 'Schwarz', icon: '⬛' },
];

// === KLEIDUNGSTYPEN ===
export const CLOTHE_TYPES: AvatarPartOption[] = [
  { id: 'ShirtCrewNeck', name: 'T-Shirt', icon: '👕' },
  { id: 'ShirtScoopNeck', name: 'U-Ausschnitt', icon: '👚' },
  { id: 'ShirtVNeck', name: 'V-Ausschnitt', icon: '👔' },
  { id: 'Hoodie', name: 'Hoodie', icon: '🧥' },
  { id: 'CollarSweater', name: 'Pullover', icon: '🧶' },
  { id: 'BlazerShirt', name: 'Hemd + Blazer', icon: '🤵' },
  { id: 'BlazerSweater', name: 'Pulli + Blazer', icon: '🧑‍💼' },
  { id: 'GraphicShirt', name: 'Motiv-Shirt', icon: '🎨' },
  { id: 'Overall', name: 'Overall', icon: '👷' },
];

// === KLEIDUNGSFARBEN ===
export const CLOTHE_COLORS: AvatarPartOption[] = [
  { id: 'Black', name: 'Schwarz', icon: '⬛' },
  { id: 'White', name: 'Weiß', icon: '⬜' },
  { id: 'Gray01', name: 'Hellgrau', icon: '🩶' },
  { id: 'Gray02', name: 'Dunkelgrau', icon: '◽' },
  { id: 'Heather', name: 'Dunkel', icon: '🌑' },
  { id: 'Blue01', name: 'Hellblau', icon: '🩵' },
  { id: 'Blue02', name: 'Blau', icon: '🔵' },
  { id: 'Blue03', name: 'Dunkelblau', icon: '🫐' },
  { id: 'Red', name: 'Rot', icon: '🔴' },
  { id: 'Pink', name: 'Pink', icon: '🩷' },
  { id: 'PastelBlue', name: 'Pastell Blau', icon: '💠' },
  { id: 'PastelGreen', name: 'Pastell Grün', icon: '🍀' },
  { id: 'PastelOrange', name: 'Pastell Orange', icon: '🟠' },
  { id: 'PastelRed', name: 'Pastell Rot', icon: '🌸' },
  { id: 'PastelYellow', name: 'Pastell Gelb', icon: '🌼' },
];

// === GRAFIK-MOTIVE (für GraphicShirt) ===
export const GRAPHIC_TYPES: AvatarPartOption[] = [
  { id: 'Bat', name: 'Fledermaus', icon: '🦇' },
  { id: 'Bear', name: 'Bär', icon: '🐻' },
  { id: 'Deer', name: 'Hirsch', icon: '🦌' },
  { id: 'Diamond', name: 'Diamant', icon: '💎' },
  { id: 'Hola', name: 'Hola', icon: '👋' },
  { id: 'Pizza', name: 'Pizza', icon: '🍕' },
  { id: 'Skull', name: 'Totenkopf', icon: '💀' },
  { id: 'SkullOutline', name: 'Totenkopf Linie', icon: '☠️' },
  { id: 'Resist', name: 'Resist', icon: '✊' },
  { id: 'Cumbia', name: 'Cumbia', icon: '💃' },
  { id: 'Selena', name: 'Selena', icon: '🎤' },
];

// === GESICHTSBEHAARUNG (optional, für ältere Nutzer) ===
export const FACIAL_HAIR_TYPES: AvatarPartOption[] = [
  { id: 'Blank', name: 'Keine', icon: '❌' },
  { id: 'BeardLight', name: 'Leichter Bart', icon: '🧔' },
  { id: 'BeardMedium', name: 'Mittlerer Bart', icon: '🧔‍♂️' },
  { id: 'BeardMajestic', name: 'Voller Bart', icon: '🧙' },
  { id: 'MoustacheFancy', name: 'Schnurrbart', icon: '🥸' },
  { id: 'MoustacheMagnum', name: 'Magnum', icon: '🕵️' },
];

// === DEFAULT AVATAR (kinderfreundlich) ===
export const DEFAULT_AVATAR_VISUALS: AvatarVisuals = {
  avatarStyle: 'Circle',
  topType: 'ShortHairShortFlat',
  hairColor: 'Brown',
  accessoriesType: 'Blank',
  facialHairType: 'Blank',
  facialHairColor: 'Brown',
  eyeType: 'Default',
  eyebrowType: 'Default',
  mouthType: 'Smile',
  skinColor: 'Light',
  clotheType: 'Hoodie',
  clotheColor: 'Blue02',
  graphicType: 'Bear',
};

export const DEFAULT_AVATAR_EQUIPPED = {
  hat: null,
  glasses: null,
  accessory: null,
  cape: null,
  effect: null,
  frame: null,
};

// === KATEGORIEN FÜR TABS ===
export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
}

export const AVATAR_CATEGORIES: CategoryConfig[] = [
  { id: 'hair', name: 'Frisur', icon: '💇' },
  { id: 'face', name: 'Gesicht', icon: '😊' },
  { id: 'accessories', name: 'Brille', icon: '👓' },
  { id: 'clothes', name: 'Kleidung', icon: '👕' },
  { id: 'skin', name: 'Hautfarbe', icon: '🎨' },
];
