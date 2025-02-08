import { ChangeDetectionStrategy, Component, forwardRef, ViewEncapsulation } from '@angular/core';
import { BrnDialogComponent, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';

@Component({
	selector: 'brn-alert-dialog',
	standalone: true,
	template: `
		<ng-content />
	`,
	providers: [
		{
			provide: BrnDialogComponent,
			useExisting: forwardRef(() => BrnAlertDialogComponent),
		},
		provideBrnDialogDefaultOptions({
			closeOnBackdropClick: false,
			role: 'alertdialog',
		}),
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	exportAs: 'brnAlertDialog',
})
export class BrnAlertDialogComponent extends BrnDialogComponent {
	constructor() {
		super();
		this.mutableCloseOnOutsidePointerEvents().set(false);
	}
}
