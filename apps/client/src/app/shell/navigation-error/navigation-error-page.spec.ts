import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, withNavigationErrorHandler } from '@angular/router';
import { ServerUnreachableError } from '../../shared/http/server-unreachable.error';
import { NavigationFailure } from '../navigation-failure';
import { NavigationErrorPage } from './navigation-error-page';

@Component({ template: 'Hoard' })
class StubPage {}

describe('Navigation error page', () => {
  let failure: Error;
  let isServerUp: boolean;

  beforeEach(() => {
    failure = new ServerUnreachableError();
    isServerUp = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'hoard',
              component: StubPage,
              canActivate: [
                () => {
                  if (!isServerUp) {
                    throw failure;
                  }
                  return true;
                },
              ],
            },
          ],
          withNavigationErrorHandler((error) => inject(NavigationFailure).record(error)),
        ),
      ],
    });
  });

  async function openFailingHoard(): Promise<ComponentFixture<NavigationErrorPage>> {
    await TestBed.inject(Router)
      .navigateByUrl('/hoard')
      .catch(() => false);
    const fixture = TestBed.createComponent(NavigationErrorPage);
    await fixture.whenStable();
    return fixture;
  }

  const message = (fixture: ComponentFixture<NavigationErrorPage>): string | undefined =>
    (fixture.nativeElement as HTMLElement)
      .querySelector('[data-testid="navigation-error-message"]')
      ?.textContent?.trim();

  it("says that the server can't be reached when it gave no answer", async () => {
    const fixture = await openFailingHoard();

    expect(message(fixture)).toBe("Can't reach the server. Try again in a moment.");
  });

  it('says that something went wrong for any other failure', async () => {
    failure = new Error('chunk failed to load');

    const fixture = await openFailingHoard();

    expect(message(fixture)).toBe('Something went wrong. Try again in a moment.');
  });

  it('opens the page once trying again succeeds', async () => {
    const fixture = await openFailingHoard();
    isServerUp = true;

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="navigation-error-retry"]')
      ?.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/hoard');
    expect(TestBed.inject(NavigationFailure).reason()).toBeUndefined();
  });
});
