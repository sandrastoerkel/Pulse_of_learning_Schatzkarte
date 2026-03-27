// ============================================
// Learnstrat Progress Hook
// For: WorldMapIllustrated (Lerntechniken-Badge), WerkzeugeIslandExperience
// Table: learnstrat_progress
// ============================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';

// Total number of Power-Lerntechniken in the system
const TOTAL_TECHNIQUES = 7;

export function useLearnstratProgress() {
  const legacyUserId = useLegacyUserId();

  return useQuery({
    queryKey: ['learnstrat-progress', legacyUserId],
    queryFn: async () => {
      if (!legacyUserId) {
        return { completedCount: 0, totalTechniques: TOTAL_TECHNIQUES, hasCertificate: false };
      }

      const { data, error } = await supabase
        .from('learnstrat_progress')
        .select('technique_id, completed')
        .eq('user_id', legacyUserId)
        .eq('completed', true);

      if (error) throw error;

      // Count unique completed techniques
      const uniqueTechniques = new Set((data ?? []).map(d => d.technique_id));
      const completedCount = uniqueTechniques.size;

      return {
        completedCount,
        totalTechniques: TOTAL_TECHNIQUES,
        hasCertificate: completedCount >= TOTAL_TECHNIQUES,
      };
    },
    enabled: !!legacyUserId,
  });
}
