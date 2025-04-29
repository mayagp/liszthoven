import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faSpinner,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { Product } from '../../../product/interfaces/product';
import { ProductService } from '../../../product/services/product.service';
import { SupplierQuotation } from '../../interfaces/supplier-quotation';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-supplier-quotation-detail-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FcImagePreviewComponent,
    FcCurrencyPipe,
    InputNumberModule,
    IftaLabelModule,
  ],
  templateUrl: './supplier-quotation-detail-add-dialog.component.html',
  styleUrl: './supplier-quotation-detail-add-dialog.component.css',
})
export class SupplierQuotationDetailAddDialogComponent {
  private readonly destroy$: any = new Subject();

  faTimes = faTimes;
  faSpinner = faSpinner;
  faRefresh = faRefresh;

  title = 'Add Supplier Quotation';
  supplierQuotation: SupplierQuotation = {} as SupplierQuotation;
  supplierQuotationForm: FormGroup;
  products: Product[] = [];
  currentProducts: Product[] = [];
  selectedProduct: Product | undefined;

  loading = false;
  searchQuery: string = '';
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private productService: ProductService,
  ) {
    this.supplierQuotationForm = new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity: new FormControl(null, Validators.required),
      price_per_unit: new FormControl(null, Validators.required),
    });
    if (this.config.data) {
      if (this.config.data.title) {
        this.title = this.config.data.title;
      }
      if (this.config.data.currentProducts) {
        this.currentProducts = this.config.data.currentProducts;
      }
      if (this.config.data.supplierQuotationDetail) {
        let supplierQuotationDetail = this.config.data.supplierQuotationDetail;
        this.supplierQuotationForm.patchValue({
          product: supplierQuotationDetail.product,
          quantity: supplierQuotationDetail.quantity,
          price_per_unit: supplierQuotationDetail.price_per_unit,
        });
        this.selectedProduct = supplierQuotationDetail.product;
        // remove product from currentProducts
        this.currentProducts = this.currentProducts.filter(
          (x: any) => x.id !== supplierQuotationDetail.product.id,
        );
      }
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
      .subscribe((res: any) => {
        let response = res.data.products;
        this.loading = false;
        this.products = response.map((data: any) => {
          let isExist = this.currentProducts.find((x: any) => x.id === data.id);
          if (isExist) {
            return { ...data, isExist: true };
          } else {
            return { ...data, isExist: false };
          }
        });
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
  onSelectProduct(product: any) {
    this.selectedProduct = product;
    this.supplierQuotationForm.patchValue({
      product: product,
    });
  }
  onRemoveProduct() {
    this.selectedProduct = undefined;
    this.supplierQuotationForm.patchValue({
      product: null,
    });
  }

  onClose() {
    this.ref.close();
  }

  isSubmitAllowed(): boolean {
    if (this.supplierQuotationForm.valid) {
      return true;
    } else {
      return false;
    }
  }

  submit() {
    this.ref.close(this.supplierQuotationForm.value);
  }
}
