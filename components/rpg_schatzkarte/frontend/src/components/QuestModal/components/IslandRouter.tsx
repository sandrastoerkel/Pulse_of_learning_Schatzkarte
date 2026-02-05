// ============================================
// QuestModal - IslandRouter Component
// Pfad: src/components/QuestModal/components/IslandRouter.tsx
// ============================================

import type { AgeGroup } from '../../../types';

// Island Experience Imports
import { BrueckenIslandExperience } from '../../BrueckenIslandExperience';
import { FestungIslandExperience } from '../../FestungIslandExperience';
import { WerkzeugeIslandExperience } from '../../WerkzeugeIslandExperience';
import { StarthafenIslandExperience } from '../../StarthafenIslandExperience';
import { FaedenIslandExperience } from '../../FaedenIslandExperience';
import { SpiegelSeeIslandExperience } from '../../SpiegelSeeIslandExperience';
import { VulkanIslandExperience } from '../../VulkanIslandExperience';
import { RuheOaseIslandExperience } from '../../RuheOaseIslandExperience';
import { AusdauerGipfelIslandExperience } from '../../AusdauerGipfelIslandExperience';
import { FokusLeuchtturmIslandExperience } from '../../FokusLeuchtturmIslandExperience';
import { WachstumGartenIslandExperience } from '../../WachstumGartenIslandExperience';
import { LehrerTurmIslandExperience } from '../../LehrerTurmIslandExperience';
import { WohlfuehlDorfIslandExperience } from '../../WohlfuehlDorfIslandExperience';
import { SchutzBurgIslandExperience } from '../../SchutzBurgIslandExperience';
import { MeisterBergIslandExperience } from '../../MeisterBergIslandExperience';

interface IslandRouterProps {
  islandId: string;
  ageGroup: AgeGroup;
  onClose: () => void;
  onQuestComplete: (questType: string, xp: number, gold?: number, itemId?: string) => void;
  // Festung-spezifisch
  onOpenTagebuch?: () => void;
  onOpenBandura?: () => void;
  onOpenHattie?: () => void;
  // Werkzeuge-spezifisch
  startWerkzeugeWithChallenge?: boolean;
  onOpenLernkarten?: () => void;
  onOpenSchatzkammer?: () => void;
  // Starthafen-spezifisch
  onPolarsternClick?: () => void;
  onOpenCompanionSelector?: () => void;
  selectedCompanion?: string;
  initialPhase?: string | null;
}

/**
 * Routing-Komponente für verschiedene Insel-Experiences
 * Gibt die passende Experience-Komponente basierend auf der Island-ID zurück
 */
export function IslandRouter({
  islandId,
  ageGroup,
  onClose,
  onQuestComplete,
  onOpenTagebuch,
  onOpenBandura,
  onOpenHattie,
  startWerkzeugeWithChallenge = false,
  onOpenLernkarten,
  onOpenSchatzkammer,
  onPolarsternClick,
  onOpenCompanionSelector,
  selectedCompanion,
  initialPhase
}: IslandRouterProps): JSX.Element | null {
  switch (islandId) {
    case 'bruecken':
      return (
        <BrueckenIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'festung':
      return (
        <FestungIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
          onOpenTagebuch={onOpenTagebuch}
          onOpenBandura={onOpenBandura}
          onOpenHattie={onOpenHattie}
        />
      );

    case 'werkzeuge':
      return (
        <WerkzeugeIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
          startWithChallenge={startWerkzeugeWithChallenge}
          onOpenLernkarten={onOpenLernkarten}
          onOpenSchatzkammer={onOpenSchatzkammer}
        />
      );

    case 'start':
      return (
        <StarthafenIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
          onPolarsternClick={onPolarsternClick}
          onOpenCompanionSelector={onOpenCompanionSelector}
          selectedCompanion={selectedCompanion}
          initialPhase={initialPhase as 'welcome' | 'features' | 'ready' | undefined}
        />
      );

    case 'faeden':
      return (
        <FaedenIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'spiegel_see':
      return (
        <SpiegelSeeIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'vulkan':
      return (
        <VulkanIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'ruhe_oase':
      return (
        <RuheOaseIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'ausdauer_gipfel':
      return (
        <AusdauerGipfelIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'fokus_leuchtturm':
      return (
        <FokusLeuchtturmIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'wachstum_garten':
      return (
        <WachstumGartenIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'lehrer_turm':
      return (
        <LehrerTurmIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'wohlfuehl_dorf':
      return (
        <WohlfuehlDorfIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'schutz_burg':
      return (
        <SchutzBurgIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    case 'meister_berg':
      return (
        <MeisterBergIslandExperience
          ageGroup={ageGroup}
          onClose={onClose}
          onQuestComplete={onQuestComplete}
        />
      );

    default:
      // Keine spezielle Experience für diese Insel
      return null;
  }
}

/**
 * Liste aller Inseln mit spezieller Experience-Komponente
 */
export const ISLANDS_WITH_EXPERIENCE = [
  'bruecken',
  'festung',
  'werkzeuge',
  'start',
  'faeden',
  'spiegel_see',
  'vulkan',
  'ruhe_oase',
  'ausdauer_gipfel',
  'fokus_leuchtturm',
  'wachstum_garten',
  'lehrer_turm',
  'wohlfuehl_dorf',
  'schutz_burg',
  'meister_berg'
] as const;

/**
 * Prüft, ob eine Insel eine spezielle Experience hat
 */
export function hasIslandExperience(islandId: string): boolean {
  return (ISLANDS_WITH_EXPERIENCE as readonly string[]).includes(islandId);
}

export default IslandRouter;
