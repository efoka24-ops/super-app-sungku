import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Upload, Trash2, Eye, EyeOff, Plus, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import {
  getMiniAppsCatalog,
  createMiniApp,
  togglePublishStatus,
  toggleFeaturedStatus,
  deleteMiniApp as deleteMiniAppApi,
  MiniApp as ApiMiniApp
} from '../lib/miniappsApi';
import { uploadMiniAppApk } from '../lib/backofficeApi';

interface MiniApp extends Omit<ApiMiniApp, 'fileSize'> {
  fileSize?: string | number;
  uploadedAt?: string;
  description?: string;
  fileName?: string;
}

export default function MiniAppsPage() {
  const [miniApps, setMiniApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'logistics',
    fileName: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load mini-apps from backend on component mount
  useEffect(() => {
    const loadMiniApps = async () => {
      setLoading(true);
      const apps = await getMiniAppsCatalog();
      setMiniApps(apps as MiniApp[]);
      setLoading(false);
    };

    loadMiniApps();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({...formData, fileName: file.name});
    }
  };

  const handleAddMiniApp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.fileName || !selectedFile) {
      alert('Veuillez remplir tous les champs et sélectionner un fichier');
      return;
    }

    const uploaded = await uploadMiniAppApk(selectedFile);
    if (!uploaded) {
      setSuccessMessage('Upload APK impossible');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    const newApp = await createMiniApp({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      published: true,
      featured: false,
      fileSize: uploaded.size,
      fileName: uploaded.originalName,
      fileUrl: uploaded.url
    });

    if (!newApp) {
      setSuccessMessage('Erreur lors de la création de la mini-app');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    setMiniApps([newApp as MiniApp, ...miniApps]);
    setFormData({ name: '', description: '', category: 'logistics', fileName: '' });
    setSelectedFile(null);
    setShowAddForm(false);
    setSuccessMessage('Mini-app ajoutée avec succès!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const togglePublished = async (id: string) => {
    const app = miniApps.find(a => a.id === id);
    if (!app) return;

    const updated = await togglePublishStatus(id, !app.published);
    if (updated) {
      setMiniApps(miniApps.map(a =>
        a.id === id ? { ...a, published: !a.published } : a
      ));
      setSuccessMessage(app.published ? 'Mini-app dépubliée' : 'Mini-app publiée');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const toggleFeatured = async (id: string) => {
    const app = miniApps.find(a => a.id === id);
    if (!app) return;

    const updated = await toggleFeaturedStatus(id, !app.featured);
    if (updated) {
      setMiniApps(miniApps.map(a =>
        a.id === id ? { ...a, featured: !a.featured } : a
      ));
      setSuccessMessage(app.featured ? 'Mini-app retirée de la vedette' : 'Mini-app en vedette');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const deleteMiniApp = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette mini-app?')) {
      const success = await deleteMiniAppApi(id);
      if (success) {
        setMiniApps(miniApps.filter(app => app.id !== id));
        setSuccessMessage('Mini-app supprimée');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const publishedApps = miniApps.filter(app => app.published);
  const unpublishedApps = miniApps.filter(app => !app.published);

  return (
    <AdminLayout title="Gestion des Mini-Apps">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="ml-3 text-gray-600">Chargement des mini-apps...</p>
          </div>
        ) : (
          <>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mini-Apps</h2>
            <p className="text-gray-600 mt-1">Total: {miniApps.length} micro-applications</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter une Mini-App
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une nouvelle Mini-App</h3>
            <form onSubmit={handleAddMiniApp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la Mini-App</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="ex: Livraison Express"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="logistics">Logistique</option>
                    <option value="health">Santé</option>
                    <option value="transport">Transport</option>
                    <option value="commerce">Commerce</option>
                    <option value="education">Éducation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez la mini-app..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier APK</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".apk"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner le fichier APK'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedFile ? `Taille: ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Max 100 MB'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                >
                  Ajouter and Publier
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mini-Apps Publiées */}
        {publishedApps.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              Mini-Apps Publiées ({publishedApps.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedApps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{app.name}</h4>
                      {app.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">⭐ Vedette</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{app.category}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-600">{app.description}</p>

                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fichier:</span>
                        <span className="font-medium text-gray-900">{app.fileName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taille:</span>
                        <span className="font-medium text-gray-900">{app.fileSize}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Installations:</span>
                        <span className="font-medium text-emerald-600">{app.installations.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Users uniques:</span>
                        <span className="font-medium text-gray-900">{Number((app as any).uniqueUsers || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Téléphones uniques:</span>
                        <span className="font-medium text-gray-900">{Number((app as any).uniquePhones || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">⭐ {app.rating}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFeatured(app.id)}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition ${
                            app.featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {app.featured ? '⭐ En vedette' : 'Ajouter en vedette'}
                        </button>
                        <button
                          onClick={() => togglePublished(app.id)}
                          className="flex-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium rounded-lg transition"
                        >
                          Dépublier
                        </button>
                      </div>
                      <button
                        onClick={() => deleteMiniApp(app.id)}
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mini-Apps Non Publiées */}
        {unpublishedApps.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-gray-600" />
              Mini-Apps Non Publiées ({unpublishedApps.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unpublishedApps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl border border-gray-300 border-dashed overflow-hidden opacity-75 hover:opacity-100 transition">
                  {/* Card Header */}
                  <div className="bg-gray-100 p-4 border-b border-gray-300">
                    <h4 className="font-bold text-gray-700 text-lg">{app.name}</h4>
                    <p className="text-sm text-gray-500">{app.category}</p>
                    <p className="text-xs text-gray-500 mt-1">🔒 Non publié</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-gray-600">{app.description}</p>

                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fichier:</span>
                        <span className="font-medium text-gray-700">{app.fileName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taille:</span>
                        <span className="font-medium text-gray-700">{app.fileSize}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <button
                        onClick={() => togglePublished(app.id)}
                        className="w-full px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-medium rounded-lg transition"
                      >
                        ✓ Publier
                      </button>
                      <button
                        onClick={() => deleteMiniApp(app.id)}
                        className="w-full px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {miniApps.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune Mini-App</h3>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre première mini-application</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              Ajouter une Mini-App
            </button>
          </div>
        )}
        </>
        )}
      </div>
    </AdminLayout>
  );
}
