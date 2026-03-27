// src/pages/MemoryGamePage.tsx
// Page-Wrapper: Route → MemoryGame

import { useNavigate } from 'react-router-dom';
import MemoryGame from '@/components/MiniGames/Memory/MemoryGame';
import { DEFAULT_AVATAR_VISUALS, DEFAULT_AVATAR_EQUIPPED } from '@/components/AvatarParts';
import type { CustomAvatar } from '@/types/legacy-ui';

// TODO: Aus Supabase laden (usePlayerProfile Hook)
const DEFAULT_AVATAR: CustomAvatar = {
  visuals: DEFAULT_AVATAR_VISUALS,
  equipped: DEFAULT_AVATAR_EQUIPPED,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function MemoryGamePage() {
  const navigate = useNavigate();

  // TODO: Echte Daten aus Supabase
  const playerXP = 100;
  const playerGold = 500;

  return (
    <MemoryGame
      playerXP={playerXP}
      playerGold={playerGold}
      playerAvatar={DEFAULT_AVATAR}
      onGameEnd={(result) => console.log('[MemoryGame] Result:', result)}
      onClose={() => navigate('/karte')}
    />
  );
}
