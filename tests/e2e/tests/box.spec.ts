import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures.js';

/** Adds a box of Boyz through the API and opens it from the Boxes tab. */
async function openBoyz(page: Page, url: string): Promise<void> {
  const response = await page.request.post(`${url}/api/hoard/boxes`, {
    data: { kitId: 'games-workshop/warhammer-40000/orks/boyz-2026', boxes: 1, tags: [], addedOn: '2026-10-25' },
    headers: { Origin: url },
  });
  expect(response.ok()).toBe(true);
  await page.goto(`${url}/hoard/boxes`);
  await page.getByTestId('hoard-box').click();
}

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

test.describe('Box', () => {
  test('opens a box from the Boxes tab with its minis and its kit', async ({ page, signedIn }) => {
    await openBoyz(page, signedIn.url);

    await expect(page.getByTestId('box-name')).toHaveText('Boyz (2026)');
    await expect(page.getByTestId('box-sprue')).not.toHaveCount(0);
    await expect(page.getByTestId('box-kit')).toBeVisible();
  });

  test('goes back to the Boxes tab with the back link', async ({ page, signedIn }) => {
    await openBoyz(page, signedIn.url);

    await page.getByTestId('box-back').click();

    await expect(page).toHaveURL(`${signedIn.url}/hoard/boxes`);
  });

  test('leads from a box to its built minis in the hoard', async ({ page, signedIn }) => {
    await openBoyz(page, signedIn.url);
    await buildThroughApi(page, signedIn.url, (name) => name === 'Boy');
    await page.reload();

    await page.getByTestId('box-show-in-hoard').click();

    await expect(page).toHaveURL(`${signedIn.url}/hoard/minis`);
    await expect(page.getByTestId('hoard-group')).not.toHaveCount(0);
  });

  test('builds minis from the sprue on their box and finds them in a group of the hoard', async ({
    page,
    signedIn,
  }) => {
    await openBoyz(page, signedIn.url);
    // Sorted by name: Ammo Runt, Boy, Nob; the Boyz are the row of more than one.
    await page.getByTestId('box-sprue-toggle').nth(1).click();
    await page.getByTestId('mini-build-as').first().click();
    await page.getByTestId('mini-build-more').click();

    await page.getByTestId('mini-build').click();
    await expect(page.getByTestId('box-group')).toHaveCount(1);
    await page.goto(`${signedIn.url}/hoard/minis`);

    await expect(page.getByTestId('hoard-group')).toHaveCount(1);
    await expect(page.getByTestId('hoard-group')).toContainText('×2');
  });
});
