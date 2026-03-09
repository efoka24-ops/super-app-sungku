import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import {
  Send,
  Download,
  ScanLine,
  CreditCard,
  Smartphone,
  Zap,
  ShoppingBag,
  Car,
  Package,
  Heart,
  Ticket,
  Shield,
  Bell,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";

const quickActions = [
  { icon: Send, label: "Envoyer", color: "bg-emerald-50 text-emerald-600", path: "/send-money" },
  { icon: Download, label: "Recevoir", color: "bg-blue-50 text-blue-600", path: "/receive-money" },
  { icon: ScanLine, label: "Scanner", color: "bg-purple-50 text-purple-600", path: "/scan-qr" },
  { icon: CreditCard, label: "Payer", color: "bg-amber-50 text-amber-600", path: "/payments" },
];

const services = [
  { icon: Smartphone, label: "Recharge", color: "text-emerald-500" },
  { icon: Zap, label: "Factures", color: "text-amber-500" },
  { icon: Car, label: "Transport", color: "text-blue-500" },
  { icon: ShoppingBag, label: "Shopping", color: "text-purple-500" },
];

// Default miniApps (will be replaced by dynamic data from backend)
const defaultMiniApps = [
  {
    icon: Package,
    title: "Livraison",
    description: "Commandez et faites livrer",
    color: "bg-emerald-500",
    image: "https://images.unsplash.com/photo-1687422808225-318a2436ff23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0JTIwdmVuZG9yfGVufDF8fHx8MTc3MjkwNjg4MXww&ixlib=rb-4.1.0&q=80&w=400",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [miniApps, setMiniApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage and fetch stats from backend
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/welcome');
      return;
    }

    const user = JSON.parse(userData);
    setUser(user);

    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const response = await fetch(`https://sungku1-q3j44yhv.b4a.run/api/profile/${user.userId}/stats`);
        const data = await response.json();
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    // Fetch mini-apps catalog from backend
    const fetchMiniApps = async () => {
      try {
        const response = await fetch('https://sungku1-q3j44yhv.b4a.run/api/admin/miniapps-catalog');
        const data = await response.json();
        if (data.miniApps && Array.isArray(data.miniApps)) {
          // Map backend data to component format
          const mapped = data.miniApps.map((app: any) => ({
            id: app.id,
            title: app.name,
            description: app.description,
            color: app.id === 'sungku-send' ? 'bg-emerald-500' : 'bg-blue-500',
            image: 'https://images.unsplash.com/photo-1687422808225-318a2436ff23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFya2V0JTIwdmVuZG9yfGVufDF8fHx8MTc3MjkwNjg4MXww&ixlib=rb-4.1.0&q=80&w=400',
            icon: Package,
          }));
          setMiniApps(mapped);
        }
      } catch (error) {
        console.error('Error fetching mini-apps:', error);
        // Fallback to default mini-apps
        setMiniApps(defaultMiniApps);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchMiniApps();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/welcome');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-white/80 text-sm">Bonjour,</p>
            <h1 className="text-white text-2xl font-bold">{user.firstName} 👋</h1>
          </div>
          <div className="flex gap-3">
            <button className="relative">
              <Bell className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="text-white text-sm hover:bg-white/20 px-3 py-1 rounded-lg transition"
              title="Déconnexion"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white/80 text-sm mb-2">Solde Sungku</p>
              <div className="flex items-center gap-2">
                {showBalance ? (
                  <h2 className="text-white text-3xl font-bold">
                    {stats?.balance || 0} FCFA
                  </h2>
                ) : (
                  <h2 className="text-white text-3xl font-bold">••••••</h2>
                )}
                <button onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? (
                    <Eye className="w-5 h-5 text-white/70" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-white/70" />
                  )}
                </button>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className={action.color.split(" ")[1]} />
                  </div>
                  <span className="text-white text-xs">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services rapides */}
      <div className="px-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Services rapides</h2>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.label}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${service.color}`} />
                </div>
                <span className="text-xs text-gray-700 text-center">{service.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Apps populaires */}
      <div className="px-6 mt-8 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Mini Apps populaires</h2>
          <Button
            variant="ghost"
            onClick={() => navigate("/mini-apps")}
            className="text-emerald-500 text-sm"
          >
            Voir tout
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {miniApps.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.id || app.title}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="h-32 relative overflow-hidden">
                    <img
                      src={app.image}
                      alt={app.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute top-3 right-3 w-10 h-10 ${app.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{app.title}</h3>
                    <p className="text-xs text-gray-500">{app.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
