-- ============================================
-- Password-Reset: Neue Spalten in users
-- ============================================
-- Ausfuehren im Supabase SQL Editor
-- Ermoeglicht Coaches, temporaere Passwoerter fuer Schueler zu generieren

-- must_change_password: Erzwingt Passwortwechsel beim naechsten Login
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'must_change_password'
    ) THEN
        ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- temp_password_created_at: Zeitpunkt der Temp-Passwort-Erstellung (fuer 48h-Ablauf)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'temp_password_created_at'
    ) THEN
        ALTER TABLE users ADD COLUMN temp_password_created_at TIMESTAMPTZ NULL;
    END IF;
END $$;

-- password_reset_by: User-ID des Coaches der das Passwort zurueckgesetzt hat
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password_reset_by'
    ) THEN
        ALTER TABLE users ADD COLUMN password_reset_by TEXT NULL;
    END IF;
END $$;

-- temp_password_plain: Klartext-Temp-Passwort, sichtbar fuer Coach bis Schueler es aendert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'temp_password_plain'
    ) THEN
        ALTER TABLE users ADD COLUMN temp_password_plain TEXT NULL;
    END IF;
END $$;

-- ============================================
-- Fertig! Teste mit:
-- SELECT user_id, must_change_password, temp_password_created_at, password_reset_by, temp_password_plain
-- FROM users LIMIT 5;
-- ============================================
