import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  OPERATOR_INFO,
  normalizePhone,
  isValidCamPhone,
  detectCamPayOperator,
  type CamPayOperator,
} from "../utils/campayOperator";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function SungkuSendAirtime() {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const selfPhone = user?.phone ? normalizePhone(user.phone) : "";

  const [forSelf, setForSelf] = useState(true);
  const [phone, setPhone] = useState(selfPhone);
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const operator = detectCamPayOperator(phone) as CamPayOperator;
  const info = OPERATOR_INFO[operator];
  const amountInt = parseInt(amount) || 0;
  const validPhone = isValidCamPhone(phone);
  const canContinue = validPhone && amountInt >= 100;

  const handleProceed = () => {
    navigate("/miniapps/sungku-send/status", {
      state: {
        type: "AIRTIME",
        to: normalizePhone(phone),
        from: selfPhone || normalizePhone(phone),
        amount: amountInt,
        operator,
        contactName: forSelf ? "Moi-même" : phone,
        description: `Recharge ${info.name} — ${amountInt.toLocaleString("fr-FR")} XAF`,
        userId: user?.userId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-5 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-black/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Recharge de crédit</h1>
            <p className="text-white/75 text-sm">MTN · Orange · Yoomee · Blue</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* ── Pour soi / pour un contact ── */}
        <div className="bg-white rounded-2xl p-1 flex border border-gray-100 shadow-sm">
          {[
            { label: "Pour moi", val: true },
            { label: "Pour un contact", val: false },
          ].map(({ label, val }) => (
            <button
              key={label}
              onClick={() => {
                setForSelf(val);
                setPhone(val ? selfPhone : "");
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                forSelf === val
                  ? "bg-amber-400 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Numéro ── */}
        {forSelf && selfPhone ? (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{selfPhone}</p>
              <p className="text-xs text-gray-400">Votre numéro</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${info.badgeClass}`}>
              {info.emoji} {operator}
            </span>
          </div>
        ) : (
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Numéro à recharger
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s()-]/g, ""))}
                placeholder="6XXXXXXXX ou +237XXXXXXXXX"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            {phone.length > 4 && !validPhone && (
              <p className="text-red-500 text-xs mt-1">Numéro camerounais invalide (format : 6XXXXXXXX)</p>
            )}
            {validPhone && operator !== "UNKNOWN" && (
              <p className="text-green-600 text-xs mt-1 font-medium">
                ✓ {info.emoji} {info.name} détecté
              </p>
            )}
          </div>
        )}

        {/* ── Opérateurs ── */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Opérateur</p>
          <div className="grid grid-cols-4 gap-2">
            {(["MTN", "ORANGE", "YOOMEE", "BLUE"] as CamPayOperator[]).map((op) => (
              <div
                key={op}
                className={`rounded-xl p-3 flex flex-col items-center gap-1 border-2 transition-colors ${
                  operator === op
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <span className="text-2xl">{OPERATOR_INFO[op].emoji}</span>
                <span className="text-xs font-semibold text-gray-700">{op}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Montants ── */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Montant (XAF)</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                  amountInt === q
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-amber-200"
                }`}
              >
                {q.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            min={100}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant libre (minimum 100 XAF)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          {amount !== "" && amountInt < 100 && (
            <p className="text-red-500 text-xs mt-1">Montant minimum : 100 XAF</p>
          )}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canContinue}
          className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-gray-200 disabled:text-gray-400 text-amber-900 font-bold py-4 rounded-xl text-base transition-colors"
        >
          Recharger maintenant
        </button>
      </div>

      {/* ── Confirmation bottom sheet ── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              exit={{ y: 120 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-3xl px-6 py-7 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-5 text-center">
                Confirmer la recharge
              </h3>
              <div className="space-y-3.5 mb-6">
                {[
                  ["Numéro", phone],
                  ["Opérateur", `${info.emoji} ${info.name}`],
                  ["Montant", `${amountInt.toLocaleString("fr-FR")} XAF`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{l}</span>
                    <span className="font-semibold text-gray-900 text-sm">{v}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total débité</span>
                  <span className="font-extrabold text-amber-600 text-lg">
                    {amountInt.toLocaleString("fr-FR")} XAF
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  onClick={handleProceed}
                  className="flex-[2] bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-4 rounded-xl transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
