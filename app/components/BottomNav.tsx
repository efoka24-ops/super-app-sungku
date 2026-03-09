import { useLocation, useNavigate } from "react-router";
import { Home, CreditCard, Grid3x3, MessageCircle, User } from "lucide-react";

const navItems = [
  { path: "/home", icon: Home, label: "Accueil" },
  { path: "/payments", icon: CreditCard, label: "Paiements" },
  { path: "/mini-apps", icon: Grid3x3, label: "Mini Apps" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/profile", icon: User, label: "Profil" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? "text-emerald-500" : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs ${
                  isActive ? "text-emerald-500 font-medium" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
