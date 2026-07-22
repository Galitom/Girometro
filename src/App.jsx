import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classifica from './pages/Classifica';
import Partite from './pages/Partite';
import Statistiche from './pages/Statistiche';
import Leghe from './pages/Leghe';
import Tornei from './pages/Tornei';
import Achievement from './pages/Achievement';
import GestioneRuoli from './pages/GestioneRuoli';
import GestionePartite from './pages/GestionePartite';
import { isAdmin } from './auth/roles';

function RequireAuth({ children }) {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;  // wait until the initial token check resolves
  if (!me) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

// Rotte riservate agli admin: reindirizza alla dashboard chi non lo è.
function RequireAdmin({ children }) {
  const { me, loading } = useAuth();
  if (loading) return null;
  if (!isAdmin(me)) return <Navigate to="/" replace />;
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
            <Route path="partite" element={<Partite />} />
            <Route path="statistiche" element={<Statistiche />} />
            <Route path="leghe" element={<Leghe />} />
            <Route path="tornei" element={<Tornei />} />
            <Route path="achievement" element={<Achievement />} />
            <Route
              path="gestione-ruoli"
              element={
                <RequireAdmin>
                  <GestioneRuoli />
                </RequireAdmin>
              }
            />
            <Route
              path="gestione-partite"
              element={
                <RequireAdmin>
                  <GestionePartite />
                </RequireAdmin>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
