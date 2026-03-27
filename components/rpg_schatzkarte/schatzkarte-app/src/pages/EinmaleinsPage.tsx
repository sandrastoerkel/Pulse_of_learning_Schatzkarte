// src/pages/EinmaleinsPage.tsx
// Page-Wrapper: Route → EinmaleinsArena (standalone, hooks intern)

import { useNavigate } from 'react-router-dom';
import { EinmaleinsArena } from '@/components/arena/EinmaleinsArena';

export default function EinmaleinsPage() {
  const navigate = useNavigate();

  return (
    <EinmaleinsArena
      isOpen={true}
      onClose={() => navigate('/karte')}
    />
  );
}
