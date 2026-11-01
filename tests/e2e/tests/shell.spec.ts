import { expect, test } from '../fixtures.js';

test.describe('Shell', () => {
  test('opens the profile and the settings from the navigation', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/dashboard`);

    await page.getByTestId('shell-profile').click();
    await expect(page.getByTestId('profile-title')).toBeVisible();

    await page.getByTestId('shell-nav-settings').click();
    await expect(page.getByTestId('settings-empty')).toBeVisible();
  });

  test('leads to the login after signing out', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/dashboard`);

    await page.getByTestId('shell-sign-out').click();

    await expect(page.getByTestId('login-username')).toBeVisible();
  });
});
