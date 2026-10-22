import { expect, test } from '../fixtures.js';

test.describe('Shell', () => {
  test('leads to the login after signing out', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/dashboard`);

    await page.getByTestId('shell-sign-out').click();

    await expect(page.getByTestId('login-username')).toBeVisible();
  });
});
