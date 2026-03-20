package com.sungku.superapp.smsdaemon;

import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class SmsUtils {
    public static void sendOtpToServer(String otp, String sender) {
        try {
            URL url = new URL("https://super-app-sungku.onrender.com/api/sms/otp"); // À adapter
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            String json = String.format("{\"otp\":\"%s\",\"sender\":\"%s\"}", otp, sender);
            OutputStream os = conn.getOutputStream();
            os.write(json.getBytes());
            os.flush();
            os.close();
            int responseCode = conn.getResponseCode();
            Log.d("SmsUtils", "OTP envoyé au serveur, code: " + responseCode);
        } catch (Exception e) {
            Log.e("SmsUtils", "Erreur envoi OTP serveur", e);
        }
    }
}
