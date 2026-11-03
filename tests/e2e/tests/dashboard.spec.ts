import { expect, test } from '../fixtures.js';

test.describe('Dashboard', () => {
  test('shows the factions of the hoard with their game system', async ({ page, signedIn }) => {
    const response = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: { kitId: 'games-workshop/warhammer-40000/orks/boyz-2026', boxes: 1, tags: [], addedOn: '2026-10-25' },
      headers: { Origin: signedIn.url },
    });
    expect(response.ok()).toBe(true);

    await page.goto(`${signedIn.url}/dashboard`);

    const faction = page.getByTestId('dashboard-hoard-faction');
    await expect(faction).toHaveCount(1);
    await expect(faction.getByTestId('dashboard-hoard-faction-name')).toHaveText('Orks');
    await expect(faction.getByTestId('dashboard-hoard-faction-system')).toHaveText('Warhammer 40,000');
  });

  test('shows a mini painted today in the activity', async ({ page, signedIn }) => {
    const headers = { Origin: signedIn.url };
    const added = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: { kitId: 'games-workshop/warhammer-40000/orks/boyz-2026', boxes: 1, tags: [], addedOn: '2026-10-25' },
      headers,
    });
    expect(added.ok()).toBe(true);
    const listed = await page.request.get(`${signedIn.url}/api/hoard/minis`, { headers });
    const { minis } = (await listed.json()) as { minis: { id: string }[] };
    const painted = await page.request.patch(`${signedIn.url}/api/hoard/minis`, {
      data: { ids: [minis[0]?.id], set: { status: 'painted' } },
      headers,
    });
    expect(painted.ok()).toBe(true);

    await page.goto(`${signedIn.url}/dashboard`);

    await page.getByTestId('dashboard-activity-more').click();

    await expect(page.getByTestId('dashboard-activity-total')).toHaveText(
      `1 mini moved a step in ${new Date().getFullYear()}`,
    );
    await expect(page.getByTestId('dashboard-activity-entry').first()).toContainText('Painted 1 mini in 1 faction');
  });
});
