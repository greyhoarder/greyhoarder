import type { HobbyStatus } from '@greyhoarder/domain/hoard';

/**
 * The color of each hobby status, from grey plastic to gold like the logo's shield: grey getting
 * lighter towards primed, gold once painted. For dots, bars and filled surfaces.
 */
export const STATUS_COLORS: Readonly<Record<HobbyStatus, string>> = {
  sprue: 'bg-muted',
  built: 'bg-muted-foreground/40',
  primed: 'bg-muted-foreground/70',
  painted: 'bg-primary/60',
  done: 'bg-primary',
};

/** Text that reads on a surface of the status's color. */
export const STATUS_TEXT_COLORS: Readonly<Record<HobbyStatus, string>> = {
  sprue: 'text-foreground',
  built: 'text-foreground',
  primed: 'text-background',
  painted: 'text-primary-foreground',
  done: 'text-primary-foreground',
};
