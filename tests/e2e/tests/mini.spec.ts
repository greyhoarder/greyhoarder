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

/** Adds a box of Lootas through the API, builds one of them as a Loota and opens it from its group in the hoard. */
async function openLootas(page: Page, url: string): Promise<void> {
  const response = await page.request.post(`${url}/api/hoard/boxes`, {
    data: { kitId: 'games-workshop/orks/lootas-2008', boxes: 1, tags: [], addedOn: '2026-10-25' },
    headers: { Origin: url },
  });
  expect(response.ok()).toBe(true);
  await buildThroughApi(page, url, (name) => name.includes('Loota'), { name: 'Loota', count: 1 });
  await page.goto(`${url}/hoard/minis`);
  await page.getByTestId('hoard-group-toggle').click();
  await page.getByTestId('hoard-row').click();
}

test.describe('Mini', () => {
  test('opens a built mini from a group of the hoard', async ({ page, signedIn }) => {
    await openLootas(page, signedIn.url);

    await expect(page.getByTestId('mini-status-badge')).toHaveText('Built');
  });

  test('goes back to the hoard with the back link', async ({ page, signedIn }) => {
    await openLootas(page, signedIn.url);

    await page.getByTestId('mini-back').click();

    await expect(page).toHaveURL(`${signedIn.url}/hoard/minis`);
  });

  test("keeps a part of the user's own on a built mini", async ({ page, signedIn }) => {
    await openLootas(page, signedIn.url);

    await page.getByTestId('mini-add-part').click();
    await expect(page.getByTestId('mini-add-part')).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('mini-part-filter').fill('Grot Banner');
    await page.getByTestId('mini-part-create').click();
    await expect(page.getByTestId('mini-part').filter({ hasText: 'Grot Banner' })).toHaveCount(1);
    await page.reload();

    await expect(page.getByTestId('mini-part').filter({ hasText: 'Grot Banner' })).toHaveCount(1);
  });

  test('goes back to the box with the back link when opened from the box', async ({
    page,
    signedIn,
  }) => {
    const response = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: { kitId: 'games-workshop/orks/lootas-2008', boxes: 1, tags: [], addedOn: '2026-10-25' },
      headers: { Origin: signedIn.url },
    });
    expect(response.ok()).toBe(true);
    await buildThroughApi(page, signedIn.url, (name) => name.includes('Loota'), {
      name: 'Loota',
      count: 1,
    });
    await page.goto(`${signedIn.url}/hoard/boxes`);
    await page.getByTestId('hoard-box').click();
    await expect(page.getByTestId('box-name')).toBeVisible();
    const boxUrl = page.url();
    await page.getByTestId('box-group-toggle').click();
    await page.getByTestId('box-group-mini-open').click();

    await page.getByTestId('mini-back').click();

    await expect(page).toHaveURL(boxUrl);
    await expect(page.getByTestId('box-name')).toBeVisible();
  });
});
