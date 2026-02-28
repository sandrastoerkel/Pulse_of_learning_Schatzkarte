-- ============================================
-- Nachrichtenboard: group_messages Tabelle
-- ============================================
-- Ausfuehren im Supabase SQL Editor
-- Unterstuetzt Gruppen-Chat UND Direktnachrichten

-- Nachrichten-Tabelle
CREATE TABLE IF NOT EXISTS group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES learning_groups(group_id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(user_id),
    sender_name TEXT NOT NULL,
    recipient_id TEXT REFERENCES users(user_id),  -- NULL = Gruppen-Nachricht, gesetzt = DM
    message_text TEXT NOT NULL CHECK (char_length(message_text) <= 500),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'emoji')),
    is_deleted BOOLEAN DEFAULT FALSE,  -- Soft-Delete durch Coach
    deleted_by TEXT REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composite Index fuer schnelle Abfragen (Gruppen-Nachrichten chronologisch)
CREATE INDEX idx_group_messages_group_created
    ON group_messages(group_id, created_at DESC);

-- Index fuer Direktnachrichten
CREATE INDEX idx_group_messages_recipient
    ON group_messages(recipient_id, created_at DESC)
    WHERE recipient_id IS NOT NULL;

-- Index fuer Ungelesen-Zaehler
CREATE INDEX idx_group_messages_group_created_asc
    ON group_messages(group_id, created_at ASC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: anon darf lesen (Filterung ueber group_id passiert in der App)
CREATE POLICY "Anon kann Nachrichten lesen"
    ON group_messages FOR SELECT
    TO anon
    USING (true);

-- INSERT: nur service_role (Python-Backend)
CREATE POLICY "Service kann Nachrichten erstellen"
    ON group_messages FOR INSERT
    TO service_role
    WITH CHECK (true);

-- UPDATE: nur service_role (fuer Soft-Delete durch Coach)
CREATE POLICY "Service kann Nachrichten updaten"
    ON group_messages FOR UPDATE
    TO service_role
    USING (true);

-- ============================================
-- Realtime aktivieren
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;

-- ============================================
-- last_seen_at in group_members (fuer Ungelesen-Badge)
-- ============================================

-- Neue Spalte falls nicht vorhanden
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'group_members' AND column_name = 'last_seen_chat'
    ) THEN
        ALTER TABLE group_members ADD COLUMN last_seen_chat TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================
-- Fertig! Teste mit:
-- SELECT * FROM group_messages LIMIT 5;
-- ============================================
