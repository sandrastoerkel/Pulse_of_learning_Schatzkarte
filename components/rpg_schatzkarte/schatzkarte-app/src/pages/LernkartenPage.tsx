// src/pages/LernkartenPage.tsx
// Page-Wrapper: Route → LootLernkarten (standalone, hooks intern)

import { useNavigate } from 'react-router-dom';
import { LootLernkarten } from '@/components/lernkarten/LootLernkarten';

export default function LernkartenPage() {
  const navigate = useNavigate();

  return (
    <LootLernkarten
      isOpen={true}
      onClose={() => navigate('/karte')}
      onXPEarned={(xp: number) => {
        console.log(`[Lernkarten] +${xp} XP earned`);
      }}
      onCoinsEarned={(coins: number) => {
        console.log(`[Lernkarten] +${coins} Coins earned`);
      }}
    />
  );
}
