import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogService } from 'primeng/dynamicdialog';
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
import { Subject, takeUntil, take } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcFilterDialogComponent } from '../../../../shared/components/fc-filter-dialog/fc-filter-dialog.component';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { PurchaseReturn } from '../../interfaces/purchase-return';
import { PurchaseReturnService } from '../../services/purchase-return.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { PurchaseReturnViewComponent } from '../purchase-return-view/purchase-return-view.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-purchase-return-list',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    PurchaseReturnViewComponent,
    ProgressSpinner,
    PaginatorModule,
  ],
  templateUrl: './purchase-return-list.component.html',
  styleUrl: './purchase-return-list.component.css',
  providers: [DialogService],
})
export class PurchaseReturnListComponent {
  private readonly destroy$ = new Subject<void>();
  // Icons
  faLocationDot = faLocationDot;
  faUser = faUser;
  faPhone = faPhone;
  faEye = faEye;
  quickView = false;

  actionButtons: any[] = [
    {
      label: 'Add',
      icon: faPlus,
      route: ['/purchase-return/add'],
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
          { name: 'Draft', value: 0 },
          { name: 'Complete', value: 1 },
          { name: 'Cancelled', value: 2 },
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

  purchaseReturns: PurchaseReturn[] = [];
  selectedPurchaseReturn: PurchaseReturn | undefined;

  constructor(
    private layoutService: LayoutService,
    private purchaseReturnService: PurchaseReturnService,
    private router: Router,
    private route: ActivatedRoute,
    private fcFilterDialogService: FcFilterDialogService,
    private dialogService: DialogService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'purchase-return',
    );
    this.layoutService.setHeaderConfig({
      title: 'Purchase Return',
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
          featureName: 'purchase return',
          baseHref: '/purchase-return/list',
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
      featureName: 'purchase return',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'purchase return') {
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
  onChangePurchaseReturn(purchaseReturn: PurchaseReturn) {
    this.selectedPurchaseReturn = purchaseReturn;
  }
  onChangeQuickView() {
    this.quickView = !this.quickView;
    this.filterButtons[2].icon = this.quickView ? faList : faBars;
    // reset header
    if (!this.quickView) {
      this.layoutService.setHeaderConfig({
        title: 'Purchase Returns',
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
    this.purchaseReturnService
      .getPurchaseReturns(dataListParameter)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.purchaseReturns = res.data.purchase_returns;
          this.totalRecords = res.data.count;
          this.totalPages =
            this.totalRecords > this.rows
              ? Math.ceil(this.totalRecords / this.rows)
              : 1;
          // set selected purchaseReturn for quickview purpose
          if (!this.selectedPurchaseReturn) {
            if (this.purchaseReturns.length > 0) {
              this.selectedPurchaseReturn = this.purchaseReturns[0];
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

  // onPageUpdate(pagination: any) {
  //   let page = pagination.page;
  //   let rows = pagination.rows;
  //   this.rows = rows;
  //   if (page > 0) {
  //     this.page = page;
  //   } else {
  //     this.page = 1;
  //   }
  //   this.loadData();
  // }

  onPageUpdate(event: any) {
    this.rows = event.rows;
    this.page = Math.floor(event.first / event.rows) + 1;
    this.loadData();
  }
  navigateToDetail(purchaseReturn: any) {
    this.router.navigate(['/purchase-return/view/', purchaseReturn.id]);
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return 'border border-gray-600 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/20 text-gray-500';
      case 1:
        return 'border border-green-600 dark:border-green-700 bg-green-100 dark:bg-green-700/20 text-green-500';
      case 2:
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
    this.selectedPurchaseReturn = undefined;
    this.quickView = false;
    this.loadData();
  }
  onUpdated(purchaseReturn: any) {
    let purchaseReturnIndex = this.purchaseReturns.findIndex(
      (item: PurchaseReturn) => item.id == purchaseReturn.id,
    );
    if (
      this.purchaseReturns[purchaseReturnIndex].status == purchaseReturn.status
    ) {
      this.purchaseReturns[purchaseReturnIndex] = {
        ...this.purchaseReturns[purchaseReturnIndex],
        ...purchaseReturn,
      };
    } else {
      this.selectedPurchaseReturn = undefined;
      this.quickView = false;
      this.loadData();
    }
  }

  @HostListener('document:keydown.control.q', ['$event']) onKeydownHandler(
    event: KeyboardEvent,
  ) {
    this.onChangeQuickView();
  }
}
