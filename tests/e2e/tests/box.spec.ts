import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures.js';

/** Adds a box of Boyz through the API and opens it from the Boxes tab. */
async function openBoyz(page: Page, url: string): Promise<void> {
  const response = await page.request.post(`${url}/api/hoard/boxes`, {
    data: {
      kitId: 'games-workshop/warhammer-40000/orks/boyz-2026',
      boxes: 1,
      tags: [],
      addedOn: '2026-10-25',
    },
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

  test('asks to delete a box once its last minis are deleted', async ({ page, signedIn }) => {
    await deleteEveryMiniOfBoyz(page, signedIn.url);

    await page.getByTestId('box-empty-boxes-delete').click();

    await expect(page).toHaveURL(/\/hoard\/boxes$/);
    await expect(page.getByTestId('hoard-box-empty')).toBeVisible();
  });

  test('keeps an empty box when asked', async ({ page, signedIn }) => {
    await deleteEveryMiniOfBoyz(page, signedIn.url);

    await page.getByTestId('box-empty-boxes-keep').click();

    await expect(page.getByTestId('box-no-minis')).toBeVisible();
    await expect(page.getByTestId('box-name')).toBeVisible();
  });

  test('deletes a box with its minis from its menu', async ({ page, signedIn }) => {
    await openBoyz(page, signedIn.url);

    await page.getByTestId('box-menu').click();
    await page.getByTestId('box-delete').click();
    await page.getByTestId('box-delete-box-confirm').click();

    await expect(page).toHaveURL(/\/hoard\/boxes$/);
    await expect(page.getByTestId('hoard-box-empty')).toBeVisible();
  });

  test('numbers boxes with the same name', async ({ page, signedIn }) => {
    const response = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: {
        kitId: 'games-workshop/warhammer-40000/orks/boyz-2026',
        boxes: 2,
        tags: [],
        addedOn: '2026-10-25',
      },
      headers: { Origin: signedIn.url },
    });
    expect(response.ok()).toBe(true);

    await page.goto(`${signedIn.url}/hoard/boxes`);

    await expect(page.getByTestId('hoard-box-number')).toHaveCount(2);
    expect((await page.getByTestId('hoard-box-number').allTextContents()).sort()).toEqual(['#1', '#2']);
  });
});

/** Builds every mini of a box of Boyz through the API, opens it and deletes them all after asking. */
async function deleteEveryMiniOfBoyz(page: Page, url: string): Promise<void> {
  const response = await page.request.post(`${url}/api/hoard/boxes`, {
    data: {
      kitId: 'games-workshop/warhammer-40000/orks/boyz-2026',
      boxes: 1,
      tags: [],
      addedOn: '2026-10-25',
    },
    headers: { Origin: url },
  });
  expect(response.ok()).toBe(true);
  await buildThroughApi(page, url, () => true);
  await page.goto(`${url}/hoard/boxes`);
  await page.getByTestId('hoard-box').click();
  await expect(page.getByTestId('box-name')).toBeVisible();
  for (const toggle of await page.getByTestId('box-group-toggle').all()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  for (const check of await page.getByTestId('box-group-mini-check').all()) {
    await check.click();
    await expect(check).toBeChecked();
  }
  await page.getByTestId('box-selection-delete').click();
  await page.getByTestId('box-delete-confirm').click();
  await expect(page.getByTestId('box-empty-boxes-dialog')).toBeVisible();
}
