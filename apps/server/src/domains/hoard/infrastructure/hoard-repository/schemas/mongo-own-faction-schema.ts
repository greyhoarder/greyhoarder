import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Stored form of an `OwnFaction`; its `_id` is the faction's `id`. */
@Schema({ collection: 'ownFactions', timestamps: true })
export class OwnFactionDbo {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, required: true })
  name: string;

  /** The name in the form that tells factions apart (`factionKey`). */
  @Prop({ type: String, required: true })
  nameKey: string;
}

export const OwnFactionSchema = SchemaFactory.createForClass(OwnFactionDbo);

OwnFactionSchema.index({ ownerId: 1, nameKey: 1 }, { unique: true });
