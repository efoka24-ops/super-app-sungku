import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-emerald-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page non trouvée</h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <Button
          onClick={() => navigate("/home")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-8 rounded-xl"
        >
          <Home className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
