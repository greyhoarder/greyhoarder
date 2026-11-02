import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpSessionAdapter, type SessionUser } from '../../../infrastructure/http-session-adapter';
import { CurrentSession } from '../current-session';
import { administratorGuard, signedInGuard } from './session.guard';

@Component({ template: '' })
class StubPage {}

describe('Signed-in guard', () => {
  const navigateAs = async (user: SessionUser | undefined, url: string): Promise<string> => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: StubPage },
          { path: '', canActivateChild: [signedInGuard], children: [{ path: 'dashboard', component: StubPage }] },
        ]),
        { provide: HttpSessionAdapter, useValue: { currentUser: async () => user } },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);

    return router.url;
  };

  it('sends a signed-out user to the login', async () => {
    const url = await navigateAs(undefined, '/dashboard');

    expect(url).toBe('/login');
  });

  it('lets a signed-in user through', async () => {
    const url = await navigateAs({ id: '1', username: 'lucas', role: 'admin' }, '/dashboard');

    expect(url).toBe('/dashboard');
  });
});

describe('Administrator guard', () => {
  it('leads members away from the users', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'settings/general', component: StubPage },
          { path: 'settings/users', canActivate: [administratorGuard], component: StubPage },
        ]),
        { provide: CurrentSession, useValue: { user: () => ({ id: '2', username: 'ben', role: 'member' }) } },
      ],
    });
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/settings/users');

    expect(router.url).toBe('/settings/general');
  });
});
