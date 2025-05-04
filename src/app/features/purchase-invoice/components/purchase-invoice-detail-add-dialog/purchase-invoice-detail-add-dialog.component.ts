import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
  DialogService,
} from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { ProductSelectDialogComponent } from '../../../product/components/product-select-dialog/product-select-dialog.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-purchase-invoice-detail-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FcCurrencyPipe,
    IftaLabelModule,
    InputNumberModule,
  ],
  templateUrl: './purchase-invoice-detail-add-dialog.component.html',
  styleUrl: './purchase-invoice-detail-add-dialog.component.css',
})
export class PurchaseInvoiceDetailAddDialogComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;

  searchQuery: string = '';
  loading = false;
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;
  title = '';

  purchaseInvoiceDetailForm: FormGroup;
  purchaseInvoiceDetails: any[] = [];
  purchaseOrderDetails: any;

  selectedPurchaseOrderDetail: any;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
    if (this.config.data.purchaseInvoiceDetails) {
      this.purchaseInvoiceDetails = structuredClone(
        this.config.data.purchaseInvoiceDetails,
      );
    }
    if (this.config.data.purchaseOrderDetails) {
      this.purchaseOrderDetails = structuredClone(
        this.config.data.purchaseOrderDetails,
      );
    }

    // calculate remaining
    // this.purchaseOrderDetails.forEach((purchaseOrderDetail: any) => {
    //   let used_quantity =
    //     this.purchaseInvoiceDetails.find(
    //       (purchaseInvoiceDetail: any) =>
    //         purchaseInvoiceDetail.product.id === purchaseOrderDetail.product.id
    //     )?.quantity || 0;
    //   purchaseOrderDetail.remaining_quantity =
    //     purchaseOrderDetail.remaining_quantity - used_quantity;
    // });

    this.purchaseInvoiceDetailForm = new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity: new FormControl(null, Validators.required),
      unit_price: new FormControl(null, Validators.required),
    });
  }

  ngOnInit(): void {}
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // getter
  get subtotal() {
    return (
      this.purchaseInvoiceDetailForm.value.quantity *
      this.purchaseInvoiceDetailForm.value.unit_price
    );
  }

  // Manage Order detail
  onSelectPurchaseOrderDetail(purchaseOrderDetail: any) {
    this.selectedPurchaseOrderDetail = purchaseOrderDetail;
    this.purchaseInvoiceDetailForm.patchValue({
      product: this.selectedPurchaseOrderDetail.product,
      quantity: this.selectedPurchaseOrderDetail.remaining_quantity,
      unit_price: Number(this.selectedPurchaseOrderDetail.price_per_unit),
    });
  }

  onSelectProduct() {
    // check if product is already added then status exist
    let existProduct: any[] = [];
    if (this.purchaseInvoiceDetails.length > 0) {
      this.purchaseInvoiceDetails.forEach((purchaseInvoiceDetail: any) => {
        existProduct.push({
          product: purchaseInvoiceDetail.product,
        });
      });
    }

    // if (this.purchaseOrderDetails?.purchase_order_details.length > 0) {
    //   this.purchaseOrderDetails.purchase_order_details.forEach(
    //     (purchaseOrderDetail: any) => {
    //       existProduct.push({
    //         product: purchaseOrderDetail.product,
    //       });
    //     }
    //   );
    // }

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
        this.purchaseInvoiceDetailForm.controls['product'].setValue(product);
        this.purchaseInvoiceDetailForm.controls['unit_price'].setValue(
          product.base_price,
        );
      }
    });
  }

  removeProduct() {
    this.purchaseInvoiceDetailForm.controls['product'].setValue(null);
    this.purchaseInvoiceDetailForm.controls['quantity'].setValue(null);
    this.purchaseInvoiceDetailForm.controls['unit_price'].setValue(null);
    this.selectedPurchaseOrderDetail = null;
  }

  // Validation
  isSubmitAllowed(): boolean {
    if (this.purchaseInvoiceDetailForm.valid) {
      return true;
    } else {
      return false;
    }
  }
  onClose() {
    this.ref.close();
  }

  submit() {
    this.purchaseInvoiceDetailForm.patchValue({
      subtotal: this.subtotal,
    });
    this.ref.close(this.purchaseInvoiceDetailForm.value);
  }
}
