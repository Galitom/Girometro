import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);  // resolving initial token

  // On boot, if a token exists, try to load the current user.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getToken()) {
        try {
          const data = await getMe();
          if (!cancelled) setMe(data);
        } catch {
          apiLogout();
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username, password) => {
    await apiLogin(username, password);
    setMe(await getMe());
  }, []);

  const register = useCallback(async (payload) => {
    await apiRegister(payload);
    setMe(await getMe());
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setMe(null);
  }, []);

  // Let pages refresh "me" after actions that change stats (e.g. a new match).
  const refreshMe = useCallback(async () => {
    try { setMe(await getMe()); } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ me, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
