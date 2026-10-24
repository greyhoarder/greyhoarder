import { TestBed } from '@angular/core/testing';
import { KitCard } from './kit-card';

describe('Kit card', () => {
  it('marks a kit that is not yet checked against a box as "Not checked"', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/boyz-2026',
      name: 'Boyz',
      names: ['Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [],
      minis: 11,
      contains: [],
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="add-box-kit-draft"]')
        ?.textContent,
    ).toBe('Not checked');
  });

  it('shows every name of an either-or kit, e.g. "Lootas or Burna Boyz"', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/lootas-2008',
      name: 'Lootas',
      names: ['Lootas', 'Burna Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [],
      minis: 5,
      contains: [],
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[data-testid="add-box-kit-name"]')
        ?.textContent?.replace(/\s+/g, ' ')
        .trim(),
    ).toBe('Lootas or Burna Boyz');
  });

  it('shows how many builds an either-or kit offers', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/lootas-2008',
      name: 'Lootas',
      names: ['Lootas', 'Burna Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [
        { name: 'Lootas', slots: [], minis: 5 },
        { name: 'Burna Boyz', slots: [], minis: 5 },
      ],
      minis: 5,
      contains: [],
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[data-testid="add-box-kit-builds"]')
        ?.textContent?.trim(),
    ).toBe('2 builds');
  });

  it('shows no builds for a kit with one variant', async () => {
    const fixture = TestBed.createComponent(KitCard);
    fixture.componentRef.setInput('factionNames', new Map([['warhammer-40000/orks', 'Orks']]));
    fixture.componentRef.setInput('kit', {
      id: 'games-workshop/orks/boyz-2026',
      name: 'Boyz',
      names: ['Boyz'],
      manufacturer: 'games-workshop',
      factionIds: ['warhammer-40000/orks'],
      isDraft: true,
      variants: [{ name: 'Boyz', slots: [], minis: 11 }],
      minis: 11,
      contains: [],
    });

    await fixture.whenStable();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="add-box-kit-builds"]'),
    ).toBeNull();
  });
});
