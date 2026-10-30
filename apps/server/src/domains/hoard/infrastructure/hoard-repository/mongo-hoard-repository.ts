import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { type Box, factionKey, type Mini, type OwnFaction, type Part, partKey } from '@greyhoarder/domain/hoard';
import { type ClientSession, type Connection, type Model, mongo } from 'mongoose';
import { NameTakenMeanwhileError } from '../../models/errors/name-taken-meanwhile.error.js';
import type { HoardChange } from '../../models/hoard-change.js';
import { HoardRepository } from '../../ports/hoard-repository.js';
import { BoxDbo } from './schemas/mongo-box-schema.js';
import { MiniDbo } from './schemas/mongo-mini-schema.js';
import { OwnFactionDbo } from './schemas/mongo-own-faction-schema.js';
import { PartDbo } from './schemas/mongo-part-schema.js';

/** Copies only the fields of `Box`, so the owner, `__v` and timestamps never leave this adapter. */
function toBox(stored: BoxDbo, number: number): Box {
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
    number,
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
    number: box.number,
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
    kit: stored.kit && {
      id: stored.kit.kitId,
      version: stored.kit.version,
      name: stored.kit.name,
      sku: stored.kit.sku,
    },
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
    kit: mini.kit && {
      kitId: mini.kit.id,
      version: mini.kit.version,
      name: mini.kit.name,
      sku: mini.kit.sku,
    },
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

const DUPLICATE_KEY = 11000;

function toOwnFaction(stored: OwnFactionDbo): OwnFaction {
  return { id: stored._id, name: stored.name };
}

function toOwnFactionDbo(ownerId: string, faction: OwnFaction): OwnFactionDbo {
  return { _id: faction.id, ownerId, name: faction.name, nameKey: factionKey(faction.name) };
}

/** MongoDB adapter for the hoard: one document per box and per mini (ADR-0019). */
@Injectable()
export class MongoHoardRepository extends HoardRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(BoxDbo.name) private readonly boxes: Model<BoxDbo>,
    @InjectModel(MiniDbo.name) private readonly minis: Model<MiniDbo>,
    @InjectModel(PartDbo.name) private readonly parts: Model<PartDbo>,
    @InjectModel(OwnFactionDbo.name) private readonly ownFactions: Model<OwnFactionDbo>,
  ) {
    super();
  }

  async findBoxes(ownerId: string): Promise<Box[]> {
    const stored = await this.boxes.find({ ownerId }).lean().exec();
    const missing = await this.numberUnnumbered(ownerId, stored);
    return stored.map((box) => toBox(box, box.number ?? missing.get(box._id) ?? 0));
  }

  /**
   * Stands in for a migration (ADR-0023) until migrations exist: boxes stored before boxes were
   * numbered get the next numbers of their name, in the order they were added, and keep them.
   *
   * @returns the numbers given, by box id
   */
  private async numberUnnumbered(
    ownerId: string,
    stored: readonly BoxDbo[],
  ): Promise<ReadonlyMap<string, number>> {
    const unnumbered = stored
      .filter((box) => box.number === undefined)
      .sort((a, b) => a.addedOn.localeCompare(b.addedOn));
    if (unnumbered.length === 0) {
      return new Map();
    }
    const highest = new Map<string, number>();
    for (const { name, number } of stored) {
      if (number !== undefined) {
        highest.set(name, Math.max(highest.get(name) ?? 0, number));
      }
    }
    const given = new Map<string, number>();
    for (const box of unnumbered) {
      const number = (highest.get(box.name) ?? 0) + 1;
      highest.set(box.name, number);
      given.set(box._id, number);
    }
    await this.boxes.bulkWrite(
      [...given].map(([id, number]) => ({
        updateOne: {
          filter: { _id: id, ownerId, number: { $exists: false } },
          update: { $set: { number } },
        },
      })),
    );
    return given;
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

  async findOwnFactions(ownerId: string): Promise<OwnFaction[]> {
    const stored = await this.ownFactions.find({ ownerId }).lean().exec();
    return stored.map(toOwnFaction);
  }

  async updateMinis(ownerId: string, change: HoardChange): Promise<void> {
    await this.connection.transaction(async (session) => {
      await this.insertAdded(ownerId, change, session);
      // Only what a mini's owner can change; box, sprue name and creation stay as they are.
      await this.writeMinis(ownerId, change.changed, session);
      await this.deleteDropped(ownerId, change, session);
    });
  }

  async deleteMinis(ownerId: string, miniIds: readonly string[], change: HoardChange): Promise<void> {
    await this.connection.transaction(async (session) => {
      await this.minis.deleteMany({ ownerId, _id: { $in: miniIds } }, { session });
      await this.writeMinis(ownerId, change.changed, session);
      await this.deleteDropped(ownerId, change, session);
    });
  }

  async deleteBox(ownerId: string, boxId: string, change: HoardChange): Promise<string[]> {
    return this.connection.transaction(async (session) => {
      // Read inside the transaction, so a mini added to the box meanwhile goes with it.
      const minis = await this.minis
        .find({ ownerId, boxId }, { _id: 1 }, { session })
        .lean()
        .exec();
      const miniIds = minis.map((mini) => mini._id);
      await this.minis.deleteMany({ ownerId, boxId }, { session });
      await this.boxes.deleteOne({ ownerId, _id: boxId }, { session });
      await this.writeMinis(ownerId, change.changed, session);
      await this.deleteDropped(ownerId, change, session);
      return miniIds;
    });
  }

  /**
   * Stores the parts and own factions a change added.
   *
   * @throws NameTakenMeanwhileError when another change added one of the names meanwhile
   */
  private async insertAdded(
    ownerId: string,
    { newParts = [], newFactions = [] }: Pick<HoardChange, 'newParts' | 'newFactions'>,
    session: ClientSession,
  ): Promise<void> {
    try {
      if (newParts.length > 0) {
        await this.parts.insertMany(
          newParts.map((part) => toPartDbo(ownerId, part)),
          { session },
        );
      }
      if (newFactions.length > 0) {
        await this.ownFactions.insertMany(
          newFactions.map((faction) => toOwnFactionDbo(ownerId, faction)),
          { session },
        );
      }
    } catch (error) {
      // The unique name keys: no other key of a new part or faction can be taken.
      if (error instanceof mongo.MongoServerError && error.code === DUPLICATE_KEY) {
        throw new NameTakenMeanwhileError();
      }
      throw error;
    }
  }

  /** Deletes the dropped terms and own factions, but none a mini still refers to: they may be carried elsewhere. */
  private async deleteDropped(
    ownerId: string,
    { droppedPartIds, droppedFactionIds }: HoardChange,
    session: ClientSession,
  ): Promise<void> {
    if (droppedPartIds.length > 0) {
      const carriedIds = await this.stillCarried(ownerId, 'parts.partId', droppedPartIds, session);
      await this.parts.deleteMany({ ownerId, _id: { $in: droppedPartIds, $nin: carriedIds } }, { session });
    }
    if (droppedFactionIds.length > 0) {
      const carriedIds = await this.stillCarried(ownerId, 'factionIds', droppedFactionIds, session);
      await this.ownFactions.deleteMany(
        { ownerId, _id: { $in: droppedFactionIds, $nin: carriedIds } },
        { session },
      );
    }
  }

  /** Those of the ids that a mini still has in the field. */
  private async stillCarried(
    ownerId: string,
    field: 'parts.partId' | 'factionIds',
    ids: readonly string[],
    session: ClientSession,
  ): Promise<string[]> {
    const carried: unknown[] = await this.minis
      .distinct(field, { ownerId, [field]: { $in: ids } })
      .session(session)
      .exec();
    return carried.filter((id): id is string => typeof id === 'string');
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

  async addMinis(
    ownerId: string,
    minis: readonly Mini[],
    added: Pick<HoardChange, 'newParts' | 'newFactions'>,
  ): Promise<void> {
    await this.connection.transaction(async (session) => {
      await this.insertAdded(ownerId, added, session);
      await this.minis.insertMany(
        minis.map((mini) => toMiniDbo(ownerId, mini)),
        { session },
      );
    });
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
