import { useNavigate } from "react-router";
import { ArrowLeft, Trash2, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "../../lib/core/i18n";
import { motion } from "motion/react";
import {
  fetchInstalledMiniApps,
  installMiniApp,
  uninstallMiniApp,
  MiniApp
} from "../../lib/features/miniapps/miniappsApi";
import { saveProfileStats } from "../../lib/features/profile/profileStatsApi";

const AVAILABLE_APPS = [
  { id: "livraison", name: "Livraison", icon: "🚚", category: "delivery", color: "bg-emerald-100 text-emerald-600" },
  { id: "pharmacie", name: "Pharmacie", icon: "💊", category: "health", color: "bg-red-100 text-red-600" },
  { id: "rideshare", name: "Ride Share", icon: "🚕", category: "transport", color: "bg-blue-100 text-blue-600" },
  { id: "shopping", name: "Shopping", icon: "🛍️", category: "shopping", color: "bg-purple-100 text-purple-600" },
  { id: "factures", name: "Factures", icon: "📱", category: "bills", color: "bg-amber-100 text-amber-600" },
  { id: "restaurant", name: "Restaurant", icon: "🍕", category: "food", color: "bg-orange-100 text-orange-600" },
  { id: "banking", name: "Banking", icon: "🏦", category: "finance", color: "bg-indigo-100 text-indigo-600" },
  { id: "investment", name: "Investment", icon: "📈", category: "finance", color: "bg-green-100 text-green-600" },
];

export default function ProfileApps() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [installedApps, setInstalledApps] = useState<MiniApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstalledApps();
  }, []);

  const loadInstalledApps = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const apps = await fetchInstalledMiniApps(user.userId);
        setInstalledApps(apps);
        
        // Sync with localStorage for backwards compat
        const appIds = apps.map(a => a.appId);
        localStorage.setItem('installedApps', JSON.stringify(appIds));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async (appId: string) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const success = await uninstallMiniApp(user.userId, appId);
      if (success) {
        const updated = installedApps.filter(app => app.appId !== appId);
        setInstalledApps(updated);
        localStorage.setItem('installedApps', JSON.stringify(updated.map(a => a.appId)));
        
        // Update stats
        await saveProfileStats(user.userId, { miniApps: updated.length });
      }
    }
  };

  const handleInstall = async (appId: string) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const availableApp = AVAILABLE_APPS.find(a => a.id === appId);
      if (!availableApp) return;
      
      const app = await installMiniApp(user.userId, appId, user.phone);
      if (app) {
        const updated = [...installedApps, app];
        setInstalledApps(updated);
        localStorage.setItem('installedApps', JSON.stringify(updated.map(a => a.appId)));
        
        // Update stats
        await saveProfileStats(user.userId, { miniApps: updated.length });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('miniAppsInstalled')}</h1>
            <p className="text-sm text-gray-500">{installedApps.length} installées</p>
          </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Installed Apps Section */}
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Installées</h2>
              {installedApps.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucune mini-app installée</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {installedApps.map((app, idx) => {
                    const appInfo = AVAILABLE_APPS.find(a => a.id === app.appId);
                    if (!appInfo) return null;
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="bg-white rounded-xl p-4 relative group">
                          <div className={`w-14 h-14 ${appInfo.color} rounded-2xl flex items-center justify-center text-2xl mb-3`}>
                            {appInfo.icon}
                          </div>
                          <p className="font-medium text-gray-900 text-sm mb-2">{appInfo.name}</p>
                          <button
                            onClick={() => handleUninstall(app.appId)}
                            className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Désinstaller"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Available Apps Section */}
            {AVAILABLE_APPS.some(app => !installedApps.find(i => i.appId === app.id)) && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Disponibles</h2>
                <div className="grid grid-cols-2 gap-4">
                  {AVAILABLE_APPS.filter(app => !installedApps.find(i => i.appId === app.id)).map((app, idx) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-200">
                        <div className={`w-14 h-14 ${app.color} rounded-2xl flex items-center justify-center text-2xl mb-3`}>
                          {app.icon}
                        </div>
                        <p className="font-medium text-gray-900 text-sm mb-2">{app.name}</p>
                        <button
                          onClick={() => handleInstall(app.id)}
                          className="w-full bg-emerald-100 text-emerald-600 py-1 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors"
                        >
                          <Download className="w-3 h-3 mr-1 inline" />
                          Installer
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
