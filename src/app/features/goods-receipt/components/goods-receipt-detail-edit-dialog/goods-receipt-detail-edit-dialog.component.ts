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
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { ProductSelectDialogComponent } from '../../../product/components/product-select-dialog/product-select-dialog.component';
import { Product } from '../../../product/interfaces/product';
import { Warehouse } from '../../../warehouse/interfaces/warehouse';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-goods-receipt-detail-edit-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    IftaLabelModule,
    ToastModule,
    // FcInputTextComponent
  ],
  templateUrl: './goods-receipt-detail-edit-dialog.component.html',
  styleUrl: './goods-receipt-detail-edit-dialog.component.css',
})
export class GoodsReceiptDetailEditDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faSpinner = faSpinner;
  faChevronDown = faChevronDown;

  loading = false;
  loadingButton = false;
  title = '';
  products: Product[] = [];
  currentProducts: Product[] = [];
  allowedPOD: any;
  selectedWarehouse!: Warehouse;
  goodsReceiptDetailForm: FormGroup;
  goodsReceiptId: string = '';
  goodsReceiptDetailId: string = '';

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService,
    private goodsReceiptService: GoodsReceiptService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }

    if (this.config.data.goodsReceiptId) {
      this.goodsReceiptId = this.config.data.goodsReceiptId;
    }

    if (this.config.data.goodsReceiptDetailId) {
      this.goodsReceiptDetailId = this.config.data.goodsReceiptDetailId;
    }

    if (this.config.data.currentProducts) {
      this.currentProducts = this.config.data.currentProducts;
    }

    if (this.config.data.products) {
      this.products = this.config.data.products;
    }

    if (this.config.data.allowedPOD) {
      this.allowedPOD = this.config.data.allowedPOD;
    }

    if (this.config.data.selectedWarehouse) {
      this.selectedWarehouse = this.config.data.selectedWarehouse;
    }

    this.goodsReceiptDetailForm = new FormGroup({
      product: new FormControl('', Validators.required),
      quantity: new FormControl(null, Validators.required),
    });

    if (this.config.data.goodsReceiptDetail) {
      let data = this.config.data.goodsReceiptDetail;

      const selectedPOD = this.allowedPOD.find((value: any) => {
        return value.product_id == data.product.id;
      });

      const selectedPOW = selectedPOD.purchase_order_warehouses.find(
        (value: any) => {
          return value.warehouse_id == this.selectedWarehouse;
        },
      );

      this.quantityAllowed =
        selectedPOW.quantity_ordered - selectedPOW.quantity_received;

      this.goodsReceiptDetailForm.patchValue({
        product: data.product,
        quantity: data.quantity,
      });
    }
  }

  ngOnInit(): void {}

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  quantityAllowed!: number;
  onSelectProduct() {
    const ref = this.dialogService.open(ProductSelectDialogComponent, {
      data: {
        title: 'Select Product',
        existingProduct: this.currentProducts,
        products: this.products,
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
        const selectedPOD = this.allowedPOD.find((value: any) => {
          return value.product_id == product.id;
        });

        const selectedPOW = selectedPOD.purchase_order_warehouses.find(
          (value: any) => {
            return value.warehouse_id == this.selectedWarehouse;
          },
        );

        this.quantityAllowed =
          selectedPOW.quantity_ordered - selectedPOW.quantity_received;
        this.goodsReceiptDetailForm.controls['quantity'].setValue(
          this.quantityAllowed,
        );
        // setvalue
        this.goodsReceiptDetailForm.controls['product'].setValue(product);
      }
    });
  }

  removeProduct() {
    this.goodsReceiptDetailForm.controls['product'].setValue('');
  }

  isSubmitAllowed(): boolean {
    if (this.goodsReceiptDetailForm.valid && this.loadingButton == false) {
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
    if (this.goodsReceiptDetailForm.value.quantity > this.quantityAllowed) {
      this.loadingButton = false;
      // Toast
      this.messageService.add({
        summary: 'Goods Receipt',
        detail: 'Max quantity allowed is ' + this.quantityAllowed + 'Pcs',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    } else {
      let bodyReqForm: FormGroup;
      bodyReqForm = new FormGroup({
        product_id: new FormControl(
          this.goodsReceiptDetailForm.value.product.id,
        ),
        quantity: new FormControl(this.goodsReceiptDetailForm.value.quantity),
      });
      if (this.config.data.goodsReceiptDetail) {
        this.goodsReceiptService
          .updateGoodsReceiptDetail(
            this.goodsReceiptId,
            this.goodsReceiptDetailId,
            bodyReqForm.value,
          )
          .subscribe({
            next: (res: any) => {
              this.loadingButton = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt Detail',
                detail: res.message,
              });
              this.ref.close(res.data);
            },
            error: (err) => {
              this.loadingButton = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt Detail',
                detail: err.message,
              });
            },
          });
      } else {
        this.goodsReceiptService
          .addGoodsReceiptDetail(this.goodsReceiptId, bodyReqForm.value)
          .subscribe({
            next: (res: any) => {
              this.loadingButton = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt Detail',
                detail: res.message,
              });
              this.ref.close(res.data);
            },
            error: (err) => {
              this.loadingButton = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt Detail',
                detail: err.message,
              });
            },
          });
      }
    }
  }
}
