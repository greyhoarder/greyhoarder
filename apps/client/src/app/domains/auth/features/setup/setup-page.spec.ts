import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpSessionAdapter } from '../../infrastructure/http-session-adapter';
import { HttpSetupAdapter } from '../../infrastructure/http-setup-adapter';
import { ServerUnreachableError } from '../../../../shared/http/server-unreachable.error';
import { SetupPage } from './setup-page';

@Component({ template: '' })
class StubPage {}

describe('Setup page', () => {
  let fixture: ComponentFixture<SetupPage>;
  let page: HTMLElement;
  const createAdministrator = vi.fn();
  const signIn = vi.fn();

  beforeEach(async () => {
    createAdministrator.mockReset().mockResolvedValue(undefined);
    signIn.mockReset().mockResolvedValue({ id: '1', username: 'lucas', role: 'admin' });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: StubPage }]),
        { provide: HttpSetupAdapter, useValue: { createAdministrator } },
        { provide: HttpSessionAdapter, useValue: { signIn } },
      ],
    });
    fixture = TestBed.createComponent(SetupPage);
    page = fixture.nativeElement;
    await fixture.whenStable();
  });

  const field = (testId: string): HTMLInputElement => {
    const element = page.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`No field ${testId}`);
    }
    return element;
  };

  const errorTextOf = (testId: string): string =>
    field(testId).closest('[data-slot="field"]')?.querySelector('[data-slot="field-error"]')?.textContent?.trim() ?? '';

  const type = async (testId: string, value: string): Promise<void> => {
    field(testId).value = value;
    field(testId).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const submit = async (): Promise<void> => {
    field('setup-submit').click();
    await fixture.whenStable();
  };

  it('places the cursor in the username field when the page opens', () => {
    expect(document.activeElement).toBe(field('setup-username'));
  });

  it('says no error before the form is sent', () => {
    expect(errorTextOf('setup-username')).toBe('');
    expect(errorTextOf('setup-password')).toBe('');
    expect(errorTextOf('setup-password-confirmation')).toBe('');
  });

  it('says that the username is missing when the form is sent without one', async () => {
    await type('setup-password', 'secret-password');
    await type('setup-password-confirmation', 'secret-password');

    await submit();

    expect(errorTextOf('setup-username')).not.toBe('');
  });

  it('says that the password is missing when the form is sent without one', async () => {
    await type('setup-username', 'lucas');

    await submit();

    expect(errorTextOf('setup-password')).not.toBe('');
  });

  it('says that the passwords do not match when the repeated one differs', async () => {
    await type('setup-username', 'lucas');
    await type('setup-password', 'secret-password');
    await type('setup-password-confirmation', 'other-password');

    await submit();

    expect(errorTextOf('setup-password-confirmation')).not.toBe('');
  });

  it('accepts the repeated password when both passwords are the same', async () => {
    await type('setup-username', 'lucas');
    await type('setup-password', 'secret-password');
    await type('setup-password-confirmation', 'secret-password');

    await submit();

    expect(errorTextOf('setup-password-confirmation')).toBe('');
  });

  it('moves the cursor to the first field with an error when the form is sent', async () => {
    field('setup-password').focus();

    await submit();

    expect(document.activeElement).toBe(field('setup-username'));
  });

  it('signs the new administrator in and leads into the app', async () => {
    await type('setup-username', 'lucas');
    await type('setup-password', 'secret-password');
    await type('setup-password-confirmation', 'secret-password');

    await submit();

    expect(createAdministrator).toHaveBeenCalledWith('lucas', 'secret-password');
    expect(signIn).toHaveBeenCalledWith({
      username: 'lucas',
      password: 'secret-password',
      keepSignedIn: false,
    });
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('marks the create button as busy and blocks it while the administrator is being created', async () => {
    createAdministrator.mockReturnValue(new Promise(() => undefined));
    await type('setup-username', 'lucas');
    await type('setup-password', 'secret-password');
    await type('setup-password-confirmation', 'secret-password');
    const labelBefore = field('setup-submit').textContent!.trim();

    field('setup-submit').click();
    fixture.detectChanges();

    expect(field('setup-submit').disabled).toBe(true);
    expect(field('setup-submit').getAttribute('aria-busy')).toBe('true');
    expect(field('setup-submit').textContent!.trim()).not.toBe(labelBefore);
  });

  it('releases the create button after creating the administrator fails', async () => {
    createAdministrator.mockRejectedValue(new ServerUnreachableError());
    await type('setup-username', 'lucas');
    await type('setup-password', 'secret-password');
    await type('setup-password-confirmation', 'secret-password');
    const labelBefore = field('setup-submit').textContent!.trim();

    await submit();

    expect(field('setup-submit').disabled).toBe(false);
    expect(field('setup-submit').getAttribute('aria-busy')).toBe('false');
    expect(field('setup-submit').textContent!.trim()).toBe(labelBefore);
  });
});
