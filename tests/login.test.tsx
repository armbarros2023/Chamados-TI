import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, vi, test, expect} from 'vitest';
import LoginPage from '../pages/LoginPage';
import {ThemeProvider} from '../context/ThemeContext';

vi.mock('../context/AuthContext', () => ({useAuth: () => ({login: vi.fn()})}));
vi.mock('../services/apiService', () => ({register: vi.fn()}));

afterEach(cleanup);

test('login expõe campos e ação com nomes acessíveis', () => {
  render(<ThemeProvider><LoginPage /></ThemeProvider>);
  expect(screen.getByRole('textbox', {name: 'Usuário'})).toBeVisible();
  expect(screen.getByLabelText('Senha')).toBeVisible();
  expect(screen.getByRole('button', {name: 'Entrar'})).toBeEnabled();
  expect(screen.getByRole('button', {name: 'Criar novo acesso'})).toBeEnabled();
  expect(screen.getByRole('heading', {name: 'Olá, seja bem-vindo!'})).toBeVisible();
});

test('cadastro continua disponível na mesma tela', () => {
  render(<ThemeProvider><LoginPage /></ThemeProvider>);
  fireEvent.click(screen.getByRole('button', {name: 'Criar novo acesso'}));

  expect(screen.getByRole('textbox', {name: 'Nome completo'})).toBeVisible();
  expect(screen.getByRole('textbox', {name: 'E-mail'})).toBeVisible();
  expect(screen.getByRole('textbox', {name: 'Usuário'})).toBeVisible();
  expect(screen.getByLabelText('Confirmar senha')).toBeVisible();
  expect(screen.getByRole('button', {name: 'Criar acesso'})).toBeEnabled();
  expect(screen.getByRole('button', {name: 'Voltar para entrar'})).toBeEnabled();
});
