import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Phone, DollarSign, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { motion } from "motion/react";

const operators = [
  { id: "orange", name: "Orange Money", logo: "🟠", color: "bg-orange-500" },
  { id: "mtn", name: "MTN Money", logo: "🟡", color: "bg-yellow-500" },
  { id: "moov", name: "Moov Money", logo: "🔵", color: "bg-blue-500" },
];

export default function SungkuSendMobileMoney() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");

  const quickAmounts = [1000, 2000, 5000, 10000, 25000, 50000];

  const handleVerifyNumber = () => {
    // Skip automatic recipient name - let user enter it
    setStep(2);
  };

  const handleConfirmTransfer = () => {
    setStep(3);
    // Simulate transfer
    setTimeout(() => {
      navigate("/miniapps/sungku-send/success", {
        state: {
          amount,
          recipient: recipientName,
          phone: phoneNumber,
          method: operators.find((op) => op.id === selectedOperator)?.name,
        },
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Mobile Money</h1>
            <p className="text-white/80 text-sm">Envoi vers Mobile Money</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step >= s ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
                className="h-full bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Step 1: Select Operator & Phone */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Operator Selection */}
            <div className="mb-6">
              <Label className="text-base font-bold text-gray-900 mb-3 block">Choisir l'opérateur</Label>
              <div className="grid grid-cols-3 gap-3">
                {operators.map((operator) => (
                  <button
                    key={operator.id}
                    onClick={() => setSelectedOperator(operator.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedOperator === operator.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{operator.logo}</div>
                    <p className="text-xs font-medium text-gray-900">{operator.name.split(" ")[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div className="mb-6">
              <Label htmlFor="phone" className="text-base font-bold text-gray-900">
                Numéro de téléphone
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+225 XX XX XX XX XX"
                  className="pl-12 h-14 rounded-xl border-2"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Le destinataire recevra l'argent sur ce numéro</p>
            </div>

            <Button
              onClick={handleVerifyNumber}
              disabled={!selectedOperator || phoneNumber.length < 10}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-xl text-lg font-bold disabled:opacity-50"
            >
              Continuer
            </Button>
          </motion.div>
        )}

        {/* Step 2: Enter Recipient Name & Amount */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Phone Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Numéro destinataire</p>
                  <p className="font-bold text-gray-900">{phoneNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Via</p>
                  <p className="font-bold text-amber-600">
                    {operators.find((op) => op.id === selectedOperator)?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Recipient Name */}
            <div className="mb-6">
              <Label htmlFor="recipientName" className="text-base font-bold text-gray-900">
                Nom du destinataire
              </Label>
              <div className="relative mt-2">
                <Input
                  id="recipientName"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Prénom Nom"
                  className="h-14 rounded-xl border-2"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Pour la confirmation du transfert</p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <Label htmlFor="amount" className="text-base font-bold text-gray-900">
                Montant à envoyer
              </Label>
              <div className="relative mt-2">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="h-20 rounded-xl border-2 text-center text-3xl font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                  FCFA
                </span>
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Montants rapides</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-3 px-4 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-sm font-bold text-gray-900"
                  >
                    {quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Fee Info */}
            {amount && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Montant</span>
                  <span className="text-sm font-bold text-gray-900">{parseInt(amount).toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Frais</span>
                  <span className="text-sm font-bold text-emerald-600">0 FCFA</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{parseInt(amount).toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleConfirmTransfer}
              disabled={!amount || !recipientName || parseInt(amount) <= 0}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-xl text-lg font-bold disabled:opacity-50"
            >
              Confirmer le transfert
            </Button>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-amber-200 border-t-amber-500 rounded-full mb-6"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Transfert en cours...</h3>
            <p className="text-gray-600 text-center">Nous traitons votre transaction</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
