import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import {
  faChevronDown,
  faTimesCircle,
  faCheckCircle,
  faComments,
  faTimes,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { UniqueComponentId } from '../fc-input-text/uniquecomponentid';
import CountryCodeList from './country-code.json';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InputTextModule } from 'primeng/inputtext';
import { FcDialogComponent } from '../fc-dialog/fc-dialog.component';

interface Country {
  name: string;
  dial_code: string;
  code: string;
}

@Component({
  selector: 'fc-input-tel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    InputTextModule,
    FcDialogComponent,
  ],
  templateUrl: './fc-input-tel.component.html',
  styleUrl: './fc-input-tel.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FcInputTelComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: FcInputTelComponent,
    },
  ],
})
export class FcInputTelComponent {
  faChevronDown = faChevronDown;
  faTimesCircle = faTimesCircle;
  faCheckCircle = faCheckCircle;
  faComments = faComments;
  faTimes = faTimes;
  faSearch = faSearch;

  @Input() value: string = '';

  countryCode: string = '62';
  countryName: string = 'Indonesia';

  originalCountryCodeList: Country[] = (CountryCodeList as { data: Country[] })
    .data;
  countryCodeList: Country[] = [...this.originalCountryCodeList];

  @Input() title = 'Title';
  @Input() placeholder = '';
  @Input() type = 'tel';
  @Input() inputId = 'textInput';
  @Input() isInvalid: boolean | undefined = false;
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Output() onRemove = new EventEmitter<any>();
  @Input() uniqueId = UniqueComponentId();

  searchQuery = '';

  constructor() {}
  onChange: any = () => {};

  onTouch: any = () => {};

  writeValue(value: any) {
    this.value = value;
    // search country code by value
    if (this.value != null || this.value != undefined) {
      this.setCountrycode();
    }
  }
  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    if (control) {
      setTimeout(() => {
        this.isInvalid = control.invalid && control.touched;
      }, 1);
    }
    return null;
  }
  setCountrycode() {
    this.countryCodeList.find((x: any) => {
      if (this.value.startsWith(x.dial_code)) {
        // remove country code from value
        let newValue = this.value.replace(x.dial_code, '');
        this.value = newValue;
        this.onChangeCountryCode(x);
        return true;
      }
      return false;
    });
  }
  onChangeCountryCode(countryCode: any) {
    this.countryCode = countryCode.dial_code;
    this.countryName = countryCode.name;
    this.onValueChange(this.value);
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

  validateNumber(event: any) {
    let isAllowed = Boolean(event.key.match(/^[0-9]*$/));
    return isAllowed;
  }
  onValueChange(val: any) {
    // generat value like 122-4526-7890
    this.value = val;
    this.onChange(this.countryCode + this.value);
    this.onTouch(this.countryCode + this.value);
  }
  chat() {
    // send message to wa
    window.open('https://wa.me/' + this.countryCode + this.value, '_blank');
  }
  onSearchQueryChange() {
    this.countryCodeList = this.originalCountryCodeList.filter((x) => {
      return (
        x.dial_code.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        x.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        x.code.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    });
  }
}
