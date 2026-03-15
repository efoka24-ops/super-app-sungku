
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useKowSyChat, useKowSyExpenses, useKowSySalary } from "./kowSyState";
import { askKoumAI } from "./koumAI";

export default function KowSyChat() {

  const navigate = useNavigate();
  const { messages, sendMessage } = useKowSyChat();
  const { expenses } = useKowSyExpenses();
  const { salary } = useKowSySalary();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setLoading(true);
    // Appel KoumAI (mock, à brancher backend)
    const userId = "demo-user";
    const history = messages.map(m => ({
      role: m.sender === "user" ? "user" as const : "assistant" as const,
      content: m.text
    }));
    const req = {
      userId,
      messages: [...history, { role: "user" as const, content: input }],
      context: {
        salary,
        expenses,
      },
    };
    const res = await askKoumAI(req);
    sendMessage(res.reply);
    setInput("");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-amber-500" />
        </button>
        <h1 className="text-xl font-bold text-amber-700">KowSy — Chat IA</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <MessageCircle className="w-16 h-16 text-amber-400 mb-4" />
        <div className="w-full max-w-xs flex-1 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 mb-2 text-center">Posez une question à KoumAI sur vos finances.</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((m, i) => (
                <li key={m.id + i} className={m.sender === "user" ? "text-right" : "text-left"}>
                  <span className={
                    m.sender === "user"
                      ? "inline-block bg-amber-100 text-amber-900 px-3 py-2 rounded-xl"
                      : "inline-block bg-emerald-100 text-emerald-900 px-3 py-2 rounded-xl"
                  }>
                    {m.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          className="flex gap-2 w-full max-w-xs"
          onSubmit={handleSend}
        >
          <input
            className="border rounded-xl px-4 py-2 flex-1"
            placeholder="Ex: Combien j’ai dépensé ce mois-ci ?"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "..." : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}
