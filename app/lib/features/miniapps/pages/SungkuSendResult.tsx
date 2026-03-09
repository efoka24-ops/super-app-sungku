import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle, XCircle, Copy, Home, Download } from 'lucide-react';

interface ResultState {
  success: boolean;
  transactionId: string;
  operator: string;
  phoneNumber: string;
  amount: string;
  message: string;
  code?: string; // Code de réponse USSD
}

export default function SungkuSendResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state] = useState<ResultState>(
    (location.state as ResultState) || {
      success: false,
      transactionId: '',
      operator: 'unknown',
      phoneNumber: '',
      amount: '0',
      message: 'Erreur lors de la transaction'
    }
  );
  const [copied, setCopied] = useState(false);

  const copyTransactionId = () => {
    navigator.clipboard.writeText(state.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // Télécharger le reçu en PDF
    const receipt = `
Transaction USSD Sungku Send
============================
Statut: ${state.success ? 'RÉUSSIE ✓' : 'ÉCHOUÉE ✗'}
ID Transactionnel: ${state.transactionId}
Opérateur: ${state.operator}
Destinataire: ${state.phoneNumber}
Montant: ${state.amount} FCFA
Message: ${state.message}
Date/Heure: ${new Date().toLocaleString('fr-FR')}
============================
    `;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${state.transactionId}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-8">
      {/* Header */}
      <div className={`text-white p-4 text-center ${state.success ? 'bg-emerald-600' : 'bg-red-600'}`}>
        <h1 className="text-2xl font-bold">Sungku Send</h1>
        <p className="text-sm opacity-90">Résultat de la transaction</p>
      </div>

      <div className="max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {/* Result Icon */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
            state.success ? 'bg-emerald-100' : 'bg-red-100'
          }`}
        >
          {state.success ? (
            <CheckCircle className="w-16 h-16 text-emerald-600" />
          ) : (
            <XCircle className="w-16 h-16 text-red-600" />
          )}
        </div>

        {/* Result Message */}
        <h2
          className={`text-2xl font-bold text-center mb-2 ${
            state.success ? 'text-emerald-900' : 'text-red-900'
          }`}
        >
          {state.success ? 'Transaction réussie !' : 'Transaction échouée'}
        </h2>

        <p className="text-gray-600 text-center mb-8">{state.message}</p>

        {/* Transaction Details */}
        <div className="w-full bg-white rounded-lg border border-gray-200 p-6 space-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">ID Transaction</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-sm font-bold text-gray-900">{state.transactionId}</p>
              <button
                onClick={copyTransactionId}
                className="p-2 hover:bg-gray-100 rounded transition"
              >
                <Copy className={`w-4 h-4 ${copied ? 'text-emerald-600' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Détails</p>
            <div className="space-y-2 mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Opérateur:</span>
                <span className="font-medium">{state.operator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destinataire:</span>
                <span className="font-medium">{state.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant:</span>
                <span className="font-bold text-emerald-600">{state.amount} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date/Heure:</span>
                <span className="font-medium">{new Date().toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={handleSave}
            className="w-full px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Sauvegarder le reçu
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>

        {/* Info Box */}
        <div className="w-full mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700">
            💡 <span className="font-semibold">Conseil:</span> Votre transaction a été envoyée avec succès. Vous recevrez une confirmation SMS de votre opérateur dans les prochaines secondes.
          </p>
        </div>
      </div>
    </div>
  );
}
