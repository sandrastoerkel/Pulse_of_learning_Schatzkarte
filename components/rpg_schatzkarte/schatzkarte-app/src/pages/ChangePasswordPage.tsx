// src/pages/ChangePasswordPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wird angezeigt, wenn ein migrierter User sich mit dem
 * temporären Passwort einloggt und sein Passwort ändern muss.
 *
 * Prüfung: profile?.user_metadata?.must_change_password === true
 * (wird im App.tsx-Routing abgefangen)
 */
export default function ChangePasswordPage() {
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setSubmitting(true);
    const { error: pwError } = await changePassword(newPassword);

    if (pwError) {
      setError(pwError);
      setSubmitting(false);
      return;
    }

    // Erfolg → Weiter zur Karte
    navigate('/karte', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-950 via-sky-900 to-indigo-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Neues Passwort setzen
          </h1>
          <p className="text-sky-300 mt-2 text-sm">
            Dein Account wurde migriert. Bitte wähle ein neues Passwort.
          </p>
        </div>

        <div className="bg-sky-900/50 backdrop-blur border border-sky-700/50 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-sky-200 mb-1"
              >
                Neues Passwort
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-sky-950/60 border border-sky-600/40 rounded-xl text-white placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                placeholder="Mindestens 6 Zeichen"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-sky-200 mb-1"
              >
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2.5 bg-sky-950/60 border border-sky-600/40 rounded-xl text-white placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                placeholder="Passwort wiederholen"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-sky-950 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {submitting ? '...' : 'Passwort speichern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
