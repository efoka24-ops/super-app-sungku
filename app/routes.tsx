import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Splash from "./lib/features/auth/pages/Splash";
import Onboarding from "./lib/features/auth/pages/Onboarding";
import Welcome from "./lib/features/auth/pages/Welcome";
import SignUp from "./lib/features/auth/pages/SignUp";
import SignIn from "./lib/features/auth/pages/SignIn";
import VerifyPhone from "./lib/features/auth/pages/VerifyPhone";
import Home from "./lib/features/wallet/pages/Home";
import Payments from "./lib/features/payments/pages/Payments";
import MiniApps from "./lib/features/miniapps/pages/MiniApps";
import Messages from "./lib/features/messages/pages/Messages";
import Profile from "./pages/Profile";
import SendMoney from "./lib/features/payments/pages/SendMoney";
import ReceiveMoney from "./lib/features/payments/pages/ReceiveMoney";
import ScanQR from "./lib/features/payments/pages/ScanQR";
import SungkuSend from "./lib/features/miniapps/pages/SungkuSendNew";
import SungkuSendResult from "./lib/features/miniapps/pages/SungkuSendResult";
import ProfileInfo from "./pages/profile/ProfileInfo";
import ProfileCards from "./pages/profile/ProfileCards";
import ProfileApps from "./pages/profile/ProfileApps";
import SettingsNotifications from "./pages/settings/SettingsNotifications";
import SettingsLanguage from "./pages/settings/SettingsLanguage";
import SettingsSecurity from "./pages/settings/SettingsSecurity";
import HelpCenter from "./pages/HelpCenter";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Splash },
      { path: "onboarding", Component: Onboarding },
      { path: "welcome", Component: Welcome },
      { path: "signup", Component: SignUp },
      { path: "signin", Component: SignIn },
      { path: "verify", Component: VerifyPhone },
      { path: "home", Component: Home },
      { path: "payments", Component: Payments },
      { path: "mini-apps", Component: MiniApps },
      { path: "messages", Component: Messages },
      { path: "profile", Component: Profile },
      { path: "send-money", Component: SendMoney },
      { path: "profile/info", Component: ProfileInfo },
      { path: "profile/cards", Component: ProfileCards },
      { path: "profile/apps", Component: ProfileApps },
      { path: "settings/notifications", Component: SettingsNotifications },
      { path: "settings/language", Component: SettingsLanguage },
      { path: "settings/security", Component: SettingsSecurity },
      { path: "help", Component: HelpCenter },
      { path: "legal/terms", Component: TermsOfService },
      { path: "legal/privacy", Component: PrivacyPolicy },
      { path: "receive-money", Component: ReceiveMoney },
      { path: "scan-qr", Component: ScanQR },
      { path: "miniapps/sungku-send", Component: SungkuSend },
      { path: "miniapps/sungku-send/result", Component: SungkuSendResult },
      { path: "*", Component: NotFound },
    ],
  },
]);