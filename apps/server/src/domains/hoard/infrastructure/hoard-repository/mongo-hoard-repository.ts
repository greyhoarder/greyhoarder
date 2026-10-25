import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Box, Mini } from '@greyhoarder/domain/hoard';
import type { Connection, Model } from 'mongoose';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { BoxDbo } from './schemas/mongo-box-schema.js';
import { MiniDbo } from './schemas/mongo-mini-schema.js';

/** Copies only the fields of `Box`, so the owner, `__v` and timestamps never leave this adapter. */
function toBox(stored: BoxDbo): Box {
  return {
    id: stored._id,
    name: stored.name,
    kit: stored.kit && {
      id: stored.kit.kitId,
      version: stored.kit.version,
      name: stored.kit.name,
      sku: stored.kit.sku,
    },
    factionIds: stored.factionIds,
    tags: stored.tags,
    addedOn: stored.addedOn,
  };
}

function toBoxDbo(ownerId: string, box: Box): BoxDbo {
  return {
    _id: box.id,
    ownerId,
    name: box.name,
    kit: box.kit && { kitId: box.kit.id, version: box.kit.version, name: box.kit.name, sku: box.kit.sku },
    factionIds: [...box.factionIds],
    tags: [...box.tags],
    addedOn: box.addedOn,
  };
}

function toMini(stored: MiniDbo): Mini {
  return {
    id: stored._id,
    name: stored.name,
    factionIds: stored.factionIds,
    status: stored.status,
    parts: stored.parts,
    boxId: stored.boxId,
    isOnWorkbench: stored.isOnWorkbench,
  };
}

function toMiniDbo(ownerId: string, mini: Mini): MiniDbo {
  return {
    _id: mini.id,
    ownerId,
    name: mini.name,
    factionIds: [...mini.factionIds],
    status: mini.status,
    parts: [...mini.parts],
    boxId: mini.boxId,
    isOnWorkbench: mini.isOnWorkbench,
  };
}

/** MongoDB adapter for the hoard: one document per box and per mini (ADR-0019). */
@Injectable()
export class MongoHoardRepository extends HoardRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(BoxDbo.name) private readonly boxes: Model<BoxDbo>,
    @InjectModel(MiniDbo.name) private readonly minis: Model<MiniDbo>,
  ) {
    super();
  }

  async findBoxes(ownerId: string): Promise<Box[]> {
    const stored = await this.boxes.find({ ownerId }).lean().exec();
    return stored.map(toBox);
  }

  async findMinis(ownerId: string): Promise<Mini[]> {
    const stored = await this.minis.find({ ownerId }).lean().exec();
    return stored.map(toMini);
  }

  async addBoxes(ownerId: string, boxes: readonly Box[], minis: readonly Mini[]): Promise<void> {
    await this.connection.transaction(async (session) => {
      await this.boxes.insertMany(
        boxes.map((box) => toBoxDbo(ownerId, box)),
        { session },
      );
      await this.minis.insertMany(
        minis.map((mini) => toMiniDbo(ownerId, mini)),
        { session },
      );
    });
  }
}
