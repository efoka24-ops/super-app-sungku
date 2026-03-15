import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowLeft, Copy, Share2, Download } from "lucide-react";
import { useState, useEffect } from "react";
import QRCode from "qrcode";

export default function ReceiveMoney() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("+225 07 XX XX XX XX");
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setPhoneNumber(parsedUser.phone);

      // Generate QR code for payment
      const qrData = `sungku:${parsedUser.userId}:${parsedUser.phone}`;
      QRCode.toDataURL(qrData, { width: 300 })
        .then((url) => setQrCode(url))
        .catch((err) => console.error("QR code error:", err));
    } else {
      navigate("/welcome");
    }
  }, [navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    alert("Numéro copié !");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mon QR code Sungku",
          text: `${user?.firstName} ${user?.lastName} \nNuméro: ${phoneNumber}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
        alert("Partage non disponible sur ce navigateur");
      }
    } else {
      alert("Le partage n'est pas disponible sur ce navigateur");
    }
  };

  const handleDownload = () => {
    if (!qrCode) {
      alert("QR code en cours de génération...");
      return;
    }

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `sungku-qr-${user?.userId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Recevoir de l'argent</h1>
        </div>
      </div>

      <div className="px-6 py-8 flex flex-col items-center">
        {/* QR Code */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-6">
          {qrCode ? (
            <div className="w-64 h-64 rounded-2xl flex items-center justify-center mb-4">
              <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
              <p className="text-gray-500">Génération QR...</p>
            </div>
          )}
          <p className="text-center text-sm text-gray-600">Scannez ce code pour m'envoyer de l'argent</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 w-full max-w-md mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user.firstName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-white text-xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-white/80 text-sm">Compte Sungku</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/70 text-xs mb-1">Numéro de compte</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono font-bold">{phoneNumber}</p>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-3">
          <Button
            onClick={handleShare}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Partager mon QR code
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="w-full h-14 rounded-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger le QR code
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-4 w-full max-w-md">
          <p className="text-sm text-blue-900">
            <span className="font-bold">💡 Astuce:</span> Partagez votre QR code ou votre numéro de compte pour recevoir de l'argent instantanément.
          </p>
        </div>
      </div>
    </div>
  );
}
