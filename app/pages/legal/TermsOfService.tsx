import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../../lib/core/i18n";

export default function TermsOfService() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = language === 'fr' ? {
    title: "Conditions d'utilisation",
    lastUpdated: "Dernière mise à jour: 9 mars 2026",
    sections: [
      {
        title: "1. Acceptation des conditions",
        content: [
          "En téléchargeant, installant ou utilisant l'application Sungku Super App (\"l'Application\"), vous acceptez d'être lié par les présentes conditions d'utilisation.",
          "Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application."
        ]
      },
      {
        title: "2. Description du service",
        content: [
          "Sungku Super App est une plateforme multi-services permettant:",
          "• Transferts d'argent et paiements mobile",
          "• Accès à des mini-applications tierces (livraison, transport, shopping, etc.)",
          "• Gestion de compte et portefeuille numérique",
          "• Services bancaires et financiers"
        ]
      },
      {
        title: "3. Inscription et compte utilisateur",
        content: [
          "Vous devez avoir au moins 18 ans pour créer un compte.",
          "Vous êtes responsable de la confidentialité de vos identifiants de connexion.",
          "Vous acceptez de fournir des informations exactes et à jour lors de votre inscription.",
          "Toute activité effectuée sous votre compte est de votre responsabilité."
        ]
      },
      {
        title: "4. Services financiers",
        content: [
          "Les transactions financières sont soumises aux réglementations locales en vigueur.",
          "Des frais peuvent s'appliquer pour certaines transactions (détaillés au moment de la transaction).",
          "Sungku se réserve le droit de refuser ou d'annuler une transaction en cas de suspicions de fraude.",
          "Les limites de transaction peuvent varier selon votre niveau de vérification KYC."
        ]
      },
      {
        title: "5. Mini-applications tierces",
        content: [
          "Les mini-apps disponibles sur Sungku sont développées par des partenaires tiers.",
          "Chaque mini-app a ses propres conditions d'utilisation.",
          "Sungku n'est pas responsable du contenu ou des services fournis par les mini-apps tierces.",
          "Vous pouvez installer ou désinstaller des mini-apps à tout moment."
        ]
      },
      {
        title: "6. Vie privée et données personnelles",
        content: [
          "Vos données personnelles sont traitées conformément à notre Politique de confidentialité.",
          "Nous collectons uniquement les données nécessaires au fonctionnement des services.",
          "Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles."
        ]
      },
      {
        title: "7. Utilisation acceptable",
        content: [
          "Vous vous engagez à ne pas utiliser l'Application pour:",
          "• Des activités illégales ou frauduleuses",
          "• Blanchiment d'argent ou financement du terrorisme",
          "• Harcèlement, abus ou discrimination",
          "• Transmission de virus ou logiciels malveillants",
          "• Contournement des mesures de sécurité"
        ]
      },
      {
        title: "8. Suspension et résiliation",
        content: [
          "Sungku se réserve le droit de suspendre ou résilier votre compte en cas de:",
          "• Violation des présentes conditions",
          "• Activités suspectes ou frauduleuses",
          "• Demande des autorités légales",
          "• Inactivité prolongée (plus de 24 mois)"
        ]
      },
      {
        title: "9. Limitation de responsabilité",
        content: [
          "Sungku fournit l'Application \"en l'état\" sans garanties de disponibilité ininterrompue.",
          "Nous ne sommes pas responsables des pertes indirectes ou des dommages consécutifs.",
          "Notre responsabilité est limitée au montant des frais payés au cours des 12 derniers mois."
        ]
      },
      {
        title: "10. Modifications des conditions",
        content: [
          "Sungku se réserve le droit de modifier ces conditions à tout moment.",
          "Vous serez notifié des modifications importantes par notification dans l'Application.",
          "L'utilisation continue de l'Application après modification vaut acceptation."
        ]
      },
      {
        title: "11. Loi applicable et juridiction",
        content: [
          "Ces conditions sont régies par les lois de la Côte d'Ivoire.",
          "Tout litige sera soumis aux tribunaux compétents d'Abidjan."
        ]
      },
      {
        title: "12. Contact",
        content: [
          "Pour toute question concernant ces conditions:",
          "Email: legal@sungku.app",
          "Téléphone: +225 XX XX XX XX XX",
          "Adresse: Abidjan, Plateau, Côte d'Ivoire"
        ]
      }
    ]
  } : {
    title: "Terms of Service",
    lastUpdated: "Last updated: March 9, 2026",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: [
          "By downloading, installing, or using the Sungku Super App (\"the Application\"), you agree to be bound by these Terms of Service.",
          "If you do not accept these terms, please do not use the Application."
        ]
      },
      {
        title: "2. Service Description",
        content: [
          "Sungku Super App is a multi-service platform providing:",
          "• Money transfers and mobile payments",
          "• Access to third-party mini-applications (delivery, transport, shopping, etc.)",
          "• Account and digital wallet management",
          "• Banking and financial services"
        ]
      },
      {
        title: "3. Registration and User Account",
        content: [
          "You must be at least 18 years old to create an account.",
          "You are responsible for maintaining the confidentiality of your login credentials.",
          "You agree to provide accurate and up-to-date information during registration.",
          "All activity performed under your account is your responsibility."
        ]
      },
      {
        title: "4. Financial Services",
        content: [
          "Financial transactions are subject to local regulations.",
          "Fees may apply for certain transactions (detailed at the time of transaction).",
          "Sungku reserves the right to refuse or cancel a transaction in case of suspected fraud.",
          "Transaction limits may vary based on your KYC verification level."
        ]
      },
      {
        title: "5. Third-Party Mini-Applications",
        content: [
          "Mini-apps available on Sungku are developed by third-party partners.",
          "Each mini-app has its own terms of service.",
          "Sungku is not responsible for content or services provided by third-party mini-apps.",
          "You can install or uninstall mini-apps at any time."
        ]
      },
      {
        title: "6. Privacy and Personal Data",
        content: [
          "Your personal data is processed in accordance with our Privacy Policy.",
          "We only collect data necessary for service operation.",
          "You have the right to access, modify or delete your personal data."
        ]
      },
      {
        title: "7. Acceptable Use",
        content: [
          "You agree not to use the Application for:",
          "• Illegal or fraudulent activities",
          "• Money laundering or terrorism financing",
          "• Harassment, abuse or discrimination",
          "• Transmission of viruses or malicious software",
          "• Bypassing security measures"
        ]
      },
      {
        title: "8. Suspension and Termination",
        content: [
          "Sungku reserves the right to suspend or terminate your account in case of:",
          "• Violation of these terms",
          "• Suspicious or fraudulent activities",
          "• Request from legal authorities",
          "• Prolonged inactivity (more than 24 months)"
        ]
      },
      {
        title: "9. Limitation of Liability",
        content: [
          "Sungku provides the Application \"as is\" without guarantees of uninterrupted availability.",
          "We are not responsible for indirect losses or consequential damages.",
          "Our liability is limited to the amount of fees paid in the last 12 months."
        ]
      },
      {
        title: "10. Modifications to Terms",
        content: [
          "Sungku reserves the right to modify these terms at any time.",
          "You will be notified of significant changes via in-app notification.",
          "Continued use of the Application after modifications constitutes acceptance."
        ]
      },
      {
        title: "11. Applicable Law and Jurisdiction",
        content: [
          "These terms are governed by the laws of Ivory Coast.",
          "Any dispute will be submitted to the competent courts of Abidjan."
        ]
      },
      {
        title: "12. Contact",
        content: [
          "For any questions regarding these terms:",
          "Email: legal@sungku.app",
          "Phone: +225 XX XX XX XX XX",
          "Address: Abidjan, Plateau, Ivory Coast"
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
          <div>
            <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
            <p className="text-xs text-gray-500">{content.lastUpdated}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 space-y-6">
          {content.sections.map((section, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-6 last:border-0">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <div className="space-y-2 text-gray-700 text-sm">
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className={paragraph.startsWith('•') ? 'ml-4' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            💡 {language === 'fr' 
              ? "Ces conditions sont importantes. Veuillez les lire attentivement. En utilisant Sungku, vous confirmez avoir lu et accepté ces conditions."
              : "These terms are important. Please read them carefully. By using Sungku, you confirm that you have read and accepted these terms."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
