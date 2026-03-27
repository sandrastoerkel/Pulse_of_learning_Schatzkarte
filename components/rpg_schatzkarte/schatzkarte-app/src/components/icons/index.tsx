// src/components/icons/index.ts
// Stub-Icons — werden später durch echte SVG-Icons ersetzt
// Interface kompatibel mit altem IconDefs.tsx

export type { IconProps } from '@/types/ui';
import type { IconProps } from '@/types/ui';

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

// Insel-Icons
export const StartHafenIcon = makeStubIcon('🏕️', 'Starthafen');
export const FestungIcon = makeStubIcon('💪', 'Festung');
export const WerkzeugeIcon = makeStubIcon('📚', 'Werkzeuge');
export const BrueckenIcon = makeStubIcon('🌉', 'Brücken');
export const FaedenIcon = makeStubIcon('🧵', 'Fäden');
export const SpiegelSeeIcon = makeStubIcon('🧠', 'Spiegel-See');
export const VulkanIcon = makeStubIcon('🔥', 'Vulkan');
export const RuheOaseIcon = makeStubIcon('😌', 'Ruhe-Oase');
export const AusdauerGipfelIcon = makeStubIcon('🏆', 'Ausdauer-Gipfel');
export const FokusLeuchtturmIcon = makeStubIcon('🎯', 'Fokus-Leuchtturm');
export const WachstumGartenIcon = makeStubIcon('🌱', 'Wachstum-Garten');
export const LehrerTurmIcon = makeStubIcon('🏫', 'Lehrer-Turm');
export const WohlfuehlDorfIcon = makeStubIcon('🏠', 'Wohlfühl-Dorf');
export const SchutzBurgIcon = makeStubIcon('🛡', 'Schutz-Burg');
export const MeisterBergIcon = makeStubIcon('⛰️', 'Meister-Berg');

// UI-Icons
export const LerntechnikenIcon = makeStubIcon('📖', 'Lerntechniken');
export const StationenIcon = makeStubIcon('🧭', 'Stationen');
export const BaseCampIcon = makeStubIcon('⛺', 'Base Camp');

// Schiff-Icons
export const GoldenKeyIcon = makeStubIcon('🔑', 'Goldener Schlüssel');
export const HattieWaageIcon = makeStubIcon('⚖️', 'Hattie-Waage');
export const PolarsternIcon = makeStubIcon('⭐', 'Polarstern');
export const LootIcon = makeStubIcon('🎴', 'Loot');
