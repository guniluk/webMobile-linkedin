import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import LogoutPage from './pages/auth/LogoutPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import ConnectionsPage from './pages/ConnectionsPage';
import { useQuery } from '@tanstack/react-query';

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        if (res.status === 401) return null;
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      } catch (err) {
        console.error(err);
        return null;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-ring loading-lg text-[#0a66c2]"></span>
          <p className="text-slate-400 font-medium animate-pulse text-sm">
            로딩 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout authUser={authUser}>
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/logout" element={<LogoutPage />} />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/network"
          element={authUser ? <ConnectionsPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </Layout>
  );
};

export default App;
