// src/pages/SchatzkartePage.tsx
// Page-Wrapper: WorldMapIllustrated + Floating Widgets (Chat, Jitsi)

import { WorldMapIllustrated } from '@/components/WorldMapIllustrated';

// TODO: Floating Widgets einbinden wenn useLearningGroups + useMeetingData Hooks existieren
// import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
// import FloatingJitsiWidget from '@/components/video/FloatingJitsiWidget';

export default function SchatzkartePage() {
  // TODO: Lerngruppen-Daten laden fuer Chat + Jitsi
  // const { groupId, groupName, allGroups } = useLearningGroups();
  // const meetingData = useMeetingData(groupId);

  return (
    <>
      <WorldMapIllustrated />

      {/* TODO: FloatingChatWidget einbinden
      {groupId && (
        <FloatingChatWidget
          groupId={groupId}
          groupName={groupName}
          allGroups={allGroups}
        />
      )}
      */}

      {/* TODO: FloatingJitsiWidget einbinden
      {meetingData && (
        <FloatingJitsiWidget
          meetingData={meetingData}
          onJoin={() => console.log('[Jitsi] joined')}
          onLeave={() => console.log('[Jitsi] left')}
        />
      )}
      */}
    </>
  );
}
