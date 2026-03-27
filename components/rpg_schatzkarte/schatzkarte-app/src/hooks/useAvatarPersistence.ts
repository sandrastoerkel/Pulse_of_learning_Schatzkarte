// ============================================
// useAvatarPersistence - Dual-Write Hook
// ============================================
// Speichert Avatar-Daten in localStorage (sofort) + Supabase (debounced).
// Refactored: Nutzt globalen Supabase-Client + useAuth statt credentials-Prop.

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { CustomAvatar } from '@/types/legacy-ui';

// --- localStorage Keys ---
const LS_AVATAR = 'schatzkarte_custom_avatar';
const LS_HERO_NAME = 'schatzkarte_hero_name';
const LS_OWNED_ITEMS = 'schatzkarte_owned_items';

// --- localStorage Helpers ---
function loadAvatarFromLS(): CustomAvatar | null {
  try {
    const saved = localStorage.getItem(LS_AVATAR);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function loadHeroNameFromLS(): string {
  try {
    return localStorage.getItem(LS_HERO_NAME) || '';
  } catch {
    return '';
  }
}

function loadOwnedItemsFromLS(): string[] {
  try {
    const saved = localStorage.getItem(LS_OWNED_ITEMS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveAvatarToLS(avatar: CustomAvatar | null, heroName: string, ownedItems: string[]) {
  try {
    if (avatar) {
      localStorage.setItem(LS_AVATAR, JSON.stringify(avatar));
    } else {
      localStorage.removeItem(LS_AVATAR);
    }
    localStorage.setItem(LS_HERO_NAME, heroName);
    localStorage.setItem(LS_OWNED_ITEMS, JSON.stringify(ownedItems));
  } catch (e) {
    console.warn('Avatar: localStorage save failed', e);
  }
}

// --- Supabase Helper ---
async function upsertToSupabase(
  userId: string,
  avatar: CustomAvatar | null,
  heroName: string,
  ownedItems: string[]
) {
  try {
    const row: Record<string, unknown> = {
      user_id: userId,
      hero_name: heroName,
      owned_items: ownedItems,
    };
    if (avatar) {
      row.visuals = avatar.visuals;
      row.equipped = avatar.equipped;
    }

    const { error } = await supabase
      .from('user_avatars')
      .upsert(row, { onConflict: 'user_id' });

    if (error) {
      console.error('Avatar: Supabase upsert error', error);
    }
  } catch (e) {
    console.error('Avatar: Supabase upsert exception', e);
  }
}

// --- Hook ---
export function useAvatarPersistence() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // State — initialisiert aus localStorage (sofort, kein Flicker)
  const [customAvatar, setCustomAvatar] = useState<CustomAvatar | null>(loadAvatarFromLS);
  const [heroName, setHeroName] = useState<string>(loadHeroNameFromLS);
  const [ownedItems, setOwnedItems] = useState<string[]>(loadOwnedItemsFromLS);

  // Refs fuer Debounce
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarRef = useRef(customAvatar);
  const heroNameRef = useRef(heroName);
  const ownedItemsRef = useRef(ownedItems);
  const supabaseLoadedRef = useRef(false);

  // Refs aktuell halten
  avatarRef.current = customAvatar;
  heroNameRef.current = heroName;
  ownedItemsRef.current = ownedItems;

  // --- Supabase Daten laden ---
  useEffect(() => {
    if (!userId) return;
    if (supabaseLoadedRef.current) return;
    supabaseLoadedRef.current = true;

    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('user_avatars')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Avatar: Supabase load error', error);
          return;
        }

        if (data) {
          const dbAvatar: CustomAvatar = {
            visuals: data.visuals,
            equipped: data.equipped || { hat: null, glasses: null, accessory: null, cape: null, effect: null, frame: null },
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          const dbName: string = data.hero_name || '';
          const dbOwned: string[] = data.owned_items || [];

          setCustomAvatar(dbAvatar);
          setHeroName(dbName);
          setOwnedItems(dbOwned);
          saveAvatarToLS(dbAvatar, dbName, dbOwned);
        } else {
          // DB leer — localStorage hat evtl. Daten -> Migration
          const lsAvatar = avatarRef.current;
          const lsName = heroNameRef.current;
          const lsOwned = ownedItemsRef.current;

          if (lsAvatar) {
            upsertToSupabase(userId, lsAvatar, lsName, lsOwned);
          }
        }
      } catch (e) {
        console.error('Avatar: Supabase load exception', e);
      }
    };

    loadFromSupabase();
  }, [userId]);

  // --- Debounced Supabase Save ---
  const debouncedSave = useCallback(() => {
    if (!userId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      upsertToSupabase(
        userId,
        avatarRef.current,
        heroNameRef.current,
        ownedItemsRef.current
      );
    }, 2000);
  }, [userId]);

  // Flush bei Unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        if (userId) {
          upsertToSupabase(
            userId,
            avatarRef.current,
            heroNameRef.current,
            ownedItemsRef.current
          );
        }
      }
    };
  }, [userId]);

  // --- Public API ---
  const saveAvatar = useCallback((avatar: CustomAvatar, name: string) => {
    setCustomAvatar(avatar);
    setHeroName(name);
    saveAvatarToLS(avatar, name, ownedItemsRef.current);
    debouncedSave();
  }, [debouncedSave]);

  const saveOwnedItems = useCallback((items: string[]) => {
    setOwnedItems(items);
    saveAvatarToLS(avatarRef.current, heroNameRef.current, items);
    debouncedSave();
  }, [debouncedSave]);

  const saveEquipped = useCallback((updatedAvatar: CustomAvatar) => {
    setCustomAvatar(updatedAvatar);
    saveAvatarToLS(updatedAvatar, heroNameRef.current, ownedItemsRef.current);
    debouncedSave();
  }, [debouncedSave]);

  return {
    customAvatar,
    heroName,
    ownedItems,
    saveAvatar,
    saveOwnedItems,
    saveEquipped,
  };
}
