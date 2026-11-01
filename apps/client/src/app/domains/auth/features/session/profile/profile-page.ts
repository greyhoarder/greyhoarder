import { Component, inject } from '@angular/core';
import { ROLE_LABELS } from '../../../models/role-labels';
import { CurrentSession } from '../current-session';

/** Who is signed in; specified in docs/screens/profile.md. */
@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class ProfilePage {
  protected readonly user = inject(CurrentSession).user;
  protected readonly roleLabels = ROLE_LABELS;
}
