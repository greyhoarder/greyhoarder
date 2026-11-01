import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CurrentSession } from '../current-session';
import { ProfilePage } from './profile-page';

describe('Profile page', () => {
  it('shows the name and role of the signed-in user', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CurrentSession, useValue: { user: signal({ id: '1', username: 'mira', role: 'admin' }) } },
      ],
    });
    const fixture = TestBed.createComponent(ProfilePage);

    await fixture.whenStable();

    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('[data-testid="profile-username"]')?.textContent?.trim()).toBe('mira');
    expect(page.querySelector('[data-testid="profile-role"]')?.textContent?.trim()).toBe('Admin');
  });
});
