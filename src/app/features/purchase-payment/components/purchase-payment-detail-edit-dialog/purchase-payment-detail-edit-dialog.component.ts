import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { PurchaseInvoice } from '../../../purchase-invoice/interfaces/purchase-invoice';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-purchase-payment-detail-edit-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    IftaLabelModule,
    InputNumberModule,
  ],
  templateUrl: './purchase-payment-detail-edit-dialog.component.html',
  styleUrl: './purchase-payment-detail-edit-dialog.component.css',
})
export class PurchasePaymentDetailEditDialogComponent {
  // Icons
  faTimes = faTimes;

  title = '';

  purchasePaymentDetailForm: FormGroup;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }

    this.purchasePaymentDetailForm = new FormGroup({
      purchase_invoice: new FormControl(
        this.config.data.purchasePaymentDetail.purchase_invoice,
      ),
      amount_allocated: new FormControl(
        this.config.data.purchasePaymentDetail.amount_allocated,
      ),
    });
  }

  onSelectPurchaseInvoice(purchaseInvoice: PurchaseInvoice) {
    this.purchasePaymentDetailForm.patchValue({
      purchase_invoice: purchaseInvoice,
      amount_allocated: Number(purchaseInvoice.grandtotal),
    });
  }
  onRemovePurchaseInvoice() {
    this.purchasePaymentDetailForm.reset();
  }
  submit() {
    this.ref.close(this.purchasePaymentDetailForm.value);
  }
  onClose() {
    this.ref.close();
  }
}
