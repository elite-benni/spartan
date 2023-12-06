import { FocusMonitor } from '@angular/cdk/a11y';
import { NgStyle } from '@angular/common';
import {
	AfterContentInit,
	booleanAttribute,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	computed,
	effect,
	ElementRef,
	EventEmitter,
	forwardRef,
	HostBinding,
	inject,
	Input,
	OnDestroy,
	Output,
	Renderer2,
	signal,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { rxHostPressedListener } from '@spartan-ng/ui-core';

export const BRN_checkbox_VALUE_ACCESSOR = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => BrnCheckboxComponent),
	multi: true,
};

function indeterminateBooleanAttribute(value: unknown): boolean | 'indeterminate' {
	if (value === 'indeterminate') return 'indeterminate';
	return booleanAttribute(value);
}

const CONTAINER_POST_FIX = '-checkbox';

@Component({
	selector: 'brn-checkbox',
	standalone: true,
	imports: [NgStyle],
	template: `
		<input
			#checkBox
			tabindex="-1"
			type="checkbox"
			role="checkbox"
			class="sr-only"
			[id]="forChild(_id()) ?? ''"
			[name]="forChild(_name()) ?? ''"
			[value]="_value()"
			[checked]="isChecked()"
			[attr.aria-label]="ariaLabel"
			[attr.aria-labelledby]="ariaLabelledby"
			[attr.aria-describedby]="ariaDescribedby"
			[attr.aria-required]="required || null"
			[attr.aria-checked]="_ariaChecked()"
		/>
		<ng-content />
	`,
	host: {
		tabindex: '0',
		'[attr.data-state]': '_dataState()',
		'[attr.data-focus-visible]': 'focusVisible()',
		'[attr.data-focus]': 'focused()',
		'[attr.data-disabled]': '_disabled()',
		'[attr.aria-labelledby]': 'null',
		'[attr.aria-label]': 'null',
		'[attr.aria-describedby]': 'null',
		'[attr.id]': '_id()',
		'[attr.name]': '_name()',
	},
	providers: [BRN_checkbox_VALUE_ACCESSOR],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class BrnCheckboxComponent implements AfterContentInit, OnDestroy {
	private _renderer = inject(Renderer2);
	private _elementRef = inject(ElementRef);
	private _focusMonitor = inject(FocusMonitor);
	private _cdr = inject(ChangeDetectorRef);

	public focusVisible = signal(false);
	public focused = signal(false);

	protected _dataState = computed(() => {
		if (this._checked() === 'indeterminate') return 'indeterminate';
		return this._checked() ? 'checked' : 'unchecked';
	});
	protected _ariaChecked = computed(() => {
		if (this._checked() === 'indeterminate') return 'mixed';
		return this._checked() ? 'true' : 'false';
	});
	protected _value = computed(() => {
		if (this._checked() === 'indeterminate') return '';
		return this._checked() ? 'on' : 'off';
	});

	private readonly _checked = signal<boolean | 'indeterminate'>(false);
	public readonly isChecked = this._checked.asReadonly();

	@Input({ transform: indeterminateBooleanAttribute })
	set checked(value: boolean | 'indeterminate') {
		this._checked.set(value);
	}

	/** Used to set the id on the underlying input element. */

	protected readonly _id = signal<string | null>(null);
	@Input()
	set id(value: string | null) {
		if (!value) return;
		this._id.set(value + CONTAINER_POST_FIX);
	}

	/** Used to set the name attribute on the underlying input element. */
	protected readonly _name = signal<string | null>(null);
	@Input()
	set name(value: string | null) {
		if (!value) return;
		this._name.set(value + CONTAINER_POST_FIX);
	}

	/** Used to set the aria-label attribute on the underlying input element. */
	@Input('aria-label')
	ariaLabel: string | null = null;

	/** Used to set the aria-labelledby attribute on the underlying input element. */
	@Input('aria-labelledby')
	ariaLabelledby: string | null = null;

	/** Used to set the aria-describedby attribute on the underlying input element. */
	@HostBinding('attr.aria-describedby')
	private _ariaDescribedby: string | null = null;

	@Input('aria-describedby')
	ariaDescribedby: string | null = null;

	private _required = false;
	@Input({ transform: booleanAttribute })
	get required(): boolean {
		return this._required;
	}

	set required(value: boolean) {
		this._required = value;
	}

	protected readonly _disabled = signal(false);
	@Input({ transform: booleanAttribute })
	set disabled(value: boolean) {
		this._disabled.set(value);
	}

	get disabled() {
		return this._disabled();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars,,@typescript-eslint/no-explicit-any
	protected _onChange = (_: any) => {};
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private _onTouched = () => {};

	@ViewChild('checkBox', { static: true })
	public checkbox?: ElementRef<HTMLInputElement>;

	@Output()
	public changed = new EventEmitter<boolean | 'indeterminate'>();

	constructor() {
		rxHostPressedListener().subscribe(() => this.handleChange());
		effect(() => {
			const parent = this._renderer.parentNode(this._elementRef.nativeElement);
			if (!parent) return;
			// check if parent is a label and assume it is for this checkbox
			if (parent?.tagName === 'LABEL') {
				this._renderer.setAttribute(parent, 'data-disabled', this._disabled() ? 'true' : 'false');
				return;
			}
			const label = parent?.querySelector(`label[for="${this.forChild(this._id())}"]`);
			if (!label) return;
			this._renderer.setAttribute(label, 'data-disabled', this._disabled() ? 'true' : 'false');
		});
	}

	handleChange() {
		if (this._disabled()) return;
		const previousChecked = this._checked();
		if (!this.checkbox) return;
		this._checked.set(!previousChecked);
		this._onChange(!previousChecked);
		this.changed.emit(!previousChecked);
	}

	ngAfterContentInit() {
		this._focusMonitor.monitor(this._elementRef, true).subscribe((focusOrigin) => {
			if (focusOrigin) this.focused.set(true);
			if (focusOrigin === 'keyboard' || focusOrigin === 'program') {
				this.focusVisible.set(true);
				this._cdr.markForCheck();
			}
			if (!focusOrigin) {
				// When a focused element becomes disabled, the browser *immediately* fires a blur event.
				// Angular does not expect events to be raised during change detection, so any state
				// change (such as a form control's ng-touched) will cause a changed-after-checked error.
				// See https://github.com/angular/angular/issues/17793. To work around this, we defer
				// telling the form control it has been touched until the next tick.
				Promise.resolve().then(() => {
					this.focusVisible.set(false);
					this.focused.set(false);
					this._onTouched();
					this._cdr.markForCheck();
				});
			}
		});

		if (!this.checkbox) return;

		this.checkbox.nativeElement.indeterminate = this._checked() === 'indeterminate';
		if (this.checkbox.nativeElement.indeterminate) {
			this.checkbox.nativeElement.value = 'indeterminate';
		} else {
			this.checkbox.nativeElement.value = this._checked() ? 'on' : 'off';
		}
		this.checkbox.nativeElement.dispatchEvent(new Event('change'));
	}

	ngOnDestroy() {
		this._focusMonitor.stopMonitoring(this._elementRef);
	}

	forChild(parentValue: string | null | undefined): string | null {
		return parentValue ? parentValue.replace(CONTAINER_POST_FIX, '') : null;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	writeValue(value: any): void {
		if (value === 'indeterminate') {
			this.checked = 'indeterminate';
		} else {
			this.checked = !!value;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	registerOnChange(fn: any): void {
		this._onChange = fn;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	registerOnTouched(fn: any): void {
		this._onTouched = fn;
	}

	/** Implemented as a part of ControlValueAccessor. */
	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
		this._cdr.markForCheck();
	}
}