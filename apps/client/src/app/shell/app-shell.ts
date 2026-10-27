import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBox,
  lucideBrush,
  lucideDroplet,
  lucideHouse,
  lucideLock,
  lucideLogOut,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
  lucideShield,
  lucideSlidersHorizontal,
} from '@ng-icons/lucide';
import { CurrentSession } from '../domains/auth/api';
import { Logo } from '../shared/ui/logo/logo';

interface NavigationEntry {
  readonly label: string;
  readonly icon: string;
  /** Without a link, the entry is shown disabled until its screen exists. */
  readonly link?: string;
}

const MAIN_ENTRIES: readonly NavigationEntry[] = [
  { label: 'Dashboard', icon: 'lucideHouse', link: '/dashboard' },
  { label: 'Hoard', icon: 'lucideBox', link: '/hoard' },
  { label: 'Workbench', icon: 'lucideBrush' },
  { label: 'Paints', icon: 'lucideDroplet' },
  { label: 'Armies', icon: 'lucideShield' },
];

const SETTINGS_ENTRY: NavigationEntry = { label: 'Settings', icon: 'lucideSlidersHorizontal' };

const ROLE_LABELS = { admin: 'Admin', member: 'Member' } as const;

/** Frame of every page behind the login: navigation beside the current page. */
@Component({
  selector: 'app-shell',
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, NgIcon, Logo],
  providers: [
    provideIcons({
      lucideBox,
      lucideBrush,
      lucideDroplet,
      lucideHouse,
      lucideLock,
      lucideLogOut,
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
      lucideShield,
      lucideSlidersHorizontal,
    }),
  ],
  templateUrl: './app-shell.html',
  host: { class: 'flex min-h-dvh flex-col bg-background md:flex-row' },
})
export class AppShell {
  private readonly session = inject(CurrentSession);
  private readonly router = inject(Router);

  protected readonly mainEntries = MAIN_ENTRIES;
  protected readonly settingsEntry = SETTINGS_ENTRY;
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly user = this.session.user;
  /** On wide screens, the sidebar shows only the icons of its entries. */
  protected readonly collapsed = signal(false);

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigateByUrl('/login');
  }
}
