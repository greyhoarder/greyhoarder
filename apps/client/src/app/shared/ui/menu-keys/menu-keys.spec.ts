import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuKeys } from './menu-keys';

@Component({
  imports: [MenuKeys],
  template: `<ul role="menu" aria-label="Box">
    <li role="none"><button type="button" role="menuitem" appMenuKeys>Add a mini</button></li>
    <li role="none"><button type="button" role="menuitem" appMenuKeys>Edit box</button></li>
    <li role="none"><button type="button" role="menuitem" appMenuKeys>Delete box</button></li>
  </ul>`,
})
class Menu {}

describe('Menu keys', () => {
  /** The menu's items, with the focus on the one at `focused`. */
  const render = (focused: number): HTMLElement[] => {
    const fixture = TestBed.createComponent(Menu);
    fixture.detectChanges();
    const items = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="menuitem"]')];
    items[focused]?.focus();
    return items;
  };
  const press = (key: string): void => {
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  };

  it('moves the focus to the next item with the down arrow, from the last back to the first', () => {
    const items = render(1);

    press('ArrowDown');
    const afterNext = document.activeElement;
    press('ArrowDown');

    expect([afterNext, document.activeElement]).toEqual([items[2], items[0]]);
  });

  it('moves the focus to the previous item with the up arrow, from the first to the last', () => {
    const items = render(1);

    press('ArrowUp');
    const afterPrevious = document.activeElement;
    press('ArrowUp');

    expect([afterPrevious, document.activeElement]).toEqual([items[0], items[2]]);
  });

  it('moves the focus to the first item with Home and to the last with End', () => {
    const items = render(1);

    press('Home');
    const afterHome = document.activeElement;
    press('End');

    expect([afterHome, document.activeElement]).toEqual([items[0], items[2]]);
  });
});
