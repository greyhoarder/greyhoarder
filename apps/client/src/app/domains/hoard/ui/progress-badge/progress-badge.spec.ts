import { TestBed } from '@angular/core/testing';
import { ProgressBadge } from './progress-badge';

describe('Progress badge', () => {
  it('names the progress in words', async () => {
    const fixture = TestBed.createComponent(ProgressBadge);
    fixture.componentRef.setInput('progress', 'done');

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('Done');
  });
});
