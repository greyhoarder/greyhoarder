import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** `_id` of the only marker document. */
export const INITIAL_ADMIN_MARKER_ID = 'initial-admin';

/**
 * Written in the same transaction as the first administrator. Concurrent
 * setups then collide on its `_id` instead of each creating an admin.
 */
@Schema({ collection: 'initialAdminMarkers', timestamps: true })
export class InitialAdminMarkerDbo {
  @Prop({ type: String, required: true })
  _id: string;
}

export const InitialAdminMarkerSchema = SchemaFactory.createForClass(InitialAdminMarkerDbo);
