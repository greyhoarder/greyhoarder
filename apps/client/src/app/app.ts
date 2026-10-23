import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationErrorPage } from './shell/navigation-error/navigation-error-page';
import { NavigationFailure } from './shell/navigation-failure';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationErrorPage],
  template: `
    @if (navigationFailure.reason()) {
      <app-navigation-error />
    } @else {
      <router-outlet />
    }
  `,
})
export class App {
  protected readonly navigationFailure = inject(NavigationFailure);
}
