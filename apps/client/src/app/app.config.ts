import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withPreloading,
} from '@angular/router';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { routes } from './app.routes';
import { ColorScheme } from './shared/theme/color-scheme';
import { NavigationFailure } from './shell/navigation-failure';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Loads every page's code in the background after start, so the first visit of a page does not wait for it.
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withNavigationErrorHandler((error) => inject(NavigationFailure).record(error)),
    ),
    provideHttpClient(withFetch()),
    provideSpartanHlm(),
    provideAppInitializer(() => inject(ColorScheme).followSystem()),
  ],
};
