-- ============================================
-- FIX: DELETE-Policy fuer group_messages
-- ============================================
-- Problem: delete_user() konnte Nachrichten nicht loeschen,
-- weil keine DELETE RLS-Policy fuer anon existierte.
-- Dadurch blieben FK-Referenzen bestehen und der User
-- konnte nicht geloescht werden.
--
-- Ausfuehren im Supabase SQL Editor (Dashboard > SQL Editor)

-- DELETE: anon darf Nachrichten loeschen (fuer User-Loeschung + Admin)
CREATE POLICY "Anon kann Nachrichten loeschen"
    ON group_messages FOR DELETE
    TO anon
    USING (true);

-- ============================================
-- Fertig! Danach kann delete_user() funktionieren.
-- ============================================
