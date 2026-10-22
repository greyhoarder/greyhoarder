import { expect, test } from '../fixtures.js';

test.describe('Setup', () => {
  test('leads every address to the setup while no account exists', async ({ page, freshInstance }) => {
    await page.goto(`${freshInstance.url}/login`);

    await expect(page.getByTestId('setup-username')).toBeVisible();
  });

  test('leads to the dashboard after creating the administrator', async ({ page, freshInstance }) => {
    await page.goto(`${freshInstance.url}/setup`);

    await page.getByTestId('setup-username').fill('mira');
    await page.getByTestId('setup-password').fill('a long and quiet sprue');
    await page.getByTestId('setup-password-confirmation').fill('a long and quiet sprue');
    await page.getByTestId('setup-submit').click();

    await expect(page.getByTestId('dashboard-greeting')).toContainText('mira');
  });
});
