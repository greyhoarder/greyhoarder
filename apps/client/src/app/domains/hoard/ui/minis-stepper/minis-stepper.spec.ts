import { TestBed } from '@angular/core/testing';
import { MinisStepper } from './minis-stepper';

describe('Minis stepper', () => {
  const render = async (count: number) => {
    const fixture = TestBed.createComponent(MinisStepper);
    fixture.componentRef.setInput('count', count);
    fixture.componentRef.setInput('testId', 'add-minis');
    await fixture.whenStable();
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);
    const find = (testId: string): HTMLButtonElement | null =>
      (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
    return { changed, find };
  };

  it('says how many minis are added', async () => {
    const three = await render(3);
    const one = await render(1);

    expect(three.find('add-minis-count')?.textContent?.trim()).toBe('3 minis');
    expect(one.find('add-minis-count')?.textContent?.trim()).toBe('1 mini');
  });

  it('counts one more with +', async () => {
    const { changed, find } = await render(2);

    find('add-minis-more')?.click();

    expect(changed).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('counts one less with −', async () => {
    const { changed, find } = await render(2);

    find('add-minis-less')?.click();

    expect(changed).toHaveBeenCalledExactlyOnceWith(-1);
  });

  it('does not go below one mini', async () => {
    const { find } = await render(1);

    expect(find('add-minis-less')?.disabled).toBe(true);
  });
});
