// src/hooks/useLegacyUserId.ts
//
// Bridge-Hook: Gibt die alte md5-basierte user_id zurück,
// damit Phase-3-Hooks (useIslandProgress, useChallenges, etc.)
// die bestehenden Tabellen abfragen können, ohne auf UUID
// umgestellt zu sein.
//
// Verwendung in Phase-3-Hooks:
//   const legacyId = useLegacyUserId();
//   const { data } = useQuery({
//     queryKey: ['island_progress', legacyId],
//     queryFn: () => supabase.from('island_progress')
//       .select('*').eq('user_id', legacyId!),
//     enabled: !!legacyId,
//   });

import { useAuth } from '../contexts/AuthContext';

export function useLegacyUserId(): string | null {
  const { legacyUserId } = useAuth();
  return legacyUserId;
}
