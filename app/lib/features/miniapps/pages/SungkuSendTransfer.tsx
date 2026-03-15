import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { type CamPayOperator, OPERATOR_INFO, maskPhone } from "../utils/campayOperator";
import type { Contact } from "../../contacts/contactsApi";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

interface LocationState {
  contact: Contact & { phoneNumber: string };
  operator: CamPayOperator;
  mode?: string;
}

export default function SungkuSendTransfer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { contact, operator } = (location.state ?? {}) as Partial<LocationState>;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"amount" | "confirm">("amount");

  const info = OPERATOR_INFO[operator ?? "UNKNOWN"];
  const amountInt = parseInt(amount) || 0;
  const valid = amountInt >= 100;

  // Numpad
  const handleKey = (key: string) => {
    if (key === "⌫") {
      setAmount((a) => a.slice(0, -1));
    } else if (key === "C") {
      setAmount("");
    } else {
      if (amount.length >= 7) return; // max 9 999 999 XAF
      if (key === "0" && amount === "") return;
      setAmount((a) => a + key);
    }
  };

  const handleConfirm = () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const rawPhone = user?.phone ?? "";
    const from = rawPhone.startsWith("237") ? rawPhone : rawPhone ? `237${rawPhone.replace(/\D/g, "")}` : "";

    navigate("/miniapps/sungku-send/status", {
      state: {
        type: "TRANSFER",
        from,
        to: contact!.phoneNumber,
        amount: amountInt,
        operator,
        contactName: contact!.name,
        description: description || "Sungku Send",
        userId: user?.userId,
      },
    });
  };

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-gray-500 mb-3">Contact manquant.</p>
          <button onClick={() => navigate(-1)} className="text-emerald-600 font-semibold underline">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <div
        className="px-5 pt-12 pb-5 text-white"
        style={{ background: `linear-gradient(135deg, ${info.color}dd, ${info.color})` }}
      >
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-black/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Envoyer de l'argent</h1>
            <p className="text-white/75 text-sm">
              {info.emoji} {info.name}
            </p>
          </div>
        </div>

        {/* Recipient card */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/30 flex items-center justify-center font-bold text-white text-sm shrink-0">
            {initials || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate">{contact.name}</p>
            <p className="text-white/75 text-sm">{maskPhone(contact.phoneNumber)}</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${info.badgeClass}`}>
            {operator}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-5 py-5">
        {step === "amount" ? (
          <>
            {/* Amount display */}
            <div className="text-center mb-5">
              <p className="text-gray-400 text-sm mb-2">Montant à envoyer</p>
              <div className="flex items-end justify-center gap-2">
                <span className="text-5xl font-extrabold text-gray-900 leading-none">
                  {amountInt > 0 ? amountInt.toLocaleString("fr-FR") : "0"}
                </span>
                <span className="text-xl font-medium text-gray-400 mb-1">XAF</span>
              </div>
              {amount !== "" && !valid && (
                <p className="text-red-500 text-xs mt-2">Minimum 100 XAF</p>
              )}
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    amountInt === q
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200"
                  }`}
                >
                  {q.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
                <motion.button
                  key={k}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleKey(k)}
                  className={`py-4 rounded-xl text-xl font-bold transition-colors ${
                    k === "⌫" || k === "C"
                      ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      : "bg-white text-gray-900 shadow-sm hover:bg-gray-50"
                  }`}
                >
                  {k}
                </motion.button>
              ))}
            </div>

            {/* Description */}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={60}
              placeholder="Description (optionnel)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />

            <button
              onClick={() => setStep("confirm")}
              disabled={!valid}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-xl text-base transition-colors"
            >
              Continuer
            </button>
          </>
        ) : (
          /* ── Confirmation ── */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Confirmer le transfert</h2>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3.5 mb-5">
              {[
                ["À", contact.name],
                ["Numéro", maskPhone(contact.phoneNumber)],
                ["Opérateur", `${info.emoji} ${info.name}`],
                ["Montant", `${amountInt.toLocaleString("fr-FR")} XAF`],
                ["Frais", "0 XAF"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total à débiter</span>
                <span className="text-lg font-extrabold text-emerald-600">
                  {amountInt.toLocaleString("fr-FR")} XAF
                </span>
              </div>

              {description && (
                <div className="flex items-start justify-between gap-4 pt-1">
                  <span className="text-sm text-gray-400 shrink-0">Note</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{description}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mb-5 leading-relaxed">
              Un prompt USSD sera envoyé sur votre téléphone {maskPhone(contact.phoneNumber)}.
              Saisissez votre PIN Mobile Money pour confirmer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("amount")}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Modifier
              </button>
              <button
                onClick={handleConfirm}
                className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Confirmer & envoyer
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
