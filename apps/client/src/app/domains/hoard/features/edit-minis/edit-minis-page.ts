import { Component, computed, effect, ElementRef, inject, input, signal, viewChildren } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { HobbyStatus } from '@greyhoarder/domain/hoard';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideDroplet, lucideMagnet, lucidePlus, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { FactionSearch } from '../../application/faction-search';
import { MinisChangedNotice } from '../../application/minis/minis-changed-notice';
import { MinisList } from '../../application/minis/minis-list';
import { AddFaction } from '../../ui/add-faction/add-faction';
import { PartPicker } from '../../ui/part-picker/part-picker';
import { StatusChoice } from '../../ui/status-choice/status-choice';
import { SeveralMinisEditor, type WorkbenchChoice } from './several-minis-editor';

/** Minis are built on their box, so the page offers the statuses past the sprue. */
const STATUSES: readonly HobbyStatus[] = ['built', 'primed', 'painted', 'done'];

const WORKBENCH_CHOICES: readonly { readonly value: WorkbenchChoice; readonly label: string }[] = [
  { value: 'keep', label: 'Keep' },
  { value: 'put-on', label: 'Put on' },
  { value: 'take-off', label: 'Take off' },
];

/**
 * Several selected minis changed in one go: status, workbench, factions and parts, applied together
 * and only what the user touched. Specified in docs/screens/edit-minis.md.
 */
@Component({
  selector: 'app-edit-minis-page',
  imports: [RouterLink, NgIcon, HlmButton, HlmSkeleton, StatusChoice, AddFaction, PartPicker],
  providers: [
    SeveralMinisEditor,
    FactionSearch,
    provideIcons({ lucideChevronLeft, lucideDroplet, lucideMagnet, lucidePlus, lucideX }),
  ],
  templateUrl: './edit-minis-page.html',
  host: { class: 'flex w-full flex-col gap-6 p-4 sm:p-8 lg:p-10' },
})
export class EditMinisPage {
  /** From the query: the ids of the selected minis, joined with commas. */
  readonly ids = input('');
  /** From the query: the box the minis were selected on; without it, the hoard. */
  readonly box = input<string>();

  protected readonly editor = inject(SeveralMinisEditor);
  protected readonly factionSearch = inject(FactionSearch);
  private readonly minisList = inject(MinisList);
  private readonly changedNotice = inject(MinisChangedNotice);
  private readonly router = inject(Router);
  private readonly workbenchOptions = viewChildren<ElementRef<HTMLButtonElement>>('workbenchOption');

  protected readonly statuses = STATUSES;
  protected readonly workbenchChoices = WORKBENCH_CHOICES;
  protected readonly isPickerOpen = signal(false);

  /** Back to where the minis were selected. */
  protected readonly back = computed(() => {
    const box = this.box();

    return box === undefined
      ? { link: ['/hoard/minis'], label: 'Hoard' }
      : { link: ['/hoard/boxes', box], label: 'Box' };
  });

  /** E.g. "2 of 5 on the workbench". */
  protected readonly workbenchNow = computed(() => {
    const onIt = this.editor.onWorkbenchCount();
    const count = this.editor.count();

    if (onIt === 0) {
      return 'None on the workbench';
    }

    return onIt === count ? 'All on the workbench' : `${onIt} of ${count} on the workbench`;
  });

  constructor() {
    effect(() =>
      this.editor.ids.set(
        this.ids()
          .split(',')
          .filter((id) => id !== ''),
      ),
    );
  }

  protected chooseFaction(faction: { readonly id: string; readonly name: string }): void {
    this.editor.addFaction(faction);
    this.factionSearch.close();
  }

  protected createFaction(name: string): void {
    this.editor.createFaction(name);
    this.factionSearch.close();
  }

  /** Chooses the next or previous workbench choice, wrapping around, and moves the focus to it. */
  protected moveWorkbench(event: Event, by: 1 | -1): void {
    event.preventDefault();
    const choices = this.workbenchChoices;

    const index =
      (choices.findIndex((choice) => choice.value === this.editor.workbench()) + by + choices.length) % choices.length;

    const next = choices[index];

    if (next !== undefined) {
      this.editor.workbench.set(next.value);
      this.workbenchOptions()[index]?.nativeElement.focus();
    }
  }

  /** Leads back to where the minis were selected, which then says how many were changed. */
  protected async apply(): Promise<void> {
    const count = this.editor.count();

    if (!(await this.editor.apply())) {
      return;
    }

    const boxId = this.box();

    if (boxId === undefined) {
      this.minisList.finishSelecting();
    }

    this.changedNotice.tell({ count, boxId });
    void this.router.navigate(this.back().link, { replaceUrl: true });
  }

  /** Leaves without changing anything. */
  protected cancel(): void {
    void this.router.navigate(this.back().link);
  }
}
