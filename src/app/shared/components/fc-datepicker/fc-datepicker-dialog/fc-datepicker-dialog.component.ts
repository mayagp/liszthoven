import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import moment from 'moment';
import { CalendarModule } from 'primeng/calendar';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-fc-datepicker-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    OverlayPanelModule,
    FormsModule,
    CalendarModule,
  ],
  templateUrl: './fc-datepicker-dialog.component.html',
  styleUrl: './fc-datepicker-dialog.component.css',
})
export class FcDatepickerDialogComponent {
  uniqueId = '1';
  selectionDates: any = [null, null];
  presetDates: {
    label: string;
    value: number;
    dateRange: {
      start: Date;
      end: Date;
    };
  }[] = [];

  value: any = null;
  type: 'single' | 'range' = 'single';

  constructor(
    private config: DynamicDialogConfig,
    // private fcFilterDateService: FcFilterDateService,
    private ref: DynamicDialogRef,
  ) {
    this.uniqueId = this.config.data.uniqueId;
    this.value = this.config.data.value;
    this.selectionDates = this.config.data.selectionDates;
    this.type = this.config.data.type;

    // this.fcFilterDateService.getPresetDates().subscribe((res: any) => {
    //   this.presetDates = res;
    //   if (this.type === 'single') {
    //     this.presetDates = this.presetDates.filter(
    //       (x) => x.value == 0 || x.value == 1
    //     );
    //   }
    // });
  }
  //  Date
  setDefaultDate() {
    this.selectionDates = [];
  }
  setDate() {
    this.value.start = this.selectionDates[0];
    if (!this.selectionDates[1]) {
      this.value.end = this.selectionDates[0];
    } else {
      this.value.end = this.selectionDates[1];
    }
    // adjust to 00:00:00 and 23:59:59 with moment
    this.value.start = moment(this.value.start).startOf('day').toDate();
    this.value.end = moment(this.value.end).endOf('day').toDate();

    this.ref.close(this.value);
  }

  datePreset(dateRange: any) {
    this.value = dateRange;
    if (this.type === 'single') {
      this.value = dateRange.start;
      return;
    }
    this.selectionDates = [dateRange.start, dateRange?.end];
  }
  resetDate() {
    this.ref.close();
  }
}
