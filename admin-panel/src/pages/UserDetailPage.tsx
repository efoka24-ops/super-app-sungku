import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import AdminLayout from '../components/AdminLayout';
import { getUserDetail, updateUserDetail, DetailedUser } from '../lib/backofficeApi';

export default function UserDetailPage() {
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<DetailedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getUserDetail(userId);
      setUser(data);
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updated = await updateUserDetail(userId, user);
    if (updated) setUser(updated);
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Détail utilisateur" showBackButton>
        <div className="p-6">Chargement...</div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="Détail utilisateur" showBackButton>
        <div className="p-6">
          <p className="text-red-600">Utilisateur introuvable.</p>
          <button onClick={() => navigate('/users')} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Retour</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Détail utilisateur" showBackButton>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Profil #{user.userId}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Prénom" value={user.firstName || ''} onChange={(value) => setUser({ ...user, firstName: value })} />
            <Field label="Nom" value={user.lastName || ''} onChange={(value) => setUser({ ...user, lastName: value })} />
            <Field label="Email" value={user.email || ''} onChange={(value) => setUser({ ...user, email: value })} />
            <Field label="Téléphone" value={user.phone || ''} onChange={(value) => setUser({ ...user, phone: value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Statut"
              value={user.status || 'active'}
              onChange={(value) => setUser({ ...user, status: value as DetailedUser['status'] })}
              options={[
                { value: 'active', label: 'Actif' },
                { value: 'suspended', label: 'Suspendu' },
                { value: 'blocked', label: 'Bloqué' }
              ]}
            />
            <SelectField
              label="KYC"
              value={user.kycLevel || 'none'}
              onChange={(value) => setUser({ ...user, kycLevel: value as DetailedUser['kycLevel'] })}
              options={[
                { value: 'none', label: 'Aucun' },
                { value: 'basic', label: 'Basic' },
                { value: 'advanced', label: 'Avancé' }
              ]}
            />
            <Field
              label="Solde (FCFA)"
              type="number"
              value={String(user.balance || 0)}
              onChange={(value) => setUser({ ...user, balance: Number(value) || 0 })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(user.verified)}
              onChange={(e) => setUser({ ...user, verified: e.target.checked })}
            />
            Compte vérifié
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => navigate('/users')} className="px-4 py-2 border border-gray-300 rounded-lg">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:bg-emerald-300">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
