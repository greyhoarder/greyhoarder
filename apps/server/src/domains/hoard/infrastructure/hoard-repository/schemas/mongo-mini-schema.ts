import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type DepartureReason, departureReasons, type HobbyStatus, hobbyStatuses } from '@greyhoarder/domain/hoard';
import { BoxKitDbo } from './mongo-box-schema.js';

/** Stored form of a `MiniPart`. */
@Schema({ _id: false })
export class MiniPartDbo {
  @Prop({ type: String, required: true })
  partId: string;

  @Prop({ type: Boolean, required: true })
  isSwappable: boolean;
}

const MiniPartSchema = SchemaFactory.createForClass(MiniPartDbo);

/** Stored form of a `Departure`. */
@Schema({ _id: false })
export class DepartureDbo {
  @Prop({ type: String, required: true, enum: [...departureReasons] })
  reason: DepartureReason;

  @Prop({ type: String, required: true })
  on: string;

  @Prop({ type: [String] })
  recipientMiniIds?: string[];
}

const DepartureSchema = SchemaFactory.createForClass(DepartureDbo);
const KitSchema = SchemaFactory.createForClass(BoxKitDbo);

/** Stored form of a `Mini`; its `_id` is the `Mini`'s `id`. */
@Schema({ collection: 'minis', timestamps: true })
export class MiniDbo {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [String], required: true })
  factionIds: string[];

  @Prop({ type: String, required: true, enum: [...hobbyStatuses] })
  status: HobbyStatus;

  @Prop({ type: [MiniPartSchema], required: true })
  parts: MiniPartDbo[];

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  sprueName?: string;

  @Prop({ type: String })
  boxId?: string;

  @Prop({ type: KitSchema })
  kit?: BoxKitDbo;

  @Prop({ type: Boolean, required: true })
  isOnWorkbench: boolean;

  @Prop({ type: DepartureSchema })
  departure?: DepartureDbo;
}

export const MiniSchema = SchemaFactory.createForClass(MiniDbo);

MiniSchema.index({ ownerId: 1 });
MiniSchema.index({ boxId: 1 });
MiniSchema.index({ 'kit.kitId': 1 });
MiniSchema.index({ 'parts.partId': 1 });
MiniSchema.index({ factionIds: 1 });
MiniSchema.index({ 'departure.recipientMiniIds': 1 });
