import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { Product } from '../../../product/interfaces/product';
import { GoodsReceipt } from '../../interfaces/goods-receipt';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-goods-receipt-detail-select-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FcCurrencyPipe,
    ProgressSpinner,
  ],
  templateUrl: './goods-receipt-detail-select-dialog.component.html',
  styleUrl: './goods-receipt-detail-select-dialog.component.css',
})
export class GoodsReceiptDetailSelectDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronUp = faChevronUp;
  faChevronDown = faChevronDown;
  faRefresh = faRefresh;
  faPlus = faPlus;
  faSearch = faSearch;

  goodsReceipts: GoodsReceipt[] = [];
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
  currentProducts: Product[] = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private fcFilterDialogService: FcFilterDialogService,
    private goodsReceiptService: GoodsReceiptService,
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
      filters.push(`goods_receipts-supplier_id=${this.supplierId}`);
    }
    if (this.config.data.statusFilter) {
      filters.push(this.config.data.statusFilter);
    }
    dataListParameter.filterObj = filters.length
      ? filters.join('&')
      : filterObj;
    dataListParameter.searchQuery = searchQuery;
    this.destroy$.next();
    this.goodsReceiptService
      .getGoodsReceipts(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.goodsReceipts = res.data.goods_receipts;
      });
  }

  showDetail(index: any) {
    this.goodsReceipts[index].showDetail =
      !this.goodsReceipts[index].showDetail;
    if (!this.goodsReceipts[index].goodsReceiptDetailLoaded) {
      this.loadGoodsReceipt(this.goodsReceipts[index].id, index);
    }
  }

  loadGoodsReceipt(id: any, index: any) {
    this.goodsReceipts[index].loading = true;
    this.goodsReceiptService
      .getGoodsReceipt(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.goodsReceipts[index].loading = false;
        this.goodsReceipts[index].goodsReceiptDetailLoaded = true;
        this.goodsReceipts[index].goods_receipt_details =
          res.data.goods_receipt_details;
        //existing product
        this.goodsReceipts[index].goods_receipt_details.forEach((data) => {
          let existProduct = this.currentProducts.find((product) => {
            return product.id == data.product.id;
          });
          if (existProduct) {
            data.product.isExist = true;
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

  submit(res: any) {
    this.ref.close(res);
  }
  onClose() {
    this.ref.close();
  }
}
