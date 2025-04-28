import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
import {
  faBars,
  faBuilding,
  faEye,
  faFilter,
  faList,
  faLocationDot,
  faPhone,
  faPlus,
  faRefresh,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, take, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Staff } from '../../interfaces/staff';
import { StaffService } from '../../services/staff.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { FcFilterDialogComponent } from '../../../../shared/components/fc-filter-dialog/fc-filter-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';

@Component({
  selector: 'app-staff-list',
  imports: [
    CommonModule,
    FontAwesomeModule,
    DynamicDialogModule,
    FcActionBarComponent,
  ],
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.css'],
  providers: [DialogService],
})
export class StaffListComponent {
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
      route: ['/staff/add'],
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
      fields: [{ name: 'created_at', header: 'Created At' }],
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

  staffs: Staff[] = [];
  selectedStaff: Staff | undefined;

  constructor(
    private layoutService: LayoutService,
    private staffService: StaffService,
    private router: Router,
    private route: ActivatedRoute,
    private ability: PureAbility,
    private fcFilterDialogService: FcFilterDialogService,
    private dialogService: DialogService,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'staff');
    this.layoutService.setHeaderConfig({
      title: 'Staff',
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
          featureName: 'staff',
          baseHref: '/staff/list',
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
      featureName: 'staff',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'staff') {
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
  onChangeStaff(staff: Staff) {
    this.selectedStaff = staff;
  }
  onChangeQuickView() {
    this.quickView = !this.quickView;
    this.filterButtons[2].icon = this.quickView ? faList : faBars;
    if (!this.quickView) {
      this.layoutService.setHeaderConfig({
        title: 'Staffs',
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

    dataListParameter.filterObj += `status=0`;

    this.destroy$.next();
    this.staffService
      .getStaffs(dataListParameter)
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
          this.staffs = res.data.staff;
          // set selected staff for quickview purpose
          if (!this.selectedStaff) {
            if (this.staffs.length > 0) {
              this.selectedStaff = this.staffs[0];
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
  navigateToDetail(staff: Staff) {
    this.router.navigate(['/staff/view/', staff.id]);
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
    this.selectedStaff = undefined;
    this.quickView = false;
    this.loadData();
  }
  onUpdated(staff: any) {
    let staffIndex = this.staffs.findIndex(
      (item: Staff) => item.id == staff.id,
    );
    this.staffs[staffIndex] = staff;
  }
}
