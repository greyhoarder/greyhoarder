import type { Part } from '@greyhoarder/domain/hoard';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import type { HoardRepository } from '../../ports/hoard-repository.js';
import { PartsService } from './parts.service.js';

const DEFFGUN: Part = { id: 'deffgun', name: 'Deffgun', aliases: [] };
const GROT_BANNER: Part = { id: 'grot-banner', name: 'Grot Banner', aliases: [] };

describe('Parts service', () => {
  it('tells which terms a catalog kit offers as parts', async () => {
    const hoard = { findParts: vi.fn(() => Promise.resolve([DEFFGUN, GROT_BANNER])) } as unknown as HoardRepository;
    const catalog = {
      findOfferedPartNames: vi.fn((names: readonly string[]) =>
        Promise.resolve(names.filter((name) => name === 'Deffgun')),
      ),
    } as unknown as CatalogKitQueries;
    const service = new PartsService(hoard, catalog);

    const parts = await service.list('mira');

    expect(parts.map((part) => [part.name, part.isFromCatalog])).toEqual([
      ['Deffgun', true],
      ['Grot Banner', false],
    ]);
  });
});
