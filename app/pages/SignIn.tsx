import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft, Phone, Lock, Eye, EyeOff, Fingerprint, AlertCircle } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Fetch user from backend
      const usersResponse = await fetch("https://sungku1-q3j44yhv.b4a.run/api/admin/users");
      const usersData = await usersResponse.json();

      if (!usersData.success) {
        setError("Erreur lors de la connexion");
        setLoading(false);
        return;
      }

      // Find user by phone and validate password
      const formattedPhone = formData.phone.replace(/[^\d+]/g, "");
      const user = usersData.users.find(
        (u: any) => u.phone.replace(/[^\d+]/g, "") === formattedPhone
      );

      if (!user) {
        setError("Numéro de téléphone non trouvé");
        setLoading(false);
        return;
      }

      if (user.password !== formData.password) {
        setError("Mot de passe incorrect");
        setLoading(false);
        return;
      }

      // Save user to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
        })
      );

      localStorage.setItem("authToken", `token_${user.userId}`);
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = () => {
    // Simulate biometric authentication
    setError("Biométrie non disponible pour le moment");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Se connecter</h1>
            <p className="text-sm text-gray-500">Bon retour sur Sungku !</p>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-12 pb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
          <span className="text-5xl font-bold text-white">S</span>
        </div>
      </div>

      <div className="flex-1 px-6">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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
                className="pl-12 h-14 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password">Mot de passe</Label>
              <button
                type="button"
                onClick={() => navigate("/reset-password")}
                className="text-sm text-emerald-600 font-medium hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="pl-12 pr-12 h-14 rounded-xl"
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
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded flex items-center justify-center ${
                rememberMe ? "bg-emerald-500" : "bg-white border-2 border-gray-300"
              }`}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <label className="text-sm text-gray-700">Se souvenir de moi</label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white h-14 rounded-xl text-lg font-bold"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">ou</span>
            </div>
          </div>

          {/* Biometric Login */}
          <Button
            type="button"
            onClick={handleBiometric}
            disabled={loading}
            variant="outline"
            className="w-full h-14 rounded-xl border-2 border-gray-200 hover:bg-gray-100 disabled:opacity-50"
          >
            <Fingerprint className="w-6 h-6 mr-2 text-emerald-600" />
            <span className="font-bold">Connexion biométrique</span>
          </Button>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-emerald-600 font-bold underline"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <p className="text-xs text-gray-400">Sungku v1.0.0</p>
      </div>
    </div>
  );
}
