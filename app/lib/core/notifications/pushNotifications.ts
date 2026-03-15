import { Capacitor } from "@capacitor/core";
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications";

/**
 * Initialise les notifications push sur mobile natif (Android/iOS).
 * Sur web, la fonction ne fait rien.
 */
export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Android 13+ demande une permission runtime, iOS idem.
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.warn("Push notifications permission not granted");
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener("registration", (token: Token) => {
      console.log("FCM token:", token.value);
      localStorage.setItem("fcmToken", token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error);
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        console.log("Push received:", notification);
      }
    );

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log("Push action performed:", action.notification);
      }
    );
  } catch (error) {
    console.error("Failed to init push notifications:", error);
  }
}
