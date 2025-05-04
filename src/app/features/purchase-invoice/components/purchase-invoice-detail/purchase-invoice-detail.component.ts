import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { RouterModule } from '@angular/router';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { PurchaseInvoiceDetail } from '../../interfaces/purchase-invoice';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';

@Component({
  selector: 'app-purchase-invoice-detail',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcImagePreviewComponent,
    RouterModule,
    FcCurrencyPipe,
  ],
  templateUrl: './purchase-invoice-detail.component.html',
  styleUrl: './purchase-invoice-detail.component.css',
})
export class PurchaseInvoiceDetailComponent {
  @Input() purchaseInvoiceDetail: PurchaseInvoiceDetail =
    {} as PurchaseInvoiceDetail;
  @Input() index: number = 0;
  @Input() canEdit: boolean = false;
  @Input() loadPurchaseOrder: boolean = false;
  @Output() onEditPurchaseInvoiceDetail = new EventEmitter<number>();
  @Output() onDeletePurchaseInvoiceDetail = new EventEmitter<number>();
  faPencil = faPencil;
  faTrash = faTrash;

  editPurchaseInvoiceDetail() {
    this.onEditPurchaseInvoiceDetail.emit(this.index);
  }
  deletePurchaseInvoiceDetail() {
    this.onDeletePurchaseInvoiceDetail.emit(this.index);
  }
}
