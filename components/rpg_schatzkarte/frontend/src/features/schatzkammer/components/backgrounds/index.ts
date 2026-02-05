/**
 * Background Components - Exports
 * 
 * SVG-Hintergründe für die verschiedenen Raum-Templates.
 */

import React from 'react';

export { WizardTower, type WizardTowerProps } from './WizardTower';
export { PirateCave, type PirateCaveProps } from './PirateCave';
export { SpaceStation, type SpaceStationProps } from './SpaceStation';

// Template ID to Background Component mapping
import type { TemplateId } from '../../types';
import { WizardTower } from './WizardTower';
import { PirateCave } from './PirateCave';
import { SpaceStation } from './SpaceStation';

export const BACKGROUND_COMPONENTS: Partial<Record<TemplateId, React.ComponentType<{ scale?: number }>>> = {
  'wizard-tower': WizardTower,
  'pirate-cave': PirateCave,
  'space-station': SpaceStation,
  // Dragon Castle, Ancient Temple, Treehouse können später hinzugefügt werden
};

/**
 * Gibt die Background-Komponente für ein Template zurück
 */
export function getBackgroundComponent(templateId: TemplateId): React.ComponentType<{ scale?: number }> | undefined {
  return BACKGROUND_COMPONENTS[templateId];
}
