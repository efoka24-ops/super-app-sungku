import { Router } from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

// Get conversations for a user
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const messages = readCollection("messages.json", {});

  if (!messages[userId]) {
    // Initialize with some default conversations
    messages[userId] = {
      conversations: [
        {
          id: 1,
          name: "Marie Kamara",
          avatar: "MK",
          lastMessage: "Merci pour l'argent ! 🙏",
          time: "14:30",
          unread: 0,
          online: true,
          messages: [
            {
              id: 1,
              sender: "other",
              text: "Salut ! Comment vas-tu ?",
              time: "13:10",
            },
            {
              id: 2,
              sender: "me",
              text: "Ça va bien merci ! Et toi ?",
              time: "13:12",
            },
            {
              id: 3,
              sender: "other",
              text: "Merci pour l'argent ! 🙏",
              time: "14:30",
            },
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
            {
              id: 1,
              sender: "other",
              text: "Salut !",
              time: "13:10",
            },
            {
              id: 2,
              sender: "other",
              text: "Tu peux m'envoyer 5000 ?",
              time: "13:15",
            },
            {
              id: 3,
              sender: "other",
              text: "J'ai besoin pour le transport",
              time: "13:15",
            },
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
            {
              id: 1,
              sender: "me",
              text: "Tu es libre demain ?",
              time: "15:30",
            },
            {
              id: 2,
              sender: "other",
              text: "D'accord, à demain",
              time: "Hier",
            },
          ],
        },
      ],
    };
    writeCollection("messages.json", messages);
  }

  return res.json({
    success: true,
    conversations: messages[userId].conversations || [],
  });
});

// Get messages for a conversation
router.get("/:userId/:conversationId", (req, res) => {
  const { userId, conversationId } = req.params;
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
router.post("/:userId/:conversationId/send", (req, res) => {
  const { userId, conversationId } = req.params;
  const { text } = req.body || {};

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Message text required",
    });
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
    text: text,
    time: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
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
