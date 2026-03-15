import React from "react";
import { useNavigate } from "react-router";
import { Brain, PieChart, MessageCircle, ArrowRight } from "lucide-react";

export default function KowSyHome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Brain className="w-16 h-16 text-amber-400 mb-4" />
      <h1 className="text-2xl font-bold text-amber-700 mb-2">KowSy</h1>
      <p className="text-gray-500 mb-6 text-center max-w-xs">
        Ton coach financier personnel : suis tes dépenses, pose des questions à l’IA, et progresse vers tes objectifs !
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 justify-center"
          onClick={() => navigate("/miniapps/kowsy/dashboard")}
        >
          <PieChart className="w-5 h-5" />
          Tableau de bord
        </button>
        <button
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 justify-center"
          onClick={() => navigate("/miniapps/kowsy/expenses")}
        >
          <PieChart className="w-5 h-5" />
          Suivi des dépenses
        </button>
        <button
          className="bg-white border border-amber-400 text-amber-700 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 flex items-center gap-2 justify-center"
          onClick={() => navigate("/miniapps/kowsy/chat")}
        >
          <MessageCircle className="w-5 h-5" />
          Chat IA
        </button>
      </div>
    </div>
  );
}
