import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmAlertDialogFooter],hlm-alert-dialog-footer',
  exportAs: 'hlmAlertDialogFooter',
  host: { 'data-slot': 'alert-dialog-footer' },
})
export class HlmAlertDialogFooter {
  constructor() {
    classes(() => 'grid grid-cols-2 gap-3 px-6 pt-5 pb-6 *:h-11');
  }
}
