import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures.js';

/** Builds minis of the hoard on the sprue whose name `matches`, at most `count`, through the API; renames them when asked. */
async function buildThroughApi(
  page: Page,
  url: string,
  matches: (name: string) => boolean,
  { name, count }: { name?: string; count?: number } = {},
): Promise<void> {
  const listed = await page.request.get(`${url}/api/hoard/minis`, { headers: { Origin: url } });
  expect(listed.ok()).toBe(true);
  const { minis } = (await listed.json()) as {
    minis: { id: string; name: string; status: string }[];
  };
  const ids = minis
    .filter((mini) => mini.status === 'sprue' && matches(mini.name))
    .slice(0, count)
    .map((mini) => mini.id);
  const built = await page.request.patch(`${url}/api/hoard/minis`, {
    data: { ids, set: { status: 'built', ...(name === undefined ? {} : { name }) } },
    headers: { Origin: url },
  });
  expect(built.ok()).toBe(true);
}

/** Adds a box of Boyz and one of Lootas through the API, all Boyz and one Loota built. */
async function addBuiltMinis(page: Page, url: string): Promise<void> {
  for (const kitId of ['games-workshop/warhammer-40000/orks/boyz-2026', 'games-workshop/warhammer-40000/orks/lootas-2008']) {
    const response = await page.request.post(`${url}/api/hoard/boxes`, {
      data: { kitId, boxes: 1, tags: [], addedOn: '2026-10-25' },
      headers: { Origin: url },
    });
    expect(response.ok()).toBe(true);
  }
  await buildThroughApi(page, url, (name) => !name.includes('Loota') && name !== 'Spanner');
  await buildThroughApi(page, url, (name) => name.includes('Loota'), { name: 'Loota', count: 1 });
}

test.describe('Hoard', () => {
  test('lists the built minis of the hoard in groups when opened from the navigation', async ({
    page,
    signedIn,
  }) => {
    await addBuiltMinis(page, signedIn.url);
    await page.goto(`${signedIn.url}/dashboard`);

    await page.getByTestId('shell-nav-hoard').click();

    await expect(page.getByTestId('hoard-group')).not.toHaveCount(0);
  });

  test('narrows the hoard down to the groups of matching minis while searching', async ({
    page,
    signedIn,
  }) => {
    await addBuiltMinis(page, signedIn.url);
    await page.goto(`${signedIn.url}/hoard/minis`);
    await expect(page.getByTestId('hoard-group')).not.toHaveCount(0);

    await page.getByTestId('hoard-search').fill('loota');

    await expect(page.getByTestId('hoard-group')).toHaveCount(1);
  });
});
