import { expect, test } from '../fixtures.js';

test.describe('Hoard', () => {
  test('lists the hoard from the navigation and narrows it down while searching', async ({ page, signedIn }) => {
    for (const kitId of ['games-workshop/orks/boyz-2026', 'games-workshop/orks/lootas-2008']) {
      const response = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
        data: { kitId, boxes: 1, tags: [], addedOn: '2026-10-25' },
        headers: { Origin: signedIn.url },
      });
      expect(response.ok()).toBe(true);
    }
    await page.goto(`${signedIn.url}/dashboard`);

    await page.getByTestId('shell-nav-hoard').click();
    await expect(page.getByTestId('hoard-row')).not.toHaveCount(0);
    await page.getByTestId('hoard-search').fill('loota');

    await expect(page.getByTestId('hoard-row')).toHaveCount(2);
  });
});
