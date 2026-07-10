import {render, screen} from '@testing-library/react';
import {vi, test, expect} from 'vitest';
import LoginPage from '../pages/LoginPage';
import {ThemeProvider} from '../context/ThemeContext';

vi.mock('../context/AuthContext', () => ({useAuth: () => ({login: vi.fn()})}));

test('login expõe campos e ação com nomes acessíveis', () => {
  render(<ThemeProvider><LoginPage /></ThemeProvider>);
  expect(screen.getByRole('textbox', {name: 'Usuário'})).toBeVisible();
  expect(screen.getByLabelText('Senha')).toBeVisible();
  expect(screen.getByRole('button', {name: 'Entrar'})).toBeEnabled();
});
