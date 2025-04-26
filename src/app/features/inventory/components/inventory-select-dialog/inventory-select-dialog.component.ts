import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { ProductService } from '../../../product/services/product.service';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';

@Component({
  selector: 'app-inventory-select-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FcImagePreviewComponent,
  ],
  templateUrl: './inventory-select-dialog.component.html',
  styleUrl: './inventory-select-dialog.component.css',
})
export class InventorySelectDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;

  inventories: any;
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

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private fcFilterDialogService: FcFilterDialogService,
  ) {
    if (this.config.data.inventories) {
      this.allowedFilteringData = false;
      this.inventories = this.config.data.inventories;
    }

    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
  }

  ngOnInit(): void {}

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

  onPageUpdate(pagination: any) {
    let page = pagination.page;
    let rows = pagination.rows;
    this.rows = rows;
    if (page > 0) {
      this.page = page;
    } else {
      this.page = 1;
    }
  }

  search() {
    this.page = 1;
  }

  submit(res: any) {
    this.ref.close(res);
  }
  onClose() {
    this.ref.close();
  }
}
