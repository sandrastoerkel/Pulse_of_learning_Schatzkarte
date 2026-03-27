// src/pages/SchatzkammerPage.tsx
// Page-Wrapper: Route → SchatzkammerModal (Loci-Gedächtnispalast)

import { useNavigate } from 'react-router-dom';
import SchatzkammerModal from '@/features/schatzkammer/components/SchatzkammerModal';

export default function SchatzkammerPage() {
  const navigate = useNavigate();

  return (
    <SchatzkammerModal
      isOpen={true}
      onClose={() => navigate('/karte')}
    />
  );
}
