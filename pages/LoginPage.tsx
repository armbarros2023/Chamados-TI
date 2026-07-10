import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HelpDeskLogoIcon } from '../components/icons';
import ThemeToggle from '../components/ThemeToggle';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password, rememberMe);
    } catch (err: any) {
      if (err && err.message && err.message.includes('Muitas tentativas')) {
        setError(err.message);
      } else {
        setError('Falha no login. Verifique suas credenciais.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-slate-100 text-slate-900 p-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="w-full max-w-md p-8 space-y-8 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
            <HelpDeskLogoIcon className="h-12 w-12 text-teal-700" />
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-900">
            Suporte Chemisch
          </h1>
          <p className="text-slate-600">Bem-vindo de volta!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-2">Usuário</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full bg-white border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-teal-600 sm:text-sm text-slate-900"
                placeholder="seu.usuario"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-2">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full bg-white border border-slate-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-teal-600 sm:text-sm text-slate-900"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-500 bg-slate-100 text-teal-700 focus:ring-teal-600 focus:ring-offset-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                  Lembrar de mim
                </label>
              </div>
            </div>

          {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg text-center border border-red-500/20">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full min-h-11 justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
