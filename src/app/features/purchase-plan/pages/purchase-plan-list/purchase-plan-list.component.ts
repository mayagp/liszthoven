import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PureAbility } from '@casl/ability';
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
import { FcFilterDialogComponent } from '../../../../shared/components/fc-filter-dialog/fc-filter-dialog.component';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { PurchasePlan } from '../../interfaces/purchase-plan';
import { PurchasePlanService } from '../../services/purchase-plan.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { PurchasePlanViewComponent } from '../purchase-plan-view/purchase-plan-view.component';

@Component({
  selector: 'app-purchase-plan-list',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    FcImagePreviewComponent,
    ProgressSpinner,
    PaginatorModule,
    PurchasePlanViewComponent,
    RouterModule,
  ],
  templateUrl: './purchase-plan-list.component.html',
  styleUrl: './purchase-plan-list.component.css',
  providers: [DialogService],
})
export class PurchasePlanListComponent {
  private readonly destroy$ = new Subject<void>();
  // Icons
  faLocationDot = faLocationDot;
  faUser = faUser;
  faPhone = faPhone;
  faEye = faEye;

  quickView = false;

  loading: boolean = false;
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;
  searchQuery: string = '';

  purchasePlans: PurchasePlan[] = [];
  selectedPurchasePlan: PurchasePlan | undefined;
  Math = Math;

  actionButtons: any[] = [
    {
      label: 'Add',
      icon: faPlus,
      route: ['/purchase-plan/add'],
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
          { name: 'Created', value: 0 },
          { name: 'Progress', value: 1 },
          { name: 'Complete', value: 2 },
          { name: 'Cancelled', value: 3 },
        ],
        selectedValue: null,
        optionLabel: 'Status',
        optionValue: 'purchase_plans.status',
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

  constructor(
    private layoutService: LayoutService,
    private purchasePlanService: PurchasePlanService,
    private router: Router,
    private route: ActivatedRoute,
    private fcFilterDialogService: FcFilterDialogService,
    private dialogService: DialogService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'purchase-plan');
    this.layoutService.setHeaderConfig({
      title: 'Purchase Plan',
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
          featureName: 'purchase plan',
          baseHref: '/purchase-plan/list',
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
      featureName: 'purchase plan',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'purchase plan') {
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
  onChangePurchasePlan(purchasePlan: PurchasePlan) {
    this.selectedPurchasePlan = purchasePlan;
  }
  onChangeQuickView() {
    this.quickView = !this.quickView;
    this.filterButtons[2].icon = this.quickView ? faList : faBars;
    // reset header
    if (!this.quickView) {
      this.layoutService.setHeaderConfig({
        title: 'Purchase Plans',
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
    this.purchasePlanService
      .getPurchasePlans(dataListParameter)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.totalRecords = res.data.count;
          this.totalPages =
            this.totalRecords > this.rows
              ? Math.ceil(this.totalRecords / this.rows)
              : 1;
          this.purchasePlans = res.data.purchase_plans;
          if (this.purchasePlans.length > 0) {
            this.selectedPurchasePlan = this.purchasePlans[0];
          }
          // set selected purchasePlan for quickview purpose
          if (!this.selectedPurchasePlan) {
            if (this.purchasePlans.length > 0) {
              this.selectedPurchasePlan = this.purchasePlans[0];
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

  onPageUpdate(pagination: any) {
    let page = pagination.page;
    let rows = pagination.rows;
    this.rows = rows;
    if (page > 0) {
      this.page = page;
    } else {
      this.page = 1;
    }
    this.loadData();
  }
  navigateToDetail(purchasePlan: any) {
    this.router.navigate(['/purchase-plan/view/', purchasePlan.id]);
  }
  getStatusColor(status: number): string {
    switch (status) {
      case 0: //crated
        return 'border border-gray-600 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/20 text-gray-500';
      case 1: // progress
        return 'border border-blue-600 dark:border-blue-700 bg-blue-100 dark:bg-blue-700/20 text-blue-500';
      case 2: // complete
        return 'border border-green-600 dark:border-green-700 bg-green-100 dark:bg-green-700/20 text-green-500';
      case 3: // cancelled
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
    this.selectedPurchasePlan = undefined;
    this.quickView = false;
    this.loadData();
  }
  onUpdated(purchasePlan: any) {
    let purchasePlanIndex = this.purchasePlans.findIndex(
      (item: PurchasePlan) => item.id == purchasePlan.id,
    );
    if (this.purchasePlans[purchasePlanIndex].status == purchasePlan.status) {
      this.purchasePlans[purchasePlanIndex] = {
        ...this.purchasePlans[purchasePlanIndex],
        ...purchasePlan,
      };
    } else {
      this.selectedPurchasePlan = undefined;
      this.quickView = false;
      this.loadData();
    }
  }
}
