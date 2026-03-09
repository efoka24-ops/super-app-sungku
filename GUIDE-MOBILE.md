# 📱 GUIDE COMPLET - SUNGKU SUPER APP MOBILE

## ✅ État actuel du projet

✓ Build web fonctionnel (`dist/`)  
✓ Serveur dev accessible → `http://localhost:5173/`  
✓ Plateforme Android Capacitor configurée (`android/`)  
✓ Configuration mobile prête (`capacitor.config.ts`)

---

## 🌐 1. TESTER SUR LE NAVIGATEUR (WEB)

### Option A : Serveur de développement (Hot Reload)

```powershell
cd "c:\Users\EMMANUEL\Downloads\super sungku app"
npm run dev
```

→ Ouvre automatiquement **http://localhost:5173/** dans ton navigateur  
→ Les modifications de code se reflètent instantanément

### Option B : Build de production

```powershell
npm run build
npm run preview
```

→ Ouvre **http://localhost:4173/** pour tester la version optimisée

---

## 📱 2. TESTER SUR TÉLÉPHONE ANDROID (USB)

### Prérequis

1. **Android Studio** installé  
   → [Télécharger ici](https://developer.android.com/studio)

2. **Java JDK 17+** installé  
   → Vérifier : `java -version`

3. **Téléphone en mode développeur**  
   - Paramètres → À propos → Appuyer 7x sur "Numéro de build"  
   - Activer **"Débogage USB"** dans Options développeur

4. **Câble USB** connecté au PC

### Étapes de test

#### A. Synchroniser le build avec Android

```powershell
cd "c:\Users\EMMANUEL\Downloads\super sungku app"
npm run build
npx cap sync android
```

#### B. Ouvrir dans Android Studio

```powershell
npx cap open android
```

→ Android Studio se lance avec le projet `android/`

#### C. Lancer sur téléphone

1. Dans Android Studio, attendre l'indexation Gradle (barre de progression en bas)
2. Sélectionner ton téléphone dans la liste déroulante (en haut à droite)
3. Cliquer sur ▶️ **Run** (bouton vert)

→ L'app s'installe et se lance sur ton téléphone ! 🎉

---

## 📦 3. GÉNÉRER L'APK (FICHIER D'INSTALLATION)

### Option A : APK Debug (rapide, pour test)

```powershell
cd "c:\Users\EMMANUEL\Downloads\super sungku app\android"
./gradlew assembleDebug
```

→ APK généré : `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B : APK Release (optimisé, pour distribution)

#### 1. Créer une clé de signature

```powershell
keytool -genkey -v -keystore sungku-release.keystore -alias sungku -keyalg RSA -keysize 2048 -validity 10000
```

→ Répondre aux questions (mot de passe, nom, organisation, etc.)  
→ Fichier `sungku-release.keystore` créé

#### 2. Configurer la signature

Éditer `android/app/build.gradle` :

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../sungku-release.keystore")
            storePassword "TON_MOT_DE_PASSE"
            keyAlias "sungku"
            keyPassword "TON_MOT_DE_PASSE"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 3. Générer l'APK Release

```powershell
cd android
./gradlew assembleRelease
```

→ APK signé : `android/app/build/outputs/apk/release/app-release.apk`

---

## 🎨 4. WORKFLOW DE DÉVELOPPEMENT MOBILE

### Après chaque modification de code React :

```powershell
# 1. Rebuild web
npm run build

# 2. Sync vers Android
npx cap sync android

# 3. Relancer l'app dans Android Studio
```

### Commande combinée (rapide)

```powershell
npm run mobile:build
```

→ Lance `build` + `sync` automatiquement

---

## 🐞 5. DÉBUGGAGE SUR TÉLÉPHONE

### Afficher les logs Android

```powershell
cd "c:\Users\EMMANUEL\Downloads\super sungku app\android"
adb logcat | findstr "Capacitor"
```

### Inspecter le WebView (Chrome DevTools)

1. Téléphone connecté en USB avec l'app lancée
2. Chrome PC → `chrome://inspect`
3. Cliquer **"Inspect"** sous l'app Sungku

→ Console, Network, Elements, etc. comme sur navigateur web ! 🛠️

---

## 📤 6. DISTRIBUER L'APPLICATION

### Option A : Partage direct (APK)

1. Copier `app-release.apk` sur Google Drive / WhatsApp / Email
2. L'utilisateur télécharge et installe (activer "Sources inconnues")

### Option B : Google Play Store (officiel)

1. Créer un compte développeur Google Play ($25 unique)
2. Upload l'APK (ou AAB) dans la console :  
   → https://play.google.com/console
3. Remplir fiche store (description, captures, catégorie)
4. Soumettre pour review (~48h)

### Générer un AAB (Android App Bundle) - Recommandé Play Store

```powershell
cd android
./gradlew bundleRelease
```

→ Fichier : `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🚀 7. COMMANDES RÉCAPITULATIVES

| Action | Commande |
|--------|----------|
| **Dev web** | `npm run dev` |
| **Build web** | `npm run build` |
| **Preview prod** | `npm run preview` |
| **Sync Android** | `npx cap sync android` |
| **Ouvrir Android Studio** | `npx cap open android` |
| **Build + Sync mobile** | `npm run mobile:build` |
| **APK Debug** | `cd android ; ./gradlew assembleDebug` |
| **APK Release** | `cd android ; ./gradlew assembleRelease` |
| **AAB Release** | `cd android ; ./gradlew bundleRelease` |

---

## 📝 CHECKLIST AVANT LANCEMENT

### Web
- [ ] Tester sur Chrome, Firefox, Safari
- [ ] Responsive mobile (F12 → mode mobile)
- [ ] Performance Lighthouse > 80

### Android
- [ ] Tester sur Android 10+
- [ ] Vérifier permissions manifeste
- [ ] Icônes + Splash screen personnalisés
- [ ] Signature APK configurée

### Play Store
- [ ] Privacy Policy URL
- [ ] Screenshots (minimum 2)
- [ ] Description FR/EN
- [ ] Icône 512x512 PNG
- [ ] Content rating rempli

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

### Court terme (cette semaine)
1. ✅ Tester l'app sur navigateur → `npm run dev`
2. ✅ Installer sur ton téléphone via USB
3. Personnaliser icône + splash (voir `/android/app/src/main/res/`)

### Moyen terme (ce mois)
4. Implémenter backend API (auth, wallet, paiements)
5. Tester paiements Mobile Money en sandbox
6. Préparer Google Play listing

### Long terme (3-6 mois)
7. Launch beta fermée (100 users)
8. KYC + compliance bancaire
9. Lancement public Play Store

---

## 📞 SUPPORT & RESSOURCES

- **Capacitor Docs** : https://capacitorjs.com/docs
- **Android Studio** : https://developer.android.com/studio/intro
- **React Router** : https://reactrouter.com/
- **Tailwind CSS** : https://tailwindcss.com/docs

---

**💡 TIP** : Pour tester rapidement sur mobile sans USB, tu peux utiliser :
- **Expo Tunnel** (si tu passes à Expo)
- **ngrok** pour exposer ton serveur local sur internet
- **Netlify/Vercel** pour deploy web instantané

Bonne création ! 🚀
