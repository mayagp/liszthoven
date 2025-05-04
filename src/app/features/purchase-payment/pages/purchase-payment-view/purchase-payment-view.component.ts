import { CommonModule, Location } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  faSpinner,
  faExclamationCircle,
  faSave,
  faRefresh,
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
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { PurchasePaymentDetailAddDialogComponent } from '../../components/purchase-payment-detail-add-dialog/purchase-payment-detail-add-dialog.component';
import { PurchasePaymentDetailEditDialogComponent } from '../../components/purchase-payment-detail-edit-dialog/purchase-payment-detail-edit-dialog.component';
import { PurchasePayment } from '../../interfaces/purchase-payment';
import { PurchasePaymentService } from '../../services/purchase-payment.service';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-purchase-payment-view',
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
    ProgressSpinner,
  ],
  templateUrl: './purchase-payment-view.component.html',
  styleUrl: './purchase-payment-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchasePaymentViewComponent {
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
  faSpinner = faSpinner;
  faExclamationCircle = faExclamationCircle;

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
      label: 'Approve',
      icon: faSave,
      hidden: true,
      action: () => {
        this.onApprove();
      },
    },
    {
      label: 'Cancel',
      icon: faTimes,
      hidden: true,
      action: () => {
        this.onCancel();
      },
    },
    {
      label: 'Delete',
      icon: faTrash,
      hidden: true,
      action: () => {
        this.onDelete();
      },
    },
  ];
  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,

      action: () => {
        this.refresh();
      },
    },
  ];

  @Input() purchasePayment: PurchasePayment = {} as PurchasePayment;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

  purchasePaymentForm: FormGroup;
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private purchasePaymentService: PurchasePaymentService,
    private messageService: MessageService,
    private location: Location,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.purchasePayment.id = this.route.snapshot.paramMap.get('id') as any;
    this.layoutService.setHeaderConfig({
      title: 'Purchase Payment',
      icon: '',
      showHeader: true,
    });
    this.purchasePaymentForm = new FormGroup({
      supplier: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      payment_method: new FormControl(null, Validators.required),
      note: new FormControl(null, Validators.required),
      purchase_payment_allocations: new FormArray([]),
      purchase_payment_documents: new FormArray([]),
      purchase_payment_coas: new FormArray([]),
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

  isShowPurchasePaymentDetailSummary: boolean = false;
  @ViewChild('purchasePaymentDetailSummary')
  purchasePaymentDetailSummary?: ElementRef;
  @ViewChild('purchasePaymentFormElement')
  purchasePaymentFormElement?: ElementRef;
  @ViewChild('stickyPurchasePaymentDetailSummary')
  stickyPurchasePaymentDetailSummary?: ElementRef;
  onScroll(event: any) {
    this.setPurchasePaymentDetailSummaryVisibility();
  }
  setPurchasePaymentDetailSummaryVisibility() {
    let formPurchaseOrderBoxBounds =
      this.purchasePaymentFormElement?.nativeElement.getBoundingClientRect();
    let stickyPurchaseOrderBoxBounds =
      this.stickyPurchasePaymentDetailSummary?.nativeElement.getBoundingClientRect();
    let purchasePaymentDetailSummaryBoxBounds =
      this.purchasePaymentDetailSummary?.nativeElement.getBoundingClientRect();
    if (
      formPurchaseOrderBoxBounds != undefined &&
      purchasePaymentDetailSummaryBoxBounds != undefined
    ) {
      if (
        formPurchaseOrderBoxBounds.bottom -
          (purchasePaymentDetailSummaryBoxBounds.bottom -
            purchasePaymentDetailSummaryBoxBounds.height) <
        stickyPurchaseOrderBoxBounds.height
      ) {
        this.isShowPurchasePaymentDetailSummary = true;
      } else {
        this.isShowPurchasePaymentDetailSummary = false;
      }
    }
  }

  scrollToBottom() {
    this.purchasePaymentDetailSummary?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }

  generateActionButtons() {
    this.actionButtons.forEach((actionButton) => {
      actionButton.hidden = true;
    });
    switch (this.purchasePayment.status) {
      case 0: // draft
        if (this.ability.can('update', 'purchase-payment'))
          this.actionButtons[0].hidden = false;
        if (this.ability.can('approve', 'purchase-payment'))
          this.actionButtons[1].hidden = false;
        if (this.ability.can('cancel', 'purchase-payment'))
          this.actionButtons[2].hidden = false;
        if (this.ability.can('delete', 'purchase-payment'))
          this.actionButtons[3].hidden = false;
        break;
      case 1: // approved
        break;
      case 2: // cancelled
        break;
      default:
        break;
    }
  }

  generateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Purchase Payment (${this.purchasePayment.status_name})`,
      icon: '',
      showHeader: true,
    });
  }

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.purchasePaymentService
      .getPurchasePayment(this.purchasePayment.id)
      .subscribe((res: any) => {
        this.loading = false;
        this.purchasePayment = res.data;
        this.loadPurchasePaymentCoa();
        this.purchasePaymentForm.patchValue(this.purchasePayment);
        this.purchasePayment.purchase_payment_allocations.forEach(
          (purchasePaymentDetail: any) => {
            this.purchasePaymentDetails.push(
              this.generatePurchasePaymentDetail(purchasePaymentDetail),
            );
          },
        );
        this.purchasePayment.purchase_payment_documents.forEach(
          (purchaseOrderDocument: any) => {
            const dotIndex =
              purchaseOrderDocument.original_name.lastIndexOf('.');
            let fileType = '';
            if (dotIndex !== -1) {
              // Extract the "type" part from the input
              fileType =
                purchaseOrderDocument.original_name.substring(dotIndex);
            }
            this.documentFilesArray.push(
              new FormGroup({
                id: new FormControl(purchaseOrderDocument.id),
                file: new FormControl(purchaseOrderDocument.url),
                original_name: new FormControl(
                  purchaseOrderDocument.original_name,
                ),
                file_type: new FormControl(fileType),
                inputChangeName: new FormControl(false),
              }),
            );
          },
        );

        this.generateActionButtons();
        this.generateHeader();
        setTimeout(() => {
          this.setPurchasePaymentDetailSummaryVisibility();
        }, 100);
      });
  }

  loadingPurchasePaymentCoa = false;
  loadPurchasePaymentCoa() {
    this.loadingPurchasePaymentCoa = true;
    this.purchasePaymentService
      .getPurchasePaymentCoa(this.purchasePayment.id)
      .subscribe((res: any) => {
        this.loadingPurchasePaymentCoa = false;
        res.data.purchase_payment_coas.forEach((purchasePaymentCoa: any) => {
          this.coaFilesArray.push(
            this.generatePurchasePaymentCoa(purchasePaymentCoa),
          );
        });
      });
  }

  // Manage Purchase Payment Detail
  generatePurchasePaymentDetail(purchasePaymentDetail: any): FormGroup {
    return new FormGroup({
      id: new FormControl(purchasePaymentDetail.id),
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
          let bodyReq = JSON.parse(JSON.stringify(purchasePaymentDetail)); // deep copy
          bodyReq.purchase_invoice_id = bodyReq.purchase_invoice.id;
          delete bodyReq.purchase_invoice;

          this.purchasePaymentService
            .addPurchasePaymentDetail(this.purchasePayment.id, bodyReq)
            .subscribe({
              next: (res: any) => {
                purchasePaymentDetail.id = res.data.id;
                this.purchasePaymentDetails.push(
                  this.generatePurchasePaymentDetail(purchasePaymentDetail),
                );
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success Message',
                  detail: 'Purchase Payment Detail has been added',
                });
              },
              error: (err: any) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error Message',
                  detail: err.message,
                });
              },
            });
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
        let bodyReq = JSON.parse(JSON.stringify(purchasePaymentDetail)); // deep copy
        bodyReq.purchase_invoice_id = bodyReq.purchase_invoice.id;
        delete bodyReq.purchase_invoice;

        this.purchasePaymentService
          .updatePurchasePaymentDetail(
            this.purchasePayment.id,
            bodyReq,
            this.purchasePaymentDetails.value[index].id,
          )
          .subscribe({
            next: (res: any) => {
              this.purchasePaymentDetails
                .at(index)
                .patchValue(purchasePaymentDetail);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Payment Detail has been updated',
              });
            },
          });
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
        this.purchasePaymentService
          .deletePurchasePaymentDetail(
            this.purchasePayment.id,
            this.purchasePaymentDetails.value[index].id,
          )
          .subscribe({
            next: (res: any) => {
              this.purchasePaymentDetails.removeAt(index);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Payment Detail has been deleted',
              });
            },
          });
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
      (sum: any, item: any) => sum + Number(item.amount_allocated),
      0,
    );
  }

  back() {
    this.location.back();
  }

  refresh() {
    this.isShowPurchasePaymentDetailSummary = false;
    this.purchasePaymentForm.reset();
    this.purchasePaymentForm.removeControl('purchase_payment_allocations');
    this.purchasePaymentForm.addControl(
      'purchase_payment_allocations',
      new FormArray([]),
    );
    this.loadData();
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
    return this.purchasePaymentForm.get(
      'purchase_payment_documents',
    ) as FormArray;
  }

  addMultipleFiles(files: any) {
    this.loadingDocument = true;
    // make body request
    let bodyReqDocument = new FormData();
    files.forEach((data: any, i: number) => {
      bodyReqDocument.append(
        `purchase_payment_documents[${i}][file]`,
        data.file,
      );
      bodyReqDocument.append(
        `purchase_payment_documents[${i}][original_name]`,
        data.file.name,
      );
    });
    // push to api
    this.purchasePaymentService
      .addPurchasePaymentDocuments(this.purchasePayment.id, bodyReqDocument)
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
            summary: 'Purchase Payment Documents',
            detail: res.message,
          });
        },
        error: (err) => {
          this.loadingDocument = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Purchase Payment Documents',
            detail: err.message,
          });
        },
      });
  }

  removeDocument(index: number, id: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this purchase payment document?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchasePaymentService
          .deletePurchasePaymentDocument(this.purchasePayment.id, id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Payment Documents',
                detail: res.message,
              });
              this.documentFilesArray.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Payment Documents',
                detail: err.message,
              });
            },
          });
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

  changeDocumentName(index: number, id: string) {
    if (this.purchasePayment.status) return;

    const documentFile = this.documentFilesArray.at(index);
    if (documentFile.value.inputChangeName == true) {
      this.confirmationService.confirm({
        header: 'Confirmation',
        message: 'Are you sure to update this purchase payment document name?',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => {
          let bodyReq = new FormGroup({
            original_name: new FormControl(
              this.documentFilesArray.value[index].original_name +
                documentFile.value.file_type,
            ),
          });
          this.purchasePaymentService
            .updatePurchasePaymentDocument(
              this.purchasePayment.id,
              id,
              bodyReq.value,
            )
            .subscribe({
              next: (res: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Purchase Payment Documents',
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
                  summary: 'Purchase Payment Documents',
                  detail: err.message,
                });
              },
            });
        },
        reject: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cancelled',
            detail: 'Delete operation was cancelled',
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

  // Manage Purchase Payment Coa
  generatePurchasePaymentCoa(purchasePaymentCoa: any): FormGroup {
    return new FormGroup({
      id: new FormControl(purchasePaymentCoa.id),
      amount: new FormControl(purchasePaymentCoa.amount),
      description: new FormControl(purchasePaymentCoa.description),
      chart_of_account: new FormControl(purchasePaymentCoa.chart_of_account),
      loading_edit: new FormControl(false),
      loading_delete: new FormControl(false),
    });
  }

  get coaFilesArray() {
    return this.purchasePaymentForm.get('purchase_payment_coas') as FormArray;
  }

  // loadingAddPurchasePaymentCoa = false;
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
  //       let bodyReq = {
  //         amount: purchasePaymentCoa.amount,
  //         description: purchasePaymentCoa.description,
  //         chart_of_account_id: purchasePaymentCoa.chart_of_account.id,
  //       };
  //       this.loadingAddPurchasePaymentCoa = true;
  //       this.purchasePaymentService
  //         .addPurchasePaymentCoa(this.purchasePayment.id, bodyReq)
  //         .subscribe({
  //           next: (res: any) => {
  //             this.loadingAddPurchasePaymentCoa = false;
  //             this.coaFilesArray.push(
  //               this.generatePurchasePaymentCoa({
  //                 ...res.data,
  //                 chart_of_account: purchasePaymentCoa.chart_of_account,
  //               })
  //             );
  //             this.messageService.clear();
  //             this.messageService.add({
  //               severity: 'success',
  //               header: 'Purchase Payment Coa',
  //               detail: res.message,
  //             });
  //           },
  //           error: (err) => {
  //             this.loadingAddPurchasePaymentCoa = false;
  //             this.messageService.clear();
  //             this.messageService.add({
  //               severity: 'error',
  //               header: 'Purchase Payment Coa',
  //               detail: err.message,
  //             });
  //           },
  //         });
  //     }
  //   });
  // }

  // editPurchasePaymentCoa(id: number, index: number) {
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
  //       this.coaFilesArray.at(index).patchValue({
  //         loading_edit: true,
  //       });
  //       let bodyReq = {
  //         amount: purchasePaymentCoa.amount,
  //         description: purchasePaymentCoa.description,
  //         chart_of_account_id: purchasePaymentCoa.chart_of_account.id,
  //       };
  //       this.purchasePaymentService
  //         .updatePurchasePaymentCoa(this.purchasePayment.id, id, bodyReq)
  //         .subscribe({
  //           next: (res: any) => {
  //             this.coaFilesArray.at(index).patchValue({
  //               amount: purchasePaymentCoa.amount,
  //               description: purchasePaymentCoa.description,
  //               chart_of_account: purchasePaymentCoa.chart_of_account,
  //               loading_edit: false,
  //             });
  //             this.messageService.clear();
  //             this.messageService.add({
  //               severity: 'success',
  //               header: 'Purchase Payment Coa',
  //               message: res.message,
  //             });
  //           },
  //           error: (err) => {
  //             this.coaFilesArray.at(index).patchValue({
  //               loading_edit: false,
  //             });
  //             this.messageService.clear();
  //             this.messageService.add({
  //               severity: 'error',
  //               header: 'Purchase Payment Coa',
  //               message: err.message,
  //             });
  //           },
  //         });
  //     }
  //   });
  // }

  deletePurchasePaymentCoa(id: number, index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this purchase payment coa?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.coaFilesArray.at(index).patchValue({
          loading_delete: true,
        });
        this.purchasePaymentService
          .deletePurchasePaymentCoa(this.purchasePayment.id, id)
          .subscribe({
            next: (res: any) => {
              this.coaFilesArray.at(index).patchValue({
                loading_delete: false,
              });
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Payment Coa',
                detail: res.message,
              });
              this.coaFilesArray.removeAt(index);
            },
            error: (err) => {
              this.coaFilesArray.at(index).patchValue({
                loading_delete: false,
              });
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Payment Coa',
                detail: err.message,
              });
            },
          });
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

  submit() {
    if (this.purchasePaymentForm.value.note == '') {
      this.purchasePaymentForm.patchValue({
        note: '-',
      });
    }

    if (this.purchasePaymentForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchasePaymentForm);
      return;
    }
    this.actionButtons[0].loading = true;
    let bodyReq = structuredClone(this.purchasePaymentForm.value);
    delete bodyReq.supplier;
    delete bodyReq.purchase_payment_allocations;
    delete bodyReq.purchase_payment_documents;
    delete bodyReq.purchase_payment_coas;
    this.purchasePaymentService
      .updatePurchasePayment(this.purchasePayment.id, bodyReq)
      .subscribe({
        next: (res: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Purchase Payment',
            detail: res.message,
          });
          if (this.quickView) {
            this.onUpdated.emit(res.data);
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
  }

  onApprove() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to approve this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchasePaymentService
          .approvePurchasePayment(this.purchasePayment.id)
          .subscribe({
            next: (res: any) => {
              this.purchasePayment.status = res.data.status;
              this.purchasePayment.status_name = res.data.status_name;
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Payment has been approved',
              });
              this.generateActionButtons();
              this.generateHeader();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: err.message,
              });
            },
          });
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

  onCancel() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to cancel this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchasePaymentService
          .cancelPurchasePayment(this.purchasePayment.id)
          .subscribe({
            next: (res: any) => {
              this.purchasePayment.status = res.data.status;
              this.purchasePayment.status_name = res.data.status_name;
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Payment has been canceled',
              });
              this.generateActionButtons();
              this.generateHeader();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: err.message,
              });
            },
          });
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

  onDelete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchasePaymentService
          .deletePurchasePayment(this.purchasePayment.id)
          .subscribe({
            next: (res: any) => {
              this.back();
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Payment has been deleted',
              });
              if (this.quickView) {
                this.onDeleted.emit();
              } else {
                this.back();
              }
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: err.message,
              });
            },
          });
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
}
