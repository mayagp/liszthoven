import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faRefresh,
  faPlus,
  faLocationDot,
  faEye,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Warehouse } from '../../interfaces/warehouse';
import { WarehouseService } from '../../services/warehouse.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-warehouse-select-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './warehouse-select-dialog.component.html',
  styleUrl: './warehouse-select-dialog.component.css',
})
export class WarehouseSelectDialogComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faRefresh = faRefresh;
  faPlus = faPlus;
  faLocationDot = faLocationDot;
  faEye = faEye;
  faSearch = faSearch;

  warehouses: Warehouse[] = [];

  searchQuery: string = '';
  loading = false;
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;
  title = '';

  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    sort: {
      fields: [{ name: 'name', header: 'Name' }],
      selectedField: 'id',
      direction: 'desc',
    },
  };

  existingWarehouses: any[] = [];
  filterString: string = '';

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private warehouseService: WarehouseService,
    private fcFilterDialogService: FcFilterDialogService,
  ) {
    if (this.config.data) {
      if (this.config.data.existingWarehouse) {
        this.existingWarehouses = this.config.data.existingWarehouse;
      }

      if (this.config.data.title) {
        this.title = this.config.data.title;
      }
      if (this.config.data.filterString) {
        this.filterString = this.config.data.filterString;
      }
    }
  }

  ngOnInit(): void {
    this.loadData();
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setParam() {
    let queryParams: any = {
      page: this.page,
      limit: this.rows,
    };
    if (this.searchQuery) {
      queryParams.searchQuery = this.searchQuery;
    }
  }

  loadData(
    page: number = 0,
    searchQuery: string = this.searchQuery,
    filterObj: string = this.fcFilterDialogService.getFilterString(
      this.fcFilterConfig,
    ),
    sortBy: string = this.fcFilterDialogService.getSortString(
      this.fcFilterConfig,
    ),
  ) {
    this.setParam();
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.sortBy = sortBy;
    if (this.filterString) {
      dataListParameter.filterObj = this.filterString;
    } else {
      dataListParameter.filterObj = filterObj;
    }
    dataListParameter.searchQuery = searchQuery;

    this.destroy$.next();
    this.warehouseService
      .getWarehouses(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.warehouses = res.data.warehouses;
        // Check existing data
        this.existingWarehouses.forEach((existWarehouse) => {
          let warehouseData = this.warehouses.find(
            (data: any) => data.id == existWarehouse.warehouse.id,
          );
          if (warehouseData) {
            warehouseData.exist = true;
          }
        });
      });
  }

  onPageUpdate(pagination: any) {
    let page = pagination.page;
    let rows = pagination.rows;
    this.rows = rows;
    if (page > 0) {
      this.page = page;
    } else {
      this.page = 1;
    }
    this.loadData(this.page);
  }

  search() {
    this.page = 1;
    this.loadData(this.page);
  }

  submit(res: Warehouse) {
    this.ref.close(res);
  }
  onClose() {
    this.ref.close();
  }
}
