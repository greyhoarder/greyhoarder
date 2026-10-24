import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Catalog entries are reference data (ADR-0005): each version is a document of its own
// whose content never changes. Only `isLatest` and `isRemoved` move between imports.

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

export const CatalogFactionSchema = SchemaFactory.createForClass(CatalogFactionDbo);

CatalogFactionSchema.index({ factionId: 1, version: 1 }, { unique: true });
CatalogFactionSchema.index({ isLatest: 1 });
CatalogFactionSchema.index({ systemId: 1 });
CatalogFactionSchema.index({ partOfId: 1 });
