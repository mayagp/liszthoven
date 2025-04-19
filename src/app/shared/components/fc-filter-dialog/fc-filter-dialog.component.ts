import { Component, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { FcFilterConfig } from './interfaces/fc-filter-config';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'fc-filter-dialog',
  imports: [
    CommonModule,
    CalendarModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    FormsModule,
    FontAwesomeModule,
  ],
  standalone: true,
  templateUrl: './fc-filter-dialog.component.html',
  styleUrls: ['./fc-filter-dialog.component.css'],
})
export class FcFilterDialogComponent implements OnInit {
  faTimes = faTimes;
  fcFilterConfig!: FcFilterConfig;
  sortDirection = [
    { name: 'Ascending', value: 'asc' },
    { name: 'Descending', value: 'desc' },
  ];
  constructor(
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private dialogService: DialogService,
  ) {
    if (this.config.data.fcFilterConfig) {
      this.fcFilterConfig = JSON.parse(
        JSON.stringify(this.config.data.fcFilterConfig),
      );
    }
  }

  ngOnInit(): void {}
  onSelectSortField(field: any) {
    if (this.fcFilterConfig.sort.selectedField !== field.name) {
      this.fcFilterConfig.sort.selectedField = field.name;
    } else {
      this.fcFilterConfig.sort.selectedField = 'id';
    }
  }
  onSelectSortDirection(direction: string) {
    this.fcFilterConfig.sort.direction = direction;
  }
  onSelectOption(option: any, index: number) {
    if (this.fcFilterConfig.filterOptions) {
      this.fcFilterConfig.filterOptions[index].selectedValue = option.value;
    }
  }
  openDialog(field: any, index: number) {
    const ref = this.dialogService.open(field.component, {
      header: field.header,
      data: {
        selectedSort: this.fcFilterConfig.sort,
        fcFilterConfig: this.fcFilterConfig,
      },
      dismissableMask: true,
      width: '600px',
    });
    ref.onClose.subscribe((res) => {
      this.fcFilterConfig.filterFields[index].valueLabel =
        res[this.fcFilterConfig.filterFields[index].valueLabelBy];
      this.fcFilterConfig.filterFields[index].value = res.id;
    });
  }
  onClose() {
    this.ref.close();
  }
  submit() {
    this.ref.close(this.fcFilterConfig);
  }
}
