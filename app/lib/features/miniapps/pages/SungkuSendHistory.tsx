import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import { fetchCamPayHistory, type CamPayTx } from "../api/campayApi";
import { OPERATOR_INFO, detectCamPayOperator, formatPhoneDisplay } from "../utils/campayOperator";

type FilterType = "ALL" | "TRANSFER" | "AIRTIME";
type FilterStatus = "ALL" | "SUCCESSFUL" | "PENDING" | "FAILED";

export default function SungkuSendHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CamPayTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const loadHistory = useCallback(
    async (p: number) => {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.userId) { setLoading(false); return; }

      setLoading(true);
      try {
        const d = await fetchCamPayHistory(user.userId, {
          type: filterType !== "ALL" ? filterType : undefined,
          status: filterStatus !== "ALL" ? filterStatus : undefined,
          page: p,
        });
        if (p === 1) {
          setTransactions(d.transactions);
        } else {
          setTransactions((prev) => [...prev, ...d.transactions]);
        }
        setTotal(d.total);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    },
    [filterType, filterStatus]
  );

  useEffect(() => {
    setPage(1);
    loadHistory(1);
  }, [loadHistory]);

  const refresh = () => {
    setPage(1);
    loadHistory(1);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadHistory(next);
  };

  const statusIcon = (s: string) =>
    s === "SUCCESSFUL" ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : s === "FAILED" ? (
      <XCircle className="w-4 h-4 text-red-500" />
    ) : (
      <Clock className="w-4 h-4 text-amber-500" />
    );

  const statusLabel = (s: string) =>
    s === "SUCCESSFUL" ? "Réussi" : s === "FAILED" ? "Échoué" : "En attente";

  const statusClass = (s: string) =>
    s === "SUCCESSFUL"
      ? "bg-green-50 text-green-700"
      : s === "FAILED"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-emerald-600 px-5 pt-12 pb-5">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">Historique</h1>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2">
          {(["ALL", "TRANSFER", "AIRTIME"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterType === f ? "bg-white text-emerald-700 shadow-sm" : "bg-white/20 text-white"
              }`}
            >
              {f === "ALL" ? "Tous" : f === "TRANSFER" ? "Transferts" : "Recharges"}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div className="bg-white px-5 py-3 flex gap-2 overflow-x-auto border-b border-gray-100">
        {(["ALL", "SUCCESSFUL", "PENDING", "FAILED"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
              filterStatus === s
                ? "bg-emerald-500 text-white border-emerald-500"
                : "text-gray-600 border-gray-200 hover:border-emerald-300"
            }`}
          >
            {s === "ALL"
              ? "Tous les statuts"
              : s === "SUCCESSFUL"
              ? "Réussis"
              : s === "PENDING"
              ? "En attente"
              : "Échoués"}
          </button>
        ))}
      </div>

      {/* ── Transactions ── */}
      <div className="px-5 py-4 space-y-3">
        {loading && transactions.length === 0 && (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aucune transaction trouvée</p>
            <button
              onClick={() => navigate("/miniapps/sungku-send")}
              className="mt-4 text-emerald-600 font-semibold text-sm"
            >
              Faire un premier transfert →
            </button>
          </div>
        )}

        {transactions.map((tx) => {
          const op = detectCamPayOperator(tx.to_number);
          const info = OPERATOR_INFO[op];
          const date = new Date(tx.created_at).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={tx.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${
                  tx.type === "TRANSFER" ? "bg-emerald-100" : "bg-amber-100"
                }`}
              >
                {tx.type === "TRANSFER" ? "💸" : "📱"}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{tx.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {info.emoji} {formatPhoneDisplay(tx.to_number)} · {date}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900 text-sm">
                  {tx.amount.toLocaleString("fr-FR")} XAF
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${statusClass(tx.status)}`}
                >
                  {statusIcon(tx.status)}
                  {statusLabel(tx.status)}
                </span>
              </div>
            </div>
          );
        })}

        {transactions.length < total && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-4 text-emerald-600 font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Chargement…" : `Charger plus (${total - transactions.length} restants)`}
          </button>
        )}
      </div>
    </div>
  );
}
