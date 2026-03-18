-- Migration: Wortschmiede Streak, Level-Up-Daten und Sterne
-- Datum: 2026-03-18
-- Bug-Fix: Diese Felder wurden nur in localStorage gespeichert und gingen
-- bei Cache-Leerung oder Geraetewechsel verloren.

-- Streak-Tracking
ALTER TABLE wortschmiede_progress
  ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE wortschmiede_progress
  ADD COLUMN IF NOT EXISTS last_played_date DATE;

-- Level-Up-System: Datum des ersten Siegs pro Monster
ALTER TABLE wortschmiede_progress
  ADD COLUMN IF NOT EXISTS first_defeated_dates JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Sterne: Level-Up-Test bestanden pro Monster
ALTER TABLE wortschmiede_progress
  ADD COLUMN IF NOT EXISTS monster_stars JSONB NOT NULL DEFAULT '{}'::jsonb;
