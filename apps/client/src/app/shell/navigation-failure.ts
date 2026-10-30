import { Location } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, type NavigationError, Router } from '@angular/router';
import { ServerUnreachableError } from '../shared/http/server-unreachable.error';

export type NavigationFailureReason = 'unreachable' | 'unexpected';

/**
 * The last navigation that failed, e.g. because a guard got no answer from the server. The app
 * shows it in place of the page until a navigation succeeds; the address stays as it is.
 */
@Injectable({ providedIn: 'root' })
export class NavigationFailure {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly failed = signal<{ url: string; reason: NavigationFailureReason } | undefined>(undefined);

  readonly reason = computed(() => this.failed()?.reason);
  readonly isRetrying = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.failed.set(undefined);
      }
    });
  }

  record(error: NavigationError): void {
    const reason = error.error instanceof ServerUnreachableError ? 'unreachable' : 'unexpected';
    this.failed.set({ url: error.url, reason });
    // The router puts the previous address back after a failed navigation; keeping the failed one
    // lets a reload of the browser try again.
    setTimeout(() => this.location.replaceState(error.url));
  }

  /** Repeats the failed navigation; failing again records the new failure. */
  async retry(): Promise<void> {
    const failed = this.failed();
    if (!failed) {
      return;
    }
    this.isRetrying.set(true);
    try {
      await this.router.navigateByUrl(failed.url);
    } catch {
      // Recorded through the router's navigation error handler.
    } finally {
      this.isRetrying.set(false);
    }
  }
}
