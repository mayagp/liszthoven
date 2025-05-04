import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLocationDot,
  faUser,
  faPhone,
  faEye,
  faPlus,
  faRefresh,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcFilterDialogComponent } from '../../../../shared/components/fc-filter-dialog/fc-filter-dialog.component';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { StockMovement } from '../../interfaces/stock-movement';
import { StockMovementService } from '../../services/stock-movement.service';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-stock-movement-list',
  imports: [
    CommonModule,
    FormsModule,
    FcActionBarComponent,
    FontAwesomeModule,
    PaginatorModule,
    ProgressSpinner,
  ],
  templateUrl: './stock-movement-list.component.html',
  styleUrl: './stock-movement-list.component.css',
  providers: [DialogService],
})
export class StockMovementListComponent {
  private readonly destroy$ = new Subject<void>();
  // Icons
  faLocationDot = faLocationDot;
  faUser = faUser;
  faPhone = faPhone;
  faEye = faEye;

  actionButtons: any[] = [
    {
      label: 'Add',
      icon: faPlus,
      route: ['/stock-movement/add'],
      action: () => {},
      hidden: false,
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
  ];

  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    sort: {
      fields: [
        { name: 'name', header: 'Name' },
        { name: 'email', header: 'Email' },
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

  stockMovements: StockMovement[] = [];

  constructor(
    private layoutService: LayoutService,
    private stockMovementService: StockMovementService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private fcFilterDialogService: FcFilterDialogService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'stock-movement',
    );
    this.layoutService.setHeaderConfig({
      title: 'Stock Movement',
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
          featureName: 'stock movement',
          baseHref: '/stock-movement/list',
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
    // initial load Data
    this.loadData();

    // load data when search
    this.layoutService.setSearchConfig({
      hide: false,
      featureName: 'stock movement',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'stock movement') {
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
    this.stockMovementService
      .getStockMovements(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.layoutService.setSearchConfig({
          loading: false,
        });
        this.stockMovements = res.data.stock_movements;
        this.totalRecords = res.data.count;
        this.totalPages =
          this.totalRecords > this.rows
            ? Math.ceil(this.totalRecords / this.rows)
            : 1;
      });
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/stock-movement/view/' + id]);
  }

  onPageUpdate(event: any) {
    this.rows = event.rows;
    this.page = Math.floor(event.first / event.rows) + 1;
    this.loadData();
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
}
