// ============================================
// PurchaseModal.tsx - Kauf-Bestätigung
// Pfad: src/components/AvatarShop/PurchaseModal.tsx
// ============================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ShopItem } from '../../types';

interface PurchaseModalProps {
  item: ShopItem | null;
  playerGold: number;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  item,
  playerGold,
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!item) return null;

  const canAfford = playerGold >= item.price;
  const goldAfterPurchase = playerGold - item.price;

  // Seltenheits-Klasse für Styling
  const getRarityClass = (rarity: ShopItem['rarity']): string => {
    return `rarity-${rarity}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="purchase-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          {/* Modal */}
          <motion.div
            className="purchase-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Item Icon */}
            <motion.div
              className="purchase-modal-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15 }}
            >
              <span className="item-emoji">{item.icon}</span>
            </motion.div>

            {/* Item Name */}
            <h2 className={`purchase-modal-title ${getRarityClass(item.rarity)}`}>
              {item.name}
            </h2>

            {/* Seltenheit Badge */}
            <span className={`rarity-badge ${getRarityClass(item.rarity)}`}>
              {item.rarity === 'common' && '★ Gewöhnlich'}
              {item.rarity === 'rare' && '★★ Selten'}
              {item.rarity === 'epic' && '★★★ Episch'}
              {item.rarity === 'legendary' && '★★★★ Legendär'}
            </span>

            {/* Beschreibung */}
            <p className="purchase-modal-description">
              "{item.description}"
            </p>

            {/* Preis-Info */}
            <div className="purchase-modal-price-section">
              <div className="price-row">
                <span className="price-label">Preis:</span>
                <span className="price-value">{item.price} 💰</span>
              </div>

              <div className="price-divider" />

              <div className="price-row">
                <span className="price-label">Dein Gold:</span>
                <span className={`price-value ${!canAfford ? 'not-enough' : ''}`}>
                  {playerGold} 💰
                </span>
              </div>

              <div className="price-row">
                <span className="price-label">Nach Kauf:</span>
                <span className={`price-value ${!canAfford ? 'not-enough' : 'after-purchase'}`}>
                  {canAfford ? `${goldAfterPurchase} 💰` : 'Nicht genug Gold!'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="purchase-modal-buttons">
              <motion.button
                className="btn-cancel"
                onClick={onCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Abbrechen
              </motion.button>

              <motion.button
                className={`btn-purchase ${!canAfford ? 'disabled' : ''}`}
                onClick={canAfford ? onConfirm : undefined}
                whileHover={canAfford ? { scale: 1.05 } : {}}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                animate={!canAfford ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                transition={!canAfford ? { duration: 0.4 } : {}}
                disabled={!canAfford}
              >
                {canAfford ? '💰 Kaufen' : '❌ Zu teuer'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseModal;
