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
    data: { kitId: 'games-workshop/warhammer-40000/orks/lootas-2008', boxes: 1, tags: [], addedOn: '2026-10-25' },
    headers: { Origin: url },
  });
  expect(response.ok()).toBe(true);
  await buildThroughApi(page, url, (name) => name.includes('Loota'), { name: 'Loota', count: 1 });
  await page.goto(`${url}/hoard/minis`);
  await page.getByTestId('hoard-group-toggle').click();
  await page.getByTestId('hoard-row').click();
}

/** Adds a built Ork mini of that name without a box through the API. */
async function addBuiltOrk(page: Page, url: string, name: string): Promise<string | undefined> {
  const added = await page.request.post(`${url}/api/hoard/minis`, {
    data: { name, factions: [{ id: 'warhammer-40000/orks' }], status: 'built', parts: [], count: 1 },
    headers: { Origin: url },
  });
  expect(added.ok()).toBe(true);
  return ((await added.json()) as { minis: { id: string }[] }).minis[0]?.id;
}

/** On an open mini, creates a faction of the user's own with that name from "+ Faction". */
async function createOwnFaction(page: Page, name: string): Promise<void> {
  await page.getByTestId('mini-add-faction').click();
  await page.getByTestId('mini-faction-search').fill(name);
  await page.getByTestId('mini-faction-create').click();
  await expect(page.getByTestId('mini-faction').filter({ hasText: name })).toHaveCount(1);
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

  test('goes back to the box with the back link when opened from the box', async ({ page, signedIn }) => {
    const response = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: { kitId: 'games-workshop/warhammer-40000/orks/lootas-2008', boxes: 1, tags: [], addedOn: '2026-10-25' },
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

  test('builds a mini added on the sprue without a box', async ({ page, signedIn }) => {
    await page.goto(`${signedIn.url}/hoard/add/minis`);
    await page.getByTestId('add-minis-search').fill('Nob');
    await page
      .getByTestId('add-minis-mini')
      .filter({ has: page.getByTestId('add-minis-mini-name').getByText('Nob', { exact: true }) })
      .first()
      .click();
    await page.getByTestId('add-minis-status').filter({ hasText: 'On the sprue' }).click();
    await page.getByTestId('add-minis-submit').click();
    await page.getByTestId('add-minis-added-show').click();
    await page.getByTestId('hoard-group-toggle').click();
    await page.getByTestId('hoard-row').click();

    await page.getByTestId('mini-build').click();

    await expect(page.getByTestId('mini-status-badge')).toHaveText('Built');
    await expect(page.getByTestId('mini-build-as').filter({ hasText: 'Nob' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('mini-box')).toContainText('From the kit');
  });

  test('gives a built mini another faction', async ({ page, signedIn }) => {
    await openLootas(page, signedIn.url);

    await page.getByTestId('mini-add-faction').click();
    await page.getByTestId('mini-faction-search').fill('space');
    await page.getByTestId('mini-faction-result').filter({ hasText: 'Space Marines' }).first().click();
    await expect(page.getByTestId('mini-faction')).toHaveCount(2);
    await page.reload();

    await expect(page.getByTestId('mini-faction')).toHaveText(['Orks', 'Space Marines']);
  });

  test('offers only the user\'s own parts under "Your parts"', async ({ page, signedIn }) => {
    const add = (name: string, parts: readonly string[]) =>
      page.request.post(`${signedIn.url}/api/hoard/minis`, {
        data: {
          name,
          factions: [{ id: 'warhammer-40000/orks' }],
          status: 'built',
          parts: parts.map((part) => ({ name: part, isSwappable: false })),
          count: 1,
        },
        headers: { Origin: signedIn.url },
      });
    expect((await add('Loota', ['Deffgun', 'Grot Banner'])).ok()).toBe(true);
    const nob = await add('Nob', []);
    const [{ id }] = ((await nob.json()) as { minis: { id: string }[] }).minis;
    await page.goto(`${signedIn.url}/hoard/minis/${id}`);

    await page.getByTestId('mini-add-part').click();

    await expect(
      page.locator('[data-testid="mini-part-group"][data-group="vocabulary"] [data-testid="mini-part-option"]'),
    ).toHaveText(['+ Grot Banner']);
  });

  test("removes a part of the user's own from the vocabulary once no mini carries it", async ({ page, signedIn }) => {
    const add = async (name: string, parts: readonly string[]) => {
      const added = await page.request.post(`${signedIn.url}/api/hoard/minis`, {
        data: {
          name,
          factions: [{ id: 'warhammer-40000/orks' }],
          status: 'built',
          parts: parts.map((part) => ({ name: part, isSwappable: false })),
          count: 1,
        },
        headers: { Origin: signedIn.url },
      });
      expect(added.ok()).toBe(true);
      return ((await added.json()) as { minis: { id: string }[] }).minis[0]?.id;
    };
    const loota = await add('Loota', ['Grot Banner']);
    const nob = await add('Nob', []);
    await page.goto(`${signedIn.url}/hoard/minis/${loota}`);
    await page.getByTestId('mini-part-remove').click();
    await expect(page.getByTestId('mini-part')).toHaveCount(0);
    await page.goto(`${signedIn.url}/hoard/minis/${nob}`);

    await page.getByTestId('mini-add-part').click();

    await expect(page.locator('[data-testid="mini-part-group"][data-group="vocabulary"]')).toHaveCount(0);
  });

  test("gives a built mini a new faction of the user's own", async ({ page, signedIn }) => {
    const nob = await addBuiltOrk(page, signedIn.url, 'Nob');
    await page.goto(`${signedIn.url}/hoard/minis/${nob}`);
    await createOwnFaction(page, 'Crimson Wolves');

    await page.reload();

    await expect(page.getByTestId('mini-faction')).toHaveText(['Orks', 'Crimson Wolves · own']);
  });

  test("offers a faction of the user's own on another mini", async ({ page, signedIn }) => {
    const nob = await addBuiltOrk(page, signedIn.url, 'Nob');
    const boy = await addBuiltOrk(page, signedIn.url, 'Boy');
    await page.goto(`${signedIn.url}/hoard/minis/${nob}`);
    await createOwnFaction(page, 'Crimson Wolves');
    await page.goto(`${signedIn.url}/hoard/minis/${boy}`);

    await page.getByTestId('mini-add-faction').click();
    await page.getByTestId('mini-faction-search').fill('crim');

    await expect(page.getByTestId('mini-faction-result').first()).toHaveText('Crimson Wolves · Your own');
  });
});
