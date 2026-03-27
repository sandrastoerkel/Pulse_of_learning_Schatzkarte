// ============================================
// RPG Schatzkarte - Hero Status Component
// Rewritten: hooks statt props
// ============================================
import { useHeroData, useUserBadges, useCollectedTreasures } from '@/hooks';
import { useAvatarPersistence } from '@/hooks/useAvatarPersistence';
import { AvatarDisplay } from '@/components/AvatarDisplay';
import { DEFAULT_ISLANDS } from '@/config/islands';

// ─── Data source mapping ────────────────────────────────────────────────────
//
// Field mapping summary:
//   DIRECT:   name, level (from useHeroData)
//   COMPUTED: xpPercent (from heroData.xpProgress * 100)
//   DIRECT:   xpInLevel (heroData.xpProgress * heroData.xpToNextLevel),
//             xpToNextLevel (from useHeroData)
//   DIRECT:   titles (from useUserBadges → badge_name)
//   HOOK:     customAvatar (useAvatarPersistence) → AvatarDisplay component
//   REMOVED:  companion section (not available in current hooks)
//   REMOVED:  gold section (not in Profile type)
//   HOOK:     treasureItems (useCollectedTreasures + DEFAULT_ISLANDS) → inventory preview
//

export function HeroStatus() {
  const heroData = useHeroData();                    // SOURCE: useHeroData hook
  const { data: badges = [] } = useUserBadges();     // SOURCE: useUserBadges hook
  const { data: collectedTreasures = [] } = useCollectedTreasures();
  const { customAvatar } = useAvatarPersistence();

  // Map collected treasure IDs to display info from island config
  const treasureItems = collectedTreasures.map(t => {
    const island = DEFAULT_ISLANDS.find(i => i.id === t.island_id);
    const treasureDef = island?.treasures?.find(tr => tr.name === t.treasure_id);
    return {
      id: t.treasure_id,
      icon: treasureDef?.icon ?? '💎',
      name: treasureDef?.name ?? t.treasure_id,
      islandName: island?.name ?? '',
    };
  });

  if (!heroData) return null; // loading / not logged in

  // COMPUTED: XP progress from heroData.xpProgress (0-1 ratio)
  const xpPercent = heroData.xpProgress * 100;

  // COMPUTED: XP in current level = progress * xpToNextLevel
  const xpInCurrentLevel = Math.round(heroData.xpProgress * heroData.xpToNextLevel);

  // DIRECT: badge names as titles
  const titles = badges
    .map(b => b.badge_name)                          // SOURCE: useUserBadges → badge_name
    .filter((name): name is string => name !== null);

  return (
    <div className="hero-status">
      {/* Name & Level */}
      <div className="hero-avatar-section">
        <div className="hero-avatar">
          {customAvatar?.visuals ? (
            <AvatarDisplay
              visuals={customAvatar.visuals}
              equipped={customAvatar.equipped}
              size="small"
              animated={false}
            />
          ) : (
            <span className="avatar-icon">⚔️</span>
          )}
        </div>
        {/* TODO: Companion-Sektion entfernt — companion nicht in aktuellen Hooks verfuegbar */}
        <div className="hero-info">
          <div className="hero-name-row">
            <h3 className="hero-name">{heroData.name}</h3>
            {/* DIRECT: heroData.level from useHeroData */}
            <span className="level-badge">Lv.{heroData.level}</span>
          </div>
        </div>
        {/* Inventory-Preview: gesammelte Schätze aus useCollectedTreasures */}
        {treasureItems.length > 0 && (
          <div className="inventory-preview">
            {treasureItems.slice(0, 5).map((item, i) => (
              <span key={i} className="inventory-item" title={item.name}>
                {item.icon}
              </span>
            ))}
            {treasureItems.length > 5 && (
              <span className="inventory-more">+{treasureItems.length - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* XP Bar */}
      <div className="xp-section">
        <div className="stat-label">
          <span>⭐ Erfahrung</span>
          {/* COMPUTED: xpInCurrentLevel / xpToNextLevel from useHeroData */}
          <span>{xpInCurrentLevel} / {heroData.xpToNextLevel} XP</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-fill"
            style={{ width: `${xpPercent}%` }}
          >
            <div className="xp-glow"></div>
          </div>
        </div>
      </div>

      {/* TODO: Gold-Sektion entfernt — gold ist nicht im Profile-Typ vorhanden */}

      {/* Titles/Achievements */}
      {titles.length > 0 && (
        <div className="titles-section">
          {/* DIRECT: letzter Badge-Name from useUserBadges */}
          <div className="title-badge">
            🏅 {titles[0]}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroStatus;
