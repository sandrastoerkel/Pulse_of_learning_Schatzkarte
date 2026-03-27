/**
 * Coach-Bereich
 * 
 * TODO: Bestehende Komponente hierher migrieren.
 * In Phase 4 wird diese Datei die echte Komponente importieren
 * und mit React Query Hooks statt Streamlit-Props versorgen.
 */
export default function CoachDashboard() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0d1f3c 100%)',
      fontFamily: 'Nunito, sans-serif',
      color: '#c8a84e',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Coach Dashboard</h1>
      <p style={{ color: '#8899aa' }}>Placeholder — wird in Phase 4 mit echtem Code ersetzt</p>
    </div>
  );
}
