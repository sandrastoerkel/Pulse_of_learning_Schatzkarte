-- delete_user_cascade — Postgres RPC Function
-- Atomic cascade deletion of a user and all related data
-- Migrated from: user_system.py delete_user()
-- 
-- Usage from React: supabase.rpc('delete_user_cascade', { target_user_id: '...' })
-- Security: Only callable by coaches and admins (checked via auth.jwt())

CREATE OR REPLACE FUNCTION delete_user_cascade(target_user_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- runs with table owner privileges, bypasses RLS
AS $$
DECLARE
  caller_role TEXT;
  deleted_count INT := 0;
  table_name TEXT;
  col_name TEXT;
BEGIN
  -- ─── Auth: only coaches and admins may delete users ───
  caller_role := (auth.jwt() -> 'app_metadata' ->> 'role');
  
  IF caller_role IS NULL OR caller_role NOT IN ('coach', 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Nur Coaches und Admins können User löschen'
    );
  END IF;

  -- ─── Prevent self-deletion ───
  IF target_user_id = (auth.jwt() ->> 'sub') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Du kannst dich nicht selbst löschen'
    );
  END IF;

  -- ─── 1. DELETE from all tables where user is referenced ───
  DELETE FROM group_members WHERE user_id = target_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  DELETE FROM group_messages WHERE sender_id = target_user_id;
  
  DELETE FROM meeting_participants WHERE user_id = target_user_id;
  
  DELETE FROM challenges WHERE user_id = target_user_id;
  
  DELETE FROM user_badges WHERE user_id = target_user_id;
  
  DELETE FROM polarstern_goals WHERE user_id = target_user_id;
  
  DELETE FROM island_progress WHERE user_id = target_user_id;
  
  DELETE FROM user_treasures WHERE user_id = target_user_id;
  
  DELETE FROM bandura_entries WHERE user_id = target_user_id;
  
  DELETE FROM activity_log WHERE user_id = target_user_id;
  
  DELETE FROM learnstrat_progress WHERE user_id = target_user_id;
  
  DELETE FROM arena_progress WHERE user_id = target_user_id;
  
  DELETE FROM wortschmiede_word_stats WHERE user_id = target_user_id;
  
  DELETE FROM wortschmiede_progress WHERE user_id = target_user_id;
  
  DELETE FROM user_avatars WHERE user_id = target_user_id;

  -- ─── 2. NULL FK columns (reference data stays intact) ───
  UPDATE group_messages SET recipient_id = NULL WHERE recipient_id = target_user_id;
  
  UPDATE group_messages SET deleted_by = NULL WHERE deleted_by = target_user_id;
  
  UPDATE group_invitations SET used_by = NULL WHERE used_by = target_user_id;

  -- ─── 3. DELETE the user record itself ───
  DELETE FROM users WHERE user_id = target_user_id;

  -- ─── 4. DELETE from profiles (Supabase Auth sync table) ───
  DELETE FROM profiles WHERE legacy_user_id = target_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User und alle Daten gelöscht',
    'deleted_user_id', target_user_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Fehler beim Löschen: ' || SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users (role check is inside the function)
GRANT EXECUTE ON FUNCTION delete_user_cascade(TEXT) TO authenticated;
