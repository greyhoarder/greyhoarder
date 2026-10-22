import { inject, Injectable, signal } from '@angular/core';
import { HttpSessionAdapter, type SessionUser } from '../../infrastructure/http-session-adapter';

/** The signed-in user, as the server confirmed it on the last navigation. */
@Injectable({ providedIn: 'root' })
export class CurrentSession {
  private readonly sessions = inject(HttpSessionAdapter);
  private readonly signedInUser = signal<SessionUser | undefined>(undefined);

  readonly user = this.signedInUser.asReadonly();

  /** Asks the server who is signed in; `undefined` when nobody is. */
  async refresh(): Promise<SessionUser | undefined> {
    const user = await this.sessions.currentUser();
    this.signedInUser.set(user);
    return user;
  }

  async signOut(): Promise<void> {
    await this.sessions.signOut();
    this.signedInUser.set(undefined);
  }
}
