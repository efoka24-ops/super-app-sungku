/**
 * SMS Service Configuration
 * Support pour Twilio, Afrimotech, Mozao et d'autres providers
 */

interface SmsProvider {
  name: string;
  sendOtp(phone: string, code: string): Promise<boolean>;
  sendTransactionConfirm(phone: string, amount: number, recipient: string): Promise<boolean>;
}

// Provider: Twilio (à configurer avec variables d'environnement)
const twilioProvider: SmsProvider = {
  name: 'twilio',
  async sendOtp(phone: string, code: string): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:4000/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code,
          provider: 'twilio'
        })
      });
      return response.ok;
    } catch {
      console.error('Twilio SMS failed:', phone);
      return false;
    }
  },

  async sendTransactionConfirm(phone: string, amount: number, recipient: string): Promise<boolean> {
    try {
      const message = `Sungku: Vous avez envoyé ${amount.toLocaleString()} FCFA à ${recipient}. Ref: ${Date.now()}`;
      const response = await fetch('http://localhost:4000/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

// Provider: Afrimotech (API local gratuit)
const afrimotechProvider: SmsProvider = {
  name: 'afrimotech',
  async sendOtp(phone: string, code: string): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:4000/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code,
          provider: 'afrimotech'
        })
      });
      return response.ok;
    } catch {
      console.error('Afrimotech SMS failed:', phone);
      return false;
    }
  },

  async sendTransactionConfirm(phone: string, amount: number, recipient: string): Promise<boolean> {
    try {
      const message = `Sungku: ${amount.toLocaleString()} FCFA envoyés à ${recipient}`;
      const response = await fetch('http://localhost:4000/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message, provider: 'afrimotech' })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

// SMS Service Manager
class SmsService {
  private provider: SmsProvider;

  constructor(providerName: string = 'afrimotech') {
    this.provider = providerName === 'twilio' ? twilioProvider : afrimotechProvider;
  }

  /**
   * Envoyer un code OTP par SMS
   */
  async sendOtp(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    if (!phone || !code) {
      return { success: false, message: 'Numéro ou code manquant' };
    }

    try {
      const sent = await this.provider.sendOtp(phone, code);
      if (sent) {
        return { success: true, message: `OTP envoyé à ${phone}` };
      } else {
        return { success: false, message: 'Erreur lors de l\'envoi du SMS' };
      }
    } catch (error) {
      console.error('SMS service error:', error);
      return { success: false, message: 'Service SMS temporairement indisponible' };
    }
  }

  /**
   * Envoyer une confirmation de transaction
   */
  async sendTransactionConfirm(phone: string, amount: number, recipient: string): Promise<{ success: boolean; message: string }> {
    try {
      const sent = await this.provider.sendTransactionConfirm(phone, amount, recipient);
      if (sent) {
        return { success: true, message: 'SMS de confirmation envoyé' };
      } else {
        return { success: false, message: 'Erreur lors de l\'envoi du SMS' };
      }
    } catch (error) {
      console.error('Transaction SMS error:', error);
      return { success: false, message: 'Service SMS indisponible' };
    }
  }

  /**
   * Générer un code OTP aléatoire
   */
  static generateOtp(length: number = 6): string {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)))
      .toString()
      .slice(0, length);
  }

  /**
   * Formater un numéro camerounais
   */
  static formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\D/g, '');
    
    // Si le numéro commence par 237, supprimer
    if (formatted.startsWith('237')) {
      formatted = formatted.slice(3);
    }
    
    // Pad avec 237 si nécessaire
    if (formatted.length === 9) {
      formatted = '237' + formatted;
    }
    
    return formatted;
  }
}

export const smsService = new SmsService(import.meta.env.VITE_SMS_PROVIDER || 'afrimotech');
export default SmsService;
