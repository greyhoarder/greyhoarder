import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { currentUrl } from '../../shared/routing/current-url';
import { CurrentSession } from '../../domains/auth/api';

/** The settings: their title and sections; each section comes from the domain it belongs to. */
@Component({
  selector: 'app-settings-layout',
  imports: [HlmButton, NgIcon, RouterLink, RouterLinkActive, RouterOutlet],
  providers: [provideIcons({ lucidePlus })],
  templateUrl: './settings-layout.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class SettingsLayout {
  private readonly user = inject(CurrentSession).user;

  private readonly url = currentUrl();

  protected readonly isAdministrator = computed(() => this.user()?.role === 'admin');
  /** The primary action sits beside the title and follows the open tab. */
  protected readonly isUsersTab = computed(() => this.url() === '/settings/users');
}
