import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from '../catalog/api/index.js';
import { BoxesController } from './features/boxes/boxes.controller.js';
import { BoxesService } from './features/boxes/boxes.service.js';
import { MinisController } from './features/minis/minis.controller.js';
import { MinisService } from './features/minis/minis.service.js';
import { MongoHoardRepository } from './infrastructure/hoard-repository/mongo-hoard-repository.js';
import { BoxDbo, BoxSchema } from './infrastructure/hoard-repository/schemas/mongo-box-schema.js';
import { MiniDbo, MiniSchema } from './infrastructure/hoard-repository/schemas/mongo-mini-schema.js';
import { HoardRepository } from './ports/hoard-repository.js';

/** Each user's boxes and minis (ADR-0019). Depends only on `catalog`, for the kits boxes are added from. */
@Module({
  imports: [
    CatalogModule,
    MongooseModule.forFeature([
      { name: BoxDbo.name, schema: BoxSchema },
      { name: MiniDbo.name, schema: MiniSchema },
    ]),
  ],
  controllers: [BoxesController, MinisController],
  providers: [BoxesService, MinisService, { provide: HoardRepository, useClass: MongoHoardRepository }],
})
export class HoardModule {}
