import { TestBed } from '@angular/core/testing';
import { AddStepper } from './add-stepper';

describe('Add box steps', () => {
  it('shows the steps "Find the kit", "Check" and "Done" in order', async () => {
    const fixture = TestBed.createComponent(AddStepper);
    fixture.componentRef.setInput('current', 0);

    await fixture.whenStable();

    const steps = (fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="add-box-step"]');
    expect([...steps].map((step) => step.textContent?.trim())).toEqual([
      '1. Find the kit',
      '2. Check',
      '3. Done',
    ]);
  });
});
