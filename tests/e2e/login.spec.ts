import {test, expect} from '@playwright/test';

test('login permanece utilizável e sem rolagem horizontal', async ({page}) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', {name: /Helpdesk TI/i})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Entrar'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Criar novo acesso'})).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
