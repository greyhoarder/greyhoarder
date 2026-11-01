import type { Browser, Page } from '@playwright/test';
import { expect, test } from '../fixtures.js';

const PASSWORD = 'a long and quiet sprue';
/** The smallest PNG there is: one transparent pixel. */
const PICTURE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/** Signs in through the login page in a browser of its own, as another device. */
async function signInElsewhere(browser: Browser, url: string, username: string, password: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${url}/login`);
  await page.getByTestId('login-username').fill(username);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  return page;
}

async function addMember(page: Page, url: string): Promise<void> {
  const response = await page.request.post(`${url}/api/auth/accounts`, {
    data: { username: 'ben', role: 'member', password: PASSWORD },
    headers: { Origin: url },
  });
  expect(response.ok()).toBe(true);
}

test.describe('Account', () => {
  test('adds a member who can sign in', async ({ page, browser, signedIn }) => {
    await page.goto(`${signedIn.url}/settings/users`);

    await page.getByTestId('users-add').click();
    await page.getByTestId('add-user-username').fill('ben');
    await page.getByTestId('add-user-password').fill(PASSWORD);
    await page.getByTestId('add-user-submit').click();

    await expect(page.getByTestId('users-row')).toHaveCount(2);
    const ben = await signInElsewhere(browser, signedIn.url, 'ben', PASSWORD);
    await expect(ben.getByTestId('dashboard-greeting')).toContainText('ben');
  });

  test('changes the password and signs in with it', async ({ page, browser, signedIn }) => {
    await page.goto(`${signedIn.url}/profile`);

    await page.getByTestId('profile-change-password').click();
    await page.getByTestId('change-password-current').fill(PASSWORD);
    await page.getByTestId('change-password-new').fill('another long sprue');
    await page.getByTestId('change-password-repeat').fill('another long sprue');
    await page.getByTestId('change-password-submit').click();

    await expect(page.getByTestId('profile-message')).toHaveText('Your password was changed.');
    const elsewhere = await signInElsewhere(browser, signedIn.url, signedIn.username, 'another long sprue');
    await expect(elsewhere.getByTestId('dashboard-greeting')).toBeVisible();
  });

  test('signs another device out', async ({ page, browser, signedIn }) => {
    const elsewhere = await signInElsewhere(browser, signedIn.url, signedIn.username, PASSWORD);
    await expect(elsewhere.getByTestId('dashboard-greeting')).toBeVisible();
    await page.goto(`${signedIn.url}/profile`);

    await page.getByTestId('profile-sign-out-others').click();

    await expect(page.getByTestId('profile-message')).toHaveText('Other devices are signed out.');
    await elsewhere.reload();
    await expect(elsewhere.getByTestId('login-username')).toBeVisible();
  });

  test('offers a member no users', async ({ page, browser, signedIn }) => {
    await addMember(page, signedIn.url);
    const ben = await signInElsewhere(browser, signedIn.url, 'ben', PASSWORD);
    await expect(ben.getByTestId('dashboard-greeting')).toBeVisible();

    await ben.goto(`${signedIn.url}/settings/users`);

    await expect(ben.getByTestId('settings-empty')).toBeVisible();
    await expect(ben.getByTestId('settings-tab-users')).toHaveCount(0);
    const list = await ben.request.get(`${signedIn.url}/api/auth/accounts`);
    expect(list.status()).toBe(403);
  });

  test('sets a display name and a picture', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/profile`);

    await page.getByTestId('profile-display-name').fill('Mira K.');
    await page.getByTestId('profile-display-name').blur();
    await expect(page.getByTestId('shell-username')).toHaveText('Mira K.');
    await page.getByTestId('profile-avatar-file').setInputFiles({
      name: 'mira.png',
      mimeType: 'image/png',
      buffer: PICTURE,
    });

    const picture = page.getByTestId('shell-profile').locator('img');
    await expect(picture).toBeVisible();
    await expect.poll(() => picture.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(256);
  });

  test('keeps the dark theme after reloading', async ({ page, signedIn }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(`${signedIn.url}/profile`);

    await page.getByTestId('profile-theme').nth(2).click();
    await page.reload();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

test.describe('Managing accounts', () => {
  const openBen = async (page: Page, url: string): Promise<void> => {
    await page.goto(`${url}/settings/users`);
    await page.getByTestId('users-row').filter({ hasText: 'ben' }).getByTestId('users-toggle').click();
  };

  test('signs a disabled user out and refuses their sign-in', async ({ page, browser, signedIn }) => {
    await addMember(page, signedIn.url);
    const ben = await signInElsewhere(browser, signedIn.url, 'ben', PASSWORD);
    await expect(ben.getByTestId('dashboard-greeting')).toBeVisible();

    await openBen(page, signedIn.url);
    await page.getByTestId('users-toggle-access').click();
    await expect(page.getByTestId('users-disabled')).toBeVisible();

    await ben.reload();
    await expect(ben.getByTestId('login-username')).toBeVisible();
    const again = await signInElsewhere(browser, signedIn.url, 'ben', PASSWORD);
    await expect(again.getByTestId('login-failure')).toBeVisible();
  });

  test('replaces a password with a new one', async ({ page, browser, signedIn }) => {
    await addMember(page, signedIn.url);

    await openBen(page, signedIn.url);
    await page.getByTestId('users-reset-password').click();
    await page.getByTestId('users-new-password').fill('another long sprue');
    await page.getByTestId('users-set-password').click();
    await expect(page.getByTestId('users-message')).toBeVisible();

    const ben = await signInElsewhere(browser, signedIn.url, 'ben', 'another long sprue');
    await expect(ben.getByTestId('dashboard-greeting')).toBeVisible();
  });

  test("deletes a user's hoard and keeps the hoard of others", async ({ page, browser, signedIn }) => {
    await addMember(page, signedIn.url);
    const ben = await signInElsewhere(browser, signedIn.url, 'ben', PASSWORD);
    await expect(ben.getByTestId('dashboard-greeting')).toBeVisible();
    for (const owner of [ben, page]) {
      const added = await owner.request.post(`${signedIn.url}/api/hoard/boxes`, {
        data: { kitId: 'games-workshop/warhammer-40000/orks/boyz-2026', boxes: 1, tags: [], addedOn: '2026-10-25' },
        headers: { Origin: signedIn.url },
      });
      expect(added.ok()).toBe(true);
    }

    await openBen(page, signedIn.url);
    await page.getByTestId('users-delete').click();
    await page.getByTestId('users-delete-confirm').click();

    await expect(page.getByTestId('users-row')).toHaveCount(1);
    await page.goto(`${signedIn.url}/hoard/boxes`);
    await expect(page.getByTestId('hoard-box')).toHaveCount(1);
    await ben.reload();
    await expect(ben.getByTestId('login-username')).toBeVisible();
  });
});
