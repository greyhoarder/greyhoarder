import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmAlertDialogHeader],hlm-alert-dialog-header',
  exportAs: 'hlmAlertDialogHeader',
  host: { 'data-slot': 'alert-dialog-header' },
})
export class HlmAlertDialogHeader {
  constructor() {
    classes(
      () =>
        'relative flex flex-col items-center justify-center gap-1 border-b bg-background/40 px-14 py-5 text-center has-data-[slot=alert-dialog-media]:min-h-22 has-data-[slot=alert-dialog-media]:pr-12 has-data-[slot=alert-dialog-media]:pl-20 sm:has-data-[slot=alert-dialog-media]:px-20',
    );
  }
}
