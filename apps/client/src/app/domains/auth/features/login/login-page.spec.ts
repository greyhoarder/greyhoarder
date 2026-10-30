import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpSessionAdapter } from '../../infrastructure/http-session-adapter';
import { InvalidCredentialsError } from '../../util/invalid-credentials.error';
import LoginPage from './login-page';

@Component({ template: '' })
class StubPage {}

describe('Login page', () => {
  let fixture: ComponentFixture<LoginPage>;
  let page: HTMLElement;
  const signIn = vi.fn();

  beforeEach(async () => {
    signIn.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: StubPage }]),
        { provide: HttpSessionAdapter, useValue: { signIn } },
      ],
    });
    fixture = TestBed.createComponent(LoginPage);
    page = fixture.nativeElement;
    await fixture.whenStable();
  });

  const field = (id: string) => page.querySelector<HTMLInputElement>(`#${id}`)!;

  const errorTextOf = (id: string) =>
    field(id).closest('[data-slot="field"]')!.querySelector('[data-slot="field-error"]')!.textContent!.trim();

  const type = async (id: string, value: string) => {
    field(id).value = value;
    field(id).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const click = async (element: HTMLElement) => {
    element.click();
    await fixture.whenStable();
  };

  const submitButton = () => page.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  const buttonNamed = (name: string) => page.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;

  it('places the cursor in the username field when the page opens', () => {
    expect(document.activeElement).toBe(field('username'));
  });

  it('says no error before the form is sent', () => {
    expect(errorTextOf('username')).toBe('');
    expect(errorTextOf('password')).toBe('');
  });

  it('says that the username is missing when the form is sent without one', async () => {
    await type('password', 'secret');

    await click(submitButton());

    expect(errorTextOf('username')).not.toBe('');
  });

  it('says that the password is missing when the form is sent without one', async () => {
    await type('username', 'lucas');

    await click(submitButton());

    expect(errorTextOf('password')).not.toBe('');
  });

  it('moves the cursor to the username field when the form is sent with both fields empty', async () => {
    field('password').focus();

    await click(submitButton());

    expect(document.activeElement).toBe(field('username'));
  });

  it('moves the cursor to the password field when only the password is missing', async () => {
    await type('username', 'lucas');

    await click(submitButton());

    expect(document.activeElement).toBe(field('password'));
  });

  it('shows the typed password when "Show password" is pressed and hides it again with "Hide password"', async () => {
    await type('password', 'secret');

    await click(buttonNamed('Show password'));
    const typeWhenShown = field('password').type;
    await click(buttonNamed('Hide password'));

    expect(typeWhenShown).toBe('text');
    expect(field('password').type).toBe('password');
  });

  it('leads into the app after a successful sign-in', async () => {
    signIn.mockResolvedValue({ id: '1', username: 'lucas', role: 'admin' });
    await type('username', 'lucas');
    await type('password', 'secret');

    await click(submitButton());

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('says "Username or password is incorrect." when the server refuses the credentials', async () => {
    signIn.mockRejectedValue(new InvalidCredentialsError());
    await type('username', 'lucas');
    await type('password', 'wrong');

    await click(submitButton());

    expect(page.querySelector('[data-testid="login-failure"]')?.textContent?.trim()).toBe(
      'Username or password is incorrect.',
    );
  });

  it('marks the sign-in button as busy and blocks it while the sign-in is running', async () => {
    signIn.mockReturnValue(new Promise(() => undefined));
    await type('username', 'lucas');
    await type('password', 'secret');
    const labelBefore = submitButton().textContent!.trim();

    submitButton().click();
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(true);
    expect(submitButton().getAttribute('aria-busy')).toBe('true');
    expect(submitButton().textContent!.trim()).not.toBe(labelBefore);
  });

  it('releases the sign-in button after the sign-in fails', async () => {
    signIn.mockRejectedValue(new InvalidCredentialsError());
    await type('username', 'lucas');
    await type('password', 'wrong');
    const labelBefore = submitButton().textContent!.trim();

    await click(submitButton());

    expect(submitButton().disabled).toBe(false);
    expect(submitButton().getAttribute('aria-busy')).toBe('false');
    expect(submitButton().textContent!.trim()).toBe(labelBefore);
  });
});
