import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpSetupAdapter } from '../../../infrastructure/http-setup-adapter';
import { setupGuard } from './setup.guard';

@Component({ template: '' })
class StubPage {}

describe('Setup guard', () => {
  const navigateWith = async (isSetupRequired: boolean, url: string): Promise<string> => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            canActivateChild: [setupGuard],
            children: [
              { path: 'login', component: StubPage },
              { path: 'setup', component: StubPage },
            ],
          },
        ]),
        { provide: HttpSetupAdapter, useValue: { isSetupRequired: async () => isSetupRequired } },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    return router.url;
  };

  it('sends every address to the setup while no account exists', async () => {
    const url = await navigateWith(true, '/login');

    expect(url).toBe('/setup');
  });
});
