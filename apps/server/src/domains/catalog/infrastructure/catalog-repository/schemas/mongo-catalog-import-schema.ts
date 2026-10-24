import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** One document per imported snapshot; the newest one is the catalog in the database. */
@Schema({ collection: 'catalogImports', timestamps: true })
export class CatalogImportDbo {
  @Prop({ type: String, required: true })
  snapshotHash: string;
}

export const CatalogImportSchema = SchemaFactory.createForClass(CatalogImportDbo);

CatalogImportSchema.index({ createdAt: -1 });
