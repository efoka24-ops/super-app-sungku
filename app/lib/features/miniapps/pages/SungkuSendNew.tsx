import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Phone, Users, AlertCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import {
  detectOperator,
  getOperatorConfig,
  formatCameroonNumber,
  isValidCameroonNumber,
  type Operator
} from '../utils/operatorDetection';
import { initiateUSSD } from '../api/ussdApi';

export default function SungkuSendPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [detectedOperator, setDetectedOperator] = useState<Operator | null>(null);
  const [showContactList, setShowContactList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'sending'>('form');

  // Mock contacts
  const mockContacts = [
    { name: 'Jean Dupont', phone: '656789012', operator: 'orange' as Operator },
    { name: 'Marie Martin', phone: '687654321', operator: 'mtn' as Operator },
    { name: 'Paul Soe', phone: '659876543', operator: 'orange' as Operator },
    { name: 'Sophie Legrand', phone: '681234567', operator: 'mtn' as Operator }
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Limiter à 12 chiffres max
    if (value.length > 12) value = value.substring(0, 12);
    
    setPhoneNumber(value);

    // Détection automatique
    if (value.length >= 2) {
      const operator = detectOperator(value);
      setDetectedOperator(operator);
    } else {
      setDetectedOperator(null);
    }
  };

  const selectContact = (contact: typeof mockContacts[0]) => {
    setPhoneNumber(contact.phone);
    setDetectedOperator(contact.operator);
    setShowContactList(false);
  };

  const handleSend = async () => {
    setError('');

    // Validations
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!isValidCameroonNumber(phoneNumber)) {
      setError('Numéro camerounais invalide');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    if (detectedOperator === 'unknown') {
      setError('Opérateur non reconnu');
      return;
    }

    if (step === 'form') {
      setStep('confirm');
      return;
    }

    // Lancer la requête USSD
    setStep('sending');
    setLoading(true);

    try {
      // Appel API réel
      const response = await initiateUSSD(
        phoneNumber,
        detectedOperator || 'unknown',
        parseInt(amount)
      );

      if (response.success) {
        // Naviguer vers la page de résultat avec succès
        navigate('/miniapps/sungku-send/result', {
          state: {
            success: true,
            transactionId: response.transactionId,
            operator: detectedOperator,
            phoneNumber: formatCameroonNumber(phoneNumber),
            amount: amount,
            message: `Transaction de ${amount} FCFA vers ${phoneNumber} réussie`,
            code: response.code
          }
        });
      } else {
        setError(response.message || 'Erreur lors du traitement');
        setStep('confirm');
        setLoading(false);
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
      setStep('confirm');
      setLoading(false);
    }
  };

  const operatorConfig = detectedOperator ? getOperatorConfig(detectedOperator) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-8">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-emerald-700 rounded-lg">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Sungku Send</h1>
          <p className="text-sm text-emerald-100">Envoyez de l'argent via USSD</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {['form', 'confirm', 'sending'].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition ${
                step === s || (step !== 'form' && i < ['form', 'confirm', 'sending'].indexOf(step))
                  ? 'bg-emerald-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <div className="space-y-4">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="656789012 ou +237 65 67 89 012"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setShowContactList(!showContactList)}
                  className="px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>

              {/* Contact List Modal */}
              {showContactList && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                  <div className="p-2 bg-gray-50 border-b">
                    <p className="text-sm font-medium text-gray-700">Sélectionner un contact</p>
                  </div>
                  <div className="divide-y max-h-48 overflow-y-auto">
                    {mockContacts.map((contact, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectContact(contact)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.phone}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                          {contact.operator.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Operator Detection */}
            {detectedOperator && detectedOperator !== 'unknown' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    ✓ {operatorConfig?.name} détecté
                  </p>
                  <p className="text-xs text-emerald-700">
                    Code USSD: {operatorConfig?.shortCode}
                  </p>
                </div>
              </div>
            )}

            {detectedOperator === 'unknown' && phoneNumber && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Opérateur non reconnu</p>
                  <p className="text-xs text-yellow-700">Veuillez vérifier le numéro</p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                min="100"
                step="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (optionnel)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Raison du transfert..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!phoneNumber || !amount}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Confirmer la transaction</h2>

              <div className="space-y-3 py-4 border-t border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Destinataire:</span>
                  <span className="font-medium">{formatCameroonNumber(phoneNumber)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Opérateur:</span>
                  <span className="font-medium text-emerald-600">{operatorConfig?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-bold text-lg text-emerald-600">{amount} FCFA</span>
                </div>
                {note && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Note:</span>
                    <span className="text-sm">{note}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">
                💡 Votre opérateur vous demandera de confirmer cette transaction via USSD
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep('form');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Retour
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    '✓ Confirmer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sending Step */}
        {step === 'sending' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-emerald-200 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-emerald-600 rounded-full flex items-center justify-center">
                <Loader className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">Transaction en cours...</p>
            <p className="text-sm text-gray-600 text-center">
              Veuillez confirmer l'opération sur votre téléphone
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
