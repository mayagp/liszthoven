import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
import { Subject, takeUntil, take } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcFilterDialogComponent } from '../../../../shared/components/fc-filter-dialog/fc-filter-dialog.component';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { PurchaseInvoice } from '../../interfaces/purchase-invoice';
import { PurchaseInvoiceService } from '../../services/purchase-invoice.service';
import { PureAbility } from '@casl/ability';
import { PurchaseInvoiceViewComponent } from '../purchase-invoice-view/purchase-invoice-view.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-purchase-invoice-list',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    FcCurrencyPipe,
    PurchaseInvoiceViewComponent,
    ProgressSpinner,
    PaginatorModule,
  ],
  templateUrl: './purchase-invoice-list.component.html',
  styleUrl: './purchase-invoice-list.component.css',
  providers: [DialogService],
})
export class PurchaseInvoiceListComponent {
  private readonly destroy$ = new Subject<void>();
  faLocationDot = faLocationDot;
  faUser = faUser;
  faPhone = faPhone;
  faEye = faEye;

  quickView = false;

  actionButtons: any[] = [
    {
      label: 'Add',
      icon: faPlus,
      route: ['/purchase-invoice/add'],
      action: () => {},
      hidden: true,
    },
  ];
  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,
      action: () => {
        this.loadData();
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
      mobileHidden: true,
      action: () => {
        this.onChangeQuickView();
      },
    },
  ];
  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    filterOptions: [
      {
        options: [
          { name: 'All', value: null },
          { name: 'Pending', value: 0 },
          { name: 'Approval Request', value: 1 },
          { name: 'Approved', value: 2 },
          { name: 'Complete', value: 3 },
          { name: 'Cancelled', value: 4 },
        ],
        selectedValue: null,
        optionLabel: 'Status',
        optionValue: 'status',
      },
    ],
    sort: {
      fields: [
        { name: 'id', header: 'Id' },
        { name: 'date', header: 'Date' },
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
  purchaseInvoices: PurchaseInvoice[] = [];
  selectedPurchaseInvoice: PurchaseInvoice | undefined;

  today = new Date();

  constructor(
    private layoutService: LayoutService,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private router: Router,
    private route: ActivatedRoute,
    private fcFilterDialogService: FcFilterDialogService,
    private dialogService: DialogService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'purchase-invoice',
    );
    this.layoutService.setHeaderConfig({
      title: 'Purchase Invoices',
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
          featureName: 'purchase invoice',
          baseHref: '/purchase-invoice/list',
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
        this.fcFilterConfig.filterOptions?.map((filterOption: any) => {
          if (params[filterOption.optionValue]) {
            filterOption.selectedValue = String(
              params[filterOption.optionValue],
            );
          }
        });
      });
  }
  ngOnInit(): void {
    // initial load Data
    this.loadData();

    // load data when search
    this.layoutService.setSearchConfig({
      hide: false,
      featureName: 'purchase invoice',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'purchase invoice') {
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
  onChangePurchaseInvoice(purchaseInvoice: PurchaseInvoice) {
    this.selectedPurchaseInvoice = purchaseInvoice;
  }
  onChangeQuickView() {
    this.quickView = !this.quickView;
    this.filterButtons[2].icon = this.quickView ? faList : faBars;
    // reset header
    if (!this.quickView) {
      this.layoutService.setHeaderConfig({
        title: 'Purchase Invoices',
        icon: '',
        showHeader: true,
      });
    }
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
    this.purchaseInvoiceService
      .getPurchaseInvoices(dataListParameter)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.totalRecords = res.data.count;
          this.totalPages =
            this.totalRecords > this.rows
              ? Math.ceil(this.totalRecords / this.rows)
              : 1;
          this.purchaseInvoices = res.data.purchase_invoices;
          // set selected purchaseInvoice for quickview purpose
          if (!this.selectedPurchaseInvoice) {
            if (this.purchaseInvoices.length > 0) {
              this.selectedPurchaseInvoice = this.purchaseInvoices[0];
            }
          }
          this.loading = false;
          this.layoutService.setSearchConfig({
            loading: false,
          });
        },
        error: (err: any) => {
          this.loading = false;
          this.layoutService.setSearchConfig({
            loading: false,
          });
        },
      });
  }

  onPageUpdate(event: any) {
    this.rows = event.rows;
    this.page = Math.floor(event.first / event.rows) + 1;
    this.loadData();
  }

  navigateToDetail(purchaseInvoice: any) {
    this.router.navigate(['/purchase-invoice/view/', purchaseInvoice.id]);
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return 'border border-gray-600 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/20 text-gray-500';
      case 1:
        return 'border border-blue-600 dark:border-blue-700 bg-blue-100 dark:bg-blue-700/20 text-blue-500';
      case 2:
        return 'border border-green-600 dark:border-green-700 bg-green-100 dark:bg-green-700/20 text-green-500';
      case 3:
        return 'border border-emerald-600 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-700/20 text-emerald-500';
      case 4:
        return 'border border-red-600 dark:border-red-700 bg-red-100 dark:bg-red-700/20 text-red-500';
      default:
        return '';
    }
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
  onDeleted() {
    this.selectedPurchaseInvoice = undefined;
    this.quickView = false;
    this.loadData();
  }
  onUpdated(purchaseInvoice: any) {
    let purchaseInvoiceIndex = this.purchaseInvoices.findIndex(
      (item: PurchaseInvoice) => item.id == purchaseInvoice.id,
    );
    if (
      this.purchaseInvoices[purchaseInvoiceIndex].status ==
      purchaseInvoice.status
    ) {
      this.purchaseInvoices[purchaseInvoiceIndex] = {
        ...this.purchaseInvoices[purchaseInvoiceIndex],
        ...purchaseInvoice,
      };
    } else {
      this.selectedPurchaseInvoice = undefined;
      this.quickView = false;
      this.loadData();
    }
  }
}
