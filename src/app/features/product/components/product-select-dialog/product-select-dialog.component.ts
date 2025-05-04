import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faRefresh,
  faPlus,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { ScrollerModule } from 'primeng/scroller';

@Component({
  selector: 'app-product-select-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FcImagePreviewComponent,
    FcCurrencyPipe,
    SkeletonModule,
    ScrollerModule,
  ],
  templateUrl: './product-select-dialog.component.html',
  styleUrl: './product-select-dialog.component.css',
})
export class ProductSelectDialogComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faRefresh = faRefresh;
  faPlus = faPlus;
  faSearch = faSearch;

  products: Product[] = [];

  searchQuery: string = '';
  allowedFilteringData = true;
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

  existingProduct: any[] = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private productService: ProductService,
    private fcFilterDialogService: FcFilterDialogService,
  ) {
    if (this.config.data.existingProduct) {
      this.existingProduct = this.config.data.existingProduct;
    }

    if (this.config.data.products) {
      this.allowedFilteringData = false;
      this.products = this.config.data.products;
      // check existing data
      this.existingProduct.forEach((existProduct) => {
        let productData = this.products.find(
          (data: any) => data.id == existProduct.id,
        );
        if (productData) {
          productData.isExist = true;
        }
      });
    }

    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
  }

  ngOnInit(): void {
    if (!this.config.data.products) {
      this.loadData();
    }
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
    append: boolean = false,
  ) {
    this.setParam();
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.sortBy = sortBy;
    dataListParameter.filterObj = filterObj;
    dataListParameter.searchQuery = searchQuery;

    this.productService
      .getProducts(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.totalRecords = res.data.count;
        this.totalPages = Math.ceil(this.totalRecords / this.rows);

        // Jika append true, gabungkan data baru dengan data lama
        if (append) {
          this.products = [...this.products, ...res.data.products];
        } else {
          // Jika append false, update dengan data baru (misalnya pada halaman pertama)
          this.products = res.data.products;
        }

        // Cek apakah produk sudah ada di data lama
        this.existingProduct.forEach((existProduct) => {
          let productData = this.products.find(
            (data: any) => data.id === existProduct.product.id,
          );
          if (productData) {
            productData.isExist = true;
          }
        });
      });
  }

  onScroll(event: any) {
    const bottom =
      event.target.scrollHeight - event.target.scrollTop <=
      event.target.clientHeight + 10; // Menambahkan margin untuk lebih sensitif

    if (bottom && !this.loading && this.page < this.totalPages) {
      console.log('Loading more data...');
      console.log('New Page:', this.page + 1); // Log page yang baru
      this.page++; // Menambah halaman
      this.loadData(
        this.page, // Gunakan page yang baru
        this.searchQuery,
        this.fcFilterDialogService.getFilterString(this.fcFilterConfig),
        this.fcFilterDialogService.getSortString(this.fcFilterConfig),
        true, // append = true, data baru ditambahkan
      );
    }
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

  submit(res: Product) {
    this.ref.close(res);
  }
  onClose() {
    this.ref.close();
  }
}
