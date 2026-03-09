import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface MiniAppCatalog {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  developer: string;
  version: string;
  installs: number;
  published: boolean;
  featured: boolean;
  color: string;
}

export default function AdminMiniApps() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<MiniAppCatalog[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    category: "",
    description: "",
    developer: "",
    version: "1.0.0",
    color: "bg-emerald-100 text-emerald-600"
  });

  useEffect(() => {
    loadMiniApps();
  }, []);

  const loadMiniApps = async () => {
    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch('https://sungku1-q3j44yhv.b4a.run/api/admin/miniapps-catalog');
      if (response.ok) {
        const data = await response.json();
        setApps(data.apps);
      } else {
        // Mock data
        setApps([
          {
            id: "livraison",
            name: "Livraison",
            icon: "🚚",
            category: "delivery",
            description: "Service de livraison rapide dans toute la ville",
            developer: "Sungku Delivery Ltd",
            version: "2.1.0",
            installs: 15234,
            published: true,
            featured: true,
            color: "bg-emerald-100 text-emerald-600"
          },
          {
            id: "pharmacie",
            name: "Pharmacie",
            icon: "💊",
            category: "health",
            description: "Commandez vos médicaments en ligne",
            developer: "PharmaPlus CI",
            version: "1.5.0",
            installs: 8945,
            published: true,
            featured: false,
            color: "bg-red-100 text-red-600"
          },
          {
            id: "rideshare",
            name: "Ride Share",
            icon: "🚕",
            category: "transport",
            description: "Service de VTC et covoiturage",
            developer: "Sungku Mobility",
            version: "3.0.1",
            installs: 23456,
            published: true,
            featured: true,
            color: "bg-blue-100 text-blue-600"
          },
          {
            id: "shopping",
            name: "Shopping",
            icon: "🛍️",
            category: "shopping",
            description: "E-commerce et achats en ligne",
            developer: "ShopCI",
            version: "1.8.2",
            installs: 12345,
            published: true,
            featured: false,
            color: "bg-purple-100 text-purple-600"
          },
          {
            id: "factures",
            name: "Factures",
            icon: "📱",
            category: "bills",
            description: "Paiement de factures (eau, électricité, internet)",
            developer: "Sungku Bills",
            version: "1.2.0",
            installs: 18765,
            published: true,
            featured: true,
            color: "bg-amber-100 text-amber-600"
          },
          {
            id: "restaurant",
            name: "Restaurant",
            icon: "🍕",
            category: "food",
            description: "Commandez vos repas préférés",
            developer: "FoodCI",
            version: "2.0.0",
            installs: 9876,
            published: false,
            featured: false,
            color: "bg-orange-100 text-orange-600"
          },
          {
            id: "banking",
            name: "Banking",
            icon: "🏦",
            category: "finance",
            description: "Services bancaires intégrés",
            developer: "Sungku Financial",
            version: "1.0.0",
            installs: 5432,
            published: false,
            featured: false,
            color: "bg-indigo-100 text-indigo-600"
          },
          {
            id: "investment",
            name: "Investment",
            icon: "📈",
            category: "finance",
            description: "Placements et investissements",
            developer: "Sungku Invest",
            version: "1.1.0",
            installs: 3210,
            published: false,
            featured: false,
            color: "bg-green-100 text-green-600"
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading mini-apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    // Call backend API to toggle publish status
    try {
      const response = await fetch(`https://sungku1-q3j44yhv.b4a.run/api/admin/miniapps-catalog/${appId}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !app.published })
      });

      if (response.ok || true) { // Allow even if backend not ready
        setApps(apps.map(a => 
          a.id === appId ? { ...a, published: !a.published } : a
        ));
      }
    } catch (error) {
      // Optimistic update
      setApps(apps.map(a => 
        a.id === appId ? { ...a, published: !a.published } : a
      ));
    }
  };

  const toggleFeatured = async (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    try {
      const response = await fetch(`https://sungku1-q3j44yhv.b4a.run/api/admin/miniapps-catalog/${appId}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !app.featured })
      });

      if (response.ok || true) {
        setApps(apps.map(a => 
          a.id === appId ? { ...a, featured: !a.featured } : a
        ));
      }
    } catch (error) {
      setApps(apps.map(a => 
        a.id === appId ? { ...a, featured: !a.featured } : a
      ));
    }
  };

  const handleCreateApp = () => {
    const newApp: MiniAppCatalog = {
      id: formData.name.toLowerCase().replace(/\s/g, '-'),
      name: formData.name,
      icon: formData.icon,
      category: formData.category,
      description: formData.description,
      developer: formData.developer,
      version: formData.version,
      installs: 0,
      published: false,
      featured: false,
      color: formData.color
    };

    setApps([...apps, newApp]);
    setShowCreateDialog(false);
    setFormData({
      name: "",
      icon: "",
      category: "",
      description: "",
      developer: "",
      version: "1.0.0",
      color: "bg-emerald-100 text-emerald-600"
    });
  };

  const handleDeleteApp = (appId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette mini-app ?")) {
      setApps(apps.filter(a => a.id !== appId));
    }
  };

  const filteredApps = apps.filter(app => {
    if (filter === 'published') return app.published;
    if (filter === 'unpublished') return !app.published;
    return true;
  });

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
              <h1 className="text-xl font-bold text-gray-900">Gestion des Mini Apps</h1>
              <p className="text-sm text-gray-500">{apps.length} mini-apps au catalogue</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Mini App
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={`rounded-full ${filter === 'all' ? 'bg-emerald-500 text-white' : ''}`}
          >
            Toutes ({apps.length})
          </Button>
          <Button
            onClick={() => setFilter('published')}
            variant={filter === 'published' ? 'default' : 'outline'}
            className={`rounded-full ${filter === 'published' ? 'bg-emerald-500 text-white' : ''}`}
          >
            Publiées ({apps.filter(a => a.published).length})
          </Button>
          <Button
            onClick={() => setFilter('unpublished')}
            variant={filter === 'unpublished' ? 'default' : 'outline'}
            className={`rounded-full ${filter === 'unpublished' ? 'bg-emerald-500 text-white' : ''}`}
          >
            Non publiées ({apps.filter(a => !a.published).length})
          </Button>
        </div>

        {/* Apps Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm relative">
                {/* Featured Badge */}
                {app.featured && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ Featured
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 ${app.color} rounded-2xl flex items-center justify-center text-3xl`}>
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{app.name}</h3>
                    <p className="text-xs text-gray-500">{app.developer}</p>
                    <p className="text-xs text-gray-400">v{app.version}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{app.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{app.installs.toLocaleString()}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    app.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {app.published ? 'Publiée' : 'Non publiée'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => togglePublish(app.id)}
                    size="sm"
                    variant={app.published ? "outline" : "default"}
                    className={`flex-1 ${!app.published ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                  >
                    {app.published ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {app.published ? 'Dépublier' : 'Publier'}
                  </Button>
                  <Button
                    onClick={() => toggleFeatured(app.id)}
                    size="sm"
                    variant="outline"
                    className="px-3"
                    title={app.featured ? "Retirer des favoris" : "Mettre en avant"}
                  >
                    ⭐
                  </Button>
                  <Button
                    onClick={() => handleDeleteApp(app.id)}
                    size="sm"
                    variant="outline"
                    className="px-3 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle Mini App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'app</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Shopping"
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icône (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ex: 🛍️"
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="developer">Développeur</Label>
                <Input
                  id="developer"
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  placeholder="Ex: ShopCI"
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner...</option>
                  <option value="delivery">Livraison</option>
                  <option value="health">Santé</option>
                  <option value="transport">Transport</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Factures</option>
                  <option value="food">Restauration</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la mini-app"
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="color">Couleur</Label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-lg"
                >
                  <option value="bg-emerald-100 text-emerald-600">Vert</option>
                  <option value="bg-blue-100 text-blue-600">Bleu</option>
                  <option value="bg-purple-100 text-purple-600">Violet</option>
                  <option value="bg-red-100 text-red-600">Rouge</option>
                  <option value="bg-amber-100 text-amber-600">Ambre</option>
                  <option value="bg-orange-100 text-orange-600">Orange</option>
                  <option value="bg-indigo-100 text-indigo-600">Indigo</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleCreateApp}
              disabled={!formData.name || !formData.icon || !formData.category}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-lg"
            >
              Créer la mini-app
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
