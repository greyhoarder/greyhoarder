import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures.js';

/** Adds a box of Boyz through the API and opens it from the Boxes tab. */
async function openBoyz(page: Page, url: string): Promise<void> {
  const response = await page.request.post(`${url}/api/hoard/boxes`, {
    data: { kitId: 'games-workshop/orks/boyz-2026', boxes: 1, tags: [], addedOn: '2026-10-25' },
    headers: { Origin: url },
  });
  expect(response.ok()).toBe(true);
  await page.goto(`${url}/hoard/boxes`);
  await page.getByTestId('hoard-box').click();
}

test.describe('Box', () => {
  test('opens a box from the Boxes tab with its minis and its kit', async ({ page, signedIn }) => {
    await openBoyz(page, signedIn.url);

    await expect(page.getByTestId('box-name')).toHaveText('Boyz (2026)');
    await expect(page.getByTestId('box-mini')).not.toHaveCount(0);
    await expect(page.getByTestId('box-kit')).toBeVisible();
  });

  test('goes back to the Boxes tab with the back link', async ({ page, signedIn }) => {
    await openBoyz(page, signedIn.url);

    await page.getByTestId('box-back').click();

    await expect(page).toHaveURL(`${signedIn.url}/hoard/boxes`);
  });

  test('leads to the minis of the box in the hoard', async ({ page, signedIn }) => {
    await openBoyz(page, signedIn.url);

    await page.getByTestId('box-show-in-hoard').click();

    await expect(page).toHaveURL(`${signedIn.url}/hoard/minis`);
    await expect(page.getByTestId('hoard-row')).not.toHaveCount(0);
  });
});
