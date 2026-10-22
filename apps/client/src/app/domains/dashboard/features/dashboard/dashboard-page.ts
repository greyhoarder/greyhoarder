import { Component, inject } from '@angular/core';
import { CurrentSession } from '../../../auth/api';

/** Where signed-in users land; specified in docs/screens/dashboard.md. */
@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.html',
  host: { class: 'mx-auto flex w-full max-w-6xl flex-col gap-10 p-4 sm:p-8 lg:p-10' },
})
export class DashboardPage {
  protected readonly user = inject(CurrentSession).user;

  protected readonly sections = [
    { id: 'activity', title: 'Activity' },
    { id: 'workbench', title: 'On the workbench' },
    { id: 'hoard', title: 'In the hoard' },
  ] as const;
}
