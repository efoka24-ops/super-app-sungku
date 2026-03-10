import { nowIso } from "./store.js";

export function defaultStats(userId, miniApps = 0) {
  return {
    transfers: 0,
    contacts: 0,
    miniApps,
    updatedAt: nowIso(),
  };
}

export function defaultNotifications() {
  return [
    {
      id: `notif_${Date.now()}_1`,
      title: "Bienvenue sur Sungku",
      message: "Votre compte est prêt, commencez à envoyer et recevoir.",
      read: false,
      createdAt: nowIso(),
      type: "system",
    },
  ];
}

export function defaultFaq() {
  return {
    fr: [
      {
        id: "faq_1",
        question: "Comment changer mon mot de passe ?",
        answer: "Allez dans Paramètres > Sécurité > Changer le mot de passe.",
      },
      {
        id: "faq_2",
        question: "Comment installer une mini app ?",
        answer: "Depuis Mini Apps, sélectionnez une app puis appuyez sur Installer.",
      },
    ],
    en: [
      {
        id: "faq_1",
        question: "How do I change my password?",
        answer: "Go to Settings > Security > Change password.",
      },
      {
        id: "faq_2",
        question: "How can I install a mini app?",
        answer: "From Mini Apps, pick an app and tap Install.",
      },
    ],
  };
}
