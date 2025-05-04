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
import { ActivatedRoute } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLocationDot,
  faPhone,
  faPlus,
  faChevronDown,
  faTimes,
  faPencil,
  faTrash,
  faCloudArrowUp,
  faFile,
  faFloppyDisk,
  faXmark,
  faExclamationCircle,
  faSave,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { PurchaseOrderService } from '../../../purchase-order/services/purchase-order.service';
import { PurchaseInvoiceDetailAddDialogComponent } from '../../components/purchase-invoice-detail-add-dialog/purchase-invoice-detail-add-dialog.component';
import { PurchaseInvoiceDetailEditDialogComponent } from '../../components/purchase-invoice-detail-edit-dialog/purchase-invoice-detail-edit-dialog.component';
import { PurchaseInvoiceDetailComponent } from '../../components/purchase-invoice-detail/purchase-invoice-detail.component';
import { PurchaseInvoice } from '../../interfaces/purchase-invoice';
import { PurchaseInvoiceService } from '../../services/purchase-invoice.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-purchase-invoice-view',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    ToastModule,
    ConfirmDialogModule,
    FcInputTextComponent,
    FcCurrencyPipe,
    DatePickerModule,
    IftaLabelModule,
    FcImagePreviewComponent,
    PurchaseInvoiceDetailComponent,
    InputNumberModule,
    ProgressSpinner,
  ],
  templateUrl: './purchase-invoice-view.component.html',
  styleUrl: './purchase-invoice-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchaseInvoiceViewComponent {
  private readonly destroy$ = new Subject<void>();
  // Icons
  faLocationDot = faLocationDot;
  faPhone = faPhone;
  faPlus = faPlus;
  faChevronDown = faChevronDown;
  faTimes = faTimes;
  faPencil = faPencil;
  faTrash = faTrash;
  faCloudArrowUp = faCloudArrowUp;
  faFile = faFile;
  faFloppyDisk = faFloppyDisk;
  faXmark = faXmark;
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
      label: 'Approval Request',
      icon: faSave,
      hidden: true,
      action: () => {
        this.approvalRequest();
      },
    },
    {
      label: 'Approve',
      icon: faSave,
      hidden: true,
      action: () => {
        this.approve();
      },
    },
    {
      label: 'Cancel',
      icon: faTimes,
      hidden: true,
      action: () => {
        this.cancel();
      },
    },
    {
      label: 'Delete',
      icon: faTrash,
      hidden: true,
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

  @Input() purchaseInvoice: PurchaseInvoice = {} as PurchaseInvoice;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();
  loading = true;

  purchaseInvoiceForm: FormGroup;
  constructor(
    private layoutService: LayoutService,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private purchaseOrderService: PurchaseOrderService,
    private location: Location,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private ability: PureAbility,
  ) {
    if (this.route.snapshot.paramMap.get('id')) {
      this.purchaseInvoice.id = this.route.snapshot.paramMap.get('id') as any;
    }
    this.layoutService.setHeaderConfig({
      title: 'Purchase Invoice',
      icon: '',
      showHeader: true,
    });
    // init form
    this.purchaseInvoiceForm = new FormGroup({
      purchase_order: new FormControl(null),
      date: new FormControl(new Date(), Validators.required),
      due_date: new FormControl(null, Validators.required),
      tax: new FormControl(null, Validators.required),
      note: new FormControl(null),
      supplier: new FormControl(null),
      business_unit: new FormControl(null),
      purchase_invoice_details: new FormArray([]),
      purchase_invoice_documents: new FormArray([]),
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

  loadPurchaseOrder = false;
  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.purchaseInvoiceService
      .getPurchaseInvoice(this.purchaseInvoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.purchaseInvoice = res.data;
        // Load Purchase Order Data, because i need purchase order details
        if (this.purchaseInvoice.purchase_order_id) {
          this.loadPurchaseOrder = true;
          this.purchaseOrderService
            .getPurchaseOrder(this.purchaseInvoice.purchase_order_id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((purchaseOrder: any) => {
              this.loadPurchaseOrder = false;
              this.purchaseInvoiceForm.patchValue({
                purchase_order: purchaseOrder.data,
              });
            });
        }
        this.purchaseInvoiceForm.patchValue({
          date: this.purchaseInvoice.date,
          due_date: this.purchaseInvoice.due_date,
          tax: Number(this.purchaseInvoice.tax),
          note: this.purchaseInvoice.note,
          supplier: this.purchaseInvoice.supplier,
          business_unit: this.purchaseInvoice.business_unit,
        });
        this.purchaseInvoice.purchase_invoice_details.forEach(
          (purchaseInvoiceDetail) => {
            this.purchaseInvoiceDetails.push(
              this.generatePurchaseInvoiceDetail(purchaseInvoiceDetail),
            );
          },
        );
        this.purchaseInvoice.purchase_invoice_documents.forEach(
          (purchaseInvoiceDocument: any) => {
            const dotIndex =
              purchaseInvoiceDocument.original_name.lastIndexOf('.');
            let fileType = '';
            if (dotIndex !== -1) {
              // Extract the "type" part from the input
              fileType =
                purchaseInvoiceDocument.original_name.substring(dotIndex);
            }
            this.documentFilesArray.push(
              new FormGroup({
                id: new FormControl(purchaseInvoiceDocument.id),
                file: new FormControl(purchaseInvoiceDocument.url),
                original_name: new FormControl(
                  purchaseInvoiceDocument.original_name,
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
          this.setInvoiceSummaryVisibility();
        }, 100);
      });
  }

  generateActionButtons() {
    // reset action buttons
    this.actionButtons[0].hidden = true; // save
    this.actionButtons[1].hidden = true; // approval request
    this.actionButtons[2].hidden = true; // approve
    this.actionButtons[3].hidden = true; // cancel
    this.actionButtons[4].hidden = true; // delete

    switch (this.purchaseInvoice.status) {
      case 0: // pending
        if (this.ability.can('update', 'purchase-invoice'))
          this.actionButtons[0].hidden = false;
        if (this.ability.can('approval-request', 'purchase-invoice'))
          this.actionButtons[1].hidden = false;
        if (this.ability.can('cancel', 'purchase-invoice'))
          this.actionButtons[3].hidden = false;
        if (this.ability.can('delete', 'purchase-invoice'))
          this.actionButtons[4].hidden = false;
        break;
      case 1: // Approval request
        if (this.ability.can('approve', 'purchase-invoice'))
          this.actionButtons[2].hidden = false;
        if (this.ability.can('cancel', 'purchase-invoice'))
          this.actionButtons[3].hidden = false;
        if (this.ability.can('delete', 'purchase-invoice'))
          this.actionButtons[4].hidden = false;
        break;
      case 2: // Approved
        break;
      case 3: // cancelled
        break;
      default:
        break;
    }
  }
  generateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Purchase Invoice (${this.purchaseInvoice.status_name})`,
      icon: '',
      showHeader: true,
    });
  }

  isShowInvoiceSummary: boolean = false;
  @ViewChild('orderSummary') orderSummary?: ElementRef;
  @ViewChild('purchaseInvoiceFormElement')
  purchaseInvoiceFormElement?: ElementRef;
  @ViewChild('stickyPurchaseInvoiceSummary')
  stickyPurchaseInvoiceSummary?: ElementRef;
  // Detect scroll in order summary
  onScroll(event: any) {
    this.setInvoiceSummaryVisibility();
  }

  setInvoiceSummaryVisibility() {
    let formPurchaseInvoiceBoxBounds =
      this.purchaseInvoiceFormElement?.nativeElement.getBoundingClientRect();
    let stickyPurchaseInvoiceBoxBounds =
      this.stickyPurchaseInvoiceSummary?.nativeElement.getBoundingClientRect();
    let orderSummaryBoxBounds =
      this.orderSummary?.nativeElement.getBoundingClientRect();
    try {
      if (
        formPurchaseInvoiceBoxBounds.bottom -
          (orderSummaryBoxBounds.bottom - orderSummaryBoxBounds.height) <
        stickyPurchaseInvoiceBoxBounds.height
      ) {
        this.isShowInvoiceSummary = true;
      } else {
        this.isShowInvoiceSummary = false;
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

  generatePurchaseInvoiceDetail(purchaseInvoiceDetail: any): FormGroup {
    return new FormGroup({
      id: new FormControl(purchaseInvoiceDetail.id, Validators.required),
      product: new FormControl(
        purchaseInvoiceDetail.product,
        Validators.required,
      ),
      quantity: new FormControl(
        purchaseInvoiceDetail.quantity,
        Validators.required,
      ),
      remaining_quantity: new FormControl(
        purchaseInvoiceDetail.remaining_quantity,
      ),
      unit_price: new FormControl(
        purchaseInvoiceDetail.unit_price,
        Validators.required,
      ),
    });
  }

  // Manage Purchase Invoice Detail
  get purchaseInvoiceDetails(): FormArray {
    return this.purchaseInvoiceForm.get(
      'purchase_invoice_details',
    ) as FormArray;
  }

  addPurchaseInvoiceDetail() {
    let purchaseOrder = this.purchaseInvoiceForm.value.purchase_order;
    const ref = this.dialogService.open(
      PurchaseInvoiceDetailAddDialogComponent,
      {
        data: {
          title: 'Add Purchase Invoice Detail',
          purchaseOrderDetails: purchaseOrder,
          purchaseInvoiceDetails: this.purchaseInvoiceDetails.value,
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
        let bodyReq = JSON.parse(JSON.stringify(purchaseInvoiceDetail)); // deep copy
        bodyReq.product_id = bodyReq.product.id;
        // update detail on order
        if (this.purchaseInvoiceForm.value.purchase_order) {
          bodyReq.update_order = true;
        }
        delete bodyReq.product;

        this.purchaseInvoiceService
          .addPurchaseInvoiceDetail(this.purchaseInvoice.id, bodyReq)
          .subscribe({
            next: (res: any) => {
              purchaseInvoiceDetail.id = res.data.id;
              this.purchaseInvoiceDetails.push(
                this.generatePurchaseInvoiceDetail(purchaseInvoiceDetail),
              );
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Invoice Detail has been added',
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
  }

  editPurchaseInvoiceDetail(index: number) {
    let purchaseOrder = this.purchaseInvoiceForm.value.purchase_order;
    const ref = this.dialogService.open(
      PurchaseInvoiceDetailEditDialogComponent,
      {
        data: {
          title: 'Edit Purchase Invoice Detail',
          purchaseOrderDetails: purchaseOrder,
          purchaseInvoiceDetail: this.purchaseInvoiceDetails.value[index],
          purchaseInvoiceDetails: this.purchaseInvoiceDetails.value,
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
        let bodyReq = JSON.parse(JSON.stringify(purchaseInvoiceDetail)); // deep copy
        bodyReq.product_id = bodyReq.product.id;
        // update detail on order
        if (this.purchaseInvoiceForm.value.purchase_order) {
          bodyReq.update_order = true;
        }
        delete bodyReq.product;

        this.purchaseInvoiceService
          .updatePurchaseInvoiceDetail(
            this.purchaseInvoice.id,
            bodyReq,
            this.purchaseInvoiceDetails.value[index].id,
          )
          .subscribe({
            next: (res: any) => {
              this.purchaseInvoiceDetails
                .at(index)
                .patchValue(purchaseInvoiceDetail);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Invoice Detail has been updated',
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
  }
  deletePurchaseInvoiceDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseInvoiceService
          .deletePurchaseInvoiceDetail(
            this.purchaseInvoice.id,
            this.purchaseInvoiceDetails.value[index].id,
          )
          .subscribe({
            next: (res: any) => {
              this.purchaseInvoiceDetails.removeAt(index);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Invoice Detail has been deleted',
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
    return this.subTotalPrice + this.purchaseInvoiceForm.value.tax;
  }

  get subTotalPrice() {
    return this.purchaseInvoiceDetails.value.reduce(
      (sum: any, item: any) => sum + item.quantity * item.unit_price,
      0,
    );
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
    return this.purchaseInvoiceForm.get(
      'purchase_invoice_documents',
    ) as FormArray;
  }

  addMultipleFiles(files: any) {
    this.loadingDocument = true;
    // make body request
    let bodyReqDocument = new FormData();
    files.forEach((data: any, i: number) => {
      bodyReqDocument.append(
        `purchase_invoice_documents[${i}][file]`,
        data.file,
      );
      bodyReqDocument.append(
        `purchase_invoice_documents[${i}][original_name]`,
        data.file.name,
      );
    });
    // push to api
    this.purchaseInvoiceService
      .addPurchaseInvoiceDocument(this.purchaseInvoice.id, bodyReqDocument)
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
            summary: 'Purchase Invoice Documents',
            detail: res.message,
          });
        },
        error: (err) => {
          this.loadingDocument = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Purchase Invoice Documents',
            detail: err.message,
          });
        },
      });
  }

  removeDocument(index: number, id: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this purchase invoice document?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseInvoiceService
          .deletePurchaseInvoiceDocument(this.purchaseInvoice.id, id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Invoice Documents',
                detail: res.message,
              });
              this.documentFilesArray.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Invoice Documents',
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
    if (this.purchaseInvoice.status) return;

    const documentFile = this.documentFilesArray.at(index);
    if (documentFile.value.inputChangeName == true) {
      this.confirmationService.confirm({
        header: 'Confirmation',
        message: 'Are you sure to update this purchase invoice document name?',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => {
          let bodyReq = new FormGroup({
            original_name: new FormControl(
              this.documentFilesArray.value[index].original_name +
                documentFile.value.file_type,
            ),
          });
          this.purchaseInvoiceService
            .updatePurchaseInvoiceDocument(
              this.purchaseInvoice.id,
              id,
              bodyReq.value,
            )
            .subscribe({
              next: (res: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Purchase Invoice Documents',
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
                  summary: 'Purchase Invoice Documents',
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
    if (this.purchaseInvoiceForm.valid) {
      let bodyReq = JSON.parse(JSON.stringify(this.purchaseInvoiceForm.value)); // deep copy

      // Delete unuse field
      delete bodyReq.purchase_order;
      delete bodyReq.supplier;
      delete bodyReq.business_unit;
      delete bodyReq.purchase_invoice_details;
      delete bodyReq.purchase_invoice_documents;
      this.actionButtons[0].loading = true;
      this.purchaseInvoiceService
        .updatePurchaseInvoice(this.purchaseInvoice.id, bodyReq)
        .subscribe({
          next: (res: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success Message',
              detail: 'Purchase Invoice has been updated',
            });
            if (this.quickView) {
              this.onUpdated.emit(res.data);
            }
          },
          error: (err: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error Message',
              detail: err.message,
            });
          },
        });
    } else {
      // check involid formcontrol
      Object.keys(this.purchaseInvoiceForm.controls).forEach((field) => {
        const control = this.purchaseInvoiceForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });

      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'Error Message',
        detail: 'Please fill all required fields',
      });
    }
  }
  approve() {
    this.purchaseInvoiceService
      .approvePurchaseInvoice(this.purchaseInvoice.id)
      .subscribe({
        next: (res: any) => {
          this.purchaseInvoice.status = res.data.status;
          this.purchaseInvoice.status_name = res.data.status_name;
          this.messageService.add({
            severity: 'success',
            summary: 'Success Message',
            detail: 'Purchase Invoice has been Approved',
          });
          this.generateActionButtons();
          this.generateHeader();
          if (this.quickView) {
            this.onUpdated.emit(res.data);
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error Message',
            detail: error.message,
          });
        },
      });
  }
  approvalRequest() {
    this.purchaseInvoiceService
      .approvalRequestPurchaseInvoice(this.purchaseInvoice.id)
      .subscribe({
        next: (res: any) => {
          this.purchaseInvoice.status = res.data.status;
          this.purchaseInvoice.status_name = res.data.status_name;
          this.messageService.add({
            severity: 'success',
            summary: 'Success Message',
            detail: 'Purchase Invoice can be approve',
          });
          this.generateActionButtons();
          this.generateHeader();
          if (this.quickView) {
            this.onUpdated.emit(res.data);
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error Message',
            detail: error.message,
          });
        },
      });
  }
  cancel() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseInvoiceService
          .cancelPurchaseInvoice(this.purchaseInvoice.id)
          .subscribe({
            next: (res: any) => {
              this.purchaseInvoice.status = res.data.status;
              this.purchaseInvoice.status_name = res.data.status_name;
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Invoice has been canceled',
              });
              this.generateActionButtons();
              this.generateHeader();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: error.message,
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
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseInvoiceService
          .deletePurchaseInvoice(this.purchaseInvoice.id)
          .subscribe({
            next: (res) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase invoice deleted',
              });
              if (this.quickView) {
                this.onDeleted.emit();
              } else {
                this.back();
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: error.message,
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

  refresh() {
    this.purchaseInvoiceForm.reset();
    this.purchaseInvoiceForm.removeControl('purchase_invoice_details');
    this.purchaseInvoiceForm.addControl(
      'purchase_invoice_details',
      new FormArray([]),
    );
    this.purchaseInvoiceForm.removeControl('purchase_invoice_documents');
    this.purchaseInvoiceForm.addControl(
      'purchase_invoice_documents',
      new FormArray([]),
    );
    this.loadData();
  }

  back() {
    this.location.back();
  }
}
