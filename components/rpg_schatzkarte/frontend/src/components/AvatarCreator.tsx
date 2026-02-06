// ============================================
// AVATAR CREATOR - Avataaars Integration
// Hochwertige Avatar-Erstellung
// ============================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplay } from './AvatarDisplay';
import {
  TOP_TYPES,
  HAIR_COLORS,
  ACCESSORIES_TYPES,
  EYE_TYPES,
  EYEBROW_TYPES,
  MOUTH_TYPES,
  SKIN_COLORS,
  CLOTHE_TYPES,
  CLOTHE_COLORS,
  GRAPHIC_TYPES,
  DEFAULT_AVATAR_VISUALS,
  DEFAULT_AVATAR_EQUIPPED,
  AVATAR_CATEGORIES,
} from './AvatarParts';
import type {
  CustomAvatar,
  AvatarVisuals,
  AvatarPartOption,
  TopType,
  HairColor,
  AccessoriesType,
  EyeType,
  EyebrowType,
  MouthType,
  SkinColor,
  ClotheType,
  ClotheColor,
  GraphicType,
} from '../types';
import '../styles/avatar.css';

// === TYPES ===
interface AvatarCreatorProps {
  initialAvatar?: CustomAvatar;
  initialName?: string;
  onSave: (avatar: CustomAvatar, name: string) => void;
  onCancel?: () => void;
}

type CategoryId = 'hair' | 'face' | 'accessories' | 'clothes' | 'skin';

