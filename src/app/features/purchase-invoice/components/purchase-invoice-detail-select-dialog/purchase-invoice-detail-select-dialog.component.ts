import { Component } from '@angular/core';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faChevronUp,
  faChevronDown,
  faRefresh,
  faPlus,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Product } from '../../../product/interfaces/product';
import { PurchaseInvoice } from '../../interfaces/purchase-invoice';
import { PurchaseInvoiceService } from '../../services/purchase-invoice.service';
import { RouterModule } from '@angular/router';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-purchase-invoice-detail-select-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FcImagePreviewComponent,
    RouterModule,
    FcCurrencyPipe,
    ProgressSpinner,
  ],
  templateUrl: './purchase-invoice-detail-select-dialog.component.html',
  styleUrl: './purchase-invoice-detail-select-dialog.component.css',
})
export class PurchaseInvoiceDetailSelectDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faRefresh = faRefresh;
  faPlus = faPlus;
  faSearch = faSearch;

  purchaseInvoices: PurchaseInvoice[] = [];
  currentProducts: Product[] = [];
  supplierId: number | null = null;

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

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private fcFilterDialogService: FcFilterDialogService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }

    if (this.config.data.currentProducts) {
      this.currentProducts = this.config.data.currentProducts;
    }
    if (this.config.data.supplierId) {
      this.supplierId = this.config.data.supplierId;
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
    // if (this.config.data.statusFilter) {
    //   dataListParameter.filterObj = this.config.data.statusFilter;
    // } else {
    //   dataListParameter.filterObj = filterObj;
    // }
    let filters: string[] = [];
    if (this.supplierId) {
      filters.push(`supplier_id=${this.supplierId}`);
    }
    if (this.config.data.statusFilter) {
      filters.push(this.config.data.statusFilter);
    }
    dataListParameter.filterObj = filters.length
      ? filters.join('&')
      : filterObj;
    dataListParameter.searchQuery = searchQuery;
    this.destroy$.next();
    this.purchaseInvoiceService
      .getPurchaseInvoices(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.purchaseInvoices = res.data.purchase_invoices;
      });
  }

  showDetail(index: any) {
    this.purchaseInvoices[index].showDetail =
      !this.purchaseInvoices[index].showDetail;
    if (!this.purchaseInvoices[index].purchaseInvoiceDetailLoaded) {
      this.loadPurchaseInvoiceDetails(this.purchaseInvoices[index].id, index);
    }
  }

  loadPurchaseInvoiceDetails(id: any, index: any) {
    this.purchaseInvoices[index].loading = true;
    this.purchaseInvoiceService
      .getPurchaseInvoice(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.purchaseInvoices[index].loading = false;
        this.purchaseInvoices[index].purchaseInvoiceDetailLoaded = true;
        this.purchaseInvoices[index].purchase_invoice_details =
          res.data.purchase_invoice_details;
        //existing product
        this.purchaseInvoices[index].purchase_invoice_details.forEach(
          (data) => {
            let existProduct = this.currentProducts.find((product) => {
              return product.id == data.product.id;
            });
            if (existProduct) {
              data.product.isExist = true;
            }
          },
        );
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

  submit(res: any) {
    this.ref.close(res);
  }
  onClose() {
    this.ref.close();
  }
}
