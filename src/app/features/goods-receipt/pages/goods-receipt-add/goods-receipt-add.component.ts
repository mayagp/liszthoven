import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faChevronDown,
  faPlus,
  faEye,
  faTrash,
  faPencil,
  faArrowRight,
  faRefresh,
  faCloudArrowUp,
  faFile,
  faFloppyDisk,
  faXmark,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { AutoNumberService } from '../../../../shared/services/auto-number.service';
import { PurchaseInvoiceSelectDialogComponent } from '../../../purchase-invoice/components/purchase-invoice-select-dialog/purchase-invoice-select-dialog.component';
import { PurchaseInvoiceService } from '../../../purchase-invoice/services/purchase-invoice.service';
import { WarehouseSelectDialogComponent } from '../../../warehouse/components/warehouse-select-dialog/warehouse-select-dialog.component';
import { GoodsReceiptDetailAddDialogComponent } from '../../components/goods-receipt-detail-add-dialog/goods-receipt-detail-add-dialog.component';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcFileInputComponent } from '../../../../shared/components/fc-file-input/fc-file-input.component';

@Component({
  selector: 'app-goods-receipt-add',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    ToastModule,
    ConfirmDialogModule,
    FcInputTextComponent,
    DatePickerModule,
    IftaLabelModule,
    FcImagePreviewComponent,
    RouterModule,
    FcFileInputComponent,
  ],
  templateUrl: './goods-receipt-add.component.html',
  styleUrl: './goods-receipt-add.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class GoodsReceiptAddComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faArrowRight = faArrowRight;
  faRefresh = faRefresh;
  faCloudArrowUp = faCloudArrowUp;
  faFile = faFile;
  faFloppyDisk = faFloppyDisk;
  faXmark = faXmark;

  purchaseNoteType: any = [
    {
      id: 0,
      name: 'Debit',
    },
    {
      id: 1,
      name: 'Credit',
    },
  ];

  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      action: () => {
        this.submit();
      },
      hidden: true,
    },
  ];

  loading = false;
  goodsReceiptForm: FormGroup;
  goodsReceiptNumber: string = '';

  constructor(
    private layoutService: LayoutService,
    private goodsReceiptService: GoodsReceiptService,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private autoNumberService: AutoNumberService,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'goods-receipt');

    this.layoutService.setHeaderConfig({
      title: 'Add Goods Receipt',
      icon: '',
      showHeader: true,
    });
    this.goodsReceiptForm = new FormGroup({
      purchase_invoice: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      note: new FormControl(null),
      warehouse: new FormControl(null, Validators.required),
      goods_receipt_details: new FormArray([]),
      goods_receipt_documents: new FormArray([]),
    });
    this.generateAutoNumber();
  }

  ngOnInit(): void {
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  hasRequiredValidator(controlName: string): boolean {
    const control = this.goodsReceiptForm.get(controlName);
    if (!control || !control.validator) return false;

    const validator = control.validator({} as AbstractControl);
    return validator && validator['required'];
  }

  generateAutoNumber() {
    this.autoNumberService
      .getAutoNumberByTabel('goods_receipts')
      .subscribe((res: any) => {
        this.goodsReceiptNumber = res.latest_auto_number;
      });
  }

  get goodsReceiptDetails(): FormArray {
    return this.goodsReceiptForm.get('goods_receipt_details') as FormArray;
  }

  generateGoodsReceiptDetails(goodsReceiptDetails: any): FormGroup {
    let goodsReceiptDetailForm = new FormGroup({
      product: new FormControl(goodsReceiptDetails.product),
      quantity: new FormControl(goodsReceiptDetails.quantity),
      gr_serial_numbers: new FormArray([]),
    });

    if (goodsReceiptDetails.gr_serial_numbers) {
      goodsReceiptDetails.gr_serial_numbers.forEach((data: any) => {
        let fg = new FormGroup({
          serial_number: new FormControl(data.serial_number),
        });
        (goodsReceiptDetailForm.get('gr_serial_numbers') as FormArray).push(fg);
      });
    }
    return goodsReceiptDetailForm;
  }

  removePurchaseInvoice() {
    this.goodsReceiptForm.controls['purchase_invoice'].setValue('');
    this.goodsReceiptForm.removeControl('goods_receipt_details');
    this.goodsReceiptForm.addControl(
      'goods_receipt_details',
      new FormArray([]),
    );
  }

  onSelectPurchaseInvoice() {
    const ref = this.dialogService.open(PurchaseInvoiceSelectDialogComponent, {
      data: {
        title: 'Select Purchase Invoice',
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
    ref.onClose.subscribe((purchaseInvoice) => {
      if (purchaseInvoice) {
        this.goodsReceiptForm.patchValue({
          purchase_invoice: purchaseInvoice,
        });
        this.setAllowedDetail();
      }
    });
  }

  setAllowedDetail() {
    this.purchaseInvoiceService
      .getPurchaseInvoice(this.goodsReceiptForm.value.purchase_invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((purchaseInvoice: any) => {
        this.goodsReceiptForm.patchValue({
          purchase_invoice: purchaseInvoice.data,
        });
      });
  }

  onAddGoodsReceiptDetail() {
    if (
      this.goodsReceiptForm.value.purchase_invoice &&
      this.goodsReceiptForm.value.warehouse
    ) {
      const ref = this.dialogService.open(
        GoodsReceiptDetailAddDialogComponent,
        {
          data: {
            title: 'Add Goods Receipt Detail',
            purchaseInvoiceDetails:
              this.goodsReceiptForm.value.purchase_invoice
                .purchase_invoice_details,
            goodsReceiptDetails: this.goodsReceiptDetails.value,
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
          width: '500px',
        },
      );
      ref.onClose.subscribe((goodsReceiptDetail) => {
        if (goodsReceiptDetail) {
          this.goodsReceiptDetails.push(
            this.generateGoodsReceiptDetails(goodsReceiptDetail),
          );
        }
      });
    } else {
      this.messageService.add({
        severity: 'warning',
        summary: 'Goods Receipt Detail',
        detail: 'Please select purchase invoice and warehouse first!',
      });
    }
  }

  onEditGoodsReceiptDetail(index: number) {
    const ref = this.dialogService.open(GoodsReceiptDetailAddDialogComponent, {
      data: {
        title: 'Edit Delivery Order Detail',
        purchaseInvoiceDetails:
          this.goodsReceiptForm.value.purchase_invoice.purchase_invoice_details,
        goodsReceiptDetails: this.goodsReceiptDetails.value,
        goodsReceiptDetail: this.goodsReceiptDetails.value[index],
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
      width: '500px',
    });
    ref.onClose.subscribe((newData) => {
      if (newData) {
        this.goodsReceiptDetails.controls[index].patchValue(newData);
      }
    });
  }

  onRemoveGoodsReceiptDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      accept: () => {
        this.goodsReceiptDetails.removeAt(index);
      },
    });
  }
  onSelectWarehouse() {
    const ref = this.dialogService.open(WarehouseSelectDialogComponent, {
      data: {
        title: 'Select Warehouse',
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
    ref.onClose.subscribe((warehouse) => {
      if (warehouse) {
        this.goodsReceiptForm.controls['warehouse'].setValue(warehouse);
      }
    });
  }

  removeWarehouse() {
    this.goodsReceiptForm.controls['warehouse'].setValue('');
  }

  // manage document files
  get documentFilesArray() {
    return this.goodsReceiptForm.get('goods_receipt_documents') as FormArray;
  }

  addMultipleFiles(files: any) {
    files.forEach((element: any) => {
      const dotIndex = element.file.name.lastIndexOf('.');
      let fileType = '';
      if (dotIndex !== -1) {
        // Extract the "type" part from the input
        fileType = element.file.name.substring(dotIndex);
      }
      this.documentFilesArray.push(
        new FormGroup({
          file: new FormControl(element.file),
          src: new FormControl(element.img_src),
          original_name: new FormControl(element.file.name),
          file_type: new FormControl(fileType),
          inputChangeName: new FormControl(false),
        }),
      );
    });
  }

  fileType(fileName: string) {
    if (fileName.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) != null) {
      return 'image';
    } else if (fileName.toLowerCase().match(/\.(pdf)$/) != null) {
      return 'pdf';
    } else {
      return 'file';
    }
  }

  changeDocumentName(index: number) {
    const documentFile = this.documentFilesArray.at(index);
    if (documentFile.value.inputChangeName == true) {
      documentFile.patchValue({
        original_name:
          documentFile.value.original_name + documentFile.value.file_type,
        inputChangeName: false,
      });
    } else {
      documentFile.patchValue({
        inputChangeName: true,
        original_name: documentFile.value.original_name.replace(
          documentFile.value.file_type,
          '',
        ),
      });
    }
  }

  removeDocument(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this document?',
      accept: () => {
        this.documentFilesArray.removeAt(index);
      },
    });
  }

  submit() {
    if (this.goodsReceiptForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.goodsReceiptForm);
      return;
    }
    if (this.goodsReceiptForm.valid) {
      let bodyReqForm: FormGroup;
      bodyReqForm = new FormGroup({
        purchase_invoice_id: new FormControl(
          this.goodsReceiptForm.value.purchase_invoice.id,
        ),
        date: new FormControl(this.goodsReceiptForm.value.date),
        note: new FormControl(this.goodsReceiptForm.value.note),
        warehouse_id: new FormControl(this.goodsReceiptForm.value.warehouse.id),
        goods_receipt_details: new FormArray([]),
      });
      if (this.goodsReceiptForm.value.goods_receipt_details) {
        let goodsReceiptDetailArrayForm: any = bodyReqForm.get(
          'goods_receipt_details',
        );
        this.goodsReceiptForm.value.goods_receipt_details.forEach(
          (data: any) => {
            let fg = new FormGroup({
              product_id: new FormControl(data.product.id),
              quantity: new FormControl(data.quantity),
              gr_serial_numbers: new FormArray([]),
            });
            if (data.gr_serial_numbers) {
              data.gr_serial_numbers.forEach((serialNumber: any) => {
                let serialNumberFg = new FormGroup({
                  serial_number: new FormControl(serialNumber.serial_number),
                });
                (fg.get('gr_serial_numbers') as FormArray).push(serialNumberFg);
              });
            }
            goodsReceiptDetailArrayForm.push(fg);
          },
        );
      }

      this.goodsReceiptService.addGoodsReceipt(bodyReqForm.value).subscribe({
        next: (res: any) => {
          if (this.goodsReceiptForm.value.goods_receipt_documents.length) {
            let bodyReqDocument = new FormData();
            this.goodsReceiptForm.value.goods_receipt_documents.forEach(
              (file: any, index: number) => {
                bodyReqDocument.append(
                  `goods_receipt_documents[${index}][file]`,
                  file.file,
                );
                bodyReqDocument.append(
                  `goods_receipt_documents[${index}][original_name]`,
                  file.original_name,
                );
              },
            );
            this.goodsReceiptService
              .addGoodsReceiptDocuments(res.data.id, bodyReqDocument)
              .subscribe({
                next: (documentRes: any) => {
                  this.actionButtons[0].loading = false;
                  this.messageService.clear();
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Goods Receipt',
                    detail: res.message,
                  });
                  if (this.goodsReceiptNumber != res.data.goods_receipt_n0) {
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Success Message',
                      detail:
                        'Goods Receipt Number has been changed because of duplicate',
                    });
                  }
                  this.router.navigate(['/goods-receipt/view/', res.data.id]);
                },
                error: (err) => {
                  this.actionButtons[0].loading = false;
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Goods Receipt Document',
                    detail: err.message,
                  });
                },
              });
          } else {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Return',
              detail: res.message,
            });
            this.router.navigate(['/goods-receipt/view/', res.data.id]);
          }
        },
        error: (err) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Goods Receipt',
            detail: err.message,
          });
        },
      });
    } else {
      // Toast
      this.messageService.add({
        summary: 'Goods Receipt',
        detail: 'Fill the form first!',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    }
  }
}
