import { useNavigate } from "react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useLanguage } from "../../lib/core/i18n";
import { motion } from "motion/react";
import { updateLanguage } from "../../lib/features/settings/settingsApi";

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default function SettingsLanguage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = async (newLang: 'fr' | 'en') => {
    // Update local state
    setLanguage(newLang);
    
    // Sync with backend
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      await updateLanguage(user.userId, newLang);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t('language')}</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {LANGUAGES.map((lang, idx) => (
            <motion.button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as 'fr' | 'en')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`w-full flex items-center justify-between p-6 transition-colors ${
                language === lang.code
                  ? 'bg-emerald-50 border-l-4 border-emerald-500'
                  : 'hover:bg-gray-50 border-b border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{lang.name}</p>
                  <p className="text-sm text-gray-500">
                    {language === lang.code && '✓ Actuellement sélectionné'}
                  </p>
                </div>
              </div>
              {language === lang.code && (
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            💡 L'application s'adapte immédiatement à votre sélection de langue. Les modifications sont sauvegardées automatiquement.
          </p>
        </div>
      </div>
    </div>
  );
}
