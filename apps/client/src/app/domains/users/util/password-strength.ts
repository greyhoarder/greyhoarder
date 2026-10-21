import type { ZxcvbnFactory } from '@zxcvbn-ts/core';

export type PasswordStrength = 'too-weak' | 'weak' | 'fair' | 'strong';

/** Rates a password; `userInputs` (e.g. the username) count as easy to guess. */
export type PasswordStrengthRater = (password: string, userInputs: readonly string[]) => PasswordStrength;

/** zxcvbn scores 0–4; the two lowest are both "too weak" for this app. */
const STRENGTH_BY_SCORE: readonly PasswordStrength[] = ['too-weak', 'too-weak', 'weak', 'fair', 'strong'];

let rater: Promise<PasswordStrengthRater> | undefined;

/**
 * Loads a rater based on zxcvbn with common, English and German dictionaries.
 * The dictionaries are large, so they load once, on first use; rating itself
 * is synchronous and fast enough for every keystroke. For display only;
 * nothing is enforced with it.
 */
export function loadPasswordStrengthRater(): Promise<PasswordStrengthRater> {
  rater ??= createRater();
  return rater;
}

async function createRater(): Promise<PasswordStrengthRater> {
  const estimator = await createEstimator();
  return (password, userInputs) =>
    STRENGTH_BY_SCORE[estimator.check(password, [...userInputs]).score] ?? 'too-weak';
}

async function createEstimator(): Promise<ZxcvbnFactory> {
  const [core, common, english, german] = await Promise.all([
    import('@zxcvbn-ts/core'),
    import('@zxcvbn-ts/language-common'),
    import('@zxcvbn-ts/language-en'),
    import('@zxcvbn-ts/language-de'),
  ]);
  return new core.ZxcvbnFactory({
    graphs: common.adjacencyGraphs,
    dictionary: { ...common.dictionary, ...english.dictionary, ...german.dictionary },
    translations: english.translations,
  });
}
