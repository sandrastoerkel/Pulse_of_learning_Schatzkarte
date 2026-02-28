# -*- coding: utf-8 -*-
"""
📨 Nachrichten-Datenbankmodul
==============================
Verwaltet Gruppen-Nachrichten und Direktnachrichten fuer die Schatzkarte.

Verwendung:
    from utils.nachrichten_db import (
        get_group_messages, send_message, send_direct_message,
        delete_message, get_unread_count, update_last_seen
    )
"""

from datetime import datetime
from typing import Dict, List, Optional, Any

from utils.database import get_db


# ============================================
# KONFIGURATION
# ============================================

MAX_MESSAGE_LENGTH = 500
MESSAGES_PER_PAGE = 50


# ============================================
# NACHRICHTEN LESEN
# ============================================

def get_group_messages(
    group_id: str,
    user_id: str,
    limit: int = MESSAGES_PER_PAGE,
    include_dms: bool = True
) -> List[Dict[str, Any]]:
    """Holt Nachrichten fuer eine Gruppe (Gruppen-Chat + eigene DMs).

    Args:
        group_id: Gruppen-ID
        user_id: Aktueller User (fuer DM-Filterung)
        limit: Max. Anzahl Nachrichten
        include_dms: Auch Direktnachrichten einbeziehen

    Returns:
        Liste von Nachrichten, aelteste zuerst
    """
    db = get_db()

    # Gruppen-Nachrichten (recipient_id IS NULL) + eigene DMs
    # Supabase-py unterstuetzt kein OR mit IS NULL direkt,
    # daher holen wir beides separat und mergen.

    # 1. Gruppen-Nachrichten
    group_result = db.table("group_messages") \
        .select("id, group_id, sender_id, sender_name, recipient_id, "
                "message_text, message_type, is_deleted, created_at") \
        .eq("group_id", group_id) \
        .is_("recipient_id", "null") \
        .eq("is_deleted", False) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()

    messages = group_result.data or []

    # 2. Direktnachrichten (an mich oder von mir)
    if include_dms:
        # DMs an mich
        dm_to_me = db.table("group_messages") \
            .select("id, group_id, sender_id, sender_name, recipient_id, "
                    "message_text, message_type, is_deleted, created_at") \
            .eq("group_id", group_id) \
            .eq("recipient_id", user_id) \
            .eq("is_deleted", False) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()

        # DMs von mir
        dm_from_me = db.table("group_messages") \
            .select("id, group_id, sender_id, sender_name, recipient_id, "
                    "message_text, message_type, is_deleted, created_at") \
            .eq("group_id", group_id) \
            .eq("sender_id", user_id) \
            .neq("recipient_id", "null") \
            .eq("is_deleted", False) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()

        messages += (dm_to_me.data or [])
        messages += (dm_from_me.data or [])

    # Sortieren (aelteste zuerst) und Limit
    messages.sort(key=lambda m: m.get("created_at", ""))
    return messages[-limit:]


def get_direct_messages(
    group_id: str,
    user_id: str,
    other_user_id: str,
    limit: int = MESSAGES_PER_PAGE
) -> List[Dict[str, Any]]:
    """Holt DMs zwischen zwei Usern innerhalb einer Gruppe."""
    db = get_db()

    # Nachrichten von user_id an other_user_id
    sent = db.table("group_messages") \
        .select("*") \
        .eq("group_id", group_id) \
        .eq("sender_id", user_id) \
        .eq("recipient_id", other_user_id) \
        .eq("is_deleted", False) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()

    # Nachrichten von other_user_id an user_id
    received = db.table("group_messages") \
        .select("*") \
        .eq("group_id", group_id) \
        .eq("sender_id", other_user_id) \
        .eq("recipient_id", user_id) \
        .eq("is_deleted", False) \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()

    messages = (sent.data or []) + (received.data or [])
    messages.sort(key=lambda m: m.get("created_at", ""))
    return messages[-limit:]


# ============================================
# NACHRICHTEN SENDEN
# ============================================

