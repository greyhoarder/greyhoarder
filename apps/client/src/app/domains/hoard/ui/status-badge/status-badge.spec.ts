import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';

describe('Status badge', () => {
  it('names the status in words, e.g. "On the sprue" for minis still on the sprue', async () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', 'sprue');

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('On the sprue');
  });
});
