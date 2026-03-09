import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import {
  Send,
  Download,
  ScanLine,
  Store,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";

const paymentActions = [
  {
    icon: Send,
    title: "Envoyer argent",
    description: "Vers Mobile Money et banques",
    color: "bg-emerald-500",
    path: "/send-money",
  },
  {
    icon: Download,
    title: "Recevoir argent",
    description: "Générer un QR code",
    color: "bg-blue-500",
    path: "/receive-money",
  },
  {
    icon: ScanLine,
    title: "Scanner QR",
    description: "Payer en scannant un code",
    color: "bg-purple-500",
    path: "/scan-qr",
  },
  {
    icon: Store,
    title: "Payer marchand",
    description: "Boutiques et services",
    color: "bg-amber-500",
    path: "/payments",
  },
];

export default function Payments() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);

      // Fetch stats including transactions
      const fetchTransactions = async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/profile/${parsed.userId}/stats`
          );
          const data = await response.json();
          if (data.stats && data.stats.transactions) {
            // Format transactions for display
            const formatted = data.stats.transactions.map((tx: any) => ({
              name: tx.recipient || "Transfert USSD",
              type: tx.type === "transfer" ? "Envoyé" : "Reçu",
              amount: `${tx.type === "transfer" ? "-" : "+"} ${tx.amount.toLocaleString()} FCFA`,
              date:
                new Date(tx.timestamp).toLocaleDateString("fr-FR") +
                ", " +
                new Date(tx.timestamp).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              status: tx.status || "completed",
              avatar: (tx.recipient || "?").substring(0, 2).toUpperCase(),
            }));
            setTransactions(formatted);
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchTransactions();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez vos transactions</p>
      </div>

      {/* Payment Actions */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 gap-4">
          {paymentActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Transactions récentes</h2>
          <Button variant="ghost" className="text-emerald-500 text-sm">
            Voir tout
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune transaction pour le moment
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 ${
                  index !== transactions.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-sm">
                      {transaction.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{transaction.type}</span>
                      {transaction.status === "completed" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.amount.startsWith("+")
                        ? "text-emerald-500"
                        : "text-gray-900"
                    }`}
                  >
                    {transaction.amount}
                  </p>
                  <button className="mt-1">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
