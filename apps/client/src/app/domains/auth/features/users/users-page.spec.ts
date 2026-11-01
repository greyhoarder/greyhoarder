import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { type Account, HttpAccountsAdapter } from '../../infrastructure/http-accounts-adapter';
import { UsersPage } from './users-page';

const MIRA: Account = { id: '1', username: 'mira', role: 'admin', disabled: false, createdAt: '2026-10-12T08:00:00Z' };
const BEN: Account = {
  id: '2',
  username: 'ben',
  role: 'member',
  disabled: false,
  displayName: 'Ben',
  createdAt: '2026-10-12T08:00:00Z',
  lastLoginAt: '2026-10-30T18:30:00Z',
};

describe('Users page', () => {
  const update = vi.fn<HttpAccountsAdapter['update']>();
  const setPassword = vi.fn<HttpAccountsAdapter['setPassword']>();
  const remove = vi.fn<HttpAccountsAdapter['remove']>();

  const render = async (list: HttpAccountsAdapter['list'] = async () => [MIRA, BEN]) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: HttpAccountsAdapter, useValue: { list, update, setPassword, remove } }],
    });
    const fixture = TestBed.createComponent(UsersPage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const rows = (): HTMLElement[] => [...page.querySelectorAll<HTMLElement>('[data-testid="users-row"]')];
    const within = <T extends HTMLElement>(row: number, testId: string): T | null =>
      rows()[row]?.querySelector<T>(`[data-testid="${testId}"]`) ?? null;
    const dialog = (testId: string): HTMLElement | null => document.querySelector(`[data-testid="${testId}"]`);
    const open = async (row: number): Promise<void> => {
      within(row, 'users-toggle')?.click();
      await fixture.whenStable();
    };
    const search = async (query: string): Promise<void> => {
      const field = page.querySelector<HTMLInputElement>('[data-testid="users-search"]');
      if (field) {
        field.value = query;
        field.dispatchEvent(new Event('input'));
      }
      await fixture.whenStable();
    };
    const settled = async (expectation: () => void): Promise<void> => {
      await vi.waitFor(async () => {
        await fixture.whenStable();
        expectation();
      });
    };
    return { fixture, page, rows, within, dialog, open, search, settled };
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  beforeEach(() => {
    update.mockReset();
    setPassword.mockReset();
    remove.mockReset();
  });

  it('lists accounts', async () => {
    const { rows } = await render();

    expect(rows()[0]?.textContent).toContain('mira');
    expect(rows()[0]?.textContent).toContain('Admin');
    expect(rows()[1]?.textContent).toContain('Ben');
    expect(rows()[1]?.textContent).toContain('Member');
  });

  it('shows only the accounts whose username or display name contains the search', async () => {
    const { rows, search } = await render(async () => [
      MIRA,
      BEN,
      { ...BEN, id: '3', username: 'jk', displayName: 'Jonas K.' },
    ]);

    await search('JO');
    expect(rows().map((row) => row.textContent)).toEqual([expect.stringContaining('Jonas K.')]);

    await search('mi');
    expect(rows().map((row) => row.textContent)).toEqual([expect.stringContaining('mira')]);
  });

  it('says that no users match the search', async () => {
    const { page, rows, search } = await render();

    await search('nobody');

    expect(rows()).toHaveLength(0);
    expect(page.querySelector('[data-testid="users-no-results"]')?.textContent?.trim()).toBe(
      'No users match "nobody".',
    );
  });

  it('says when loading fails', async () => {
    const { page } = await render(() => Promise.reject(new Error('offline')));

    expect(page.querySelector('[data-testid="users-error"]')?.textContent?.trim()).toBe(
      "Can't load the users right now. Try again in a moment.",
    );
  });

  it('opens an account with its created day and last login', async () => {
    const { within, open } = await render();

    await open(1);

    expect(within(1, 'users-created')?.textContent).toContain('12 Oct 2026');
    expect(within(1, 'users-last-login')?.textContent).toContain('30 Oct 2026');
  });

  it('says Never without a last login', async () => {
    const { within, open } = await render();

    await open(0);

    expect(within(0, 'users-last-login')?.textContent).toContain('Never');
  });

  it('changes the role', async () => {
    update.mockResolvedValue({ ...BEN, role: 'admin' });
    const { rows, within, open, settled } = await render();
    await open(1);

    rows()[1]?.querySelector<HTMLElement>('[data-testid="users-role"][data-role="admin"]')?.click();

    await settled(() => expect(within(1, 'users-toggle')?.textContent).toContain('Admin'));
    expect(update).toHaveBeenCalledWith(BEN.id, { role: 'admin' });
  });

  it('sets a new password', async () => {
    setPassword.mockResolvedValue();
    const { fixture, within, open, settled } = await render();
    await open(1);
    within(1, 'users-reset-password')?.click();
    await fixture.whenStable();
    const field = within<HTMLInputElement>(1, 'users-new-password');
    if (field) {
      field.value = 'new password';
      field.dispatchEvent(new Event('input'));
    }

    within(1, 'users-set-password')?.click();

    await settled(() => expect(within(1, 'users-message')).not.toBeNull());
    expect(setPassword).toHaveBeenCalledWith(BEN.id, 'new password');
  });

  it('disables and enables an account', async () => {
    update.mockResolvedValueOnce({ ...BEN, disabled: true }).mockResolvedValueOnce(BEN);
    const { within, open, settled } = await render();
    await open(1);

    within(1, 'users-toggle-access')?.click();
    await settled(() => expect(within(1, 'users-disabled')).not.toBeNull());
    within(1, 'users-toggle-access')?.click();
    await settled(() => expect(within(1, 'users-disabled')).toBeNull());

    expect(update).toHaveBeenCalledWith(BEN.id, { disabled: true });
    expect(update).toHaveBeenCalledWith(BEN.id, { disabled: false });
  });

  it('asks before deleting and removes the account', async () => {
    remove.mockResolvedValue();
    const { rows, within, dialog, open, settled, fixture } = await render();
    await open(1);

    within(1, 'users-delete')?.click();
    await fixture.whenStable();
    expect(remove).not.toHaveBeenCalled();
    dialog('users-delete-confirm')?.click();

    await settled(() => expect(rows()).toHaveLength(1));
    expect(remove).toHaveBeenCalledWith(BEN.id);
  });

  it('keeps the account when deleting is cancelled', async () => {
    const { rows, within, dialog, open, fixture } = await render();
    await open(1);

    within(1, 'users-delete')?.click();
    await fixture.whenStable();
    dialog('users-delete-cancel')?.click();
    await fixture.whenStable();

    expect(remove).not.toHaveBeenCalled();
    expect(rows()).toHaveLength(2);
  });

  it('disables the controls of the last admin', async () => {
    const { within, open } = await render();

    await open(0);

    expect(within(0, 'users-last-admin')).not.toBeNull();
    expect(within<HTMLButtonElement>(0, 'users-toggle-access')?.disabled).toBe(true);
    expect(within<HTMLButtonElement>(0, 'users-delete')?.disabled).toBe(true);
  });

  it('says when a change fails', async () => {
    update.mockRejectedValue(new Error('offline'));
    const { within, open, settled } = await render();
    await open(1);

    within(1, 'users-toggle-access')?.click();

    await settled(() =>
      expect(within(1, 'users-change-error')?.textContent?.trim()).toBe(
        "Can't change this account right now. Try again in a moment.",
      ),
    );
    expect(within(1, 'users-disabled')).toBeNull();
  });
});
