import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
}

export default function AdminLayout({ children, title, showBackButton = false }: AdminLayoutProps) {
  const { logout, adminName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Utilisateurs', path: '/users', icon: '👥' },
    { label: 'Mini-Apps', path: '/miniapps', icon: '📱' },
    { label: 'Analytiques', path: '/analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition md:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">Admin Sungku</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-700">👤 {adminName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    location.pathname === item.path
                      ? 'bg-emerald-50 text-emerald-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition mt-2"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sungku Admin</h3>
              <p className="text-sm text-gray-600">Gérez votre plateforme de super app</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Navigation</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><button onClick={() => navigate('/dashboard')} className="hover:text-emerald-600">Dashboard</button></li>
                <li><button onClick={() => navigate('/users')} className="hover:text-emerald-600">Utilisateurs</button></li>
                <li><button onClick={() => navigate('/miniapps')} className="hover:text-emerald-600">Mini-Apps</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>Email: admin@sungku.app</li>
                <li>Phone: +237 6XX XXX XXX</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                © 2026 Sungku Super App. Tous droits réservés.
              </p>
              <div className="flex gap-4 text-sm text-gray-600">
                <button className="hover:text-emerald-600">Conditions d'utilisation</button>
                <button className="hover:text-emerald-600">Politique de confidentialité</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
