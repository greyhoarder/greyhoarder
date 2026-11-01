import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DISPLAY_NAME_MAX_LENGTH, type Language, languages, shownName } from '@greyhoarder/domain/users';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { ColorScheme, type Theme, themes } from '../../../../../shared/theme/color-scheme';
import { Avatar } from '../../../../../shared/ui/avatar/avatar';
import { HttpProfileAdapter } from '../../../infrastructure/http-profile-adapter';
import { HttpSessionAdapter, type SessionUser } from '../../../infrastructure/http-session-adapter';
import { avatarUrl } from '../../../models/avatar-url';
import { ROLE_LABELS } from '../../../models/role-labels';
import { SquareImage } from '../../../util/square-image';
import { CurrentSession } from '../current-session';

const THEME_LABELS: Readonly<Record<Theme, string>> = { system: 'System', light: 'Light', dark: 'Dark' };
const LANGUAGE_LABELS: Readonly<Record<Language, string>> = { en: 'English', de: 'Deutsch' };
const SAVE_FAILED = "Can't save right now. Try again in a moment.";

/** What a user sets for themselves; specified in docs/screens/profile.md. */
@Component({
  selector: 'app-profile-page',
  imports: [Avatar, HlmButton, HlmInput, RouterLink],
  templateUrl: './profile-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class ProfilePage {
  private readonly session = inject(CurrentSession);
  private readonly profiles = inject(HttpProfileAdapter);
  private readonly sessions = inject(HttpSessionAdapter);
  private readonly squareImage = inject(SquareImage);
  protected readonly colorScheme = inject(ColorScheme);

  protected readonly user = this.session.user;
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly themes = themes;
  protected readonly themeLabels = THEME_LABELS;
  protected readonly languages = languages;
  protected readonly languageLabels = LANGUAGE_LABELS;
  protected readonly shownName = shownName;
  protected readonly avatarUrl = avatarUrl;

  protected readonly displayName = signal(this.user()?.displayName ?? '');
  protected readonly language = signal<Language>(this.user()?.language ?? 'en');
  protected readonly isNameTooLong = computed(() => this.displayName().trim().length > DISPLAY_NAME_MAX_LENGTH);
  /** What was just done, or what failed. */
  protected readonly message = signal(
    inject(Router).currentNavigation()?.extras.state?.['isPasswordChanged'] ? 'Your password was changed.' : '',
  );
  protected readonly failure = signal('');
  protected readonly avatarError = signal('');

  protected typeName(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.displayName.set(event.target.value);
    }
  }

  protected async saveName(): Promise<void> {
    const displayName = this.displayName().trim();
    if (this.isNameTooLong() || displayName === (this.user()?.displayName ?? '')) {
      return;
    }
    await this.save(() => this.profiles.update({ displayName }));
  }

  protected async chooseLanguage(event: Event): Promise<void> {
    const language = languages.find((each) => event.target instanceof HTMLSelectElement && each === event.target.value);
    if (language !== undefined) {
      this.language.set(language);
      await this.save(() => this.profiles.update({ language }));
    }
  }

  protected async choosePicture(event: Event): Promise<void> {
    const input = event.target instanceof HTMLInputElement ? event.target : undefined;
    const file = input?.files?.[0];
    if (file === undefined) {
      return;
    }
    this.avatarError.set('');
    try {
      const image = await this.imageOf(file);
      await this.save(() => this.profiles.setAvatar(image));
    } catch {
      this.avatarError.set('Choose an image.');
    }
    if (input) {
      input.value = '';
    }
  }

  protected removePicture(): Promise<void> {
    return this.save(() => this.profiles.removeAvatar());
  }

  protected async signOutOthers(): Promise<void> {
    this.clearMessages();
    try {
      await this.sessions.signOutOthers();
      this.message.set('Other devices are signed out.');
    } catch {
      this.failure.set(SAVE_FAILED);
    }
  }

  private async imageOf(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('This is no image.');
    }
    return this.squareImage.toJpeg(file);
  }

  /** Takes what the server stored; failing, shows what it has stored so far again. */
  private async save(change: () => Promise<SessionUser>): Promise<void> {
    this.clearMessages();
    try {
      this.session.replace(await change());
    } catch {
      this.failure.set(SAVE_FAILED);
    }
    this.displayName.set(this.user()?.displayName ?? '');
    this.language.set(this.user()?.language ?? 'en');
  }

  private clearMessages(): void {
    this.message.set('');
    this.failure.set('');
  }
}
