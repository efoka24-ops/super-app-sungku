import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowLeft, Copy, Share2, Download, Phone, QrCode, CreditCard, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { detectOperator, getOperatorConfig } from "../lib/features/miniapps/utils/operatorDetection";
import { createNotchPayPayment } from "../lib/features/payments/api/notchpayPaymentsApi";
import { toUserErrorMessage } from "../lib/core/network/errorMessages";

type Tab = "qr" | "ussd" | "notchpay";

export default function ReceiveMoney() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("+237 6XX XXX XXX");
  const [qrCode, setQrCode] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("qr");
  const [requestAmount, setRequestAmount] = useState("5000");
  const [requestLabel, setRequestLabel] = useState("");
  const [notchPayLink, setNotchPayLink] = useState("");
  const [creatingLink, setCreatingLink] = useState(false);
  const [requestInfo, setRequestInfo] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/welcome");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setPhoneNumber(parsedUser.phone);

    const qrData = `sungku:${parsedUser.userId}:${parsedUser.phone}`;
    QRCode.toDataURL(qrData, { width: 300 })
      .then((url: string) => setQrCode(url))
      .catch((err: unknown) => console.error("QR code error:", err));
  }, [navigate]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(phoneNumber);
    alert("Numero copie");
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Partage non disponible sur ce navigateur");
      return;
    }

    try {
      await navigator.share({
        title: "Mon QR code Sungku",
        text: `${user?.firstName || ""} ${user?.lastName || ""}\nNumero: ${phoneNumber}`,
        url: window.location.href,
      });
    } catch (err) {
      console.error("Share failed:", err);
      alert("Partage annule ou indisponible");
    }
  };

  const handleDownloadQR = () => {
    if (!qrCode) {
      alert("QR code en cours de generation");
      return;
    }

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `sungku-qr-${user?.userId || "user"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateNotchPayLink = async () => {
    if (!user) return;
    if (!requestAmount || Number(requestAmount) <= 0) {
      setRequestInfo("Entrez un montant valide pour la demande NotchPay.");
      return;
    }

    setCreatingLink(true);
    setRequestInfo("");
    try {
      const response = await createNotchPayPayment({
        amount: Number(requestAmount),
        currency: "XAF",
        phone: user.phone,
        email: user.email || "support@sungku.app",
        callback: window.location.origin + "/receive-money",
        description: requestLabel || `Demande de paiement pour ${user.firstName || "Sungku"}`,
        reference: `RCV_${Date.now()}`,
        metadata: {
          beneficiaryUserId: user.userId,
          beneficiaryPhone: user.phone,
          requestType: "receive-money",
        },
      });
      setNotchPayLink(response.authorizationUrl || "");
      setRequestInfo("Lien NotchPay genere. Vous pouvez maintenant le partager.");
    } catch (error) {
      setRequestInfo(toUserErrorMessage(error, "Impossible de generer le lien NotchPay."));
    } finally {
      setCreatingLink(false);
    }
  };

  const handleShareNotchPayLink = async () => {
    if (!notchPayLink) return;
    if (!navigator.share) {
      navigator.clipboard.writeText(notchPayLink);
      alert("Lien NotchPay copie");
      return;
    }
    await navigator.share({
      title: "Demande de paiement Sungku",
      text: `Payez ${Number(requestAmount).toLocaleString("fr-FR")} FCFA via NotchPay`,
      url: notchPayLink,
    });
  };

  const getUSSDReceiveInfo = () => {
    if (!user?.phone) return null;
    const operator = detectOperator(user.phone);
    const config = operator ? getOperatorConfig(operator) : null;
    if (!config) return null;

    if (operator === "orange") {
      return {
        code: `*144*${user.phone}#`,
        instructions: "Demandez a l envoyeur de composer ce code sur Orange Money.",
      };
    }

    if (operator === "mtn") {
      return {
        code: `*126*5*${user.phone}#`,
        instructions: "Demandez a l envoyeur de composer ce code sur MTN Mobile Money.",
      };
    }

    return {
      code: config.shortCode,
      instructions: `Composez ${config.shortCode} sur ${config.name}.`,
    };
  };

  const ussdInfo = getUSSDReceiveInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Recevoir de l argent</h1>
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col items-center">
        <div className="flex w-full max-w-md bg-gray-200 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === "qr" ? "bg-white shadow text-emerald-600" : "text-gray-600"
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
          <button
            onClick={() => setActiveTab("ussd")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === "ussd" ? "bg-white shadow text-emerald-600" : "text-gray-600"
            }`}
          >
            <Phone className="w-4 h-4" />
            USSD
          </button>
          <button
            onClick={() => setActiveTab("notchpay")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
              activeTab === "notchpay" ? "bg-white shadow text-emerald-600" : "text-gray-600"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            NotchPay
          </button>
        </div>

        {activeTab === "qr" && (
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-6 w-full max-w-md">
            {qrCode ? (
              <div className="w-64 h-64 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 animate-pulse mx-auto">
                <p className="text-gray-500">Generation QR...</p>
              </div>
            )}
            <p className="text-center text-sm text-gray-600">Scannez ce code pour envoyer de l argent</p>
          </div>
        )}

        {activeTab === "ussd" && (
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recevoir via USSD</h2>
              <p className="text-sm text-gray-500 mt-1">Partagez ce code a l envoyeur</p>
            </div>

            {ussdInfo ? (
              <>
                <div className="bg-gray-900 rounded-2xl p-6 text-center mb-4">
                  <p className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{ussdInfo.code}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ussdInfo.code);
                    alert("Code USSD copie");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 mb-4"
                >
                  <Copy className="w-4 h-4" />
                  Copier le code
                </button>
                <p className="text-xs text-gray-500 text-center">{ussdInfo.instructions}</p>
              </>
            ) : (
              <p className="text-center text-gray-500 text-sm">Numero non reconnu. Verifiez votre profil.</p>
            )}
          </div>
        )}

        {activeTab === "notchpay" && (
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recevoir via NotchPay</h2>
              <p className="text-sm text-gray-500 mt-1">Generez un lien de paiement a partager</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant demande (FCFA)</label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  min="100"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Libelle</label>
                <input
                  type="text"
                  value={requestLabel}
                  onChange={(e) => setRequestLabel(e.target.value)}
                  placeholder="Ex: Contribution, remboursement, facture"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>
              <button
                onClick={handleGenerateNotchPayLink}
                disabled={creatingLink}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {creatingLink ? <><Loader className="w-5 h-5 animate-spin" /> Generation...</> : "Generer le lien NotchPay"}
              </button>

              {requestInfo && (
                <p className={`text-sm ${notchPayLink ? 'text-blue-600' : 'text-red-600'}`}>{requestInfo}</p>
              )}

              {notchPayLink && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 space-y-3">
                  <p className="text-xs text-emerald-700 break-all">{notchPayLink}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(notchPayLink);
                        alert("Lien NotchPay copie");
                      }}
                      className="w-full border border-emerald-200 rounded-xl py-3 text-emerald-700 font-medium"
                    >
                      Copier le lien
                    </button>
                    <button
                      onClick={handleShareNotchPayLink}
                      className="w-full bg-emerald-600 rounded-xl py-3 text-white font-medium"
                    >
                      Partager
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {user && (
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 w-full max-w-md mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{user.firstName?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-white text-xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-white/80 text-sm">Compte Sungku</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/70 text-xs mb-1">Numero de compte</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono font-bold">{phoneNumber}</p>
                <button onClick={handleCopyNumber} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md space-y-3">
          <Button onClick={handleShare} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl">
            <Share2 className="w-5 h-5 mr-2" />
            Partager mon code
          </Button>
          <Button onClick={handleDownloadQR} variant="outline" className="w-full h-14 rounded-xl">
            <Download className="w-5 h-5 mr-2" />
            Telecharger le QR code
          </Button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-4 w-full max-w-md">
          <p className="text-sm text-blue-900">
            <span className="font-bold">Astuce:</span> partagez votre code QR, USSD ou un lien NotchPay pour recevoir de l argent.
          </p>
        </div>
      </div>
    </div>
  );
}
