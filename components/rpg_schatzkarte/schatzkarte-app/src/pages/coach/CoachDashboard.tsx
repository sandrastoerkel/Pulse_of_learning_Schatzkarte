// ============================================
// Coach Dashboard — MVP
// Gruppen-Verwaltung, Einladungen, Schüler anlegen
// Migrated from: pages/7_👥_Lerngruppen.py
// ============================================

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLearningGroups, useGroupMembers } from '@/hooks';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GroupMemberDisplay {
  user_id: string;
  display_name: string;
  joined_at: string | null;
  status: string | null;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

const T = {
  bg: '#0a1628',
  card: '#12203a',
  cardHover: '#1a2e52',
  border: '#1e3a52',
  gold: '#c8a84e',
  goldLight: '#ffe44d',
  text: '#e2e8f0',
  textMuted: '#8899aa',
  success: '#4ade80',
  danger: '#ef4444',
  info: '#4fc3f7',
  purple: '#a78bfa',
  purpleGrad: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${T.bg} 0%, #1a2744 50%, #0d1f3c 100%)`,
    fontFamily: "'Nunito', sans-serif",
    color: T.text,
    padding: '20px',
  } as React.CSSProperties,
  header: {
    background: T.purpleGrad,
    color: 'white',
    padding: '16px 24px',
    borderRadius: 12,
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  tab: (active: boolean) => ({
    padding: '10px 20px',
    borderRadius: 10,
    border: `2px solid ${active ? T.gold : T.border}`,
    background: active ? `${T.gold}22` : T.card,
    color: active ? T.gold : T.textMuted,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 14,
    fontFamily: "'Nunito', sans-serif",
    transition: 'all 0.2s',
  }) as React.CSSProperties,
  card: {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: '20px',
    marginBottom: 16,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: `2px solid ${T.border}`,
    background: '#0d1a2e',
    color: T.text,
    fontSize: 15,
    fontFamily: "'Nunito', sans-serif",
    outline: 'none',
    marginBottom: 12,
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: `2px solid ${T.border}`,
    background: '#0d1a2e',
    color: T.text,
    fontSize: 15,
    fontFamily: "'Nunito', sans-serif",
    outline: 'none',
    marginBottom: 12,
  } as React.CSSProperties,
  btn: (color: string = T.gold) => ({
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    background: color,
    color: '#07091a',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    transition: 'transform 0.15s',
  }) as React.CSSProperties,
  btnOutline: {
    padding: '10px 20px',
    borderRadius: 10,
    border: `2px solid ${T.border}`,
    background: 'transparent',
    color: T.textMuted,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
  } as React.CSSProperties,
  badge: (color: string) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 6,
    background: `${color}22`,
    color: color,
    fontSize: 12,
    fontWeight: 700,
  }) as React.CSSProperties,
  msg: (type: 'success' | 'error' | 'info') => ({
    padding: '12px 16px',
    borderRadius: 10,
    marginBottom: 12,
    background: type === 'success' ? '#052e16' : type === 'error' ? '#2e0516' : '#0c1a3a',
    border: `1px solid ${type === 'success' ? T.success + '44' : type === 'error' ? T.danger + '44' : T.info + '44'}`,
    color: type === 'success' ? T.success : type === 'error' ? T.danger : T.info,
    fontSize: 14,
  }) as React.CSSProperties,
};

// ─── Tab: Meine Gruppen ──────────────────────────────────────────────────────

function MyGroupsTab({ coachId }: { coachId: string }) {
  const { data: groups = [], isLoading } = useLearningGroups();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <div style={{ color: T.textMuted, padding: 20 }}>Lade Gruppen...</div>;
  if (groups.length === 0) {
    return (
      <div style={styles.card}>
        <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>📭</div>
        <p style={{ textAlign: 'center', color: T.textMuted }}>
          Du hast noch keine Lerngruppen. Erstelle deine erste Gruppe im Tab "Neue Gruppe".
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ color: T.gold, marginBottom: 16 }}>📚 {groups.length} Lerngruppe(n)</h3>
      {groups.map(g => (
        <GroupCard
          key={g.group_id}
          group={g}
          expanded={expandedId === g.group_id}
          onToggle={() => setExpandedId(expandedId === g.group_id ? null : g.group_id)}
        />
      ))}
    </div>
  );
}

