// ============================================
// AvatarShop.tsx - Hauptkomponente
// Pfad: src/components/AvatarShop/AvatarShop.tsx
// ============================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from 'avataaars';
import type { CustomAvatar, ShopItem, ItemSlot } from '../../types';
import { SHOP_ITEMS, SHOP_CATEGORIES, getItemsBySlot, getItemById } from './ShopItems';
import PurchaseModal from './PurchaseModal';
import './avatar-shop.css';

// ═══════════════════════════════════════
// PROPS INTERFACE
// ═══════════════════════════════════════

interface AvatarShopProps {
  playerGold: number;
  playerAvatar: CustomAvatar;
  ownedItems: string[];
  onPurchase: (item: ShopItem) => void;
  onEquip: (itemId: string, slot: ItemSlot) => void;
  onUnequip: (slot: ItemSlot) => void;
  onClose: () => void;
}

// ═══════════════════════════════════════
// KOMPONENTE
// ═══════════════════════════════════════

const AvatarShop: React.FC<AvatarShopProps> = ({
  playerGold,
  playerAvatar,
  ownedItems,
  onPurchase,
  onEquip,
  onUnequip,
  onClose
}) => {
  // State
  const [selectedCategory, setSelectedCategory] = useState<ItemSlot>('hat');
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);
  const [purchaseModalItem, setPurchaseModalItem] = useState<ShopItem | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  // Gefilterte Items nach Kategorie
  const categoryItems = useMemo(() => {
    return getItemsBySlot(selectedCategory);
  }, [selectedCategory]);

  // Berechne die anzuzeigenden Visuals basierend auf ausgerüsteten Items
  const computeDisplayVisuals = useMemo(() => {
    // Starte mit den Original-Visuals
    const visuals = { ...playerAvatar.visuals };

    // Wende ausgerüstete Items mit avataaarsMapping an
    const equippedSlots = previewItem
      ? { ...playerAvatar.equipped, [previewItem.slot]: previewItem.id }
      : playerAvatar.equipped;

    // Hat → topType
    if (equippedSlots.hat) {
      const hatItem = getItemById(equippedSlots.hat);
      if (hatItem?.avataaarsMapping) {
        (visuals as any)[hatItem.avataaarsMapping.property] = hatItem.avataaarsMapping.value;
      }
    }

    // Glasses → accessoriesType
    if (equippedSlots.glasses) {
      const glassesItem = getItemById(equippedSlots.glasses);
      if (glassesItem?.avataaarsMapping) {
        (visuals as any)[glassesItem.avataaarsMapping.property] = glassesItem.avataaarsMapping.value;
      }
    }

    return visuals;
  }, [playerAvatar, previewItem]);

  // Preview-Avatar mit temporärem Item (für equipped object)
  const previewAvatar = useMemo((): CustomAvatar => {
    if (!previewItem) return playerAvatar;

    return {
      ...playerAvatar,
      equipped: {
        ...playerAvatar.equipped,
        [previewItem.slot]: previewItem.id
      }
    };
  }, [playerAvatar, previewItem]);

  // ═══════════════════════════════════════
  // HANDLER
  // ═══════════════════════════════════════

  const handleItemClick = (item: ShopItem) => {
    const isOwned = ownedItems.includes(item.id);
    const isEquipped = playerAvatar.equipped[item.slot] === item.id;

    if (isEquipped) {
      // Bereits ausgerüstet → Entfernen
      onUnequip(item.slot);
    } else if (isOwned) {
      // Besitzt, aber nicht ausgerüstet → Ausrüsten
      onEquip(item.id, item.slot);
    } else {
      // Noch nicht gekauft → Kauf-Modal öffnen
      setPurchaseModalItem(item);
      setShowPurchaseModal(true);
    }
  };

  const handleItemHover = (item: ShopItem | null) => {
    setPreviewItem(item);
  };

  const handlePurchaseConfirm = () => {
    if (!purchaseModalItem) return;
    
    onPurchase(purchaseModalItem);
    onEquip(purchaseModalItem.id, purchaseModalItem.slot);
    
    // Erfolgs-Animation
    setPurchaseSuccess(purchaseModalItem.id);
    setTimeout(() => setPurchaseSuccess(null), 2000);
    
    setShowPurchaseModal(false);
    setPurchaseModalItem(null);
  };

  const handlePurchaseCancel = () => {
    setShowPurchaseModal(false);
    setPurchaseModalItem(null);
  };

  const handleEquippedSlotClick = (slot: ItemSlot) => {
    if (playerAvatar.equipped[slot]) {
      onUnequip(slot);
    }
  };

  // ═══════════════════════════════════════
  // HELPER
  // ═══════════════════════════════════════

  const getRarityClass = (rarity: ShopItem['rarity']): string => {
    return `rarity-${rarity}`;
  };

  const getItemStatus = (item: ShopItem): 'equipped' | 'owned' | 'affordable' | 'cant-afford' => {
    if (playerAvatar.equipped[item.slot] === item.id) return 'equipped';
    if (ownedItems.includes(item.id)) return 'owned';
    if (playerGold >= item.price) return 'affordable';
    return 'cant-afford';
  };

  const getEquippedItem = (slot: ItemSlot): ShopItem | null => {
    const itemId = playerAvatar.equipped[slot];
    if (!itemId) return null;
    return getItemById(itemId) || null;
  };

  // Frame-Styling basierend auf ausgerüstetem Rahmen
  const getFrameStyle = () => {
    const frameId = previewAvatar.equipped.frame;
    if (!frameId) return {};
    
    const frame = getItemById(frameId);
    if (!frame?.visualData?.borderColor) return {};
    
    return {
      borderColor: frame.visualData.borderColor,
      boxShadow: `0 0 20px ${frame.visualData.borderColor}40`
    };
  };

  // Effekt-Styling basierend auf ausgerüstetem Effekt
  const getEffectStyle = () => {
    const effectId = previewAvatar.equipped.effect;
    if (!effectId) return {};
    
    const effect = getItemById(effectId);
    if (!effect?.visualData?.color) return {};
    
    return {
      background: effect.visualData.color
    };
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <div className="avatar-shop">
      {/* Header */}
      <div className="shop-header">
        <h1 className="shop-title">🛒 Avatar-Shop</h1>
        <div className="shop-gold">
          <span className="gold-amount">💰 {playerGold} Gold</span>
        </div>
        <motion.button
          className="shop-close-btn"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>

      <div className="shop-content">
        {/* Linke Seite: Avatar Preview */}
        <div className="shop-preview-section">
          <div className="avatar-preview-container">
            {/* Effekt-Aura (hinter Avatar) */}
            {previewAvatar.equipped.effect && (
              <motion.div
                className="avatar-effect-aura"
                style={getEffectStyle()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Avatar mit Rahmen */}
            <div
              className="avatar-preview-frame"
              style={getFrameStyle()}
            >
              {/* Avataaars Komponente - mit berechneten Visuals */}
              <Avatar
                style={{ width: '200px', height: '200px' }}
                avatarStyle={computeDisplayVisuals.avatarStyle}
                topType={computeDisplayVisuals.topType}
                accessoriesType={computeDisplayVisuals.accessoriesType}
                hairColor={computeDisplayVisuals.hairColor}
                facialHairType={computeDisplayVisuals.facialHairType}
                facialHairColor={computeDisplayVisuals.facialHairColor}
                clotheType={computeDisplayVisuals.clotheType}
                clotheColor={computeDisplayVisuals.clotheColor}
                graphicType={computeDisplayVisuals.graphicType}
                eyeType={computeDisplayVisuals.eyeType}
                eyebrowType={computeDisplayVisuals.eyebrowType}
                mouthType={computeDisplayVisuals.mouthType}
                skinColor={computeDisplayVisuals.skinColor}
              />
            </div>
          </div>

          {/* Ausgerüstete Items */}
          <div className="equipped-slots">
            <h3 className="equipped-title">Ausgerüstet:</h3>
            <div className="equipped-grid">
              {SHOP_CATEGORIES.map(({ slot, icon }) => {
                const equippedItem = getEquippedItem(slot);
                return (
                  <motion.button
                    key={slot}
                    className={`equipped-slot ${equippedItem ? 'has-item' : ''}`}
                    onClick={() => handleEquippedSlotClick(slot)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={equippedItem ? `${equippedItem.name} entfernen` : `Kein ${icon}`}
                  >
                    {equippedItem ? equippedItem.icon : icon}
                    {equippedItem && <span className="remove-hint">✕</span>}
                  </motion.button>
                );
              })}
            </div>
            <p className="equipped-hint">(Klicken zum Entfernen)</p>
          </div>
        </div>

        {/* Rechte Seite: Shop */}
        <div className="shop-items-section">
          {/* Kategorie-Tabs */}
          <div className="category-tabs">
            {SHOP_CATEGORIES.map(({ slot, icon, label }) => (
              <motion.button
                key={slot}
                className={`category-tab ${selectedCategory === slot ? 'active' : ''}`}
                onClick={() => setSelectedCategory(slot)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="tab-icon">{icon}</span>
                <span className="tab-label">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Items Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              className="items-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {categoryItems.map((item) => {
                const status = getItemStatus(item);
                return (
                  <motion.div
                    key={item.id}
                    className={`shop-item ${status} ${getRarityClass(item.rarity)} ${
                      purchaseSuccess === item.id ? 'purchase-success' : ''
                    }`}
                    onClick={() => handleItemClick(item)}
                    onMouseEnter={() => handleItemHover(item)}
                    onMouseLeave={() => handleItemHover(null)}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    {/* Item Icon */}
                    <div className="item-icon-wrapper">
                      <span className="item-icon">{item.icon}</span>
                      {status === 'owned' && (
                        <span className="owned-badge">✓</span>
                      )}
                      {status === 'equipped' && (
                        <motion.span
                          className="equipped-badge"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          ★
                        </motion.span>
                      )}
                    </div>

                    {/* Item Name */}
                    <h4 className="item-name">{item.name}</h4>

                    {/* Preis oder Status */}
                    <div className="item-price">
                      {status === 'equipped' ? (
                        <span className="status-text">Ausgerüstet</span>
                      ) : status === 'owned' ? (
                        <span className="status-text">Besitzt</span>
                      ) : (
                        <span className={status === 'cant-afford' ? 'cant-afford-text' : ''}>
                          {item.price} 💰
                        </span>
                      )}
                    </div>

                    {/* Seltenheits-Indikator */}
                    <div className={`rarity-indicator ${getRarityClass(item.rarity)}`}>
                      {item.rarity === 'legendary' && '★★★★'}
                      {item.rarity === 'epic' && '★★★'}
                      {item.rarity === 'rare' && '★★'}
                      {item.rarity === 'common' && '★'}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        item={purchaseModalItem}
        playerGold={playerGold}
        isOpen={showPurchaseModal}
        onConfirm={handlePurchaseConfirm}
        onCancel={handlePurchaseCancel}
      />
    </div>
  );
};

export default AvatarShop;
