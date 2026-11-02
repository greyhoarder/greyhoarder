import { DOCUMENT, DestroyRef, Service, inject, signal } from '@angular/core';

export const themes = ['system', 'light', 'dark'] as const;

export type Theme = (typeof themes)[number];

const STORAGE_KEY = 'greyhoarder-theme';

/** Applies the `dark` theme class to the document root: as chosen in this browser, else as the system says. */
@Service()
export class ColorScheme {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly window = this.document.defaultView;
  private readonly query = this.window?.matchMedia('(prefers-color-scheme: dark)');

  private readonly chosen = signal<Theme>(this.stored());
  readonly theme = this.chosen.asReadonly();

  /** Runs before the first page shows, so a chosen theme never flashes the other one. */
  start(): void {
    const apply = () => this.apply();
    apply();
    this.query?.addEventListener('change', apply);
    this.destroyRef.onDestroy(() => this.query?.removeEventListener('change', apply));
  }

  choose(theme: Theme): void {
    this.chosen.set(theme);
    this.window?.localStorage.setItem(STORAGE_KEY, theme);
    this.apply();
  }

  private apply(): void {
    const theme = this.chosen();
    const isDark = theme === 'system' ? this.query?.matches === true : theme === 'dark';
    this.document.documentElement.classList.toggle('dark', isDark);
  }

  private stored(): Theme {
    const stored = this.window?.localStorage.getItem(STORAGE_KEY);

    return themes.find((theme) => theme === stored) ?? 'system';
  }
}
