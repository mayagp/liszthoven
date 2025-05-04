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
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
  DialogService,
} from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { Product } from '../../../product/interfaces/product';
import { PurchaseInvoiceDetailSelectDialogComponent } from '../../../purchase-invoice/components/purchase-invoice-detail-select-dialog/purchase-invoice-detail-select-dialog.component';
import { PurchaseInvoice } from '../../../purchase-invoice/interfaces/purchase-invoice';
import { GoodsReceipt } from '../../../goods-receipt/interfaces/goods-receipt';
import { GoodsReceiptDetailSelectDialogComponent } from '../../../goods-receipt/components/goods-receipt-detail-select-dialog/goods-receipt-detail-select-dialog.component';
import { MessageService } from 'primeng/api';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-return-add-detail-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    IftaLabelModule,
    InputNumberModule,
    ToastModule,
  ],
  templateUrl: './purchase-return-add-detail-dialog.component.html',
  styleUrl: './purchase-return-add-detail-dialog.component.css',
  providers: [MessageService, DialogService],
})
export class PurchaseReturnAddDetailDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faSpinner = faSpinner;
  faChevronDown = faChevronDown;

  loading = false;
  title = '';
  purchaseInvoices: PurchaseInvoice[] = [];
  goodsReceipts: GoodsReceipt[] = [];
  currentProducts: Product[] = [];
  purchaseReturnDetailForm: FormGroup;
  showGoodsReceipt = false;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }

    if (this.config.data.currentProducts) {
      this.currentProducts = this.config.data.currentProducts;
    }

    if (this.config.data.destination != null) {
      const destination = this.config.data.destination;
      if (destination == 0) {
        this.showGoodsReceipt = true;
      } else {
        this.showGoodsReceipt = false;
      }
    }

    this.purchaseReturnDetailForm = new FormGroup({
      purchaseable: new FormControl('', Validators.required),
      quantity: new FormControl(null, Validators.required),
      amount: new FormControl(null, Validators.required),
    });

    if (this.config.data.purchaseReturnDetail) {
      let data = this.config.data.purchaseReturnDetail;

      this.quantityAllowed = data.purchaseable.quantity;

      this.purchaseReturnDetailForm.patchValue({
        purchaseable: data.purchaseable,
        product: data.product,
        quantity: data.quantity,
        amount: data.amount,
      });
    }
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  quantityAllowed: number = 0;
  onSelectPurchaseInvoice() {
    const ref = this.dialogService.open(
      PurchaseInvoiceDetailSelectDialogComponent,
      {
        data: {
          title: 'Select Purchase Invoice Detail',
          currentProducts: this.currentProducts,
          statusFilter: 'status=2&with_filter=1',
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
    ref.onClose.subscribe((purchaseInvoiceDetail) => {
      if (purchaseInvoiceDetail) {
        this.purchaseReturnDetailForm.controls['purchaseable'].setValue(
          purchaseInvoiceDetail,
        );
        this.quantityAllowed = purchaseInvoiceDetail.remaining_quantity;
      }
    });
  }

  removePurchaseInvoice() {
    this.purchaseReturnDetailForm.controls['purchaseable'].setValue('');
  }

  onSelectGoodsReceipt() {
    const ref = this.dialogService.open(
      GoodsReceiptDetailSelectDialogComponent,
      {
        data: {
          title: 'Select Goods Receipt Detail',
          currentProducts: this.currentProducts,
          statusFilter: 'goods_receipts-status=1&with_filter=1',
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
    ref.onClose.subscribe((goodsReceiptDetail) => {
      if (goodsReceiptDetail) {
        this.purchaseReturnDetailForm.controls['purchaseable'].setValue(
          goodsReceiptDetail,
        );
        this.quantityAllowed = goodsReceiptDetail.quantity;
      }
    });
  }

  removeGoodsReceipt() {
    this.purchaseReturnDetailForm.controls['purchaseable'].setValue('');
  }

  isSubmitAllowed(): boolean {
    if (this.purchaseReturnDetailForm.valid) {
      if (this.purchaseReturnDetailForm.value.quantity == 0) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  onClose() {
    this.ref.close();
  }

  submit() {
    if (this.purchaseReturnDetailForm.value.quantity > this.quantityAllowed) {
      // Toast
      this.messageService.add({
        summary: 'Purchase Return',
        detail: 'Max quantity allowed is ' + this.quantityAllowed + 'Pcs',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    } else {
      this.ref.close(this.purchaseReturnDetailForm.value);
    }
  }
}
