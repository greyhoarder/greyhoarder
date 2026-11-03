import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { ActivityDay, ActivityMonth, ActivitySummaryRow } from './activity';
import { ActivitySection } from './activity-section';

const month = (id: string): ActivityMonth => ({
  id,
  name: id,
  year: '2026',
  entries: [
    {
      id,
      kind: 'painted',
      text: 'Painted 2 minis in 2 factions',
      rows: [
        { name: 'Orks', count: '1 mini', link: '/hoard/minis' },
        { name: 'Boyz', count: '1 mini', link: '/hoard/boxes/b1' },
      ],
    },
  ],
});

describe('Activity section', () => {
  const render = async (
    days: readonly ActivityDay[],
    months: readonly ActivityMonth[] = [],
    summary: readonly ActivitySummaryRow[] = [],
  ) => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ActivitySection);
    fixture.componentRef.setInput('days', days);
    fixture.componentRef.setInput('months', months);
    fixture.componentRef.setInput('summary', summary);
    fixture.componentRef.setInput('years', [2026, 2025]);
    fixture.componentRef.setInput('year', 2025);
    await fixture.whenStable();
    const section: HTMLElement = fixture.nativeElement;
    const all = (testId: string) => [...section.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`)];

    const click = async (element: HTMLElement | undefined): Promise<void> => {
      element?.click();
      await fixture.whenStable();
    };

    return { fixture, section, all, click };
  };

  it('says the number of steps of a day', async () => {
    const { all } = await render([{ date: '2026-11-02', steps: 7 }]);

    expect(all('dashboard-activity-day')[0]?.querySelector('title')?.textContent).toBe('7 steps on 2026-11-02');
  });

  it('shades a busier day darker', async () => {
    const { all } = await render([
      { date: '2026-11-01', steps: 1 },
      { date: '2026-11-02', steps: 4 },
    ]);

    const [quiet, busy] = all('dashboard-activity-day');

    expect(quiet?.classList.contains('fill-primary/25')).toBe(true);
    expect(busy?.classList.contains('fill-primary')).toBe(true);
  });

  it('says that there is no activity yet', async () => {
    const { all } = await render([{ date: '2026-11-02', steps: 0 }]);

    expect(all('dashboard-activity-empty')[0]?.textContent?.trim()).toBe(
      'No activity yet. Steps show up here from now on.',
    );
  });

  it('lists a row per army or box once an entry is opened, each as a link', async () => {
    const { section, all, click } = await render([], [month('November')]);
    await click(all('dashboard-activity-more')[0]);
    const closed = all('dashboard-activity-row').length;

    await click(all('dashboard-activity-toggle')[0]);

    const links = [...section.querySelectorAll('[data-testid="dashboard-activity-row"] a')];

    expect(closed).toBe(0);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/hoard/minis', '/hoard/boxes/b1']);
  });

  it('shows no activity at first and one more entry with each "Show more activity"', async () => {
    const { all, click } = await render([], ['A', 'B', 'C', 'D', 'E'].map(month));
    const first = all('dashboard-activity-entry').length;

    await click(all('dashboard-activity-more')[0]);
    const second = all('dashboard-activity-entry').length;
    await click(all('dashboard-activity-more')[0]);

    expect([first, second, all('dashboard-activity-entry').length]).toEqual([0, 1, 2]);
  });

  it('says the total of the chosen year', async () => {
    const { all } = await render([{ date: '2025-03-01', steps: 3 }]);

    expect(all('dashboard-activity-total')[0]?.textContent?.trim()).toBe('3 minis moved a step in 2025');
  });

  it('tells which year was chosen', async () => {
    const { fixture, all } = await render([]);
    const chosen = vi.fn();
    fixture.componentInstance.yearChosen.subscribe(chosen);

    all('dashboard-activity-year')[0]?.click();

    expect(chosen).toHaveBeenCalledExactlyOnceWith(2026);
  });

  it('shows a tile for each figure of the summary', async () => {
    const { all } = await render(
      [],
      [],
      [
        { label: 'Boxes added', value: '2', note: '30 minis' },
        { label: 'Active days', value: '4', note: 'of 306' },
      ],
    );

    const tiles = all('dashboard-activity-summary');

    expect(tiles.map((tile) => [...tile.children].map((part) => part.textContent?.trim()))).toEqual([
      ['Boxes added', '2', '30 minis'],
      ['Active days', '4', 'of 306'],
    ]);
  });
});
