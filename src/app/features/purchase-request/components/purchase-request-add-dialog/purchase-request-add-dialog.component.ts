import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  faTimes,
  faSpinner,
  faRefresh,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Product } from '../../../product/interfaces/product';
import { ProductService } from '../../../product/services/product.service';
import {
  PurchaseRequest,
  PurchaseRequestDetail,
} from '../../interfaces/purchase-request';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-request-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FcImagePreviewComponent,
    FcCurrencyPipe,
    InputNumberModule,
    IftaLabelModule,
    ToastModule,
  ],
  templateUrl: './purchase-request-add-dialog.component.html',
  styleUrl: './purchase-request-add-dialog.component.css',
  providers: [MessageService],
})
export class PurchaseRequestAddDialogComponent {
  private readonly destroy$: any = new Subject();

  faTimes = faTimes;
  faSpinner = faSpinner;
  faRefresh = faRefresh;
  faSearch = faSearch;

  title = 'Add Purchase Request';
  purchaseRequest: PurchaseRequest = {} as PurchaseRequest;
  purchaseRequestForm: FormGroup;
  products: Product[] = [];
  currentProductIds: string[] = [];
  selectedProduct: Product | undefined;

  loading = false;
  searchQuery: string = '';
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;

  purchaseRequestDetails: PurchaseRequestDetail[] = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private productService: ProductService,
    private messageService: MessageService,
  ) {
    if (this.config.data) {
      if (this.config.data.title) {
        this.title = this.config.data.title;
      }
      if (this.config.data.purchaseRequestDetails) {
        this.purchaseRequestDetails = JSON.parse(
          JSON.stringify(this.config.data.purchaseRequestDetails),
        );
        this.currentProductIds = this.purchaseRequestDetails.map(
          (purchaseRequestDetail: PurchaseRequestDetail) => {
            return purchaseRequestDetail.product.id;
          },
        );
      }
    }

    this.purchaseRequestForm = new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity: new FormControl(null, Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadData();
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  loadData() {
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.searchQuery = this.searchQuery;
    dataListParameter.sortBy = 'order_by=id&direction=desc';
    this.productService
      .getProducts(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.totalRecords = res.data.count;
          this.totalPages =
            this.totalRecords > this.rows
              ? Math.ceil(this.totalRecords / this.rows)
              : 1;
          this.products = res.data.products;
          this.products = this.products.map((product: Product) => {
            return {
              ...product,
              isExist: this.currentProductIds.includes(product.id),
            };
          });
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
          });
        },
      });
  }

  search() {
    this.page = 1;
    this.loadData();
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
  onSelectProduct(product: Product) {
    this.selectedProduct = product;
    this.purchaseRequestForm.patchValue({
      product: product,
    });
  }
  onRemoveProduct() {
    this.selectedProduct = undefined;
    this.purchaseRequestForm.patchValue({
      product: null,
    });
  }

  onClose() {
    this.ref.close();
  }
  submit() {
    if (this.purchaseRequestForm.value.quantity > 0) {
      this.ref.close(this.purchaseRequestForm.value);
    } else {
      this.messageService.add({
        severity: 'warning',
        summary: 'Purchase Request Detail',
        detail: 'Quantity must be greater than 0',
      });
    }
  }
}
