import { expect, test } from '../fixtures.js';

test.describe('Navigation error', () => {
  test('offers to try again while the server can\'t be reached and opens the page once it answers', async ({
    page,
    signedIn,
  }) => {
    await page.route('**/api/auth/session', (route) => route.fulfill({ status: 502 }));
    await page.goto(`${signedIn.url}/hoard`);
    await expect(page.getByTestId('navigation-error-message')).toBeVisible();

    await page.unroute('**/api/auth/session');
    await page.getByTestId('navigation-error-retry').click();

    await expect(page.getByTestId('hoard-add-boxes')).toBeVisible();
  });
});
