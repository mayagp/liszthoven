import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PureAbility } from '@casl/ability';
import {
  faLocationDot,
  faUser,
  faPhone,
  faEye,
  faBuilding,
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
import { Branch } from '../../interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BranchViewComponent } from '../branch-view/branch-view.component';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-branch-list',
  imports: [
    CommonModule,
    FcActionBarComponent,
    FontAwesomeModule,
    BranchViewComponent,
    PaginatorModule,
    ProgressSpinner,
  ],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.css',
  providers: [DialogService],
})
export class BranchListComponent {
  private readonly destroy$ = new Subject<void>();
  faLocationDot = faLocationDot;
  faUser = faUser;
  faPhone = faPhone;
  faEye = faEye;
  faBuilding = faBuilding;
  quickView = false;

  actionButtons: any[] = [
    {
      label: 'Add',
      icon: faPlus,
      route: ['/branch/add'],
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
    sort: {
      fields: [{ name: 'address', header: 'Address' }],
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

  branches: Branch[] = [];
  selectedBranch: Branch | undefined;

  constructor(
    private layoutService: LayoutService,
    private branchService: BranchService,
    private router: Router,
    private route: ActivatedRoute,
    private fcFilterDialogService: FcFilterDialogService,
    private dialogService: DialogService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'branch');
    this.layoutService.setHeaderConfig({
      title: 'Branches',
      icon: '',
      showHeader: true,
    });
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: any) => {
        // set initial value
        this.page = params.page ? params.page : 1;
        this.rows = params.limit ? params.limit : 10;
        this.searchQuery = params.searchQuery ? params.searchQuery : '';
        // set search config
        this.layoutService.setSearchConfig({
          searchQuery: this.searchQuery,
          featureName: 'branch',
          baseHref: '/branch/list',
        });
        // set filter config
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
      featureName: 'branch',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'branch') {
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
  onChangeBranch(branch: Branch) {
    this.selectedBranch = branch;
  }
  onChangeQuickView() {
    this.quickView = !this.quickView;
    this.filterButtons[2].icon = this.quickView ? faList : faBars;
    if (!this.quickView) {
      this.layoutService.setHeaderConfig({
        title: 'Branches',
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
    this.setLoadingState(true);
    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.sortBy = sortBy;
    dataListParameter.filterObj = filterObj;
    dataListParameter.searchQuery = searchQuery;
    this.destroy$.next();
    this.branchService
      .getBranches(dataListParameter)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // set pagination
          this.totalRecords = res.data.count;
          this.totalPages =
            this.totalRecords > this.rows
              ? Math.ceil(this.totalRecords / this.rows)
              : 1;
          // set data
          this.branches = res.data.branches;
          // set selected branch for quickview purpose
          if (!this.selectedBranch) {
            if (this.branches.length > 0) {
              this.selectedBranch = this.branches[0];
            }
          }
          // set loading state
          this.setLoadingState(false);
        },
        error: (err: any) => {
          // set loading state
          this.setLoadingState(false);
        },
      });
  }
  setLoadingState(state: boolean) {
    this.loading = state;
    this.layoutService.setSearchConfig({
      loading: state,
    });
  }
  onPageUpdate(event: any) {
    this.rows = event.rows;
    this.page = Math.floor(event.first / event.rows) + 1;
    this.loadData();
  }

  navigateToDetail(branch: Branch) {
    this.router.navigate(['/branch/view/', branch.id]);
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
    this.selectedBranch = undefined;
    this.quickView = false;
    this.loadData();
  }
  onUpdated(branch: any) {
    let branchIndex = this.branches.findIndex(
      (item: Branch) => item.id == branch.id,
    );
    this.branches[branchIndex] = branch;
  }
}
