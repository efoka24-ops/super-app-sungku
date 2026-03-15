import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import MiniAppsPage from './pages/MiniAppsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UserDetailPage from './pages/UserDetailPage';
import CommsPage from './pages/CommsPage';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <UsersPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/miniapps',
    element: (
      <ProtectedRoute>
        <MiniAppsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/users/:userId',
    element: (
      <ProtectedRoute>
        <UserDetailPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/comms',
    element: (
      <ProtectedRoute>
        <CommsPage />
      </ProtectedRoute>
    )
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
