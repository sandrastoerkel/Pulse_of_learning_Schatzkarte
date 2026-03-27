// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [ageGroup, setAgeGroup] = useState('grundschule');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect-Ziel: ?redirect= Query-Param hat Vorrang, dann location.state, dann /karte
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const stateFrom = (location.state as { from?: Location })?.from?.pathname;
  const from = redirectParam ?? stateFrom ?? '/karte';

  // Schon eingeloggt? → Weiter zum Ziel
  if (user && !authLoading) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'register') {
      if (password !== passwordConfirm) {
        setError('Die Passwörter stimmen nicht überein.');
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        setSubmitting(false);
        return;
      }
      if (!displayName.trim()) {
        setError('Bitte gib deinen Anzeigenamen ein.');
        setSubmitting(false);
        return;
      }

      const { error: signUpError } = await signUp(
        username,
        password,
        displayName.trim(),
        ageGroup
      );
      if (signUpError) {
        setError(signUpError);
        setSubmitting(false);
        return;
      }
    } else {
      const { error: signInError } = await signIn(username, password);
      if (signInError) {
        setError(signInError);
        setSubmitting(false);
        return;
      }
    }

    // Erfolg → navigate wird durch AuthProvider/onAuthStateChange ausgelöst
    setSubmitting(false);
  };

  const ageGroupOptions = [
    { value: 'grundschule', label: 'Grundschule (Kl. 1–4)' },
    { value: 'unterstufe', label: 'Unterstufe (Kl. 5–6)' },
    { value: 'mittelstufe', label: 'Mittelstufe (Kl. 7–8)' },
    { value: 'oberstufe', label: 'Oberstufe (Kl. 9–10)' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-950 via-sky-900 to-indigo-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Titel */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Schatzkarte
          </h1>
          <p className="text-sky-300 mt-2 text-sm">
            {mode === 'login' ? 'Willkommen zurück!' : 'Erstelle deinen Account'}
          </p>
        </div>

        {/* Formular */}
        <div className="bg-sky-900/50 backdrop-blur border border-sky-700/50 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Benutzername */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-sky-200 mb-1"
              >
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-2.5 bg-sky-950/60 border border-sky-600/40 rounded-xl text-white placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                placeholder="z.B. max_m"
              />
            </div>

            {/* Anzeigename (nur bei Registrierung) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-sky-200 mb-1"
                >
                  Anzeigename
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-sky-950/60 border border-sky-600/40 rounded-xl text-white placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                  placeholder="z.B. Max Mustermann"
                />
              </div>
            )}

            {/* Passwort */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-sky-200 mb-1"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-2.5 bg-sky-950/60 border border-sky-600/40 rounded-xl text-white placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                placeholder="Min. 6 Zeichen"
              />
            </div>

            {/* Passwort bestätigen (nur bei Registrierung) */}
            {mode === 'register' && (
              <>
                <div>
                  <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-medium text-sky-200 mb-1"
                  >
                    Passwort bestätigen
                  </label>
                  <input
                    id="passwordConfirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 bg-sky-950/60 border border-sky-600/40 rounded-xl text-white placeholder-sky-500 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                    placeholder="Passwort wiederholen"
                  />
                </div>

                {/* Altersgruppe */}
                <div>
                  <label
                    htmlFor="ageGroup"
                    className="block text-sm font-medium text-sky-200 mb-1"
                  >
                    Klassenstufe
                  </label>
                  <select
                    id="ageGroup"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-sky-950/60 border border-sky-600/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-transparent transition"
                  >
                    {ageGroupOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Fehlermeldung */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-sky-950 font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {submitting
                ? '...'
                : mode === 'login'
                  ? 'Einloggen'
                  : 'Account erstellen'}
            </button>
          </form>

          {/* Mode-Toggle */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-sm text-sky-400 hover:text-amber-300 transition"
            >
              {mode === 'login'
                ? 'Noch kein Account? Hier registrieren'
                : 'Schon einen Account? Hier einloggen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
