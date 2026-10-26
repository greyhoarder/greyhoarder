import { type Mini, withDeparture } from '@greyhoarder/domain/hoard';

/**
 * The staying minis whose departure named deleted minis as recipients of their parts, without
 * them: deleted minis disappear from the recipients of others (docs/domains/hoard.md, Leaving the
 * hoard).
 */
export function withoutDeletedRecipients(
  staying: readonly Mini[],
  deleted: ReadonlySet<string>,
): Mini[] {
  return staying.flatMap((mini) => {
    const { departure } = mini;
    const recipients = departure?.recipientMiniIds;
    if (
      departure === undefined ||
      recipients === undefined ||
      !recipients.some((id) => deleted.has(id))
    ) {
      return [];
    }
    return [
      withDeparture(mini, {
        ...departure,
        recipientMiniIds: recipients.filter((id) => !deleted.has(id)),
      }),
    ];
  });
}

/** The boxes of the deleted minis that have no minis left, gone ones included (docs/domains/hoard.md, Boxes and kits). */
export function emptiedBoxIds(deleted: readonly Mini[], staying: readonly Mini[]): string[] {
  const boxIds = new Set(deleted.flatMap((mini) => mini.boxId ?? []));
  return [...boxIds].filter((boxId) => !staying.some((mini) => mini.boxId === boxId));
}
