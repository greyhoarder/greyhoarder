import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

/** How long a finger rests on the element before the press counts as long. */
const DURATION_MS = 500;
/** How far the finger may move, e.g. when it starts to scroll, before the press no longer counts. */
const TOLERANCE_PX = 10;

/**
 * A long press with a finger on a touch screen, which starts selection mode on a line or card of
 * the hoard (docs/screens/hoard.md, Behavior). The click that ends it does nothing, and the browser
 * shows no menu for it.
 */
@Directive({
  selector: '[appLongPress]',
  host: {
    class: '[-webkit-touch-callout:none]',
    '(pointerdown)': 'start($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'cancel()',
    '(pointercancel)': 'cancel()',
    '(contextmenu)': 'preventMenu($event)',
  },
})
export class LongPress {
  readonly longPress = output();

  private timer?: ReturnType<typeof setTimeout>;
  private origin?: { readonly x: number; readonly y: number };
  private hasPressedLong = false;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // Captured before the handlers of the element and its children, so the press neither opens
    // nor toggles what it just selected.
    const swallowClick = (event: MouseEvent): void => {
      if (this.hasPressedLong) {
        this.hasPressedLong = false;
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };
    element.addEventListener('click', swallowClick, { capture: true });
    inject(DestroyRef).onDestroy(() => {
      element.removeEventListener('click', swallowClick, { capture: true });
      this.cancel();
    });
  }

  protected start(event: PointerEvent): void {
    this.hasPressedLong = false;
    if (event.pointerType !== 'touch') {
      return;
    }
    this.origin = { x: event.clientX, y: event.clientY };
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.hasPressedLong = true;
      this.longPress.emit();
    }, DURATION_MS);
  }

  protected move(event: PointerEvent): void {
    const { origin } = this;
    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > TOLERANCE_PX) {
      this.cancel();
    }
  }

  protected cancel(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.origin = undefined;
  }

  protected preventMenu(event: Event): void {
    if (this.timer !== undefined || this.hasPressedLong) {
      event.preventDefault();
    }
  }
}
