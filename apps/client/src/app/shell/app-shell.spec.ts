import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CurrentSession } from '../domains/auth/api';
import { AppShell } from './app-shell';

@Component({ template: '' })
class StubPage {}

describe('Shell', () => {
  let fixture: ComponentFixture<AppShell>;
  let shell: HTMLElement;
  const signOut = vi.fn();

  beforeEach(async () => {
    signOut.mockReset().mockResolvedValue(undefined);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: StubPage },
          { path: 'dashboard', component: StubPage },
        ]),
        {
          provide: CurrentSession,
          useValue: { user: signal({ id: '1', username: 'mira', role: 'admin' }), signOut },
        },
      ],
    });
    fixture = TestBed.createComponent(AppShell);
    shell = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('shows the name and role of the signed-in user', () => {
    const text = shell.querySelector('aside')?.textContent ?? '';

    expect(text).toContain('mira');
    expect(text).toContain('Admin');
  });

  it('signs out and leads to the login when "Sign out" is pressed', async () => {
    shell.querySelector<HTMLButtonElement>('button[aria-label="Sign out"]')?.click();
    await fixture.whenStable();

    expect(signOut).toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
