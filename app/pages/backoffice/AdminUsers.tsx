import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Shield, Ban, CheckCircle, Mail, Phone } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { buildApiUrl, API_ENDPOINTS } from "../../lib/config";

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  verified: boolean;
  kycLevel: "none" | "basic" | "advanced";
  status: "active" | "suspended" | "blocked";
  balance: number;
  joinedAt: string;
  lastActive: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'blocked'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.USERS));
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        // Mock data
        setUsers([
          {
            userId: "user_001",
            firstName: "Jean",
            lastName: "Kouassi",
            email: "jean.kouassi@email.com",
            phone: "+225 07 XX XX 12 34",
            verified: true,
            kycLevel: "advanced",
            status: "active",
            balance: 125000,
            joinedAt: "2024-01-15",
            lastActive: "Il y a 5 minutes"
          },
          {
            userId: "user_002",
            firstName: "Marie",
            lastName: "Diallo",
            email: "marie.diallo@email.com",
            phone: "+225 05 XX XX 56 78",
            verified: true,
            kycLevel: "basic",
            status: "active",
            balance: 45000,
            joinedAt: "2024-02-20",
            lastActive: "Il y a 2 heures"
          },
          {
            userId: "user_003",
            firstName: "Ibrahim",
            lastName: "Traoré",
            email: "ibrahim.traore@email.com",
            phone: "+225 01 XX XX 90 12",
            verified: false,
            kycLevel: "none",
            status: "active",
            balance: 5000,
            joinedAt: "2024-03-05",
            lastActive: "Il y a 1 jour"
          },
          {
            userId: "user_004",
            firstName: "Fatou",
            lastName: "Sow",
            email: "fatou.sow@email.com",
            phone: "+225 07 XX XX 34 56",
            verified: true,
            kycLevel: "advanced",
            status: "suspended",
            balance: 230000,
            joinedAt: "2023-11-10",
            lastActive: "Il y a 3 jours"
          },
          {
            userId: "user_005",
            firstName: "Amadou",
            lastName: "Bakayoko",
            email: "amadou.b@email.com",
            phone: "+225 05 XX XX 78 90",
            verified: true,
            kycLevel: "basic",
            status: "blocked",
            balance: 0,
            joinedAt: "2024-01-08",
            lastActive: "Il y a 1 semaine"
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, newStatus: User['status']) => {
    try {
      await fetch(buildApiUrl(`/api/admin/users/${userId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
    
    setUsers(users.map(u => 
      u.userId === userId ? { ...u, status: newStatus } : u
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Actif</span>;
      case 'suspended':
        return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">Suspendu</span>;
      case 'blocked':
        return <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Bloqué</span>;
    }
  };

  const getKYCBadge = (level: User['kycLevel']) => {
    switch (level) {
      case 'none':
        return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Non vérifié</span>;
      case 'basic':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">KYC Basic</span>;
      case 'advanced':
        return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">KYC Avancé</span>;
    }
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
              <h1 className="text-xl font-bold text-gray-900">Gestion des utilisateurs</h1>
              <p className="text-sm text-gray-500">{users.length} utilisateurs enregistrés</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email ou téléphone..."
              className="pl-12 h-12 rounded-xl"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterStatus('all')}
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              className={`rounded-full ${filterStatus === 'all' ? 'bg-emerald-500 text-white' : ''}`}
            >
              Tous ({users.length})
            </Button>
            <Button
              onClick={() => setFilterStatus('active')}
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              className={`rounded-full ${filterStatus === 'active' ? 'bg-emerald-500 text-white' : ''}`}
            >
              Actifs ({users.filter(u => u.status === 'active').length})
            </Button>
            <Button
              onClick={() => setFilterStatus('suspended')}
              variant={filterStatus === 'suspended' ? 'default' : 'outline'}
              className={`rounded-full ${filterStatus === 'suspended' ? 'bg-emerald-500 text-white' : ''}`}
            >
              Suspendus ({users.filter(u => u.status === 'suspended').length})
            </Button>
            <Button
              onClick={() => setFilterStatus('blocked')}
              variant={filterStatus === 'blocked' ? 'default' : 'outline'}
              className={`rounded-full ${filterStatus === 'blocked' ? 'bg-emerald-500 text-white' : ''}`}
            >
              Bloqués ({users.filter(u => u.status === 'blocked').length})
            </Button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Utilisateur</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Vérification</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Solde</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Statut</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.userId} className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-emerald-600">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">ID: {user.userId}</p>
                          <p className="text-xs text-gray-400">Inscrit: {user.joinedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {user.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {user.verified ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Vérifié
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Shield className="w-4 h-4" />
                            Non vérifié
                          </div>
                        )}
                        {getKYCBadge(user.kycLevel)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{user.balance.toLocaleString()} FCFA</p>
                      <p className="text-xs text-gray-500">{user.lastActive}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.status === 'active' && (
                          <Button
                            onClick={() => toggleUserStatus(user.userId, 'suspended')}
                            size="sm"
                            variant="outline"
                            className="text-amber-600 hover:bg-amber-50"
                          >
                            Suspendre
                          </Button>
                        )}
                        {user.status === 'suspended' && (
                          <>
                            <Button
                              onClick={() => toggleUserStatus(user.userId, 'active')}
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-50"
                            >
                              Activer
                            </Button>
                            <Button
                              onClick={() => toggleUserStatus(user.userId, 'blocked')}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {user.status === 'blocked' && (
                          <Button
                            onClick={() => toggleUserStatus(user.userId, 'active')}
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                          >
                            Débloquer
                          </Button>
                        )}
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
  );
}
