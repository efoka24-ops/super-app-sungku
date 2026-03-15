import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Phone, Users, AlertCircle, CheckCircle, Loader, ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import {
  detectOperator,
  getOperatorConfig,
  generateUSSDCode,
  formatCameroonNumber,
  isValidCameroonNumber,
  type Operator
} from '../utils/operatorDetection';
import { confirmUSSDTransaction, initiateUSSD, launchUSSDDialer } from '../api/ussdApi';
import { fetchDeviceOrSavedContacts, type Contact } from '../../contacts/contactsApi';
import { fetchInstalledMiniApps, installMiniApp } from '../miniappsApi';
import { checkNotchPayTransfer, sendNotchPayTransfer } from '../../payments/api/notchpayTransferApi';
import { toUserErrorMessage } from '../../../core/network/errorMessages';

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
  const [deviceContacts, setDeviceContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const [pendingUSSDCode, setPendingUSSDCode] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState('');
  const [pendingNotchPayRef, setPendingNotchPayRef] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ussd' | 'notchpay'>('ussd');
  const [paymentInfo, setPaymentInfo] = useState('');

  const getCameroonPhone = (value: string) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('237') && digits.length >= 12) return `+${digits}`;
    if (digits.startsWith('6') && digits.length === 9) return `+237${digits}`;
    return value;
  };

  const getNotchChannel = (value: string) => {
    const op = detectOperator(value);
    if (op === 'mtn') return 'cm.mtn';
    if (op === 'orange') return 'cm.orange';
    return 'cm.mtn';
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    // Pre-fill sender phone from logged-in user
    if (user.phone) setSenderPhone(user.phone);

    fetchInstalledMiniApps(user.userId)
      .then((apps) => setInstalled(apps.some((app) => app.appId === 'sungku-send')))
      .catch(() => setInstalled(false));
  }, []);

  useEffect(() => {
    const onVisibilityChange = async () => {
      if (document.visibilityState !== 'visible' || !pendingTransactionId) return;
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      try {
        // Auto-confirm: user returned from the USSD dialer, assume they completed it
        await confirmUSSDTransaction(
          pendingTransactionId,
          true,
          undefined,
          user?.userId
        );

        navigate('/miniapps/sungku-send/result', {
          state: {
            success: true,
            transactionId: pendingTransactionId,
            operator: detectedOperator,
            senderPhone,
            phoneNumber: formatCameroonNumber(phoneNumber),
            amount,
            message: 'Transaction confirmée via USSD',
            code: pendingUSSDCode
          }
        });
      } catch {
        setError('Impossible de confirmer le résultat USSD.');
        setStep('confirm');
      } finally {
        setPendingTransactionId(null);
        setPendingUSSDCode('');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pendingTransactionId, pendingUSSDCode, navigate, detectedOperator, phoneNumber, amount]);

  useEffect(() => {
    if (!pendingNotchPayRef) return;

    const onVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        setPaymentInfo('Verification du transfert NotchPay...');
        const result = await checkNotchPayTransfer(pendingNotchPayRef);
        if (result.status === 'completed') {
          setPendingNotchPayRef(null);
          setPaymentInfo('');
          navigate('/miniapps/sungku-send/result', {
            state: {
              success: true,
              transactionId: pendingNotchPayRef,
              operator: 'NotchPay',
              senderPhone,
              phoneNumber: formatCameroonNumber(phoneNumber),
              amount,
              message: 'Transaction NotchPay confirmee',
            }
          });
        } else if (result.status === 'failed') {
          setError(result.message || 'Transfert NotchPay echoue');
          setPaymentInfo('');
          setStep('confirm');
        } else {
          setPaymentInfo('Transfert en attente. Revenez ici puis relancez la verification si necessaire.');
          setStep('confirm');
        }
      } catch (err) {
        setError(toUserErrorMessage(err, 'Verification NotchPay impossible'));
        setStep('confirm');
      } finally {
        setLoading(false);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pendingNotchPayRef, navigate, senderPhone, phoneNumber, amount]);

  const verifyPendingNotchPayTransfer = async () => {
    if (!pendingNotchPayRef) return;
    setLoading(true);
    setError('');
    try {
      const result = await checkNotchPayTransfer(pendingNotchPayRef);
      if (result.status === 'completed') {
        setPendingNotchPayRef(null);
        setPaymentInfo('');
        navigate('/miniapps/sungku-send/result', {
          state: {
            success: true,
            transactionId: pendingNotchPayRef,
            operator: 'NotchPay',
            senderPhone,
            phoneNumber: formatCameroonNumber(phoneNumber),
            amount,
            message: 'Transaction NotchPay confirmee',
          }
        });
      } else if (result.status === 'failed') {
        setError(result.message || 'Transfert NotchPay echoue');
        setPaymentInfo('');
      } else {
        setPaymentInfo('Transfert toujours en attente chez NotchPay.');
      }
    } catch (err) {
      setError(toUserErrorMessage(err, 'Verification NotchPay impossible'));
    } finally {
      setLoading(false);
    }
  };

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

  const selectContact = (contact: Contact) => {
    setPhoneNumber(contact.phoneNumber);
    setDetectedOperator(detectOperator(contact.phoneNumber));
    setShowContactList(false);
  };

  const handleOpenContacts = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Veuillez vous connecter pour accéder aux contacts.');
      return;
    }
    const user = JSON.parse(userStr);
    setContactsLoading(true);
    const contacts = await fetchDeviceOrSavedContacts(user.userId);
    setDeviceContacts(contacts);
    setShowContactList(true);
    setContactsLoading(false);
  };

  const handleInstallMiniApp = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Connectez-vous d\'abord pour installer cette mini-app.');
      return;
    }
    const user = JSON.parse(userStr);
    setInstalling(true);
    const installedApp = await installMiniApp(user.userId, 'sungku-send', user.phone);
    setInstalling(false);
    if (!installedApp) {
      setError('Installation échouée. Réessayez.');
      return;
    }
    setInstalled(true);
  };

  const handleSend = async () => {
    setError('');
    setPaymentInfo('');

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

    if (paymentMethod === 'ussd' && detectedOperator === 'unknown') {
      setError('Opérateur non reconnu');
      return;
    }

    if (step === 'form') {
      setStep('confirm');
      return;
    }

    setStep('sending');
    setLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (paymentMethod === 'notchpay') {
        const normalizedPhone = getCameroonPhone(phoneNumber);
        const response = await sendNotchPayTransfer({
          amount: parseInt(amount),
          currency: 'XAF',
          channel: getNotchChannel(normalizedPhone),
          description: note || `Sungku Send vers ${normalizedPhone}`,
          reference: `MAPP_${Date.now()}`,
          userId: user?.userId,
          beneficiary_data: {
            name: phoneNumber,
            phone: normalizedPhone,
            email: user?.email || 'support@sungku.app',
          },
          metadata: {
            senderPhone,
            recipientPhone: phoneNumber,
            note,
            miniApp: 'sungku-send',
          },
        });

        setPendingNotchPayRef(response.reference);
        if (response.status === 'completed') {
          setPendingNotchPayRef(null);
          setPaymentInfo('');
          navigate('/miniapps/sungku-send/result', {
            state: {
              success: true,
              transactionId: response.reference,
              operator: 'NotchPay',
              senderPhone,
              phoneNumber: formatCameroonNumber(phoneNumber),
              amount,
              message: 'Transaction NotchPay confirmee',
            }
          });
          return;
        }
        setPaymentInfo('Transfert NotchPay lance. Verifiez le statut dans quelques secondes.');
        setStep('confirm');
        setLoading(false);
        return;
      }

      const response = await initiateUSSD(
        phoneNumber,
        detectedOperator || 'unknown',
        parseInt(amount),
        note || 'sungku-send',
        user?.userId
      );

      if (response.success) {
        const codeToDial = response.code || generateUSSDCode(detectedOperator || 'unknown', phoneNumber, parseInt(amount));
        setPendingTransactionId(response.transactionId || null);
        setPendingUSSDCode(codeToDial);
        await launchUSSDDialer(codeToDial);
      } else {
        setError(response.message || 'Erreur lors du traitement');
        setStep('confirm');
        setLoading(false);
      }
    } catch (err) {
      setError(toUserErrorMessage(err, 'Erreur lors de l\'envoi. Veuillez reessayer.'));
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
            <p className="text-sm text-emerald-100">Envoyez de l'argent via USSD ou NotchPay</p>
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
            {!installed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  Cette mini-app n'est pas installée. Installez-la avant utilisation.
                </p>
                <button
                  onClick={handleInstallMiniApp}
                  disabled={installing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-2 rounded-lg"
                >
                  {installing ? 'Installation...' : 'Installer Sungku Send'}
                </button>
              </div>
            )}

            {/* Sender Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre numéro (expéditeur)
              </label>
              <div className="flex-1 relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Votre numéro de téléphone"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
              </div>
            </div>

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
                  onClick={handleOpenContacts}
                  className="px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                >
                  {contactsLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                </button>
              </div>

              {/* Contact List Modal */}
              {showContactList && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                  <div className="p-2 bg-gray-50 border-b">
                    <p className="text-sm font-medium text-gray-700">Sélectionner un contact</p>
                  </div>
                  <div className="divide-y max-h-48 overflow-y-auto">
                    {deviceContacts.map((contact, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectContact(contact)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                          {detectOperator(contact.phoneNumber).toUpperCase()}
                        </span>
                      </button>
                    ))}
                    {deviceContacts.length === 0 && (
                      <p className="p-3 text-sm text-gray-500">Aucun contact disponible.</p>
                    )}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Canal de paiement</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('ussd')}
                  className={`rounded-lg border p-3 text-left transition ${paymentMethod === 'ussd' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-900">USSD</span>
                  </div>
                  <p className="text-xs text-gray-500">Paiement mobile par code operateur</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('notchpay')}
                  className={`rounded-lg border p-3 text-left transition ${paymentMethod === 'notchpay' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-900">NotchPay</span>
                  </div>
                  <p className="text-xs text-gray-500">Transfert direct wallet via API NotchPay</p>
                </button>
              </div>
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

            {paymentInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">{paymentInfo}</p>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!phoneNumber || !amount || !installed}
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
                  <span className="text-gray-600">Expéditeur:</span>
                  <span className="font-medium">{formatCameroonNumber(senderPhone || 'votre numéro')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destinataire:</span>
                  <span className="font-medium">{formatCameroonNumber(phoneNumber)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Opérateur:</span>
                  <span className="font-medium text-emerald-600">{paymentMethod === 'notchpay' ? 'NotchPay' : operatorConfig?.name}</span>
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
                {paymentMethod === 'notchpay'
                  ? 'Le transfert est envoye via API NotchPay puis verifie dans l application.'
                  : 'Votre opérateur vous demandera de confirmer cette transaction via USSD'}
              </p>

              {paymentMethod === 'notchpay' && pendingNotchPayRef && !loading && (
                <button
                  onClick={verifyPendingNotchPayTransfer}
                  className="w-full px-4 py-3 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  Verifier le transfert NotchPay
                </button>
              )}

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
                      {paymentMethod === 'notchpay' ? 'Envoi...' : 'Envoi...'}
                    </>
                  ) : (
                    paymentMethod === 'notchpay' ? 'Envoyer via NotchPay' : '✓ Confirmer'
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
              {paymentMethod === 'notchpay'
                ? 'Le transfert NotchPay est en cours de traitement'
                : 'Veuillez confirmer l opération sur votre téléphone'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
