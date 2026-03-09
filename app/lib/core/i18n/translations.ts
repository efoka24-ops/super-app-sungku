export const translations = {
  fr: {
    // Navigation
    home: "Accueil",
    messages: "Messages",
    miniApps: "Mini Apps",
    payments: "Paiements",
    profile: "Profil",
    
    // Profile sections
    personalInfo: "Informations personnelles",
    cardsAccounts: "Cartes & Comptes",
    miniAppsInstalled: "Mini Apps installées",
    notifications: "Notifications",
    installed: "installées",
    language: "Langue",
    security: "Sécurité & confidentialité",
    help: "Centre d'aide",
    settings: "Paramètres",
    
    // Profile labels
    account: "Compte",
    preferences: "Préférences",
    support: "Support",
    transfers: "Transferts",
    contacts: "Contacts",
    memberSince: "Membre depuis",
    logout: "Se déconnecter",
    version: "Sungku v1.0.0",
    awardedICT: "Primé à ICT Week 2024",
    
    // Personal Info
    firstName: "Prénom",
    lastName: "Nom",
    phone: "Téléphone",
    email: "Email",
    birthDate: "Date de naissance",
    address: "Adresse",
    city: "Ville",
    country: "Pays",
    editInfo: "Modifier mes informations",
    save: "Enregistrer",
    cancel: "Annuler",
    
    // Cards
    cardDetails: "Détails de la carte",
    cardholder: "Titulaire",
    expiry: "Expiration",
    cardNumber: "Numéro de carte",
    addCard: "Ajouter une carte",
    deleteCard: "Supprimer la carte",
    setAsDefault: "Définir comme défaut",
    
    // Transactions
    recentTransactions: "Transactions récentes",
    sent: "Envoyé",
    received: "Reçu",
    date: "Date",
    amount: "Montant",
    recipient: "Destinataire",
    sender: "Expéditeur",
    
    // Notifications
    all: "Tous",
    unread: "Non lus",
    noNotifications: "Aucune notification",
    markAsRead: "Marquer comme lus",
    clearAll: "Tout effacer",
    
    // Language
    french: "Français",
    english: "English",
    selectLanguage: "Sélectionner la langue",
    
    // Security
    changePassword: "Changer le mot de passe",
    twoFactor: "Authentification à deux facteurs",
    sessionManagement: "Gestion des sessions",
    privacySettings: "Paramètres de confidentialité",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    
    // FAQ
    faq: "Questions fréquemment posées",
    faqItems: [
      {
        question: "Comment puis-je changer mon mot de passe?",
        answer: "Allez dans Paramètres > Sécurité > Changer le mot de passe et suivez les étapes."
      },
      {
        question: "Quels sont les frais de transfert?",
        answer: "Les transferts internes à Sungku sont gratuits. Les transferts externes peuvent avoir des frais variables."
      },
      {
        question: "Comment ajouter une carte de crédit?",
        answer: "Allez dans Profil > Cartes & Comptes > Ajouter une carte et saisissez les détails."
      },
      {
        question: "Puis-je utiliser Sungku hors ligne?",
        answer: "Non, Sungku nécessite une connexion Internet pour toutes les transactions."
      },
      {
        question: "Combien de mini-apps puis-je installer?",
        answer: "Vous pouvez installer autant de mini-apps que vous le souhaitez depuis le marché."
      }
    ]
  },
  en: {
    // Navigation
    home: "Home",
    messages: "Messages",
    miniApps: "Mini Apps",
    payments: "Payments",
    profile: "Profile",
    
    // Profile sections
    personalInfo: "Personal Information",
    cardsAccounts: "Cards & Accounts",
    miniAppsInstalled: "Installed Mini Apps",
    installed: "installed",
    notifications: "Notifications",
    
    language: "Language",
    security: "Security & Privacy",
    help: "Help Center",
    settings: "Settings",
    
    // Profile labels
    account: "Account",
    preferences: "Preferences",
    support: "Support",
    transfers: "Transfers",
    contacts: "Contacts",
    memberSince: "Member since",
    logout: "Logout",
    version: "Sungku v1.0.0",
    awardedICT: "Awarded at ICT Week 2024",
    
    // Personal Info
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone",
    email: "Email",
    birthDate: "Birth Date",
    address: "Address",
    city: "City",
    country: "Country",
    editInfo: "Edit My Information",
    save: "Save",
    cancel: "Cancel",
    
    // Cards
    cardDetails: "Card Details",
    cardholder: "Cardholder",
    expiry: "Expiry",
    cardNumber: "Card Number",
    addCard: "Add Card",
    deleteCard: "Delete Card",
    setAsDefault: "Set as Default",
    
    // Transactions
    recentTransactions: "Recent Transactions",
    sent: "Sent",
    received: "Received",
    date: "Date",
    amount: "Amount",
    recipient: "Recipient",
    sender: "Sender",
    
    // Notifications
    all: "All",
    unread: "Unread",
    noNotifications: "No notifications",
    markAsRead: "Mark as read",
    clearAll: "Clear all",
    
    // Language
    french: "Français",
    english: "English",
    selectLanguage: "Select Language",
    
    // Security
    changePassword: "Change Password",
    twoFactor: "Two-Factor Authentication",
    sessionManagement: "Session Management",
    privacySettings: "Privacy Settings",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    
    // FAQ
    faq: "Frequently Asked Questions",
    faqItems: [
      {
        question: "How can I change my password?",
        answer: "Go to Settings > Security > Change Password and follow the steps."
      },
      {
        question: "What are the transfer fees?",
        answer: "Internal Sungku transfers are free. External transfers may have variable fees."
      },
      {
        question: "How do I add a credit card?",
        answer: "Go to Profile > Cards & Accounts > Add Card and enter the details."
      },
      {
        question: "Can I use Sungku offline?",
        answer: "No, Sungku requires an Internet connection for all transactions."
      },
      {
        question: "How many mini-apps can I install?",
        answer: "You can install as many mini-apps as you want from the marketplace."
      }
    ]
  }
};

export type Language = 'fr' | 'en';

