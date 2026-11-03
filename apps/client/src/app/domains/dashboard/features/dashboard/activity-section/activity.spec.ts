import { activityDays, activityMonths, activitySummary, activityYears } from './activity';

const TODAY = new Date(2026, 10, 2);

describe('Activity of the dashboard', () => {
  it('offers the current year and every year with activity, newest first', () => {
    const years = activityYears(
      { days: [{ date: '2024-03-01', steps: 1 }], months: [{ month: '2025-06', entries: [] }] },
      TODAY,
    );

    expect(years).toEqual([2026, 2025, 2024]);
  });

  it('shows a year from the week of January 1 to December 31', () => {
    const days = activityDays([{ date: '2025-06-02', steps: 4 }], 2025);

    expect(days[0]?.date).toBe('2024-12-30');
    expect(days.at(-1)?.date).toBe('2025-12-31');
    expect(days.find((day) => day.date === '2025-06-02')?.steps).toBe(4);
  });

  it('says how many minis reached a status in how many factions', () => {
    const months = activityMonths(
      [
        {
          month: '2026-10',
          entries: [
            {
              kind: 'done',
              count: 27,
              minis: 27,
              rows: [
                { name: 'Orks', minis: 20 },
                { name: 'Necrons', minis: 7 },
              ],
            },
          ],
        },
      ],
      2026,
    );

    expect(months[0]?.entries[0]?.text).toBe('Finished 27 minis in 2 factions');
  });

  it('adds up the boxes and painted minis of the chosen year', () => {
    const summary = activitySummary(
      [
        {
          month: '2026-10',
          entries: [
            { kind: 'painted', count: 12, minis: 12, rows: [] },
            { kind: 'done', count: 3, minis: 3, rows: [] },
            { kind: 'box', count: 2, minis: 30, rows: [] },
          ],
        },
        { month: '2025-10', entries: [{ kind: 'painted', count: 9, minis: 9, rows: [] }] },
      ],
      [],
      2026,
      TODAY,
    );

    expect(summary.slice(0, 2)).toEqual([
      { label: 'Boxes added', value: '2', note: '30 minis' },
      { label: 'Minis painted', value: '12', note: '3 finished' },
    ]);
  });

  it('counts the active days of the days so far of the current year', () => {
    const days = activityDays(
      [
        { date: '2026-01-01', steps: 1 },
        { date: '2026-11-02', steps: 2 },
      ],
      2026,
    );

    const active = activitySummary([], days, 2026, TODAY)[2];

    expect(active).toEqual({ label: 'Active days', value: '2', note: 'of 306' });
  });

  it('finds the longest streak of days in a row', () => {
    const days = activityDays(
      [
        { date: '2025-03-01', steps: 1 },
        { date: '2025-03-03', steps: 1 },
        { date: '2025-03-04', steps: 2 },
        { date: '2025-03-05', steps: 1 },
      ],
      2025,
    );

    const streak = activitySummary([], days, 2025, TODAY)[3];

    expect(streak?.value).toBe('3 days');
  });
});
