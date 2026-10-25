import { findPart, type Part } from './part.js';

const POWER_KLAW: Part = { id: 'power-klaw', name: 'Power Klaw', aliases: ['Power Claw'] };
const PARTS: Part[] = [{ id: 'slugga', name: 'Slugga', aliases: [] }, POWER_KLAW];

describe('Parts', () => {
  it('finds a part by its name, ignoring case', () => {
    const part = findPart(PARTS, 'power klaw');

    expect(part).toBe(POWER_KLAW);
  });

  it('finds a part by one of its aliases', () => {
    const part = findPart(PARTS, 'Power Claw');

    expect(part).toBe(POWER_KLAW);
  });

  it('finds no part for text that is only part of a name', () => {
    const part = findPart(PARTS, 'Klaw');

    expect(part).toBeUndefined();
  });
});
