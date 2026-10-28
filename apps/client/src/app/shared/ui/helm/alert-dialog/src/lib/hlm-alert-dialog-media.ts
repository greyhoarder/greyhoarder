import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmAlertDialogMedia],hlm-alert-dialog-media',
  exportAs: 'hlmAlertDialogMedia',
  host: { 'data-slot': 'alert-dialog-media' },
})
export class HlmAlertDialogMedia {
  constructor() {
    classes(
      () =>
        "bg-muted absolute top-1/2 left-6 -translate-y-1/2 inline-flex size-12 items-center justify-center rounded-xl *:[ng-icon:not([class*='text-'])]:text-[length:--spacing(5.5)]",
    );
  }
}
