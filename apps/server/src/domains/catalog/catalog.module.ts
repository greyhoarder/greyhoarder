import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImportService } from './features/import/import.service.js';
import {
  CatalogFactionDbo,
  CatalogFactionSchema,
  CatalogImportDbo,
  CatalogImportSchema,
  CatalogKitDbo,
  CatalogKitSchema,
  GameSystemDbo,
  GameSystemSchema,
} from './infrastructure/catalog-repository/mongo-catalog-schemas.js';
import { MongoCatalogRepository } from './infrastructure/catalog-repository/mongo-catalog-repository.js';
import { YamlCatalogSnapshotSource } from './infrastructure/catalog-snapshot-source/yaml-catalog-snapshot-source.js';
import { CatalogRepository } from './ports/catalog-repository.js';
import { CatalogSnapshotSource } from './ports/catalog-snapshot-source.js';

/** Kits and factions of the community catalog and their import (ADR-0020). Depends on no other domain. */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameSystemDbo.name, schema: GameSystemSchema },
      { name: CatalogFactionDbo.name, schema: CatalogFactionSchema },
      { name: CatalogKitDbo.name, schema: CatalogKitSchema },
      { name: CatalogImportDbo.name, schema: CatalogImportSchema },
    ]),
  ],
  providers: [
    ImportService,
    { provide: CatalogSnapshotSource, useClass: YamlCatalogSnapshotSource },
    { provide: CatalogRepository, useClass: MongoCatalogRepository },
  ],
})
export class CatalogModule {}
