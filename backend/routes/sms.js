import express from 'express';
import { readCollection, writeCollection, nowIso } from '../lib/store.js';

const router = express.Router();

// Store OTPs temporarily (in-memory, replace with Redis in production)
const otpStore = new Map();

/**
 * POST /api/sms/send-otp
 * Envoyer un code OTP par SMS
 */
router.post('/send-otp', (req, res) => {
  const { phone, code, provider = 'afrimotech' } = req.body;

  if (!phone || !code) {
    return res.status(400).json({
      success: false,
      message: 'Numéro et code requis'
    });
  }

  try {
    // Store OTP with expiration (10 minutes)
    otpStore.set(phone, {
      code,
      timestamp: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
      provider
    });

    // Simulate SMS sending (replace with real SMS provider)
    console.log(`📱 [${provider.toUpperCase()}] OTP envoyé à ${phone}: ${code}`);

    // Log SMS for debugging
    const logs = readCollection('sms-logs.json', []);
    logs.push({
      id: Date.now().toString(),
      phone,
      code,
      provider,
      status: 'sent',
      timestamp: nowIso()
    });
    writeCollection('sms-logs.json', logs);

    res.json({
      success: true,
      message: `OTP envoyé à ${phone}`,
      provider,
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du SMS'
    });
  }
});

/**
 * POST /api/sms/verify-otp
 * Vérifier un code OTP
 */
router.post('/verify-otp', (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({
      success: false,
      message: 'Numéro et code requis'
    });
  }

  try {
    const otpData = otpStore.get(phone);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'Aucun OTP pour ce numéro'
      });
    }

    // Check expiration
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP expiré'
      });
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'Trop de tentatives. Demandez un nouvel OTP.'
      });
    }

    // Verify code
    if (otpData.code !== code) {
      otpData.attempts++;
      return res.status(400).json({
        success: false,
        message: `Code incorrect (tentative ${otpData.attempts}/3)`
      });
    }

    // OTP verified successfully
    otpStore.delete(phone);

    // Log success
    const logs = readCollection('sms-logs.json', []);
    logs.push({
      id: Date.now().toString(),
      phone,
      code,
      status: 'verified',
      timestamp: nowIso()
    });
    writeCollection('sms-logs.json', logs);

    res.json({
      success: true,
      message: 'OTP vérifié avec succès',
      verified: true
    });
  } catch (error) {
    console.error('SMS verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
});

/**
 * POST /api/sms/send
 * Envoyer un SMS générique
 */
router.post('/send', (req, res) => {
  const { phone, message, provider = 'afrimotech' } = req.body;

  if (!phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'Numéro et message requis'
    });
  }

  try {
    // Simulate SMS sending
    console.log(`📱 [${provider.toUpperCase()}] SMS envoyé à ${phone}: ${message.substring(0, 50)}...`);

    // Log SMS
    const logs = readCollection('sms-logs.json', []);
    logs.push({
      id: Date.now().toString(),
      phone,
      message: message.substring(0, 100),
      provider,
      type: 'notification',
      status: 'sent',
      timestamp: nowIso()
    });
    writeCollection('sms-logs.json', logs);

    res.json({
      success: true,
      message: 'SMS envoyé avec succès',
      provider
    });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du SMS'
    });
  }
});

/**
 * GET /api/sms/status/{phone}
 * Vérifier si un OTP existe pour ce numéro
 */
router.get('/status/:phone', (req, res) => {
  const { phone } = req.params;

  try {
    const otpData = otpStore.get(phone);

    if (!otpData) {
      return res.json({
        success: false,
        hasPending: false,
        message: 'Aucun OTP en attente'
      });
    }

    const expiresIn = Math.ceil((otpData.expiresAt - Date.now()) / 1000);

    if (expiresIn <= 0) {
      otpStore.delete(phone);
      return res.json({
        success: false,
        hasPending: false,
        message: 'OTP expiré'
      });
    }

    res.json({
      success: true,
      hasPending: true,
      expiresIn,
      attempts: otpData.attempts,
      provider: otpData.provider
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
});

/**
 * GET /api/sms/logs
 * Récupérer les logs SMS (admin uniquement)
 */
router.get('/logs', (req, res) => {
  try {
    const logs = readCollection('sms-logs.json', []);
    
    // Return last 100 logs sorted by timestamp desc
    const recentLogs = logs.slice(-100).reverse();

    res.json({
      success: true,
      logs: recentLogs,
      total: logs.length
    });
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs'
    });
  }
});

export default router;
