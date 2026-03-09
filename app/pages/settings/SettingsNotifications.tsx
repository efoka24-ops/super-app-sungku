import { useNavigate } from "react-router";
import { ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "../../lib/core/i18n";
import { motion } from "motion/react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
  Notification
} from "../../lib/features/notifications/notificationsApi";

export default function SettingsNotifications() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const data = await fetchNotifications(user.userId, filter);
        setNotifications(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = async (id: string) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const success = await markNotificationAsRead(user.userId, id);
      if (success) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
      }
    }
  };

  const deleteNotification = async (id: string) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const success = await deleteNotificationApi(user.userId, id);
      if (success) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    }
  };

  const markAllAsRead = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const success = await markAllNotificationsAsRead(user.userId);
      if (success) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    }
  };

  const clearAll = () => {
    // Delete all notifications one by one
    notifications.forEach(n => deleteNotification(n.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{t('notifications')}</h1>
          </div>
          {notifications.some(n => !n.read) && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={`rounded-full text-sm ${ filter === 'all' ? 'bg-emerald-500 text-white' : ''}`}
          >
            {t('all')}
          </Button>
          <Button
            onClick={() => setFilter('unread')}
            variant={filter === 'unread' ? 'default' : 'outline'}
            className={`rounded-full text-sm ${filter === 'unread' ? 'bg-emerald-500 text-white' : ''}`}
          >
            {t('unread')} ({notifications.filter(n => !n.read).length})
          </Button>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-6">
            <Button
              onClick={markAllAsRead}
              size="sm"
              variant="outline"
              className="text-xs rounded-lg"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Marquer tout comme lus
            </Button>
            <Button
              onClick={clearAll}
              size="sm"
              variant="outline"
              className="text-xs rounded-lg text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Tout effacer
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">{t('noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-xl border-l-4 ${notif.read ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-400'}`}
              >
                <div className="flex gap-3">
                  <div className="text-2xl">{notif.icon || "🔔"}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-blue-600 text-xs font-medium mt-2 hover:underline"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
