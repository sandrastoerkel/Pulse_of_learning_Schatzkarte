// src/hooks/useUserBadges.ts
// Abzeichen des Users laden
// Ersetzt: gamification_db.py → db.table("user_badges").select("*").eq("user_id", user_id)

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';
import type { UserBadge } from '../types/database';

export function useUserBadges() {
  const legacyId = useLegacyUserId();

  return useQuery({
    queryKey: ['user_badges', legacyId],
    queryFn: async (): Promise<UserBadge[]> => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', legacyId!)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!legacyId,
    staleTime: 1000 * 60 * 5,
  });
}