// === MAIN COMPONENT ===
export const AvatarCreator: React.FC<AvatarCreatorProps> = ({
  initialAvatar,
  initialName = '',
  onSave,
  onCancel,
}) => {
  // State
  const [heroName, setHeroName] = useState<string>(initialName);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('hair');
  const [visuals, setVisuals] = useState<AvatarVisuals>(
    initialAvatar?.visuals || DEFAULT_AVATAR_VISUALS
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  // Update visual property
  const updateVisual = useCallback(<K extends keyof AvatarVisuals>(
    key: K,
    value: AvatarVisuals[K]
  ) => {
    setVisuals(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    if (!heroName.trim()) {
      const input = document.querySelector('.avatar-creator__name-field') as HTMLInputElement;
      input?.focus();
      input?.classList.add('shake');
      setTimeout(() => input?.classList.remove('shake'), 500);
      return;
    }

    spawnConfetti();
    setShowSuccess(true);

    setTimeout(() => {
      const avatar: CustomAvatar = {
        visuals,
        equipped: DEFAULT_AVATAR_EQUIPPED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(avatar, heroName);
    }, 1500);
  }, [heroName, visuals, onSave]);

  // Confetti effect
  const spawnConfetti = () => {
    const colors = ['var(--fb-reward)', '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71', '#FF69B4'];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      style: {
        left: `${Math.random() * 100}vw`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      },
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 4000);
  };

  // Tab animation variants
  const tabContentVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Render options based on category
  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'hair':
        return (
          <motion.div
            key="hair"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Frisur */}
            <div className="avatar-creator__options-title">
              <span>💇</span> Frisur
            </div>
            <OptionGrid
              options={TOP_TYPES}
              selected={visuals.topType}
              onSelect={(id) => updateVisual('topType', id as TopType)}
              columns={4}
            />

            {/* Haarfarbe */}
            <div className="avatar-creator__options-title" style={{ marginTop: '20px' }}>
              <span>🎨</span> Haarfarbe
            </div>
            <OptionGrid
              options={HAIR_COLORS}
              selected={visuals.hairColor}
              onSelect={(id) => updateVisual('hairColor', id as HairColor)}
              columns={6}
              isColor
            />
          </motion.div>
        );

      case 'face':
        return (
          <motion.div
            key="face"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Augen */}
            <div className="avatar-creator__options-title">
              <span>👁️</span> Augen
            </div>
            <OptionGrid
              options={EYE_TYPES}
              selected={visuals.eyeType}
              onSelect={(id) => updateVisual('eyeType', id as EyeType)}
              columns={4}
            />

            {/* Augenbrauen */}
            <div className="avatar-creator__options-title" style={{ marginTop: '20px' }}>
              <span>〰️</span> Augenbrauen
            </div>
            <OptionGrid
              options={EYEBROW_TYPES}
              selected={visuals.eyebrowType}
              onSelect={(id) => updateVisual('eyebrowType', id as EyebrowType)}
              columns={4}
            />

            {/* Mund */}
            <div className="avatar-creator__options-title" style={{ marginTop: '20px' }}>
              <span>👄</span> Mund
            </div>
            <OptionGrid
              options={MOUTH_TYPES}
              selected={visuals.mouthType}
              onSelect={(id) => updateVisual('mouthType', id as MouthType)}
              columns={4}
            />
          </motion.div>
        );

      case 'accessories':
        return (
          <motion.div
            key="accessories"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Brillen */}
            <div className="avatar-creator__options-title">
              <span>👓</span> Brille
            </div>
            <OptionGrid
              options={ACCESSORIES_TYPES}
              selected={visuals.accessoriesType}
              onSelect={(id) => updateVisual('accessoriesType', id as AccessoriesType)}
              columns={4}
            />
          </motion.div>
        );

      case 'clothes':
        return (
          <motion.div
            key="clothes"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Kleidungstyp */}
            <div className="avatar-creator__options-title">
              <span>👕</span> Kleidung
            </div>
            <OptionGrid
              options={CLOTHE_TYPES}
              selected={visuals.clotheType}
              onSelect={(id) => updateVisual('clotheType', id as ClotheType)}
              columns={3}
            />

            {/* Kleidungsfarbe */}
            <div className="avatar-creator__options-title" style={{ marginTop: '20px' }}>
              <span>🎨</span> Farbe
            </div>
            <OptionGrid
              options={CLOTHE_COLORS}
              selected={visuals.clotheColor}
              onSelect={(id) => updateVisual('clotheColor', id as ClotheColor)}
              columns={5}
              isColor
            />

            {/* Grafik (nur bei GraphicShirt) */}
            {visuals.clotheType === 'GraphicShirt' && (
              <>
                <div className="avatar-creator__options-title" style={{ marginTop: '20px' }}>
                  <span>🎨</span> Motiv
                </div>
                <OptionGrid
                  options={GRAPHIC_TYPES}
                  selected={visuals.graphicType}
                  onSelect={(id) => updateVisual('graphicType', id as GraphicType)}
                  columns={4}
                />
              </>
            )}
          </motion.div>
        );

      case 'skin':
        return (
          <motion.div
            key="skin"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Hautfarbe */}
            <div className="avatar-creator__options-title">
              <span>🎨</span> Hautfarbe
            </div>
            <OptionGrid
              options={SKIN_COLORS}
              selected={visuals.skinColor}
              onSelect={(id) => updateVisual('skinColor', id as SkinColor)}
              columns={4}
              large
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="avatar-creator">
      {/* Title */}
      <h2 className="avatar-creator__title">
        <span className="avatar-creator__title-icon">🎨</span>
        Erstelle deinen Helden!
      </h2>

      <div className="avatar-creator__content">
        {/* Left Panel - Preview */}
        <div className="avatar-creator__preview-panel">
          <div className="avatar-creator__preview-container">
            <AvatarDisplay
              visuals={visuals}
              size="xlarge"
              animated={true}
            />
          </div>

          {/* Name Input */}
          <div className="avatar-creator__name-input">
            <label className="avatar-creator__name-label">
              🏷️ Heldenname
            </label>
            <input
              type="text"
              className="avatar-creator__name-field"
              placeholder="Gib deinem Helden einen Namen..."
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              maxLength={20}
            />
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="avatar-creator__editor-panel">
          {/* Category Tabs */}
          <div className="avatar-creator__tabs" role="tablist">
            {AVATAR_CATEGORIES.map((category) => (
              <motion.button
                key={category.id}
                className={`avatar-creator__tab ${
                  activeCategory === category.id ? 'avatar-creator__tab--active' : ''
                }`}
                onClick={() => setActiveCategory(category.id as CategoryId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                role="tab"
                aria-selected={activeCategory === category.id}
              >
                <span className="avatar-creator__tab-icon">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* Options Section */}
          <div className="avatar-creator__options-section">
            <AnimatePresence mode="wait">
              {renderCategoryContent()}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="avatar-creator__actions">
            {onCancel && (
              <motion.button
                className="avatar-creator__btn avatar-creator__btn--cancel"
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="avatar-creator__btn-icon">✖️</span>
                Abbrechen
              </motion.button>
            )}
            <motion.button
              className="avatar-creator__btn avatar-creator__btn--save"
              onClick={handleSave}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="avatar-creator__btn-icon">💾</span>
              Avatar speichern
            </motion.button>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="avatar-creator__success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="avatar-creator__success-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className="avatar-creator__success-icon">🎉</div>
              <div className="avatar-creator__success-text">
                Held erstellt!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {confetti.map((c) => (
        <div key={c.id} className="confetti" style={c.style} />
      ))}
    </div>
  );
};

// === SUB-COMPONENTS ===

interface OptionGridProps {
  options: AvatarPartOption[];
  selected: string;
  onSelect: (id: string) => void;
  columns?: number;
  isColor?: boolean;
  large?: boolean;
}

const OptionGrid: React.FC<OptionGridProps> = ({
  options,
  selected,
  onSelect,
  columns = 4,
  isColor = false,
  large = false,
}) => {
  // Farbwerte für die Color-Optionen
  const colorMap: Record<string, string> = {
    // Haarfarben
    Black: '#2C1B18',
    BrownDark: '#4A312C',
    Brown: '#724133',
    Auburn: '#A55728',
    Red: '#C93305',
    Blonde: '#B58143',
    BlondeGolden: '#D6B370',
    Platinum: '#ECDCBF',
    SilverGray: '#E8E1E1',
    PastelPink: '#F59797',
    Blue: '#000fdb',
    // Hautfarben
    Tanned: '#FD9841',
    Yellow: '#F8D25C',
    Pale: '#FFDBB4',
    Light: '#EDB98A',
    DarkBrown: '#AE5D29',
    // Kleidungsfarben
    Blue01: '#65C9FF',
    Blue02: '#5199E4',
    Blue03: '#25557C',
    Gray01: '#E6E6E6',
    Gray02: '#929598',
    Heather: '#3C4F5C',
    PastelBlue: '#B1E2FF',
    PastelGreen: '#A7FFC4',
    PastelOrange: '#FFDEB5',
    PastelRed: '#FFAFB9',
    PastelYellow: '#FFFFB1',
    Pink: '#FF488E',
    White: '#FFFFFF',
  };

  return (
    <div
      className="avatar-creator__options-grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {options.map((option) => (
        <motion.button
          key={option.id}
          className={`avatar-creator__option ${
            selected === option.id ? 'avatar-creator__option--selected' : ''
          } ${isColor ? 'avatar-creator__option--color' : ''} ${
            large ? 'avatar-creator__option--large' : ''
          }`}
          onClick={() => onSelect(option.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={selected === option.id}
          style={
            isColor && colorMap[option.id]
              ? { backgroundColor: colorMap[option.id] }
              : undefined
          }
        >
          {!isColor && (
            <>
              <span className="avatar-creator__option-icon">{option.icon}</span>
              <span className="avatar-creator__option-label">{option.name}</span>
            </>
          )}
          {isColor && selected === option.id && (
            <span className="avatar-creator__option-check">✓</span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default AvatarCreator;
