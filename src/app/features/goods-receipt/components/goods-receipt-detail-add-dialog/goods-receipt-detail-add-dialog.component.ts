import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faSpinner,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { PurchaseInvoiceDetail } from '../../../purchase-invoice/interfaces/purchase-invoice';
import { GoodsReceiptDetail } from '../../interfaces/goods-receipt';
import { MessageService } from 'primeng/api';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';

@Component({
  selector: 'app-goods-receipt-detail-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    IftaLabelModule,
    ToastModule,
    FcInputTextComponent,
    FcImagePreviewComponent,
    FcCurrencyPipe,
  ],
  templateUrl: './goods-receipt-detail-add-dialog.component.html',
  styleUrl: './goods-receipt-detail-add-dialog.component.css',
})
export class GoodsReceiptDetailAddDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faSpinner = faSpinner;
  faChevronDown = faChevronDown;

  loading = false;
  title = '';

  purchaseInvoiceDetails: PurchaseInvoiceDetail[] = [];
  goodsReceiptDetails: GoodsReceiptDetail[] = [];
  selectedPurchaseInvoiceDetail: PurchaseInvoiceDetail | undefined;
  goodsReceiptDetailForm: FormGroup;

  editable = true;
  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }

    if (this.config.data.purchaseInvoiceDetails) {
      this.purchaseInvoiceDetails = this.config.data.purchaseInvoiceDetails;
    }

    if (this.config.data.goodsReceiptDetails) {
      this.goodsReceiptDetails = this.config.data.goodsReceiptDetails;
      // check if product is already added then add isExisted property
      this.purchaseInvoiceDetails.forEach((purchaseInvoiceDetail) => {
        const isExisted = this.goodsReceiptDetails.find(
          (goodsReceiptDetail) =>
            goodsReceiptDetail.product.id == purchaseInvoiceDetail.product.id,
        );
        if (isExisted) {
          purchaseInvoiceDetail.product.isExist = true;
        }
      });
    }

    this.goodsReceiptDetailForm = new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity: new FormControl(0, Validators.required),
      gr_serial_numbers: new FormArray([]),
    });

    if (this.config.data.goodsReceiptDetail) {
      this.editable = false;
      this.selectedPurchaseInvoiceDetail = this.purchaseInvoiceDetails.find(
        (data) =>
          data.product.id == this.config.data.goodsReceiptDetail.product.id,
      );
      this.goodsReceiptDetailForm.patchValue({
        product: this.config.data.goodsReceiptDetail.product,
        quantity: this.config.data.goodsReceiptDetail.quantity,
      });
      this.config.data.goodsReceiptDetail.gr_serial_numbers.forEach(
        (serial: any) => {
          let serialForm = new FormGroup({
            serial_number: new FormControl(serial.serial_number),
          });
          this.serialNumbers.push(serialForm);
        },
      );
    }
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectProduct(purchaseInvoiceDetail: PurchaseInvoiceDetail) {
    this.selectedPurchaseInvoiceDetail = purchaseInvoiceDetail;
    this.goodsReceiptDetailForm.patchValue({
      product: this.selectedPurchaseInvoiceDetail.product,
      quantity: this.selectedPurchaseInvoiceDetail.remaining_quantity,
    });
    // jika produk adalah produk seralized
    if (this.goodsReceiptDetailForm.value.product.type == 0) {
      this.addSerialNumberField();
    }
  }

  get serialNumbers(): FormArray {
    return this.goodsReceiptDetailForm.get('gr_serial_numbers') as FormArray;
  }

  addSerialNumberField() {
    this.goodsReceiptDetailForm.removeControl('gr_serial_numbers');
    this.goodsReceiptDetailForm.addControl(
      'gr_serial_numbers',
      new FormArray([]),
    );
    if (this.goodsReceiptDetailForm.value.product.type == 0) {
      for (let i = 0; i < this.goodsReceiptDetailForm.value.quantity; i++) {
        let serialForm = new FormGroup({
          serial_number: new FormControl(''),
        });
        this.serialNumbers.push(serialForm);
      }
    }
  }

  removeProduct() {
    this.selectedPurchaseInvoiceDetail = undefined;
    this.goodsReceiptDetailForm.patchValue({
      product: null,
      quantity: 0,
    });
  }

  isSubmitAllowed(): boolean {
    if (this.goodsReceiptDetailForm.valid) {
      if (this.goodsReceiptDetailForm.value.quantity == 0) {
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
    if (this.selectedPurchaseInvoiceDetail) {
      if (
        this.goodsReceiptDetailForm.value.quantity >
        this.selectedPurchaseInvoiceDetail.remaining_quantity
      ) {
        // Toast
        this.messageService.add({
          summary: 'Goods Receipt',
          detail:
            'Max quantity allowed is ' +
            this.selectedPurchaseInvoiceDetail.remaining_quantity +
            'Pcs',
          // lottieOption: {
          //   path: '/assets/lotties/warning.json',
          //   loop: false,
          // },
        });
      } else {
        this.ref.close(this.goodsReceiptDetailForm.value);
      }
    }
  }
}
