# Sungku Daemon APK

Application Android indépendante qui tourne en arrière-plan et envoie automatiquement les OTP générés par le backend Sungku via SMS.

## Fonctionnement
- Interroge périodiquement l’API backend pour récupérer les OTP à envoyer.
- Envoie les SMS automatiquement.
- Peut être installée sur n’importe quel téléphone Android (minSdk 23).

## Build

```sh
cd android-daemon
./gradlew assembleDebug
```

APK généré : `android-daemon/app/build/outputs/apk/debug/app-debug.apk`

## Permissions
- SMS (SEND_SMS)
- Internet

## Lancement
L’application démarre le service automatiquement au lancement.

---

**Ce daemon est totalement séparé de l’application principale Sungku Super App.**
