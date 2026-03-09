import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, Users, Activity, Download } from "lucide-react";
import { Button } from "../../components/ui/button";

interface AnalyticsData {
  userGrowth: { month: string; count: number }[];
  transactionVolume: { month: string; volume: number }[];
  revenueData: { month: string; revenue: number }[];
  topMiniApps: { name: string; installs: number; icon: string }[];
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    transactionVolume: [],
    revenueData: [],
    topMiniApps: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Mock data
        setAnalytics({
          userGrowth: [
            { month: "Jan", count: 5000 },
            { month: "Fév", count: 7200 },
            { month: "Mar", count: 9500 },
            { month: "Avr", count: 11800 },
            { month: "Mai", count: 13200 },
            { month: "Juin", count: 15234 }
          ],
          transactionVolume: [
            { month: "Jan", volume: 25000 },
            { month: "Fév", volume: 32000 },
            { month: "Mar", volume: 38000 },
            { month: "Avr", volume: 41000 },
            { month: "Mai", volume: 43500 },
            { month: "Juin", volume: 45678 }
          ],
          revenueData: [
            { month: "Jan", revenue: 45000000 },
            { month: "Fév", revenue: 62000000 },
            { month: "Mar", revenue: 78000000 },
            { month: "Avr", revenue: 95000000 },
            { month: "Mai", revenue: 108000000 },
            { month: "Juin", revenue: 125430000 }
          ],
          topMiniApps: [
            { name: "Ride Share", installs: 23456, icon: "🚕" },
            { name: "Factures", installs: 18765, icon: "📱" },
            { name: "Livraison", installs: 15234, icon: "🚚" },
            { name: "Shopping", installs: 12345, icon: "🛍️" },
            { name: "Restaurant", installs: 9876, icon: "🍕" }
          ]
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Mois,Utilisateurs,Transactions,Revenus\n" +
      analytics.userGrowth.map((item, idx) => 
        `${item.month},${item.count},${analytics.transactionVolume[idx]?.volume || 0},${analytics.revenueData[idx]?.revenue || 0}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sungku-analytics-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Analytics & Rapports</h1>
              <p className="text-sm text-gray-500">Vue d'ensemble des performances</p>
            </div>
          </div>
          <Button
            onClick={exportData}
            variant="outline"
            className="rounded-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setPeriod('7d')}
            variant={period === '7d' ? 'default' : 'outline'}
            className={`rounded-full ${period === '7d' ? 'bg-emerald-500 text-white' : ''}`}
          >
            7 jours
          </Button>
          <Button
            onClick={() => setPeriod('30d')}
            variant={period === '30d' ? 'default' : 'outline'}
            className={`rounded-full ${period === '30d' ? 'bg-emerald-500 text-white' : ''}`}
          >
            30 jours
          </Button>
          <Button
            onClick={() => setPeriod('90d')}
            variant={period === '90d' ? 'default' : 'outline'}
            className={`rounded-full ${period === '90d' ? 'bg-emerald-500 text-white' : ''}`}
          >
            90 jours
          </Button>
          <Button
            onClick={() => setPeriod('1y')}
            variant={period === '1y' ? 'default' : 'outline'}
            className={`rounded-full ${period === '1y' ? 'bg-emerald-500 text-white' : ''}`}
          >
            1 an
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Growth Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Croissance des utilisateurs</h2>
                  <p className="text-sm text-gray-500">Évolution sur 6 mois</p>
                </div>
              </div>
              <div className="h-64 flex items-end gap-4">
                {analytics.userGrowth.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-blue-100 rounded-t-lg hover:bg-blue-200 transition-colors relative group"
                         style={{ height: `${(item.count / Math.max(...analytics.userGrowth.map(i => i.count))) * 100}%` }}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count.toLocaleString()} users
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Volume Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Volume des transactions</h2>
                  <p className="text-sm text-gray-500">Nombre de transactions par mois</p>
                </div>
              </div>
              <div className="h-64 flex items-end gap-4">
                {analytics.transactionVolume.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-emerald-100 rounded-t-lg hover:bg-emerald-200 transition-colors relative group"
                         style={{ height: `${(item.volume / Math.max(...analytics.transactionVolume.map(i => i.volume))) * 100}%` }}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.volume.toLocaleString()} tx
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Revenus mensuels</h2>
                  <p className="text-sm text-gray-500">En millions de FCFA</p>
                </div>
              </div>
              <div className="h-64 flex items-end gap-4">
                {analytics.revenueData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-purple-100 rounded-t-lg hover:bg-purple-200 transition-colors relative group"
                         style={{ height: `${(item.revenue / Math.max(...analytics.revenueData.map(i => i.revenue))) * 100}%` }}>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {(item.revenue / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Mini Apps */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Top Mini-Apps</h2>
              <div className="space-y-4">
                {analytics.topMiniApps.map((app, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {app.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.installs.toLocaleString()} installations</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">#{idx + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
