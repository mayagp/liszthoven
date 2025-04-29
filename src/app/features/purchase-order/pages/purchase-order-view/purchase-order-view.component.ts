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
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  faFile,
  faSpinner,
  faSave,
  faDownload,
  faXmark,
  faFloppyDisk,
  faCloudArrowUp,
  faExclamationCircle,
  faCheck,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { PurchaseOrderEditDetailComponent } from '../../components/purchase-order-edit-detail/purchase-order-edit-detail.component';
import { PurchaseOrder } from '../../interfaces/purchase-order';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';
import { FcDatepickerComponent } from '../../../../shared/components/fc-datepicker/fc-datepicker.component';

@Component({
  selector: 'app-purchase-order-view',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    ToastModule,
    ConfirmDialogModule,
    FcInputTextComponent,
    FcImagePreviewComponent,
    FcCurrencyPipe,
    RouterModule,
    DatePickerModule,
    IftaLabelModule,
    InputNumberModule,
  ],
  templateUrl: './purchase-order-view.component.html',
  styleUrl: './purchase-order-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchaseOrderViewComponent {
  private readonly destroy$ = new Subject<void>();
  // Icons
  faLocationDot = faLocationDot;
  faPhone = faPhone;
  faPlus = faPlus;
  faChevronDown = faChevronDown;
  faTimes = faTimes;
  faPencil = faPencil;
  faTrash = faTrash;
  faFile = faFile;
  faSpinner = faSpinner;
  faSave = faSave;
  faDownload = faDownload;
  faXmark = faXmark;
  faFloppyDisk = faFloppyDisk;
  faCloudArrowUp = faCloudArrowUp;
  faExclamationCircle = faExclamationCircle;

  loading = false;
  @Input() purchaseOrder: PurchaseOrder = {} as PurchaseOrder;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

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
      icon: faCheck,
      hidden: true,
      action: () => {
        this.approvePurchaseOrder();
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
  purchaseOrderForm: FormGroup;

  constructor(
    private layoutService: LayoutService,
    private purchaseOrderService: PurchaseOrderService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private location: Location,
    private ability: PureAbility,
  ) {
    this.purchaseOrder.id = String(this.route.snapshot.paramMap.get('id'));

    // init form
    this.purchaseOrderForm = new FormGroup({
      purchase_order_no: new FormControl(null),
      status_name: new FormControl(null, Validators.required),
      supplier: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      expected_delivery_date: new FormControl(new Date(), Validators.required),
      tax: new FormControl(0),
      note: new FormControl(''),
      business_unit: new FormControl(null, Validators.required),
      purchase_order_documents: new FormArray([]),
      purchase_order_details: new FormArray([], Validators.required),
    });
  }

  ngOnInit(): void {
    if (!this.quickView) {
      this.loadData();
    }
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngOnChanges(): void {
    if (this.purchaseOrder.id) {
      this.refresh();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }
  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.purchaseOrderService
      .getPurchaseOrder(this.purchaseOrder.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.purchaseOrder = res.data;
        this.generateActionButtons();
        this.generateHeader();
        this.purchaseOrderForm.patchValue({
          purchase_order_no: this.purchaseOrder.purchase_order_no,
          status_name: this.purchaseOrder.status_name,
          supplier: this.purchaseOrder.supplier,
          date: new Date(this.purchaseOrder.date),
          expected_delivery_date: new Date(
            this.purchaseOrder.expected_delivery_date,
          ),
          tax: Number(this.purchaseOrder.tax),
          note: this.purchaseOrder.note,
          business_unit: this.purchaseOrder.business_unit,
        });

        this.purchaseOrder.purchase_order_details.forEach(
          (purchaseOrderDetail: any) => {
            if (purchaseOrderDetail.supplier_quotation) {
              purchaseOrderDetail.supplier_quotation.supplier_quotation_id =
                purchaseOrderDetail.supplier_quotation.id;
            }
            this.purchaseOrderDetails.push(
              this.generatePurchaseOrderDetail(purchaseOrderDetail),
            );
          },
        );
        this.purchaseOrder.purchase_order_documents.forEach(
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
        setTimeout(() => {
          this.setOrderSummaryVisibility();
        }, 1);
      });
  }
  generateActionButtons() {
    // reset action buttons
    this.actionButtons[0].hidden = true; // save
    this.actionButtons[1].hidden = true; // approve
    this.actionButtons[2].hidden = true; // cancel
    this.actionButtons[3].hidden = true; // delete

    switch (this.purchaseOrder.status) {
      case 0: // pending
        if (this.ability.can('update', 'purchase-order'))
          this.actionButtons[0].hidden = false; // save
        if (this.ability.can('approve', 'purchase-order'))
          this.actionButtons[1].hidden = false; // approve
        if (this.ability.can('cancel', 'purchase-order'))
          this.actionButtons[2].hidden = false; // cancel
        if (this.ability.can('delete', 'purchase-order'))
          this.actionButtons[3].hidden = false; // delete

        break;
      case 1: // Approved
        break;
      case 2: // complete
        break;
      case 4: // cancelled
        break;
      default:
        break;
    }
  }
  generateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Purchase Order (${this.purchaseOrder.status_name})`,
      icon: '',
      showHeader: true,
    });
  }

  isShowOrderSummary: boolean = false;
  @ViewChild('orderSummary') orderSummary?: ElementRef;
  @ViewChild('purchaseOrderFormElement') purchaseOrderFormElement?: ElementRef;
  @ViewChild('stickyPurchaseOrderSummary')
  stickyPurchaseOrderSummary?: ElementRef;
  // Detect scroll in order summary
  onScroll(event: any) {
    this.setOrderSummaryVisibility();
  }

  setOrderSummaryVisibility() {
    let formPurchaseOrderBoxBounds =
      this.purchaseOrderFormElement?.nativeElement.getBoundingClientRect();
    let stickyPurchaseOrderBoxBounds =
      this.stickyPurchaseOrderSummary?.nativeElement.getBoundingClientRect();
    let orderSummaryBoxBounds =
      this.orderSummary?.nativeElement.getBoundingClientRect();
    if (
      formPurchaseOrderBoxBounds != undefined &&
      orderSummaryBoxBounds != undefined
    ) {
      if (
        formPurchaseOrderBoxBounds.bottom -
          (orderSummaryBoxBounds.bottom - orderSummaryBoxBounds.height) <
        stickyPurchaseOrderBoxBounds.height
      ) {
        this.isShowOrderSummary = true;
      } else {
        this.isShowOrderSummary = false;
      }
    }
  }

  scrollToBottom() {
    this.orderSummary?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
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

  get purchaseOrderDetails(): FormArray {
    return this.purchaseOrderForm.get('purchase_order_details') as FormArray;
  }

  removeBusinessUnit() {
    this.purchaseOrderForm.controls['business_unit'].setValue('');
  }

  onSelectBusinessUnit() {
    const ref = this.dialogService.open(BranchSelectDialogComponent, {
      data: {
        title: 'Select Branch',
        companyId: 2,
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
    ref.onClose.subscribe((businessUnit: any) => {
      if (businessUnit) {
        this.purchaseOrderForm.controls['business_unit'].setValue(businessUnit);
      }
    });
  }

  // previewPdf(file: any) {
  //   const ref = this.dialogService.open(FcPdfViewerComponent, {
  //     data: {
  //       title: 'Preview PDF',
  //       url: file.file,
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
  //     width: '900px',
  //   });
  //   ref.onClose.subscribe((pdf: any) => {
  //     if (pdf) {
  //     }
  //   });
  // }

  removeSupplier() {
    this.purchaseOrderForm.controls['supplier'].setValue('');
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
        this.purchaseOrderForm.controls['supplier'].setValue(supplier);
      }
    });
  }

  generatePurchaseOrderDetail(purchaseOrderDetail: any): FormGroup {
    return new FormGroup({
      id: new FormControl(purchaseOrderDetail.id, Validators.required),
      quotation_no: new FormControl(
        purchaseOrderDetail.quotation_no,
        Validators.required,
      ),
      supplier_quotation: new FormControl(
        purchaseOrderDetail.supplier_quotation,
      ),
      product: new FormControl(
        purchaseOrderDetail.product,
        Validators.required,
      ),
      price_per_unit: new FormControl(
        purchaseOrderDetail.price_per_unit,
        Validators.required,
      ),
      quantity_ordered: new FormControl(
        purchaseOrderDetail.quantity_ordered,
        Validators.required,
      ),
      expected_delivery_date: new FormControl(
        purchaseOrderDetail.expected_delivery_date,
      ),
      // purchase_order_warehouses: new FormArray(
      //   purchaseOrderDetail.purchase_order_warehouses.map((data: any) => {
      //     return new FormGroup({
      //       id: new FormControl(data.id, Validators.required),
      //       warehouse: new FormControl(data.warehouse, Validators.required),
      //       quantity_ordered: new FormControl(
      //         data.quantity_ordered,
      //         Validators.required
      //       ),
      //     });
      //   })
      // ),
    });
  }

  get grandTotalPrice() {
    return this.subTotalPrice + this.purchaseOrderForm.value.tax;
  }

  get subTotalPrice() {
    return this.purchaseOrderDetails.value.reduce(
      (sum: any, item: any) =>
        sum + item.price_per_unit * item.quantity_ordered,
      0,
    );
  }

  getTotalQtyItem(item: any) {
    return item.purchase_order_warehouses.reduce(
      (sum_b: any, item: any) => sum_b + item.quantity_ordered,
      0,
    );
  }

  addPurchaseOrderDetail() {
    const ref = this.dialogService.open(PurchaseOrderEditDetailComponent, {
      data: {
        title: 'Add Purchase Order Detail',
        existingPurchaseOrderDetails: this.purchaseOrderDetails.value,
        purchaseOrderId: this.purchaseOrder.id,
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
    ref.onClose.subscribe((purchaseOrderDetail) => {
      if (purchaseOrderDetail) {
        if (purchaseOrderDetail.supplier_quotation_id) {
          purchaseOrderDetail.supplier_quotation.supplier_quotation_id =
            purchaseOrderDetail.supplier_quotation_id;
        }
        this.purchaseOrderDetails.push(
          this.generatePurchaseOrderDetail(purchaseOrderDetail),
        );
      }
    });
  }

  editPurchaseOrderDetail(index: number, pod_id: any) {
    const ref = this.dialogService.open(PurchaseOrderEditDetailComponent, {
      data: {
        title: 'Edit Purchase Order Detail',
        existingPurchaseOrderDetails: this.purchaseOrderDetails.value,
        purchaseOrderDetail: this.purchaseOrderDetails.value[index],
        purchaseOrderId: this.purchaseOrder.id,
        purchaseOrderDetailId: pod_id,
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
    ref.onClose.subscribe((purchaseOrderDetail) => {
      if (purchaseOrderDetail) {
        this.purchaseOrderDetails.at(index).patchValue({
          quotation_no: purchaseOrderDetail.quotation_no,
          supplier_quotation: purchaseOrderDetail.supplier_quotation,
          product: purchaseOrderDetail.product,
          price_per_unit: purchaseOrderDetail.price_per_unit,
          quantity_ordered: purchaseOrderDetail.quantity_ordered,
          expected_delivery_date: purchaseOrderDetail.expected_delivery_date,
        });

        // For updated warehouse
        // let updatedWarehouseFormArray: any = new FormArray([]);
        // if (purchaseOrderDetail.purchase_order_warehouses) {
        //   purchaseOrderDetail.purchase_order_warehouses.forEach((data: any) => {
        //     updatedWarehouseFormArray.push(
        //       new FormGroup({
        //         id: new FormControl(data.id),
        //         warehouse: new FormControl(data.warehouse),
        //         quantity_ordered: new FormControl(data.quantity_ordered),
        //       })
        //     );
        //   });
        // }

        let formGroup = this.purchaseOrderDetails.at(index) as FormGroup;
        // formGroup.removeControl('purchase_order_warehouses');
        // formGroup.addControl(
        //   'purchase_order_warehouses',
        //   updatedWarehouseFormArray
        // );
        this.purchaseOrderDetails.at(index).patchValue(formGroup);
      }
    });
  }

  removePurchaseOrderDetail(index: number, purchaseOrderDetailId: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      accept: () => {
        this.purchaseOrderService
          .deletePurchaseOrderDetail(
            this.purchaseOrder.id,
            purchaseOrderDetailId,
          )
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Order Detail',
                detail: res.message,
              });
              this.purchaseOrderDetails.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Order Detail',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  cancel() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to cancel this purchase order?',
      accept: () => {
        this.purchaseOrderService
          .cancelPurchaseOrder(this.purchaseOrder.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Order',
                detail: res.message,
              });
              this.purchaseOrder.status = res.data.status;
              this.purchaseOrder.status_name = res.data.status_name;
              this.generateActionButtons();
              this.generateHeader();
              if (this.quickView) {
                this.onUpdated.emit(this.purchaseOrder);
              }
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Order',
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
      message: 'Are you sure to delete this purchase order?',
      accept: () => {
        this.purchaseOrderService
          .deletePurchaseOrder(this.purchaseOrder.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Order',
                detail: res.detail,
              });
              if (this.quickView) {
                this.onDeleted.emit();
              } else {
                this.back();
              }
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Order',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  approvePurchaseOrder() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to approve this purchase order?',
      accept: () => {
        this.actionButtons[1].loading = true;
        this.purchaseOrderService
          .approvePurchaseOrder(this.purchaseOrder.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Order',
                detail: res.message,
              });
              this.actionButtons[1].loading = false;
              this.purchaseOrder.status = res.data.status;
              this.purchaseOrder.status_name = res.data.status_name;
              this.generateActionButtons();
              this.generateHeader();
              if (this.quickView) {
                this.onUpdated.emit(this.purchaseOrder);
              }
            },
            error: (err) => {
              this.actionButtons[1].loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Approve Purchase Order',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  // manage purchase order document files
  loadingDocument = false;
  get documentFilesArray() {
    return this.purchaseOrderForm.get('purchase_order_documents') as FormArray;
  }

  addMultipleFiles(files: any) {
    this.loadingDocument = true;
    // make body request
    let bodyReqDocument = new FormData();
    files.forEach((data: any, i: number) => {
      bodyReqDocument.append(`purchase_order_documents[${i}][file]`, data.file);
      bodyReqDocument.append(
        `purchase_order_documents[${i}][original_name]`,
        data.file.name,
      );
    });
    // push to api
    this.purchaseOrderService
      .addPurchaseOrderDocument(this.purchaseOrder.id, bodyReqDocument)
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
            summary: 'Purchase Order Documents',
            detail: res.message,
          });
        },
        error: (err) => {
          this.loadingDocument = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Purchase Order Documents',
            detail: err.message,
          });
        },
      });
  }

  removeDocument(index: number, id: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this purchase order document?',
      accept: () => {
        this.purchaseOrderService
          .deletePurchaseOrderDocument(this.purchaseOrder.id, id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Order Documents',
                detail: res.message,
              });
              this.documentFilesArray.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Purchase Order Documents',
                detail: err.message,
              });
            },
          });
      },
    });
  }

  changeDocumentName(index: number, id: string) {
    if (this.purchaseOrder.status) return;

    const documentFile = this.documentFilesArray.at(index);
    if (documentFile.value.inputChangeName == true) {
      this.confirmationService.confirm({
        header: 'Confirmation',
        message: 'Are you sure to update this purchase order document name?',
        accept: () => {
          let bodyReq = new FormGroup({
            original_name: new FormControl(
              this.documentFilesArray.value[index].original_name +
                documentFile.value.file_type,
            ),
          });
          this.purchaseOrderService
            .updatePurchaseOrderDocument(
              this.purchaseOrder.id,
              id,
              bodyReq.value,
            )
            .subscribe({
              next: (res: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Purchase Order Documents',
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
                  summary: 'Purchase Order Documents',
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
    if (this.purchaseOrderForm.valid) {
      this.actionButtons[0].loading = true;
      let bodyReqForm: FormGroup;
      bodyReqForm = new FormGroup({
        supplier_id: new FormControl(
          Number(this.purchaseOrderForm.value.supplier.id),
        ),
        date: new FormControl(this.purchaseOrderForm.value.date),
        expected_delivery_date: new FormControl(
          this.purchaseOrderForm.value.expected_delivery_date,
        ),
        tax: new FormControl(Number(this.purchaseOrderForm.value.tax)),
        note: new FormControl(this.purchaseOrderForm.value.note),
        business_unit_id: new FormControl(
          this.purchaseOrderForm.value.business_unit.id,
        ),
      });

      this.purchaseOrderService
        .updatePurchaseOrder(this.purchaseOrder.id, bodyReqForm.value)
        .subscribe({
          next: (res: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Order',
              detail: res.message,
            });
            this.purchaseOrder.purchase_order_no = res.data.purchase_order_no;
            this.purchaseOrder.status_name = res.data.status_name;
            this.layoutService.setHeaderConfig({
              title: `${this.purchaseOrder.purchase_order_no} (${this.purchaseOrder.status_name})`,
              icon: '',
              showHeader: true,
            });
            if (this.quickView) {
              this.onUpdated.emit(this.purchaseOrder);
            }
          },
          error: (err) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Purchase Order',
              detail: err.message,
            });
          },
        });
    } else {
      // Toast
      this.messageService.add({
        summary: 'Purchase Order',
        detail: 'Fill the form first!',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    }
  }
  refresh() {
    this.isShowOrderSummary = false;
    this.purchaseOrderForm.removeControl('purchase_order_details');
    this.purchaseOrderForm.addControl(
      'purchase_order_details',
      new FormArray([]),
    );
    this.purchaseOrderForm.removeControl('purchase_order_documents');
    this.purchaseOrderForm.addControl(
      'purchase_order_documents',
      new FormArray([]),
    );
    this.loadData();
  }
  back() {
    this.location.back();
  }
}
