import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, Send, DollarSign, Plus, Phone, Video, MoreVertical } from "lucide-react";

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user and conversations
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);

      // Fetch conversations
      const fetchConversations = async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/messages/${parsed.userId}`
          );
          const data = await response.json();
          if (data.success) {
            setConversations(data.conversations);
          }
        } catch (error) {
          console.error("Error fetching conversations:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchConversations();
    }
  }, []);

  const handleSelectChat = async (conversationId: number) => {
    setSelectedChat(conversationId);

    // Fetch messages for this conversation
    if (user) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/messages/${user.userId}/${conversationId}`
        );
        const data = await response.json();
        if (data.success) {
          setChatMessages(data.conversation.messages || []);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/messages/${user.userId}/${selectedChat}/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Update messages
        setChatMessages([...chatMessages, data.message]);
        setMessage("");

        // Update conversation last message
        setConversations(
          conversations.map((conv) =>
            conv.id === selectedChat
              ? {
                  ...conv,
                  lastMessage: message,
                  time: "A l'instant",
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (selectedChat) {
    const contact = conversations.find((c) => c.id === selectedChat);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        {/* Chat Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)} className="text-gray-600">
                ←
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-sm">{contact?.avatar}</span>
                </div>
                {contact?.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{contact?.name}</h2>
                <p className="text-xs text-gray-500">{contact?.online ? "En ligne" : "Hors ligne"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender === "me"
                    ? "bg-emerald-500 text-white rounded-br-sm"
                    : "bg-white text-gray-900 rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === "me" ? "text-emerald-100" : "text-gray-400"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {/* Quick Payment Action */}
          <div className="flex justify-center">
            <button className="bg-white border-2 border-emerald-500 text-emerald-500 rounded-full px-6 py-3 flex items-center gap-2 font-medium text-sm hover:bg-emerald-50 transition-colors">
              <DollarSign className="w-5 h-5" />
              Envoyer de l'argent
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Plus className="w-6 h-6 text-gray-600" />
            </button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez un message..."
              className="flex-1 h-12 bg-gray-100 border-0 rounded-full"
            />
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher une conversation..."
            className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="px-6 mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement des conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune conversation pour le moment
            </div>
          ) : (
            conversations.map((conv, index) => (
              <button
                key={conv.id}
                onClick={() => handleSelectChat(conv.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                  index !== conversations.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold">{conv.avatar}</span>
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{conv.name}</h3>
                    <span className="text-xs text-gray-400">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate pr-2">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="min-w-[20px] h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center px-2">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors">
        <Plus className="w-6 h-6 text-white" />
      </button>

      <BottomNav />
    </div>
  );
}
