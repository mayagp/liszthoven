import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faEye,
  faTrash,
  faPencil,
  faArrowRight,
  faTimes,
  faChevronDown,
  faCloudArrowUp,
  faFile,
  faFloppyDisk,
  faXmark,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { PurchasePaymentDetailAddDialogComponent } from '../../components/purchase-payment-detail-add-dialog/purchase-payment-detail-add-dialog.component';
import { PurchasePaymentDetailEditDialogComponent } from '../../components/purchase-payment-detail-edit-dialog/purchase-payment-detail-edit-dialog.component';
import { PurchasePaymentService } from '../../services/purchase-payment.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-purchase-payment-add',
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
    RouterModule,
    FcImagePreviewComponent,
    FcCurrencyPipe,
  ],
  templateUrl: './purchase-payment-add.component.html',
  styleUrl: './purchase-payment-add.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchasePaymentAddComponent {
  private readonly destroy$: any = new Subject();
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faArrowRight = faArrowRight;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faCloudArrowUp = faCloudArrowUp;
  faFile = faFile;
  faFloppyDisk = faFloppyDisk;
  faXmark = faXmark;

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
  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [];

  purchasePaymentForm: FormGroup;
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private purchasePaymentService: PurchasePaymentService,
    private messageService: MessageService,
    private location: Location,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'purchase-payment',
    );
    this.layoutService.setHeaderConfig({
      title: 'Purchase Payment',
      icon: '',
      showHeader: true,
    });
    this.purchasePaymentForm = new FormGroup({
      supplier: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      payment_method: new FormControl(null, Validators.required),
      note: new FormControl(''),
      purchase_payment_allocations: new FormArray([]),
      purchase_payment_documents: new FormArray([]),
      purchase_payment_coas: new FormArray([]),
    });
  }
  ngOnInit(): void {
    setTimeout(() => {
      if (this.purchasePaymentDetails.value.length) {
        this.setPaymentSummaryVisibility();
      }
    }, 1);
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  isShowPaymentSummary: boolean = false;
  @ViewChild('orderSummary') orderSummary?: ElementRef;
  @ViewChild('purchasePaymentFormElement')
  purchasePaymentFormElement?: ElementRef;
  @ViewChild('stickyPurchasePaymentSummary')
  stickyPurchasePaymentSummary?: ElementRef;
  // Detect scroll in order summary
  onScroll(event: any) {
    this.setPaymentSummaryVisibility();
  }

  setPaymentSummaryVisibility() {
    let formPurchasePaymentBoxBounds =
      this.purchasePaymentFormElement?.nativeElement.getBoundingClientRect();
    let stickyPurchasePaymentBoxBounds =
      this.stickyPurchasePaymentSummary?.nativeElement.getBoundingClientRect();
    let orderSummaryBoxBounds =
      this.orderSummary?.nativeElement.getBoundingClientRect();
    try {
      if (
        formPurchasePaymentBoxBounds.bottom -
          (orderSummaryBoxBounds.bottom - orderSummaryBoxBounds.height) <
        stickyPurchasePaymentBoxBounds.height
      ) {
        this.isShowPaymentSummary = true;
      } else {
        this.isShowPaymentSummary = false;
      }
    } catch (error) {}
  }

  scrollToBottom() {
    this.orderSummary?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }

  // Manage Supplier
  onSelectSupplier() {
    const ref = this.dialogService.open(SupplierSelectDialogComponent, {
      data: {
        title: 'Select Supplier',
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
    ref.onClose.subscribe((supplier) => {
      if (supplier) {
        this.purchasePaymentForm.patchValue({
          supplier: supplier,
        });
      }
    });
  }

  removeSupplier() {
    this.purchasePaymentForm.controls['supplier'].setValue(null);
  }

  // Manage Purchase Payment Detail
  generatePurchasePaymentDetail(purchasePaymentDetail: any): FormGroup {
    return new FormGroup({
      purchase_invoice: new FormControl(
        purchasePaymentDetail.purchase_invoice,
        Validators.required,
      ),
      amount_allocated: new FormControl(
        purchasePaymentDetail.amount_allocated,
        Validators.required,
      ),
    });
  }

  get purchasePaymentDetails(): FormArray {
    return this.purchasePaymentForm.get(
      'purchase_payment_allocations',
    ) as FormArray;
  }

  addPurchasePaymentDetail() {
    if (this.purchasePaymentForm.controls['supplier'].value) {
      const ref = this.dialogService.open(
        PurchasePaymentDetailAddDialogComponent,
        {
          data: {
            title: 'Add Purchase Payment Detail',
            supplier: this.purchasePaymentForm.controls['supplier'].value,
            purchasePaymentDetails: this.purchasePaymentDetails.value,
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
      ref.onClose.subscribe((purchasePaymentDetail) => {
        if (purchasePaymentDetail) {
          this.purchasePaymentDetails.push(
            this.generatePurchasePaymentDetail(purchasePaymentDetail),
          );
        }
      });
    } else {
      this.messageService.add({
        severity: 'warning',
        summary: 'Warning',
        detail: 'Please select Supplier first',
      });
    }
  }

  editPurchasePaymentDetail(index: number) {
    const ref = this.dialogService.open(
      PurchasePaymentDetailEditDialogComponent,
      {
        data: {
          title: 'Edit Purchase Payment Detail',
          purchasePaymentDetail: this.purchasePaymentDetails.value[index],
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
    ref.onClose.subscribe((purchasePaymentDetail) => {
      if (purchasePaymentDetail) {
        this.purchasePaymentDetails.at(index).patchValue(purchasePaymentDetail);
      }
    });
  }

  deletePurchasePaymentDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchasePaymentDetails.removeAt(index);
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Delete operation was cancelled',
        });
      },
    });
  }

  get grandTotalPrice() {
    return this.purchasePaymentDetails.value.reduce(
      (sum: any, item: any) => sum + item.amount_allocated,
      0,
    );
  }

  // manage document files
  get documentFilesArray() {
    return this.purchasePaymentForm.get(
      'purchase_payment_documents',
    ) as FormArray;
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
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.documentFilesArray.removeAt(index);
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Delete operation was cancelled',
        });
      },
    });
  }

  // Manage Purchase Payment Coa
  generatePurchasePaymentCoa(purchasePaymentCoa: any): FormGroup {
    return new FormGroup({
      amount: new FormControl(purchasePaymentCoa.amount),
      description: new FormControl(purchasePaymentCoa.description),
      chart_of_account: new FormControl(purchasePaymentCoa.chart_of_account),
    });
  }

  get coaFilesArray() {
    return this.purchasePaymentForm.get('purchase_payment_coas') as FormArray;
  }

  // addPurchasePaymentCoa() {
  //   const ref = this.dialogService.open(PurchasePaymentCoaAddDialogComponent, {
  //     data: {
  //       title: 'Add Purchase Payment Detail',
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '450px',
  //   });
  //   ref.onClose.subscribe((purchasePaymentCoa) => {
  //     if (purchasePaymentCoa) {
  //       this.coaFilesArray.push(
  //         this.generatePurchasePaymentCoa(purchasePaymentCoa)
  //       );
  //     }
  //   });
  // }

  // editPurchasePaymentCoa(index: number) {
  //   const ref = this.dialogService.open(PurchasePaymentCoaAddDialogComponent, {
  //     data: {
  //       title: 'Edit Purchase Payment Coa',
  //       purchasePaymentCoa: this.coaFilesArray.value[index],
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '450px',
  //   });
  //   ref.onClose.subscribe((purchasePaymentCoa) => {
  //     if (purchasePaymentCoa) {
  //       this.coaFilesArray.at(index).patchValue(purchasePaymentCoa);
  //     }
  //   });
  // }

  deletePurchasePaymentCoa(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.coaFilesArray.removeAt(index);
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Delete operation was cancelled',
        });
      },
    });
  }

  back() {
    this.location.back();
  }

  submit() {
    if (this.purchasePaymentForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchasePaymentForm);
      return;
    }
    if (this.purchasePaymentForm.valid) {
      this.actionButtons[0].loading = true;
      let bodyReq = structuredClone(this.purchasePaymentForm.value);
      bodyReq.supplier_id = bodyReq.supplier.id;
      bodyReq.purchase_payment_allocations =
        bodyReq.purchase_payment_allocations.map((item: any) => {
          return {
            purchase_invoice_id: item.purchase_invoice.id,
            amount_allocated: item.amount_allocated,
          };
        });
      bodyReq.purchase_payment_coas = bodyReq.purchase_payment_coas.map(
        (item: any) => {
          return {
            amount: item.amount,
            description: item.description,
            chart_of_account_id: item.chart_of_account.id,
          };
        },
      );
      delete bodyReq.supplier;
      delete bodyReq.purchase_payment_documents;

      this.purchasePaymentService.addPurchasePayment(bodyReq).subscribe({
        next: (res: any) => {
          if (
            this.purchasePaymentForm.value.purchase_payment_documents.length
          ) {
            let bodyReqDocument = new FormData();
            this.purchasePaymentForm.value.purchase_payment_documents.forEach(
              (file: any, index: number) => {
                bodyReqDocument.append(
                  `purchase_payment_documents[${index}][file]`,
                  file.file,
                );
                bodyReqDocument.append(
                  `purchase_payment_documents[${index}][original_name]`,
                  file.original_name,
                );
              },
            );
            this.purchasePaymentService
              .addPurchasePaymentDocuments(res.data.id, bodyReqDocument)
              .subscribe({
                next: (documentRes: any) => {
                  this.actionButtons[0].loading = false;
                  this.router.navigate([
                    '/purchase-payment/view/',
                    res.data.id,
                  ]);
                },
                error: (err) => {
                  this.actionButtons[0].loading = false;
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Purchase Payment Document',
                    detail: err.message,
                  });
                },
              });
          } else {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Payment',
              detail: res.message,
            });
            this.router.navigate(['/purchase-payment/view/', res.data.id]);
          }
        },
        error: (err) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Purchase Payment',
            detail: err.message,
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'warning',
        summary: 'Purchase Payment',
        detail: 'Please fill all required field',
      });
    }
  }
}
