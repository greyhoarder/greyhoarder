import { expect, test } from '../fixtures.js';

test.describe('Dashboard', () => {
  test('shows the factions of the hoard with their game system', async ({ page, signedIn }) => {
    const response = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: { kitId: 'games-workshop/orks/boyz-2026', boxes: 1, tags: [], addedOn: '2026-10-25' },
      headers: { Origin: signedIn.url },
    });
    expect(response.ok()).toBe(true);

    await page.goto(`${signedIn.url}/dashboard`);

    const faction = page.getByTestId('dashboard-hoard-faction');
    await expect(faction).toHaveCount(1);
    await expect(faction.getByTestId('dashboard-hoard-faction-name')).toHaveText('Orks');
    await expect(faction.getByTestId('dashboard-hoard-faction-system')).toHaveText('Warhammer 40,000');
  });
});
