import type { Part } from '@greyhoarder/domain/hoard';
import type { CatalogKitQueries } from '../../../catalog/api/index.js';
import type { HoardRepository } from '../../ports/hoard-repository.js';
import { PartsService } from './parts.service.js';
import { partialFake } from '../../../../shared/testing/partial-fake.js';

const DEFFGUN: Part = { id: 'deffgun', name: 'Deffgun', aliases: [] };
const GROT_BANNER: Part = { id: 'grot-banner', name: 'Grot Banner', aliases: [] };

describe('Parts service', () => {
  it('tells which terms a catalog kit offers as parts', async () => {
    const hoard = partialFake<HoardRepository>({ findParts: vi.fn(() => Promise.resolve([DEFFGUN, GROT_BANNER])) });

    const catalog = partialFake<CatalogKitQueries>({
      findOfferedPartNames: vi.fn((names: readonly string[]) =>
        Promise.resolve(names.filter((name) => name === 'Deffgun')),
      ),
    });

    const service = new PartsService(hoard, catalog);

    const parts = await service.list('mira');

    expect(parts.map((part) => [part.name, part.isFromCatalog])).toEqual([
      ['Deffgun', true],
      ['Grot Banner', false],
    ]);
  });
});
