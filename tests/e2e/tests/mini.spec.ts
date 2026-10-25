import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures.js';

/** Adds a box of Lootas through the API and opens its row of minis from the hoard. */
async function openLootas(page: Page, url: string): Promise<void> {
  const response = await page.request.post(`${url}/api/hoard/boxes`, {
    data: { kitId: 'games-workshop/orks/lootas-2008', boxes: 1, tags: [], addedOn: '2026-10-25' },
    headers: { Origin: url },
  });
  expect(response.ok()).toBe(true);
  await page.goto(`${url}/hoard/minis`);
  await page.getByTestId('hoard-row').first().click();
}

/** Builds the mini of the address as a Loota. */
async function buildLoota(page: Page): Promise<void> {
  await page.getByTestId('mini-build-as').filter({ hasText: 'Loota' }).click();
  await page.getByTestId('mini-build').click();
  await expect(page.getByTestId('mini-build-bar')).toHaveCount(0);
}

test.describe('Mini', () => {
  test('opens a mini from the hoard and builds it', async ({ page, signedIn }) => {
    await openLootas(page, signedIn.url);

    await buildLoota(page);

    await expect(page.getByTestId('mini-status-badge')).toHaveText('Built');
    await expect(page.getByTestId('mini-build-bar')).toHaveCount(0);
  });

  test('goes back to the hoard with the back link', async ({ page, signedIn }) => {
    await openLootas(page, signedIn.url);

    await page.getByTestId('mini-back').click();

    await expect(page).toHaveURL(`${signedIn.url}/hoard/minis`);
  });

  test("keeps a part of the user's own on a built mini", async ({ page, signedIn }) => {
    await openLootas(page, signedIn.url);
    await buildLoota(page);

    await page.getByTestId('mini-add-part').click();
    await expect(page.getByTestId('mini-add-part')).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('mini-part-filter').fill('Grot Banner');
    await page.getByTestId('mini-part-create').click();
    await expect(page.getByTestId('mini-part').filter({ hasText: 'Grot Banner' })).toHaveCount(1);
    await page.reload();

    await expect(page.getByTestId('mini-part').filter({ hasText: 'Grot Banner' })).toHaveCount(1);
  });
});
