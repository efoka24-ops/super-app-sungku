import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Building2, CreditCard, Loader, CheckCircle2, ReceiptText } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { checkNotchPayPayment, createNotchPayPayment } from "../lib/features/payments/api/notchpayPaymentsApi";
import { toUserErrorMessage } from "../lib/core/network/errorMessages";

export default function PayMerchant() {
  const navigate = useNavigate();
  const [merchantName, setMerchantName] = useState("");
  const [merchantReference, setMerchantReference] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pendingReference, setPendingReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!pendingReference) return;
    const onVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        setInfo("Verification du paiement marchand NotchPay...");
        const result = await checkNotchPayPayment(pendingReference);
        const status = String((result.payment as { status?: string })?.status || "").toLowerCase();
        if (status === "completed") {
          setSuccess(true);
          setPendingReference(null);
          setInfo("");
        } else if (status === "failed") {
          setError("Paiement marchand echoue");
          setInfo("");
        } else {
          setInfo("Paiement en attente. Revenez ici puis relancez la verification.");
        }
      } catch (err) {
        setError(toUserErrorMessage(err, "Verification impossible"));
      } finally {
        setLoading(false);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [pendingReference]);

  const verifyPayment = async () => {
    if (!pendingReference) return;
    setLoading(true);
    setError("");
    try {
      const result = await checkNotchPayPayment(pendingReference);
      const status = String((result.payment as { status?: string })?.status || "").toLowerCase();
      if (status === "completed") {
        setSuccess(true);
        setPendingReference(null);
        setInfo("");
      } else if (status === "failed") {
        setError("Paiement marchand echoue");
        setInfo("");
      } else {
        setInfo("Paiement toujours en attente chez NotchPay.");
      }
    } catch (err) {
      setError(toUserErrorMessage(err, "Verification impossible"));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!merchantName || !amount) {
      setError("Renseignez le marchand et le montant.");
      return;
    }

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await createNotchPayPayment({
        amount: Number(amount),
        currency: "XAF",
        locked_channel: "cm.mtn",
        callback: `${window.location.origin}/pay-merchant`,
        description: description || `Paiement marchand ${merchantName}`,
        phone: user?.phone || undefined,
        email: user?.email || "support@sungku.app",
        customer: {
          name: `${user?.firstName || "Sungku"} ${user?.lastName || "User"}`,
          email: user?.email || "support@sungku.app",
          phone: user?.phone || "",
        },
        reference: merchantReference || `MRC_${Date.now()}`,
        metadata: {
          userId: user?.userId,
          merchantName,
          merchantReference,
          description,
        },
      });
      setPendingReference(response.reference);
      if (response.authorizationUrl) {
        window.open(response.authorizationUrl, "_blank", "noopener,noreferrer");
      }
      setInfo("NotchPay ouvert. Finalisez le paiement marchand puis revenez dans Sungku.");
    } catch (err) {
      setError(toUserErrorMessage(err, "Impossible de lancer le paiement"));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement confirme</h1>
        <p className="text-gray-600 text-center mb-8">{Number(amount).toLocaleString("fr-FR")} FCFA payes a {merchantName}</p>
        <div className="w-full max-w-sm space-y-3">
          <Button onClick={() => navigate("/payments")} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl">
            Retour aux paiements
          </Button>
          <Button onClick={() => navigate("/home")} variant="outline" className="w-full h-14 rounded-xl">
            Retour a l accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payer un marchand</h1>
            <p className="text-sm text-gray-500">Paiement heberge par NotchPay</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
          <div className="flex items-center gap-3 text-emerald-700">
            <CreditCard className="w-5 h-5" />
            <p className="font-semibold">NotchPay</p>
          </div>

          <div>
            <Label htmlFor="merchantName">Nom du marchand</Label>
            <div className="relative mt-2">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="merchantName" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} className="pl-12 h-14 rounded-xl" placeholder="Ex: Boutique Sungku" />
            </div>
          </div>

          <div>
            <Label htmlFor="merchantReference">Reference marchand</Label>
            <Input id="merchantReference" value={merchantReference} onChange={(e) => setMerchantReference(e.target.value)} className="h-14 rounded-xl mt-2" placeholder="Numero de caisse, compte, facture" />
          </div>

          <div>
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-14 rounded-xl mt-2" placeholder="10000" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <div className="relative mt-2">
              <ReceiptText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="pl-12 h-14 rounded-xl" placeholder="Achat, service, facture..." />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {info && <p className="text-sm text-blue-600 text-center">{info}</p>}

        {pendingReference && !loading && (
          <Button onClick={verifyPayment} variant="outline" className="w-full h-12 rounded-xl">
            Verifier le paiement
          </Button>
        )}

        <Button onClick={handlePay} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl flex items-center justify-center gap-2">
          {loading ? <><Loader className="w-5 h-5 animate-spin" /> Ouverture NotchPay...</> : "Payer avec NotchPay"}
        </Button>
      </div>
    </div>
  );
}