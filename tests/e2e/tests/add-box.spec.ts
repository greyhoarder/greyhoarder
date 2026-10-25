import { expect, test } from '../fixtures.js';

test.describe('Add box', () => {
  test('opens from the hoard and says to search for a kit', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard`);

    await page.getByTestId('hoard-add-boxes').click();

    await expect(page.getByTestId('add-box-hint')).toBeVisible();
  });

  test('finds a kit by its product code', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard/add/box`);

    await page.getByTestId('add-box-search').fill('50-80');

    await expect(page.getByTestId('add-box-kit')).toHaveCount(1);
  });

  test('finds an either-or kit by the name of another variant', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard/add/box`);

    await page.getByTestId('add-box-search').fill('Burna Boyz');

    await expect(page.getByTestId('add-box-kit-name')).toContainText(['Lootas']);
  });

  test('goes back to the boxes of the hoard with the back button', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard/add/box`);

    await page.getByTestId('add-box-back').click();

    await expect(page).toHaveURL(`${signedIn.url}/hoard/boxes`);
  });

  test('adds a box of a kit and shows it among the boxes of the hoard', async ({
    page,
    signedIn,
  }) => {
    await page.goto(`${signedIn.url}/hoard/boxes`);
    await expect(page.getByTestId('hoard-box')).toHaveCount(0);
    await page.getByTestId('hoard-add-boxes').click();
    await page.getByTestId('add-box-search').fill('50-80');
    await page.getByTestId('add-box-kit').click();

    await page.getByTestId('add-box-submit').click();
    await page.getByTestId('add-box-added-show').click();

    await expect(page.getByTestId('hoard-box')).toHaveCount(1);
  });
});
