import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Stored form of a `Part`; its `_id` is the part's `id`. */
@Schema({ collection: 'parts', timestamps: true })
export class PartDbo {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, required: true })
  name: string;

  /** The name in the form that tells parts apart (`partKey`). */
  @Prop({ type: String, required: true })
  nameKey: string;

  @Prop({ type: [String], required: true })
  aliases: string[];
}

export const PartSchema = SchemaFactory.createForClass(PartDbo);

PartSchema.index({ ownerId: 1, nameKey: 1 }, { unique: true });
