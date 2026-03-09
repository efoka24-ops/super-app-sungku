import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-between px-6 py-12">
      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center text-center"
      >
        <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-6xl font-bold text-emerald-500">S</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Sungku</h1>
        <p className="text-white/90 text-lg max-w-sm mb-2">
          La Super App pour payer, échanger et vivre en Afrique
        </p>
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mt-4">
          <p className="text-white text-sm font-medium">🏆 Primé ICT Week 2024</p>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full max-w-md space-y-4"
      >
        <Button
          onClick={() => {
            // Clear any previous session data before new signup
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            navigate("/signup");
          }}
          className="w-full bg-white text-emerald-600 hover:bg-white/90 h-14 rounded-xl text-lg font-bold"
        >
          Créer un compte
        </Button>
        <Button
          onClick={() => {
            // Clear any previous session data before new signin
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            navigate("/signin");
          }}
          variant="outline"
          className="w-full border-2 border-white text-white hover:bg-white/10 h-14 rounded-xl text-lg font-bold"
        >
          Se connecter
        </Button>

        <p className="text-white/70 text-xs text-center mt-6">
          En continuant, vous acceptez nos{" "}
          <a href="#" className="underline font-medium">
            Conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="underline font-medium">
            Politique de confidentialité
          </a>
        </p>
      </motion.div>
    </div>
  );
}
