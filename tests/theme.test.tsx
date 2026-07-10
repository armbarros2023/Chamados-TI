import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const renderThemeToggle = () => render(
  <ThemeProvider>
    <ThemeToggle />
  </ThemeProvider>,
);

describe('tema da aplicação', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('alterna para o tema escuro e salva a preferência', () => {
    renderThemeToggle();

    fireEvent.click(screen.getByRole('button', { name: /ativar tema escuro/i }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('chamados-ti-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /ativar tema claro/i })).toBeInTheDocument();
  });

  it('usa a preferência escura do sistema quando não há escolha salva', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    renderThemeToggle();

    expect(document.documentElement).toHaveClass('dark');
  });
});
