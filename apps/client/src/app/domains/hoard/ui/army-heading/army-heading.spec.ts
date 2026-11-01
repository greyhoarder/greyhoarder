import { TestBed } from '@angular/core/testing';
import { ArmyHeading } from './army-heading';

describe('Army heading', () => {
  it('shows the army with its number of minis', async () => {
    const fixture = TestBed.createComponent(ArmyHeading);
    fixture.componentRef.setInput('army', 'Orks');
    fixture.componentRef.setInput('count', 29);

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('Orks · 29 minis');
  });
});
