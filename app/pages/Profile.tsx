import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import {
  User,
  CreditCard,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Grid3x3,
  Bell,
  Globe,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "../lib/core/i18n";
import { fetchProfileStats, saveProfileStats } from "../lib/features/profile/profileStatsApi";

export default function Profile() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    transfers: 0,
    miniApps: 0,
    contacts: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const installedApps = JSON.parse(localStorage.getItem('installedApps') || '[]');

    const fallbackStats = {
      transfers: Number(localStorage.getItem("stats.transfers") || 0),
      miniApps: installedApps.length,
      contacts: Number(localStorage.getItem("stats.contacts") || 0),
    };

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const userId = parsedUser.phone || parsedUser.email || `${parsedUser.firstName}-${parsedUser.lastName}`;

      fetchProfileStats(userId, installedApps.length)
        .then((remoteStats) => {
          const mergedStats = {
            transfers: remoteStats.transfers,
            contacts: remoteStats.contacts,
            miniApps: installedApps.length,
          };

          setStats(mergedStats);
          localStorage.setItem("stats.transfers", String(mergedStats.transfers));
          localStorage.setItem("stats.contacts", String(mergedStats.contacts));

          if (remoteStats.miniApps !== installedApps.length) {
            saveProfileStats(userId, { miniApps: installedApps.length }).catch(() => {
              return;
            });
          }
        })
        .catch(() => {
          setStats(fallbackStats);
        });
    } else {
      setStats(fallbackStats);
    }
  }, []);

  const menuItems = [
    {
      category: t('account'),
      items: [
        { icon: User, label: t('personalInfo'), path: "/profile/info" },
        { icon: CreditCard, label: t('cardsAccounts'), path: "/profile/cards" },
        { icon: Grid3x3, label: t('miniAppsInstalled'), path: "/profile/apps", badge: stats.miniApps.toString() },
      ],
    },
    {
      category: t('preferences'),
      items: [
        { icon: Bell, label: t('notifications'), path: "/settings/notifications" },
        { icon: Globe, label: t('language'), path: "/settings/language", value: "Français" },
        { icon: Shield, label: t('security'), path: "/settings/security" },
      ],
    },
    {
      category: t('support'),
      items: [
        { icon: HelpCircle, label: t('help'), path: "/help" },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/welcome');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Chargement...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Profile Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 pt-12 pb-24 rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">{t('profile')}</h1>
          <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-emerald-500" />
            </div>
            <button 
              onClick={() => navigate("/profile/info")}
              className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white hover:bg-emerald-600 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-white text-xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-white/80 text-sm">{user.phone}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <p className="text-white text-xs font-medium">
                  {t('memberSince')} {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sungku Card */}
      <div className="px-6 -mt-16 mb-6">
        <button
          onClick={() => navigate("/profile/cards")}
          className="w-full text-left group"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex justify-between items-start mb-8">
            <div>
                <p className="text-white/60 text-xs mb-1">Carte Sungku</p>
                <p className="text-xl font-bold font-mono">**** **** **** 1234</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
                <p className="text-white/60 text-xs mb-1">Titulaire</p>
                <p className="font-bold">{user.firstName} {user.lastName}</p>
            </div>
            <div>
                <p className="text-white/60 text-xs mb-1">Exp.</p>
                <p className="font-bold">12/28</p>
            </div>
              <div className="text-white/60 group-hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
          </div>
        </div>
        </button>
        </div>

      {/* Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.transfers}</p>
            <p className="text-xs text-gray-500 mt-1">{t('transfers')}</p>
          </div>
          <div
            className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/profile/apps")}
          >
            <p className="text-2xl font-bold text-gray-900">{stats.miniApps}</p>
            <p className="text-xs text-gray-500 mt-1">{t('miniApps')}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.contacts}</p>
            <p className="text-xs text-gray-500 mt-1">{t('contacts')}</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-6 space-y-6 mb-6">
        {menuItems.map((section) => (
          <div key={section.category}>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 px-2">
              {section.category}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    onClick={() => navigate(item.path)}
                    key={item.label}
                    className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left ${
                      index !== section.items.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.value && (
                        <span className="text-gray-500 text-sm">{item.value}</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-6 mb-6">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-14 border-red-200 text-red-500 hover:bg-red-50 rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t('logout')}
        </Button>
      </div>

      {/* Legal Links */}
      <div className="px-6 mb-6">
        <div className="bg-gray-100 rounded-2xl p-4 space-y-3">
          <button
            onClick={() => navigate('/legal/terms')}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline w-full text-left"
          >
            📄 {language === 'fr' ? "Conditions d'utilisation" : "Terms of Service"}
          </button>
          <button
            onClick={() => navigate('/legal/privacy')}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline w-full text-left"
          >
            🔒 {language === 'fr' ? "Politique de confidentialité" : "Privacy Policy"}
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="text-center pb-6">
        <p className="text-xs text-gray-400">{t('version')}</p>
        <p className="text-xs text-gray-400 mt-1">{t('awardedICT')} 🏆</p>
      </div>

      <BottomNav />
    </div>
  );
}
