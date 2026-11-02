import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from '../catalog/api/index.js';
import { ActivityController } from './features/activity/activity.controller.js';
import { ActivityService } from './features/activity/activity.service.js';
import { BoxesController } from './features/boxes/boxes.controller.js';
import { BoxesService } from './features/boxes/boxes.service.js';
import { MinisController } from './features/minis/minis.controller.js';
import { MinisService } from './features/minis/minis.service.js';
import { UserDeletingListener } from './features/owner/listeners/user-deleting.listener.js';
import { PartsController } from './features/parts/parts.controller.js';
import { PartsService } from './features/parts/parts.service.js';
import { MongoHoardRepository } from './infrastructure/hoard-repository/mongo-hoard-repository.js';
import { BoxDbo, BoxSchema } from './infrastructure/hoard-repository/schemas/mongo-box-schema.js';
import { MiniStepDbo, MiniStepSchema } from './infrastructure/hoard-repository/schemas/mongo-mini-step-schema.js';
import { MiniDbo, MiniSchema } from './infrastructure/hoard-repository/schemas/mongo-mini-schema.js';
import { OwnFactionDbo, OwnFactionSchema } from './infrastructure/hoard-repository/schemas/mongo-own-faction-schema.js';
import { PartDbo, PartSchema } from './infrastructure/hoard-repository/schemas/mongo-part-schema.js';
import { HoardRepository } from './ports/hoard-repository.js';

/** Each user's boxes, minis, vocabulary of parts and own factions (ADR-0019). Depends only on `catalog`, for the kits boxes are added from. */
@Module({
  imports: [
    CatalogModule,
    MongooseModule.forFeature([
      { name: BoxDbo.name, schema: BoxSchema },
      { name: MiniDbo.name, schema: MiniSchema },
      { name: MiniStepDbo.name, schema: MiniStepSchema },
      { name: PartDbo.name, schema: PartSchema },
      { name: OwnFactionDbo.name, schema: OwnFactionSchema },
    ]),
  ],
  controllers: [ActivityController, BoxesController, MinisController, PartsController],
  providers: [
    ActivityService,
    BoxesService,
    MinisService,
    PartsService,
    UserDeletingListener,
    { provide: HoardRepository, useClass: MongoHoardRepository },
  ],
})
export class HoardModule {}
