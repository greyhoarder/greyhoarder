import { expect, test } from '../fixtures.js';

test.describe('Edit minis', () => {
  test('edits several selected minis of the hoard at once', async ({ page, signedIn }) => {
    const added = await page.request.post(`${signedIn.url}/api/hoard/boxes`, {
      data: { kitId: 'games-workshop/warhammer-40000/orks/boyz-2026', boxes: 1, tags: [], addedOn: '2026-10-25' },
      headers: { Origin: signedIn.url },
    });
    expect(added.ok()).toBe(true);
    const { minis } = (await added.json()) as { minis: { id: string }[] };
    const built = await page.request.patch(`${signedIn.url}/api/hoard/minis`, {
      data: { ids: minis.map((mini) => mini.id), set: { status: 'built' } },
      headers: { Origin: signedIn.url },
    });
    expect(built.ok()).toBe(true);
    await page.goto(`${signedIn.url}/hoard/minis`);
    await page.getByTestId('hoard-view-table').click();
    const rows = page.getByTestId('hoard-row');
    await rows.nth(0).getByTestId('hoard-row-check').click();
    await rows.nth(1).getByTestId('hoard-row-check').click();
    await page.getByTestId('hoard-selection-edit').click();
    // The statuses: Built, Primed, Painted, Done.
    await page.getByTestId('edit-minis-status').nth(2).click();

    await page.getByTestId('edit-minis-apply').click();

    await expect(page).toHaveURL(/\/hoard\/minis$/);
    await expect(page.getByTestId('hoard-changed')).toContainText('Changed 2 minis.');
    await expect(page.getByTestId('hoard-status')).toContainText(['Painted', 'Painted']);
  });
});
