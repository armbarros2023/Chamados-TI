import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import * as apiService from '../services/apiService';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registration, setRegistration] = useState({name: '', email: '', username: '', password: '', confirmPassword: ''});
  const [registrationSuccess, setRegistrationSuccess] = useState('');

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegistrationSuccess('');
    if (registration.password !== registration.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setIsLoading(true);
    try {
      await apiService.register({
        name: registration.name,
        email: registration.email,
        username: registration.username,
        password: registration.password,
      });
      setUsername(registration.username);
      setPassword('');
      setRegistration({name: '', email: '', username: '', password: '', confirmPassword: ''});
      setIsRegistering(false);
      setRegistrationSuccess('Cadastro realizado. Entre com seu novo usuário e senha.');
    } catch (err: any) {
      setError(err?.message || 'Não foi possível concluir o cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRegistration = (field: keyof typeof registration) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRegistration(current => ({...current, [field]: e.target.value}));

  const inputClass = 'ui-input mt-1 block w-full rounded-lg border py-3 px-4 text-slate-900 focus:ring-2 focus:ring-teal-600 sm:text-sm';
  const labelClass = 'block text-sm font-medium text-slate-600 mb-2';

  return (
    <main className="ui-page relative flex min-h-[100dvh] items-center justify-center p-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="ui-surface w-full max-w-md space-y-8 rounded-xl border p-8 shadow-sm">
        <div className="flex flex-col items-center space-y-3">
          <img
            src="/brand/arbtech-helpdesk-logo-transparent.png"
            alt="Arbtech Info"
            className="h-36 w-36 object-contain"
          />
          <h1 className="text-3xl font-bold text-center text-slate-900">
            Helpdesk TI
          </h1>
          <p className="text-slate-600">Bem-vindo de volta!</p>
        </div>

        {isRegistering ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="register-name" className={labelClass}>Nome completo</label>
              <input id="register-name" type="text" value={registration.name} onChange={updateRegistration('name')} required className={inputClass} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="register-email" className={labelClass}>E-mail</label>
              <input id="register-email" type="email" value={registration.email} onChange={updateRegistration('email')} required className={inputClass} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="register-username" className={labelClass}>Usuário</label>
              <input id="register-username" type="text" value={registration.username} onChange={updateRegistration('username')} required className={inputClass} autoComplete="username" />
            </div>
            <div>
              <label htmlFor="register-password" className={labelClass}>Senha</label>
              <input id="register-password" type="password" value={registration.password} onChange={updateRegistration('password')} required minLength={10} className={inputClass} autoComplete="new-password" aria-describedby="password-hint" />
              <p id="password-hint" className="mt-1 text-xs text-slate-500">Mínimo de 10 caracteres, com maiúscula, minúscula e número.</p>
            </div>
            <div>
              <label htmlFor="register-confirm-password" className={labelClass}>Confirmar senha</label>
              <input id="register-confirm-password" type="password" value={registration.confirmPassword} onChange={updateRegistration('confirmPassword')} required minLength={10} className={inputClass} autoComplete="new-password" />
            </div>
            {error && <p role="alert" className="text-sm text-red-800 bg-red-50 p-3 rounded-lg text-center border border-red-200">{error}</p>}
            <button type="submit" disabled={isLoading} className="ui-primary min-h-11 w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-slate-400">
              {isLoading ? 'Criando acesso...' : 'Criar acesso'}
            </button>
            <button type="button" onClick={() => { setIsRegistering(false); setError(''); }} className="min-h-11 w-full rounded-lg border border-teal-200 px-4 py-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 dark:border-teal-800 dark:text-teal-200 dark:hover:bg-teal-950/60">Voltar para entrar</button>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-2">Usuário</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={inputClass}
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
                className={inputClass}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex min-h-11 items-center">
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

          {registrationSuccess && <p role="status" className="text-sm text-green-800 bg-green-50 p-3 rounded-lg text-center border border-green-200">{registrationSuccess}</p>}
          {error && <p role="alert" className="text-sm text-red-800 bg-red-50 p-3 rounded-lg text-center border border-red-200">{error}</p>}

          <button type="submit" disabled={isLoading} className="ui-primary min-h-11 w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-slate-400">
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
          <button type="button" onClick={() => { setIsRegistering(true); setError(''); setRegistrationSuccess(''); }} className="min-h-11 w-full rounded-lg border border-teal-200 px-4 py-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 dark:border-teal-800 dark:text-teal-200 dark:hover:bg-teal-950/60">
            Criar novo acesso
          </button>
        </form>
        )}
      </div>
    </main>
  );
};

export default LoginPage;
