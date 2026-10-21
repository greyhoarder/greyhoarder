import { ComponentFixture, TestBed } from '@angular/core/testing';
import LoginPage from './login-page';

describe('Login page', () => {
  let fixture: ComponentFixture<LoginPage>;
  let page: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(LoginPage);
    page = fixture.nativeElement;
    await fixture.whenStable();
  });

  const field = (id: string) => page.querySelector<HTMLInputElement>(`#${id}`)!;

  const errorTextOf = (id: string) =>
    field(id).closest('[data-slot="field"]')!.querySelector('[data-slot="field-error"]')!
      .textContent!.trim();

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

  const buttonNamed = (name: string) =>
    page.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;

  it('places the cursor in the username field when the page opens', () => {
    expect(document.activeElement).toBe(field('username'));
  });

  it('shows no error messages before the form is sent', () => {
    expect(errorTextOf('username')).toBe('');
    expect(errorTextOf('password')).toBe('');
  });

  it('shows username missing message when form is sent without a username', async () => {
    await type('password', 'secret');

    await click(submitButton());

    expect(errorTextOf('username')).not.toBe('');
  });

  it('shows password missing message when form is sent without a password', async () => {
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
});
