// ============================================
// Lernkarten Hooks
// For: LootLernkarten component
// Tables: lernkarten_decks, lernkarten_cards
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLegacyUserId } from './useLegacyUserId';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LernkartenDeck {
  id: string;
  user_id: string;
  subject_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LernkartenCard {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  back: string;
  interval_days: number;
  repetitions: number;
  ease_factor: number;
  next_review: string;
  last_review: string | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

// ─── SM-2 Algorithm (client-side, matches LootLernkarten.tsx) ────────────────

function sm2Review(card: LernkartenCard, quality: number): Partial<LernkartenCard> {
  const q = Math.max(0, Math.min(5, quality));
  let interval = card.interval_days;
  let repetitions = card.repetitions;
  let easeFactor = card.ease_factor;

  if (q >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  const next = new Date();
  next.setDate(next.getDate() + interval);

  return {
    interval_days: interval,
    repetitions,
    ease_factor: Math.round(easeFactor * 100) / 100,
    next_review: next.toISOString(),
    last_review: new Date().toISOString(),
    review_count: card.review_count + 1,
  };
}

// ─── Deck Hooks ──────────────────────────────────────────────────────────────

export function useLernkartenDecks() {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['lernkarten-decks', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('lernkarten_decks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as LernkartenDeck[];
    },
    enabled: !!userId,
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  const userId = useLegacyUserId();

  return useMutation({
    mutationFn: async ({ subjectId, name }: { subjectId: string; name: string }) => {
      const { data, error } = await supabase
        .from('lernkarten_decks')
        .insert({ user_id: userId, subject_id: subjectId, name })
        .select()
        .single();

      if (error) throw error;
      return data as LernkartenDeck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lernkarten-decks'] });
    },
  });
}

export function useRenameDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deckId, name }: { deckId: string; name: string }) => {
      const { error } = await supabase
        .from('lernkarten_decks')
        .update({ name })
        .eq('id', deckId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lernkarten-decks'] });
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deckId: string) => {
      // Cards are cascade-deleted by FK constraint
      const { error } = await supabase
        .from('lernkarten_decks')
        .delete()
        .eq('id', deckId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lernkarten-decks'] });
      queryClient.invalidateQueries({ queryKey: ['lernkarten-cards'] });
      queryClient.invalidateQueries({ queryKey: ['lernkarten-due-count'] });
    },
  });
}

// ─── Card Hooks ──────────────────────────────────────────────────────────────

export function useLernkartenCards(deckId: string | null | undefined) {
  return useQuery({
    queryKey: ['lernkarten-cards', deckId],
    queryFn: async () => {
      if (!deckId) return [];

      const { data, error } = await supabase
        .from('lernkarten_cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as LernkartenCard[];
    },
    enabled: !!deckId,
  });
}

export function useAddCard() {
  const queryClient = useQueryClient();
  const userId = useLegacyUserId();

  return useMutation({
    mutationFn: async ({ deckId, front, back }: { deckId: string; front: string; back: string }) => {
      const { data, error } = await supabase
        .from('lernkarten_cards')
        .insert({ deck_id: deckId, user_id: userId, front, back })
        .select()
        .single();

      if (error) throw error;
      return data as LernkartenCard;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lernkarten-cards', variables.deckId] });
      queryClient.invalidateQueries({ queryKey: ['lernkarten-due-count'] });
    },
  });
}

export function useAddCardsBulk() {
  const queryClient = useQueryClient();
  const userId = useLegacyUserId();

  return useMutation({
    mutationFn: async ({ deckId, pairs }: { deckId: string; pairs: { front: string; back: string }[] }) => {
      const rows = pairs.map(p => ({
        deck_id: deckId,
        user_id: userId,
        front: p.front,
        back: p.back,
      }));

      const { data, error } = await supabase
        .from('lernkarten_cards')
        .insert(rows)
        .select();

      if (error) throw error;
      return (data ?? []) as LernkartenCard[];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lernkarten-cards', variables.deckId] });
      queryClient.invalidateQueries({ queryKey: ['lernkarten-due-count'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cardId, deckId }: { cardId: string; deckId: string }) => {
      const { error } = await supabase
        .from('lernkarten_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      return deckId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lernkarten-cards', variables.deckId] });
      queryClient.invalidateQueries({ queryKey: ['lernkarten-due-count'] });
    },
  });
}

// ─── Review Hook (SM-2) ─────────────────────────────────────────────────────

export function useReviewCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ card, quality }: { card: LernkartenCard; quality: number }) => {
      const updates = sm2Review(card, quality);

      const { data, error } = await supabase
        .from('lernkarten_cards')
        .update(updates)
        .eq('id', card.id)
        .select()
        .single();

      if (error) throw error;
      return data as LernkartenCard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lernkarten-cards', data.deck_id] });
      queryClient.invalidateQueries({ queryKey: ['lernkarten-due-count'] });
    },
  });
}

// ─── Due Cards ───────────────────────────────────────────────────────────────

export function useDueCards(deckId?: string | null) {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['lernkarten-due', userId, deckId],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('lernkarten_cards')
        .select('*')
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString())
        .order('next_review', { ascending: true });

      if (deckId) {
        query = query.eq('deck_id', deckId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as LernkartenCard[];
    },
    enabled: !!userId,
  });
}

export function useLernkartenDueCount() {
  const userId = useLegacyUserId();

  return useQuery({
    queryKey: ['lernkarten-due-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from('lernkarten_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('next_review', new Date().toISOString());

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
  });
}