function GroupCard({ group, expanded, onToggle }: {
  group: { group_id: string; name: string; created_at: string | null; is_active: number | null; current_week: number | null };
  expanded: boolean;
  onToggle: () => void;
}) {
  const { data: members = [] } = useGroupMembers(expanded ? group.group_id : null);

  return (
    <div style={styles.card}>
      <div
        onClick={onToggle}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{group.name}</span>
          <span style={{ ...styles.badge(T.info), marginLeft: 12 }}>
            Woche {group.current_week ?? 0}
          </span>
          {group.is_active === 1 && (
            <span style={{ ...styles.badge(T.success), marginLeft: 8 }}>Aktiv</span>
          )}
        </div>
        <span style={{ fontSize: 20, color: T.textMuted }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <h4 style={{ color: T.textMuted, marginBottom: 12 }}>👥 Mitglieder ({members.length})</h4>
          {members.length === 0 ? (
            <p style={{ color: T.textMuted, fontSize: 14 }}>Noch keine Mitglieder. Erstelle eine Einladung!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map(m => (
                <div key={m.user_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: '#0d1a2e', borderRadius: 8,
                }}>
                  <span style={{ fontSize: 14 }}>{m.user_id}</span>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>
                    {m.joined_at ? new Date(m.joined_at).toLocaleDateString('de-DE') : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <InviteSection groupId={group.group_id} groupName={group.name} />
        </div>
      )}
    </div>
  );
}

// ─── Inline: Einladung erstellen ─────────────────────────────────────────────

function InviteSection({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const createInvite = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const token = crypto.randomUUID().replace(/-/g, '').slice(0, 22);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('group_invitations')
        .insert({
          token,
          group_id: groupId,
          email: email || null,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      const appUrl = window.location.origin;
      const url = `${appUrl}/einladung?token=${token}`;
      setInviteUrl(url);
      setMsg({ type: 'success', text: 'Einladungslink erstellt!' });

      // Send email if provided
      if (email) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'invitation',
            to_email: email,
            group_name: groupName,
            invite_url: url,
          },
        });
        setMsg({ type: 'success', text: `Einladung erstellt und Email an ${email} gesendet!` });
      }
    } catch (e) {
      setMsg({ type: 'error', text: `Fehler: ${e}` });
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setMsg({ type: 'success', text: 'Link kopiert!' });
    }
  };

  return (
    <div style={{ marginTop: 16, padding: '16px', background: '#0d1a2e', borderRadius: 10 }}>
      <h4 style={{ color: T.purple, marginBottom: 12, fontSize: 14 }}>📨 Einladungslink erstellen</h4>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email (optional — Link funktioniert auch ohne)"
        style={styles.input}
      />
      <button onClick={createInvite} disabled={loading} style={styles.btn(T.purple)}>
        {loading ? 'Erstelle...' : '🔗 Einladungslink erstellen'}
      </button>

      {msg && <div style={{ ...styles.msg(msg.type), marginTop: 12 }}>{msg.text}</div>}

      {inviteUrl && (
        <div style={{ marginTop: 12, padding: '12px', background: '#07091a', borderRadius: 8, wordBreak: 'break-all' }}>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Einladungslink (7 Tage gültig):</div>
          <div style={{ fontSize: 13, color: T.info, marginBottom: 8 }}>{inviteUrl}</div>
          <button onClick={copyToClipboard} style={styles.btnOutline}>📋 Kopieren</button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Neue Gruppe ────────────────────────────────────────────────────────

function CreateGroupTab({ coachId }: { coachId: string }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setMsg({ type: 'error', text: 'Bitte gib einen Gruppennamen ein.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const groupId = crypto.randomUUID();
      const { error } = await supabase
        .from('learning_groups')
        .insert({
          group_id: groupId,
          name: name.trim(),
          coach_id: coachId,
          start_date: startDate || null,
          current_week: 0,
          is_active: 1,
        });

      if (error) throw error;
      setMsg({ type: 'success', text: `Gruppe "${name}" erstellt! Wechsle zu "Meine Gruppen" um Einladungen zu erstellen.` });
      setName('');
      setStartDate('');
    } catch (e) {
      setMsg({ type: 'error', text: `Fehler: ${e}` });
    }
    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <h3 style={{ color: T.gold, marginBottom: 16 }}>➕ Neue Lerngruppe erstellen</h3>

      <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>
        Gruppenname *
      </label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="z.B. Lerngruppe Montag 16:00"
        style={styles.input}
      />

      <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'block' }}>
        Startdatum (optional)
      </label>
      <input
        type="date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
        style={styles.input}
      />

      {msg && <div style={styles.msg(msg.type)}>{msg.text}</div>}

      <button onClick={handleCreate} disabled={loading} style={styles.btn()}>
        {loading ? 'Erstelle...' : '✨ Gruppe erstellen'}
      </button>
    </div>
  );
}

// ─── Tab: Schüler anlegen ────────────────────────────────────────────────────

function CreateStudentTab({ coachId }: { coachId: string }) {
  const { data: groups = [] } = useLearningGroups();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [ageGroup, setAgeGroup] = useState('unterstufe');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleCreate = async () => {
    if (!username.trim() || !displayName.trim() || !password) {
      setMsg({ type: 'error', text: 'Bitte fülle alle Pflichtfelder aus.' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Passwort muss mindestens 6 Zeichen lang sein.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      // 1. Create Supabase Auth user with pseudo-email
      const email = `${username.trim().toLowerCase()}@schatzkarte.app`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: displayName.trim(),
          must_change_password: true,
        },
        app_metadata: {
          role: 'student',
        },
      });

      if (authError) {
        // Admin API not available with anon key — use signUp instead
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim(),
              must_change_password: true,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Note: The auto-confirm trigger should handle email confirmation
        // Profile creation is handled by the profiles sync trigger

        // 2. Add to group if selected
        if (selectedGroup && signUpData.user) {
          // Wait a moment for the profile trigger to fire
          await new Promise(r => setTimeout(r, 1000));

          // Get the legacy_user_id from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('legacy_user_id')
            .eq('id', signUpData.user.id)
            .single();

          const memberId = profile?.legacy_user_id || signUpData.user.id;

          await supabase
            .from('group_members')
            .insert({ group_id: selectedGroup, user_id: memberId });
        }
      } else if (authData?.user) {
        // Admin API worked — add to group
        if (selectedGroup) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('legacy_user_id')
            .eq('id', authData.user.id)
            .single();

          const memberId = profile?.legacy_user_id || authData.user.id;

          await supabase
            .from('group_members')
            .insert({ group_id: selectedGroup, user_id: memberId });
        }
      }

      setMsg({
        type: 'success',
        text: `Schüler "${displayName}" angelegt!\n\nBenutzername: ${username}\nPasswort: ${password}\n\nBitte notiere die Zugangsdaten und gib sie dem Schüler.`,
      });
      setUsername('');
      setDisplayName('');
      setPassword('');
    } catch (e: any) {
      if (e?.message?.includes('already registered')) {
        setMsg({ type: 'error', text: 'Dieser Benutzername ist bereits vergeben.' });
      } else {
        setMsg({ type: 'error', text: `Fehler: ${e?.message || e}` });
      }
    }
    setLoading(false);
  };

  const generatePassword = () => {
    const adjectives = ['Stark', 'Mutig', 'Klug', 'Schnell', 'Tapfer', 'Schlau'];
    const animals = ['Fuchs', 'Adler', 'Tiger', 'Delfin', 'Panda', 'Falke'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    setPassword(`${adj}${animal}${num}`);
  };

  return (
    <div style={styles.card}>
      <h3 style={{ color: T.gold, marginBottom: 16 }}>👤 Neuen Schüler anlegen</h3>
      <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 16 }}>
        Erstelle einen Account für einen Schüler. Der Schüler meldet sich mit dem Benutzernamen und Passwort an.
      </p>

      <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700 }}>Benutzername *</label>
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="z.B. max2015"
        style={styles.input}
      />

      <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700 }}>Anzeigename *</label>
      <input
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
        placeholder="z.B. Max M."
        style={styles.input}
      />

      <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700 }}>Passwort *</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mind. 6 Zeichen"
          style={{ ...styles.input, marginBottom: 0, flex: 1 }}
        />
        <button onClick={generatePassword} style={styles.btnOutline} title="Kinderfreundliches Passwort generieren">
          🎲
        </button>
      </div>

      <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700 }}>Altersgruppe</label>
      <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} style={styles.select}>
        <option value="grundschule">Grundschule (Kl. 3-4)</option>
        <option value="unterstufe">Unterstufe (Kl. 5-7)</option>
        <option value="mittelstufe">Mittelstufe (Kl. 8-10)</option>
        <option value="oberstufe">Oberstufe (Kl. 11-13)</option>
      </select>

      {groups.length > 0 && (
        <>
          <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700 }}>Direkt einer Gruppe zuweisen</label>
          <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} style={styles.select}>
            <option value="">— Keine Gruppe —</option>
            {groups.map(g => (
              <option key={g.group_id} value={g.group_id}>{g.name}</option>
            ))}
          </select>
        </>
      )}

      {msg && (
        <div style={{ ...styles.msg(msg.type), whiteSpace: 'pre-line' }}>{msg.text}</div>
      )}

      <button onClick={handleCreate} disabled={loading} style={styles.btn()}>
        {loading ? 'Erstelle...' : '✨ Schüler anlegen'}
      </button>
    </div>
  );
}

