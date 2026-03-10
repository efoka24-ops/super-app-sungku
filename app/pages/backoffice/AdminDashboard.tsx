import { useNavigate } from "react-router";
import { Users, Layers, Bell, Settings, TrendingUp, Activity, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { buildApiUrl } from "../../lib/config";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  miniAppsCount: number;
  notificationsCount: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    miniAppsCount: 0,
    notificationsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch(buildApiUrl('/api/admin/dashboard-stats'));
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Mock data for now
        setStats({
          totalUsers: 15234,
          activeUsers: 8945,
          totalTransactions: 45678,
          totalRevenue: 125430000,
          miniAppsCount: 8,
          notificationsCount: 23
        });
      }
    } catch (error) {
      // Fallback to mock data
      setStats({
        totalUsers: 15234,
        activeUsers: 8945,
        totalTransactions: 45678,
        totalRevenue: 125430000,
        miniAppsCount: 8,
        notificationsCount: 23
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: "Gestion des utilisateurs",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
      route: "/backoffice/users",
      description: "Gérer les comptes utilisateurs"
    },
    {
      title: "Mini Apps",
      icon: <Layers className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600",
      route: "/backoffice/miniapps",
      description: "Publier/Dépublier des mini-apps"
    },
    {
      title: "Notifications",
      icon: <Bell className="w-6 h-6" />,
      color: "bg-amber-100 text-amber-600",
      route: "/backoffice/notifications",
      description: "Envoyer des notifications globales"
    },
    {
      title: "Analytics",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
      route: "/backoffice/analytics",
      description: "Statistiques et rapports"
    },
    {
      title: "Transactions",
      icon: <Activity className="w-6 h-6" />,
      color: "bg-emerald-100 text-emerald-600",
      route: "/backoffice/transactions",
      description: "Suivi des transactions"
    },
    {
      title: "Sécurité",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-red-100 text-red-600",
      route: "/backoffice/security",
      description: "Logs et alertes de sécurité"
    },
    {
      title: "Paramètres",
      icon: <Settings className="w-6 h-6" />,
      color: "bg-gray-100 text-gray-600",
      route: "/backoffice/settings",
      description: "Configuration de la plateforme"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-8 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Back Office Sungku</h1>
          <p className="text-emerald-100">Tableau de bord administrateur</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des statistiques...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    +12%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalUsers.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-500">Utilisateurs totaux</p>
                <p className="text-xs text-emerald-600 mt-2">
                  {stats.activeUsers.toLocaleString()} actifs
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    +8%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalTransactions.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-xs text-gray-400 mt-2">Ce mois</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    +25%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M FCFA
                </h3>
                <p className="text-sm text-gray-500">Revenus</p>
                <p className="text-xs text-gray-400 mt-2">Ce mois</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                    {stats.miniAppsCount} actives
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.miniAppsCount}
                </h3>
                <p className="text-sm text-gray-500">Mini Apps</p>
                <p className="text-xs text-gray-400 mt-2">Publiées</p>
              </div>
            </div>

            {/* Quick Actions Menu */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gestion de la plateforme</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(item.route)}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
                  >
                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Activité récente</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Nouvel utilisateur inscrit</p>
                    <p className="text-sm text-gray-500">Jean Kouassi • Il y a 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Transaction importante détectée</p>
                    <p className="text-sm text-gray-500">500,000 FCFA • Il y a 12 minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Layers className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Mini-app "Shopping" installée</p>
                    <p className="text-sm text-gray-500">234 nouvelles installations • Il y a 1 heure</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
