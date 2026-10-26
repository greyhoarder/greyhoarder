import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { type Box, type Mini, type Part, partKey } from '@greyhoarder/domain/hoard';
import type { ClientSession, Connection, Model } from 'mongoose';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { BoxDbo } from './schemas/mongo-box-schema.js';
import { MiniDbo } from './schemas/mongo-mini-schema.js';
import { PartDbo } from './schemas/mongo-part-schema.js';

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
    kit: box.kit && {
      kitId: box.kit.id,
      version: box.kit.version,
      name: box.kit.name,
      sku: box.kit.sku,
    },
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
    parts: stored.parts.map(({ partId, isSwappable }) => ({ partId, isSwappable })),
    notes: stored.notes,
    sprueName: stored.sprueName,
    boxId: stored.boxId,
    isOnWorkbench: stored.isOnWorkbench,
    departure: stored.departure && {
      reason: stored.departure.reason,
      on: stored.departure.on,
      recipientMiniIds: stored.departure.recipientMiniIds,
    },
  };
}

function toMiniDbo(ownerId: string, mini: Mini): MiniDbo {
  return {
    _id: mini.id,
    ownerId,
    name: mini.name,
    factionIds: [...mini.factionIds],
    status: mini.status,
    parts: mini.parts.map(({ partId, isSwappable }) => ({ partId, isSwappable })),
    notes: mini.notes,
    sprueName: mini.sprueName,
    boxId: mini.boxId,
    isOnWorkbench: mini.isOnWorkbench,
    departure: mini.departure && {
      reason: mini.departure.reason,
      on: mini.departure.on,
      recipientMiniIds: mini.departure.recipientMiniIds && [...mini.departure.recipientMiniIds],
    },
  };
}

function toPart(stored: PartDbo): Part {
  return { id: stored._id, name: stored.name, aliases: stored.aliases };
}

function toPartDbo(ownerId: string, part: Part): PartDbo {
  return {
    _id: part.id,
    ownerId,
    name: part.name,
    nameKey: partKey(part.name),
    aliases: [...part.aliases],
  };
}

/** MongoDB adapter for the hoard: one document per box and per mini (ADR-0019). */
@Injectable()
export class MongoHoardRepository extends HoardRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(BoxDbo.name) private readonly boxes: Model<BoxDbo>,
    @InjectModel(MiniDbo.name) private readonly minis: Model<MiniDbo>,
    @InjectModel(PartDbo.name) private readonly parts: Model<PartDbo>,
  ) {
    super();
  }

  async findBoxes(ownerId: string): Promise<Box[]> {
    const stored = await this.boxes.find({ ownerId }).lean().exec();
    return stored.map(toBox);
  }

  async findMinis(ownerId: string): Promise<Mini[]> {
    const stored = await this.minis.find({ ownerId }).sort({ updatedAt: 1 }).lean().exec();
    return stored.map(toMini);
  }

  async findMinisByIds(ownerId: string, ids: readonly string[]): Promise<Mini[]> {
    const stored = await this.minis
      .find({ ownerId, _id: { $in: ids } })
      .lean()
      .exec();
    return stored.map(toMini);
  }

  async findParts(ownerId: string): Promise<Part[]> {
    const stored = await this.parts.find({ ownerId }).lean().exec();
    return stored.map(toPart);
  }

  async updateMinis(
    ownerId: string,
    minis: readonly Mini[],
    newParts: readonly Part[],
  ): Promise<void> {
    await this.connection.transaction(async (session) => {
      if (newParts.length > 0) {
        await this.parts.insertMany(
          newParts.map((part) => toPartDbo(ownerId, part)),
          { session },
        );
      }
      // Only what a mini's owner can change; box, sprue name and creation stay as they are.
      await this.writeMinis(ownerId, minis, session);
    });
  }

  async deleteMinis(
    ownerId: string,
    miniIds: readonly string[],
    changed: readonly Mini[],
  ): Promise<void> {
    await this.connection.transaction(async (session) => {
      await this.minis.deleteMany({ ownerId, _id: { $in: miniIds } }, { session });
      await this.writeMinis(ownerId, changed, session);
    });
  }

  async deleteBox(ownerId: string, boxId: string, changed: readonly Mini[]): Promise<string[]> {
    return this.connection.transaction(async (session) => {
      // Read inside the transaction, so a mini added to the box meanwhile goes with it.
      const minis = await this.minis
        .find({ ownerId, boxId }, { _id: 1 }, { session })
        .lean()
        .exec();
      const miniIds = minis.map((mini) => mini._id);
      await this.minis.deleteMany({ ownerId, boxId }, { session });
      await this.boxes.deleteOne({ ownerId, _id: boxId }, { session });
      await this.writeMinis(ownerId, changed, session);
      return miniIds;
    });
  }

  /** Only what a mini's owner can change; box, sprue name and creation stay as they are. */
  private async writeMinis(
    ownerId: string,
    minis: readonly Mini[],
    session: ClientSession,
  ): Promise<void> {
    if (minis.length === 0) {
      return;
    }
    await this.minis.bulkWrite(
      minis.map((mini) => {
        const { name, factionIds, status, parts, notes, isOnWorkbench, departure } = toMiniDbo(
          ownerId,
          mini,
        );
        const unset = {
          ...(notes === undefined ? { notes: '' } : {}),
          ...(departure === undefined ? { departure: '' } : {}),
        };
        return {
          updateOne: {
            filter: { _id: mini.id, ownerId },
            update: {
              $set: {
                name,
                factionIds,
                status,
                parts,
                isOnWorkbench,
                ...(notes === undefined ? {} : { notes }),
                ...(departure === undefined ? {} : { departure }),
              },
              ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
            },
          },
        };
      }),
      { session },
    );
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
