import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LongPress } from './long-press';

@Component({
  imports: [LongPress],
  template: `<div appLongPress (longPress)="pressed()">
    <button type="button" (click)="clicked()">Boy</button>
  </div>`,
})
class Line {
  readonly pressed = vi.fn();
  readonly clicked = vi.fn();
}

/** A pointer event as a finger or a mouse sends it; jsdom has no `PointerEvent`. */
function pointer(
  type: string,
  pointerType: 'touch' | 'mouse',
  { x = 0, y = 0 }: { x?: number; y?: number } = {},
): Event {
  return Object.assign(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }), {
    pointerType,
  });
}

describe('Long press', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const render = () => {
    const fixture = TestBed.createComponent(Line);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    return { line: fixture.componentInstance, button };
  };

  it('tells when a finger rests on the element long enough', () => {
    const { line, button } = render();

    button?.dispatchEvent(pointer('pointerdown', 'touch'));
    vi.advanceTimersByTime(500);

    expect(line.pressed).toHaveBeenCalledOnce();
  });

  it('ignores a press with a mouse', () => {
    const { line, button } = render();

    button?.dispatchEvent(pointer('pointerdown', 'mouse'));
    vi.advanceTimersByTime(1000);

    expect(line.pressed).not.toHaveBeenCalled();
  });

  it('ignores a finger that moves away, e.g. to scroll', () => {
    const { line, button } = render();

    button?.dispatchEvent(pointer('pointerdown', 'touch'));
    button?.dispatchEvent(pointer('pointermove', 'touch', { y: 30 }));
    vi.advanceTimersByTime(1000);

    expect(line.pressed).not.toHaveBeenCalled();
  });

  it('swallows the click that ends a long press', () => {
    const { line, button } = render();
    button?.dispatchEvent(pointer('pointerdown', 'touch'));
    vi.advanceTimersByTime(500);

    button?.dispatchEvent(pointer('pointerup', 'touch'));
    button?.click();

    expect(line.clicked).not.toHaveBeenCalled();
  });

  it('lets the clicks of short presses through', () => {
    const { line, button } = render();

    button?.dispatchEvent(pointer('pointerdown', 'touch'));
    vi.advanceTimersByTime(100);
    button?.dispatchEvent(pointer('pointerup', 'touch'));
    button?.click();

    expect(line.clicked).toHaveBeenCalledOnce();
    expect(line.pressed).not.toHaveBeenCalled();
  });
});
