import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withNavigationErrorHandler } from '@angular/router';
import { App } from './app';
import { ServerUnreachableError } from './shared/http/server-unreachable.error';
import { NavigationFailure } from './shell/navigation-failure';

@Component({ template: 'Stub page' })
class StubPage {}

describe('App shell', () => {
  it('shows the page of the current address', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'stub', component: StubPage }])],
    });
    const fixture = TestBed.createComponent(App);
    const shell: HTMLElement = fixture.nativeElement;

    await TestBed.inject(Router).navigateByUrl('/stub');
    await fixture.whenStable();

    expect(shell.textContent).toContain('Stub page');
  });

  it("shows the navigation error instead of an empty page when a page can't be opened", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'stub',
              component: StubPage,
              canActivate: [
                () => {
                  throw new ServerUnreachableError();
                },
              ],
            },
          ],
          withNavigationErrorHandler((error) => inject(NavigationFailure).record(error)),
        ),
      ],
    });
    const fixture = TestBed.createComponent(App);
    const shell: HTMLElement = fixture.nativeElement;

    await TestBed.inject(Router)
      .navigateByUrl('/stub')
      .catch(() => false);
    await fixture.whenStable();

    expect(shell.querySelector('[data-testid="navigation-error-message"]')).not.toBeNull();
  });
});