def send_message(
    group_id: str,
    sender_id: str,
    sender_name: str,
    text: str,
    message_type: str = "text"
) -> Optional[Dict[str, Any]]:
    """Sendet eine Gruppen-Nachricht.

    Args:
        group_id: Gruppen-ID
        sender_id: User-ID des Absenders
        sender_name: Anzeigename des Absenders
        text: Nachrichtentext (max 500 Zeichen)
        message_type: 'text', 'system' oder 'emoji'

    Returns:
        Die erstellte Nachricht oder None bei Fehler
    """
    # Validierung
    text = text.strip()
    if not text or len(text) > MAX_MESSAGE_LENGTH:
        return None

    if message_type not in ("text", "system", "emoji"):
        message_type = "text"

    try:
        result = get_db().table("group_messages").insert({
            "group_id": group_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "recipient_id": None,  # Gruppen-Nachricht
            "message_text": text,
            "message_type": message_type
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error sending message: {e}")
        return None


def send_direct_message(
    group_id: str,
    sender_id: str,
    sender_name: str,
    recipient_id: str,
    text: str
) -> Optional[Dict[str, Any]]:
    """Sendet eine Direktnachricht innerhalb einer Gruppe."""
    text = text.strip()
    if not text or len(text) > MAX_MESSAGE_LENGTH:
        return None

    try:
        result = get_db().table("group_messages").insert({
            "group_id": group_id,
            "sender_id": sender_id,
            "sender_name": sender_name,
            "recipient_id": recipient_id,
            "message_text": text,
            "message_type": "text"
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error sending DM: {e}")
        return None


def send_system_message(group_id: str, text: str) -> Optional[Dict[str, Any]]:
    """Sendet eine System-Nachricht (z.B. 'Max ist der Gruppe beigetreten')."""
    try:
        result = get_db().table("group_messages").insert({
            "group_id": group_id,
            "sender_id": "system",
            "sender_name": "System",
            "recipient_id": None,
            "message_text": text,
            "message_type": "system"
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error sending system message: {e}")
        return None


# ============================================
# NACHRICHTEN MODERIEREN (Coach)
# ============================================

def delete_message(message_id: str, deleted_by: str) -> bool:
    """Soft-Delete einer Nachricht (nur Coach/Admin)."""
    try:
        result = get_db().table("group_messages") \
            .update({
                "is_deleted": True,
                "deleted_by": deleted_by
            }) \
            .eq("id", message_id) \
            .execute()
        return len(result.data) > 0
    except Exception as e:
        print(f"Error deleting message: {e}")
        return False


# ============================================
# UNGELESEN-BADGE
# ============================================

def get_unread_count(group_id: str, user_id: str) -> int:
    """Zaehlt ungelesene Nachrichten seit last_seen_chat."""
    db = get_db()

    # last_seen_chat aus group_members holen
    member = db.table("group_members") \
        .select("last_seen_chat") \
        .eq("group_id", group_id) \
        .eq("user_id", user_id) \
        .execute()

    last_seen = None
    if member.data and member.data[0].get("last_seen_chat"):
        last_seen = member.data[0]["last_seen_chat"]

    # Nachrichten zaehlen die neuer sind als last_seen
    query = db.table("group_messages") \
        .select("id", count="exact") \
        .eq("group_id", group_id) \
        .eq("is_deleted", False) \
        .neq("sender_id", user_id)  # Eigene Nachrichten nicht zaehlen

    # Nur Gruppen-Nachrichten + DMs an mich
    # (Vereinfachung: zaehle alle nicht-eigenen)
    if last_seen:
        query = query.gt("created_at", last_seen)

    result = query.execute()
    return result.count or 0


def get_unread_count_for_coach(coach_id: str) -> Dict[str, int]:
    """Zaehlt ungelesene Nachrichten pro Gruppe fuer einen Coach."""
    db = get_db()

    # Alle Gruppen des Coaches
    groups = db.table("learning_groups") \
        .select("group_id") \
        .eq("coach_id", coach_id) \
        .eq("is_active", 1) \
        .execute()

    counts = {}
    for g in (groups.data or []):
        gid = g["group_id"]
        counts[gid] = get_unread_count(gid, coach_id)

    return counts


def update_last_seen(group_id: str, user_id: str) -> bool:
    """Aktualisiert den last_seen_chat Timestamp."""
    try:
        get_db().table("group_members") \
            .update({"last_seen_chat": datetime.now().isoformat()}) \
            .eq("group_id", group_id) \
            .eq("user_id", user_id) \
            .execute()
        return True
    except Exception as e:
        print(f"Error updating last_seen: {e}")
        return False


def update_last_seen_coach(group_id: str, coach_id: str) -> bool:
    """Aktualisiert last_seen fuer Coach (der nicht in group_members steht).
    Speichert in learning_groups.settings JSON."""
    try:
        db = get_db()
        group = db.table("learning_groups") \
            .select("settings") \
            .eq("group_id", group_id) \
            .execute()

        settings = {}
        if group.data and group.data[0].get("settings"):
            settings = group.data[0]["settings"]
            if isinstance(settings, str):
                import json
                settings = json.loads(settings)

        settings["coach_last_seen_chat"] = datetime.now().isoformat()

        db.table("learning_groups") \
            .update({"settings": settings}) \
            .eq("group_id", group_id) \
            .execute()
        return True
    except Exception as e:
        print(f"Error updating coach last_seen: {e}")
        return False


# ============================================
# CHAT-DATEN FUER REACT LADEN
# ============================================

def _load_group_chat(group: Dict, user_id: str, user_name: str) -> Dict[str, Any]:
    """Laedt Chat-Daten fuer eine einzelne Gruppe."""
    from utils.user_system import get_user_by_id
    from utils.lerngruppen_db import get_group_members

    group_id = group["group_id"]

    # Nachrichten laden
    messages = get_group_messages(group_id, user_id, limit=MESSAGES_PER_PAGE)

    # Mitglieder laden (fuer DM-Auswahl)
    members_raw = get_group_members(group_id)
    members = []
    for m in members_raw:
        members.append({
            "userId": m["user_id"],
            "name": m.get("display_name", "Unbekannt"),
            "role": "kind"
        })

    # Coach hinzufuegen falls nicht in members
    coach_id = group.get("coach_id")
    if coach_id:
        coach_in_members = any(m["userId"] == coach_id for m in members)
        if not coach_in_members:
            coach_user = get_user_by_id(coach_id)
            if coach_user:
                members.append({
                    "userId": coach_id,
                    "name": coach_user.get("display_name", "Coach"),
                    "role": "coach"
                })

    # Ungelesen-Zaehler
    unread = get_unread_count(group_id, user_id)

    # Nachrichten formatieren
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "id": msg["id"],
            "senderId": msg["sender_id"],
            "senderName": msg["sender_name"],
            "recipientId": msg.get("recipient_id"),
            "text": msg["message_text"],
            "type": msg.get("message_type", "text"),
            "createdAt": msg["created_at"]
        })

    return {
        "groupId": group_id,
        "groupName": group.get("name", "Meine Gruppe"),
        "initialMessages": formatted_messages,
        "members": members,
        "unreadCount": unread,
    }


def load_chat_data(user_id: str) -> Optional[Dict[str, Any]]:
    """Laedt alle Chat-Daten fuer die React-Komponente.

    Returns:
        Dict mit groupId, groupName, userId, userName, userRole,
        initialMessages, members, unreadCount, supabaseUrl, supabaseAnonKey,
        allGroups (fuer Coaches mit mehreren Gruppen)
        oder None wenn User in keiner Gruppe ist.
    """
    import streamlit as st
    from utils.user_system import is_coach, get_user_by_id
    from utils.lerngruppen_db import get_user_group, get_coach_groups

    # Gruppe(n) finden
    all_groups = []
    user_role = "kind"

    if is_coach(user_id):
        user_role = "coach"
        all_groups = get_coach_groups(user_id) or []
    else:
        group = get_user_group(user_id)
        if group:
            all_groups = [group]

    if not all_groups:
        return None

    # User-Daten
    user = get_user_by_id(user_id)
    if not user:
        return None

    user_name = user.get("display_name", "Unbekannt")

    # Erste Gruppe als Standard laden
    primary = _load_group_chat(all_groups[0], user_id, user_name)

    # Alle Gruppen als Liste (fuer Gruppen-Wechsler)
    groups_list = []
    for g in all_groups:
        groups_list.append({
            "groupId": g["group_id"],
            "groupName": g.get("name", "Gruppe"),
        })

    return {
        **primary,
        "userId": user_id,
        "userName": user_name,
        "userRole": user_role,
        "allGroups": groups_list,
        "supabaseUrl": st.secrets["SUPABASE_URL"],
        "supabaseAnonKey": st.secrets["SUPABASE_KEY"]
    }
