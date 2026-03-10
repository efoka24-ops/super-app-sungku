import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

function defaultConversations() {
  return [
    {
      id: 1,
      name: "Marie Kamara",
      avatar: "MK",
      lastMessage: "Merci pour l'argent ! 🙏",
      time: "14:30",
      unread: 0,
      online: true,
      messages: [
        { id: 1, sender: "other", text: "Salut ! Comment vas-tu ?", time: "13:10" },
        { id: 2, sender: "me", text: "Ça va bien merci ! Et toi ?", time: "13:12" },
        { id: 3, sender: "other", text: "Merci pour l'argent ! 🙏", time: "14:30" },
      ],
    },
    {
      id: 2,
      name: "Jean Diallo",
      avatar: "JD",
      lastMessage: "Tu peux m'envoyer 5000 ?",
      time: "13:15",
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: "other", text: "Salut !", time: "13:10" },
        { id: 2, sender: "other", text: "Tu peux m'envoyer 5000 ?", time: "13:15" },
        { id: 3, sender: "other", text: "J'ai besoin pour le transport", time: "13:15" },
      ],
    },
    {
      id: 3,
      name: "Fatou Sy",
      avatar: "FS",
      lastMessage: "D'accord, à demain",
      time: "Hier",
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: "me", text: "Tu es libre demain ?", time: "15:30" },
        { id: 2, sender: "other", text: "D'accord, à demain", time: "Hier" },
      ],
    },
  ];
}

function ensureUserMessages(userId) {
  const store = readCollection("messages.json", {});
  if (!store[userId]) {
    store[userId] = { conversations: defaultConversations() };
    writeCollection("messages.json", store);
  }
  return store;
}

// Get conversations for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (db) {
    const { data, error } = await db
      .from("conversations")
      .select("id,name,avatar,last_message,last_time,unread,online")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const conversations = data.map((c) => ({
        id: Number(c.id),
        name: c.name,
        avatar: c.avatar,
        lastMessage: c.last_message || "",
        time: c.last_time || "",
        unread: c.unread || 0,
        online: Boolean(c.online),
      }));
      return res.json({ success: true, conversations });
    }
  }

  const messages = ensureUserMessages(userId);

  return res.json({
    success: true,
    conversations: messages[userId].conversations || [],
  });
});

// Get messages for a conversation
router.get("/:userId/:conversationId", async (req, res) => {
  const { userId, conversationId } = req.params;

  if (db) {
    const { data: conv } = await db
      .from("conversations")
      .select("id,name,avatar,online")
      .eq("user_id", userId)
      .eq("id", conversationId)
      .maybeSingle();

    if (conv) {
      const { data: rows } = await db
        .from("messages")
        .select("id,sender,text,time")
        .eq("user_id", userId)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      return res.json({
        success: true,
        conversation: {
          id: Number(conv.id),
          name: conv.name,
          avatar: conv.avatar,
          online: Boolean(conv.online),
          messages: (rows || []).map((m) => ({ id: m.id, sender: m.sender, text: m.text, time: m.time })),
        },
      });
    }
  }

  const messages = readCollection("messages.json", {});

  if (!messages[userId]) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const conversation = messages[userId].conversations.find(
    (c) => c.id === parseInt(conversationId)
  );

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  return res.json({
    success: true,
    conversation: {
      id: conversation.id,
      name: conversation.name,
      avatar: conversation.avatar,
      online: conversation.online,
      messages: conversation.messages || [],
    },
  });
});

// Send message
router.post("/:userId/:conversationId/send", async (req, res) => {
  const { userId, conversationId } = req.params;
  const { text } = req.body || {};

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Message text required",
    });
  }

  const now = nowIso();
  const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  if (db) {
    const { data: conv } = await db
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("id", conversationId)
      .maybeSingle();

    if (conv) {
      const messageId = `msg_${Date.now()}`;
      await db.from("messages").insert({
        id: messageId,
        user_id: userId,
        conversation_id: conversationId,
        sender: "me",
        text,
        time,
        created_at: now,
      }).catch(() => {});

      await db.from("conversations").update({ last_message: text, last_time: "A l'instant", updated_at: now }).eq("user_id", userId).eq("id", conversationId).catch(() => {});

      return res.json({
        success: true,
        message: { id: messageId, sender: "me", text, time },
      });
    }
  }

  const messages = readCollection("messages.json", {});

  if (!messages[userId]) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const conversation = messages[userId].conversations.find(
    (c) => c.id === parseInt(conversationId)
  );

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Add message to conversation
  const newMessage = {
    id: (conversation.messages?.length || 0) + 1,
    sender: "me",
    text,
    time,
  };

  if (!conversation.messages) {
    conversation.messages = [];
  }

  conversation.messages.push(newMessage);
  conversation.lastMessage = text;
  conversation.time = "A l'instant";

  writeCollection("messages.json", messages);

  return res.json({
    success: true,
    message: newMessage,
  });
});

export default router;
