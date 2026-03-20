package com.sungku.daemon;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.telephony.SmsManager;
import androidx.annotation.Nullable;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;

public class SmsDaemonService extends Service {
    private static final String TAG = "SmsDaemonService";
    private Handler handler;
    private Runnable fetchTask;
    private static final int INTERVAL = 60 * 1000; // 1 min

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service démarré");
        handler = new Handler(Looper.getMainLooper());
        fetchTask = new Runnable() {
            @Override
            public void run() {
                fetchAndSendOtps();
                handler.postDelayed(this, INTERVAL);
            }
        };
        handler.post(fetchTask);
        return START_STICKY;
    }

    private void fetchAndSendOtps() {
        new Thread(() -> {
            try {
                URL url = new URL("https://super-app-sungku.onrender.com/api/sms/pending-otps");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) {
                        response.append(line);
                    }
                    in.close();
                    JSONArray otps = new JSONArray(response.toString());
                    for (int i = 0; i < otps.length(); i++) {
                        JSONObject otpObj = otps.getJSONObject(i);
                        String phone = otpObj.getString("phone");
                        String otp = otpObj.getString("otp");
                        sendSms(phone, otp);
                        // TODO: notifier le backend que l'OTP a été envoyé
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Erreur fetch/send OTP", e);
            }
        }).start();
    }

    private void sendSms(String phoneNumber, String message) {
        SmsManager smsManager = SmsManager.getDefault();
        smsManager.sendTextMessage(phoneNumber, null, message, null, null);
        Log.d(TAG, "SMS envoyé à " + phoneNumber);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "SmsDaemonService destroyed");
    }
}
