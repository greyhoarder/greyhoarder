import { TestBed } from '@angular/core/testing';
import { BoxKind } from './box-kind';

describe('Box kind', () => {
  const render = async (areSprues: boolean): Promise<Element | null> => {
    const fixture = TestBed.createComponent(BoxKind);
    fixture.componentRef.setInput('areSprues', areSprues);
    await fixture.whenStable();
    return (fixture.nativeElement as HTMLElement).querySelector('[data-testid="box-kind"]');
  };

  it('shows the box icon for a box', async () => {
    const icon = await render(false);

    expect(icon?.getAttribute('aria-label')).toBe('Box');
  });

  it('shows the grid icon for sprues', async () => {
    const icon = await render(true);

    expect(icon?.getAttribute('aria-label')).toBe('Sprues');
  });
});
