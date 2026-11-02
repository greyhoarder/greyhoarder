import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpSessionAdapter } from '../../../infrastructure/http-session-adapter';
import { WrongPasswordError } from '../../../util/wrong-password.error';
import { ChangePasswordPage } from './change-password-page';

@Component({ template: '' })
class StubPage {}

describe('Change password page', () => {
  const changePassword = vi.fn<HttpSessionAdapter['changePassword']>();

  const render = async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'profile', component: StubPage }]),
        { provide: HttpSessionAdapter, useValue: { changePassword } },
      ],
    });
    const fixture = TestBed.createComponent(ChangePasswordPage);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;

    const fill = (testId: string, value: string): void => {
      const field = page.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`);

      if (field) {
        field.value = value;
        field.dispatchEvent(new Event('input'));
      }
    };

    const submit = async (): Promise<void> => {
      page.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
    };

    const error = (): string | undefined =>
      page.querySelector('[data-testid="change-password-error"]')?.textContent?.trim();

    return { fill, submit, error };
  };

  beforeEach(() => {
    changePassword.mockReset();
  });

  it('shows each error', async () => {
    changePassword.mockRejectedValue(new WrongPasswordError());
    const { fill, submit, error } = await render();

    await submit();
    expect(error()).toBe('Enter your current password.');

    fill('change-password-current', 'old');
    await submit();
    expect(error()).toBe('Enter a new password.');

    fill('change-password-new', 'new');
    fill('change-password-repeat', 'other');
    await submit();
    expect(error()).toBe('The passwords do not match.');

    fill('change-password-repeat', 'new');
    await submit();
    await vi.waitFor(() => expect(error()).toBe('The current password is wrong.'));
  });

  it('leads back and says so', async () => {
    changePassword.mockResolvedValue();
    const { fill, submit } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fill('change-password-current', 'old');
    fill('change-password-new', 'new');
    fill('change-password-repeat', 'new');

    await submit();

    expect(changePassword).toHaveBeenCalledWith({ currentPassword: 'old', newPassword: 'new' });
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/profile', { state: { isPasswordChanged: true } }));
  });
});
