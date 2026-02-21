-- ============================================================
-- Supabase Migration: Alle fehlenden Tabellen
-- Bereits vorhanden: users, polarstern_goals,
--   completed_challenges, user_badges, activity_log
-- ============================================================

-- ============================================================
-- USERS: user_id Spalte + fehlende Spalten hinzufügen
-- user_id ist ein 16-Zeichen MD5-Hash (TEXT), wird im Code
-- als Primary Key verwendet. In Supabase bleibt id (BIGINT)
-- als PK, user_id wird als UNIQUE TEXT-Spalte hinzugefügt.
-- Alle anderen Tabellen referenzieren users(user_id).
-- ============================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_id') THEN
        ALTER TABLE users ADD COLUMN user_id TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username TEXT DEFAULT 'Lernender';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'display_name') THEN
        ALTER TABLE users ADD COLUMN display_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'xp_total') THEN
        ALTER TABLE users ADD COLUMN xp_total INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_streak') THEN
        ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'longest_streak') THEN
        ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_activity_date') THEN
        ALTER TABLE users ADD COLUMN last_activity_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'settings') THEN
        ALTER TABLE users ADD COLUMN settings TEXT DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'age_group') THEN
        ALTER TABLE users ADD COLUMN age_group TEXT DEFAULT 'unterstufe';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_settings') THEN
        ALTER TABLE users ADD COLUMN avatar_settings TEXT DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================================
-- GAMIFICATION: challenges
-- ============================================================
CREATE TABLE IF NOT EXISTS challenges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    challenge_date DATE NOT NULL,
    subject TEXT NOT NULL,
    task_description TEXT,
    prediction INTEGER NOT NULL,
    actual_result INTEGER,
    outcome TEXT,
    xp_earned INTEGER DEFAULT 0,
    reflection TEXT,
    completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_date ON challenges(challenge_date);

-- ============================================================
-- BANDURA: bandura_entries
-- ============================================================
CREATE TABLE IF NOT EXISTS bandura_entries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    entry_date DATE NOT NULL,
    source_type TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bandura_user_date ON bandura_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_bandura_source ON bandura_entries(source_type);

-- ============================================================
-- LERNGRUPPEN: learning_groups
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_groups (
    group_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    coach_id TEXT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    start_date DATE,
    current_week INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    settings TEXT DEFAULT '{}'
);

-- ============================================================
-- LERNGRUPPEN: group_members
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES learning_groups(group_id),
    user_id TEXT NOT NULL UNIQUE REFERENCES users(user_id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON group_members(user_id);

-- ============================================================
-- LERNGRUPPEN: group_invitations
-- ============================================================
CREATE TABLE IF NOT EXISTS group_invitations (
    token TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES learning_groups(group_id),
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    used_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_invitations_group ON group_invitations(group_id);

-- ============================================================
-- LERNGRUPPEN: group_weekly_islands
-- ============================================================
CREATE TABLE IF NOT EXISTS group_weekly_islands (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES learning_groups(group_id),
    week_number INTEGER NOT NULL,
    island_id TEXT NOT NULL,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    coach_notes TEXT,
    UNIQUE(group_id, week_number),
    UNIQUE(group_id, island_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_islands_group ON group_weekly_islands(group_id);

-- ============================================================
-- LERNGRUPPEN: scheduled_meetings
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_meetings (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES learning_groups(group_id),
    title TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    recurrence_type TEXT DEFAULT 'weekly',
    day_of_week INTEGER,
    time_of_day TEXT,
    duration_minutes INTEGER DEFAULT 45,
    status TEXT DEFAULT 'scheduled',
    jitsi_room_name TEXT UNIQUE,
    created_by TEXT NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meetings_group ON scheduled_meetings(group_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON scheduled_meetings(status);

-- ============================================================
-- LERNGRUPPEN: meeting_participants
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting_participants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    meeting_id TEXT NOT NULL REFERENCES scheduled_meetings(id),
    user_id TEXT NOT NULL REFERENCES users(user_id),
    display_name TEXT,
    role TEXT DEFAULT 'kind',
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_participants_meeting ON meeting_participants(meeting_id);

-- ============================================================
-- SCHATZKARTE: user_treasures
-- ============================================================
CREATE TABLE IF NOT EXISTS user_treasures (
    user_id TEXT NOT NULL,
    island_id TEXT NOT NULL,
    treasure_id TEXT NOT NULL,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    xp_earned INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, island_id, treasure_id)
);

-- ============================================================
-- SCHATZKARTE: island_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS island_progress (
    user_id TEXT NOT NULL,
    island_id TEXT NOT NULL,
    video_watched BOOLEAN DEFAULT FALSE,
    video_watched_at TIMESTAMPTZ,
    explanation_read BOOLEAN DEFAULT FALSE,
    explanation_read_at TIMESTAMPTZ,
    quiz_passed BOOLEAN DEFAULT FALSE,
    quiz_passed_at TIMESTAMPTZ,
    quiz_score INTEGER,
    challenge_completed BOOLEAN DEFAULT FALSE,
    challenge_completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, island_id)
);

-- ============================================================
-- COACHING: students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_code TEXT UNIQUE NOT NULL,
    class TEXT,
    school_year TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    is_active INTEGER DEFAULT 1
);

-- ============================================================
-- COACHING: assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS assessments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    request_id BIGINT,
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    results TEXT NOT NULL,
    quadrant TEXT,
    risk_level TEXT,
    performance_estimate REAL,
    notes TEXT
);

-- ============================================================
-- COACHING: development_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS development_plans (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    interventions TEXT NOT NULL,
    goals TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    notes TEXT
);

-- ============================================================
-- COACHING: progress_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS progress_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES development_plans(id) ON DELETE SET NULL,
    log_date TIMESTAMPTZ DEFAULT NOW(),
    activity_type TEXT NOT NULL,
    content TEXT NOT NULL,
    outcome TEXT,
    reflection TEXT,
    created_by TEXT
);

-- ============================================================
-- COACHING: assessment_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    selected_scales TEXT NOT NULL,
    assessment_type TEXT,
    survey_url TEXT,
    status TEXT DEFAULT 'pending',
    completed_date TIMESTAMPTZ
);

