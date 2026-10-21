import { DOCUMENT, DestroyRef, Service, inject } from '@angular/core';

/** Applies the `dark` theme class to the document root, following the system preference. */
@Service()
export class ColorScheme {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  followSystem(): void {
    const query = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
    if (!query) {
      return;
    }

    const apply = () => this.document.documentElement.classList.toggle('dark', query.matches);
    apply();
    query.addEventListener('change', apply);
    this.destroyRef.onDestroy(() => query.removeEventListener('change', apply));
  }
}
