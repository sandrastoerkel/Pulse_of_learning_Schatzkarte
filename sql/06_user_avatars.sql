-- ============================================
-- User Avatars - Avatar-Daten pro User
-- ============================================
-- Speichert Avatar-Aussehen, Name, Shop-Items
-- und Equipped-Slots in Supabase statt nur localStorage.
-- Ermoeglicht geraeteuebergreifendes Arbeiten.
--
-- Ausfuehren im Supabase SQL Editor (Dashboard > SQL Editor)

-- Tabelle
CREATE TABLE IF NOT EXISTS user_avatars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    hero_name TEXT NOT NULL DEFAULT '',
    visuals JSONB NOT NULL DEFAULT '{}',
    equipped JSONB NOT NULL DEFAULT '{"hat":null,"glasses":null,"accessory":null,"cape":null,"effect":null,"frame":null}',
    owned_items TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS aktivieren
ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;

-- SELECT: anon darf lesen
CREATE POLICY "Anon kann Avatar lesen"
    ON user_avatars FOR SELECT
    TO anon
    USING (true);

-- INSERT: anon darf erstellen
CREATE POLICY "Anon kann Avatar erstellen"
    ON user_avatars FOR INSERT
    TO anon
    WITH CHECK (true);

-- UPDATE: anon darf updaten
CREATE POLICY "Anon kann Avatar updaten"
    ON user_avatars FOR UPDATE
    TO anon
    USING (true);

-- Index auf user_id (schnelle Einzelabfrage)
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id
    ON user_avatars(user_id);

-- Trigger: updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_user_avatars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_avatars_updated_at
    BEFORE UPDATE ON user_avatars
    FOR EACH ROW
    EXECUTE FUNCTION update_user_avatars_updated_at();

-- ============================================
-- Teste mit:
-- INSERT INTO user_avatars (user_id, hero_name, visuals)
-- VALUES ('test_user', 'TestHeld', '{"topType":"ShortHairShortFlat"}')
-- ON CONFLICT (user_id) DO UPDATE SET hero_name = EXCLUDED.hero_name, visuals = EXCLUDED.visuals;
-- SELECT * FROM user_avatars WHERE user_id = 'test_user';
-- ============================================
