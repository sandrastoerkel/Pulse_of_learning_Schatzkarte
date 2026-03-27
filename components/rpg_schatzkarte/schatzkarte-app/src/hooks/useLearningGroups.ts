// ============================================
// Learning Groups Hooks
// For: FloatingChatWidget (group data), CoachDashboard
// Tables: learning_groups, group_members, group_messages
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLegacyUserId } from './useLegacyUserId';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LearningGroup {
  group_id: string;
  name: string;
  coach_id: string;
  created_at: string | null;
  start_date: string | null;
  current_week: number | null;
  is_active: number | null;
  settings: string | null;
}

export interface GroupMember {
  id: number;
  group_id: string;
  user_id: string;
  joined_at: string | null;
  status: string | null;
  last_seen_chat: string | null;
  // Joined from profiles/users:
  display_name?: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string | null;
  message_text: string;
  message_type: string | null;
  is_deleted: boolean | null;
  deleted_by: string | null;
  created_at: string | null;
}

// ─── useMyGroup: Get the current user's group ────────────────────────────────

export function useMyGroup() {
  const legacyUserId = useLegacyUserId();

  return useQuery({
    queryKey: ['my-group', legacyUserId],
    queryFn: async () => {
      if (!legacyUserId) return null;

      // Find group membership
      const { data: membership, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', legacyUserId)
        .limit(1)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!membership) return null;

      // Fetch group details
      const { data: group, error: groupError } = await supabase
        .from('learning_groups')
        .select('*')
        .eq('group_id', membership.group_id)
        .single();

      if (groupError) throw groupError;
      return group as LearningGroup;
    },
    enabled: !!legacyUserId,
  });
}

// ─── useLearningGroups: All groups (for coaches) ─────────────────────────────

export function useLearningGroups() {
  const legacyUserId = useLegacyUserId();
  const { profile } = useAuth();
  const role = profile?.role;

  return useQuery({
    queryKey: ['learning-groups', legacyUserId, role],
    queryFn: async () => {
      if (!legacyUserId) return [];

      let query = supabase.from('learning_groups').select('*');

      // Coaches see only their own groups, admins see all
      if (role !== 'admin') {
        query = query.eq('coach_id', legacyUserId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as LearningGroup[];
    },
    enabled: !!legacyUserId && (role === 'coach' || role === 'admin'),
  });
}

// ─── useGroupMembers: Members of a specific group ────────────────────────────

export function useGroupMembers(groupId: string | null | undefined) {
  return useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as GroupMember[];
    },
    enabled: !!groupId,
  });
}

// ─── useGroupMessages: Messages for a group (with realtime in component) ─────

export function useGroupMessages(groupId: string | null | undefined) {
  return useQuery({
    queryKey: ['group-messages', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as GroupMessage[];
    },
    enabled: !!groupId,
  });
}

// ─── useSendMessage: Send a chat message ─────────────────────────────────────

export function useSendMessage() {
  const queryClient = useQueryClient();
  const legacyUserId = useLegacyUserId();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      groupId,
      messageText,
      recipientId,
      messageType = 'text',
    }: {
      groupId: string;
      messageText: string;
      recipientId?: string;
      messageType?: string;
    }) => {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_id: legacyUserId,
          sender_name: profile?.display_name ?? 'Unbekannt',
          recipient_id: recipientId ?? null,
          message_text: messageText,
          message_type: messageType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-messages', variables.groupId] });
    },
  });
}
