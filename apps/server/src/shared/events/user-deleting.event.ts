/** An account is about to be deleted; those who keep data for it remove it (ADR-0029). */
export class UserDeleting {
  constructor(readonly userId: string) {}
}
