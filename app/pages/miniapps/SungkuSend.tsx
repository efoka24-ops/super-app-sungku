import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, Building2, Smartphone, Users, Clock, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion } from "motion/react";

const transferMethods = [
  {
    id: "mobile-money",
    icon: Smartphone,
    title: "Mobile Money",
    description: "Orange, MTN, Moov",
    color: "bg-amber-500",
    popular: true,
  },
  {
    id: "bank",
    icon: Building2,
    title: "Compte Bancaire",
    description: "Tous les réseaux",
    color: "bg-blue-500",
    popular: false,
  },
  {
    id: "sungku-user",
    icon: Users,
    title: "Utilisateur Sungku",
    description: "Transfert instantané",
    color: "bg-emerald-500",
    popular: true,
  },
];

const recentTransfers = [
  { name: "Emmanuel K.", phone: "+225 07 XX XX 45 67", avatar: "EK", method: "Mobile Money" },
  { name: "Marie A.", phone: "+225 05 XX XX 23 89", avatar: "MA", method: "Sungku" },
  { name: "Jean-Paul D.", phone: "+225 07 XX XX 12 34", avatar: "JP", method: "Mobile Money" },
];

const stats = [
  { label: "Transactions", value: "1,234", icon: TrendingUp, color: "text-emerald-600" },
  { label: "Ce mois", value: "45", icon: Clock, color: "text-amber-600" },
];

export default function SungkuSend() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Sungku Send</h1>
            <p className="text-white/80 text-sm">Envoyez de l'argent partout</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <p className="text-white text-xs font-medium">🏆 ICT Week</p>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <p className="text-gray-600 text-sm mb-1">Solde disponible</p>
          <p className="text-3xl font-bold text-gray-900 mb-4">120 000 FCFA</p>
          <div className="flex gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <div>
                    <p className={`text-xs ${stat.color} font-bold`}>{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="px-6 py-6">
        {/* Transfer Methods */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Choisir une méthode</h2>
        <div className="space-y-3 mb-8">
          {transferMethods.map((method) => {
            const Icon = method.icon;
            return (
              <motion.button
                key={method.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/miniapps/sungku-send/${method.id}`)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className={`w-14 h-14 ${method.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{method.title}</h3>
                    {method.popular && (
                      <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        Populaire
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
                <Send className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              </motion.button>
            );
          })}
        </div>

        {/* Recent Transfers */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Transferts récents</h2>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {recentTransfers.map((transfer, index) => (
            <button
              key={index}
              onClick={() => navigate(`/miniapps/sungku-send/quick/${transfer.phone}`)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{transfer.avatar}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900">{transfer.name}</p>
                <p className="text-sm text-gray-500">{transfer.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                  {transfer.method}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex gap-3">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              i
            </div>
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">💡 Innovation Sungku</p>
              <p className="text-xs text-blue-700">
                Le système de rendu de monnaie digital primé à ICT Week 2024. Transferts instantanés avec sécurité maximale.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="bg-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">Instantané</p>
            <p className="text-xs text-gray-500">Transfert en quelques secondes</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">Sécurisé</p>
            <p className="text-xs text-gray-500">Protection maximale</p>
          </div>
        </div>
      </div>
    </div>
  );
}
