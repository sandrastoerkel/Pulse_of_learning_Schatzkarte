// src/types/database.ts
// Generiert aus dem tatsächlichen Supabase-Schema (information_schema.columns)
// NICHT erfunden — jede Spalte kommt aus der CSV-Analyse.

// ─── island_progress ────────────────────────────────────────────────────────
// Composite PK: (user_id, island_id) — kein id-Feld
export interface IslandProgress {
  user_id: string;
  island_id: string;
  video_watched: boolean;
  video_watched_at: string | null;
  explanation_read: boolean;
  explanation_read_at: string | null;
  quiz_passed: boolean;
  quiz_passed_at: string | null;
  quiz_score: number | null;
  challenge_completed: boolean;
  challenge_completed_at: string | null;
  updated_at: string;
}

// Für complete_island_action mutation
export type IslandAction = 'video_watched' | 'explanation_read' | 'quiz_passed' | 'challenge_completed';

// ─── user_treasures ─────────────────────────────────────────────────────────
// Composite PK: (user_id, island_id, treasure_id)
export interface UserTreasure {
  user_id: string;
  island_id: string;
  treasure_id: string;
  collected_at: string;
  xp_earned: number;
}

// ─── challenges ─────────────────────────────────────────────────────────────
export interface Challenge {
  id: number;
  user_id: string;
  created_at: string;
  challenge_date: string;        // DATE
  subject: string;
  task_description: string | null;
  prediction: number;
  actual_result: number | null;
  outcome: string | null;
  xp_earned: number;
  reflection: string | null;
  completed: boolean;
}

export interface ChallengeInsert {
  user_id: string;
  challenge_date: string;
  subject: string;
  task_description?: string;
  prediction: number;
}

export interface ChallengeUpdate {
  actual_result?: number;
  outcome?: string;
  reflection?: string;
  completed?: boolean;
  xp_earned?: number;
}

// ─── polarstern_goals ───────────────────────────────────────────────────────
export interface PolarsternGoal {
  id: number;
  user_id: string | null;
  goal_type: string | null;
  goal_title: string;
  current_state: string;
  strategy: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_achieved: boolean;
  achieved_at: string | null;
  week_created: number | null;
  xp_earned: number;
  category: string;
  achievement_reflection: string | null;
}

export interface PolarsternGoalInsert {
  user_id: string;
  goal_type?: string;
  goal_title: string;
  current_state: string;
  strategy: string;
  subject?: string;
  category?: string;
  week_created?: number;
}

// ─── bandura_entries ────────────────────────────────────────────────────────
export interface BanduraEntry {
  id: number;
  user_id: string;
  created_at: string;
  entry_date: string;             // DATE
  source_type: string;
  description: string;
  xp_earned: number;
}

export interface BanduraEntryInsert {
  user_id: string;
  entry_date: string;
  source_type: string;
  description: string;
  xp_earned?: number;
}

// ─── arena_progress ─────────────────────────────────────────────────────────
export interface ArenaProgress {
  id: string;                      // UUID
  user_id: string;
  player_name: string;
  avatar: Record<string, string>;
  coins: number;
  total_correct: number;
  arena_xp: number;
  arena_level: number;
  studio_speed: number | null;
  studio_speeds: unknown[];
  question_type: string;
  heatmap: Record<string, unknown>;
  scores: unknown[];
  owned_items: string[];
  created_at: string;
  updated_at: string;
}

// ─── user_avatars ───────────────────────────────────────────────────────────
export interface UserAvatar {
  id: string;                      // UUID
  user_id: string;
  hero_name: string;
  visuals: Record<string, unknown>;
  equipped: {
    hat: string | null;
    cape: string | null;
    frame: string | null;
    effect: string | null;
    glasses: string | null;
    accessory: string | null;
  };
  owned_items: string[];
  created_at: string;
  updated_at: string;
}

// ─── user_badges ────────────────────────────────────────────────────────────
export interface UserBadge {
  id: number;
  user_id: string | null;
  badge_type: string | null;
  badge_name: string | null;
  badge_description: string | null;
  earned_at: string;
}

// ─── activity_log ───────────────────────────────────────────────────────────
export interface ActivityLogEntry {
  id: number;
  user_id: string | null;
  activity_type: string | null;
  activity_details: string | null;
  xp_earned: number;
  created_at: string;
}

export interface ActivityLogInsert {
  user_id: string;
  activity_type: string;
  activity_details?: string;
  xp_earned?: number;
}

// ─── learnstrat_progress ────────────────────────────────────────────────────
export interface LearnstratProgress {
  id: number;
  user_id: string;
  challenge_id: string;
  technique_id: string | null;
  completed: boolean;
  rating: number | null;
  reflection: string | null;
  application: string | null;
  xp_earned: number;
  completed_at: string | null;
}
