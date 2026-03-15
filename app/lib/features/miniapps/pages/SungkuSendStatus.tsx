import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { campayCollect, campayAirtime, pollTransaction } from "../api/campayApi";
import { type CamPayOperator, OPERATOR_INFO } from "../utils/campayOperator";

const MAX_ATTEMPTS = 20;    // 60s ÷ 3s
const POLL_INTERVAL = 3000; // ms
const TOTAL_SECONDS = 60;

interface StatusState {
  type: "TRANSFER" | "AIRTIME";
  from?: string;
  to: string;
  amount: number;
  operator: CamPayOperator;
  contactName?: string;
  description?: string;
  userId?: string;
}

export default function SungkuSendStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as StatusState;

  const [phase, setPhase] = useState<"initiating" | "polling" | "timeout">("initiating");
  const [message, setMessage] = useState("Envoi de la demande à CamPay…");
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [attempts, setAttempts] = useState(0);

  const refRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Step 1 : initier la transaction ──────────────────────────────────────
  useEffect(() => {
    const initiate = async () => {
      try {
        const payload = {
          amount: state.amount,
          to: state.to,
          description: state.description,
          external_reference: `${state.type === "AIRTIME" ? "SKA" : "SKS"}-${Date.now()}`,
          userId: state.userId,
        };

        const result =
          state.type === "AIRTIME"
            ? await campayAirtime({ ...payload, from: state.from })
            : state.from
            ? await campayCollect({
                amount: payload.amount,
                to: payload.to,
                description: payload.description,
                external_reference: payload.external_reference,
                userId: payload.userId,
                from: state.from,
              })
            : { success: false, message: "Numéro expéditeur manquant" };

        if (!result.success || !result.reference) {
          navigate("/miniapps/sungku-send/result", {
            state: {
              success: false,
              message: result.message || "Échec de l'initialisation",
              code: result.code,
              amount: state.amount,
              toNumber: state.to,
              type: state.type,
              contactName: state.contactName,
            },
            replace: true,
          });
          return;
        }

        refRef.current = result.reference;
        setPhase("polling");
        setMessage("En attente de votre confirmation PIN…");
      } catch {
        navigate("/miniapps/sungku-send/result", {
          state: {
            success: false,
            message: "Erreur de connexion au serveur",
            amount: state.amount,
            toNumber: state.to,
            type: state.type,
            contactName: state.contactName,
          },
          replace: true,
        });
      }
    };

    initiate(); // eslint-disable-line @typescript-eslint/no-floating-promises
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 2 : countdown + polling ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== "polling") return;

    // Countdown
    timerRef.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    // Polling
    let att = 0;
    pollRef.current = setInterval(async () => {
      if (!refRef.current) return;
      att++;
      setAttempts(att);

      try {
        const res = await pollTransaction(refRef.current);

        if (res.status === "SUCCESSFUL") {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          navigate("/miniapps/sungku-send/result", {
            state: {
              success: true,
              reference: refRef.current,
              amount: state.amount,
              toNumber: state.to,
              type: state.type,
              contactName: state.contactName,
              operator: state.operator,
            },
            replace: true,
          });
        } else if (res.status === "FAILED") {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          navigate("/miniapps/sungku-send/result", {
            state: {
              success: false,
              reference: refRef.current,
              message: "Transaction refusée ou annulée",
              amount: state.amount,
              toNumber: state.to,
              type: state.type,
              contactName: state.contactName,
            },
            replace: true,
          });
        } else if (att >= MAX_ATTEMPTS) {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          setPhase("timeout");
        }
      } catch {
        if (att >= MAX_ATTEMPTS) {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          setPhase("timeout");
        }
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const info = OPERATOR_INFO[state.operator ?? "UNKNOWN"];
  const usdHint = state.operator === "MTN" ? "*126#" : "#150*50#";
  const progressPct = (remaining / TOTAL_SECONDS) * 100;

  if (phase === "timeout") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">⏱️</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Délai dépassé</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
          La confirmation n'a pas été reçue dans les 60 secondes. Vérifiez votre historique pour
          connaître le statut final.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/miniapps/sungku-send/history")}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl"
          >
            Voir l'historique
          </button>
          <button
            onClick={() => navigate("/miniapps/sungku-send")}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Animated loader */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">{info.emoji}</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {phase === "initiating" ? "Envoi en cours…" : "En attente de confirmation"}
      </h2>
      <p className="text-gray-400 mb-8">{message}</p>

      {phase === "polling" && (
        <>
          {/* Progress bar */}
          <div className="w-full max-w-xs bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-8">
            {remaining}s · tentative {attempts}/{MAX_ATTEMPTS}
          </p>

          {/* USSD hint */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 max-w-xs">
            <p className="text-amber-700 text-sm font-semibold mb-1">
              📱 Confirmez sur votre téléphone
            </p>
            <p className="text-amber-600 text-xs leading-relaxed">
              Vous devriez recevoir une notification USSD pour saisir votre PIN{" "}
              {info.name}. Si ce n'est pas le cas, composez{" "}
              <strong className="font-mono">{usdHint}</strong> manuellement.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
