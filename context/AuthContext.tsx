import {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import {User} from '../types';
import * as apiService from '../services/apiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (username: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newUserData: Partial<User>) => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    apiService.refreshSession().then(data => { setToken(data.token); setUser(data.user); }).catch(() => undefined).finally(() => setIsInitializing(false));
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    const data = await apiService.login(username, password, rememberMe);
    setToken(data.token); setUser(data.user);
  };
  const logout = async () => { await apiService.logoutSession(); setToken(null); setUser(null); };
  const updateUser = (newUserData: Partial<User>) => setUser(current => current ? {...current, ...newUserData} : current);

  return <AuthContext.Provider value={{user, token, isAuthenticated: Boolean(token), isInitializing, login, logout, updateUser}}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
