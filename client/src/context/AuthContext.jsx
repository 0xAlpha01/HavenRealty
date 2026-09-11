import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { clearAuthStorage, getStoredToken } from '../services/api';

const AuthContext = createContext(null);

// Returns whichever storage currently holds the session, defaulting to
// localStorage for a brand new (not-yet-authenticated) session.
const getActiveStorage = () =>
  sessionStorage.getItem('token') ? sessionStorage : localStorage;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((res) => {
        setUser(res.data.user);
        getActiveStorage().setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        clearAuthStorage();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ rememberMe = true, ...credentials }) => {
    const res = await authService.login(credentials);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', res.data.token);
    storage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  // Registration doesn't log the user in immediately - they log in separately
  // afterward.
  const register = async (payload) => {
    const res = await authService.register(payload);
    return res.data;
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    authService.logout().catch(() => {});
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    getActiveStorage().setItem('user', JSON.stringify(updatedUser));
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