-- ============================================================
-- LERNSTRATEGIEN: user_learning_preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS user_learning_preferences (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    technique_1 TEXT,
    technique_2 TEXT,
    technique_3 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LERNSTRATEGIEN: learnstrat_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS learnstrat_progress (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    challenge_id TEXT NOT NULL,
    technique_id TEXT,
    completed BOOLEAN DEFAULT FALSE,
    rating INTEGER,
    reflection TEXT,
    application TEXT,
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_learnstrat_user ON learnstrat_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learnstrat_challenge ON learnstrat_progress(challenge_id);

-- ============================================================
-- MOTIVATION: motivation_challenges
-- ============================================================
CREATE TABLE IF NOT EXISTS motivation_challenges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    challenge_id TEXT NOT NULL,
    age_group TEXT NOT NULL,
    grundbeduerfnis TEXT NOT NULL,
    phase TEXT DEFAULT 'intro',
    user_input TEXT,
    reflection TEXT,
    rating INTEGER,
    xp_earned INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mot_challenges_user ON motivation_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_mot_challenges_id ON motivation_challenges(challenge_id);

-- ============================================================
-- MOTIVATION: motivation_sdt_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS motivation_sdt_progress (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(user_id),
    autonomie_level INTEGER DEFAULT 0,
    autonomie_xp INTEGER DEFAULT 0,
    kompetenz_level INTEGER DEFAULT 0,
    kompetenz_xp INTEGER DEFAULT 0,
    verbundenheit_level INTEGER DEFAULT 0,
    verbundenheit_xp INTEGER DEFAULT 0,
    total_challenges INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MOTIVATION: motivation_streaks
-- ============================================================
CREATE TABLE IF NOT EXISTS motivation_streaks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(user_id),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    freeze_available INTEGER DEFAULT 1,
    freeze_used_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MOTIVATION: motivation_activity_log
-- ============================================================
CREATE TABLE IF NOT EXISTS motivation_activity_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    activity_date DATE NOT NULL,
    challenge_id TEXT NOT NULL,
    grundbeduerfnis TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mot_activity_user ON motivation_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mot_activity_date ON motivation_activity_log(activity_date);

-- ============================================================
-- MOTIVATION: motivation_badges
-- ============================================================
CREATE TABLE IF NOT EXISTS motivation_badges (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_mot_badges_user ON motivation_badges(user_id);

-- ============================================================
-- MOTIVATION: motivation_certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS motivation_certificates (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id),
    certificate_type TEXT NOT NULL,
    age_group TEXT NOT NULL,
    challenges_completed TEXT,
    total_xp INTEGER DEFAULT 0,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY: Enable + Allow-All Policy
-- ============================================================
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'challenges',
            'bandura_entries',
            'learning_groups',
            'group_members',
            'group_invitations',
            'group_weekly_islands',
            'scheduled_meetings',
            'meeting_participants',
            'user_treasures',
            'island_progress',
            'students',
            'assessments',
            'development_plans',
            'progress_logs',
            'assessment_requests',
            'user_learning_preferences',
            'learnstrat_progress',
            'motivation_challenges',
            'motivation_sdt_progress',
            'motivation_streaks',
            'motivation_activity_log',
            'motivation_badges',
            'motivation_certificates'
        ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for %1$s" ON %1$I', tbl);
        EXECUTE format(
            'CREATE POLICY "Allow all for %1$s" ON %1$I FOR ALL USING (true) WITH CHECK (true)',
            tbl
        );
    END LOOP;
END $$;
