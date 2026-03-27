// src/types/ui.ts
// UI-Types für die Schatzkarte (von altem types.ts übernommen)

export type { AgeGroup } from './auth';

// Icon-Props Interface (für alle SVG-Icons)
export interface IconProps {
  size?: number;
  animated?: boolean;
  glowing?: boolean;
  className?: string;
}
