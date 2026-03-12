-- ============================================
-- Arena Progress - Einmaleins-Arena Fortschritt
-- ============================================
-- Speichert den Fortschritt der Schueler in der
-- Einmaleins-Arena (bisher nur localStorage).
-- Ermoeglicht Coaches den Fortschritt zu sehen.
--
-- Ausfuehren im Supabase SQL Editor (Dashboard > SQL Editor)

-- Tabelle
CREATE TABLE IF NOT EXISTS arena_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    player_name TEXT NOT NULL DEFAULT '',
    avatar JSONB NOT NULL DEFAULT '{"hair":"hair_basic","outfit":"outfit_basic","instrument":"inst_sword","accessory":"acc_none"}',
    coins INTEGER NOT NULL DEFAULT 0,
    total_correct INTEGER NOT NULL DEFAULT 0,
    arena_xp INTEGER NOT NULL DEFAULT 0,
    arena_level INTEGER NOT NULL DEFAULT 1,
    studio_speed DOUBLE PRECISION,
    studio_speeds JSONB NOT NULL DEFAULT '[]',
    question_type TEXT NOT NULL DEFAULT 'both',
    heatmap JSONB NOT NULL DEFAULT '{}',
    scores JSONB NOT NULL DEFAULT '[]',
    owned_items TEXT[] NOT NULL DEFAULT ARRAY['hair_basic','outfit_basic','inst_sword','acc_none'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS aktivieren
ALTER TABLE arena_progress ENABLE ROW LEVEL SECURITY;

-- SELECT: anon darf lesen
CREATE POLICY "Anon kann Arena-Fortschritt lesen"
    ON arena_progress FOR SELECT
    TO anon
    USING (true);

-- INSERT: anon darf erstellen
CREATE POLICY "Anon kann Arena-Fortschritt erstellen"
    ON arena_progress FOR INSERT
    TO anon
    WITH CHECK (true);

-- UPDATE: anon darf updaten
CREATE POLICY "Anon kann Arena-Fortschritt updaten"
    ON arena_progress FOR UPDATE
    TO anon
    USING (true);

-- Index auf user_id (schnelle Einzelabfrage)
CREATE INDEX IF NOT EXISTS idx_arena_progress_user_id
    ON arena_progress(user_id);

-- Index fuer Ranking (Coach-View: sortiert nach Level/XP)
CREATE INDEX IF NOT EXISTS idx_arena_progress_ranking
    ON arena_progress(arena_level DESC, arena_xp DESC);

-- Trigger: updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_arena_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_arena_progress_updated_at
    BEFORE UPDATE ON arena_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_arena_progress_updated_at();

-- ============================================
-- Teste mit:
-- INSERT INTO arena_progress (user_id, player_name, coins, arena_xp, arena_level)
-- VALUES ('test_user', 'TestHeld', 100, 500, 5);
-- SELECT * FROM arena_progress WHERE user_id = 'test_user';
-- ============================================
