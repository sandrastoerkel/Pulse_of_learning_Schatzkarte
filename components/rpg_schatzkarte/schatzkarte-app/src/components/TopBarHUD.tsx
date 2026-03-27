// ============================================
// TopBarHUD — Kompakte Navbar (ersetzt Sidebar + HeroStatus)
// Layout: Avatar + Name | XP-Bar + Fortschritt | Buttons
// Design: Gaming-HUD, dark theme, gold accents
// ============================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHeroData, useIslandProgress, useCollectedTreasures } from '@/hooks';
import { useAvatarPersistence } from '@/hooks/useAvatarPersistence';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { DEFAULT_ISLANDS } from '@/config/islands';

export function TopBarHUD() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const heroData = useHeroData();
  const { data: islandProgress = [] } = useIslandProgress();
  const { data: treasures = [] } = useCollectedTreasures();
  const { customAvatar } = useAvatarPersistence();

  // Fortschritt berechnen
  const totalIslands = DEFAULT_ISLANDS.length;
  const completedIslands = useMemo(() => {
    return islandProgress.filter(ip =>
      ip.video_watched && ip.explanation_read && ip.quiz_passed && ip.challenge_completed
    ).length;
  }, [islandProgress]);
  const progressPercent = totalIslands > 0 ? Math.round((completedIslands / totalIslands) * 100) : 0;

  // XP
  const xpPercent = heroData ? heroData.xpProgress * 100 : 0;
  const xpTotal = heroData?.xp ?? 0;

  if (!user) return null;

  return (
    <div style={barStyle}>
      {/* ── Links: Avatar + Name + Level ── */}
      <div style={leftSection}>
        <div
          style={avatarContainer}
          onClick={() => navigate('/karte/avatar-shop')}
          title="Avatar bearbeiten"
        >
          {customAvatar?.visuals ? (
            <AvatarDisplay
              visuals={customAvatar.visuals}
              equipped={customAvatar.equipped}
              size="small"
              animated={false}
            />
          ) : (
            <div style={avatarPlaceholder}>
              {(profile?.display_name ?? '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div style={nameSection}>
          <span style={nameText}>{profile?.display_name ?? 'Abenteurer'}</span>
          <span style={levelBadge}>Lv.{heroData?.level ?? 1}</span>
        </div>
      </div>

      {/* ── Mitte: XP + Fortschritt ── */}
      <div style={centerSection}>
        {/* XP Bar */}
        <div style={statRow}>
          <span style={statLabel}>⭐ {xpTotal} XP</span>
          <div style={barTrack}>
            <div style={{ ...barFill, width: `${xpPercent}%`, background: 'linear-gradient(90deg, #c8a84e, #ffe44d)' }} />
          </div>
        </div>
        {/* Quest-Fortschritt */}
        <div style={statRow}>
          <span style={statLabel}>🗺️ {completedIslands}/{totalIslands} Quests · {progressPercent}%</span>
          <div style={barTrack}>
            <div style={{ ...barFill, width: `${progressPercent}%`, background: 'linear-gradient(90deg, #0ea5e9, #4fc3f7)' }} />
          </div>
        </div>
      </div>

      {/* ── Rechts: Buttons ── */}
      <div style={rightSection}>
        <button
          onClick={() => navigate('/')}
          style={navBtn}
          title="Startseite"
        >
          🏠
        </button>
        {(profile?.role === 'coach' || profile?.role === 'admin') && (
          <button
            onClick={() => navigate('/coach')}
            style={navBtn}
            title="Coach Dashboard"
          >
            🎓
          </button>
        )}
        <button
          onClick={() => { signOut(); navigate('/login'); }}
          style={{ ...navBtn, ...logoutBtn }}
          title="Abmelden"
        >
          ↪
        </button>
      </div>
    </div>
  );
}

// ─── Styles (inline, kein CSS nötig) ─────────────────────────────────────────

const barStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '8px 16px',
  background: 'linear-gradient(180deg, #0c1a2aee 0%, #0c1a2add 100%)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid #1e3a52',
  fontFamily: "'Nunito', sans-serif",
  color: '#e2e8f0',
  minHeight: 56,
};

const leftSection: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexShrink: 0,
};

const avatarContainer: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  overflow: 'hidden',
  border: '2px solid #c8a84e',
  cursor: 'pointer',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#1a2744',
};

const avatarPlaceholder: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#c8a84e',
};

const nameSection: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const nameText: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#e2e8f0',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
};

const levelBadge: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#c8a84e',
  background: '#c8a84e22',
  padding: '1px 8px',
  borderRadius: 4,
  width: 'fit-content',
};

const centerSection: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 0,
  maxWidth: 400,
};

const statRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const statLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#8899aa',
  whiteSpace: 'nowrap',
  minWidth: 110,
};

const barTrack: React.CSSProperties = {
  flex: 1,
  height: 6,
  background: '#1e293b',
  borderRadius: 3,
  overflow: 'hidden',
};

const barFill: React.CSSProperties = {
  height: '100%',
  borderRadius: 3,
  transition: 'width 0.5s ease',
};

const rightSection: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  flexShrink: 0,
};

const navBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: '1px solid #1e3a52',
  background: '#12203a',
  color: '#8899aa',
  fontSize: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
};

const logoutBtn: React.CSSProperties = {
  color: '#ef4444',
  borderColor: '#ef444433',
};

export default TopBarHUD;
