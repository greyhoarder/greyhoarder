import { type CustomDecorator, SetMetadata } from '@nestjs/common';
import type { UserRole } from '@greyhoarder/domain/users';

export const REQUIRED_ROLES = 'greyhoarder:required-roles';

/** Marks an endpoint only these roles may use (ADR-0010). */
export function Roles(...roles: readonly UserRole[]): CustomDecorator<string> {
  return SetMetadata(REQUIRED_ROLES, roles);
}
