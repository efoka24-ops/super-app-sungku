import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sungku.app',
  appName: 'Sungku',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Use cleartext/http inside Android WebView for local/dev API compatibility.
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
