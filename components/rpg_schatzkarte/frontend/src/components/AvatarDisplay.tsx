// ============================================
// AVATAR DISPLAY - Avataaars Integration
// Hochwertige Avatar-Darstellung
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import Avatar from 'avataaars';
import type { AvatarVisuals, AvatarEquipped } from '../types';

interface AvatarDisplayProps {
  visuals: AvatarVisuals;
  equipped?: AvatarEquipped;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showFrame?: boolean;
  showEffects?: boolean;
  className?: string;
  animated?: boolean;
}

const SIZE_MAP = {
  small: 60,
  medium: 120,
  large: 180,
  xlarge: 250,
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  visuals,
  equipped,
  size = 'medium',
  showFrame = false,
  showEffects = true,
  className = '',
  animated = true,
}) => {
  const pixelSize = SIZE_MAP[size];

  const containerVariants = animated ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: 'easeOut' as const },
  } : {};

  return (
    <motion.div
      className={`avatar-display avatar-display--${size} ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...containerVariants}
    >
      {/* Frame Effect */}
      {showFrame && equipped?.frame && (
        <div
          className="avatar-frame"
          style={{
            position: 'absolute',
            inset: -4,
            border: '3px solid gold',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)',
          }}
        />
      )}

      {/* Glow/Aura Effect */}
      {showEffects && equipped?.effect && (
        <div
          className="avatar-effect"
          style={{
            position: 'absolute',
            inset: -10,
            background: 'radial-gradient(circle, rgba(147, 112, 219, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Avataaars Component */}
      <Avatar
        style={{ width: pixelSize, height: pixelSize }}
        avatarStyle={visuals.avatarStyle}
        topType={visuals.topType}
        accessoriesType={visuals.accessoriesType}
        hairColor={visuals.hairColor}
        facialHairType={visuals.facialHairType}
        facialHairColor={visuals.facialHairColor}
        clotheType={visuals.clotheType}
        clotheColor={visuals.clotheColor}
        graphicType={visuals.graphicType}
        eyeType={visuals.eyeType}
        eyebrowType={visuals.eyebrowType}
        mouthType={visuals.mouthType}
        skinColor={visuals.skinColor}
      />
    </motion.div>
  );
};

export default AvatarDisplay;
