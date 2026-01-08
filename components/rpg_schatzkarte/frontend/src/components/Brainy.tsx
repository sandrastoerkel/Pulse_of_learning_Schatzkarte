// ============================================
// Brainy - Das Maskottchen von Pulse of Learning
// Animierter Gehirn-Charakter mit verschiedenen Stimmungen
// ============================================
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import '../styles/brainy.css';

// Brainy's Stimmungen
export type BrainyMood = 'happy' | 'excited' | 'thinking' | 'celebrating' | 'encouraging' | 'sleeping';

// Props für die Brainy-Komponente
interface BrainyProps {
  mood?: BrainyMood;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'left' | 'right' | 'center' | 'top-right';
  onClick?: () => void;
  autoHide?: boolean;
  hideAfter?: number;
}

// Animation-Konfiguration Type
interface MoodAnimationConfig {
  animate: { y?: number[]; rotate?: number[]; scale?: number[] };
  transition: Transition;
}

// Animations-Konfiguration basierend auf Stimmung
const moodAnimationConfigs: Record<BrainyMood, MoodAnimationConfig> = {
  happy: {
    animate: { y: [0, -8, 0], rotate: [0, 2, -2, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  },
  excited: {
    animate: { y: [0, -15, 0], rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
  },
  thinking: {
    animate: { rotate: [0, 3, 0, -3, 0] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  },
  celebrating: {
    animate: { y: [0, -20, 0], rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] },
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' }
  },
  encouraging: {
    animate: { y: [0, -5, 0], scale: [1, 1.02, 1] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
  },
  sleeping: {
    animate: { rotate: [0, 1, 0], y: [0, 2, 0] },
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
  }
};

// Emojis für verschiedene Stimmungen (als Overlay)
const moodEmojis: Record<BrainyMood, string[]> = {
  happy: ['✨'],
  excited: ['🎉', '⭐', '✨'],
  thinking: ['💭', '🤔'],
  celebrating: ['🎊', '🎉', '⭐', '🏆'],
  encouraging: ['💪', '✨'],
  sleeping: ['💤', 'zzz']
};

// Beispiel-Nachrichten pro Stimmung
const defaultMessages: Record<BrainyMood, string[]> = {
  happy: [
    'Hey! Bereit zum Lernen?',
    'Schön dich zu sehen!',
    'Auf geht\'s ins Abenteuer!'
  ],
  excited: [
    'WOW! Das hast du super gemacht!',
    'Unglaublich! Weiter so!',
    'Du bist auf Feuer! 🔥'
  ],
  thinking: [
    'Hmm, lass mich nachdenken...',
    'Interessante Frage...',
    'Einen Moment...'
  ],
  celebrating: [
    'FANTASTISCH! 🎉',
    'Du hast es geschafft!',
    'Level Up! Du bist der Hammer!'
  ],
  encouraging: [
    'Du schaffst das!',
    'Gib nicht auf!',
    'Jeder Fehler bringt dich weiter!'
  ],
  sleeping: [
    '💤 zzz...',
    '*schnarch*',
    'Brainy macht ein Nickerchen...'
  ]
};

export function Brainy({
  mood = 'happy',
  message,
  size = 'medium',
  position = 'right',
  onClick,
  autoHide = false,
  hideAfter = 5000
}: BrainyProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [showParticles, setShowParticles] = useState(false);

  // Zufällige Nachricht wenn keine angegeben
  useEffect(() => {
    if (!message) {
      const messages = defaultMessages[mood];
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    } else {
      setCurrentMessage(message);
    }
  }, [mood, message]);

  // Auto-hide Funktion
  useEffect(() => {
    if (autoHide && hideAfter > 0) {
      const timer = setTimeout(() => setIsVisible(false), hideAfter);
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideAfter]);

  // Partikel bei excited/celebrating
  useEffect(() => {
    if (mood === 'excited' || mood === 'celebrating') {
      setShowParticles(true);
    } else {
      setShowParticles(false);
    }
  }, [mood]);

  const sizeClass = `brainy-${size}`;
  const positionClass = `brainy-position-${position}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`brainy-wrapper ${positionClass}`}
          initial={{ opacity: 0, scale: 0, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Sprechblase */}
          {currentMessage && (
            <motion.div
              className="brainy-speech-bubble"
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
            >
              <span className="bubble-text">{currentMessage}</span>
              <div className="bubble-tail" />
            </motion.div>
          )}

          {/* Brainy Container */}
          <motion.div
            className={`brainy-container ${sizeClass}`}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95, rotate: 10 }}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            {/* Partikel/Emojis */}
            {showParticles && (
              <div className="brainy-particles">
                {moodEmojis[mood].map((emoji, index) => (
                  <motion.span
                    key={index}
                    className="particle"
                    initial={{ opacity: 0, y: 0, x: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [-20, -60],
                      x: [(index - 1) * 20, (index - 1) * 30],
                      rotate: [0, 360]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.3,
                      ease: 'easeOut'
                    }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Brainy Bild mit Animation */}
            <motion.img
              src="./images/brainy.png"
              alt="Brainy - Dein Lern-Buddy"
              className="brainy-image"
              animate={moodAnimationConfigs[mood].animate}
              transition={moodAnimationConfigs[mood].transition}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.1}
            />

            {/* Schlaf-Zzzs */}
            {mood === 'sleeping' && (
              <motion.div
                className="brainy-zzz"
                animate={{ opacity: [0, 1, 0], y: [0, -20], x: [0, 10] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💤
              </motion.div>
            )}

            {/* Glanz-Effekt */}
            <motion.div
              className="brainy-glow"
              animate={{
                opacity: mood === 'celebrating' ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Vordefinierte Brainy-Varianten für einfache Nutzung
// ============================================

// Brainy für Willkommens-Nachrichten
export function BrainyWelcome({ userName }: { userName?: string }) {
  const greeting = userName ? `Hey ${userName}! Bereit für ein Abenteuer?` : 'Hey! Bereit für ein Abenteuer?';
  return <Brainy mood="happy" message={greeting} size="large" position="center" />;
}

// Brainy für Erfolge
export function BrainySuccess({ xp }: { xp?: number }) {
  const message = xp ? `+${xp} XP! Du bist der Hammer!` : 'Super gemacht!';
  return <Brainy mood="celebrating" message={message} autoHide hideAfter={4000} />;
}

// Brainy für Ermutigungen
export function BrainyEncourage() {
  return <Brainy mood="encouraging" size="small" position="right" />;
}

// Brainy für leere Zustände
export function BrainyEmpty({ message }: { message?: string }) {
  return (
    <Brainy
      mood="thinking"
      message={message || "Noch nichts hier... Lass uns loslegen!"}
      size="medium"
      position="center"
    />
  );
}

// Brainy als kleiner Helfer-Button
export function BrainyHelper({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      className="brainy-helper-button"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <Brainy mood="happy" size="small" message="" />
      <span className="helper-label">Hilfe?</span>
    </motion.div>
  );
}

export default Brainy;
