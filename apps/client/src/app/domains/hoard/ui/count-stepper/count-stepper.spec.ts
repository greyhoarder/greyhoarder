import { TestBed } from '@angular/core/testing';
import { CountStepper } from './count-stepper';

describe('Count stepper', () => {
  const render = async (count: number, max: number): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(CountStepper);
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('max', max);
    fixture.componentRef.setInput('label', 'How many to build');
    fixture.componentRef.setInput('testId', 'mini-build');
    await fixture.whenStable();
    return fixture.nativeElement;
  };

  const button = (stepper: HTMLElement, testId: string): HTMLButtonElement | null =>
    stepper.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);

  it('says how many of how many are chosen', async () => {
    const stepper = await render(2, 5);

    expect(stepper.querySelector('[data-testid="mini-build-count"]')?.textContent?.trim()).toBe('2');
    expect(stepper.textContent).toContain('of 5');
  });

  it('offers no fewer than one', async () => {
    const stepper = await render(1, 5);

    expect(button(stepper, 'mini-build-less')?.disabled).toBe(true);
  });

  it('offers no more than the row holds', async () => {
    const stepper = await render(5, 5);

    expect(button(stepper, 'mini-build-more')?.disabled).toBe(true);
  });
});
