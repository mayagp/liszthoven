import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  faLocationDot,
  faUser,
  faPhone,
  faEye,
  faPlus,
  faRefresh,
  faFilter,
  faBars,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcFilterDialogComponent } from '../../../../shared/components/fc-filter-dialog/fc-filter-dialog.component';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProductViewComponent } from '../product-view/product-view.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    FormsModule,
    FcActionBarComponent,
    FontAwesomeModule,
    ProductViewComponent,
    FcCurrencyPipe,
    FcImagePreviewComponent,
    PaginatorModule,
    ProgressSpinner,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  providers: [DialogService],
})
export class ProductListComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private readonly destroy$ = new Subject<void>();
  // Icon
  faLocationDot = faLocationDot;
  faUser = faUser;
  faPhone = faPhone;
  faEye = faEye;

  actionButtons: any[] = [
    {
      label: 'Add',
      icon: faPlus,
      route: ['/product/add'],
      action: () => {},
    },
  ];

  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,
      action: () => {
        this.loadData(1);
      },
    },
    {
      label: 'Filter',
      icon: faFilter,
      action: () => {
        this.onFilter();
      },
    },
    {
      label: 'Quick View',
      icon: faBars,
      action: () => {
        this.onChangeQuickView();
      },
    },
  ];

  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    sort: {
      fields: [
        { name: 'name', header: 'Name' },
        { name: 'brand', header: 'Brand' },
      ],
      selectedField: 'id',
      direction: 'desc',
    },
  };

  loading: boolean = false;
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;
  searchQuery: string = '';
  Math = Math;
  quickView = false;

  products: Product[] = [];
  selectedProduct: Product | undefined;

  constructor(
    private layoutService: LayoutService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private fcFilterDialogService: FcFilterDialogService,
    private dialogService: DialogService,
  ) {
    this.layoutService.setHeaderConfig({
      title: 'Product',
      icon: '',
      showHeader: true,
    });
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: any) => {
        this.page = params.page ? params.page : 1;
        this.rows = params.limit ? params.limit : 10;
        this.searchQuery = params.searchQuery ? params.searchQuery : '';
        this.layoutService.setSearchConfig({
          searchQuery: this.searchQuery,
          featureName: 'products',
          baseHref: '/product/list',
        });
        if (params.order_by && params.direction) {
          this.fcFilterConfig.sort.selectedField = params.order_by;
          this.fcFilterConfig.sort.direction = params.direction;
        }
        this.fcFilterConfig.filterFields?.map((field: any) => {
          if (params[field.name]) {
            field.value = String(params[field.name]);
            if (field.type == 'object') {
              field.valueLabel = String(params[field.name + '-label']);
            }
          }
        });
      });
  }

  ngOnInit(): void {
    this.loadData();
    // load data when search
    this.layoutService.setSearchConfig({
      hide: false,
      featureName: 'products',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'products') {
          if (this.searchQuery != config.searchQuery) {
            this.searchQuery = config.searchQuery;
            this.loadData();
          }
        }
      });
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
    if (this.fcFilterConfig.sort.selectedField) {
      queryParams.order_by = this.fcFilterConfig.sort.selectedField;
      queryParams.direction = this.fcFilterConfig.sort.direction;
    }
    // filter conditions
    this.fcFilterConfig.filterFields?.map((field: any) => {
      if (field.value) {
        queryParams[field.name] = field.value;
        if (field.type == 'object') {
          queryParams[field.name + '-label'] = field.valueLabel;
        }
      }
    });
    this.fcFilterConfig.filterOptions?.map((filterOption: any) => {
      if (filterOption.selectedValue != null) {
        queryParams[filterOption.optionValue] = filterOption.selectedValue;
      }
    });

    // end filter conditions
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
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
    this.layoutService.setSearchConfig({
      loading: true,
    });

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.sortBy = sortBy;
    dataListParameter.filterObj = filterObj;
    dataListParameter.searchQuery = searchQuery;
    this.destroy$.next();
    this.productService
      .getProducts(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.layoutService.setSearchConfig({
          loading: false,
        });
        this.totalRecords = res.data.count;
        this.totalPages =
          this.totalRecords > this.rows
            ? Math.ceil(this.totalRecords / this.rows)
            : 1;
        this.products = res.data.products;
        if (!this.selectedProduct) {
          if (this.products.length > 0) {
            this.selectedProduct = this.products[0];
          }
        }
      });
  }

  navigateToDetail(product: Product) {
    this.router.navigate(['/product/view/', product.id]);
  }

  onChangeQuickView() {
    this.quickView = !this.quickView;
    this.filterButtons[2].icon = this.quickView ? faList : faBars;
  }

  onFilter() {
    const ref = this.dialogService.open(FcFilterDialogComponent, {
      data: {
        fcFilterConfig: this.fcFilterConfig,
      },
      showHeader: false,
      contentStyle: {
        padding: '0',
      },
      style: {
        overflow: 'hidden',
      },
      styleClass: 'rounded-sm',
      dismissableMask: true,
      width: '450px',
    });
    ref.onClose.subscribe((res: any) => {
      if (res) {
        this.fcFilterConfig = res;
        this.loadData();
      }
    });
  }

  onChangeProduct(product: Product) {
    this.selectedProduct = product;
  }

  onDeleted() {
    this.selectedProduct = undefined;
    this.quickView = false;
    this.loadData();
  }

  onUpdated(product: Product) {
    let productIndex = this.products.findIndex(
      (item: Product) => item.id == product.id,
    );
    this.products[productIndex] = product;
  }

  onPageUpdate(event: any) {
    this.rows = event.rows;
    this.page = Math.floor(event.first / event.rows) + 1;
    this.loadData();
  }
}
