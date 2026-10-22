import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpSessionAdapter, type SessionUser } from '../../../infrastructure/http-session-adapter';
import { signedInGuard } from './session.guard';

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
