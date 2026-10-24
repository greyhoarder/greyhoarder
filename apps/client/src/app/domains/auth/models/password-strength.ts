export type PasswordStrength = 'too-weak' | 'weak' | 'fair' | 'strong';

/** zxcvbn scores 0–4; the two lowest are both "too weak" for this app. */
const STRENGTH_BY_SCORE: readonly PasswordStrength[] = ['too-weak', 'too-weak', 'weak', 'fair', 'strong'];

/** The strength of a zxcvbn score; scores outside 0–4 count as too weak. */
export function toPasswordStrength(score: number): PasswordStrength {
  return STRENGTH_BY_SCORE[score] ?? 'too-weak';
}
