import { ChangeDetectionStrategy, Component, forwardRef, Input, signal, ViewEncapsulation } from '@angular/core';
import { BrnDialogComponent } from '@spartan-ng/brain/dialog';

@Component({
	selector: 'brn-sheet',
	standalone: true,
	template: `
		<ng-content />
	`,
	providers: [
		{
			provide: BrnDialogComponent,
			useExisting: forwardRef(() => BrnSheetComponent),
		},
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	exportAs: 'brnSheet',
})
export class BrnSheetComponent extends BrnDialogComponent {
	private readonly _side = signal<'top' | 'bottom' | 'left' | 'right'>('top');
	public readonly side = this._side.asReadonly();

	/* eslint-disable-next-line @angular-eslint/no-input-rename */
	@Input('side')
	public set setSide(side: 'top' | 'bottom' | 'left' | 'right') {
		this._side.set(side);
		if (side === 'top') {
			this.positionStrategyState().set(this.positionBuilder.global().top());
		}
		if (side === 'bottom') {
			this.positionStrategyState().set(this.positionBuilder.global().bottom());
		}
		if (side === 'left') {
			this.positionStrategyState().set(this.positionBuilder.global().left());
		}
		if (side === 'right') {
			this.positionStrategyState().set(this.positionBuilder.global().right());
		}
	}
}
