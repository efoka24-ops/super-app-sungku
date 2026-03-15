import { useNavigate, useLocation } from "react-router";
import { CheckCircle2, Download, Share2, Home, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion } from "motion/react";

export default function SungkuSendSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { amount, recipient, phone, method } = location.state || {
    amount: "5000",
    recipient: "Beneficiaire",
    phone: "+237 6XX XXX XXX",
    method: "Orange Money",
  };

  const transactionId = `SK${Date.now().toString().slice(-8)}`;
  const date = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center px-6 py-12">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute inset-0 bg-white/20 rounded-full blur-xl"
          />
          <CheckCircle2 className="w-24 h-24 text-white relative" strokeWidth={2} />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-3">Transfert réussi !</h1>
        <p className="text-white/90 text-lg">Votre argent a été envoyé</p>
      </motion.div>

      {/* Transaction Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl mb-6"
      >
        {/* Amount */}
        <div className="text-center mb-6 pb-6 border-b border-gray-200">
          <p className="text-gray-600 text-sm mb-2">Montant envoyé</p>
          <p className="text-4xl font-bold text-gray-900">{parseInt(amount).toLocaleString()} <span className="text-2xl">FCFA</span></p>
        </div>

        {/* Recipient Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{recipient.split(" ").map(n => n[0]).join("")}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{recipient}</p>
              <p className="text-sm text-gray-500">{phone}</p>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-sm text-emerald-700 font-medium">{method}</p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ID Transaction</span>
            <span className="text-sm font-bold text-gray-900 font-mono">{transactionId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Date & heure</span>
            <span className="text-sm font-medium text-gray-900">{date}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Frais</span>
            <span className="text-sm font-bold text-emerald-600">0 FCFA</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">Total débité</span>
            <span className="text-lg font-bold text-gray-900">{parseInt(amount).toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Reçu
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full max-w-md space-y-3"
      >
        <Button
          onClick={() => navigate("/miniapps/sungku-send")}
          className="w-full bg-white text-emerald-600 hover:bg-white/90 h-14 rounded-xl text-lg font-bold"
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Nouveau transfert
        </Button>
        <Button
          onClick={() => navigate("/home")}
          variant="ghost"
          className="w-full text-white hover:bg-white/10 h-14 rounded-xl text-lg font-bold"
        >
          <Home className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-center"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
          <p className="text-white/90 text-xs">
            ✨ Propulsé par <span className="font-bold">Sungku Send</span> - Innovation ICT Week 2024
          </p>
        </div>
      </motion.div>
    </div>
  );
}
