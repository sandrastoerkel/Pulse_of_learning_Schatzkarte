// src/pages/SchatzkartePage.tsx
// Page-Wrapper: HeroStatus + WorldMapIllustrated + Floating Widgets (Chat, Jitsi)

import { useMemo } from 'react';
import { WorldMapIllustrated } from '@/components/WorldMapIllustrated';
import { HeroStatus } from '@/components/HeroStatus';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import FloatingJitsiWidget from '@/components/video/FloatingJitsiWidget';
import type { MeetingData } from '@/components/video/FloatingJitsiWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useMyGroup, useNextMeeting } from '@/hooks';

// JaaS App-ID (gleich wie im alten Streamlit-Projekt)
const JAAS_APP_ID = 'vpaas-magic-cookie-b84a3592bf8743339eab099ce877c682';

export default function SchatzkartePage() {
  const { profile } = useAuth();
  const { data: myGroup } = useMyGroup();
  const { data: nextMeeting } = useNextMeeting(myGroup?.group_id);

  // MeetingData fuer FloatingJitsiWidget aufbauen
  const meetingData = useMemo((): MeetingData | null => {
    if (!nextMeeting || !nextMeeting.jitsi_room_name) return null;

    const now = new Date();
    const start = new Date(nextMeeting.scheduled_start);
    const end = new Date(nextMeeting.scheduled_end);
    const minutesUntilStart = Math.round((start.getTime() - now.getTime()) / 60000);
    const minutesRemaining = Math.round((end.getTime() - now.getTime()) / 60000);
    // Beitritt 10 Min vor Start bis Ende erlaubt
    const canJoin = minutesUntilStart <= 10 && minutesRemaining > 0;

    const isCoach = myGroup?.coach_id === profile?.id;

    return {
      canJoin,
      roomName: nextMeeting.jitsi_room_name,
      config: {
        startWithAudioMuted: !isCoach,
        startWithVideoMuted: true,
      },
      interfaceConfig: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'chat',
          'raisehand', 'hangup', 'tileview',
        ],
        SHOW_JITSI_WATERMARK: false,
        DEFAULT_BACKGROUND: '#1a1a2e',
      },
      displayName: profile?.display_name ?? 'Teilnehmer',
      meetingId: nextMeeting.id,
      meetingTitle: nextMeeting.title,
      timeStatus: {
        minutesUntilStart,
        minutesRemaining,
        canJoin,
        reason: canJoin ? 'Meeting läuft' : minutesUntilStart > 0
          ? `Startet in ${minutesUntilStart} Min.`
          : 'Meeting beendet',
      },
      scheduledStartISO: nextMeeting.scheduled_start,
      scheduledEndISO: nextMeeting.scheduled_end,
      userRole: isCoach ? 'coach' : 'kind',
      appId: JAAS_APP_ID,
    };
  }, [nextMeeting, myGroup, profile]);

  return (
    <>
      <HeroStatus />
      <WorldMapIllustrated />

      {myGroup && (
        <FloatingChatWidget
          groupId={myGroup.group_id}
          groupName={myGroup.name}
        />
      )}

      {meetingData && (
        <FloatingJitsiWidget
          meetingData={meetingData}
          onJoin={() => console.log('[Jitsi] joined')}
          onLeave={() => console.log('[Jitsi] left')}
        />
      )}
    </>
  );
}
