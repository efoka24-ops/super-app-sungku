import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Shield, Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { parseJsonSafe, toUserErrorMessage } from "../lib/core/network/errorMessages";

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.PROD ? "https://super-app-sungku.onrender.com" : "http://localhost:4000");
const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

const RESEND_DELAY = 60;

export default function VerifyPhone() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const userData  = (location.state || {}) as {
    userId?: string; firstName?: string; lastName?: string;
    phone?: string; email?: string;
  };
  const { userId, firstName, lastName, phone, email } = userData;

  const [digits, setDigits]     = useState(["", "", "", ""]);
  const [timer, setTimer]       = useState(RESEND_DELAY);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [devCode, setDevCode]   = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Masquer le numÃ©ro : 237 6XX XXX XX
  const maskedPhone = (() => {
    if (!phone) return "";
    const d = phone.replace(/\D/g, "");
    const local = d.startsWith("237") ? d.slice(3) : d;
    if (local.length < 9) return phone;
    return `+237 ${local[0]}XX XXX ${local.slice(6)}`;
  })();

  const handleDigitChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    setError("");

    if (v && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quand la 4Ã¨me case est remplie
    if (index === 3 && v) {
      const fullCode = [...next.slice(0, 3), v].join("");
      if (fullCode.length === 4) submitCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Gestion coller (paste) d'un code complet
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setDigits(pasted.split(""));
      inputRefs.current[3]?.focus();
      submitCode(pasted);
    }
  };

  const submitCode = async (code: string) => {
    if (!phone) { setError("DonnÃ©es manquantes"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, userId }),
      });
      const data = await parseJsonSafe(res);

      if (!res.ok || !data.success) {
        const serverMessage = typeof data.message === "string" ? data.message : "Code incorrect";
        setError(toUserErrorMessage(new Error(serverMessage), "Code incorrect"));
        setDigits(["", "", "", ""]);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // SuccÃ¨s : sauvegarder la session
      const userProfile = {
        userId: data.userId || userId,
        firstName, lastName, phone, email,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("user",      JSON.stringify(userProfile));
      localStorage.setItem("authToken", data.token || `token_${userId}`);

      setSuccess(true);
      setTimeout(() => navigate("/home"), 1200);
    } catch (err) {
      setError(toUserErrorMessage(err, "Erreur reseau. Verifiez votre connexion."));
      setLoading(false);
    }
  };

  const handleVerify = () => {
    const code = digits.join("");
    if (code.length < 4) { setError("Entrez les 4 chiffres du code"); return; }
    submitCode(code);
  };

  const handleResend = async () => {
    if (!phone) return;
    setResending(true);
    setError("");
    setDevCode(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        const serverMessage = typeof data.message === "string" ? data.message : "Impossible de renvoyer le code.";
        setError(toUserErrorMessage(new Error(serverMessage), "Impossible de renvoyer le code."));
        return;
      }
      if (typeof data.devCode === "string") setDevCode(data.devCode);
      setTimer(RESEND_DELAY);
      setCanResend(false);
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(toUserErrorMessage(err, "Impossible de renvoyer le code."));
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-emerald-500 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="w-28 h-28 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mt-6 text-center"
        >
          NumÃ©ro vÃ©rifiÃ© !
        </motion.h2>
        <p className="text-white/80 mt-2">Redirection en coursâ€¦</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">VÃ©rification</h1>
          <p className="text-sm text-gray-500">Confirmez votre numÃ©ro</p>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 py-10">
        {/* IcÃ´ne */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8"
        >
          <Shield className="w-12 h-12 text-emerald-500" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Entrez votre code
        </h2>
        <p className="text-gray-500 text-center mb-8 max-w-xs">
          Nous avons envoyÃ© un code Ã  <strong className="text-gray-800">4 chiffres</strong> au{" "}
          <span className="font-semibold text-emerald-600">{maskedPhone}</span>
        </p>

        {/* Indicateur dÃ©veloppement */}
        {devCode && (
          <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <span className="text-xs text-amber-700 font-medium">
              ðŸ›  Dev â€” code simulÃ© :
            </span>
            <span className="font-mono text-lg font-bold text-amber-800 tracking-widest">
              {devCode}
            </span>
          </div>
        )}

        {/* 4 cases OTP */}
        <div className="flex gap-4 mb-8" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <motion.input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className={`w-16 h-16 text-center text-3xl font-bold border-2 rounded-2xl focus:outline-none transition-all
                ${digit
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-900"}
                ${error ? "border-red-400 bg-red-50" : ""}
                focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200`}
            />
          ))}
        </div>

        {/* Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 w-full max-w-xs"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton VÃ©rifier */}
        <button
          onClick={handleVerify}
          disabled={digits.some(d => !d) || loading}
          className="w-full max-w-xs h-14 rounded-2xl text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white
            disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mb-6"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              VÃ©rificationâ€¦
            </>
          ) : (
            "VÃ©rifier le code"
          )}
        </button>

        {/* Renvoi */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-emerald-600 font-semibold hover:underline disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {resending && <Loader className="w-4 h-4 animate-spin" />}
              Renvoyer le code
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Renvoyer dans{" "}
              <span className="font-bold text-emerald-600">{timer}s</span>
            </p>
          )}
        </div>

        {/* Conseil */}
        <div className="mt-10 bg-blue-50 rounded-2xl p-4 max-w-xs w-full">
          <p className="text-sm text-blue-900 text-center">
            <strong>ðŸ“± Astuce :</strong> Le SMS peut prendre jusqu&apos;Ã  2 min selon votre opÃ©rateur.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-gray-400 text-sm hover:text-gray-600 hover:underline"
        >
          Changer de numÃ©ro
        </button>
      </div>
    </div>
  );
}
