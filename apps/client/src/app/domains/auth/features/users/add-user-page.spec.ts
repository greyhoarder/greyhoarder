import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpAccountsAdapter } from '../../infrastructure/http-accounts-adapter';
import { UsernameTakenError } from '../../util/username-taken.error';
import { AddUserPage } from './add-user-page';

@Component({ template: '' })
class StubPage {}

describe('Add user page', () => {
  const add = vi.fn<HttpAccountsAdapter['add']>();

  const render = async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'settings/users', component: StubPage }]),
        { provide: HttpAccountsAdapter, useValue: { add } },
      ],
    });
    const fixture = TestBed.createComponent(AddUserPage);
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

    const error = (): string | undefined => page.querySelector('[data-testid="add-user-error"]')?.textContent?.trim();

    return { fill, submit, error };
  };

  beforeEach(() => {
    add.mockReset();
  });

  it('adds and leads back', async () => {
    add.mockResolvedValue();
    const { fill, submit } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fill('add-user-username', 'ben');
    fill('add-user-password', 'first password');

    await submit();

    expect(add).toHaveBeenCalledWith({ username: 'ben', role: 'member', password: 'first password' });
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/settings/users'));
  });

  it('shows errors', async () => {
    add.mockRejectedValue(new UsernameTakenError());
    const { fill, submit, error } = await render();

    await submit();
    expect(error()).toBe('Enter a username.');

    fill('add-user-username', 'ben');
    fill('add-user-password', 'first password');
    await submit();
    await vi.waitFor(() => expect(error()).toBe('This username is taken.'));
  });
});
