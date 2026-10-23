import { expect, test } from '../fixtures.js';

test.describe('Add box', () => {
  test('opens from the hoard and offers the recently used kits', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard`);

    await page.getByTestId('hoard-add-boxes').click();

    await expect(page.getByTestId('add-box-step')).toHaveCount(3);
    await expect(page.getByTestId('add-box-kit')).not.toHaveCount(0);
  });

  test('finds a kit by its product code', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard/add/box`);

    await page.getByTestId('add-box-search').fill('50-80');

    await expect(page.getByTestId('add-box-kit')).toHaveCount(1);
  });

  test('leads back to the boxes of the hoard', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard/add/box`);

    await page.getByTestId('add-box-back').click();

    await expect(page.getByTestId('hoard-box')).not.toHaveCount(0);
  });
});
