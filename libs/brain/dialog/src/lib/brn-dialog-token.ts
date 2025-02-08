import { inject, InjectionToken, ValueProvider } from '@angular/core';
import { BrnDialogOptions } from './brn-dialog-options';

export interface BrnDialogDefaultOptions {
	/** Whether the dialog should close when the backdrop is clicked. */
	closeOnBackdropClick?: boolean;
	/** The delay in milliseconds before the dialog closes. */
	closeDelay?: number;
	/** The role of the dialog. */
	role?: 'dialog' | 'alertdialog';
	/** The scroll strategy to use for the dialog. */
	scrollStrategy?: BrnDialogOptions['scrollStrategy'] | 'close' | 'reposition' | null;
}

export const defaultOptions: BrnDialogDefaultOptions = {
	closeOnBackdropClick: true,
	closeDelay: 0,
	role: 'dialog',
	scrollStrategy: null,
};

const BRN_DIALOG_DEFAULT_OPTIONS = new InjectionToken<BrnDialogDefaultOptions>('brn-dialog-default-options', {
	providedIn: 'root',
	factory: () => defaultOptions,
});

export function provideBrnDialogDefaultOptions(options: Partial<BrnDialogDefaultOptions>): ValueProvider {
	return { provide: BRN_DIALOG_DEFAULT_OPTIONS, useValue: { ...defaultOptions, ...options } };
}

export function injectBrnDialogDefaultOptions(): BrnDialogDefaultOptions {
	return inject(BRN_DIALOG_DEFAULT_OPTIONS, { optional: true }) ?? defaultOptions;
}
