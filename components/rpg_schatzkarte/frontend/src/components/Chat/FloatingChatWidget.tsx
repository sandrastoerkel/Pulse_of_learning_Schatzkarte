// ============================================
// FloatingChatWidget - Nachrichtenboard
// ============================================
// WhatsApp-aehnliches Chat-Widget fuer Lerngruppen
// Schwebt rechts unten auf der Schatzkarte

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { SchatzkartAction } from '../../types';

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string | null;
  text: string;
  type: 'text' | 'system' | 'emoji';
  createdAt: string;
}

export interface ChatMember {
  userId: string;
  name: string;
  role: 'coach' | 'kind';
}

export interface ChatGroupInfo {
  groupId: string;
  groupName: string;
}

export interface ChatData {
  groupId: string;
  groupName: string;
  userId: string;
  userName: string;
  userRole: 'coach' | 'kind';
  initialMessages: ChatMessage[];
  members: ChatMember[];
  unreadCount: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  allGroups?: ChatGroupInfo[];
}

interface FloatingChatWidgetProps {
  chatData: ChatData;
  onAction: (action: SchatzkartAction) => void;
}

// ============================================
// CONSTANTS
// ============================================

const QUICK_EMOJIS = ['👍', '❤️', '😊', '🎉', '💪', '🤔', '👋', '⭐', '🔥', '😂'];
const MAX_MSG_LENGTH = 500;
const MESSAGES_PER_PAGE = 50;

// Notification sound (short, gentle chime as base64 - tiny WAV)
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRlQGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAGAAAAAAoAFAAeACgAMgA8AEYAUABaAGQAbgB4AIIAjACWAKAAqgC0AL4AyADSANwA5gDwAPoABAEOARgBIgEsATYBQAFKAVQBXgFoAXIBfAGGAZABmgGkAa4BuAHCAdIB3AHmAfAB+gEEAg4CGAIiAiwCNgJAAkoC';

// ============================================
// COMPONENT
// ============================================