// ─── Tab: Schüler verwalten ──────────────────────────────────────────────────

function ManageStudentsTab({ coachId }: { coachId: string }) {
  const { data: groups = [] } = useLearningGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const { data: members = [] } = useGroupMembers(selectedGroupId || null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRemoveMember = async (userId: string) => {
    try {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', selectedGroupId)
        .eq('user_id', userId);
      setMsg({ type: 'success', text: 'Mitglied entfernt.' });
      setConfirmDelete(null);
    } catch (e) {
      setMsg({ type: 'error', text: `Fehler: ${e}` });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_user_cascade', {
        target_user_id: userId,
      });
      if (error) throw error;
      if (data && !data.success) {
        setMsg({ type: 'error', text: data.message });
        return;
      }
      setMsg({ type: 'success', text: 'Schüler und alle Daten gelöscht.' });
      setConfirmDelete(null);
    } catch (e) {
      setMsg({ type: 'error', text: `Fehler: ${e}` });
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={{ color: T.gold, marginBottom: 16 }}>👥 Schüler verwalten</h3>

      {groups.length === 0 ? (
        <p style={{ color: T.textMuted }}>Erstelle zuerst eine Gruppe.</p>
      ) : (
        <>
          <label style={{ color: T.textMuted, fontSize: 13, fontWeight: 700 }}>Gruppe auswählen</label>
          <select
            value={selectedGroupId}
            onChange={e => { setSelectedGroupId(e.target.value); setMsg(null); setConfirmDelete(null); }}
            style={styles.select}
          >
            <option value="">— Gruppe wählen —</option>
            {groups.map(g => (
              <option key={g.group_id} value={g.group_id}>{g.name}</option>
            ))}
          </select>

          {msg && <div style={styles.msg(msg.type)}>{msg.text}</div>}

          {selectedGroupId && members.length === 0 && (
            <p style={{ color: T.textMuted, fontSize: 14 }}>Keine Mitglieder in dieser Gruppe.</p>
          )}

          {selectedGroupId && members.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map(m => (
                <div key={m.user_id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', background: '#0d1a2e', borderRadius: 8,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.user_id}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>
                      Beigetreten: {m.joined_at ? new Date(m.joined_at).toLocaleDateString('de-DE') : '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {confirmDelete === m.user_id ? (
                      <>
                        <button onClick={() => handleRemoveMember(m.user_id)} style={styles.btn('#f59e0b')}>
                          Aus Gruppe
                        </button>
                        <button onClick={() => handleDeleteUser(m.user_id)} style={styles.btn(T.danger)}>
                          Komplett löschen
                        </button>
                        <button onClick={() => setConfirmDelete(null)} style={styles.btnOutline}>
                          Abbruch
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(m.user_id)} style={styles.btnOutline}>
                        Entfernen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

type Tab = 'groups' | 'create' | 'student' | 'manage';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { profile, legacyUserId } = useAuth();
  const [tab, setTab] = useState<Tab>('groups');
  const coachId = legacyUserId ?? '';

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'groups', label: 'Meine Gruppen', icon: '📋' },
    { id: 'create', label: 'Neue Gruppe', icon: '➕' },
    { id: 'student', label: 'Schüler anlegen', icon: '👤' },
    { id: 'manage', label: 'Verwalten', icon: '⚙️' },
  ];

  return (
    <div style={styles.page}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>🎓 Coach Dashboard</h2>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
              {profile?.display_name || 'Coach'}
            </div>
          </div>
          <button onClick={() => navigate('/karte')} style={styles.btnOutline}>
            ← Zur Karte
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={styles.tab(tab === t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'groups' && <MyGroupsTab coachId={coachId} />}
        {tab === 'create' && <CreateGroupTab coachId={coachId} />}
        {tab === 'student' && <CreateStudentTab coachId={coachId} />}
        {tab === 'manage' && <ManageStudentsTab coachId={coachId} />}
      </div>
    </div>
  );
}
