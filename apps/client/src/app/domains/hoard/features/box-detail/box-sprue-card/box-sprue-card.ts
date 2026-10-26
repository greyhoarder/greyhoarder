import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideEllipsisVertical } from '@ng-icons/lucide';
import { provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { MiniEditor } from '../../../data/mini-editor';
import type { MiniRow } from '../../../data/mini-row';
import { BuildAs } from '../../../ui/build-as/build-as';
import { BuildBar } from '../../../ui/build-bar/build-bar';
import { DeletePanel } from '../../../ui/delete-panel/delete-panel';
import { EitherOrName } from '../../../ui/either-or-name/either-or-name';
import { type Leaving, LeavePanel } from '../../../ui/leave-panel/leave-panel';
import { PartTiles } from '../../../ui/part-tiles/part-tiles';
import { minisLabel } from '../../../util/kit-labels';

/** What an open card on the sprue shows. */
export type SpruePanel = 'build' | 'leave' | 'delete';

/** Tells the cards' panels apart for `aria-controls`. */
let nextId = 0;

/**
 * A row of alike minis of a box still on the sprue: opened, it builds as many of them as chosen;
 * its menu lets them leave the hoard or deletes them (docs/screens/box.md). Has its own editor, so
 * what was chosen goes when the card closes.
 */
@Component({
  selector: 'app-box-sprue-card',
  imports: [
    NgIcon,
    HlmButton,
    HlmPopoverImports,
    EitherOrName,
    BuildAs,
    PartTiles,
    BuildBar,
    LeavePanel,
    DeletePanel,
  ],
  providers: [
    MiniEditor,
    provideIcons({ lucideChevronDown, lucideEllipsisVertical }),
    // The row menu is a menu, not a dialog; its list carries the role.
    provideBrnPopoverDefaultOptions({ role: undefined }),
  ],
  templateUrl: './box-sprue-card.html',
  host: {
    class: 'block rounded-xl border bg-card',
    '[attr.data-testid]': '"box-sprue"',
  },
})
export class BoxSprueCard {
  readonly row = input.required<MiniRow>();
  /** The open panel; closed without one. */
  readonly panel = input<SpruePanel>();
  /** Opened with a panel, or closed. */
  readonly panelChange = output<SpruePanel | undefined>();
  /** Deleted minis left these boxes without any minis; the boxes stay. */
  readonly boxesEmptied = output<readonly string[]>();

  protected readonly editor = inject(MiniEditor);
  private readonly injector = inject(Injector);
  private readonly toggleButton = viewChild<ElementRef<HTMLElement>>('toggleButton');
  private readonly menuButton = viewChild<ElementRef<HTMLElement>>('menuButton');
  private readonly panelElement = viewChild<ElementRef<HTMLElement>>('panelElement');

  protected readonly panelId = `box-sprue-${nextId++}-panel`;
  protected readonly minisLabel = minisLabel;
  protected readonly menuItems = [
    { panel: 'leave', label: 'Leave the hoard…', testId: 'box-sprue-leave', isDestructive: false },
    { panel: 'delete', label: 'Delete…', testId: 'box-sprue-delete', isDestructive: true },
  ] as const;

  protected readonly isPickerOpen = signal(false);
  protected readonly isLeaving = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly partsHint = computed(() =>
    !this.editor.partsChanged() && this.editor.parts().length > 0
      ? `Preselected for ${this.editor.buildName()} — change what you actually built`
      : 'What is physically on this mini',
  );

  constructor() {
    this.editor.withAlike.set(true);
    effect(() => this.editor.miniId.set(this.row().id));
  }

  protected toggle(): void {
    this.panelChange.emit(this.panel() === undefined ? 'build' : undefined);
  }

  /** Moves the focus into the open panel, e.g. after "Take from the sprue". */
  focusPanel(): void {
    afterNextRender(
      () => this.panelElement()?.nativeElement.querySelector<HTMLElement>('button, input')?.focus(),
      { injector: this.injector },
    );
  }

  protected choose(panel: SpruePanel): void {
    this.isPickerOpen.set(false);
    this.panelChange.emit(panel);
  }

  /** Back to the row menu button when a menu panel closes, to the card's header otherwise. */
  protected close(): void {
    const button = this.panel() === 'build' ? this.toggleButton() : this.menuButton();
    this.panelChange.emit(undefined);
    button?.nativeElement.focus();
  }

  protected async build(): Promise<void> {
    await this.editor.build();
    if (this.editor.saveState() !== 'failed') {
      this.panelChange.emit(undefined);
    }
  }

  protected async leave({ departure, count }: Leaving): Promise<void> {
    this.isLeaving.set(true);
    const hasLeft = await this.editor.leave(departure, count);
    this.isLeaving.set(false);
    if (hasLeft) {
      this.panelChange.emit(undefined);
    }
  }

  protected async delete(count: number): Promise<void> {
    this.isDeleting.set(true);
    const { isDeleted, emptiedBoxIds } = await this.editor.delete(count);
    this.isDeleting.set(false);
    if (isDeleted) {
      this.panelChange.emit(undefined);
    }
    if (emptiedBoxIds.length > 0) {
      this.boxesEmptied.emit(emptiedBoxIds);
    }
  }
}
