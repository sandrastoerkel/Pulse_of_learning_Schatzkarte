// ============================================
// Meeting Data Hooks
// For: FloatingJitsiWidget, meeting scheduling
// Tables: scheduled_meetings, meeting_participants
// Edge Function: generate-jitsi-jwt
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLegacyUserId } from './useLegacyUserId';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScheduledMeeting {
  id: string;
  group_id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  recurrence_type: string | null;
  day_of_week: number | null;
  time_of_day: string | null;
  duration_minutes: number | null;
  status: string | null;
  jitsi_room_name: string | null;
  created_by: string;
  created_at: string | null;
}

export interface MeetingParticipant {
  id: number;
  meeting_id: string;
  user_id: string;
  display_name: string | null;
  role: string | null;
  joined_at: string | null;
  left_at: string | null;
}

// ─── useScheduledMeetings: Meetings for a group ──────────────────────────────

export function useScheduledMeetings(groupId: string | null | undefined) {
  return useQuery({
    queryKey: ['scheduled-meetings', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from('scheduled_meetings')
        .select('*')
        .eq('group_id', groupId)
        .order('scheduled_start', { ascending: true });

      if (error) throw error;
      return (data ?? []) as ScheduledMeeting[];
    },
    enabled: !!groupId,
  });
}

// ─── useNextMeeting: Next upcoming meeting for a group ───────────────────────

export function useNextMeeting(groupId: string | null | undefined) {
  return useQuery({
    queryKey: ['next-meeting', groupId],
    queryFn: async () => {
      if (!groupId) return null;

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('scheduled_meetings')
        .select('*')
        .eq('group_id', groupId)
        .gte('scheduled_end', now)
        .order('scheduled_start', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ScheduledMeeting | null;
    },
    enabled: !!groupId,
  });
}

// ─── useMeetingParticipants: Who is in a meeting ─────────────────────────────

export function useMeetingParticipants(meetingId: string | null | undefined) {
  return useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];

      const { data, error } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as MeetingParticipant[];
    },
    enabled: !!meetingId,
  });
}

// ─── useJitsiJwt: Get a JWT for joining a Jitsi meeting ─────────────────────

export function useJitsiJwt() {
  const { profile } = useAuth();
  const legacyUserId = useLegacyUserId();

  return useMutation({
    mutationFn: async ({
      room,
      isModerator = false,
    }: {
      room: string;
      isModerator?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-jitsi-jwt', {
        body: {
          user_name: profile?.display_name ?? 'Teilnehmer',
          user_id: legacyUserId ?? '',
          is_moderator: isModerator,
          room: room,
          user_email: '',
        },
      });

      if (error) throw error;
      return data.token as string;
    },
  });
}

// ─── useJoinMeeting: Record joining a meeting ────────────────────────────────

export function useJoinMeeting() {
  const queryClient = useQueryClient();
  const legacyUserId = useLegacyUserId();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      meetingId,
      role = 'student',
    }: {
      meetingId: string;
      role?: string;
    }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          user_id: legacyUserId,
          display_name: profile?.display_name ?? 'Teilnehmer',
          role: role,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', variables.meetingId] });
    },
  });
}

// ─── useLeaveMeeting: Record leaving a meeting ──────────────────────────────

export function useLeaveMeeting() {
  const queryClient = useQueryClient();
  const legacyUserId = useLegacyUserId();

  return useMutation({
    mutationFn: async ({ meetingId }: { meetingId: string }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('meeting_id', meetingId)
        .eq('user_id', legacyUserId)
        .is('left_at', null)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', variables.meetingId] });
    },
  });
}
