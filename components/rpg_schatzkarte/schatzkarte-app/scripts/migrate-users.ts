// scripts/migrate-users.ts
//
// Migriert bestehende User aus der alten users-Tabelle
// nach Supabase Auth + profiles-Tabelle.
//
// Ausführen:
//   npx tsx scripts/migrate-users.ts
//
// Voraussetzungen:
//   1. Migration 001 + 002 im SQL Editor ausgeführt
//   2. .env mit SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY
//   3. Im Supabase Dashboard: Auth → Settings → "Confirm email" AUS
//
// Was passiert:
//   - Für jeden bestehenden User wird ein Supabase Auth Account erstellt
//     mit pseudo-email (benutzername@schatzkarte.app)
//   - Ein temporäres Passwort wird generiert
//   - Die profiles-Tabelle wird mit legacy_user_id befüllt
//   - Eine CSV-Datei mit Benutzername + Temp-Passwort wird erstellt
//     (für den Coach zum Verteilen)
//
// WICHTIG: Dieses Script nur EINMAL ausführen!
//          Es ist idempotent (überspringt existierende User).

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';

// ─── Konfiguration ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Fehler: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY als Umgebungsvariablen setzen.');
  console.error('   Beispiel: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... npx tsx scripts/migrate-users.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DOMAIN = 'schatzkarte.app';

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function generateTempPassword(): string {
  // 8 Zeichen, lesbar (keine verwechselbaren Zeichen)
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(8);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
}

function usernameToEmail(name: string): string {
  // Gleiche Logik wie im Frontend
  const clean = name.trim().toLowerCase()
    .replace(/\s+/g, '_')          // Leerzeichen → Unterstrich
    .replace(/[^a-z0-9._-]/g, ''); // Nur sichere Zeichen
  return `${clean}@${DOMAIN}`;
}

// ─── Hauptlogik ─────────────────────────────────────────────────────────────

interface OldUser {
  user_id: string;
  name: string;
  display_name: string;
  age_group: string | null;
  role: string | null;
  avatar_settings: Record<string, unknown> | null;
  xp_total: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
}

interface MigrationResult {
  username: string;
  display_name: string;
  temp_password: string;
  status: 'created' | 'skipped' | 'error';
  error?: string;
}

async function migrateUsers() {
  console.log('🚀 Starte User-Migration...\n');

  // 1. Alle bestehenden User laden
  const { data: oldUsers, error: fetchError } = await supabase
    .from('users')
    .select('user_id, name, display_name, age_group, role, avatar_settings, xp_total, level, current_streak, longest_streak, last_activity_date, created_at')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('❌ Fehler beim Laden der User:', fetchError.message);
    process.exit(1);
  }

  if (!oldUsers || oldUsers.length === 0) {
    console.log('ℹ️  Keine User zum Migrieren gefunden.');
    process.exit(0);
  }

  console.log(`📋 ${oldUsers.length} User gefunden.\n`);

  const results: MigrationResult[] = [];

  for (const oldUser of oldUsers as OldUser[]) {
    const email = usernameToEmail(oldUser.name || oldUser.display_name);
    const tempPassword = generateTempPassword();
    const role = oldUser.role || 'student';
    const displayName = oldUser.display_name || oldUser.name;
    const username = email.split('@')[0];

    try {
      // 2. Supabase Auth User erstellen
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Direkt bestätigt (Pseudo-Email)
        app_metadata: { role },
        user_metadata: {
          display_name: displayName,
          age_group: oldUser.age_group || 'grundschule',
          must_change_password: true,
        },
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`⏭️  ${displayName} (${email}) — übersprungen (existiert bereits)`);
          results.push({
            username,
            display_name: displayName,
            temp_password: '-',
            status: 'skipped',
          });
          continue;
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Auth User erstellt, aber kein User-Objekt zurückgegeben');
      }

      // 3. profiles-Eintrag erstellen (mit legacy_user_id!)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        legacy_user_id: oldUser.user_id,
        display_name: displayName,
        username,
        age_group: oldUser.age_group || 'grundschule',
        role,
        avatar_settings: oldUser.avatar_settings || {},
        xp_total: oldUser.xp_total || 0,
        level: oldUser.level || 1,
        current_streak: oldUser.current_streak || 0,
        longest_streak: oldUser.longest_streak || 0,
        last_activity_date: oldUser.last_activity_date,
      });

      if (profileError) {
        console.error(`⚠️  ${displayName}: Auth OK, aber Profil-Fehler: ${profileError.message}`);
        results.push({
          username,
          display_name: displayName,
          temp_password: tempPassword,
          status: 'error',
          error: `Profil: ${profileError.message}`,
        });
        continue;
      }

      console.log(`✅ ${displayName} (${email}) → migriert [${role}]`);
      results.push({
        username,
        display_name: displayName,
        temp_password: tempPassword,
        status: 'created',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ ${displayName}: ${message}`);
      results.push({
        username,
        display_name: displayName,
        temp_password: tempPassword,
        status: 'error',
        error: message,
      });
    }
  }

  // 4. Zusammenfassung
  const created = results.filter((r) => r.status === 'created');
  const skipped = results.filter((r) => r.status === 'skipped');
  const errors = results.filter((r) => r.status === 'error');

  console.log('\n────────────────────────────────────────');
  console.log(`✅ Erstellt:    ${created.length}`);
  console.log(`⏭️  Übersprungen: ${skipped.length}`);
  console.log(`❌ Fehler:      ${errors.length}`);
  console.log(`📊 Gesamt:      ${results.length}`);

  // 5. CSV für den Coach erstellen
  if (created.length > 0) {
    const csvHeader = 'Benutzername,Anzeigename,Temporäres Passwort\n';
    const csvRows = created
      .map((r) => `${r.username},${r.display_name},${r.temp_password}`)
      .join('\n');

    const filename = `migration_passwords_${new Date().toISOString().slice(0, 10)}.csv`;
    writeFileSync(filename, csvHeader + csvRows, 'utf-8');
    console.log(`\n📄 Temporäre Passwörter gespeichert: ${filename}`);
    console.log('   ⚠️  Diese Datei dem Coach geben und danach LÖSCHEN!');
  }

  if (errors.length > 0) {
    console.log('\n⚠️  Fehlerhafte User:');
    errors.forEach((r) => console.log(`   - ${r.display_name}: ${r.error}`));
  }
}

migrateUsers().catch(console.error);
