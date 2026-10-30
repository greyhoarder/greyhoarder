import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mini } from '@greyhoarder/domain/hoard';
import type { MinisResponse } from '@greyhoarder/protocol/hoard';
import { NEVER, type Observable, of, throwError } from 'rxjs';
import { CurrentSession } from '../../../auth/api';
import { DashboardPage } from './dashboard-page';

const ORKS = 'warhammer-40000/orks';
const NECRONS = 'warhammer-40000/necrons';

const mini = (id: string, overrides: Partial<Mini>): Mini => ({
  id,
  name: 'Boy',
  factionIds: [ORKS],
  status: 'sprue',
  parts: [],
  isOnWorkbench: false,
  ...overrides,
});

const HOARD: MinisResponse = {
  minis: [
    mini('m1', {}),
    mini('m2', {}),
    mini('m3', { status: 'painted' }),
    mini('m4', { name: 'Warrior', factionIds: [NECRONS], status: 'done' }),
    mini('m5', { name: 'Spare', factionIds: [] }),
  ],
  factionNames: { [ORKS]: 'Orks', [NECRONS]: 'Necrons' },
  systemNames: { [ORKS]: 'Warhammer 40,000', [NECRONS]: 'Warhammer 40,000' },
};

describe('Dashboard page', () => {
  let fixture: ComponentFixture<DashboardPage>;

  /** A fresh page whose hoard holds what `minis` answers. */
  function showDashboard(minis: Observable<MinisResponse> = of(HOARD)): void {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CurrentSession,
          useValue: { user: signal({ id: '1', username: 'lucas', role: 'admin' }) },
        },
        { provide: HttpClient, useValue: { get: vi.fn(() => minis) } },
      ],
    });
    fixture = TestBed.createComponent(DashboardPage);
  }

  const all = (testId: string): HTMLElement[] => [
    ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`),
  ];
  const textsOf = (testId: string): string[] =>
    all(testId).map((element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  const ofCard = (index: number, testId: string): HTMLElement | null =>
    all('dashboard-hoard-faction')[index]?.querySelector(`[data-testid="${testId}"]`) ?? null;

  it('greets the signed-in user by name', async () => {
    showDashboard();

    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Welcome back, lucas');
  });

  it('says how many minis the hoard holds and how many are painted', async () => {
    showDashboard();

    await fixture.whenStable();

    expect(textsOf('dashboard-hoard-summary')).toEqual(['5 minis · 2 painted']);
  });

  it('shows a card for each faction, most minis first', async () => {
    showDashboard();

    await fixture.whenStable();

    expect(textsOf('dashboard-hoard-faction-name').slice(0, 2)).toEqual(['Orks', 'Necrons']);
  });

  it('says the game system of each faction', async () => {
    showDashboard();

    await fixture.whenStable();

    expect(ofCard(0, 'dashboard-hoard-faction-system')?.textContent?.trim()).toBe('Warhammer 40,000');
  });

  it('shows the minis without a faction on a card of their own, after every faction and without a game system', async () => {
    showDashboard();

    await fixture.whenStable();

    const cards = all('dashboard-hoard-faction');
    const last = cards.length - 1;
    expect(cards).toHaveLength(3);
    expect(ofCard(last, 'dashboard-hoard-faction-dots')?.children).toHaveLength(1);
    expect(ofCard(last, 'dashboard-hoard-faction-system')).toBeNull();
  });

  it('names the share of painted minis of a faction as a percentage', async () => {
    showDashboard();

    await fixture.whenStable();

    expect(ofCard(0, 'dashboard-hoard-faction-percent')?.textContent?.trim()).toBe('33 %');
  });

  it('shows one dot per mini of a faction', async () => {
    showDashboard();

    await fixture.whenStable();

    expect(ofCard(0, 'dashboard-hoard-faction-dots')?.children).toHaveLength(3);
  });

  it('tells screen readers how many minis of a faction have each status', async () => {
    showDashboard();

    await fixture.whenStable();

    expect(ofCard(0, 'dashboard-hoard-faction-dots')?.getAttribute('aria-label')).toBe(
      '2 on the sprue, 0 built, 0 primed, 1 painted, 0 done',
    );
  });

  it('shows placeholders while the hoard loads', () => {
    showDashboard(NEVER);

    fixture.detectChanges();

    expect(all('dashboard-hoard-loading')).toHaveLength(1);
  });

  it('says "Can\'t load your hoard right now. Try again in a moment." when the hoard does not load', async () => {
    showDashboard(throwError(() => new Error('offline')));

    await fixture.whenStable();

    expect(textsOf('dashboard-hoard-error')).toEqual(["Can't load your hoard right now. Try again in a moment."]);
  });

  it('says "No minis yet. Add a box and its minis appear here." when the hoard is empty', async () => {
    showDashboard(of({ minis: [], factionNames: {}, systemNames: {} }));

    await fixture.whenStable();

    expect(textsOf('dashboard-hoard-empty')).toEqual(['No minis yet. Add a box and its minis appear here.']);
  });
});
