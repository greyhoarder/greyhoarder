/**
 * A test double with only the members a test needs, typed as the whole interface; calling another
 * member fails the test. Tests use it instead of `as unknown as`.
 */
export function partialFake<T>(members: Partial<T>): T {
  return members as T;
}
