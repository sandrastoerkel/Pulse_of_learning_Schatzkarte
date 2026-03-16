-- Migration: Wortschmiede SM-2 Tabellen
-- Datum: 2026-03-16

-- SM-2 Wort-Statistiken pro Schueler
CREATE TABLE IF NOT EXISTS wortschmiede_word_stats (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  word        TEXT NOT NULL,
  interval    INTEGER NOT NULL DEFAULT 0,
  repetition  INTEGER NOT NULL DEFAULT 0,
  efactor     DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  due_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_wrong   INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, word)
);

-- Spielfortschritt pro Schueler (defeated_ids, xp, difficulty, auto_level)
CREATE TABLE IF NOT EXISTS wortschmiede_progress (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL UNIQUE,
  defeated_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp          INTEGER NOT NULL DEFAULT 0,
  difficulty  TEXT NOT NULL DEFAULT 'mittel',
  auto_level  TEXT NOT NULL DEFAULT 'mittel',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_wortschmiede_word_stats_user
  ON wortschmiede_word_stats (user_id);

CREATE INDEX IF NOT EXISTS idx_wortschmiede_progress_user
  ON wortschmiede_progress (user_id);

-- RLS aktivieren
ALTER TABLE wortschmiede_word_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE wortschmiede_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: anon darf alles (App-seitige Filterung via user_id)
-- Gleiches Pattern wie group_messages
CREATE POLICY "wortschmiede_word_stats_all" ON wortschmiede_word_stats
  FOR ALL TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "wortschmiede_progress_all" ON wortschmiede_progress
  FOR ALL TO anon
  USING (true) WITH CHECK (true);
