import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import type { UserRole } from '@greyhoarder/domain/users';
import { CurrentSession } from '../../domains/auth/api';
import { SettingsLayout } from './settings-layout';

describe('Settings', () => {
  const tabsFor = async (role: UserRole): Promise<(string | undefined)[]> => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CurrentSession, useValue: { user: () => ({ role }) } }],
    });
    const fixture = TestBed.createComponent(SettingsLayout);
    await fixture.whenStable();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('nav a');

    return [...links].map((link) => link.textContent?.trim());
  };

  it('offers adding a user only on the Users tab', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: CurrentSession, useValue: { user: () => ({ role: 'admin' }) } }],
    });
    const url = vi.spyOn(TestBed.inject(Router), 'url', 'get').mockReturnValue('/settings/users');
    const onUsers = TestBed.createComponent(SettingsLayout);
    await onUsers.whenStable();
    url.mockReturnValue('/settings/general');
    const onGeneral = TestBed.createComponent(SettingsLayout);
    await onGeneral.whenStable();

    const addUser = (fixture: typeof onUsers) =>
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="users-add"]');

    expect(addUser(onUsers)).not.toBeNull();
    expect(addUser(onGeneral)).toBeNull();
  });

  it('offers the users to administrators', async () => {
    const tabs = await tabsFor('admin');

    expect(tabs).toEqual(['General', 'Users']);
  });

  it('offers no users to members', async () => {
    const tabs = await tabsFor('member');

    expect(tabs).toEqual(['General']);
  });
});
