import { Directive } from '@angular/core';

/**
 * Arrow keys, Home and End move the focus between the items of the menu a menu item is in; the
 * arrows wrap around at either end.
 */
@Directive({
  selector: '[appMenuKeys]',
  host: { '(keydown)': 'moveFocus($event)' },
})
export class MenuKeys {
  protected moveFocus(event: KeyboardEvent): void {
    const menu = event.target instanceof HTMLElement ? event.target.closest('[role="menu"]') : null;

    if (!menu) {
      return;
    }

    const items = [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    const current = items.findIndex((item) => item === document.activeElement);

    const next = {
      ArrowDown: (current + 1) % items.length,
      ArrowUp: (current - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];

    if (next !== undefined) {
      event.preventDefault();
      items[next]?.focus();
    }
  }
}
