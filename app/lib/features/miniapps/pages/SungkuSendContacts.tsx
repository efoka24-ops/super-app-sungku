import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Search, Users, Loader, Star } from "lucide-react";
import { motion } from "motion/react";
import { fetchDeviceOrSavedContacts, type Contact } from "../../contacts/contactsApi";
import {
  detectCamPayOperator,
  OPERATOR_INFO,
  normalizePhone,
  isValidCamPhone,
} from "../utils/campayOperator";
import { getFavorites, isFavorite, toggleFavorite } from "../utils/sungkuSendFavorites";

export default function SungkuSendContacts() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = (location.state as { mode?: string })?.mode ?? "transfer";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [favorites, setFavorites] = useState<Contact[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    setUserId(user?.userId || "");
    if (!user?.userId) { setLoading(false); return; }

    fetchDeviceOrSavedContacts(user.userId)
      .then((list) => {
        // Trier alphabétiquement
        setContacts([...list].sort((a, b) => a.name.localeCompare(b.name, "fr")));
        const favMap = new Map(
          getFavorites(user.userId).map((f) => [f.phoneNumber.replace(/\D/g, ""), true])
        );
        setFavorites(
          list
            .filter((c) => favMap.has(c.phoneNumber.replace(/\D/g, "")))
            .slice(0, 6)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phoneNumber.includes(q);
  });

  const handleSelect = (contact: Contact) => {
    const normalized = normalizePhone(contact.phoneNumber);
    const operator = detectCamPayOperator(contact.phoneNumber);
    navigate("/miniapps/sungku-send/transfer", {
      state: { contact: { ...contact, phoneNumber: normalized }, operator, mode },
    });
  };

  const handleToggleFavorite = (contact: Contact) => {
    if (!userId) return;
    toggleFavorite(userId, contact);
    const favMap = new Map(
      getFavorites(userId).map((f) => [f.phoneNumber.replace(/\D/g, ""), true])
    );
    setFavorites(
      contacts
        .filter((c) => favMap.has(c.phoneNumber.replace(/\D/g, "")))
        .slice(0, 6)
    );
  };

  // Grouper par première lettre
  const grouped: Record<string, Contact[]> = {};
  filtered.forEach((c) => {
    const letter = c.name[0]?.toUpperCase() ?? "#";
    grouped[letter] = grouped[letter] ?? [];
    grouped[letter].push(c);
  });
  const letters = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <div className="bg-emerald-600 px-5 pt-12 pb-5 shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Choisir un bénéficiaire</h1>
            <p className="text-white/70 text-xs">Contacts locaux — non envoyés au serveur</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou numéro…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-gray-400 text-sm">Chargement des contacts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Users className="w-14 h-14 text-gray-200" />
            <p className="text-gray-400 text-sm">
              {search ? "Aucun contact correspondant" : "Aucun contact disponible"}
            </p>
          </div>
        ) : (
          <>
            {favorites.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest px-1 mb-2">
                  Favoris
                </p>
                <div className="space-y-1">
                  {favorites.map((contact, idx) => {
                    const op = detectCamPayOperator(contact.phoneNumber);
                    const info = OPERATOR_INFO[op];
                    const valid = isValidCamPhone(contact.phoneNumber);
                    const initials = contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    return (
                      <motion.div
                        key={`fav-${contact.id}-${idx}`}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-colors ${
                          valid
                            ? "bg-amber-50 border border-amber-100"
                            : "bg-gray-50 opacity-40 border border-transparent"
                        }`}
                      >
                        <button
                          onClick={() => valid && handleSelect(contact)}
                          disabled={!valid}
                          className="flex flex-1 items-center gap-3 text-left"
                        >
                          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                            {initials || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">{contact.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{contact.phoneNumber}</p>
                          </div>
                        </button>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${info.badgeClass}`}>
                          {info.emoji} {op}
                        </span>
                        <button
                          onClick={() => handleToggleFavorite(contact)}
                          className="p-2 rounded-lg hover:bg-amber-100"
                          title="Retirer des favoris"
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {letters.map((letter) => (
            <div key={letter} className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
                {letter}
              </p>
              <div className="space-y-1">
                {grouped[letter].map((contact, idx) => {
                  const op = detectCamPayOperator(contact.phoneNumber);
                  const info = OPERATOR_INFO[op];
                  const valid = isValidCamPhone(contact.phoneNumber);
                  const initials = contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <motion.div
                      key={`${contact.id}-${idx}`}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-colors text-left ${
                        valid
                          ? "bg-white hover:bg-emerald-50 border border-gray-100"
                          : "bg-gray-50 opacity-40 cursor-not-allowed border border-transparent"
                      }`}
                    >
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => valid && handleSelect(contact)}
                        disabled={!valid}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                          {initials || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">{contact.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{contact.phoneNumber}</p>
                        </div>
                      </motion.button>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${info.badgeClass}`}
                      >
                        {info.emoji} {op}
                      </span>
                      {valid && userId && (
                        <button
                          onClick={() => handleToggleFavorite(contact)}
                          className="p-2 rounded-lg hover:bg-gray-100"
                          title={isFavorite(userId, contact.phoneNumber) ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFavorite(userId, contact.phoneNumber)
                                ? "fill-amber-400 text-amber-500"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
          </>
        )}
      </div>
    </div>
  );
}
