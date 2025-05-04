import { CommonModule, Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { Supplier } from '../../../supplier/interfaces/supplier';
import { PurchaseReturnEditDetailDialogComponent } from '../../components/purchase-return-edit-detail-dialog/purchase-return-edit-detail-dialog.component';
import { PurchaseReturn } from '../../interfaces/purchase-return';
import { PurchaseReturnService } from '../../services/purchase-return.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-purchase-return-view',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    ToastModule,
    RouterModule,
    FcCurrencyPipe,
    FcImagePreviewComponent,
    FcInputTextComponent,
    DatePickerModule,
    IftaLabelModule,
    ProgressSpinner,
    ConfirmDialogModule,
  ],
  templateUrl: './purchase-return-view.component.html',
  styleUrl: './purchase-return-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchaseReturnViewComponent {
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

  purchaseReturnDestination: any = [
    {
      id: 0,
      name: 'Goods Receipt',
    },
    {
      id: 1,
      name: 'Purchase Invoice',
    },
  ];

  purchaseReturnTypes: any = [
    {
      id: 0,
      name: 'Return',
    },
    {
      id: 1,
      name: 'Refund',
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
    {
      label: 'Complete',
      icon: faCheck,
      action: () => {
        this.setPurchaseReturnAsComplete();
      },
      hidden: true,
    },
    {
      label: 'Cancel',
      icon: faX,
      action: () => {
        this.setPurchaseReturnAsCancel();
      },
      hidden: true,
    },
    {
      label: 'Delete',
      icon: faTrash,
      action: () => {
        this.delete();
      },
      hidden: true,
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
  purchaseReturnForm: FormGroup;
  supplierId: number | null = null;
  supplier: Supplier[] = [];
  @Input() purchaseReturn: PurchaseReturn = {} as PurchaseReturn;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

  constructor(
    private layoutService: LayoutService,
    private purchaseReturnService: PurchaseReturnService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private location: Location,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.purchaseReturn.id = String(this.route.snapshot.paramMap.get('id'));
    this.purchaseReturnForm = new FormGroup({
      destination: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      note: new FormControl(null),
      type: new FormControl(null, Validators.required),
      supplier: new FormControl(null, Validators.required),
      purchase_return_details: new FormArray([]),
      purchase_return_documents: new FormArray([]),
    });
  }
  ngOnInit(): void {
    if (!this.quickView) {
      this.loadData();
    }
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngOnChanges(): void {
    if (this.purchaseReturn.id) {
      this.refresh();
    }
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.purchaseReturnService
      .getPurchaseReturn(this.purchaseReturn.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.purchaseReturn = res.data;

        this.generateActionButtons();
        this.generateHeader();

        this.purchaseReturnForm.patchValue({
          destination: this.purchaseReturn.destination,
          date: this.purchaseReturn.date,
          note: this.purchaseReturn.note,
          type: this.purchaseReturn.type,
          supplier: this.purchaseReturn.supplier,
        });

        this.purchaseReturn.purchase_return_details.forEach((data: any) => {
          this.purchaseReturnDetails.push(
            this.generatePurchaseReturnDetails(data),
          );
        });

        this.purchaseReturn.purchase_return_documents.forEach(
          (purchaseReturnDocument: any) => {
            const dotIndex =
              purchaseReturnDocument.original_name.lastIndexOf('.');
            let fileType = '';
            if (dotIndex !== -1) {
              // Extract the "type" part from the input
              fileType =
                purchaseReturnDocument.original_name.substring(dotIndex);
            }
            this.documentFilesArray.push(
              new FormGroup({
                id: new FormControl(purchaseReturnDocument.id),
                file: new FormControl(purchaseReturnDocument.url),
                original_name: new FormControl(
                  purchaseReturnDocument.original_name,
                ),
                file_type: new FormControl(fileType),
                inputChangeName: new FormControl(false),
              }),
            );
          },
        );
      });
  }

  generateActionButtons() {
    this.actionButtons.forEach((actionButton) => {
      actionButton.hidden = true;
    });
    switch (this.purchaseReturn.status) {
      case 0: // draft
        if (this.ability.can('update', 'purchase-return'))
          this.actionButtons[0].hidden = false;
        if (this.ability.can('complete', 'purchase-return'))
          this.actionButtons[1].hidden = false;
        if (this.ability.can('cancel', 'purchase-return'))
          this.actionButtons[2].hidden = false;
        if (this.ability.can('delete', 'purchase-return'))
          this.actionButtons[3].hidden = false;

        break;
      case 1: // completed
        break;
      case 2: // cancelled
        break;
      default:
        break;
    }
  }
  generateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Purchase Return (${this.purchaseReturn.status_name})`,
      icon: '',
      showHeader: true,
    });
  }

  get purchaseReturnDetails(): FormArray {
    return this.purchaseReturnForm.get('purchase_return_details') as FormArray;
  }

  generatePurchaseReturnDetails(purchaseReturnDetail: any): FormGroup {
    return new FormGroup({
      id: new FormControl(purchaseReturnDetail.id),
      purchaseable: new FormControl(purchaseReturnDetail.purchaseable),
      quantity: new FormControl(purchaseReturnDetail.quantity),
      amount: new FormControl(purchaseReturnDetail.amount),
    });
  }

  changeDestination() {
    this.purchaseReturnForm.removeControl('purchase_return_details');
    this.purchaseReturnForm.addControl(
      'purchase_return_details',
      new FormArray([]),
    );
  }

  removeDestination() {
    this.purchaseReturnForm.controls['destination'].setValue(null);
    this.purchaseReturnForm.removeControl('purchase_return_details');
    this.purchaseReturnForm.addControl(
      'purchase_return_details',
      new FormArray([]),
    );
  }

  removeSupplier() {
    this.purchaseReturnForm.controls['supplier'].setValue('');
  }

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
        this.purchaseReturnForm.controls['supplier'].setValue(supplier);
      }
    });
  }

  onAddPurchaseReturnDetail() {
    let existProducts: any[] = [];
    if (this.purchaseReturnDetails.value.length > 0) {
      existProducts = this.purchaseReturnDetails.value.map((data: any) => {
        return data.purchaseable.product;
      });
    }
    // Open Dialog
    const ref = this.dialogService.open(
      PurchaseReturnEditDetailDialogComponent,
      {
        data: {
          title: 'Add Purchase Return Detail',
          currentProducts: existProducts,
          destination: this.purchaseReturnForm.value.destination,
          purchaseReturnId: this.purchaseReturn.id,
          supplierId: this.purchaseReturnForm.value.supplier?.id,
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
    ref.onClose.subscribe((purchaseReturnDetail) => {
      if (purchaseReturnDetail) {
        this.purchaseReturnDetails.push(
          this.generatePurchaseReturnDetails(purchaseReturnDetail),
        );
      }
    });
  }

  onEditPurchaseReturnDetail(purchaseReturnDetailId: string, index: number) {
    let existProducts: any[] = [];
    if (this.purchaseReturnDetails.value.length > 0) {
      existProducts = this.purchaseReturnDetails.value.map((data: any) => {
        return data.purchaseable.product;
      });
    }
    // Open Dialog
    const ref = this.dialogService.open(
      PurchaseReturnEditDetailDialogComponent,
      {
        data: {
          title: 'Edit Purchase Return Detail',
          currentProducts: existProducts,
          purchaseReturnDetail: this.purchaseReturnDetails.value[index],
          destination: this.purchaseReturnForm.value.destination,
          purchaseReturnId: this.purchaseReturn.id,
          purchaseReturnDetailId: purchaseReturnDetailId,
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
    ref.onClose.subscribe((newData) => {
      if (newData) {
        this.purchaseReturnDetails.at(index).patchValue(newData);
      }
    });
  }

  onRemovePurchaseReturnDetail(purchaseReturnDetailId: string, index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseReturnService
          .deletePurchaseReturnDetail(
            this.purchaseReturn.id,
            purchaseReturnDetailId,
          )
          .subscribe({
            next: (res: any) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Return Detail',
                detail: res.message,
              });
              this.purchaseReturnDetails.removeAt(index);
            },
            error: (err) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Return Detail',
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

  delete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this purchase return ?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[3].loading = true;
        this.purchaseReturnService
          .deletePurchaseReturn(this.purchaseReturn.id)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[3].loading = false;
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Return',
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
                summary: 'Purchase Return',
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

  setPurchaseReturnAsCancel() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to set this purchase return as cancel ?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[2].loading = true;
        this.purchaseReturnService
          .setStatusAsCancel(this.purchaseReturn.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Return',
                detail: res.message,
              });
              this.purchaseReturn.status_name = res.data.status_name;
              this.purchaseReturn.status = res.data.status;
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
                summary: 'Purchase Return',
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

  setPurchaseReturnAsComplete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to set this purchase return as complete ?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[1].loading = true;
        this.purchaseReturnService
          .setStatusAsComplete(this.purchaseReturn.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.clear();
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Return',
                detail: res.message,
              });
              this.purchaseReturn.status_name = res.data.status_name;
              this.purchaseReturn.status = res.data.status;
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
                summary: 'Purchase Return',
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
    return this.purchaseReturnForm.get(
      'purchase_return_documents',
    ) as FormArray;
  }

  addMultipleFiles(files: any) {
    if (!this.ability.can('update', 'purchase-return')) return;
    this.loadingDocument = true;
    // make body request
    let bodyReqDocument = new FormData();
    files.forEach((data: any, i: number) => {
      bodyReqDocument.append(
        `purchase_return_documents[${i}][file]`,
        data.file,
      );
      bodyReqDocument.append(
        `purchase_return_documents[${i}][original_name]`,
        data.file.name,
      );
    });
    // push to api
    this.purchaseReturnService
      .addPurchaseReturnDocuments(this.purchaseReturn.id, bodyReqDocument)
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
            summary: 'Purchase Return Documents',
            detail: res.message,
          });
        },
        error: (err) => {
          this.loadingDocument = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Purchase Return Documents',
            detail: err.message,
          });
        },
      });
  }

  removeDocument(index: number, id: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this purchase return document?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseReturnService
          .deletePurchaseReturnDocument(this.purchaseReturn.id, id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Return Documents',
                detail: res.message,
              });
              this.documentFilesArray.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Return Documents',
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
    if (this.purchaseReturn.status) return;

    const documentFile = this.documentFilesArray.at(index);
    if (documentFile.value.inputChangeName == true) {
      this.confirmationService.confirm({
        header: 'Confirmation',
        message: 'Are you sure to update this purchase return document name?',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => {
          let bodyReq = new FormGroup({
            original_name: new FormControl(
              this.documentFilesArray.value[index].original_name +
                documentFile.value.file_type,
            ),
          });
          this.purchaseReturnService
            .updatePurchaseReturnDocument(
              this.purchaseReturn.id,
              id,
              bodyReq.value,
            )
            .subscribe({
              next: (res: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Purchase Return Documents',
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
                  summary: 'Purchase Return Documents',
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

  submit() {
    if (this.purchaseReturnForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchaseReturnForm);
      return;
    }
    let bodyReqForm: FormGroup;
    bodyReqForm = new FormGroup({
      date: new FormControl(this.purchaseReturnForm.value.date),
      note: new FormControl(this.purchaseReturnForm.value.note),
    });

    this.purchaseReturnService
      .updatePurchaseReturn(this.purchaseReturn.id, bodyReqForm.value)
      .subscribe({
        next: (res: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Purchase Return',
            detail: res.message,
          });
          this.purchaseReturn.status = res.data.status;
          this.purchaseReturn.status_name = res.data.status_name;
          this.generateActionButtons();
          this.generateHeader();
          if (this.quickView) {
            this.onUpdated.emit(res.data);
          }
        },
        error: (err) => {
          this.actionButtons[0].loading = false;
        },
      });
  }
  refresh() {
    this.purchaseReturnForm.removeControl('purchase_return_details');
    this.purchaseReturnForm.addControl(
      'purchase_return_details',
      new FormArray([]),
    );
    this.loadData();
  }
  back() {
    this.location.back();
  }
}
