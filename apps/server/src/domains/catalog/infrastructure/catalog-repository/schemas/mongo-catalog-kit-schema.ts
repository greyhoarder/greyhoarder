import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Catalog entries are reference data (ADR-0005): each version is a document of its own
// whose content never changes. Only `isLatest` and `isRemoved` move between imports.

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

export const CatalogKitSchema = SchemaFactory.createForClass(CatalogKitDbo);

CatalogKitSchema.index({ kitId: 1, version: 1 }, { unique: true });
CatalogKitSchema.index({ isLatest: 1 });
CatalogKitSchema.index({ factionIds: 1 });
CatalogKitSchema.index({ supersedesId: 1 });
CatalogKitSchema.index({ 'contains.kitId': 1 });
