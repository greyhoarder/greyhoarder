import { TestBed } from '@angular/core/testing';
import { GoneBadge } from './gone-badge';

describe('Gone badge', () => {
  it('names why the mini left the hoard', async () => {
    const fixture = TestBed.createComponent(GoneBadge);
    fixture.componentRef.setInput('reason', 'sold');

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('Sold');
  });
});
