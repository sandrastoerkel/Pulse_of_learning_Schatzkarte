import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingScreen } from '@/components/LoadingScreen';

// ============================================================
// Lazy-loaded Pages — werden erst geladen wenn navigiert wird
// ============================================================

// Landing & Auth
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const ChangePasswordPage = React.lazy(() => import('@/pages/ChangePasswordPage'));

// Schatzkarte (Hauptansicht mit Weltkarte)
const SchatzkartePage = React.lazy(() => import('@/pages/SchatzkartePage'));

// Inseln — jede ist ein eigener Chunk
const StarthafenPage = React.lazy(() => import('@/pages/islands/StarthafenPage'));
const FestungPage = React.lazy(() => import('@/pages/islands/FestungPage'));
const WerkzeugePage = React.lazy(() => import('@/pages/islands/WerkzeugePage'));
const FaedenPage = React.lazy(() => import('@/pages/islands/FaedenPage'));
const BrueckenPage = React.lazy(() => import('@/pages/islands/BrueckenPage'));
const SpiegelSeePage = React.lazy(() => import('@/pages/islands/SpiegelSeePage'));
const VulkanPage = React.lazy(() => import('@/pages/islands/VulkanPage'));
const RuheOasePage = React.lazy(() => import('@/pages/islands/RuheOasePage'));
const AusdauerGipfelPage = React.lazy(() => import('@/pages/islands/AusdauerGipfelPage'));
const FokusLeuchtturmPage = React.lazy(() => import('@/pages/islands/FokusLeuchtturmPage'));
const WachstumGartenPage = React.lazy(() => import('@/pages/islands/WachstumGartenPage'));
const LehrerTurmPage = React.lazy(() => import('@/pages/islands/LehrerTurmPage'));
const WohlfuehlDorfPage = React.lazy(() => import('@/pages/islands/WohlfuehlDorfPage'));
const SchutzBurgPage = React.lazy(() => import('@/pages/islands/SchutzBurgPage'));
const MeisterBergPage = React.lazy(() => import('@/pages/islands/MeisterBergPage'));

// Große Sub-Systeme — jeweils eigener Chunk
const SchatzkammerPage = React.lazy(() => import('@/pages/SchatzkammerPage'));
const DenkariumPage = React.lazy(() => import('@/pages/DenkariumPage'));
const EinmaleinsPage = React.lazy(() => import('@/pages/EinmaleinsPage'));
const BanduraPage = React.lazy(() => import('@/pages/BanduraPage'));
const HattiePage = React.lazy(() => import('@/pages/HattiePage'));
const PolarsternPage = React.lazy(() => import('@/pages/PolarsternPage'));
const WortschmiedePage = React.lazy(() => import('@/pages/WortschmiedePage'));
const LernkartenPage = React.lazy(() => import('@/pages/LernkartenPage'));

// Spiele & Avatar-Shop
const MemoryGamePage = React.lazy(() => import('@/pages/MemoryGamePage'));
const RunnerGamePage = React.lazy(() => import('@/pages/RunnerGamePage'));
const AvatarShopPage = React.lazy(() => import('@/pages/AvatarShopPage'));

// Coach-Bereich (nur für Coaches)
const CoachDashboard = React.lazy(() => import('@/pages/coach/CoachDashboard'));

// ============================================================
// MustChangePasswordGuard — fängt migrierte User ab
// ============================================================

function MustChangePasswordGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const mustChange = user?.user_metadata?.must_change_password === true;

  if (mustChange) {
    return <Navigate to="/passwort-aendern" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// App — Routing-Struktur
// ============================================================

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Öffentliche Routen */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Passwort ändern (nach Migration) — geschützt aber ohne MustChangePassword-Guard */}
        <Route path="/passwort-aendern" element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        } />

        {/* Schatzkarte — geschützt + MustChangePassword-Guard */}
        <Route path="/karte" element={
          <ProtectedRoute>
            <MustChangePasswordGuard>
              <SchatzkartePage />
            </MustChangePasswordGuard>
          </ProtectedRoute>
        } />

        {/* Inseln — geschützt, jeweils eigener Chunk */}
        <Route path="/karte/starthafen" element={
          <ProtectedRoute><MustChangePasswordGuard><StarthafenPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/festung" element={
          <ProtectedRoute><MustChangePasswordGuard><FestungPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/werkzeuge" element={
          <ProtectedRoute><MustChangePasswordGuard><WerkzeugePage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/faeden" element={
          <ProtectedRoute><MustChangePasswordGuard><FaedenPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/bruecken" element={
          <ProtectedRoute><MustChangePasswordGuard><BrueckenPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/spiegel-see" element={
          <ProtectedRoute><MustChangePasswordGuard><SpiegelSeePage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/vulkan" element={
          <ProtectedRoute><MustChangePasswordGuard><VulkanPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/ruhe-oase" element={
          <ProtectedRoute><MustChangePasswordGuard><RuheOasePage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/ausdauer-gipfel" element={
          <ProtectedRoute><MustChangePasswordGuard><AusdauerGipfelPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/fokus-leuchtturm" element={
          <ProtectedRoute><MustChangePasswordGuard><FokusLeuchtturmPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/wachstum-garten" element={
          <ProtectedRoute><MustChangePasswordGuard><WachstumGartenPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/lehrer-turm" element={
          <ProtectedRoute><MustChangePasswordGuard><LehrerTurmPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/wohlfuehl-dorf" element={
          <ProtectedRoute><MustChangePasswordGuard><WohlfuehlDorfPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/schutz-burg" element={
          <ProtectedRoute><MustChangePasswordGuard><SchutzBurgPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/meister-berg" element={
          <ProtectedRoute><MustChangePasswordGuard><MeisterBergPage /></MustChangePasswordGuard></ProtectedRoute>
        } />

        {/* Sub-Systeme — geschützt, große eigene Chunks */}
        <Route path="/karte/schatzkammer" element={
          <ProtectedRoute><MustChangePasswordGuard><SchatzkammerPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/denkarium" element={
          <ProtectedRoute><MustChangePasswordGuard><DenkariumPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/einmaleins" element={
          <ProtectedRoute><MustChangePasswordGuard><EinmaleinsPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/bandura" element={
          <ProtectedRoute><MustChangePasswordGuard><BanduraPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/hattie" element={
          <ProtectedRoute><MustChangePasswordGuard><HattiePage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/polarstern" element={
          <ProtectedRoute><MustChangePasswordGuard><PolarsternPage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/wortschmiede" element={
          <ProtectedRoute><MustChangePasswordGuard><WortschmiedePage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/lernkarten" element={
          <ProtectedRoute><MustChangePasswordGuard><LernkartenPage /></MustChangePasswordGuard></ProtectedRoute>
        } />

        {/* Spiele & Avatar-Shop */}
        <Route path="/karte/memory" element={
          <ProtectedRoute><MustChangePasswordGuard><MemoryGamePage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/brick-breaker" element={
          <ProtectedRoute><MustChangePasswordGuard><RunnerGamePage /></MustChangePasswordGuard></ProtectedRoute>
        } />
        <Route path="/karte/avatar-shop" element={
          <ProtectedRoute><MustChangePasswordGuard><AvatarShopPage /></MustChangePasswordGuard></ProtectedRoute>
        } />

        {/* Coach-Bereich — nur für Coaches/Admins */}
        <Route path="/coach/*" element={
          <ProtectedRoute requiredRole="coach">
            <MustChangePasswordGuard>
              <CoachDashboard />
            </MustChangePasswordGuard>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
