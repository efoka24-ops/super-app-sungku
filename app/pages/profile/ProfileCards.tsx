import { useNavigate } from "react-router";
import { ArrowLeft, CreditCard, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "../../lib/core/i18n";
import { motion } from "motion/react";

export default function ProfileCards() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  useEffect(() => {
    // Load user info from localStorage
    const userData = localStorage.getItem('user');
    const userInfo = userData ? JSON.parse(userData) : null;
    
    // Load cards from localStorage or create dummy data
    const saved = localStorage.getItem('userCards');
    if (saved) {
      setCards(JSON.parse(saved));
    } else {
      const dummyCards = [
        {
          id: 1,
          number: "4532 1234 5678 9010",
          cardholder: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "Sungku User",
          expiry: "12/28",
          type: "Visa",
          isDefault: true
        }
      ];
      setCards(dummyCards);
      localStorage.setItem('userCards', JSON.stringify(dummyCards));
    }
  }, []);

  const handleDeleteCard = (id: number) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    localStorage.setItem('userCards', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{t('cardsAccounts')}</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Plus className="w-6 h-6 text-emerald-500" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Cards List */}
        <div className="space-y-4 mb-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <button
                onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow text-left"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-white/60 text-xs mb-1">{t('cardNumber')}</p>
                    <p className="text-lg font-mono font-bold">{card.number}</p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs mb-1">{t('cardholder')}</p>
                    <p className="font-bold">{card.cardholder}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">{t('expiry')}</p>
                    <p className="font-bold">{card.expiry}</p>
                  </div>
                  {card.isDefault && (
                    <div className="bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold">
                      Par défaut
                    </div>
                  )}
                </div>
              </button>

              {/* Card Details */}
              {selectedCard?.id === card.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-xl p-4 mt-2 space-y-3"
                >
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">🔒 Carte sécurisée</span>
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-lg border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteCard(card.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('deleteCard')}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add Card Button */}
        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl">
          <Plus className="w-5 h-5 mr-2" />
          {t('addCard')}
        </Button>
      </div>
    </div>
  );
}
