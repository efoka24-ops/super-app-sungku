import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, User, Phone, Mail, Lock, Eye, EyeOff, Check, Loader } from "lucide-react";
import { motion } from "motion/react";
import { signup } from "../lib/core/network/authApi";
import SmsService from "../lib/core/network/smsService";

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.PROD ? "https://super-app-sungku-7wq4.onrender.com" : "http://localhost:4000");
const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear any previous signup data on component mount
  useEffect(() => {
    // If user is already logged in, don't let them create another account
    const existingUser = localStorage.getItem('user');
    if (existingUser) {
      // User is already registered, redirect to home
      const redirectAnswer = window.confirm('Vous avez déjà un compte. Voulez-vous créer un nouveau compte? (Les données du compte actuel seront supprimées)');
      if (redirectAnswer) {
        // Clear old data and allow new signup
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } else {
        navigate('/home');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call backend API to create account
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
      });

      // Generate OTP
      const otp = SmsService.generateOtp(6);
      
      // Format phone number for SMS
      const formattedPhone = SmsService.formatPhoneNumber(formData.phone);

      // Send OTP via SMS (non-blocking - essai d'envoi)
      try {
        const smsResult = await fetch(`${API_BASE_URL}/api/sms/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formattedPhone,
            code: otp,
            provider: 'afrimotech'
          })
        });
        
        if (smsResult.ok) {
          console.log('✓ OTP envoyé par SMS');
        } else {
          console.warn('SMS send failed, continuing with verification');
        }
      } catch (smsError) {
        console.warn('SMS service unavailable, continuing:', smsError);
      }

      // Navigate to verification page with userId and OTP
      navigate("/verify", {
        state: {
          userId: result.userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          otp: otp // Pass the generated OTP for display
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription");
      setLoading(false);
    }
  };

  const isPasswordValid = formData.password.length >= 6;
  const doPasswordsMatch = formData.password === formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-sm text-gray-500">Rejoignez Sungku aujourd'hui</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Jean"
                  className="pl-12 h-12 rounded-xl"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Kouadio"
                  className="pl-12 h-12 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <div className="relative mt-2">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+225 XX XX XX XX XX"
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Ce numéro sera votre identifiant Sungku</p>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email (optionnel)</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="exemple@email.com"
                className="pl-12 h-12 rounded-xl"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="pl-12 pr-12 h-12 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className={`flex items-center gap-2 text-xs ${isPasswordValid ? "text-emerald-600" : "text-gray-400"}`}>
                  <Check className="w-3 h-3" />
                  <span>Au moins 6 caractères</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="pl-12 h-12 rounded-xl"
                required
              />
            </div>
            {formData.confirmPassword && (
              <div className={`flex items-center gap-2 text-xs mt-2 ${doPasswordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                <Check className="w-3 h-3" />
                <span>{doPasswordsMatch ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}</span>
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3 bg-gray-100 rounded-xl p-4">
            <button
              type="button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                acceptedTerms ? "bg-emerald-500" : "bg-white border-2 border-gray-300"
              }`}
            >
              {acceptedTerms && <Check className="w-3 h-3 text-white" />}
            </button>
            <p className="text-xs text-gray-700">
              J'accepte les{" "}
              <a href="#" className="text-emerald-600 font-medium underline">
                Conditions d'utilisation
              </a>{" "}
              et la{" "}
              <a href="#" className="text-emerald-600 font-medium underline">
                Politique de confidentialité
              </a>{" "}
              de Sungku
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !acceptedTerms || !isPasswordValid || !doPasswordsMatch || !formData.phone || !formData.firstName || !formData.lastName}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Création...
              </>
            ) : (
              "Créer mon compte"
            )}
          </Button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="text-emerald-600 font-bold underline"
              >
                Se connecter
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
