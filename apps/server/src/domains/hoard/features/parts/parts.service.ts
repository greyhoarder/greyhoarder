import { Injectable } from '@nestjs/common';
import type { Part } from '@greyhoarder/domain/hoard';
import { HoardRepository } from '../../ports/hoard-repository.js';

/** The signed-in user's vocabulary of parts (docs/domains/hoard.md, Parts). */
@Injectable()
export class PartsService {
  constructor(private readonly hoard: HoardRepository) {}

  list(ownerId: string): Promise<Part[]> {
    return this.hoard.findParts(ownerId);
  }
}
