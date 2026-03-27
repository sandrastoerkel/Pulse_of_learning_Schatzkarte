// src/pages/RunnerGamePage.tsx
// Page-Wrapper: Route → RunnerGame (Brick Breaker)

import { useNavigate } from 'react-router-dom';
import RunnerGame from '@/components/MiniGames/Runner/RunnerGame';
import { DEFAULT_AVATAR_VISUALS, DEFAULT_AVATAR_EQUIPPED } from '@/components/AvatarParts';
import type { CustomAvatar } from '@/types/legacy-ui';

// TODO: Aus Supabase laden (usePlayerProfile Hook)
const DEFAULT_AVATAR: CustomAvatar = {
  visuals: DEFAULT_AVATAR_VISUALS,
  equipped: DEFAULT_AVATAR_EQUIPPED,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function RunnerGamePage() {
  const navigate = useNavigate();

  // TODO: Echte Daten aus Supabase
  const playerXP = 100;
  const playerGold = 500;

  return (
    <RunnerGame
      playerXP={playerXP}
      playerGold={playerGold}
      playerAvatar={DEFAULT_AVATAR}
      playerAgeGroup="mittelstufe"
      onGameEnd={(result) => console.log('[RunnerGame] Result:', result)}
      onClose={() => navigate('/karte')}
    />
  );
}
