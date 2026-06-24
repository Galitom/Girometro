import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classifica from './pages/Classifica';
import Statistiche from './pages/Statistiche';
import Leghe from './pages/Leghe';
import Tornei from './pages/Tornei';
import Chat from './pages/Chat';
import Achievement from './pages/Achievement';

function RequireAuth({ children }) {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;  // wait until the initial token check resolves
  if (!me) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="classifica" element={<Classifica />} />
            <Route path="statistiche" element={<Statistiche />} />
            <Route path="leghe" element={<Leghe />} />
            <Route path="tornei" element={<Tornei />} />
            <Route path="chat" element={<Chat />} />
            <Route path="achievement" element={<Achievement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
