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

  const inputClass = 'ui-input block min-h-12 w-full appearance-none border-x-0 border-t-0 border-b-2 px-0 py-3 text-base text-slate-900 transition-colors focus:border-[var(--login-brand)] focus:outline-none focus:ring-0 sm:text-sm';
  const labelClass = 'mb-1 block text-sm font-semibold text-slate-700';
  const secondaryActionClass = 'inline-flex min-h-11 items-center justify-center rounded-md px-2 font-semibold text-[var(--login-link)] underline underline-offset-4 transition-colors hover:text-[var(--login-link-hover)]';

  return (
    <main className="ui-page grid min-h-[100dvh] overflow-x-hidden lg:grid-cols-[minmax(0,1.4fr)_minmax(26rem,1fr)]">
      <section
        aria-labelledby="welcome-title"
        className="relative flex min-h-72 flex-col overflow-hidden bg-[var(--login-brand)] px-6 py-7 text-white sm:min-h-80 sm:px-10 sm:py-9 lg:min-h-[100dvh] lg:justify-between lg:px-[clamp(3rem,8vw,8rem)] lg:py-14"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-12 h-72 w-72 rotate-12 border border-white/10 lg:right-[8%] lg:top-[12%] lg:h-[30rem] lg:w-[30rem]" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[-15rem] left-[22%] h-[30rem] w-[30rem] rotate-45 border border-white/10 lg:bottom-[-11rem] lg:h-[38rem] lg:w-[38rem]" />

        <div className="relative z-10 w-full text-center">
          <span className="text-3xl font-bold leading-tight text-[var(--login-brand-soft)] sm:text-4xl lg:mt-8 lg:inline-block lg:text-6xl">
            Central de atendimento
          </span>
        </div>

        <div className="relative z-10 mx-auto mt-auto max-w-2xl pb-1 pt-6 text-center lg:my-auto lg:pb-10 lg:pt-14">
          <h2 id="welcome-title" className="mx-auto max-w-xl text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl">
            Olá, seja bem-vindo!
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--login-brand-soft)] sm:text-lg lg:mt-7 lg:text-xl">
            Registre solicitações, acompanhe o atendimento e encontre as respostas da equipe de TI em um só lugar.
          </p>
        </div>

        <footer className="relative z-10 mt-8 flex flex-col items-center gap-3 text-center lg:mt-0">
          <img
            src="/brand/arbtech-helpdesk-logo-transparent.png"
            alt="Arbtech Info"
            className="h-[3.2rem] w-[3.2rem] object-contain sm:h-16 sm:w-16 lg:h-[5.6rem] lg:w-[5.6rem]"
          />
          <p className="hidden text-sm text-[var(--login-brand-muted)] lg:block">
            © {new Date().getFullYear()} Arbtech Info. Todos os direitos reservados.
          </p>
        </footer>
      </section>

      <section className="ui-surface relative flex min-h-[calc(100dvh-18rem)] flex-col items-center justify-start px-6 py-12 sm:min-h-[calc(100dvh-20rem)] sm:px-10 sm:py-14 lg:min-h-[100dvh] lg:justify-center lg:px-[clamp(3rem,6vw,6.5rem)] lg:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 sm:mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--login-link)]">Chamados TI</p>
            <h1 className="ui-text mt-5 text-3xl font-bold leading-tight sm:text-4xl">Helpdesk TI</h1>
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
                <p id="password-hint" className="mt-2 text-xs leading-relaxed text-slate-500">Mínimo de 10 caracteres, com maiúscula, minúscula e número.</p>
              </div>
              <div>
                <label htmlFor="register-confirm-password" className={labelClass}>Confirmar senha</label>
                <input id="register-confirm-password" type="password" value={registration.confirmPassword} onChange={updateRegistration('confirmPassword')} required minLength={10} className={inputClass} autoComplete="new-password" />
              </div>
              {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}
              <button type="submit" disabled={isLoading} className="ocean-login-action min-h-12 w-full rounded-md bg-[var(--login-action)] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--login-action-hover)] disabled:cursor-not-allowed disabled:bg-slate-400">
                {isLoading ? 'Criando acesso...' : 'Criar acesso'}
              </button>
              <div className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[1.1rem] text-slate-600">
                <span>Já possui uma conta?</span>
                <button type="button" onClick={() => { setIsRegistering(false); setError(''); }} className={secondaryActionClass}>
                  Voltar para entrar
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className={labelClass}>Usuário</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="seu.usuario"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className={labelClass}>Senha</label>
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
              <div className="flex min-h-11 items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-500 bg-slate-100 text-[var(--login-link)] focus:ring-[var(--login-brand)]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                  Lembrar de mim
                </label>
              </div>

              {registrationSuccess && <p role="status" className="rounded-md border border-green-200 bg-green-50 p-3 text-center text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">{registrationSuccess}</p>}
              {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</p>}

              <button type="submit" disabled={isLoading} className="ocean-login-action min-h-12 w-full rounded-md bg-[var(--login-action)] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--login-action-hover)] disabled:cursor-not-allowed disabled:bg-slate-400">
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
              <div className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[1.1rem] text-slate-600">
                <span>Ainda não possui acesso?</span>
                <button type="button" onClick={() => { setIsRegistering(true); setError(''); setRegistrationSuccess(''); }} className={secondaryActionClass}>
                  Criar novo acesso
                </button>
              </div>
            </form>
          )}
        </div>

        <footer className="mt-10 flex w-full flex-col items-center gap-3 text-center lg:absolute lg:bottom-6 lg:left-0 lg:mt-0">
          <ThemeToggle />
        </footer>
      </section>
    </main>
  );
};

export default LoginPage;
