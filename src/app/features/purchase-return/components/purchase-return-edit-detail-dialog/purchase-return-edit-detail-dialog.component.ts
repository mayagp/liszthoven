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
import { GoodsReceiptDetailSelectDialogComponent } from '../../../goods-receipt/components/goods-receipt-detail-select-dialog/goods-receipt-detail-select-dialog.component';
import { Product } from '../../../product/interfaces/product';
import { PurchaseInvoiceDetailSelectDialogComponent } from '../../../purchase-invoice/components/purchase-invoice-detail-select-dialog/purchase-invoice-detail-select-dialog.component';
import { PurchaseReturnService } from '../../services/purchase-return.service';
import { MessageService } from 'primeng/api';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-return-edit-detail-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    IftaLabelModule,
    InputNumberModule,
    ToastModule,
  ],
  templateUrl: './purchase-return-edit-detail-dialog.component.html',
  styleUrl: './purchase-return-edit-detail-dialog.component.css',
})
export class PurchaseReturnEditDetailDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faSpinner = faSpinner;
  faChevronDown = faChevronDown;

  loading = false;
  loadingButton = false;
  title = '';
  purchaseReturnId: string = '';
  purchaseReturnDetailId: string = '';
  purchaseReturnDetailForm: FormGroup;
  showGoodsReceipt = false;
  currentProducts: Product[] = [];
  supplierId: number | null = null;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
    private purchaseReturnService: PurchaseReturnService,
    private messageService: MessageService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }

    if (this.config.data.currentProducts) {
      this.currentProducts = this.config.data.currentProducts;
    }

    if (this.config.data.purchaseReturnId) {
      this.purchaseReturnId = this.config.data.purchaseReturnId;
    }
    if (this.config.data.purchaseReturnDetailId) {
      this.purchaseReturnDetailId = this.config.data.purchaseReturnDetailId;
    }

    if (this.config.data.supplierId) {
      this.supplierId = this.config.data.supplierId;
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
          supplierId: this.supplierId,
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
          supplierId: this.supplierId,
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
    if (this.purchaseReturnDetailForm.valid && this.loadingButton == false) {
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
    this.loadingButton = true;
    let bodyReqForm: FormGroup;
    bodyReqForm = new FormGroup({
      purchaseable_id: new FormControl(
        this.purchaseReturnDetailForm.value.purchaseable.id,
      ),
      quantity: new FormControl(this.purchaseReturnDetailForm.value.quantity),
      amount: new FormControl(this.purchaseReturnDetailForm.value.amount),
    });
    // if (this.purchaseReturnDetailForm.value.quantity > this.quantityAllowed) {
    //   this.loadingButton = false;
    //   // Toast
    //   this.messageService.add({
    //     header: 'Purchase Return',
    //     message: 'Max quantity allowed is ' + this.quantityAllowed + 'Pcs',
    //     lottieOption: {
    //       path: '/assets/lotties/warning.json',
    //       loop: false,
    //     },
    //   });
    // } else {
    if (this.config.data.purchaseReturnDetail) {
      this.purchaseReturnService
        .updatePurchaseReturnDetail(
          this.purchaseReturnId,
          this.purchaseReturnDetailId,
          bodyReqForm.value,
        )
        .subscribe({
          next: (res: any) => {
            this.loadingButton = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Return Detail',
              detail: res.message,
            });
            this.ref.close(res.data);
          },
          error: (err) => {
            this.loadingButton = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Purchase Return Detail',
              detail: err.message,
            });
          },
        });
    } else {
      this.purchaseReturnService
        .addPurchaseReturnDetail(this.purchaseReturnId, bodyReqForm.value)
        .subscribe({
          next: (res: any) => {
            this.loadingButton = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Return Detail',
              detail: res.message,
            });
            this.ref.close(res.data);
          },
          error: (err) => {
            this.loadingButton = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Purchase Return Detail',
              detail: err.message,
            });
          },
        });
    }
  }
  // }
}
