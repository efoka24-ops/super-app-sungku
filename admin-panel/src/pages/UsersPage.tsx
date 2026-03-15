import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Loader } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getUsers, updateUserStatus, User as UserType } from '../lib/usersApi';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'blocked';
  kycLevel: 'none' | 'basic' | 'advanced';
  balance: number;
  lastActivity: string;
  verified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'blocked'>('all');
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const backendUsers = await getUsers();
      
      // Transform backend users to display format
      const displayUsers: User[] = backendUsers.map((user: UserType) => ({
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status || 'active',
        kycLevel: user.kycLevel || 'none',
        balance: user.balance || 0,
        lastActivity: new Date(user.createdAt).toLocaleString('fr-FR'),
        verified: user.verified,
        createdAt: user.createdAt
      }));
      
      setUsers(displayUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesFilter = filter === 'all' || user.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = async (userId: string, status: User['status']) => {
    setUpdatingUserId(userId);
    const updated = await updateUserStatus(userId, status);
    if (updated) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.userId === userId ? { ...user, status } : user
        )
      );
    }
    setUpdatingUserId(null);
  };

  return (
    <AdminLayout title="Utilisateurs">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'suspended', 'blocked'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl overflow-hidden shadow">
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Loader className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-gray-600">Chargement des utilisateurs...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Aucun utilisateur trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">KYC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Solde</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>{user.email}</p>
                        <p className="text-gray-500">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700">{user.kycLevel}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-emerald-600">
                          {(user.balance / 1000).toFixed(0)}K FCFA
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                          {user.status === 'active' ? '✓ Actif' : user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/users/${user.userId}`)}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.userId, 'active')}
                            disabled={updatingUserId === user.userId}
                            className="px-3 py-1 text-xs rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            Activer
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.userId, 'suspended')}
                            disabled={updatingUserId === user.userId}
                            className="px-3 py-1 text-xs rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:opacity-50"
                          >
                            Suspendre
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.userId, 'blocked')}
                            disabled={updatingUserId === user.userId}
                            className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            Bloquer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
