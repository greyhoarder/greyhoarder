import { TestBed } from '@angular/core/testing';
import { EditedBadge } from './edited-badge';

function render() {
  const fixture = TestBed.createComponent(EditedBadge);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Edited badge', () => {
  it('says "Edited"', () => {
    const badge = render();

    expect(badge.textContent?.trim()).toBe('Edited');
  });

  it('says on hover what edited means: "Counted by you, not as the kit describes"', () => {
    const badge = render();

    expect(badge.querySelector('[title]')?.getAttribute('title')).toBe('Counted by you, not as the kit describes');
  });
});
