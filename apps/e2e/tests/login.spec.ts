import { expect, test } from '../fixtures.js';

test.describe('Login', () => {
  test('leads to the dashboard with a greeting after signing in', async ({ page, request, freshInstance }) => {
    const administrator = { username: 'lucas', password: 'a long and quiet sprue' };
    const setup = await request.post(`${freshInstance.url}/api/auth/setup`, {
      data: administrator,
      headers: { Origin: freshInstance.url },
    });
    expect(setup.ok()).toBe(true);

    await page.goto(`${freshInstance.url}/login`);
    await page.getByTestId('login-username').fill(administrator.username);
    await page.getByTestId('login-password').fill(administrator.password);
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('dashboard-greeting')).toContainText(administrator.username);
  });
});
