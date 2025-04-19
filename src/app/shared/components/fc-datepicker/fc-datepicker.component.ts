import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule } from '@angular/forms';
import { faCalendarDay, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { LayoutService } from '../../../layout/services/layout.service';
import { UniqueComponentId } from '../fc-input-text/uniquecomponentid';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FcDatepickerDialogComponent } from './fc-datepicker-dialog/fc-datepicker-dialog.component';

@Component({
  selector: 'fc-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    OverlayPanelModule,
    FormsModule,
    CalendarModule,
    DialogModule,
  ],
  templateUrl: './fc-datepicker.component.html',
  styleUrl: './fc-datepicker.component.css',
})
export class FcDatepickerComponent implements ControlValueAccessor {
  faCalendarDay = faCalendarDay;
  faTimes = faTimes;

  @Input() title = '';

  @Input() type: 'single' | 'range' = 'single';
  @Input() inputType: 'text' | 'button' = 'text';
  @Input() placeholder = 'Select Date';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() uniqueId = UniqueComponentId();

  @Input() isInvalid = false;

  @Output() onSelectDate = new EventEmitter<any>();
  @Output() onRemoveValue = new EventEmitter<any>();

  presetDates: {
    label: string;
    value: number;
    dateRange: {
      start: Date;
      end: Date;
    };
  }[] = [];

  selectionDates: any = [null, null];

  value: any = null;

  valueString: any = '';

  onChange: any = () => {};

  onTouch: any = () => {};

  constructor(
    // private fcFilterDateService: FcFilterDateService,
    private dialogService: DialogService,
    private layoutService: LayoutService,
  ) {
    // this.fcFilterDateService.getPresetDates().subscribe((res: any) => {
    //   this.presetDates = res;
    // });
  }

  ngOnInit(): void {}

  writeValue(value: any) {
    if (this.type == 'range') {
      if (value) {
        this.value = value;
        this.selectionDates = [value.start, value.end];
      } else {
        this.value = {
          start: null,
          end: null,
        };
        this.selectionDates = [];
      }
    } else {
      this.value = value;
      if (this.inputType == 'text') {
        this.valueString = moment(value).format('YYYY-MM-DD');
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  //  Date
  setDefaultDate() {
    this.selectionDates = [];
  }
  setDate() {
    if (this.type == 'range') {
      this.value.start = this.selectionDates[0];
      if (!this.selectionDates[1]) {
        this.value.end = this.selectionDates[0];
      } else {
        this.value.end = this.selectionDates[1];
      }
      // adjust to 00:00:00 and 23:59:59 with moment
      this.value.start = moment(this.value.start).startOf('day').toISOString();
      this.value.end = moment(this.value.end).endOf('day').toISOString();

      this.onSelectDate.emit(this.value);
    }
  }

  datePreset(dateRange: any) {
    this.value = dateRange;
    this.selectionDates = [dateRange.start, dateRange.end];
    this.onValueChange(this.value);
  }
  removeValue() {
    if (this.type == 'range') {
      this.value.start = null;
      this.value.end = null;
      this.onValueChange(this.value);
    } else {
      this.value = null;
      this.onValueChange(this.value);
    }
    this.onRemoveValue.emit();
    this.resetDate();
  }
  resetDate() {
    if (this.type == 'range') {
      this.selectionDates = [];
    }
  }
  onInput() {
    this.value = moment(this.valueString).toDate();
    this.onValueChange(this.value);
  }

  onValueChange(val: any) {
    this.valueString = moment(val).format('YYYY-MM-DD');
    if (val !== undefined) {
      this.value = val;
      this.onChange(val);
      this.onTouch(val);
      this.onSelectDate.emit(this.value);
    }
  }

  openMobileDatepicker() {
    let style = {};
    if (this.layoutService.isMobile$.value) {
      style = {
        'max-height': '100%',
        width: '100vh',
        height: '100vh',
        overflow: 'hidden',
      };
    } else {
      style = {
        'border-radius': '1rem',
        overflow: 'hidden',
      };
    }
    const ref = this.dialogService.open(FcDatepickerDialogComponent, {
      dismissableMask: true,
      data: {
        uniqueId: this.uniqueId,
        selectionDates: this.selectionDates,
        value: this.value,
        type: this.type,
      },
      closable: true,
      showHeader: false,
      width: '500px',
      contentStyle: {
        padding: '0',
      },
      style: style,
    });
    ref.onClose.subscribe((date: any) => {
      if (date) {
        this.value = date;
        this.onValueChange(this.value);
      }
    });
  }
  getRangeDate(dateRange: any) {
    if (dateRange.start && dateRange.end) {
      // check on preset first
      const preset = this.presetDates.find(
        (x) =>
          x.dateRange.start.getTime() == dateRange.start.getTime() &&
          x.dateRange.end.getTime() == dateRange.end.getTime(),
      );

      if (preset) {
        return preset.label;
      }
      // check if same day with moment
      if (
        moment(dateRange.start).isSame(dateRange.end, 'day') &&
        moment(dateRange.start).isSame(dateRange.end, 'month') &&
        moment(dateRange.start).isSame(dateRange.end, 'year')
      ) {
        return dateRange.start.toLocaleDateString();
      }
      return (
        dateRange.start.toLocaleDateString() +
        ' - ' +
        dateRange.end.toLocaleDateString()
      );
    } else if (dateRange.start && !dateRange.end) {
      return dateRange.start.toLocaleDateString();
    }
    return '';
  }
}
