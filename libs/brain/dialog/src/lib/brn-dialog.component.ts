import { OverlayPositionBuilder, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
	booleanAttribute,
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	type EffectRef,
	inject,
	Injector,
	input,
	numberAttribute,
	output,
	runInInjectionContext,
	signal,
	type TemplateRef,
	untracked,
	ViewContainerRef,
	ViewEncapsulation,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { type BrnDialogOptions, DEFAULT_BRN_DIALOG_OPTIONS } from './brn-dialog-options';
import type { BrnDialogRef } from './brn-dialog-ref';
import type { BrnDialogState } from './brn-dialog-state';
import { injectBrnDialogDefaultOptions } from './brn-dialog-token';
import { BrnDialogService } from './brn-dialog.service';

@Component({
	selector: 'brn-dialog',
	standalone: true,
	template: `
		<ng-content />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	exportAs: 'brnDialog',
})
export class BrnDialogComponent {
	private readonly _dialogService = inject(BrnDialogService);
	private readonly _vcr = inject(ViewContainerRef);
	public readonly positionBuilder = inject(OverlayPositionBuilder);
	public readonly ssos = inject(ScrollStrategyOptions);
	private readonly _injector = inject(Injector);

	protected readonly _defaultOptions = injectBrnDialogDefaultOptions();

	private _context = {};
	public readonly stateComputed = computed(() => this._dialogRef()?.state() ?? 'closed');

	private _contentTemplate: TemplateRef<unknown> | undefined;
	private readonly _dialogRef = signal<BrnDialogRef | undefined>(undefined);
	private _dialogStateEffectRef?: EffectRef;
	private readonly _backdropClass = signal<string | null | undefined>(null);
	private readonly _panelClass = signal<string | null | undefined>(null);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public readonly closed = output<any>();

	public readonly stateChanged = output<BrnDialogState>();

	public readonly state = input<BrnDialogState | null>(null);

	public readonly role = input<BrnDialogOptions['role']>('dialog');

	public readonly hasBackdrop = input(true, { transform: booleanAttribute });
	protected readonly _mutableHasBackdrop = computed(() => signal(this.hasBackdrop()));
	protected readonly _hasBackdropState = computed(() => this._mutableHasBackdrop()());

	public readonly positionStrategy = input<BrnDialogOptions['positionStrategy']>();
	public readonly mutablePositionStrategy = computed(() => signal(this.positionStrategy()));
	private readonly _positionStrategyState = computed(() => this.mutablePositionStrategy()());

	public readonly scrollStrategy = input<BrnDialogOptions['scrollStrategy'] | 'close' | 'reposition' | null>(
		// this._defaultOptions.scrollStrategy ?? null,
		null,
	);

	protected _options = computed<Partial<BrnDialogOptions>>(() => {
		const scrollStrategyInput = this.scrollStrategy();
		let scrollStrategy: ScrollStrategy | null | undefined;

		if (scrollStrategyInput === 'close') {
			scrollStrategy = this.ssos.close();
		} else if (scrollStrategyInput === 'reposition') {
			scrollStrategy = this.ssos.reposition();
		} else {
			scrollStrategy = scrollStrategyInput;
		}

		return {
			...DEFAULT_BRN_DIALOG_OPTIONS,
			role: this.role(),
			hasBackdrop: this._hasBackdropState(),
			positionStrategy: this._positionStrategyState(),
			scrollStrategy,
			restoreFocus: this.restoreFocus(),
			closeOnOutsidePointerEvents: this._closeOnOutsidePointerEventsState(),
			closeOnBackdropClick: this.closeOnBackdropClick(),
			attachTo: this._attachToState(),
			attachPositions: this._attachPositionsState(),
			autoFocus: this.autoFocus(),
			closeDelay: 100,
			disableClose: this.disableClose(),
			backdropClass: this._backdropClass() ?? '',
			panelClass: this._panelClass() ?? '',
			ariaDescribedBy: this._ariaDescribedByState(),
			ariaLabelledBy: this._ariaLabelledByState(),
			ariaLabel: this._ariaLabelState(),
			ariaModal: this._ariaModalState(),
		};
	});

	constructor() {
		effect(() => {
			const state = this.state();
			console.log('state EFFECT', state);
			if (state === 'open') {
				untracked(() => this.open());
			}
			if (state === 'closed') {
				untracked(() => this.close(this._options().closeDelay));
			}
		});
	}

	public readonly restoreFocus = input<BrnDialogOptions['restoreFocus']>(true);

	public readonly closeOnOutsidePointerEvents = input(false, {
		transform: booleanAttribute,
	});
	public readonly mutableCloseOnOutsidePointerEvents = computed(() => signal(this.closeOnOutsidePointerEvents()));
	private readonly _closeOnOutsidePointerEventsState = computed(() => this.mutableCloseOnOutsidePointerEvents()());
	// this._defaultOptions.closeOnBackdropClick
	public readonly closeOnBackdropClick = input(false, {
		transform: booleanAttribute,
	});

	public readonly attachTo = input<BrnDialogOptions['attachTo']>(null);
	public readonly mutableAttachTo = computed(() => signal(this.attachTo()));
	private readonly _attachToState = computed(() => this.mutableAttachTo()());

	public readonly attachPositions = input<BrnDialogOptions['attachPositions']>([]);
	public readonly mutableAttachPositions = computed(() => signal(this.attachPositions()));
	private readonly _attachPositionsState = computed(() => this.mutableAttachPositions()());

	public readonly autoFocus = input<BrnDialogOptions['autoFocus']>('first-tabbable');
	// this._defaultOptions.closeDelay
	public readonly closeDelay = input(100, {
		alias: 'closeDelay',
		transform: numberAttribute,
	});
	// public readonly closeDelayState = computed(() => signal(this.closeDelayInput()));
	// public readonly closeDelay = computed(() => this.closeDelayState()());

	public readonly disableClose = input(false, { transform: booleanAttribute });

	public readonly ariaDescribedBy = input<BrnDialogOptions['ariaDescribedBy']>(null, {
		alias: 'aria-describedby',
	});
	private readonly _mutableAriaDescribedBy = computed(() => signal(this.ariaDescribedBy()));
	private readonly _ariaDescribedByState = computed(() => this._mutableAriaDescribedBy()());

	public readonly ariaLabelledBy = input<BrnDialogOptions['ariaLabelledBy']>(null, { alias: 'aria-labelledby' });
	private readonly _mutableAriaLabelledBy = computed(() => signal(this.ariaLabelledBy()));
	private readonly _ariaLabelledByState = computed(() => this._mutableAriaLabelledBy()());

	public readonly ariaLabel = input<BrnDialogOptions['ariaLabel']>(null, { alias: 'aria-label' });
	private readonly _mutableAriaLabel = computed(() => signal(this.ariaLabel()));
	private readonly _ariaLabelState = computed(() => this._mutableAriaLabel()());

	public readonly ariaModal = input(true, {
		alias: 'aria-modal',
		transform: booleanAttribute,
	});
	private readonly _mutableAriaModal = computed(() => signal(this.ariaModal()));
	private readonly _ariaModalState = computed(() => this._mutableAriaModal()());

	public open<DialogContext>() {
		console.log('open', this._contentTemplate, this._dialogRef(), this._options());
		if (!this._contentTemplate || this._dialogRef()) return;

		this._dialogStateEffectRef?.destroy();

		const dialogRef = this._dialogService.open<DialogContext>(
			this._contentTemplate,
			this._vcr,
			this._context as DialogContext,
			this._options(),
		);

		this._dialogRef.set(dialogRef);

		runInInjectionContext(this._injector, () => {
			this._dialogStateEffectRef = effect(() => {
				const state = dialogRef.state();
				console.log('state changed emit', state);
				untracked(() => this.stateChanged.emit(state));
			});
		});

		dialogRef.closed$.pipe(take(1)).subscribe((result) => {
			console.log('closed', result);
			this._dialogRef.set(undefined);
			this.closed.emit(result);
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public close(result: any, delay?: number) {
		this._dialogRef()?.close(result, delay ?? this._options().closeDelay);
		console.log('close', result, delay ?? this._options().closeDelay);
	}

	public registerTemplate(template: TemplateRef<unknown>) {
		this._contentTemplate = template;
	}

	public setOverlayClass(overlayClass: string | null | undefined) {
		this._backdropClass.set(overlayClass);
		this._dialogRef()?.setOverlayClass(overlayClass);
	}

	public setPanelClass(panelClass: string | null | undefined) {
		this._panelClass.set(panelClass ?? '');
		this._dialogRef()?.setPanelClass(panelClass);
	}

	public setContext(context: unknown) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		this._context = { ...this._context, ...context };
	}

	public setAriaDescribedBy(ariaDescribedBy: string | null | undefined) {
		this._mutableAriaDescribedBy().set(ariaDescribedBy);
		this._dialogRef()?.setAriaDescribedBy(ariaDescribedBy);
	}

	public setAriaLabelledBy(ariaLabelledBy: string | null | undefined) {
		this._mutableAriaLabelledBy().set(ariaLabelledBy);
		this._dialogRef()?.setAriaLabelledBy(ariaLabelledBy);
	}

	public setAriaLabel(ariaLabel: string | null | undefined) {
		this._mutableAriaLabel().set(ariaLabel);
		this._dialogRef()?.setAriaLabel(ariaLabel);
	}

	public setAriaModal(ariaModal: boolean) {
		this._mutableAriaModal().set(ariaModal);
	}
}
