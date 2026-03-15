import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Users, TrendingUp, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  miniAppsCount: number;
}

export default function DashboardPage() {
  const { logout, adminName } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    miniAppsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalTransactions: data.totalTransactions || 0,
          totalRevenue: data.totalRevenue || 0,
          miniAppsCount: data.miniAppsCount || 0
        });
      } else {
        // Mock data
        setStats({
          totalUsers: 15234,
          activeUsers: 8945,
          totalTransactions: 45678,
          totalRevenue: 125430000,
          miniAppsCount: 8
        });
      }
    } catch (error) {
      // Mock data fallback
      setStats({
        totalUsers: 15234,
        activeUsers: 8945,
        totalTransactions: 45678,
        totalRevenue: 125430000,
        miniAppsCount: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2" />
                <div className="h-8 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Utilisateurs"
              value={(stats.totalUsers || 0).toLocaleString()}
              subtitle={`${(stats.activeUsers || 0).toLocaleString()} actifs`}
              icon="👥"
            />
            <StatCard
              label="Transactions"
              value={(stats.totalTransactions || 0).toLocaleString()}
              subtitle="Mensuelles"
              icon="💳"
            />
            <StatCard
              label="Revenus"
              value={`${((stats.totalRevenue || 0) / 1000000).toFixed(1)}M`}
              subtitle="FCFA"
              icon="💰"
            />
            <StatCard
              label="Mini-Apps"
              value={stats.miniAppsCount || 0}
              subtitle="Publiées"
              icon="📱"
            />
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Activité Récente</h2>
          <div className="space-y-3">
            {[
              { user: 'Jean Dupont', action: 'Nouvelle inscription', time: 'il y a 2 heures' },
              { user: 'Marie Martin', action: 'Premier envoi', time: 'il y a 5 heures' },
              { user: 'Paul Soe', action: 'Activation mini-app', time: 'il y a 12 heures' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.user}</p>
                  <p className="text-sm text-gray-600">{item.action}</p>
                </div>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon
}: {
  label: string;
  value: string | number;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-gray-500 text-xs mt-2">{subtitle}</p>
    </div>
  );
}
