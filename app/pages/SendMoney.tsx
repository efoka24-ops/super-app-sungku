import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { ArrowLeft, User, DollarSign, MessageSquare, CheckCircle2 } from "lucide-react";
import { fetchContacts, Contact } from "../lib/features/contacts/contactsApi";

const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

export default function SendMoney() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const loadContacts = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const data = await fetchContacts(user.userId);
        setContacts(data.slice(0, 4)); // Show only 4 recent contacts
      }
    };
    loadContacts();
  }, []);

  const handleContinue = () => {
    if (step === 1 && recipient) {
      setStep(2);
    } else if (step === 2 && amount) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
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
          {amount} FCFA envoyé à {recipient}
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
              <h3 className="font-bold text-gray-900 mb-3">Contacts récents</h3>
              <div className="grid grid-cols-2 gap-3">
                {contacts.length === 0 ? (
                  <p className="col-span-2 text-center text-gray-500 py-8">
                    Aucun contact enregistré
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
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <Button
          onClick={handleContinue}
          disabled={
            (step === 1 && !recipient) ||
            (step === 2 && !amount) ||
            parseInt(amount) <= 0
          }
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-xl disabled:opacity-50"
        >
          {step === 3 ? "Confirmer l'envoi" : "Continuer"}
        </Button>
      </div>
    </div>
  );
}
