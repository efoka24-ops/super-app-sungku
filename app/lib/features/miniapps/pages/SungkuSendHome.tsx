import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, RefreshCw, Clock, ChevronRight, Shield } from "lucide-react";
import { motion } from "motion/react";
import { fetchCamPayHistory, type CamPayTx } from "../api/campayApi";
import { detectCamPayOperator, OPERATOR_INFO, formatPhoneDisplay } from "../utils/campayOperator";
import { getFavorites, type FavoriteContact } from "../utils/sungkuSendFavorites";

export default function SungkuSendHome() {
  const navigate = useNavigate();
  const [recentTx, setRecentTx] = useState<CamPayTx[]>([]);
  const [favoriteContacts, setFavoriteContacts] = useState<FavoriteContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user?.userId) { setLoading(false); return; }
    setFavoriteContacts(getFavorites(user.userId).slice(0, 4));
    fetchCamPayHistory(user.userId, { page: 1 })
      .then((d) => {
        setRecentTx(d.transactions.slice(0, 4));
        // Si l'utilisateur a des transactions, on prend le solde du plus récent sinon 0
        if (d.transactions.length > 0 && typeof d.transactions[0].balance === 'number') {
          setBalance(d.transactions[0].balance);
        } else {
          setBalance(0);
        }
      })
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  // Déduplique par numéro bénéficiaire (4 contacts max)
  const quickContacts = [...new Map(recentTx.map((t) => [t.to_number, t])).values()].slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 pt-12 pb-8 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-4 mb-7">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Sungku Send</h1>
            <p className="text-white/75 text-sm">Transferts & recharges instantanés</p>
          </div>
          <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium">
            🏆 ICT Week
          </span>
        </div>

        {/* ── Wallet card ── */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 rounded-2xl p-5 shadow-lg"
        >
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Solde estimé</p>
          <p className="text-3xl font-extrabold text-gray-900 mb-5">{balance?.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) || 0} FCFA</p>

          {balance === 0 && (
            <button
              onClick={() => navigate("/home")}
              className="w-full mb-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl py-3 transition-colors border border-emerald-200"
            >
              Retourner à la super app
            </button>
          )}

          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate("/miniapps/sungku-send/contacts", { state: { mode: "transfer" } })}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-3.5 flex flex-col items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
              <span className="text-xs font-bold">Envoyer</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate("/miniapps/sungku-send/airtime")}
              className="bg-amber-400 hover:bg-amber-500 text-amber-900 rounded-xl py-3.5 flex flex-col items-center gap-1.5 transition-colors shadow-sm"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-xs font-bold">Recharger</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate("/miniapps/sungku-send/history")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3.5 flex flex-col items-center gap-1.5 transition-colors shadow-sm"
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs font-bold">Historique</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Contacts récents ── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Contacts rapides</h2>
          <button
            onClick={() => navigate("/miniapps/sungku-send/contacts", { state: { mode: "transfer" } })}
            className="text-emerald-600 text-sm font-medium flex items-center gap-1"
          >
            Voir tous <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="w-14 h-2.5 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : favoriteContacts.length > 0 ? (
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Favoris</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {favoriteContacts.map((c) => {
                const op = detectCamPayOperator(c.phoneNumber);
                const info = OPERATOR_INFO[op];
                return (
                  <motion.button
                    key={`fav-${c.phoneNumber}`}
                    whileTap={{ scale: 0.93 }}
                    onClick={() =>
                      navigate("/miniapps/sungku-send/transfer", {
                        state: {
                          contact: {
                            id: c.id,
                            userId: "",
                            name: c.name,
                            phoneNumber: c.phoneNumber,
                            addedAt: c.addedAt,
                          },
                          operator: op,
                        },
                      })
                    }
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || c.phoneNumber.slice(-2)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-base">{info.emoji}</span>
                    </div>
                    <span className="text-xs text-gray-500 text-center leading-tight truncate w-full">
                      {c.name.split(" ")[0] || c.phoneNumber.slice(-6)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {quickContacts.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Récents</p>
                <div className="grid grid-cols-4 gap-3">
                  {quickContacts.map((tx) => {
                    const op = detectCamPayOperator(tx.to_number);
                    const info = OPERATOR_INFO[op];
                    return (
                      <motion.button
                        key={tx.to_number}
                        whileTap={{ scale: 0.93 }}
                        onClick={() =>
                          navigate("/miniapps/sungku-send/transfer", {
                            state: {
                              contact: {
                                id: tx.to_number,
                                userId: "",
                                name: formatPhoneDisplay(tx.to_number),
                                phoneNumber: tx.to_number,
                                addedAt: tx.created_at,
                              },
                              operator: op,
                            },
                          })
                        }
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                            {tx.to_number.slice(-4)}
                          </div>
                          <span className="absolute -bottom-1 -right-1 text-base">{info.emoji}</span>
                        </div>
                        <span className="text-xs text-gray-500 text-center leading-tight">
                          {tx.to_number.slice(-6)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : quickContacts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <p className="text-gray-400 text-sm">Aucune transaction récente</p>
            <button
              onClick={() => navigate("/miniapps/sungku-send/contacts", { state: { mode: "transfer" } })}
              className="mt-3 text-emerald-600 text-sm font-semibold"
            >
              Envoyer à un contact →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {quickContacts.map((tx) => {
              const op = detectCamPayOperator(tx.to_number);
              const info = OPERATOR_INFO[op];
              return (
                <motion.button
                  key={tx.to_number}
                  whileTap={{ scale: 0.93 }}
                  onClick={() =>
                    navigate("/miniapps/sungku-send/transfer", {
                      state: {
                        contact: {
                          id: tx.to_number,
                          userId: "",
                          name: formatPhoneDisplay(tx.to_number),
                          phoneNumber: tx.to_number,
                          addedAt: tx.created_at,
                        },
                        operator: op,
                      },
                    })
                  }
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {tx.to_number.slice(-4)}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-base">{info.emoji}</span>
                  </div>
                  <span className="text-xs text-gray-500 text-center leading-tight">
                    {tx.to_number.slice(-6)}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Opérateurs supportés ── */}
      <div className="px-5 mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Opérateurs supportés</h2>
        <div className="grid grid-cols-4 gap-3">
          {(["MTN", "ORANGE", "YOOMEE", "BLUE"] as const).map((op) => (
            <div
              key={op}
              className="bg-white rounded-xl p-3 flex flex-col items-center gap-1 border border-gray-100 shadow-sm"
            >
              <span className="text-2xl">{OPERATOR_INFO[op].emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{op}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bandeau sécurité ── */}
      <div className="px-5 mt-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700 leading-relaxed">
            Vos contacts restent sur votre appareil. Seul le numéro du bénéficiaire sélectionné
            est transmis lors d'une transaction. Propulsé par CamPay API.
          </p>
        </div>
      </div>
    </div>
  );
}
