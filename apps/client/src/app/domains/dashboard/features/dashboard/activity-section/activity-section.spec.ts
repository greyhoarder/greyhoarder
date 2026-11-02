import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { ActivityDay, ActivityMonth } from './activity';
import { ActivitySection } from './activity-section';

const month = (title: string): ActivityMonth => ({
  title,
  entries: [
    {
      id: title,
      kind: 'painted',
      text: 'Painted 2 minis',
      detail: '· Orks',
      items: [
        { id: 'm1', name: 'Boy', link: '/hoard/minis/m1' },
        { id: 'm2', name: 'Nob', link: '/hoard/minis/m2' },
      ],
    },
  ],
});

describe('Activity section', () => {
  const render = async (days: readonly ActivityDay[], months: readonly ActivityMonth[] = []) => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ActivitySection);
    fixture.componentRef.setInput('days', days);
    fixture.componentRef.setInput('months', months);
    await fixture.whenStable();
    const section: HTMLElement = fixture.nativeElement;
    const all = (testId: string) => [...section.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`)];

    const click = async (element: HTMLElement | undefined): Promise<void> => {
      element?.click();
      await fixture.whenStable();
    };

    return { section, all, click };
  };

  it('says the number of steps of a day', async () => {
    const { all } = await render([{ date: '2026-11-02', steps: 7 }]);

    expect(all('dashboard-activity-day')[0]?.title).toBe('7 steps on 2026-11-02');
  });

  it('shades a busier day darker', async () => {
    const { all } = await render([
      { date: '2026-11-01', steps: 1 },
      { date: '2026-11-02', steps: 4 },
    ]);

    const [quiet, busy] = all('dashboard-activity-day');
    expect(quiet?.className).toContain('bg-primary/25');
    expect(busy?.classList.contains('bg-primary')).toBe(true);
  });

  it('says that there is no activity yet', async () => {
    const { all } = await render([{ date: '2026-11-02', steps: 0 }]);

    expect(all('dashboard-activity-empty')[0]?.textContent?.trim()).toBe(
      'No activity yet. Steps show up here from now on.',
    );
  });

  it('lists the minis of a line once it is opened, each as a link', async () => {
    const { section, all, click } = await render([], [month('November 2026')]);
    const closed = section.querySelectorAll('a').length;

    await click(all('dashboard-activity-entry')[0]);

    expect(closed).toBe(0);
    expect([...section.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      '/hoard/minis/m1',
      '/hoard/minis/m2',
    ]);
  });

  it('shows two more months with "Show more activity"', async () => {
    const { all, click } = await render([], ['A', 'B', 'C', 'D', 'E'].map(month));
    const first = all('dashboard-activity-month').length;

    await click(all('dashboard-activity-more')[0]);

    expect([first, all('dashboard-activity-month').length]).toEqual([2, 4]);
  });
});
