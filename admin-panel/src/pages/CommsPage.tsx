import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  createFaq,
  deleteFaq,
  getAllNotifications,
  getFaq,
  getMessagesSummary,
  sendNotification,
  updateFaq,
  FaqItem
} from '../lib/backofficeApi';

export default function CommsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messagesSummary, setMessagesSummary] = useState<any[]>([]);
  const [faqLang, setFaqLang] = useState<'fr' | 'en'>('fr');
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingFaqForm, setEditingFaqForm] = useState({ question: '', answer: '' });
  const [notifForm, setNotifForm] = useState({ target: 'single', userId: '', title: '', message: '' });
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });

  const loadData = async () => {
    const notifData = await getAllNotifications();
    setNotifications(notifData.notifications || []);

    const messagesData = await getMessagesSummary();
    setMessagesSummary(messagesData.users || []);

    const faqData = await getFaq(faqLang);
    setFaqItems(faqData.items || []);
  };

  useEffect(() => {
    loadData();
  }, [faqLang]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendNotification({
      target: notifForm.target as 'single' | 'all',
      userId: notifForm.userId,
      title: notifForm.title,
      message: notifForm.message,
      type: 'system'
    });
    setNotifForm({ target: 'single', userId: '', title: '', message: '' });
    loadData();
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFaq(faqLang, faqForm.question, faqForm.answer);
    setFaqForm({ question: '', answer: '' });
    loadData();
  };

  const startEditingFaq = (item: FaqItem) => {
    setEditingFaqId(item.id);
    setEditingFaqForm({ question: item.question, answer: item.answer });
  };

  const cancelEditingFaq = () => {
    setEditingFaqId(null);
    setEditingFaqForm({ question: '', answer: '' });
  };

  const saveEditedFaq = async (itemId: string) => {
    await updateFaq(faqLang, itemId, editingFaqForm.question, editingFaqForm.answer);
    cancelEditingFaq();
    loadData();
  };

  return (
    <AdminLayout title="Notifications, Messages et FAQ">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Envoyer une notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-3">
              <select
                value={notifForm.target}
                onChange={(e) => setNotifForm({ ...notifForm, target: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="single">Un utilisateur</option>
                <option value="all">Tous les utilisateurs</option>
              </select>
              {notifForm.target === 'single' && (
                <input
                  placeholder="userId"
                  value={notifForm.userId}
                  onChange={(e) => setNotifForm({ ...notifForm, userId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              )}
              <input
                placeholder="Titre"
                value={notifForm.title}
                onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <textarea
                placeholder="Message"
                value={notifForm.message}
                onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
              />
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Envoyer</button>
            </form>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Résumé des messages</h2>
            <div className="space-y-2 max-h-72 overflow-auto">
              {messagesSummary.length === 0 && <p className="text-sm text-gray-500">Aucune conversation.</p>}
              {messagesSummary.map((entry) => (
                <div key={entry.userId} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span>{entry.userId}</span>
                  <span>{entry.conversations} conversations • {entry.unread} non lus</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">FAQ</h2>
            <div className="flex gap-2">
              <button onClick={() => setFaqLang('fr')} className={`px-3 py-1 rounded ${faqLang === 'fr' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>FR</button>
              <button onClick={() => setFaqLang('en')} className={`px-3 py-1 rounded ${faqLang === 'en' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>EN</button>
            </div>
          </div>

          <form onSubmit={handleCreateFaq} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              placeholder="Question"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              placeholder="Réponse"
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <button className="bg-emerald-600 text-white rounded-lg px-4 py-2">Ajouter</button>
          </form>

          <div className="space-y-2">
            {faqItems.length === 0 && <p className="text-sm text-gray-500">Aucune FAQ.</p>}
            {faqItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 flex justify-between gap-4">
                {editingFaqId === item.id ? (
                  <div className="w-full space-y-2">
                    <input
                      value={editingFaqForm.question}
                      onChange={(e) => setEditingFaqForm({ ...editingFaqForm, question: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <textarea
                      value={editingFaqForm.answer}
                      onChange={(e) => setEditingFaqForm({ ...editingFaqForm, answer: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={cancelEditingFaq} className="px-3 py-1 text-sm border border-gray-300 rounded-lg">
                        Annuler
                      </button>
                      <button onClick={() => saveEditedFaq(item.id)} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg">
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-gray-900">{item.question}</p>
                      <p className="text-sm text-gray-700">{item.answer}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => startEditingFaq(item)}
                        className="text-blue-600 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={async () => {
                          await deleteFaq(faqLang, item.id);
                          loadData();
                        }}
                        className="text-red-600 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Historique notifications</h2>
          <div className="space-y-2 max-h-80 overflow-auto">
            {notifications.length === 0 && <p className="text-sm text-gray-500">Aucune notification.</p>}
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">[{notif.userId}] {notif.title}</p>
                <p className="text-sm text-gray-700">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
