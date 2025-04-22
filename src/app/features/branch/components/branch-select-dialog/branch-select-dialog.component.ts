import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  faTimes,
  faChevronDown,
  faChevronUp,
  faRefresh,
  faPlus,
  faBuilding,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Branch, BusinessUnit, Company } from '../../interfaces/branch';
import { BranchService } from '../../services/branch.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branch-select-dialog',
  imports: [CommonModule, FontAwesomeModule, FormsModule, RouterModule],
  templateUrl: './branch-select-dialog.component.html',
  styleUrl: './branch-select-dialog.component.css',
})
export class BranchSelectDialogComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faRefresh = faRefresh;
  faPlus = faPlus;
  faBuilding = faBuilding;
  faLocationDot = faLocationDot;

  filterByCompany = false;
  companyId?: number;
  companies: Company[] = [];

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
    private branchService: BranchService,
    private fcFilterDialogService: FcFilterDialogService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
    if (this.config.data.companyId !== undefined) {
      this.filterByCompany = true;
      this.companyId = this.config.data.companyId;
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
    dataListParameter.filterObj = filterObj;
    dataListParameter.searchQuery = searchQuery;

    if (this.filterByCompany)
      dataListParameter.filterObj += `${
        dataListParameter.filterObj ? '&' : ''
      }companies-id=${this.companyId}`;

    this.branchService
      .getCompanies(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.companies = res.data.companies;
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

  submit(company: Company, branch: Branch, businessUnit: BusinessUnit) {
    this.ref.close({ ...businessUnit, company: company, branch: branch });
  }

  onClose() {
    this.ref.close();
  }
}
