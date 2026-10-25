import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** The catalog kit a box was added from, as it was then. */
@Schema({ _id: false })
class BoxKitDbo {
  @Prop({ type: String, required: true })
  kitId: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  sku?: string;
}

/** Stored form of a `Box`; its `_id` is the `Box`'s `id`. */
@Schema({ collection: 'boxes', timestamps: true })
export class BoxDbo {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: SchemaFactory.createForClass(BoxKitDbo) })
  kit?: BoxKitDbo;

  @Prop({ type: [String], required: true })
  factionIds: string[];

  @Prop({ type: [String], required: true })
  tags: string[];

  /** ISO date, e.g. "2026-10-12". */
  @Prop({ type: String, required: true })
  addedOn: string;
}

export const BoxSchema = SchemaFactory.createForClass(BoxDbo);

BoxSchema.index({ ownerId: 1 });
BoxSchema.index({ 'kit.kitId': 1 });
