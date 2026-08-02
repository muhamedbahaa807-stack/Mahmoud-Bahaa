import { createContext, useContext, useEffect, useState } from 'react';
import { setAccessToken, removeAccessToken } from '../api/tokenService.js';
import api from '../api/axios.js';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    setUser(null);
    removeAccessToken();
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const refreshRes = await api.post('/users/refresh');

        setAccessToken(refreshRes.data.accessToken);

        const { data } = await api.get('/users/profile');

        setUser(data);
      } catch (err) {
        removeAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used within AuthProvider');

  return context;
};
