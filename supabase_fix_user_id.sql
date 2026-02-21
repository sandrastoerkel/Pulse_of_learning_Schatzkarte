-- ============================================================
-- Fix: user_id Spalten von BIGINT auf TEXT ändern
-- ============================================================
-- Die vorexistierenden Tabellen (polarstern_goals,
-- completed_challenges, user_badges, activity_log) haben
-- user_id als BIGINT, aber der Code sendet TEXT (MD5-Hash).
-- ============================================================

-- 1. polarstern_goals
ALTER TABLE polarstern_goals ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 2. completed_challenges
ALTER TABLE completed_challenges ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. user_badges
ALTER TABLE user_badges ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 4. activity_log
ALTER TABLE activity_log ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
