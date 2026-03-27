// src/hooks/useAwardXP.ts
// Zentraler Hook zum XP-Vergeben — entspricht update_user_stats() aus gamification_db.py

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useAwardXP() {
  const { refreshProfile } = useAuth();

  const awardXP = async (userId: string, xpDelta: number) => {
    if (xpDelta <= 0) return null;
    const { data, error } = await supabase.rpc('increment_xp', {
      p_user_id: userId,
      p_xp_delta: xpDelta,
    });
    if (error) {
      console.error('Failed to award XP:', error);
      return null;
    }
    // Profil neu laden → TopBarHUD zeigt sofort neuen XP-Stand
    await refreshProfile();
    return data;
  };

  return { awardXP };
}
