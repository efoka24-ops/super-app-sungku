import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { OtpDisplay } from "../components/OtpDisplay";
import { ArrowLeft, Shield, Loader } from "lucide-react";
import { motion } from "motion/react";
import SmsService from "../lib/core/network/smsService";

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.PROD ? "https://super-app-sungku.onrender.com" : "http://localhost:4000");
const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

export default function VerifyPhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state || {};
  const { userId, firstName, lastName, phone, email, otp } = userData;
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }

      // Auto-submit when all fields are filled
      if (newCode.every((digit) => digit !== "") && index === 5) {
        handleVerify();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    if (!userId || !phone) {
      setError("Erreur: données manquantes");
      return;
    }

    const enteredCode = code.join("");
    if (enteredCode.length !== 6) {
      setError("Veuillez entrer les 6 chiffres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Format phone number to match what was sent during signup
      const formattedPhone = SmsService.formatPhoneNumber(phone);
      
      // Verify OTP with backend
      const result = await fetch(`${API_BASE_URL}/api/sms/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          code: enteredCode
        })
      });

      const data = await result.json();
      
      if (!result.ok || !data.success) {
        setError(data.message || 'Code OTP invalide');
        setLoading(false);
        return;
      }

      // Store user data
      const userProfile = {
        userId,
        firstName,
        lastName,
        phone,
        email,
        createdAt: new Date().toISOString(),
        verified: true
      };
      localStorage.setItem('user', JSON.stringify(userProfile));
      localStorage.setItem('authToken', `token_${userId}`);

      // Redirect to home
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de vérification");
      setLoading(false);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setCode(["", "", "", "", "", ""]);
    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    alert(`Code renvoyé : ${newOtp}`);
  };

  // Check if entered code matches OTP
  const enteredCode = code.join("");
  const isOtpCorrect = enteredCode === otp;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vérification</h1>
            <p className="text-sm text-gray-500">Confirmez votre numéro</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col items-center">
        {/* User Info Card */}
        <div className="w-full max-w-md bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Vérification du compte</p>
          <p className="text-lg font-bold text-gray-900 mb-1">{firstName} {lastName}</p>
          <p className="text-sm text-gray-500">{phone}</p>
          {email && <p className="text-sm text-gray-500">{email}</p>}
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8"
        >
          <Shield className="w-12 h-12 text-emerald-500" />
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Entrez le code reçu</h2>
        <p className="text-gray-600 text-center mb-6">
          Nous avons envoyé un code à 6 chiffres à <span className="font-semibold">{phone}</span>
        </p>

        {/* OTP Display Component */}
        {otp && <OtpDisplay code={otp} onCopy={() => {}} />}

        {/* Code Input */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {code.map((digit, index) => (
            <motion.input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        {/* Timer / Resend */}
        <div className="text-center mb-8">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-emerald-600 font-bold hover:underline"
            >
              Renvoyer le code
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Renvoyer le code dans{" "}
              <span className="font-bold text-emerald-600">{timer}s</span>
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={code.some((digit) => digit === "") || loading}
          className="w-full max-w-md h-12 sm:h-14 rounded-xl text-base sm:text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="hidden sm:inline">Vérification...</span>
              <span className="sm:hidden">Vérif...</span>
            </>
          ) : (
            "Vérifier le code"
          )}
        </Button>
        
        {error && (
          <p className="text-red-500 text-sm font-medium mt-3">❌ {error}</p>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-4 max-w-md">
          <p className="text-sm text-blue-900 text-center">
            <span className="font-bold">📱 Astuce:</span> Le code peut prendre jusqu'à 2 minutes pour arriver. Vérifiez vos SMS.
          </p>
        </div>

        {/* Change Number */}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-gray-600 text-sm hover:underline"
        >
          Changer de numéro
        </button>
      </div>
    </div>
  );
}
