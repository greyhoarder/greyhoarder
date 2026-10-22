import { expect, test } from '../fixtures.js';

test.describe('Hoard', () => {
  test('lists the hoard from the navigation and narrows it down while searching', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/dashboard`);

    await page.getByTestId('shell-nav-hoard').click();
    await expect(page.getByTestId('hoard-row')).not.toHaveCount(0);
    await page.getByTestId('hoard-search').fill('klaw');

    await expect(page.getByTestId('hoard-row')).toHaveCount(1);
  });
});
