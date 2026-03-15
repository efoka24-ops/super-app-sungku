import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const chartData = [
    { month: 'Jan', users: 5000, transactions: 25000, revenue: 45000000 },
    { month: 'Fév', users: 7500, transactions: 35000, revenue: 65000000 },
    { month: 'Mar', users: 10200, transactions: 40000, revenue: 85000000 },
    { month: 'Avr', users: 12800, transactions: 42000, revenue: 105000000 },
    { month: 'Mai', users: 14500, transactions: 44000, revenue: 115000000 },
    { month: 'Jun', users: 15234, transactions: 45678, revenue: 125430000 }
  ];

  const topApps = [
    { name: 'Location Voiture', installations: 3200 },
    { name: 'Livraison Express', installations: 2450 },
    { name: 'Pharmacie en Ligne', installations: 1830 },
    { name: 'Shopping Mall', installations: 1650 },
    { name: 'Restaurant Pro', installations: 1420 }
  ];

  const handleExport = () => {
    const csv = [
      ['Analytics Export - ' + period],
      [''],
      ['Chart Data'],
      ['Month', 'Users', 'Transactions', 'Revenue (FCFA)'],
      ...chartData.map((d) => [d.month, d.users, d.transactions, d.revenue]),
      [''],
      ['Top Apps'],
      ['Application', 'Installations'],
      ...topApps.map((a) => [a.name, a.installations])
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${period}.csv`;
    a.click();
  };

  return (
    <AdminLayout title="Analytiques">
      <div className="max-w-7xl mx-auto">
        {/* Export Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <Download className="w-5 h-5" />
            Exporter CSV
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : p === '90d' ? '90 jours' : '1 an'}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Croissance des Utilisateurs</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Volume Chart */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Volume de Transactions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="transactions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenus (FCFA)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => (value as number / 1000000).toFixed(1) + 'M'} />
                <Bar dataKey="revenue" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Apps */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Mini-Apps</h3>
          <div className="space-y-3">
            {topApps.map((app, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-emerald-600">{index + 1}</span>
                  <p className="font-medium text-gray-900">{app.name}</p>
                </div>
                <p className="text-emerald-600 font-semibold">{app.installations.toLocaleString()} installations</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
