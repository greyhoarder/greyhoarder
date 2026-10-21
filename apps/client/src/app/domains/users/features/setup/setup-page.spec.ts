import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetupPage } from './setup-page';

describe('Setup page', () => {
  let fixture: ComponentFixture<SetupPage>;
  let page: HTMLElement;

  beforeEach(async () => {
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
    field(testId).closest('[data-slot="field"]')?.querySelector('[data-slot="field-error"]')
      ?.textContent?.trim() ?? '';

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

  it('shows no error messages before the form is sent', () => {
    expect(errorTextOf('setup-username')).toBe('');
    expect(errorTextOf('setup-password')).toBe('');
    expect(errorTextOf('setup-password-confirmation')).toBe('');
  });

  it('shows a username missing message when the form is sent without a username', async () => {
    await type('setup-password', 'secret-password');
    await type('setup-password-confirmation', 'secret-password');

    await submit();

    expect(errorTextOf('setup-username')).not.toBe('');
  });

  it('shows a password missing message when the form is sent without a password', async () => {
    await type('setup-username', 'lucas');

    await submit();

    expect(errorTextOf('setup-password')).not.toBe('');
  });

  it('shows a mismatch message when the repeated password differs', async () => {
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
});
