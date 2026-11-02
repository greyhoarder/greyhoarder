import { computed, inject, Injectable, resource } from '@angular/core';
import { HttpActivityAdapter } from '../infrastructure/http-activity-adapter';

/** What got done in the hoard, loaded anew by each page that provides it (docs/screens/dashboard.md). */
@Injectable()
export class HoardActivity {
  private readonly adapter = inject(HttpActivityAdapter);
  private readonly loaded = resource({ loader: () => this.adapter.overview() });

  readonly isLoading = this.loaded.isLoading;
  readonly hasFailed = computed(() => this.loaded.error() !== undefined);
  readonly days = computed(() => (this.loaded.hasValue() ? this.loaded.value().days : []));
  readonly months = computed(() => (this.loaded.hasValue() ? this.loaded.value().months : []));
}
