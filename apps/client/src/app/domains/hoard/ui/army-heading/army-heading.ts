import { booleanAttribute, Component, computed, input } from '@angular/core';
import { minisLabel } from '../../util/kit-labels';

/** The heading above the minis of one army, in a box or kit of several. */
@Component({
  selector: 'app-army-heading',
  template: `<h3
    class="text-sm font-medium tracking-wide text-muted-foreground"
    [class.border-b]="hasLine()"
    [class.pb-1.5]="hasLine()"
    data-testid="army-heading"
  >
    {{ army() }} · {{ minis() }}
  </h3>`,
})
export class ArmyHeading {
  readonly army = input.required<string>();
  readonly count = input.required<number>();
  /** A line below it, in the add form; the box shows none. */
  readonly hasLine = input(false, { transform: booleanAttribute });

  protected readonly minis = computed(() => minisLabel(this.count()));
}
