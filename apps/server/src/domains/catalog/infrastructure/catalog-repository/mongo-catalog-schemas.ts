import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Catalog entries are reference data (ADR-0005): each version is a document of its own
// whose content never changes. Only `isLatest` and `isRemoved` move between imports.

@Schema({ _id: false })
class FactionGroupDbo {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;
}

@Schema({ collection: 'catalogSystems', timestamps: true })
export class GameSystemDbo {
  @Prop({ type: String, required: true })
  systemId: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: Boolean, required: true })
  isLatest: boolean;

  @Prop({ type: Boolean, required: true })
  isRemoved: boolean;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [SchemaFactory.createForClass(FactionGroupDbo)], required: true })
  groups: FactionGroupDbo[];
}

@Schema({ collection: 'catalogFactions', timestamps: true })
export class CatalogFactionDbo {
  @Prop({ type: String, required: true })
  factionId: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: Boolean, required: true })
  isLatest: boolean;

  @Prop({ type: Boolean, required: true })
  isRemoved: boolean;

  @Prop({ type: String, required: true })
  systemId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  groupId?: string;

  @Prop({ type: String })
  partOfId?: string;
}

@Schema({ _id: false })
class KitReleaseDbo {
  @Prop({ type: Number })
  year?: number;

  @Prop({ type: String })
  sku?: string;

  @Prop({ type: String })
  barcode?: string;
}

@Schema({ _id: false })
class KitSlotDbo {
  @Prop({ type: Number, required: true })
  count: number;

  @Prop({ type: [String], required: true })
  buildsAs: string[];

  @Prop({ type: [String], required: true })
  parts: string[];

  @Prop({ type: [String], required: true })
  factionIds: string[];
}

@Schema({ _id: false })
class KitVariantDbo {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [SchemaFactory.createForClass(KitSlotDbo)], required: true })
  slots: KitSlotDbo[];
}

@Schema({ _id: false })
class ContainedKitDbo {
  @Prop({ type: String, required: true })
  kitId: string;

  @Prop({ type: Number, required: true })
  count: number;
}

@Schema({ collection: 'catalogKits', timestamps: true })
export class CatalogKitDbo {
  @Prop({ type: String, required: true })
  kitId: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: Boolean, required: true })
  isLatest: boolean;

  @Prop({ type: Boolean, required: true })
  isRemoved: boolean;

  @Prop({ type: String, required: true })
  manufacturer: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [String], required: true })
  factionIds: string[];

  @Prop({ type: [SchemaFactory.createForClass(KitReleaseDbo)], required: true })
  releases: KitReleaseDbo[];

  @Prop({ type: Number, required: true })
  minis: number;

  @Prop({ type: Boolean, required: true })
  isDraft: boolean;

  @Prop({ type: String })
  supersedesId?: string;

  @Prop({ type: [SchemaFactory.createForClass(ContainedKitDbo)], required: true })
  contains: ContainedKitDbo[];

  @Prop({ type: [SchemaFactory.createForClass(KitVariantDbo)], required: true })
  variants: KitVariantDbo[];
}

/** One document per imported snapshot; the newest one is the catalog in the database. */
@Schema({ collection: 'catalogImports', timestamps: true })
export class CatalogImportDbo {
  @Prop({ type: String, required: true })
  snapshotHash: string;
}

export const GameSystemSchema = SchemaFactory.createForClass(GameSystemDbo);
export const CatalogFactionSchema = SchemaFactory.createForClass(CatalogFactionDbo);
export const CatalogKitSchema = SchemaFactory.createForClass(CatalogKitDbo);
export const CatalogImportSchema = SchemaFactory.createForClass(CatalogImportDbo);

GameSystemSchema.index({ systemId: 1, version: 1 }, { unique: true });
GameSystemSchema.index({ isLatest: 1 });
CatalogFactionSchema.index({ factionId: 1, version: 1 }, { unique: true });
CatalogFactionSchema.index({ isLatest: 1 });
CatalogFactionSchema.index({ systemId: 1 });
CatalogFactionSchema.index({ partOfId: 1 });
CatalogKitSchema.index({ kitId: 1, version: 1 }, { unique: true });
CatalogKitSchema.index({ isLatest: 1 });
CatalogKitSchema.index({ factionIds: 1 });
CatalogKitSchema.index({ supersedesId: 1 });
CatalogKitSchema.index({ 'contains.kitId': 1 });
CatalogImportSchema.index({ createdAt: -1 });
