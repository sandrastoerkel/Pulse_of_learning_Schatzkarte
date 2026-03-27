// src/pages/WortschmiedePage.tsx
// Page-Wrapper: Route → WortschmiedeBattle (standalone, hooks intern)

import { useNavigate } from 'react-router-dom';
import WortschmiedeBattle from '@/components/wortschmiede/WortschmiedeBattle';

export default function WortschmiedePage() {
  const navigate = useNavigate();

  return (
    <WortschmiedeBattle
      onClose={() => navigate('/karte')}
      onXPEarned={(xp: number) => {
        // TODO: integrate with global XP tracking if needed
        console.log(`[Wortschmiede] +${xp} XP earned`);
      }}
    />
  );
}
