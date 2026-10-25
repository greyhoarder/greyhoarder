import { InvalidMiniError } from './errors/invalid-mini.error.js';
import { type Mini, parseMini } from './mini.js';

function boy(mini: Partial<Mini> = {}): Mini {
  return {
    id: '1',
    name: 'Boy',
    factionIds: ['warhammer-40000/orks'],
    status: 'sprue',
    parts: [],
    isOnWorkbench: false,
    ...mini,
  };
}

describe('Mini', () => {
  it('refuses a mini without a name', () => {
    const parse = () => parseMini(boy({ name: '  ' }));

    expect(parse).toThrow(InvalidMiniError);
  });

  it('accepts a mini without a faction', () => {
    const parse = () => parseMini(boy({ factionIds: [] }));

    expect(parse).not.toThrow();
  });

  it('keeps the name without surrounding spaces', () => {
    const mini = parseMini(boy({ name: ' Boy ' }));

    expect(mini.name).toBe('Boy');
  });
});
