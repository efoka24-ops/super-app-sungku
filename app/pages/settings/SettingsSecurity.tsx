import { useNavigate } from "react-router";
import { ArrowLeft, Shield, Lock, Smartphone, LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { useLanguage } from "../../lib/core/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { updateSecurity } from "../../lib/features/settings/settingsApi";

export default function SettingsSecurity() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const success = await updateSecurity(user.userId, {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      
      if (success) {
        alert("Mot de passe changé avec succès");
        setShowPasswordDialog(false);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        alert("Erreur lors du changement de mot de passe");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t('security')}</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('changePassword')}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Mettez à jour votre mot de passe régulièrement pour sécuriser votre compte</p>
          <Button
            onClick={() => setShowPasswordDialog(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl"
          >
            {t('changePassword')}
          </Button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{t('twoFactor')}</h2>
            </div>
            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">
              Non activé
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Activez l'authentification à deux facteurs pour plus de sécurité</p>
          <Button
            variant="outline"
            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 h-12 rounded-xl"
          >
            Activer 2FA
          </Button>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{t('sessionManagement')}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Gérez vos sessions actives sur d'autres appareils</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900">Windows (Actuellement connecté)</p>
                <p className="text-sm text-gray-500 mt-1">Chrome sur Windows • Dernière activité: À l'instant</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                Actif
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-gray-900">iPhone</p>
                <p className="text-sm text-gray-500 mt-1">Safari sur iOS • Dernière activité: Il y a 3 heures</p>
              </div>
              <span className="text-gray-600">
                <button className="text-red-600 hover:underline text-sm font-medium">
                  Déconnecter
                </button>
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 h-12 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnecter de tous les appareils
          </Button>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('privacySettings')}</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-500 rounded" />
              <div>
                <p className="font-medium text-gray-900">Profil visible pour tous</p>
                <p className="text-xs text-gray-500">Permet à d'autres utilisateurs de voir votre profil</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-500 rounded" />
              <div>
                <p className="font-medium text-gray-900">Suivi de l'activité</p>
                <p className="text-xs text-gray-500">Aide Sungku à améliorer les services</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-emerald-500 rounded" />
              <div>
                <p className="font-medium text-gray-900">Partage de données marketing</p>
                <p className="text-xs text-gray-500">Recevoir des offres personnalisées</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('changePassword')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('currentPassword')}</label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Entrez votre mot de passe actuel"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('newPassword')}</label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                placeholder="Entrez le nouveau mot de passe"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">{t('confirmPassword')}</label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Confirmer le nouveau mot de passe"
                className="rounded-lg"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl"
            >
              Mettre à jour le mot de passe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
