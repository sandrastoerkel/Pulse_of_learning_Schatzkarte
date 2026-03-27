// ============================================
// GuestBanner.tsx - Banner für Gast-Modus
// Zeigt Hinweis und Anmelde-CTA für Gäste
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './guest-banner.css';

interface GuestBannerProps {
  text: string;
  onSignUp?: () => void;
  onBackToLanding?: () => void;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({
  text,
  onSignUp,
  onBackToLanding
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="guest-banner"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="guest-banner__content">
          <span className="guest-banner__icon">🧭</span>
          <p className="guest-banner__text">{text}</p>
          <div className="guest-banner__actions">
            {onBackToLanding && (
              <button
                className="guest-banner__btn guest-banner__btn--secondary"
                onClick={onBackToLanding}
              >
                ← Zurück
              </button>
            )}
            {onSignUp && (
              <button
                className="guest-banner__btn guest-banner__btn--primary"
                onClick={onSignUp}
              >
                Jetzt anmelden
              </button>
            )}
          </div>
        </div>
        <button
          className="guest-banner__dismiss"
          onClick={() => setIsDismissed(true)}
          title="Banner schließen"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default GuestBanner;
