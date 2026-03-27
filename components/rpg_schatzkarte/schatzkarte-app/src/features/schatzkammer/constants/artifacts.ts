/**
 * Artefakt-Typen Konfiguration
 * 
 * Jeder Artefakt-Typ hat einen bestimmten Verwendungszweck
 * und ein passendes Standard-Icon.
 */

import type { ArtifactType, ArtifactConfig } from '../types';

/**
 * Konfiguration aller Artefakt-Typen
 */
export const ARTIFACT_CONFIGS: Record<ArtifactType, ArtifactConfig> = {
  poster: {
    type: 'poster',
    name: 'Poster',
    description: 'Für Texte, Formeln und Definitionen',
    icon: '📜',
    defaultIcon: '📜',
    useCase: 'Ideal für kurze, prägnante Informationen wie Formeln, Definitionen oder Merksätze.',
  },
  figure: {
    type: 'figure',
    name: 'Figur',
    description: 'Charakter mit Erklärung',
    icon: '🧙',
    defaultIcon: '🧙',
    useCase: 'Perfekt für Persönlichkeiten, historische Figuren oder Charaktere, die etwas erklären.',
  },
  chest: {
    type: 'chest',
    name: 'Schatztruhe',
    description: 'Verknüpfung zu einem Quiz',
    icon: '📦',
    defaultIcon: '📦',
    useCase: 'Verbindet den Lerninhalt mit einem interaktiven Quiz zur Überprüfung.',
  },
  scroll: {
    type: 'scroll',
    name: 'Schriftrolle',
    description: 'Längerer Text oder Geschichte',
    icon: '📃',
    defaultIcon: '📃',
    useCase: 'Für ausführlichere Erklärungen, Geschichten oder zusammenhängende Texte.',
  },
  magic_item: {
    type: 'magic_item',
    name: 'Magischer Gegenstand',
    description: 'Visuell-assoziatives Element',
    icon: '✨',
    defaultIcon: '✨',
    useCase: 'Für starke visuelle Assoziationen und Eselsbrücken.',
  },
} as const;

/**
 * Artefakt-Typen als Array (für Iterationen)
 */
export const ARTIFACT_TYPES: ArtifactType[] = [
  'poster',
  'figure',
  'chest',
  'scroll',
  'magic_item',
];

/**
 * Standard-Artefakt-Typ für neue Stationen
 */
export const DEFAULT_ARTIFACT_TYPE: ArtifactType = 'poster';

/**
 * Holt die Konfiguration für einen Artefakt-Typ
 */
export function getArtifactConfig(type: ArtifactType): ArtifactConfig {
  return ARTIFACT_CONFIGS[type];
}

/**
 * Vorschläge für Icons basierend auf Artefakt-Typ
 */
export const ARTIFACT_ICON_SUGGESTIONS: Record<ArtifactType, string[]> = {
  poster: ['📜', '📋', '📝', '🗒️', '📄', '🔢', '➕', '✖️', '📐', '📊'],
  figure: ['🧙', '👨‍🏫', '👩‍🔬', '🧑‍💼', '👑', '🦸', '🧝', '🤴', '👸', '🧛'],
  chest: ['📦', '🎁', '💎', '🏆', '🎯', '❓', '🔮', '🗝️', '💰', '🎲'],
  scroll: ['📃', '📖', '📚', '🗞️', '📰', '✉️', '💌', '🏷️', '🔖', '📑'],
  magic_item: ['✨', '⭐', '🌟', '💫', '🔥', '❄️', '⚡', '🌈', '🎭', '🧿'],
};
