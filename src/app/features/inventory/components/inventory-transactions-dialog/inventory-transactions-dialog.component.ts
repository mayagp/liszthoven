import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faSpinner,
  faChevronDown,
  faChevronUp,
  faTruckRampBox,
  faBoxesStacked,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
  DialogService,
} from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Inventory } from '../../interfaces/inventory';
import { InventoryServices } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-transactions-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './inventory-transactions-dialog.component.html',
  styleUrl: './inventory-transactions-dialog.component.css',
})
export class InventoryTransactionsDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faSpinner = faSpinner;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faTruckRampBox = faTruckRampBox;
  faBoxesStocked = faBoxesStacked;
  faBoxOpen = faBoxOpen;

  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    sort: {
      fields: [{ name: 'name', header: 'Name' }],
      selectedField: 'id',
      direction: 'desc',
    },
  };

  loading = false;
  isShowStockOut = false;
  inventories: Inventory[] = [];
  stockMovementId!: number;
  title = '';

  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
    private inventoryService: InventoryServices,
    private fcFilterDialogService: FcFilterDialogService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
    if (this.config.data.stockMovementId) {
      this.stockMovementId = this.config.data.stockMovementId;
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

  removeUnderscores(input: string): string {
    // Use a regular expression to replace underscores with an empty string
    return input.replace(/_/g, ' ');
  }

  loadData(
    page: number = 0,
    sortBy: string = this.fcFilterDialogService.getSortString(
      this.fcFilterConfig,
    ),
  ) {
    this.loading = true;
    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.filterObj = `inventory_id=${this.stockMovementId}&with_filter=1`;
    dataListParameter.sortBy = sortBy;
    this.inventoryService
      .getInventoryTransactions(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.inventories = res.data.inventory_in_transactions;
      });
  }

  showDetail(index: any) {
    this.inventories[index].showDetail = !this.inventories[index].showDetail;
    if (!this.inventories[index].inventoryDetailLoaded) {
      this.loadInventoryTransactions(this.inventories[index].id, index);
    }
  }

  loadInventoryTransactions(id: number, index: number) {
    this.inventories[index].loading = true;
    this.inventoryService
      .getInventoryTransaction(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.inventories[index].loading = false;
        this.inventories[index].inventoryDetailLoaded = true;
        this.inventories[index].inventory_out_transactions =
          res.data.inventory_out_transactions;
      });
  }

  onClose() {
    this.ref.close();
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
}
