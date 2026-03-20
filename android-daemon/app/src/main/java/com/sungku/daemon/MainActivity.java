package com.sungku.daemon;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d("MainActivity", "Lancement du daemon");
        startService(new Intent(this, SmsDaemonService.class));
        finish();
    }
}
