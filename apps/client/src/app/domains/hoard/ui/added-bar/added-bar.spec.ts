import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AddedBar } from './added-bar';

describe('Added bar', () => {
  const render = async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AddedBar);
    fixture.componentRef.setInput('message', 'Added 2 × Boy (Built) to your hoard.');
    fixture.componentRef.setInput('link', '/hoard/minis');
    fixture.componentRef.setInput('linkLabel', 'Show minis');
    fixture.componentRef.setInput('testId', 'add-minis-added');
    await fixture.whenStable();
    const find = (testId: string): HTMLElement | null =>
      (fixture.nativeElement as HTMLElement).querySelector(`[data-testid="${testId}"]`);
    return { fixture, find };
  };

  it('leads to where the added minis are listed', async () => {
    const { find } = await render();

    const show = find('add-minis-added-show');

    expect(show?.textContent?.trim()).toBe('Show minis');
    expect(show?.getAttribute('href')).toBe('/hoard/minis');
  });

  it('hides with its ×', async () => {
    const { fixture, find } = await render();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);

    find('add-minis-added-dismiss')?.click();

    expect(dismissed).toHaveBeenCalledOnce();
  });
});
