import React, { useId } from 'react';
import { IconProps, COLORS, Sparkle, GlowRing } from './IconDefs';

/**
 * VulkanIcon - Was dich antreibt
 * Symbolisiert: Motivation, inneres Feuer, Leidenschaft, Energie
 * Design: Aktiver Vulkan mit dynamischen Flammen und Lava
 */

export const VulkanIcon: React.FC<IconProps> = ({ 
  size = 64, 
  animated = true,
  glowing = true,
  className = '' 
}) => {
  const id = useId().replace(/:/g, '');
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Vulkan-Stein */}
        <linearGradient id={`${id}-rockGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5D4E4E" />
          <stop offset="30%" stopColor="#463939" />
          <stop offset="70%" stopColor="#2E2424" />
          <stop offset="100%" stopColor="#1A1212" />
        </linearGradient>
        
        <linearGradient id={`${id}-rockDark`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3D2E2E" />
          <stop offset="100%" stopColor="#1A0F0F" />
        </linearGradient>

        {/* Feuer-Gradient */}
        <linearGradient id={`${id}-fireGradient`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="20%" stopColor="#DC143C" />
          <stop offset="40%" stopColor="#FF4500" />
          <stop offset="60%" stopColor="#FF6347" />
          <stop offset="80%" stopColor="#FFA500" />
          <stop offset="95%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFFFE0" />
        </linearGradient>

        {/* Lava-Gradient */}
        <linearGradient id={`${id}-lavaGradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6347" />
          <stop offset="50%" stopColor="#FF4500" />
          <stop offset="100%" stopColor="#DC143C" />
        </linearGradient>

        {/* Glühender Kern */}
        <radialGradient id={`${id}-coreGlow`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFFFE0" stopOpacity="1" />
          <stop offset="30%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#FF4500" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
        </radialGradient>

        {/* Glow Filter */}
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Fire Glow */}
        <filter id={`${id}-fireGlow`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feFlood floodColor="#FF4500" floodOpacity="0.6" result="glowColor" />
          <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Shimmer */}
        <linearGradient id={`${id}-shimmer`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="-1;2" dur="2s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="50%" stopColor="rgba(255,255,255,0.3)">
            {animated && (
              <animate attributeName="offset" values="-0.5;2.5" dur="2s" repeatCount="indefinite" />
            )}
          </stop>
          <stop offset="100%" stopColor="rgba(255,255,255,0)">
            {animated && (
              <animate attributeName="offset" values="0;3" dur="2s" repeatCount="indefinite" />
            )}
          </stop>
        </linearGradient>
      </defs>

      {/* Äußerer Glow-Ring */}
      {glowing && (
        <GlowRing cx={32} cy={32} r={30} color="#FF4500" animated={animated} />
      )}

      {/* Haupt-Gruppe */}
      <g filter={glowing ? `url(#${id}-glow)` : undefined}>
        
        {/* ========== VULKAN-KÖRPER ========== */}
        
        {/* Haupt-Berg */}
        <path
          d="M8 58 L24 24 L40 24 L56 58 Z"
          fill={`url(#${id}-rockGradient)`}
          stroke={`url(#${id}-rockDark)`}
          strokeWidth="1"
        />

        {/* Kratzer-Details am Berg */}
        <path d="M15 50 L22 35" stroke="#3D2E2E" strokeWidth="1" opacity="0.5" />
        <path d="M49 50 L42 35" stroke="#3D2E2E" strokeWidth="1" opacity="0.5" />
        <path d="M20 55 L26 42" stroke="#2E2424" strokeWidth="0.5" opacity="0.4" />

        {/* Krater-Öffnung */}
        <ellipse
          cx="32"
          cy="24"
          rx="10"
          ry="4"
          fill={`url(#${id}-rockDark)`}
        />
        
        {/* Lava im Krater */}
        <ellipse
          cx="32"
          cy="24"
          rx="7"
          ry="2.5"
          fill={`url(#${id}-lavaGradient)`}
        >
          {animated && (
            <animate
              attributeName="ry"
              values="2.5;3;2.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>

        {/* ========== FEUER / FLAMMEN ========== */}
        <g filter={`url(#${id}-fireGlow)`}>
          {/* Haupt-Flamme */}
          <path
            d="M32 22 
               Q28 16, 30 10
               Q32 4, 32 2
               Q32 4, 34 10
               Q36 16, 32 22"
            fill={`url(#${id}-fireGradient)`}
          >
            {animated && (
              <animate
                attributeName="d"
                values="
                  M32 22 Q28 16, 30 10 Q32 4, 32 2 Q32 4, 34 10 Q36 16, 32 22;
                  M32 22 Q26 14, 29 8 Q31 2, 32 0 Q33 2, 35 8 Q38 14, 32 22;
                  M32 22 Q29 15, 31 9 Q32 3, 32 1 Q32 3, 33 9 Q35 15, 32 22;
                  M32 22 Q28 16, 30 10 Q32 4, 32 2 Q32 4, 34 10 Q36 16, 32 22
                "
                dur="0.8s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Linke Flamme */}
          <path
            d="M28 24 
               Q24 20, 26 14
               Q27 10, 26 8
               Q28 12, 29 16
               Q30 20, 28 24"
            fill={`url(#${id}-fireGradient)`}
            opacity="0.9"
          >
            {animated && (
              <animate
                attributeName="d"
                values="
                  M28 24 Q24 20, 26 14 Q27 10, 26 8 Q28 12, 29 16 Q30 20, 28 24;
                  M28 24 Q23 18, 25 12 Q26 8, 25 6 Q27 10, 28 14 Q30 18, 28 24;
                  M28 24 Q24 20, 26 14 Q27 10, 26 8 Q28 12, 29 16 Q30 20, 28 24
                "
                dur="0.6s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Rechte Flamme */}
          <path
            d="M36 24 
               Q40 20, 38 14
               Q37 10, 38 8
               Q36 12, 35 16
               Q34 20, 36 24"
            fill={`url(#${id}-fireGradient)`}
            opacity="0.9"
          >
            {animated && (
              <animate
                attributeName="d"
                values="
                  M36 24 Q40 20, 38 14 Q37 10, 38 8 Q36 12, 35 16 Q34 20, 36 24;
                  M36 24 Q41 18, 39 12 Q38 8, 39 6 Q37 10, 36 14 Q34 18, 36 24;
                  M36 24 Q40 20, 38 14 Q37 10, 38 8 Q36 12, 35 16 Q34 20, 36 24
                "
                dur="0.7s"
                repeatCount="indefinite"
              />
            )}
          </path>

          {/* Glühender Kern im Feuer */}
          <circle
            cx="32"
            cy="16"
            r="4"
            fill={`url(#${id}-coreGlow)`}
            opacity="0.7"
          >
            {animated && (
              <animate
                attributeName="r"
                values="4;5;4"
                dur="0.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>

        {/* ========== LAVA-STRÖME ========== */}
        
        {/* Linker Lavastrom */}
        <path
          d="M26 28 Q20 38, 16 50 Q14 54, 12 56"
          fill="none"
          stroke={`url(#${id}-lavaGradient)`}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        >
          {animated && (
            <animate
              attributeName="stroke-dasharray"
              values="0 100;40 60;0 100"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Rechter Lavastrom */}
        <path
          d="M38 28 Q44 40, 50 52 Q51 54, 52 56"
          fill="none"
          stroke={`url(#${id}-lavaGradient)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
        >
          {animated && (
            <animate
              attributeName="stroke-dasharray"
              values="0 100;30 70;0 100"
              dur="3.5s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Schimmer-Overlay */}
        {animated && (
          <rect
            x="8"
            y="0"
            width="48"
            height="60"
            fill={`url(#${id}-shimmer)`}
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </g>

      {/* Funken / Glühende Partikel */}
      {animated && (
        <>
          <circle cx="28" cy="6" r="1.5" fill="#FFD700">
            <animate attributeName="cy" values="6;-4;6" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="36" cy="4" r="1" fill="#FF6347">
            <animate attributeName="cy" values="4;-6;4" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="32" cy="2" r="1.2" fill="#FFA500">
            <animate attributeName="cy" values="2;-8;2" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <Sparkle x={22} y={10} size={4} delay={0.3} duration={1.2} animated={animated} />
          <Sparkle x={42} y={8} size={3} delay={0.8} duration={1} animated={animated} />
        </>
      )}
    </svg>
  );
};

export default VulkanIcon;
