/**
 * Schatzkarte Icon Library
 * Lern-Abenteuer Schatzkarte - Custom SVG Icons
 *
 * Original-Icons aus dem alten Frontend übernommen.
 */

// Shared Utilities
export { SharedIconDefs, COLORS, Sparkle, GlowRing } from './IconDefs';
export type { IconProps, IconDefsProps } from './IconDefs';

// ============================================
// INSEL-ICONS (Island Icons)
// ============================================

export { StartHafenIcon } from './StartHafenIcon';
export { FestungIcon } from './FestungIcon';
export { WerkzeugeIcon } from './WerkzeugeIcon';
export { VulkanIcon } from './VulkanIcon';
export { MeisterBergIcon } from './MeisterBergIcon';
export { BrueckenIcon } from './BrueckenIcon';
export { FaedenIcon } from './FaedenIcon';
export { SpiegelSeeIcon } from './SpiegelSeeIcon';
export { RuheOaseIcon } from './RuheOaseIcon';
export { AusdauerGipfelIcon } from './AusdauerGipfelIcon';
export { FokusLeuchtturmIcon } from './FokusLeuchtturmIcon';
export { WachstumGartenIcon } from './WachstumGartenIcon';
export { LehrerTurmIcon } from './LehrerTurmIcon';
export { WohlfuehlDorfIcon } from './WohlfuehlDorfIcon';
export { SchutzBurgIcon } from './SchutzBurgIcon';

// ============================================
// UI-ICONS (für Widgets)
// ============================================

export { LerntechnikenIcon } from './LerntechnikenIcon';
export { StationenIcon } from './StationenIcon';
export { BaseCampIcon } from './BaseCampIcon';

// ============================================
// SCHIFF-ICONS (Ship Icons)
// ============================================

export { GoldenKeyIcon } from './GoldenKeyIcon';
export { HattieWaageIcon } from './HattieWaageIcon';
export { PolarsternIcon } from './PolarsternIcon';
export { LootIcon } from './LootIcon';

// ============================================
// STUB-ICONS (noch kein Original-SVG vorhanden)
// ============================================

import type { IconProps } from './IconDefs';

function makeStubIcon(emoji: string, label: string) {
  return function StubIcon({ size = 32, className }: IconProps) {
    return (
      <span
        className={className}
        role="img"
        aria-label={label}
        style={{ fontSize: size * 0.8, display: 'inline-block', lineHeight: 1 }}
      >
        {emoji}
      </span>
    );
  };
}

export const DenkariumIcon = makeStubIcon('🧩', 'Denkarium');
export const WortschmiedeIcon = makeStubIcon('✍️', 'Wortschmiede');
export const EinmaleinsIcon = makeStubIcon('🧮', 'Einmaleins');
