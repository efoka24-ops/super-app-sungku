import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ArrowLeft, User, DollarSign, MessageSquare, CheckCircle2, Loader, Smartphone, CreditCard } from "lucide-react";
import { fetchDeviceOrSavedContacts, Contact } from "../lib/features/contacts/contactsApi";
import { detectOperator } from "../lib/features/miniapps/utils/operatorDetection";
import { initiateUSSD, launchUSSDDialer, confirmUSSDTransaction } from "../lib/features/miniapps/api/ussdApi";
import { checkNotchPayTransfer, sendNotchPayTransfer } from "../lib/features/payments/api/notchpayTransferApi";
import { toUserErrorMessage } from "../lib/core/network/errorMessages";

const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

export default function SendMoney() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const [pendingNotchPayRef, setPendingNotchPayRef] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ussd" | "notchpay">("ussd");
  const [paymentInfo, setPaymentInfo] = useState("");

  const getCameroonPhone = (value: string) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("237") && digits.length >= 12) return `+${digits}`;
    if (digits.startsWith("6") && digits.length === 9) return `+237${digits}`;
    return value;
  };

  const getNotchChannel = (value: string) => {
    const op = detectOperator(value);
    if (op === "mtn") return "cm.mtn";
    if (op === "orange") return "cm.orange";
    return "cm.mtn";
  };

  const loadContacts = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    setContactsLoading(true);
    try {
      const user = JSON.parse(userStr);
      const data = await fetchDeviceOrSavedContacts(user.userId);
      setContacts(data.slice(0, 6));
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (!pendingTransactionId) return;
    const onVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return;
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      try {
        await confirmUSSDTransaction(pendingTransactionId, true, undefined, user?.userId);
      } catch { /* ignore */ }
      setPendingTransactionId(null);
      setStep(4);
      setSending(false);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pendingTransactionId]);

  useEffect(() => {
    if (!pendingNotchPayRef) return;
    const onVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        setPaymentInfo("Verification du transfert NotchPay...");
        const result = await checkNotchPayTransfer(pendingNotchPayRef);
        if (result.status === "completed") {
          setPendingNotchPayRef(null);
          setPaymentInfo("");
          setStep(4);
        } else if (result.status === "failed") {
          setSendError(result.message || "Transfert NotchPay echoue");
          setPaymentInfo("");
        } else {
          setPaymentInfo("Transfert en attente. Revenez ici puis appuyez sur Verifier si necessaire.");
        }
      } catch (error) {
        setSendError(toUserErrorMessage(error, "Verification NotchPay impossible"));
      } finally {
        setSending(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [pendingNotchPayRef]);

  const verifyPendingNotchPayTransfer = async () => {
    if (!pendingNotchPayRef) return;
    setSending(true);
    setSendError("");
    try {
      const result = await checkNotchPayTransfer(pendingNotchPayRef);
      if (result.status === "completed") {
        setPendingNotchPayRef(null);
        setPaymentInfo("");
        setStep(4);
      } else if (result.status === "failed") {
        setSendError(result.message || "Transfert NotchPay echoue");
        setPaymentInfo("");
      } else {
        setPaymentInfo("Transfert toujours en attente chez NotchPay.");
      }
    } catch (error) {
      setSendError(toUserErrorMessage(error, "Verification NotchPay impossible"));
    } finally {
      setSending(false);
    }
  };

  const handleContinue = async () => {
    if (step === 1 && recipient) {
      setStep(2);
    } else if (step === 2 && amount) {
      setStep(3);
    } else if (step === 3) {
      setSending(true);
      setSendError('');
      setPaymentInfo("");
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (paymentMethod === "notchpay") {
        try {
          const phone = getCameroonPhone(recipient);
          const response = await sendNotchPayTransfer({
            amount: parseInt(amount),
            currency: "XAF",
            channel: getNotchChannel(phone),
            description: note || `Transfert Sungku vers ${phone}`,
            reference: `SM_${Date.now()}`,
            userId: user?.userId,
            beneficiary_data: {
              name: recipient,
              phone,
              email: user?.email || "support@sungku.app",
            },
            metadata: {
              senderUserId: user?.userId,
              senderPhone: user?.phone,
              recipient,
              note,
            },
          });
          setPendingNotchPayRef(response.reference);
          if (response.status === "completed") {
            setStep(4);
            setPendingNotchPayRef(null);
            setPaymentInfo("");
          } else {
            setPaymentInfo("Transfert NotchPay lance. Verifiez le statut dans quelques secondes.");
          }
          setSending(false);
        } catch (error) {
          setSendError(toUserErrorMessage(error, "Erreur lors du lancement NotchPay"));
          setSending(false);
        }
        return;
      }

      const operator = detectOperator(recipient);
      try {
        const response = await initiateUSSD(
          recipient,
          operator || 'unknown',
          parseInt(amount),
          note || 'sungku-transfer',
          user?.userId
        );
        if (response.success) {
          setPendingTransactionId(response.transactionId || `${Date.now()}`);
          await launchUSSDDialer(response.code || '');
        } else {
          setSendError(response.message || "Erreur lors de l'envoi");
          setSending(false);
        }
      } catch {
        setSendError("Erreur de connexion. Vérifiez votre réseau.");
        setSending(false);
      }
    }
  };

  const selectContact = (contact: Contact) => {
    setRecipient(contact.phoneNumber);
    setStep(2);
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfert réussi !</h1>
        <p className="text-gray-600 text-center mb-8">
          {amount} FCFA envoye a {recipient} via {paymentMethod === "notchpay" ? "NotchPay" : "USSD"}
        </p>
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => navigate("/home")}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl"
          >
            Retour à l'accueil
          </Button>
          <Button
            onClick={() => {
              setStep(1);
              setRecipient("");
              setAmount("");
              setNote("");
            }}
            variant="outline"
            className="w-full h-14 rounded-xl"
          >
            Nouveau transfert
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Envoyer de l'argent</h1>
            <p className="text-sm text-gray-500">Étape {step} sur 3</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 pt-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Step 1: Select Recipient */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="recipient">Numéro du destinataire</Label>
              <div className="relative mt-2">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+225 XX XX XX XX XX"
                  className="pl-12 h-14 rounded-xl"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Contacts récents</h3>
                <button
                  type="button"
                  onClick={loadContacts}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Rafraichir
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {contactsLoading ? (
                  <p className="col-span-2 text-center text-gray-500 py-8">Chargement des contacts...</p>
                ) : contacts.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-500 py-8">
                    Aucun contact disponible. Autorisez l'acces au repertoire puis rafraichissez.
                  </p>
                ) : (
                  contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => selectContact(contact)}
                      className="bg-white rounded-xl p-4 text-left hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-emerald-600 font-bold">
                          {contact.avatar || contact.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 text-center">
              <p className="text-gray-500 text-sm mb-2">Montant à envoyer</p>
              <div className="relative">
                <DollarSign className="absolute left-1/2 -translate-x-16 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-400" />
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="text-center text-4xl font-bold h-16 border-0 focus-visible:ring-0"
                  type="number"
                />
              </div>
              <p className="text-gray-400 text-sm mt-2">FCFA</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Montants rapides</h3>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => setAmount(qa.toString())}
                    className="bg-white rounded-xl p-4 font-medium text-gray-900 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                  >
                    {qa.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Destinataire:</span> {recipient}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Canal de paiement</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("ussd")}
                  className={`rounded-xl border p-3 text-left transition ${paymentMethod === "ussd" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-900">USSD</span>
                  </div>
                  <p className="text-xs text-gray-500">Confirmer avec Orange Money ou MTN MoMo</p>
                </button>
                <button
                  onClick={() => setPaymentMethod("notchpay")}
                  className={`rounded-xl border p-3 text-left transition ${paymentMethod === "notchpay" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-900">NotchPay</span>
                  </div>
                  <p className="text-xs text-gray-500">Transfert direct wallet via API NotchPay</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-600">Destinataire</span>
                <span className="font-medium text-gray-900">{recipient}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-600">Montant</span>
                <span className="font-bold text-gray-900 text-xl">
                  {parseInt(amount).toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-600">Frais</span>
                <span className="font-medium text-gray-900">0 FCFA</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-emerald-600 text-2xl">
                  {parseInt(amount).toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="note">Note (optionnel)</Label>
              <div className="relative mt-2">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ajouter une note..."
                  className="pl-12 h-14 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Button */}
      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        {sendError && (
          <p className="text-red-600 text-sm text-center mb-3">{sendError}</p>
        )}
        {paymentInfo && (
          <p className="text-blue-600 text-sm text-center mb-3">{paymentInfo}</p>
        )}
        {step === 3 && pendingNotchPayRef && !sending && (
          <Button
            onClick={verifyPendingNotchPayTransfer}
            variant="outline"
            className="w-full h-12 rounded-xl mb-3"
          >
            Verifier le transfert NotchPay
          </Button>
        )}
        <Button
          onClick={handleContinue}
          disabled={
            sending ||
            (step === 1 && !recipient) ||
            (step === 2 && !amount) ||
            parseInt(amount) <= 0
          }
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {sending ? (
            <><Loader className="w-5 h-5 animate-spin" /> {paymentMethod === "notchpay" ? "Transfert NotchPay..." : "Lancement USSD..."}</>
          ) : step === 3 ? (
            paymentMethod === "notchpay" ? "Envoyer via NotchPay" : "Confirmer l'envoi"
          ) : (
            "Continuer"
          )}
        </Button>
      </div>
    </div>
  );
}
