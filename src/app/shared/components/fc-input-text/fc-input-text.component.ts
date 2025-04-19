import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  Validator,
  AbstractControl,
  ValidationErrors,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faTimesCircle,
  faCheckCircle,
  faEye,
  faEyeLowVision,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { UniqueComponentId } from './uniquecomponentid';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'fc-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, InputTextModule],
  templateUrl: './fc-input-text.component.html',
  styleUrl: './fc-input-text.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FcInputTextComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: FcInputTextComponent,
    },
  ],
})
export class FcInputTextComponent implements ControlValueAccessor, Validator {
  faChevronDown = faChevronDown;
  faTimesCircle = faTimesCircle;
  faCheckCircle = faCheckCircle;
  faEye = faEye;
  faEyeLowVision = faEyeLowVision;
  faTimes = faTimes;

  @Input() value: string = '';

  @Input() title = 'Title';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() inputId = 'textInput';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Output() onRemove = new EventEmitter<any>();
  @Input() uniqueId = UniqueComponentId();

  @Input() isInvalid = false;

  constructor() {}

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    if (control) {
      setTimeout(() => {
        this.isInvalid = control.invalid && control.touched;
      }, 1);
    }
    return null;
  }

  ngOnInit() {}
  ngOnChanges() {
    this.writeValue(this.value);
  }

  onChange: any = () => {};

  onTouch: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }
  onRemoveValue() {
    this.onValueChange(null);
    this.onRemove.emit(null);
  }
  onValueChange(val: any) {
    if (val !== undefined) {
      this.value = val;
      this.onChange(this.value);
      this.onTouch();
    }
  }
}
