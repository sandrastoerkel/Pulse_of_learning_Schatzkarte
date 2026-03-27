// src/pages/RunnerGamePage.tsx
// Page-Wrapper: Route → RunnerGame (Brick Breaker)

import { useNavigate } from 'react-router-dom';
import RunnerGame from '@/components/MiniGames/Runner/RunnerGame';
import { useHeroData, useAwardXP } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_AVATAR_VISUALS, DEFAULT_AVATAR_EQUIPPED } from '@/components/AvatarParts';
import type { CustomAvatar } from '@/types/legacy-ui';

// TODO: Avatar aus useAvatarPersistence laden
const DEFAULT_AVATAR: CustomAvatar = {
  visuals: DEFAULT_AVATAR_VISUALS,
  equipped: DEFAULT_AVATAR_EQUIPPED,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function RunnerGamePage() {
  const navigate = useNavigate();
  const heroData = useHeroData();
  const { profile } = useAuth();
  const { awardXP } = useAwardXP();

  return (
    <RunnerGame
      playerXP={heroData?.xp ?? 0}
      playerAvatar={DEFAULT_AVATAR}
      playerAgeGroup="mittelstufe"
      onGameEnd={(result) => {
        if (profile?.id && result.xpWon > 0) {
          awardXP(profile.id, result.xpWon);
        }
      }}
      onClose={() => navigate('/karte')}
    />
  );
}
