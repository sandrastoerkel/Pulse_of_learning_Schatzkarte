// ============================================
// RPG Schatzkarte - Hero Status Component
// ============================================
import { HeroData, Item } from '../types';

interface HeroStatusProps {
  hero: HeroData;
  onInventoryClick?: () => void;
}

// Avatar Icons
const AVATAR_ICONS: Record<string, string> = {
  warrior: '⚔️',
  mage: '🧙',
  ranger: '🏹',
  healer: '💚'
};

// Avatar Namen
const AVATAR_NAMES: Record<string, string> = {
  warrior: 'Krieger',
  mage: 'Magier',
  ranger: 'Waldläufer',
  healer: 'Heiler'
};

export function HeroStatus({ hero, onInventoryClick }: HeroStatusProps) {
  const xpPercent = (hero.xp / hero.xp_to_next_level) * 100;

  return (
    <div className="hero-status">
      {/* Avatar & Level */}
      <div className="hero-avatar-section">
        <div className="hero-avatar">
          <span className="avatar-icon">{AVATAR_ICONS[hero.avatar]}</span>
          <div className="level-badge">Lv.{hero.level}</div>
        </div>
        <div className="hero-info">
          <h3 className="hero-name">{hero.name}</h3>
          <span className="hero-class">{AVATAR_NAMES[hero.avatar]}</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="xp-section">
        <div className="stat-label">
          <span>⭐ Erfahrung</span>
          <span>{hero.xp} / {hero.xp_to_next_level} XP</span>
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

      {/* Gold */}
      <div className="gold-section">
        <span className="gold-icon">🪙</span>
        <span className="gold-amount">{hero.gold}</span>
        <span className="gold-label">Gold</span>
      </div>

      {/* Quick Inventory Preview */}
      <div className="inventory-preview" onClick={onInventoryClick}>
        <div className="inventory-label">🎒 Inventar</div>
        <div className="inventory-items">
          {hero.items.slice(0, 4).map((item, index) => (
            <div
              key={item.id}
              className={`inventory-slot rarity-${item.rarity}`}
              title={item.name}
            >
              {item.icon}
            </div>
          ))}
          {hero.items.length > 4 && (
            <div className="inventory-more">+{hero.items.length - 4}</div>
          )}
        </div>
      </div>

      {/* Titles/Achievements */}
      {hero.titles.length > 0 && (
        <div className="titles-section">
          <div className="title-badge">
            🏅 {hero.titles[hero.titles.length - 1]}
          </div>
        </div>
      )}
    </div>
  );
}

// Inventory Modal Component
interface InventoryModalProps {
  hero: HeroData;
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryModal({ hero, isOpen, onClose }: InventoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inventory-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎒 Inventar von {hero.name}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="inventory-grid">
          {hero.items.map(item => (
            <div key={item.id} className={`inventory-item rarity-${item.rarity}`}>
              <span className="item-icon">{item.icon}</span>
              <span className="item-name">{item.name}</span>
              <span className="item-rarity">{item.rarity}</span>
            </div>
          ))}
          {hero.items.length === 0 && (
            <div className="empty-inventory">
              Noch keine Gegenstände gesammelt!
            </div>
          )}
        </div>

        {hero.titles.length > 0 && (
          <>
            <h3>🏅 Errungene Titel</h3>
            <div className="titles-grid">
              {hero.titles.map((title, index) => (
                <div key={index} className="title-item">
                  {title}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
