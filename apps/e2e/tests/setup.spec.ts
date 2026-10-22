import { expect, test } from '../fixtures.js';

test.describe('Setup', () => {
  test('leads every address to the setup while no account exists', async ({ page, freshInstance }) => {
    await page.goto(`${freshInstance.url}/login`);

    await expect(page.getByTestId('setup-username')).toBeVisible();
  });
});
