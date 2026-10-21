import { TestBed } from '@angular/core/testing';
import { PasswordStrengthMeter } from './password-strength';

describe('Password strength meter', () => {
  const render = async (password: string, userInputs: readonly string[] = []): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(PasswordStrengthMeter);
    fixture.componentRef.setInput('password', password);
    fixture.componentRef.setInput('userInputs', userInputs);
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  const levelOf = (meter: HTMLElement): number =>
    Number(meter.querySelector('[role="meter"]')?.getAttribute('aria-valuenow'));

  it('shows nothing while the password is empty', async () => {
    const meter = await render('');

    expect(meter.querySelector('[role="meter"]')).toBeNull();
  });

  it('rates a well-known password as too weak', async () => {
    const meter = await render('password123');

    expect(levelOf(meter)).toBe(1);
  });

  it('rates a long, random password as strong', async () => {
    const meter = await render('kT9#vQ2!mZ7$wR4p');

    expect(levelOf(meter)).toBe(4);
  });

  it('rates a password lower when it contains the username', async () => {
    const withoutUsername = await render('grauhorter-7Kq');
    const withUsername = await render('grauhorter-7Kq', ['grauhorter']);

    expect(levelOf(withUsername)).toBeLessThan(levelOf(withoutUsername));
  });

  it('tells screen readers the rated level', async () => {
    const meter = await render('kT9#vQ2!mZ7$wR4p');
    const element = meter.querySelector('[role="meter"]');

    expect(element?.getAttribute('aria-valuenow')).toBe('4');
    expect(element?.getAttribute('aria-valuetext')).not.toBe('');
  });
});
