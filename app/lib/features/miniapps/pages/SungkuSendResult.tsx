import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CheckCircle, XCircle, Copy, Home, Share2, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { OPERATOR_INFO, maskPhone, type CamPayOperator } from "../utils/campayOperator";

interface ResultState {
  success: boolean;
  reference?: string;
  amount: number;
  toNumber: string;
  type: "TRANSFER" | "AIRTIME";
  contactName?: string;
  operator?: CamPayOperator;
  message?: string;
  code?: string;
}

const ERROR_LABELS: Record<string, string> = {
  ER101: "Numéro invalide",
  ER102: "Opérateur non supporté",
  ER201: "Montant décimal interdit (entiers uniquement)",
  ER301: "Solde insuffisant",
};

export default function SungkuSendResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const raw = (location.state ?? {}) as Partial<ResultState>;

  const state: ResultState = {
    success: raw.success ?? false,
    reference: raw.reference,
    amount: raw.amount ?? 0,
    toNumber: raw.toNumber ?? "",
    type: raw.type ?? "TRANSFER",
    contactName: raw.contactName,
    operator: raw.operator ?? "UNKNOWN",
    message: raw.message,
    code: raw.code,
  };

  const [copied, setCopied] = useState(false);
  const info = OPERATOR_INFO[state.operator ?? "UNKNOWN"];
  const date = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const errorLabel = state.code
    ? ERROR_LABELS[state.code] ?? state.message
    : state.message;

  const safeErrorLabel = (() => {
    const raw = String(errorLabel || "");
    const technicalPattern = /unexpected token|doctype|not valid json|failed to fetch|networkerror|err_connection_refused/i;
    if (technicalPattern.test(raw)) {
      return "Connexion au serveur impossible. Verifiez votre connexion puis reessayez.";
    }
    return raw || "Une erreur inattendue s'est produite.";
  })();

  const copyRef = () => {
    if (!state.reference) return;
    navigator.clipboard.writeText(state.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReceipt = () => {
    const text =
      `✅ Sungku Send — ${state.type === "AIRTIME" ? "Recharge" : "Transfert"} réussi\n` +
      `Bénéficiaire : ${state.contactName ?? maskPhone(state.toNumber)}\n` +
      `Montant : ${state.amount.toLocaleString("fr-FR")} XAF\n` +
      `Opérateur : ${info.name}\n` +
      `Date : ${date}\n` +
      `Réf. : ${state.reference ?? "—"}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${state.success ? "bg-emerald-50" : "bg-red-50"}`}>
      {/* ── Header ── */}
      <div
        className={`px-5 pt-12 pb-8 text-white text-center rounded-b-3xl shadow-sm ${
          state.success ? "bg-emerald-600" : "bg-red-500"
        }`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
        >
          {state.success ? (
            <CheckCircle className="w-10 h-10 text-white" />
          ) : (
            <XCircle className="w-10 h-10 text-white" />
          )}
        </motion.div>
        <h1 className="text-2xl font-bold">
          {state.success
            ? state.type === "AIRTIME"
              ? "Recharge réussie !"
              : "Transfert réussi !"
            : "Transaction échouée"}
        </h1>
        {state.success && (
          <p className="text-white/90 text-3xl font-extrabold mt-1">
            {state.amount.toLocaleString("fr-FR")} XAF
          </p>
        )}
      </div>

      {/* ── Details ── */}
      <div className="flex-1 px-5 py-6">
        {state.success ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3.5 mb-5">
            {([
              ["Type", state.type === "AIRTIME" ? "📱 Recharge crédit" : "💸 Transfert Mobile Money"],
              ["Bénéficiaire", state.contactName ?? maskPhone(state.toNumber)],
              ["Numéro", maskPhone(state.toNumber)],
              ["Opérateur", `${info.emoji} ${info.name}`],
              ["Montant", `${state.amount.toLocaleString("fr-FR")} XAF`],
              ["Frais", "0 XAF"],
              ["Date", date],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex justify-between items-start gap-4">
                <span className="text-sm text-gray-400 shrink-0">{l}</span>
                <span className="text-sm font-semibold text-gray-900 text-right">{v}</span>
              </div>
            ))}
            {state.reference && (
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Référence CamPay</p>
                  <p className="font-mono text-xs text-gray-700 truncate">{state.reference}</p>
                </div>
                <button onClick={copyRef} className="p-2 hover:bg-gray-100 rounded-lg transition shrink-0">
                  <Copy className={`w-4 h-4 ${copied ? "text-emerald-500" : "text-gray-400"}`} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 mb-5 text-center">
            <p className="text-red-600 font-semibold mb-1">
              {state.code ? `Code erreur : ${state.code}` : "Erreur"}
            </p>
            <p className="text-gray-500 text-sm">
              {safeErrorLabel}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="space-y-3">
          {state.success && (
            <button
              onClick={shareReceipt}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
            >
              <Share2 className="w-5 h-5" /> Partager le reçu (WhatsApp / SMS)
            </button>
          )}
          {!state.success && (
            <button
              onClick={() => navigate(-2)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors"
            >
              <RotateCcw className="w-5 h-5" /> Réessayer
            </button>
          )}
          <button
            onClick={() => navigate("/miniapps/sungku-send")}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" /> Retour à l'accueil Sungku Send
          </button>
        </div>
      </div>
    </div>
  );
}
