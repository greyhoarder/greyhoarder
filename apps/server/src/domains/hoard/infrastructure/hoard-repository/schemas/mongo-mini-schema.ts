import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HobbyStatus, hobbyStatuses } from '@greyhoarder/domain/hoard';

/** Stored form of a `MiniPart`. */
@Schema({ _id: false })
export class MiniPartDbo {
  @Prop({ type: String, required: true })
  partId: string;

  @Prop({ type: Boolean, required: true })
  isSwappable: boolean;
}

const MiniPartSchema = SchemaFactory.createForClass(MiniPartDbo);

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

  @Prop({ type: Boolean, required: true })
  isOnWorkbench: boolean;
}

export const MiniSchema = SchemaFactory.createForClass(MiniDbo);

MiniSchema.index({ ownerId: 1 });
MiniSchema.index({ boxId: 1 });
MiniSchema.index({ 'parts.partId': 1 });
