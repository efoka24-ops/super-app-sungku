import { useNavigate } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";
import { useLanguage } from "../../lib/core/i18n";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = language === 'fr' ? {
    title: "Politique de confidentialité",
    lastUpdated: "Dernière mise à jour: 9 mars 2026",
    intro: "Chez Sungku, nous prenons très au sérieux la protection de vos données personnelles. Cette politique explique comment nous collectons, utilisons, partageons et protégeons vos informations.",
    sections: [
      {
        title: "1. Données que nous collectons",
        content: [
          "**Informations d'identification:**",
          "• Nom complet, date de naissance",
          "• Numéro de téléphone, adresse email",
          "• Pièce d'identité (pour la vérification KYC)",
          "• Photo de profil (facultative)",
          "",
          "**Données financières:**",
          "• Historique des transactions",
          "• Informations de carte bancaire (cryptées)",
          "• Solde du portefeuille",
          "",
          "**Données d'utilisation:**",
          "• Logs d'activité dans l'application",
          "• Mini-apps installées et utilisées",
          "• Appareil et système d'exploitation",
          "• Adresse IP et données de localisation (avec consentement)"
        ]
      },
      {
        title: "2. Comment nous utilisons vos données",
        content: [
          "Nous utilisons vos données pour:",
          "• Fournir et améliorer nos services",
          "• Traiter les transactions financières",
          "• Vérifier votre identité (KYC/AML)",
          "• Prévenir la fraude et assurer la sécurité",
          "• Vous envoyer des notifications importantes",
          "• Personnaliser votre expérience",
          "• Respecter nos obligations légales"
        ]
      },
      {
        title: "3. Partage de données",
        content: [
          "Nous ne vendons jamais vos données personnelles.",
          "",
          "Nous pouvons partager vos données avec:",
          "• **Partenaires mini-apps:** Uniquement les données nécessaires au fonctionnement de l'app",
          "• **Prestataires de paiement:** Pour traiter les transactions",
          "• **Autorités légales:** Si requis par la loi ou pour prévenir la fraude",
          "• **Fournisseurs de services:** Cloud hosting, analytics (sous contrat strict)"
        ]
      },
      {
        title: "4. Sécurité des données",
        content: [
          "Nous mettons en œuvre des mesures de sécurité robustes:",
          "• Chiffrement de bout en bout (TLS 1.3)",
          "• Données sensibles chiffrées au repos (AES-256)",
          "• Authentification à deux facteurs (2FA)",
          "• Surveillance 24/7 des activités suspectes",
          "• Audits de sécurité réguliers",
          "• Conformité PCI-DSS pour les paiements"
        ]
      },
      {
        title: "5. Vos droits (RGPD)",
        content: [
          "Conformément au RGPD, vous avez le droit de:",
          "• **Accès:** Obtenir une copie de vos données",
          "• **Rectification:** Corriger des données inexactes",
          "• **Suppression:** Demander la suppression de vos données (\"droit à l'oubli\")",
          "• **Portabilité:** Recevoir vos données dans un format structuré",
          "• **Opposition:** Vous opposer au traitement de vos données",
          "• **Limitation:** Limiter le traitement dans certains cas",
          "",
          "Pour exercer ces droits: privacy@sungku.app"
        ]
      },
      {
        title: "6. Cookies et technologies similaires",
        content: [
          "Nous utilisons des cookies pour:",
          "• Maintenir votre session active",
          "• Mémoriser vos préférences (langue, thème)",
          "• Analyser l'utilisation de l'application (analytics anonymisés)",
          "",
          "Vous pouvez désactiver les cookies non essentiels dans les Paramètres de l'application."
        ]
      },
      {
        title: "7. Conservation des données",
        content: [
          "Nous conservons vos données:",
          "• **Données de compte:** Tant que votre compte est actif",
          "• **Historique des transactions:** 10 ans (obligation légale)",
          "• **Logs de sécurité:** 3 ans",
          "• **Données analytiques:** 2 ans",
          "",
          "Après suppression de votre compte, certaines données peuvent être conservées pour respecter les obligations légales."
        ]
      },
      {
        title: "8. Transferts internationaux",
        content: [
          "Vos données peuvent être transférées vers des pays hors de l'Union Européenne.",
          "Nous garantissons un niveau de protection adéquat via:",
          "• Clauses contractuelles types de la Commission Européenne",
          "• Certification Privacy Shield (États-Unis)",
          "• Consentement explicite si nécessaire"
        ]
      },
      {
        title: "9. Mineurs",
        content: [
          "Sungku est réservé aux personnes de 18 ans et plus.",
          "Nous ne collectons pas sciemment de données d'enfants de moins de 18 ans.",
          "Si vous pensez qu'un mineur a fourni des informations, contactez-nous: privacy@sungku.app"
        ]
      },
      {
        title: "10. Modifications de la politique",
        content: [
          "Nous pouvons mettre à jour cette politique pour refléter:",
          "• Changements dans nos pratiques",
          "• Nouvelles fonctionnalités",
          "• Évolutions légales",
          "",
          "Vous serez notifié des modifications importantes via l'application ou par email.",
          "La date de \"Dernière mise à jour\" en haut de ce document est toujours actuelle."
        ]
      },
      {
        title: "11. Contact et réclamations",
        content: [
          "**Délégué à la Protection des Données (DPO):**",
          "Email: dpo@sungku.app",
          "Téléphone: +225 XX XX XX XX XX",
          "Adresse: Sungku Technologies, Abidjan Plateau, Côte d'Ivoire",
          "",
          "**Droit de réclamation:**",
          "Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL (France) ou de l'autorité de protection des données de votre pays."
        ]
      }
    ]
  } : {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 9, 2026",
    intro: "At Sungku, we take the protection of your personal data very seriously. This policy explains how we collect, use, share, and protect your information.",
    sections: [
      {
        title: "1. Data We Collect",
        content: [
          "**Identification Information:**",
          "• Full name, date of birth",
          "• Phone number, email address",
          "• ID document (for KYC verification)",
          "• Profile photo (optional)",
          "",
          "**Financial Data:**",
          "• Transaction history",
          "• Bank card information (encrypted)",
          "• Wallet balance",
          "",
          "**Usage Data:**",
          "• Activity logs in the application",
          "• Installed and used mini-apps",
          "• Device and operating system",
          "• IP address and location data (with consent)"
        ]
      },
      {
        title: "2. How We Use Your Data",
        content: [
          "We use your data to:",
          "• Provide and improve our services",
          "• Process financial transactions",
          "• Verify your identity (KYC/AML)",
          "• Prevent fraud and ensure security",
          "• Send you important notifications",
          "• Personalize your experience",
          "• Comply with our legal obligations"
        ]
      },
      {
        title: "3. Data Sharing",
        content: [
          "We never sell your personal data.",
          "",
          "We may share your data with:",
          "• **Mini-app Partners:** Only data necessary for app functionality",
          "• **Payment Providers:** To process transactions",
          "• **Legal Authorities:** If required by law or to prevent fraud",
          "• **Service Providers:** Cloud hosting, analytics (under strict contract)"
        ]
      },
      {
        title: "4. Data Security",
        content: [
          "We implement robust security measures:",
          "• End-to-end encryption (TLS 1.3)",
          "• Sensitive data encrypted at rest (AES-256)",
          "• Two-factor authentication (2FA)",
          "• 24/7 monitoring of suspicious activities",
          "• Regular security audits",
          "• PCI-DSS compliance for payments"
        ]
      },
      {
        title: "5. Your Rights (GDPR)",
        content: [
          "Under GDPR, you have the right to:",
          "• **Access:** Obtain a copy of your data",
          "• **Rectification:** Correct inaccurate data",
          "• **Erasure:** Request deletion of your data (\"right to be forgotten\")",
          "• **Portability:** Receive your data in a structured format",
          "• **Object:** Object to the processing of your data",
          "• **Restriction:** Restrict processing in certain cases",
          "",
          "To exercise these rights: privacy@sungku.app"
        ]
      },
      {
        title: "6. Cookies and Similar Technologies",
        content: [
          "We use cookies to:",
          "• Maintain your active session",
          "• Remember your preferences (language, theme)",
          "• Analyze application usage (anonymized analytics)",
          "",
          "You can disable non-essential cookies in the Application Settings."
        ]
      },
      {
        title: "7. Data Retention",
        content: [
          "We retain your data:",
          "• **Account Data:** As long as your account is active",
          "• **Transaction History:** 10 years (legal obligation)",
          "• **Security Logs:** 3 years",
          "• **Analytics Data:** 2 years",
          "",
          "After account deletion, some data may be retained to comply with legal obligations."
        ]
      },
      {
        title: "8. International Transfers",
        content: [
          "Your data may be transferred to countries outside the European Union.",
          "We guarantee adequate protection through:",
          "• European Commission standard contractual clauses",
          "• Privacy Shield certification (United States)",
          "• Explicit consent if necessary"
        ]
      },
      {
        title: "9. Minors",
        content: [
          "Sungku is reserved for persons 18 years and older.",
          "We do not knowingly collect data from children under 18.",
          "If you believe a minor has provided information, contact us: privacy@sungku.app"
        ]
      },
      {
        title: "10. Policy Modifications",
        content: [
          "We may update this policy to reflect:",
          "• Changes in our practices",
          "• New features",
          "• Legal developments",
          "",
          "You will be notified of significant changes via the application or by email.",
          "The \"Last updated\" date at the top of this document is always current."
        ]
      },
      {
        title: "11. Contact and Complaints",
        content: [
          "**Data Protection Officer (DPO):**",
          "Email: dpo@sungku.app",
          "Phone: +225 XX XX XX XX XX",
          "Address: Sungku Technologies, Abidjan Plateau, Ivory Coast",
          "",
          "**Right to Complaint:**",
          "If you believe your rights are not being respected, you can file a complaint with CNIL (France) or your country's data protection authority."
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              {content.title}
            </h1>
            <p className="text-xs text-gray-500">{content.lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Introduction */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
          <p className="text-sm text-emerald-900">{content.intro}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-6">
          {content.sections.map((section, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-6 last:border-0">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <div className="space-y-2 text-gray-700 text-sm">
                {section.content.map((paragraph, pIdx) => {
                  if (paragraph.startsWith('**')) {
                    return <p key={pIdx} className="font-bold mt-3">{paragraph.replace(/\*\*/g, '')}</p>;
                  }
                  if (paragraph.startsWith('•')) {
                    return <p key={pIdx} className="ml-4">{paragraph}</p>;
                  }
                  if (paragraph === '') {
                    return <div key={pIdx} className="h-2"></div>;
                  }
                  return <p key={pIdx}>{paragraph}</p>;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900 font-medium">
            🔒 {language === 'fr' 
              ? "Vos données sont protégées par les normes les plus strictes. Nous nous engageons à respecter votre vie privée."
              : "Your data is protected by the strictest standards. We are committed to respecting your privacy."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
