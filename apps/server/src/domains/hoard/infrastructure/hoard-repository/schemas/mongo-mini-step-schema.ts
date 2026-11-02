import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { StepStatus } from '@greyhoarder/domain/hoard';

/** Stored form of a `MiniStep`; its `_id` is `<miniId>/<status>`, so a mini reaches a status once. */
@Schema({ collection: 'miniSteps' })
export class MiniStepDbo {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, required: true })
  miniId: string;

  @Prop({ type: String, required: true })
  status: StepStatus;

  @Prop({ type: String, required: true })
  on: string;
}

export const MiniStepSchema = SchemaFactory.createForClass(MiniStepDbo);

MiniStepSchema.index({ ownerId: 1, on: 1 });
MiniStepSchema.index({ miniId: 1 });
