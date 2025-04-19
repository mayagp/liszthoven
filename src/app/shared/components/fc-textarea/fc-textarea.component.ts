import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  faChevronDown,
  faTimesCircle,
  faCheckCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { UniqueComponentId } from '../fc-input-text/uniquecomponentid';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'fc-textarea',
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './fc-textarea.component.html',
  styleUrl: './fc-textarea.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FcTextareaComponent),
      multi: true,
    },
  ],
})
export class FcTextareaComponent {
  faChevronDown = faChevronDown;
  faTimesCircle = faTimesCircle;
  faCheckCircle = faCheckCircle;
  faTimes = faTimes;

  @Input() value: string = '';

  @Input() title = 'Title';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() inputId = 'textInput';
  @Input() isInvalid: boolean | undefined = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Output() onRemove = new EventEmitter<any>();
  @Input() uniqueId = UniqueComponentId();

  constructor() {}
  onChange: any = () => {};

  onTouch: any = () => {};

  writeValue(value: any) {
    this.value = value;
  }
  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state of your custom control
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
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
      this.onTouch(this.value);
    }
  }
}
