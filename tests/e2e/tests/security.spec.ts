import { expect, test } from '../fixtures.js';

test.describe('Security', () => {
  test('rejects a change sent from another origin', async ({ page, signedIn }) => {
    const box = {
      kitId: 'games-workshop/warhammer-40000/orks/boyz-2026',
      boxes: 1,
      tags: [],
      addedOn: '2026-10-25',
    };

    const response = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: box,
      headers: { Origin: 'http://evil.example' },
    });

    expect(response.status()).toBe(403);
    const listed = await page.request.get(`${signedIn.url}/api/hoard/boxes`, { headers: { Origin: signedIn.url } });
    const { boxes } = (await listed.json()) as { boxes: unknown[] };
    expect(boxes).toHaveLength(0);
  });
});
