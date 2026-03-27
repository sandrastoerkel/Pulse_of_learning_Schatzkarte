import { motion } from 'framer-motion';

/**
 * Ladebildschirm der beim Lazy-Loading von Routes angezeigt wird.
 * Zeigt eine animierte Kompass-Animation im Schatzkarte-Stil.
 */
export function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0d1f3c 100%)',
      fontFamily: 'Nunito, sans-serif',
    }}>
      {/* Animierter Kompass */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          fontSize: '3rem',
          marginBottom: '1.5rem',
        }}
      >
        🧭
      </motion.div>

      {/* Pulsierender Text */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          color: '#c8a84e',
          fontSize: '1.1rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        Schatzkarte wird geladen...
      </motion.p>
    </div>
  );
}
