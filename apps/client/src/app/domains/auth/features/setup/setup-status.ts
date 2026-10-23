import { inject, Injectable } from '@angular/core';
import { HttpSetupAdapter } from '../../infrastructure/http-setup-adapter';

/**
 * Whether the instance still needs its setup. Once done, it stays done (ADR-0007), so only a
 * `true` is asked again; someone else finishing the setup first surfaces as a 409 on the setup.
 */
@Injectable({ providedIn: 'root' })
export class SetupStatus {
  private readonly setup = inject(HttpSetupAdapter);
  private done = false;

  async isRequired(): Promise<boolean> {
    if (this.done) {
      return false;
    }
    const required = await this.setup.isSetupRequired();
    this.done = !required;
    return required;
  }

  /** Called once the server confirmed that an account exists. */
  markDone(): void {
    this.done = true;
  }
}
