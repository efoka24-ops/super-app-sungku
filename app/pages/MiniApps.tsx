import BottomNav from "../components/BottomNav";
import { Input } from "../components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Car,
  ShoppingBag,
  Heart,
  Ticket,
  GraduationCap,
  Dumbbell,
  Home,
  Package,
  UtensilsCrossed,
  Pill,
  Briefcase,
  Plane,
  Music,
  Gamepad2,
  TrendingUp,
  Send,
  Download,
  ExternalLink,
  Brain,
} from "lucide-react";
import { fetchInstalledMiniApps, installMiniApp } from "../lib/features/miniapps/miniappsApi";

const categories = [
  { label: "Tous", active: true },
  { label: "Populaires", active: false },
  { label: "Nouveaux", active: false },
  { label: "Finance", active: false },
];

const miniApps = [
  {
    icon: Brain,
    title: "KowSy",
    description: "Assistant dépenses & budget IA",
    color: "bg-amber-400",
    users: "Nouveau !",
    featured: true,
    route: "/miniapps/kowsy",
  },
  {
    icon: Send,
    title: "Sungku Send",
    description: "Transfert d'argent digital 🏆",
    color: "bg-emerald-500",
    users: "200k+ utilisateurs",
    featured: true,
    route: "/miniapps/sungku-send",
  },
  {
    icon: Car,
    title: "Sungku Ride",
    description: "Motos & taxis à la demande",
    color: "bg-blue-500",
    users: "50k+ utilisateurs",
    featured: true,
  },
  {
    icon: ShoppingBag,
    title: "Sungku Market",
    description: "Marketplace locale",
    color: "bg-purple-500",
    users: "100k+ utilisateurs",
    featured: true,
  },
  {
    icon: Package,
    title: "Sungku Delivery",
    description: "Livraison express",
    color: "bg-amber-500",
    users: "75k+ utilisateurs",
    featured: false,
  },
  {
    icon: UtensilsCrossed,
    title: "Sungku Food",
    description: "Commande de repas",
    color: "bg-amber-500",
    users: "60k+ utilisateurs",
    featured: false,
  },
  {
    icon: Heart,
    title: "Pharmacie Plus",
    description: "Médicaments en ligne",
    color: "bg-red-500",
    users: "40k+ utilisateurs",
    featured: false,
  },
  {
    icon: Ticket,
    title: "Event Pass",
    description: "Billetterie digitale",
    color: "bg-indigo-500",
    users: "30k+ utilisateurs",
    featured: false,
  },
  {
    icon: GraduationCap,
    title: "Sungku Learn",
    description: "Formation en ligne",
    color: "bg-cyan-500",
    users: "25k+ utilisateurs",
    featured: false,
  },
  {
    icon: Dumbbell,
    title: "Fit & Wellness",
    description: "Sport et santé",
    color: "bg-orange-500",
    users: "20k+ utilisateurs",
    featured: false,
  },
  {
    icon: Home,
    title: "Immo Finder",
    description: "Location & vente",
    color: "bg-teal-500",
    users: "35k+ utilisateurs",
    featured: false,
  },
  {
    icon: Briefcase,
    title: "Job Connect",
    description: "Offres d'emploi",
    color: "bg-slate-600",
    users: "45k+ utilisateurs",
    featured: false,
  },
  {
    icon: Plane,
    title: "Travel Easy",
    description: "Réservation voyages",
    color: "bg-sky-500",
    users: "28k+ utilisateurs",
    featured: false,
  },
  {
    icon: Music,
    title: "Music Stream",
    description: "Musique africaine",
    color: "bg-pink-500",
    users: "55k+ utilisateurs",
    featured: false,
  },
  {
    icon: Gamepad2,
    title: "Game Hub",
    description: "Jeux & divertissement",
    color: "bg-violet-500",
    users: "18k+ utilisateurs",
    featured: false,
  },
  {
    icon: TrendingUp,
    title: "Invest Smart",
    description: "Investissement simple",
    color: "bg-green-600",
    users: "22k+ utilisateurs",
    featured: false,
  },
  {
    icon: Pill,
    title: "Health Track",
    description: "Suivi santé",
    color: "bg-rose-500",
    users: "31k+ utilisateurs",
    featured: false,
  },
];

export default function MiniApps() {
  const navigate = useNavigate();
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    const loadInstalled = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const apps = await fetchInstalledMiniApps(user.userId);
      setInstalledIds(apps.map((a) => a.appId));
    };
    loadInstalled();
  }, []);

  const handleInstallOrOpen = async (appId: string, route?: string) => {
    if (installedIds.includes(appId)) {
      if (route) navigate(route);
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/signin");
      return;
    }

    const user = JSON.parse(userStr);
    setInstallingId(appId);
    const installed = await installMiniApp(user.userId, appId, user.phone);
    setInstallingId(null);
    if (!installed) return;

    setInstalledIds((prev) => [...new Set([...prev, appId])]);
    if (route) navigate(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mini Apps</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher une mini app..."
            className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-6 px-6">
          {categories.map((category) => (
            <button
              key={category.label}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category.active
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Apps */}
      <div className="px-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">À la une</h2>
        <div className="grid grid-cols-1 gap-4">
          {miniApps
            .filter((app) => app.featured)
            .map((app) => {
              const Icon = app.icon;
              const appId = app.title.toLowerCase().replace(/\s+/g, "-");
              const isInstalled = installedIds.includes(appId);
              return (
                <div
                  key={app.title}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
                >
                  <div className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{app.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{app.description}</p>
                    <p className="text-xs text-emerald-500 font-medium">{app.users}</p>
                  </div>
                  <button
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
                    onClick={() => handleInstallOrOpen(appId, app.route)}
                    disabled={installingId === appId}
                  >
                    {installingId === appId ? (
                      "Installation..."
                    ) : isInstalled ? (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Ouvrir
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Installer
                      </>
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* All Apps */}
      <div className="px-6 mt-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Toutes les apps</h2>
        <div className="grid grid-cols-2 gap-4">
          {miniApps
            .filter((app) => !app.featured)
            .map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.title}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`w-14 h-14 ${app.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{app.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{app.description}</p>
                  <p className="text-xs text-emerald-500 font-medium">{app.users}</p>
                </div>
              );
            })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}