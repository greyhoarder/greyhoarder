import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Catalog entries are reference data (ADR-0005): each version is a document of its own
// whose content never changes. Only `isLatest` and `isRemoved` move between imports.

@Schema({ _id: false })
class FactionGroupDbo {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;
}

@Schema({ collection: 'catalogSystems', timestamps: true })
export class GameSystemDbo {
  @Prop({ type: String, required: true })
  systemId: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: Boolean, required: true })
  isLatest: boolean;

  @Prop({ type: Boolean, required: true })
  isRemoved: boolean;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [SchemaFactory.createForClass(FactionGroupDbo)], required: true })
  groups: FactionGroupDbo[];
}

export const GameSystemSchema = SchemaFactory.createForClass(GameSystemDbo);

GameSystemSchema.index({ systemId: 1, version: 1 }, { unique: true });
GameSystemSchema.index({ isLatest: 1 });
