import { afterNextRender, Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';
import { type Departure, type DepartureReason, departureReasons } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { eitherOrText } from '../../util/either-or';
import { DEPARTURE_LABELS } from '../../util/status-labels';
import { today } from '../../util/today';
import { CountStepper } from '../count-stepper/count-stepper';
import { EitherOrName } from '../either-or-name/either-or-name';

/** How many minis to offer as recipients at once; the filter finds the rest. */
const MAX_CHOICES = 12;

/** Tells the panels apart for their labels. */
let nextId = 0;

/** A mini that can get the parts of a mini stripped for them. */
export interface RecipientChoice {
  readonly id: string;
  readonly name: string;
  /** The name of its box; none without a box. */
  readonly box?: string;
}

/** What the user chose: the departure and how many minis of the row leave. */
export interface Leaving {
  readonly departure: Departure;
  readonly count: number;
}

/**
 * Lets minis leave the hoard: why, when, for a row how many and, when stripped for parts, which
 * minis got them (docs/screens/mini.md, Leaving the hoard).
 */
@Component({
  selector: 'app-leave-panel',
  imports: [NgIcon, HlmButton, CountStepper, EitherOrName],
  providers: [provideIcons({ lucideSearch, lucideX })],
  templateUrl: './leave-panel.html',
  host: {
    class: 'flex flex-col gap-4 rounded-xl border bg-card p-4',
    role: 'region',
    '[attr.aria-labelledby]': 'headingId',
    'data-testid': 'mini-leave-panel',
  },
})
export class LeavePanel {
  /** How many minis the row has; the stepper shows only for more than one. */
  readonly rowSize = input(1);
  readonly recipientChoices = input.required<readonly RecipientChoice[]>();
  readonly isLeaving = input(false);
  readonly left = output<Leaving>();
  /** Cancelled. */
  readonly closed = output();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly headingId = `leave-panel-${nextId++}-heading`;
  protected readonly eitherOrText = eitherOrText;
  protected readonly recipientsLabelId = `${this.headingId}-recipients`;
  protected readonly reasons = departureReasons.map((reason) => ({
    reason,
    label: DEPARTURE_LABELS[reason],
  }));
  protected readonly reason = signal<DepartureReason | undefined>(undefined);
  protected readonly date = signal(today());
  protected readonly count = signal(1);
  protected readonly recipients = signal<readonly RecipientChoice[]>([]);
  protected readonly query = signal('');

  protected readonly choices = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const chosen = new Set(this.recipients().map((recipient) => recipient.id));
    return this.recipientChoices()
      .filter((choice) => !chosen.has(choice.id) && eitherOrText(choice.name).toLowerCase().includes(needle))
      .slice(0, MAX_CHOICES);
  });

  constructor() {
    afterNextRender(() =>
      this.host.nativeElement.querySelector<HTMLElement>('[data-testid="mini-leave-reason"]')?.focus(),
    );
  }

  protected changeCount(by: number): void {
    this.count.update((count) => Math.min(this.rowSize(), Math.max(1, count + by)));
  }

  protected typeDate(event: Event): void {
    if (event.target instanceof HTMLInputElement && event.target.value !== '') {
      this.date.set(event.target.value);
    }
  }

  protected typeQuery(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.query.set(event.target.value);
    }
  }

  protected addRecipient(choice: RecipientChoice): void {
    this.recipients.update((recipients) => [...recipients, choice]);
    this.query.set('');
  }

  protected removeRecipient(id: string): void {
    this.recipients.update((recipients) => recipients.filter((recipient) => recipient.id !== id));
  }

  protected leave(): void {
    const reason = this.reason();
    if (reason === undefined) {
      return;
    }
    const recipientMiniIds = this.recipients().map((recipient) => recipient.id);
    this.left.emit({
      departure: {
        reason,
        on: this.date(),
        ...(reason === 'stripped' && recipientMiniIds.length > 0 ? { recipientMiniIds } : {}),
      },
      count: this.count(),
    });
  }
}
