import { TestBed } from '@angular/core/testing';
import { ColorScheme } from './color-scheme';

describe('Color scheme', () => {
  let systemIsDark: boolean;
  let onSystemChange: () => void;

  const isDark = (): boolean => document.documentElement.classList.contains('dark');

  beforeEach(() => {
    systemIsDark = false;
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return systemIsDark;
      },
      addEventListener: (_type: string, listener: () => void) => {
        onSystemChange = listener;
      },
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('applies the chosen theme at once', () => {
    const scheme = TestBed.inject(ColorScheme);
    scheme.start();

    scheme.choose('dark');

    expect(isDark()).toBe(true);
  });

  it('keeps the choice after reloading', () => {
    localStorage.setItem('greyhoarder-theme', 'dark');

    TestBed.inject(ColorScheme).start();

    expect(isDark()).toBe(true);
    expect(TestBed.inject(ColorScheme).theme()).toBe('dark');
  });

  it('follows the system without a choice', () => {
    TestBed.inject(ColorScheme).start();

    systemIsDark = true;
    onSystemChange();

    expect(isDark()).toBe(true);
  });
});
