import type { CheckOptions } from 'archunit';
import 'vitest';

// ArchUnitTS registers `toPassAsync` at runtime but declares it on a global
// `VitestAssertion` that Vitest does not use, so the type is added here.
declare module 'vitest' {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toPassAsync(options?: CheckOptions): Promise<void>;
  }
}
