import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'greyhoarder:is-public';

/** Marks an endpoint that works without a session (ADR-0010). */
export function Public(): CustomDecorator<string> {
  return SetMetadata(IS_PUBLIC, true);
}
