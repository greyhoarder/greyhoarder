import { TestBed } from '@angular/core/testing';
import { EitherOrName } from './either-or-name';

describe('Either-or name', () => {
  const render = async (name: string): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(EitherOrName);
    fixture.componentRef.setInput('name', name);
    await fixture.whenStable();
    return fixture.nativeElement;
  };
  const textOf = (element: HTMLElement): string => element.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  it('shows the outcomes of an either-or name apart by a muted "or"', async () => {
    const name = await render('Lootas / Burna Boyz (2008)');

    expect(textOf(name)).toBe('Lootas or Burna Boyz (2008)');
    expect([...name.querySelectorAll('[data-separator]')].map((separator) => separator.textContent?.trim())).toEqual([
      'or',
    ]);
  });

  it('shows any other name as it is', async () => {
    const name = await render('Boyz (2026)');

    expect(textOf(name)).toBe('Boyz (2026)');
    expect(name.querySelectorAll('[data-separator]')).toHaveLength(0);
  });
});
