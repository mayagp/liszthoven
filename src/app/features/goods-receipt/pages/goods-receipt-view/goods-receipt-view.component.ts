import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { CommonModule, Location } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  faCloudArrowUp,
  faFile,
  faFloppyDisk,
  faXmark,
  faSpinner,
  faExclamationCircle,
  faSave,
  faCheck,
  faX,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { PurchaseInvoiceService } from '../../../purchase-invoice/services/purchase-invoice.service';
import { PurchaseOrder } from '../../../purchase-order/interfaces/purchase-order';
import { Warehouse } from '../../../warehouse/interfaces/warehouse';
import { GoodsReceiptDetailAddDialogComponent } from '../../components/goods-receipt-detail-add-dialog/goods-receipt-detail-add-dialog.component';
import { GoodsReceipt } from '../../interfaces/goods-receipt';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FcFileInputComponent } from '../../../../shared/components/fc-file-input/fc-file-input.component';

@Component({
  selector: 'app-goods-receipt-view',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    ToastModule,
    ConfirmDialogModule,
    FcImagePreviewComponent,
    FcInputTextComponent,
    DatePickerModule,
    IftaLabelModule,
    RouterModule,
    ProgressSpinner,
    FcFileInputComponent,
  ],
  templateUrl: './goods-receipt-view.component.html',
  styleUrl: './goods-receipt-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class GoodsReceiptViewComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faArrowRight = faArrowRight;
  faCloudArrowUp = faCloudArrowUp;
  faFile = faFile;
  faFloppyDisk = faFloppyDisk;
  faXmark = faXmark;
  faSpinner = faSpinner;
  faExclamationCircle = faExclamationCircle;

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
      hidden: true,
      action: () => {
        this.submit();
      },
    },
    {
      label: 'Complete',
      hidden: true,
      icon: faCheck,
      action: () => {
        this.setGoodsReceiptAsComplete();
      },
    },
    {
      label: 'Cancel',
      hidden: true,
      icon: faX,
      action: () => {
        this.setGoodsReceiptAsCancel();
      },
    },
    {
      label: 'Delete',
      hidden: true,
      icon: faTrash,
      action: () => {
        this.delete();
      },
    },
  ];
  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,
      action: () => {
        this.refresh();
      },
    },
  ];
  loading = false;
  @Input() goodsReceipt: GoodsReceipt = {} as GoodsReceipt;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

  goodsReceiptForm: FormGroup;

  constructor(
    private layoutService: LayoutService,
    private goodsReceiptService: GoodsReceiptService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private location: Location,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.goodsReceipt.id = String(this.route.snapshot.paramMap.get('id'));

    this.goodsReceiptForm = new FormGroup({
      purchase_invoice: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      note: new FormControl(null),
      warehouse: new FormControl(null, Validators.required),
      goods_receipt_details: new FormArray([]),
      goods_receipt_documents: new FormArray([]),
    });
  }
  ngOnInit(): void {
    if (!this.quickView) {
      this.loadData();
    }
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngOnChanges(): void {
    this.refresh();
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

  generateActionButtons() {
    this.actionButtons.forEach((actionButton) => {
      actionButton.hidden = true;
    });
    switch (this.goodsReceipt.status) {
      case 0: // draft
        if (this.ability.can('update', 'goods-receipt'))
          this.actionButtons[0].hidden = false;
        if (this.ability.can('complete', 'goods-receipt'))
          this.actionButtons[1].hidden = false;
        if (this.ability.can('cancel', 'goods-receipt'))
          this.actionButtons[2].hidden = false;
        if (this.ability.can('delete', 'goods-receipt'))
          this.actionButtons[3].hidden = false;
        break;
      case 1: // complete
        break;
      case 2: // cancelled
        break;
      default:
        break;
    }
  }
  generateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Goods Receipt`,
      icon: '',
      showHeader: true,
    });
  }

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.goodsReceiptService
      .getGoodsReceipt(this.goodsReceipt.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.goodsReceipt = res.data;
        this.generateActionButtons();
        this.generateHeader();

        this.goodsReceiptForm.patchValue({
          purchase_invoice: this.goodsReceipt.purchase_invoice,
          date: this.goodsReceipt.date,
          note: this.goodsReceipt.note,
          warehouse: this.goodsReceipt.warehouse,
        });
        this.loadPurchaseOrder();
        this.goodsReceipt.goods_receipt_details.forEach((data: any) => {
          this.goodsReceiptDetails.push(this.generateGoodsReceiptDetails(data));
        });

        this.goodsReceipt.goods_receipt_documents.forEach(
          (goodsReceiptDocument: any) => {
            const dotIndex =
              goodsReceiptDocument.original_name.lastIndexOf('.');
            let fileType = '';
            if (dotIndex !== -1) {
              // Extract the "type" part from the input
              fileType = goodsReceiptDocument.original_name.substring(dotIndex);
            }
            this.documentFilesArray.push(
              new FormGroup({
                id: new FormControl(goodsReceiptDocument.id),
                file: new FormControl(goodsReceiptDocument.url),
                original_name: new FormControl(
                  goodsReceiptDocument.original_name,
                ),
                file_type: new FormControl(fileType),
                inputChangeName: new FormControl(false),
              }),
            );
          },
        );
      });
  }

  get goodsReceiptDetails(): FormArray {
    return this.goodsReceiptForm.get('goods_receipt_details') as FormArray;
  }

  generateGoodsReceiptDetails(goodsReceiptDetails: any): FormGroup {
    let goodsReceiptDetailForm = new FormGroup({
      id: new FormControl(goodsReceiptDetails.id),
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

  purchaseOrder!: PurchaseOrder;
  warehouses: Warehouse[] = [];
  loadPurchaseOrder() {
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
    const ref = this.dialogService.open(GoodsReceiptDetailAddDialogComponent, {
      data: {
        title: 'Add Goods Receipt Detail',
        purchaseInvoiceDetails:
          this.goodsReceiptForm.value.purchase_invoice.purchase_invoice_details,
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
      width: '450px',
    });
    ref.onClose.subscribe((goodsReceiptDetail) => {
      if (goodsReceiptDetail) {
        let bodyReq = {
          product_id: goodsReceiptDetail.product.id,
          quantity: goodsReceiptDetail.quantity,
          gr_serial_numbers: goodsReceiptDetail.gr_serial_numbers,
        };
        this.goodsReceiptService
          .addGoodsReceiptDetail(this.goodsReceipt.id, bodyReq)
          .subscribe({
            next: (res: any) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt Detail',
                detail: res.message,
              });
              goodsReceiptDetail.id = res.data.id;
              this.goodsReceiptDetails.push(
                this.generateGoodsReceiptDetails(goodsReceiptDetail),
              );
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt Detail',
                detail: err.message,
              });
            },
          });
      }
    });
  }

  onEditGoodsReceiptDetail(goodsReceiptDetailId: any, index: number) {
    // Open Dialog
    const ref = this.dialogService.open(GoodsReceiptDetailAddDialogComponent, {
      data: {
        title: 'Edit Goods Receipt Detail',
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
      width: '450px',
    });
    ref.onClose.subscribe((newData) => {
      if (newData) {
        let bodyReq = {
          product_id: newData.product.id,
          quantity: newData.quantity,
          gr_serial_numbers: newData.gr_serial_numbers,
        };
        this.goodsReceiptService
          .updateGoodsReceiptDetail(
            this.goodsReceipt.id,
            goodsReceiptDetailId,
            bodyReq,
          )
          .subscribe({
            next: (res: any) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt Detail',
                detail: res.message,
              });
              this.goodsReceiptDetails.controls[index].patchValue(newData);
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt Detail',
                detail: err.message,
              });
            },
          });
      }
    });
  }

  onRemoveGoodsReceiptDetail(goodsReceiptDetailId: string, index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      accept: () => {
        this.goodsReceiptService
          .deleteGoodsReceiptDetail(this.goodsReceipt.id, goodsReceiptDetailId)
          .subscribe({
            next: (res: any) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt Detail',
                detail: res.message,
              });
              this.goodsReceiptDetails.removeAt(index);
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt Detail',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  setGoodsReceiptAsComplete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to set this goods receipt as complete ?',
      accept: () => {
        this.actionButtons[1].loading = true;
        this.goodsReceiptService
          .setStatusAsComplete(this.goodsReceipt.id)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[1].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt',
                detail: res.message,
              });
              this.goodsReceipt.status_name = res.data.status_name;
              this.goodsReceipt.status = res.data.status;
              this.generateActionButtons();
              this.generateHeader();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (err) => {
              this.actionButtons[1].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  setGoodsReceiptAsCancel() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to set this goods receipt as cancel ?',
      accept: () => {
        this.actionButtons[2].loading = true;
        this.goodsReceiptService
          .setStatusAsCancel(this.goodsReceipt.id)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[2].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt',
                detail: res.message,
              });
              this.goodsReceipt.status_name = res.data.status_name;
              this.goodsReceipt.status = res.data.status;
              this.generateActionButtons();
              this.generateHeader();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (err) => {
              this.actionButtons[2].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  delete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this goods receipt ?',
      accept: () => {
        this.actionButtons[3].loading = true;
        this.goodsReceiptService
          .deleteGoodsReceipt(this.goodsReceipt.id)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[3].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt',
                detail: res.message,
              });
              if (this.quickView) {
                this.onDeleted.emit();
              } else {
                this.back();
              }
            },
            error: (err) => {
              this.actionButtons[3].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt',
                detail: err.message,
              });
            },
          });
      },
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

  // manage purchase order document files
  loadingDocument = false;
  get documentFilesArray() {
    return this.goodsReceiptForm.get('goods_receipt_documents') as FormArray;
  }

  addMultipleFiles(files: any) {
    this.loadingDocument = true;
    // make body request
    let bodyReqDocument = new FormData();
    files.forEach((data: any, i: number) => {
      bodyReqDocument.append(`goods_receipt_documents[${i}][file]`, data.file);
      bodyReqDocument.append(
        `goods_receipt_documents[${i}][original_name]`,
        data.file.name,
      );
    });
    // push to api
    this.goodsReceiptService
      .addGoodsReceiptDocuments(this.goodsReceipt.id, bodyReqDocument)
      .subscribe({
        next: (res: any) => {
          this.loadingDocument = false;
          res.data.forEach((data: any) => {
            const dotIndex = data.original_name.lastIndexOf('.');
            let fileType = '';
            if (dotIndex !== -1) {
              // Extract the "type" part from the input
              fileType = data.original_name.substring(dotIndex);
            }
            this.documentFilesArray.push(
              new FormGroup({
                id: new FormControl(data.id),
                file: new FormControl(data.url),
                original_name: new FormControl(data.original_name),
                file_type: new FormControl(fileType),
                inputChangeName: new FormControl(false),
              }),
            );
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Goods Receipt Documents',
            detail: res.message,
          });
        },
        error: (err) => {
          this.loadingDocument = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Goods Receipt Documents',
            detail: err.message,
          });
        },
      });
  }

  removeDocument(index: number, id: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this goods receipt document?',
      accept: () => {
        this.goodsReceiptService
          .deleteGoodsReceiptDocument(this.goodsReceipt.id, id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Goods Receipt Documents',
                detail: res.message,
              });
              this.documentFilesArray.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Goods Receipt Documents',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  changeDocumentName(index: number, id: string) {
    if (this.goodsReceipt.status) return;

    const documentFile = this.documentFilesArray.at(index);
    if (documentFile.value.inputChangeName == true) {
      this.confirmationService.confirm({
        header: 'Confirmation',
        message: 'Are you sure to update this goods receipt document name?',
        accept: () => {
          let bodyReq = new FormGroup({
            original_name: new FormControl(
              this.documentFilesArray.value[index].original_name +
                documentFile.value.file_type,
            ),
          });
          this.goodsReceiptService
            .updateGoodsReceiptDocument(this.goodsReceipt.id, id, bodyReq.value)
            .subscribe({
              next: (res: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Goods Receipt Documents',
                  detail: res.message,
                });
                documentFile.patchValue({
                  original_name: res.data.original_name,
                  inputChangeName: false,
                });
              },
              error: (err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Goods Receipt Documents',
                  detail: err.message,
                });
              },
            });
        },
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

  submit() {
    if (this.goodsReceiptForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.goodsReceiptForm);
      return;
    }

    this.actionButtons[0].loading = true;
    let bodyReqForm: FormGroup;
    bodyReqForm = new FormGroup({
      date: new FormControl(this.goodsReceiptForm.value.date),
      note: new FormControl(this.goodsReceiptForm.value.note),
    });

    this.goodsReceiptService
      .updateGoodsReceipt(this.goodsReceipt.id, bodyReqForm.value)
      .subscribe({
        next: (res: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Goods Receipt',
            detail: res.message,
          });
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
  }
  refresh() {
    this.goodsReceiptForm.removeControl('goods_receipt_details');
    this.goodsReceiptForm.addControl(
      'goods_receipt_details',
      new FormArray([]),
    );
    this.loadData();
  }
  back() {
    this.location.back();
  }
}
