// src/pages/AvatarShopPage.tsx
// Page-Wrapper: Route → AvatarShop

import { useNavigate } from 'react-router-dom';
import AvatarShop from '@/components/AvatarShop/AvatarShop';
import { useHeroData } from '@/hooks';
import { DEFAULT_AVATAR_VISUALS, DEFAULT_AVATAR_EQUIPPED } from '@/components/AvatarParts';
import type { CustomAvatar, ShopItem, ItemSlot } from '@/types/legacy-ui';

// TODO: Avatar aus useAvatarPersistence laden
const DEFAULT_AVATAR: CustomAvatar = {
  visuals: DEFAULT_AVATAR_VISUALS,
  equipped: DEFAULT_AVATAR_EQUIPPED,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function AvatarShopPage() {
  const navigate = useNavigate();
  const heroData = useHeroData();

  // XP als Währung (Gold entfernt)
  const playerXP = heroData?.xp ?? 0;
  const ownedItems: string[] = [];

  return (
    <AvatarShop
      playerGold={playerXP}
      playerAvatar={DEFAULT_AVATAR}
      ownedItems={ownedItems}
      onPurchase={(item: ShopItem) => console.log('[AvatarShop] Purchase:', item.id)}
      onEquip={(itemId: string, slot: ItemSlot) => console.log('[AvatarShop] Equip:', itemId, slot)}
      onUnequip={(slot: ItemSlot) => console.log('[AvatarShop] Unequip:', slot)}
      onClose={() => navigate('/karte')}
    />
  );
}
