import { toPasswordStrength } from './password-strength';

describe('Password strength', () => {
  it('rates the two lowest scores as too weak', () => {
    const strengths = [0, 1].map(toPasswordStrength);

    expect(strengths).toEqual(['too-weak', 'too-weak']);
  });

  it('rates the higher scores as weak, fair and strong', () => {
    const strengths = [2, 3, 4].map(toPasswordStrength);

    expect(strengths).toEqual(['weak', 'fair', 'strong']);
  });

  it('rates a score outside the scale as too weak', () => {
    const strengths = [5, -1].map(toPasswordStrength);

    expect(strengths).toEqual(['too-weak', 'too-weak']);
  });
});
