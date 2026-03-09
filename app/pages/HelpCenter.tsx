import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../lib/core/i18n";
import { motion } from "motion/react";

export default function HelpCenter() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<number | null>(0);

  const faqItems = t('faqItems') || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-12 rounded-b-3xl">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">{t('help')}</h1>
        </div>
        <p className="text-white/80">Trouvez les réponses à vos questions</p>
      </div>

      <div className="px-6 py-6">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Rechercher une question..."
            className="w-full bg-white rounded-xl px-4 py-3 border border-gray-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqItems.length > 0 ? (
            faqItems.map((item: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900 text-left">{item.question}</p>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expanded === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expanded === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 text-gray-600 text-sm border-t border-gray-100"
                  >
                    {item.answer}
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-500">Aucune FAQ disponible</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-200">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Vous n'avez pas trouvé la réponse?</h3>
            <p className="text-gray-600 text-sm mb-4">Notre équipe de support est disponible 24/7 pour vous aider</p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl transition-colors">
              💬 Contactez le support
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Liens rapides</h3>
          <div className="space-y-2">
            {['Report a bug', 'Request a feature', 'Terms of service', 'Privacy policy'].map((link) => (
              <button
                key={link}
                className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

