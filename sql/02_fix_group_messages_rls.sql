-- ============================================
-- FIX: group_messages RLS-Policies
-- ============================================
-- Problem: INSERT/UPDATE waren nur fuer service_role erlaubt,
-- aber die App nutzt den anon key. Dadurch konnten keine
-- Nachrichten gesendet oder geloescht werden.
--
-- Ausfuehren im Supabase SQL Editor (Dashboard > SQL Editor)

-- Alte Policies entfernen
DROP POLICY IF EXISTS "Service kann Nachrichten erstellen" ON group_messages;
DROP POLICY IF EXISTS "Service kann Nachrichten updaten" ON group_messages;

-- INSERT: anon darf Nachrichten erstellen
CREATE POLICY "Anon kann Nachrichten erstellen"
    ON group_messages FOR INSERT
    TO anon
    WITH CHECK (true);

-- UPDATE: anon darf Nachrichten updaten (Soft-Delete durch Coach)
CREATE POLICY "Anon kann Nachrichten updaten"
    ON group_messages FOR UPDATE
    TO anon
    USING (true);

-- Bestehende SELECT-Policy bleibt (bereits fuer anon erlaubt)
-- "Anon kann Nachrichten lesen" -> USING (true)

-- ============================================
-- Teste mit:
-- INSERT INTO group_messages (group_id, sender_id, sender_name, message_text)
-- VALUES ('f2efd07c7445', 'f40a37048732da05', 'Sandra', 'Test!');
-- ============================================
