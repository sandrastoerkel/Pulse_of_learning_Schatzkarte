// src/pages/EinladungPage.tsx
// Einladungs-Annahme: /einladung?token=...
// Ruft die use-invitation Edge Function auf

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Phase = 'loading' | 'preview' | 'login-required' | 'joining' | 'success' | 'error';

interface InvitationPreview {
  groupName: string;
  groupId: string;
}

export default function EinladungPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, initialized } = useAuth();
  const token = searchParams.get('token');

  const [phase, setPhase] = useState<Phase>('loading');
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [message, setMessage] = useState('');

  // Einladung laden
  useEffect(() => {
    if (!initialized) return;

    if (!token) {
      setPhase('error');
      setMessage('Kein Einladungslink gefunden.');
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('group_invitations')
        .select('group_id, expires_at, used_at, learning_groups(name)')
        .eq('token', token)
        .single();

      if (error || !data) {
        setPhase('error');
        setMessage('Ungültiger Einladungslink.');
        return;
      }

      if (data.used_at) {
        setPhase('error');
        setMessage('Diese Einladung wurde bereits verwendet.');
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setPhase('error');
        setMessage('Diese Einladung ist abgelaufen.');
        return;
      }

      const groupName = (data.learning_groups as any)?.name ?? 'Lerngruppe';
      setPreview({ groupName, groupId: data.group_id });

      if (!user) {
        setPhase('login-required');
      } else {
        setPhase('preview');
      }
    })();
  }, [token, user, initialized]);

  // Beitreten
  const handleJoin = async () => {
    if (!token) return;
    setPhase('joining');

    const { data, error } = await supabase.functions.invoke('use-invitation', {
      body: { token },
    });

    if (error) {
      setPhase('error');
      setMessage('Fehler beim Beitreten. Bitte versuche es erneut.');
      return;
    }

    const result = data as { success: boolean; message: string; group_id: string | null };

    if (!result.success) {
      setPhase('error');
      setMessage(result.message);
      return;
    }

    setMessage(result.message);
    setPhase('success');
    setTimeout(() => navigate('/karte', { replace: true }), 2000);
  };

  // Zum Login mit Redirect
  const goToLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/einladung?token=${token}`)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-950 via-sky-900 to-indigo-950 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📬</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Einladung
          </h1>
        </div>

        {/* Card */}
        <div className="bg-sky-900/50 backdrop-blur border border-sky-700/50 rounded-2xl p-6 shadow-xl text-center">

          {/* Loading */}
          {phase === 'loading' && (
            <p className="text-sky-300 animate-pulse">Einladung wird geladen...</p>
          )}

          {/* Preview — eingeloggt, bereit zum Beitreten */}
          {phase === 'preview' && preview && (
            <>
              <p className="text-sky-200 text-lg mb-2">Du wurdest eingeladen!</p>
              <div className="bg-sky-800/50 border border-amber-500/30 rounded-xl px-4 py-3 mb-6">
                <p className="text-amber-300 font-bold text-xl">{preview.groupName}</p>
              </div>
              <button
                onClick={handleJoin}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-sky-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                Gruppe beitreten
              </button>
            </>
          )}

          {/* Login required */}
          {phase === 'login-required' && preview && (
            <>
              <p className="text-sky-200 text-lg mb-2">Du wurdest eingeladen!</p>
              <div className="bg-sky-800/50 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
                <p className="text-amber-300 font-bold text-xl">{preview.groupName}</p>
              </div>
              <p className="text-sky-400 text-sm mb-6">
                Bitte melde dich an, um der Gruppe beizutreten.
              </p>
              <button
                onClick={goToLogin}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-sky-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                Zum Login
              </button>
            </>
          )}

          {/* Joining */}
          {phase === 'joining' && (
            <p className="text-sky-300 animate-pulse">Trete Gruppe bei...</p>
          )}

          {/* Success */}
          {phase === 'success' && (
            <>
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-green-300 font-bold text-lg mb-2">{message}</p>
              <p className="text-sky-400 text-sm">Du wirst zur Schatzkarte weitergeleitet...</p>
            </>
          )}

          {/* Error */}
          {phase === 'error' && (
            <>
              <div className="text-5xl mb-3">😕</div>
              <p className="text-red-300 font-medium mb-4">{message}</p>
              <button
                onClick={() => navigate('/', { replace: true })}
                className="px-6 py-2.5 bg-sky-800 hover:bg-sky-700 text-sky-200 rounded-xl transition"
              >
                Zur Startseite
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
