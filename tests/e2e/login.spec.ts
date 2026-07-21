import {test, expect} from '@playwright/test';

test('login permanece utilizável e sem rolagem horizontal', async ({page}) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', {name: /Helpdesk TI/i})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Olá, seja bem-vindo!'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Entrar'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Criar novo acesso'})).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});

test('login permanece responsivo em celular e abre o cadastro', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/login');

  await expect(page.getByRole('button', {name: 'Entrar'})).toBeVisible();
  await page.getByRole('button', {name: 'Criar novo acesso'}).click();
  await expect(page.getByRole('button', {name: 'Criar acesso'})).toBeVisible();
  await expect(page.getByLabel('Nome completo')).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
