import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
  faChevronDown,
  faPencil,
  faTrash,
  faPlus,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
  DialogService,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subject } from 'rxjs';
import { ProductSelectDialogComponent } from '../../../product/components/product-select-dialog/product-select-dialog.component';
import { SupplierQuotationSelectDetailDialogComponent } from '../../../supplier-quotation/components/supplier-quotation-select-detail-dialog/supplier-quotation-select-detail-dialog.component';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { MessageService } from 'primeng/api';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';

@Component({
  selector: 'app-purchase-order-edit-detail',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    IftaLabelModule,
    ToastModule,
    FcInputTextComponent,
  ],
  templateUrl: './purchase-order-edit-detail.component.html',
  styleUrl: './purchase-order-edit-detail.component.css',
})
export class PurchaseOrderEditDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faPencil = faPencil;
  faTrash = faTrash;
  faPlus = faPlus;
  faSpinner = faSpinner;

  title = '';
  purchaseOrderId: string = '';
  purchaseOrderDetailId: string = '';

  purchaseOrderDetailForm: FormGroup;
  existingPurchaseOrderDetails: any;
  loadingButton = false;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService,
    private purchaseOrderService: PurchaseOrderService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
    if (this.config.data.purchaseOrderId) {
      this.purchaseOrderId = this.config.data.purchaseOrderId;
    }
    if (this.config.data.purchaseOrderDetailId) {
      this.purchaseOrderDetailId = this.config.data.purchaseOrderDetailId;
    }

    // Existing Data
    if (this.config.data.existingPurchaseOrderDetails) {
      this.existingPurchaseOrderDetails =
        this.config.data.existingPurchaseOrderDetails;
    }

    this.purchaseOrderDetailForm = new FormGroup({
      quotation_no: new FormControl('', Validators.required),
      supplier_quotation: new FormControl(null),
      product: new FormControl(null, Validators.required),
      price_per_unit: new FormControl(null, Validators.required),
      quantity_ordered: new FormControl(null, Validators.required),
      expected_delivery_date: new FormControl(null),
    });

    if (this.config.data.purchaseOrderDetail) {
      const data = this.config.data.purchaseOrderDetail;
      this.purchaseOrderDetailForm.patchValue({
        quotation_no: data.quotation_no,
        supplier_quotation: data.supplier_quotation,
        product: data.product,
        price_per_unit: data.price_per_unit,
        quantity_ordered: data.quantity_ordered,
        expected_delivery_date: data.expected_delivery_date,
      });
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isSubmitAllowed(): boolean {
    if (this.purchaseOrderDetailForm.valid && this.loadingButton == false) {
      return true;
    } else {
      return false;
    }
  }

  removeProduct() {
    this.purchaseOrderDetailForm.controls['product'].setValue(null);
  }

  onSelectProduct() {
    let existProduct: any[] = [];
    // Push for Existing Product
    if (this.existingPurchaseOrderDetails.length > 0) {
      this.existingPurchaseOrderDetails.forEach((data: any) => {
        existProduct.push({
          product: data.product,
        });
      });
    } else {
      if (this.purchaseOrderDetailForm.value.product != null) {
        existProduct.push({
          product: this.purchaseOrderDetailForm.value.product,
        });
      }
    }

    const ref = this.dialogService.open(ProductSelectDialogComponent, {
      data: {
        title: 'Select Product',
        existingProduct: existProduct,
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
    ref.onClose.subscribe((product) => {
      if (product) {
        this.purchaseOrderDetailForm.controls['product'].setValue(product);
      }
    });
  }

  onSelectSupplierQuotation() {
    let existProduct: any[] = [];
    if (this.existingPurchaseOrderDetails.length > 0) {
      this.existingPurchaseOrderDetails.forEach((data: any) => {
        existProduct.push({
          product: data.product,
        });
      });
    }

    const ref = this.dialogService.open(
      SupplierQuotationSelectDetailDialogComponent,
      {
        data: {
          title: 'Select Supplier Quotation',
          existingProduct: existProduct,
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
      },
    );
    ref.onClose.subscribe((supplierQuotation) => {
      if (supplierQuotation) {
        this.purchaseOrderDetailForm.patchValue({
          supplier_quotation: supplierQuotation,
          quotation_no: supplierQuotation.quotation_no,
          product: supplierQuotation.product,
          price_per_unit: supplierQuotation.price_per_unit,
          expected_delivery_date: supplierQuotation.expected_delivery_date,
        });
      }
    });
  }

  removeSupplierQuotation() {
    this.purchaseOrderDetailForm.reset();
  }

  onClose() {
    this.ref.close();
  }

  submit() {
    this.loadingButton = true;
    let bodyReq: any = {
      quotation_no: this.purchaseOrderDetailForm.value.quotation_no,
      product_id: this.purchaseOrderDetailForm.value.product.id,
      price_per_unit: this.purchaseOrderDetailForm.value.price_per_unit,
      quantity_ordered: this.purchaseOrderDetailForm.value.quantity_ordered,
      expected_delivery_date:
        this.purchaseOrderDetailForm.value.expected_delivery_date,
    };
    if (this.purchaseOrderDetailForm.value.supplier_quotation) {
      bodyReq.supplier_quotation_id =
        this.purchaseOrderDetailForm.value.supplier_quotation.supplier_quotation_id;
    }
    // Update Purchase Order Detail
    if (this.config.data.purchaseOrderDetail) {
      this.purchaseOrderService
        .updatePurchaseOrderDetail(
          this.purchaseOrderId,
          bodyReq,
          this.purchaseOrderDetailId,
        )
        .subscribe({
          next: (res: any) => {
            this.loadingButton = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Order Detail',
              detail: res.message,
            });
            this.ref.close(this.purchaseOrderDetailForm.value);
          },
          error: (err) => {
            this.loadingButton = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Purchase Order Detail',
              detail: err.message,
            });
          },
        });
    }
    // Create Purchase Order Detail
    else {
      this.purchaseOrderService
        .addPurchaseOrderDetail(this.purchaseOrderId, bodyReq)
        .subscribe({
          next: (res: any) => {
            this.loadingButton = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Order Detail',
              detail: res.message,
            });
            this.ref.close(res.data);
          },
          error: (err) => {
            this.loadingButton = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Purchase Order Detail',
              detail: err.message,
            });
          },
        });
    }
  }
}
