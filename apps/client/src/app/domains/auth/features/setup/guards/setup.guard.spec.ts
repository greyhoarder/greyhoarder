import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpSetupAdapter } from '../../../infrastructure/http-setup-adapter';
import { setupDoneGuard, setupOpenGuard } from './setup.guard';

@Component({ template: '' })
class StubPage {}

describe('Setup guards', () => {
  const setUp = (isSetupRequired: () => Promise<boolean>): Router => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', canActivate: [setupDoneGuard], component: StubPage },
          { path: 'setup', canActivate: [setupOpenGuard], component: StubPage },
        ]),
        { provide: HttpSetupAdapter, useValue: { isSetupRequired } },
      ],
    });
    return TestBed.inject(Router);
  };

  it('sends the login to the setup while no account exists', async () => {
    const router = setUp(async () => true);

    await router.navigateByUrl('/login');

    expect(router.url).toBe('/setup');
  });

  it('sends the setup to the login once an account exists', async () => {
    const router = setUp(async () => false);

    await router.navigateByUrl('/setup');

    expect(router.url).toBe('/login');
  });

  it('stops asking the server once the setup is done', async () => {
    const isSetupRequired = vi.fn(async () => false);
    const router = setUp(isSetupRequired);

    await router.navigateByUrl('/login');
    await router.navigateByUrl('/setup');

    expect(isSetupRequired).toHaveBeenCalledTimes(1);
  });
});
