import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FactionsController } from './features/factions/factions.controller.js';
import { FactionsService } from './features/factions/factions.service.js';
import { ImportService } from './features/import/import.service.js';
import { KitsController } from './features/kits/kits.controller.js';
import { KitsService } from './features/kits/kits.service.js';
import { MinisController } from './features/minis/minis.controller.js';
import { MinisService } from './features/minis/minis.service.js';
import { PartsController } from './features/parts/parts.controller.js';
import { PartsService } from './features/parts/parts.service.js';
import {
  CatalogFactionDbo,
  CatalogFactionSchema,
} from './infrastructure/catalog-repository/schemas/mongo-catalog-faction-schema.js';
import {
  CatalogImportDbo,
  CatalogImportSchema,
} from './infrastructure/catalog-repository/schemas/mongo-catalog-import-schema.js';
import {
  CatalogKitDbo,
  CatalogKitSchema,
} from './infrastructure/catalog-repository/schemas/mongo-catalog-kit-schema.js';
import { MongoCatalogRepository } from './infrastructure/catalog-repository/mongo-catalog-repository.js';
import {
  GameSystemDbo,
  GameSystemSchema,
} from './infrastructure/catalog-repository/schemas/mongo-game-system-schema.js';
import { YamlCatalogSnapshotSource } from './infrastructure/catalog-snapshot-source/yaml-catalog-snapshot-source.js';
import { CatalogKitQueries } from './ports/catalog-kit-queries.js';
import { CatalogRepository } from './ports/catalog-repository.js';
import { CatalogSnapshotSource } from './ports/catalog-snapshot-source.js';

/** Kits and factions of the community catalog, their import, the search for kits, minis and factions, and the parts of a range (ADR-0020). Depends on no other domain. */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameSystemDbo.name, schema: GameSystemSchema },
      { name: CatalogFactionDbo.name, schema: CatalogFactionSchema },
      { name: CatalogKitDbo.name, schema: CatalogKitSchema },
      { name: CatalogImportDbo.name, schema: CatalogImportSchema },
    ]),
  ],
  controllers: [KitsController, MinisController, FactionsController, PartsController],
  providers: [
    ImportService,
    KitsService,
    MinisService,
    FactionsService,
    PartsService,
    { provide: CatalogSnapshotSource, useClass: YamlCatalogSnapshotSource },
    MongoCatalogRepository,
    { provide: CatalogRepository, useExisting: MongoCatalogRepository },
    { provide: CatalogKitQueries, useExisting: MongoCatalogRepository },
  ],
  exports: [CatalogKitQueries],
})
export class CatalogModule {}