export default function FloatingChatWidget({ chatData, onAction }: FloatingChatWidgetProps) {
  const {
    userId, userName, userRole,
    initialMessages, members: initialMembers, unreadCount: initialUnread,
    supabaseUrl, supabaseAnonKey, allGroups
  } = chatData;

  // Aktive Gruppe (wechselbar fuer Coaches)
  const [activeGroupId, setActiveGroupId] = useState(chatData.groupId);
  const [activeGroupName, setActiveGroupName] = useState(chatData.groupName);
  const [members, setMembers] = useState<ChatMember[]>(initialMembers);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [dmTarget, setDmTarget] = useState<ChatMember | null>(null);
  const [showMemberList, setShowMemberList] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Groesse + Position
  const SIZE_SMALL = { w: 380, h: 520 };
  const SIZE_LARGE = { w: 600, h: 700 };
  const SIZE_MIN = { w: 300, h: 350 };
  const SIZE_MAX = { w: 800, h: 900 };

  const [size, setSize] = useState(SIZE_SMALL);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number } | null>(null);
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; w: number; h: number; posX: number; posY: number } | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const channelRef = useRef<any>(null);
  const supabaseRef = useRef<any>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Supabase Client einmalig erstellen
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = createClient(supabaseUrl, supabaseAnonKey);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  // Drag-Handlers (Verschieben am Header)
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentPos = position || {
      x: window.innerWidth - size.w - 24,
      y: window.innerHeight - size.h - 24
    };

    dragStartRef.current = {
      mouseX: clientX, mouseY: clientY,
      posX: currentPos.x, posY: currentPos.y,
    };
    setIsDragging(true);
  }, [position, size]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newX = Math.max(0, Math.min(window.innerWidth - size.w,
        dragStartRef.current.posX + clientX - dragStartRef.current.mouseX));
      const newY = Math.max(0, Math.min(window.innerHeight - size.h,
        dragStartRef.current.posY + clientY - dragStartRef.current.mouseY));

      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => { setIsDragging(false); dragStartRef.current = null; };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, size]);

  // Resize-Handlers (Ziehen an der Ecke oben-links)
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const currentPos = position || {
      x: window.innerWidth - size.w - 24,
      y: window.innerHeight - size.h - 24
    };

    resizeStartRef.current = {
      mouseX: clientX, mouseY: clientY,
      w: size.w, h: size.h,
      posX: currentPos.x, posY: currentPos.y,
    };
    setIsResizing(true);
  }, [position, size]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!resizeStartRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // Ecke oben-links: Maus nach links = breiter, nach oben = hoeher
      const dx = resizeStartRef.current.mouseX - clientX;
      const dy = resizeStartRef.current.mouseY - clientY;

      const newW = Math.max(SIZE_MIN.w, Math.min(SIZE_MAX.w, resizeStartRef.current.w + dx));
      const newH = Math.max(SIZE_MIN.h, Math.min(SIZE_MAX.h, resizeStartRef.current.h + dy));

      // Position anpassen damit die rechte-untere Ecke stabil bleibt
      const newX = resizeStartRef.current.posX - (newW - resizeStartRef.current.w);
      const newY = resizeStartRef.current.posY - (newH - resizeStartRef.current.h);

      setSize({ w: newW, h: newH });
      setPosition({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      });
    };

    const handleEnd = () => { setIsResizing(false); resizeStartRef.current = null; };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing]);

  // Toggle zwischen klein und gross
  const toggleExpand = useCallback(() => {
    setSize(prev => prev.w === SIZE_SMALL.w ? SIZE_LARGE : SIZE_SMALL);
    setPosition(null);
  }, []);

  // Gruppen-Wechsel: Nachrichten + Mitglieder von Supabase laden
  const switchGroup = useCallback(async (groupId: string, groupName: string) => {
    if (groupId === activeGroupId) {
      setShowGroupPicker(false);
      return;
    }
    setLoadingGroup(true);
    setShowGroupPicker(false);
    setDmTarget(null);
    setShowMemberList(false);

    try {
      const sb = supabaseRef.current;
      if (!sb) return;

      // Nachrichten laden (nur nicht-geloeschte, neueste 50)
      const { data: msgData } = await sb
        .from('group_messages')
        .select('id, group_id, sender_id, sender_name, recipient_id, message_text, message_type, created_at')
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      const newMessages: ChatMessage[] = (msgData || [])
        .reverse()
        .filter((m: any) => {
          // Gruppen-Nachrichten + eigene DMs
          if (!m.recipient_id) return true;
          return m.recipient_id === userId || m.sender_id === userId;
        })
        .map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          recipientId: m.recipient_id,
          text: m.message_text,
          type: m.message_type || 'text',
          createdAt: m.created_at,
        }));

      // Mitglieder laden (group_members + users join)
      const { data: memberData } = await sb
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .eq('status', 'active');

      const newMembers: ChatMember[] = [];
      for (const gm of (memberData || [])) {
        const { data: userData } = await sb
          .from('users')
          .select('display_name, role')
          .eq('user_id', gm.user_id)
          .single();
        newMembers.push({
          userId: gm.user_id,
          name: userData?.display_name || 'Unbekannt',
          role: userData?.role === 'coach' ? 'coach' : 'kind',
        });
      }

      // Coach hinzufuegen falls nicht in members
      if (userRole === 'coach' && !newMembers.some(m => m.userId === userId)) {
        newMembers.push({ userId, name: userName, role: 'coach' });
      }

      setMessages(newMessages);
      setMembers(newMembers);
      setActiveGroupId(groupId);
      setActiveGroupName(groupName);
      setUnreadCount(0);
    } catch (err) {
      console.warn('Fehler beim Gruppen-Wechsel:', err);
    } finally {
      setLoadingGroup(false);
    }
  }, [activeGroupId, userId, userName, userRole]);

  // Audio initialisieren
  useEffect(() => {
    try {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      audioRef.current.volume = 0.3;
    } catch (e) {
      // Audio nicht verfuegbar (z.B. auf manchen Mobile-Geraeten)
    }
  }, []);

  // Supabase Realtime Subscription (re-subscribes bei Gruppen-Wechsel)
  useEffect(() => {
    if (!supabaseRef.current || !activeGroupId) return;

    // Alte Subscription aufraumen
    if (channelRef.current) {
      try { channelRef.current.unsubscribe(); } catch (e) {}
    }

    const sb = supabaseRef.current;
    const channel = sb
      .channel(`chat-${activeGroupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${activeGroupId}`
        },
        (payload: any) => {
          const newMsg: ChatMessage = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            senderName: payload.new.sender_name,
            recipientId: payload.new.recipient_id,
            text: payload.new.message_text,
            type: payload.new.message_type || 'text',
            createdAt: payload.new.created_at
          };

          // DM-Filterung: Nur anzeigen wenn fuer mich relevant
          if (newMsg.recipientId) {
            if (newMsg.recipientId !== userId && newMsg.senderId !== userId) {
              return;
            }
          }

          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Notification Sound + Unread Badge
          if (newMsg.senderId !== userId) {
            if (soundEnabled && audioRef.current) {
              audioRef.current.play().catch(() => {});
            }
            if (!isOpen) {
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${activeGroupId}`
        },
        (payload: any) => {
          if (payload.new.is_deleted) {
            setMessages(prev => prev.filter(m => m.id !== payload.new.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        try { channelRef.current.unsubscribe(); } catch (e) {}
      }
    };
  }, [activeGroupId, userId]);

  // Auto-Scroll bei neuen Nachrichten
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Ungelesen zuruecksetzen wenn Chat geoeffnet wird
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      onAction({
        action: 'chat_seen' as any,
        groupId: activeGroupId
      });
    }
  }, [isOpen]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || sendingMessage) return;

    setSendingMessage(true);

    // Optimistic Update: Nachricht sofort anzeigen
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      recipientId: dmTarget?.userId || null,
      text,
      type: 'text',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputText('');
    setShowEmojis(false);

    // An Python senden (schreibt in DB → Realtime Event)
    if (dmTarget) {
      onAction({
        action: 'message_send_dm' as any,
        messageText: text,
        groupId: activeGroupId,
        recipientId: dmTarget.userId
      } as any);
    } else {
      onAction({
        action: 'message_send' as any,
        messageText: text,
        groupId: activeGroupId
      } as any);
    }

    setTimeout(() => setSendingMessage(false), 500);
    inputRef.current?.focus();
  }, [inputText, userId, userName, dmTarget, activeGroupId, onAction, sendingMessage]);

  const handleEmojiSend = useCallback((emoji: string) => {
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      recipientId: dmTarget?.userId || null,
      text: emoji,
      type: 'emoji',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setShowEmojis(false);

    if (dmTarget) {
      onAction({
        action: 'message_send_dm' as any,
        messageText: emoji,
        groupId: activeGroupId,
        recipientId: dmTarget.userId
      } as any);
    } else {
      onAction({
        action: 'message_send' as any,
        messageText: emoji,
        groupId: activeGroupId
      } as any);
    }
  }, [userId, userName, dmTarget, activeGroupId, onAction]);

  const handleDelete = useCallback((messageId: string) => {
    // Optimistic: sofort entfernen
    setMessages(prev => prev.filter(m => m.id !== messageId));
    onAction({
      action: 'message_delete' as any,
      messageId,
      groupId: activeGroupId
    } as any);
  }, [activeGroupId, onAction]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Gefilterte Nachrichten (Gruppen-Chat oder DM)
  const filteredMessages = useMemo(() => {
    if (!dmTarget) {
      // Gruppen-Chat: nur Nachrichten ohne recipient
      return messages.filter(m => !m.recipientId);
    }
    // DM: nur Nachrichten zwischen mir und dmTarget
    return messages.filter(m =>
      m.recipientId && (
        (m.senderId === userId && m.recipientId === dmTarget.userId) ||
        (m.senderId === dmTarget.userId && m.recipientId === userId)
      )
    );
  }, [messages, dmTarget, userId]);

  // Andere Mitglieder (fuer DM-Auswahl, nicht ich selbst)
  const otherMembers = useMemo(() =>
    members.filter(m => m.userId !== userId),
    [members, userId]
  );

  // ============================================
  // RENDER: Minimized Button
  // ============================================

  if (!isOpen) {
    return (
      <div style={styles.fabContainer}>
        <button
          onClick={() => setIsOpen(true)}
          style={styles.fab}
          title="Nachrichten öffnen"
        >
          <span style={styles.fabIcon}>💬</span>
          {unreadCount > 0 && (
            <span style={styles.badge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // ============================================
  // RENDER: Chat Panel
  // ============================================

  return (
    <div
      ref={panelRef}
      style={{
        ...styles.panelContainer,
        width: `${size.w}px`,
        height: `${size.h}px`,
        ...(position ? {
          left: `${position.x}px`,
          top: `${position.y}px`,
          right: 'auto',
          bottom: 'auto',
        } : {}),
      }}
    >
      {/* Resize-Handle oben-links */}
      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
        style={styles.resizeHandle}
        title="Ziehen zum Vergrößern/Verkleinern"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: 0.6 }}>
          <line x1="0" y1="12" x2="12" y2="0" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="0" y1="7" x2="7" y2="0" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="0" y1="2" x2="2" y2="0" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Header (draggable) */}
      <div
        style={{
          ...styles.header,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none' as const,
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div style={styles.headerLeft}>
          {dmTarget ? (
            <button
              onClick={() => { setDmTarget(null); setShowMemberList(false); }}
              style={styles.backButton}
              title="Zurück zum Gruppen-Chat"
            >
              ←
            </button>
          ) : null}
          <div style={styles.headerInfo}>
            {dmTarget ? (
              <>
                <span style={styles.headerTitle}>💌 {dmTarget.name}</span>
                <span style={styles.headerSubtitle}>Direktnachricht</span>
              </>
            ) : (
              <button
                onClick={() => allGroups && allGroups.length > 1 ? setShowGroupPicker(!showGroupPicker) : null}
                style={{
                  ...styles.headerTitle,
                  background: 'none', border: 'none', padding: 0,
                  cursor: allGroups && allGroups.length > 1 ? 'pointer' : 'default',
                  textAlign: 'left' as const, display: 'block', width: '100%',
                }}
                title={allGroups && allGroups.length > 1 ? 'Gruppe wechseln' : undefined}
              >
                💬 {activeGroupName}
                {allGroups && allGroups.length > 1 && (
                  <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>
                    {showGroupPicker ? '▲' : '▼'}
                  </span>
                )}
              </button>
            )}
            {!dmTarget && (
              <span style={styles.headerSubtitle}>
                {loadingGroup ? 'Lade...' : `${members.length} Mitglieder`}
              </span>
            )}
          </div>
        </div>
        <div style={styles.headerActions}>
          {/* DM-Button */}
          {otherMembers.length > 0 && !dmTarget && (
            <button
              onClick={() => setShowMemberList(!showMemberList)}
              style={styles.headerBtn}
              title="Direktnachricht senden"
            >
              ✉️
            </button>
          )}
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={styles.headerBtn}
            title={soundEnabled ? 'Ton aus' : 'Ton an'}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>
          {/* Groesser/Kleiner */}
          <button
            onClick={toggleExpand}
            style={styles.headerBtn}
            title={size.w > SIZE_SMALL.w ? 'Verkleinern' : 'Vergrößern'}
          >
            {size.w > SIZE_SMALL.w ? '⊖' : '⊕'}
          </button>
          {/* Minimieren */}
          <button
            onClick={() => setIsOpen(false)}
            style={styles.closeBtn}
            title="Chat minimieren"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Gruppen-Wechsler Dropdown */}
      {showGroupPicker && allGroups && allGroups.length > 1 && (
        <div style={styles.memberList}>
          <div style={styles.memberListTitle}>Gruppe wechseln:</div>
          {allGroups.map(g => (
            <button
              key={g.groupId}
              onClick={() => switchGroup(g.groupId, g.groupName)}
              style={{
                ...styles.memberItem,
                background: g.groupId === activeGroupId ? 'rgba(79,70,229,0.2)' : 'transparent',
                fontWeight: g.groupId === activeGroupId ? '600' : '400',
              }}
            >
              <span style={styles.memberIcon}>
                {g.groupId === activeGroupId ? '✅' : '👥'}
              </span>
              <span>{g.groupName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Member List Dropdown (fuer DMs) */}
      {showMemberList && (
        <div style={styles.memberList}>
          <div style={styles.memberListTitle}>Direktnachricht an:</div>
          {otherMembers.map(member => (
            <button
              key={member.userId}
              onClick={() => {
                setDmTarget(member);
                setShowMemberList(false);
              }}
              style={styles.memberItem}
            >
              <span style={styles.memberIcon}>
                {member.role === 'coach' ? '👩‍🏫' : '🧑‍🎓'}
              </span>
              <span>{member.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {filteredMessages.length === 0 && (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>
              {dmTarget ? '✉️' : '🏝️'}
            </span>
            <span style={styles.emptyText}>
              {dmTarget
                ? `Schreibe ${dmTarget.name} eine Nachricht!`
                : 'Noch keine Nachrichten. Schreib die erste!'}
            </span>
          </div>
        )}

        {filteredMessages.map((msg, i) => {
          const isOwn = msg.senderId === userId;
          const isSystem = msg.type === 'system';
          const showName = !isOwn && !isSystem &&
            (i === 0 || filteredMessages[i - 1]?.senderId !== msg.senderId);

          if (isSystem) {
            return (
              <div key={msg.id} style={styles.systemMsg}>
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{
                ...styles.msgRow,
                justifyContent: isOwn ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                ...styles.msgBubble,
                ...(isOwn ? styles.msgOwn : styles.msgOther),
                ...(msg.type === 'emoji' ? styles.msgEmoji : {})
              }}>
                {showName && (
                  <div style={styles.msgSender}>{msg.senderName}</div>
                )}
                <div style={styles.msgText}>{msg.text}</div>
                <div style={styles.msgMeta}>
                  <span style={styles.msgTime}>
                    {formatTime(msg.createdAt)}
                  </span>
                  {msg.recipientId && (
                    <span style={styles.dmBadge}>DM</span>
                  )}
                  {/* Coach kann loeschen */}
                  {userRole === 'coach' && !isOwn && !msg.id.startsWith('temp-') && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      style={styles.deleteBtn}
                      title="Nachricht löschen"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Quick-Bar */}
      {showEmojis && (
        <div style={styles.emojiBar}>
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleEmojiSend(emoji)}
              style={styles.emojiBtn}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={styles.inputContainer}>
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          style={styles.emojiToggle}
          title="Emojis"
        >
          😊
        </button>
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={e => setInputText(e.target.value.slice(0, MAX_MSG_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={
            dmTarget
              ? `Nachricht an ${dmTarget.name}...`
              : 'Nachricht an die Gruppe...'
          }
          style={styles.input}
          rows={1}
          maxLength={MAX_MSG_LENGTH}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || sendingMessage}
          style={{
            ...styles.sendBtn,
            opacity: inputText.trim() ? 1 : 0.4
          }}
          title="Senden"
        >
          📨
        </button>
      </div>

      {/* Char counter */}
      {inputText.length > MAX_MSG_LENGTH * 0.8 && (
        <div style={styles.charCount}>
          {inputText.length}/{MAX_MSG_LENGTH}
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER
// ============================================

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Gestern ${date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

// ============================================
// STYLES
// ============================================

const COLORS = {
  primary: '#4f46e5',       // Indigo (contrast to gold map)
  primaryLight: '#818cf8',
  primaryDark: '#3730a3',
  gold: '#f59e0b',
  goldDark: '#b45309',
  bg: '#1e1b2e',            // Dark fantasy
  bgPanel: '#252238',
  bgMsg: '#2d2a40',
  bgOwn: '#4f46e5',
  text: '#e2e0f0',
  textMuted: '#9895b0',
  textDark: '#1e1b2e',
  border: '#3d3856',
  danger: '#ef4444',
  success: '#22c55e',
  dm: '#8b5cf6',
};

const styles: Record<string, React.CSSProperties> = {
  // FAB (Floating Action Button)
  fabContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 10000,
  },
  fab: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    border: `2px solid ${COLORS.primaryLight}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 20px rgba(79, 70, 229, 0.4), 0 0 40px rgba(79, 70, 229, 0.15)`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative' as const,
  },
  fabIcon: {
    fontSize: '28px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  badge: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    background: COLORS.danger,
    color: '#fff',
    borderRadius: '12px',
    padding: '2px 7px',
    fontSize: '12px',
    fontWeight: '700',
    minWidth: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)',
    border: `2px solid ${COLORS.bg}`,
  },

  // Panel
  panelContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '380px',
    maxWidth: 'calc(100vw - 32px)',
    height: '520px',
    maxHeight: 'calc(100vh - 48px)',
    background: COLORS.bgPanel,
    borderRadius: '16px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5), 0 0 80px rgba(79, 70, 229, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    zIndex: 10000,
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  // Resize Handle (oben-links)
  resizeHandle: {
    position: 'absolute' as const,
    top: '0',
    left: '0',
    width: '20px',
    height: '20px',
    cursor: 'nw-resize',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.textMuted,
    zIndex: 2,
    borderTopLeftRadius: '16px',
    padding: '3px',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    borderBottom: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  headerBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'rgba(255,255,255,0.8)',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s',
  },

  // Member List
  memberList: {
    background: COLORS.bg,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '8px',
    maxHeight: '160px',
    overflowY: 'auto' as const,
    flexShrink: 0,
  },
  memberListTitle: {
    color: COLORS.textMuted,
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    padding: '4px 8px',
    marginBottom: '4px',
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: COLORS.text,
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.15s',
  },
  memberIcon: {
    fontSize: '18px',
  },

  // Messages
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    scrollBehavior: 'smooth' as const,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '12px',
    padding: '32px',
  },
  emptyIcon: {
    fontSize: '48px',
    opacity: 0.6,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: '14px',
    textAlign: 'center' as const,
  },

  // Message Rows
  msgRow: {
    display: 'flex',
    padding: '2px 0',
  },
  msgBubble: {
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: '12px',
    position: 'relative' as const,
  },
  msgOwn: {
    background: COLORS.bgOwn,
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  msgOther: {
    background: COLORS.bgMsg,
    color: COLORS.text,
    borderBottomLeftRadius: '4px',
  },
  msgEmoji: {
    background: 'transparent',
    padding: '4px 8px',
    fontSize: '32px',
  },
  msgSender: {
    color: COLORS.primaryLight,
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '2px',
  },
  msgText: {
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
  },
  msgMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px',
  },
  msgTime: {
    fontSize: '10px',
    opacity: 0.5,
  },
  dmBadge: {
    fontSize: '9px',
    background: COLORS.dm,
    color: '#fff',
    padding: '1px 5px',
    borderRadius: '4px',
    fontWeight: '600',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '0 2px',
    opacity: 0.5,
    transition: 'opacity 0.15s',
  },
  systemMsg: {
    textAlign: 'center' as const,
    color: COLORS.textMuted,
    fontSize: '12px',
    padding: '8px 16px',
    fontStyle: 'italic',
  },

  // Emoji Bar
  emojiBar: {
    display: 'flex',
    gap: '4px',
    padding: '8px 12px',
    background: COLORS.bg,
    borderTop: `1px solid ${COLORS.border}`,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    flexShrink: 0,
  },
  emojiBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '22px',
    padding: '6px 8px',
    transition: 'background 0.15s, transform 0.15s, border-color 0.15s',
  },

  // Input
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    padding: '10px 12px',
    background: COLORS.bg,
    borderTop: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  emojiToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '22px',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background 0.15s',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: COLORS.bgMsg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    color: COLORS.text,
    fontSize: '14px',
    padding: '8px 12px',
    resize: 'none' as const,
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.4',
    maxHeight: '80px',
    minHeight: '36px',
  },
  sendBtn: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '6px 12px',
    transition: 'opacity 0.15s, transform 0.15s',
    flexShrink: 0,
  },
  charCount: {
    textAlign: 'right' as const,
    fontSize: '10px',
    color: COLORS.textMuted,
    padding: '0 16px 4px',
    background: COLORS.bg,
    flexShrink: 0,
  },
};
