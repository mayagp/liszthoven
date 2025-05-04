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
import { Router } from '@angular/router';
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
  faRefresh,
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
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { AutoNumberService } from '../../../../shared/services/auto-number.service';
import { PurchaseOrderSelectDialogComponent } from '../../../purchase-order/components/purchase-order-select-dialog/purchase-order-select-dialog.component';
import { PurchaseOrder } from '../../../purchase-order/interfaces/purchase-order';
import { PurchaseOrderService } from '../../../purchase-order/services/purchase-order.service';
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { PurchaseInvoiceDetailAddDialogComponent } from '../../components/purchase-invoice-detail-add-dialog/purchase-invoice-detail-add-dialog.component';
import { PurchaseInvoiceDetailEditDialogComponent } from '../../components/purchase-invoice-detail-edit-dialog/purchase-invoice-detail-edit-dialog.component';
import { PurchaseInvoiceService } from '../../services/purchase-invoice.service';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { PurchaseInvoiceDetailComponent } from '../../components/purchase-invoice-detail/purchase-invoice-detail.component';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-purchase-invoice-add',
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
  ],
  templateUrl: './purchase-invoice-add.component.html',
  styleUrl: './purchase-invoice-add.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchaseInvoiceAddComponent {
  private readonly destroy$ = new Subject<void>();
  // Icons
  faLocationDot = faLocationDot;
  faPhone = faPhone;
  faPlus = faPlus;
  faChevronDown = faChevronDown;
  faTimes = faTimes;
  faPencil = faPencil;
  faTrash = faTrash;
  faRefresh = faRefresh;
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

  purchaseInvoiceForm: FormGroup;
  purchaseInvoiceNumber: string = '';
  constructor(
    private layoutService: LayoutService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private purchaseOrderService: PurchaseOrderService,
    private location: Location,
    private autoNumberService: AutoNumberService,
    private router: Router,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'purchase-invoice',
    );
    this.layoutService.setHeaderConfig({
      title: 'Add Purchase Invoice',
      icon: '',
      showHeader: true,
    });
    // init form
    this.purchaseInvoiceForm = new FormGroup({
      purchase_order: new FormControl(null),
      date: new FormControl(new Date(), Validators.required),
      due_date: new FormControl(new Date(), Validators.required),
      tax: new FormControl(0, Validators.required),
      note: new FormControl(null),
      supplier: new FormControl(null, Validators.required),
      business_unit: new FormControl(null, Validators.required),
      purchase_invoice_details: new FormArray([], Validators.required),
      purchase_invoice_documents: new FormArray([]),
    });
  }
  ngOnInit(): void {
    setTimeout(() => {
      if (this.purchaseInvoiceDetails.value.length) {
        this.setInvoiceSummaryVisibility();
      }
    }, 1);
    this.generateAutoNumber();
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  generateAutoNumber() {
    this.autoNumberService
      .getAutoNumberByTabel('purchase_invoices')
      .subscribe((res: any) => {
        this.purchaseInvoiceNumber = res.latest_auto_number;
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

  // Manage Purchase Order
  onSelectPurchaseOrder() {
    const ref = this.dialogService.open(PurchaseOrderSelectDialogComponent, {
      data: {
        title: 'Select Purchase Order',
        filter: 'status=1&with_filter=1',
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
    ref.onClose.subscribe((purchaseOrder) => {
      if (purchaseOrder) {
        this.purchaseOrderService
          .getPurchaseOrder(purchaseOrder.id)
          .subscribe((res: any) => {
            let purchaseOrder: PurchaseOrder = res.data;
            this.purchaseInvoiceForm.controls['purchase_order'].setValue(
              purchaseOrder,
            );
            this.purchaseInvoiceForm.controls['tax'].setValue(
              +purchaseOrder.tax,
            );
            purchaseOrder.purchase_order_details.forEach(
              (purchaseOrderDetail: any) => {
                if (purchaseOrderDetail.remaining_quantity > 0) {
                  let purchaseInvoiceDetail = {
                    product: purchaseOrderDetail.product,
                    quantity: purchaseOrderDetail.remaining_quantity,
                    remaining_quantity: purchaseOrderDetail.remaining_quantity,
                    unit_price: purchaseOrderDetail.price_per_unit,
                  };
                  this.purchaseInvoiceDetails.push(
                    this.generatePurchaseInvoiceDetail(purchaseInvoiceDetail),
                  );
                }
              },
            );
          });
        this.purchaseInvoiceForm.removeControl('business_unit');
        this.purchaseInvoiceForm.removeControl('supplier');
      }
    });
  }

  removePurchaseOrder() {
    this.purchaseInvoiceForm.addControl(
      'business_unit',
      new FormControl(null, Validators.required),
    );
    this.purchaseInvoiceForm.addControl(
      'supplier',
      new FormControl(null, Validators.required),
    );
    this.purchaseInvoiceForm.controls['purchase_order'].setValue(null);
    this.purchaseInvoiceForm.removeControl('purchase_invoice_details');
    this.purchaseInvoiceForm.addControl(
      'purchase_invoice_details',
      new FormArray([], Validators.required),
    );
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
        this.purchaseInvoiceForm.controls['business_unit'].setValue(
          businessUnit,
        );
      }
    });
  }

  removeBusinessUnit() {
    this.purchaseInvoiceForm.controls['business_unit'].setValue(null);
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
        this.purchaseInvoiceForm.controls['supplier'].setValue(supplier);
      }
    });
  }

  removeSupplier() {
    this.purchaseInvoiceForm.controls['supplier'].setValue(null);
  }

  generatePurchaseInvoiceDetail(purchaseInvoiceDetail: any): FormGroup {
    return new FormGroup({
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
        this.purchaseInvoiceDetails.push(
          this.generatePurchaseInvoiceDetail(purchaseInvoiceDetail),
        );
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
        this.purchaseInvoiceDetails.at(index).patchValue(purchaseInvoiceDetail);
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
        this.purchaseInvoiceDetails.removeAt(index);
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

  back() {
    this.location.back();
  }

  // manage purchase invoice document
  get documentFilesArray() {
    return this.purchaseInvoiceForm.get(
      'purchase_invoice_documents',
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

  submit() {
    if (this.purchaseInvoiceForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchaseInvoiceForm);
      return;
    }
    if (this.purchaseInvoiceForm.valid) {
      let bodyReq = JSON.parse(JSON.stringify(this.purchaseInvoiceForm.value)); // deep copy
      // With Purchase Order
      if (this.purchaseInvoiceForm.value.purchase_order) {
        bodyReq.purchase_order_id = bodyReq.purchase_order.id;
        delete bodyReq.supplier;
        delete bodyReq.business_unit;
      }
      // Without Purchase Order
      if (this.purchaseInvoiceForm.value.supplier) {
        bodyReq.purchase_order_id = null;
        bodyReq.supplier_id = bodyReq.supplier.id;
        delete bodyReq.supplier;
      }
      if (this.purchaseInvoiceForm.value.business_unit) {
        bodyReq.purchase_order_id = null;
        bodyReq.business_unit_id = bodyReq.business_unit.id;
        delete bodyReq.business_unit;
      }

      delete bodyReq.purchase_order;
      delete bodyReq.purchase_invoice_documents;
      bodyReq.purchase_invoice_details.forEach((purchaseInvoiceDetail: any) => {
        purchaseInvoiceDetail.product_id = purchaseInvoiceDetail.product.id;
        if (bodyReq.purchase_order_id)
          purchaseInvoiceDetail.update_order = true;
        delete purchaseInvoiceDetail.product;
        delete purchaseInvoiceDetail.remaining_quantity;
      });

      this.purchaseInvoiceService.addPurchaseInvoice(bodyReq).subscribe({
        next: (res: any) => {
          if (
            this.purchaseInvoiceForm.value.purchase_invoice_documents.length > 0
          ) {
            let bodyReqDocument = new FormData();
            this.purchaseInvoiceForm.value.purchase_invoice_documents.forEach(
              (file: any, index: number) => {
                bodyReqDocument.append(
                  `purchase_invoice_documents[${index}][file]`,
                  file.file,
                );
                bodyReqDocument.append(
                  `purchase_invoice_documents[${index}][original_name]`,
                  file.original_name,
                );
              },
            );
            this.purchaseInvoiceService
              .addPurchaseInvoiceDocument(res.data.id, bodyReqDocument)
              .subscribe({
                next: (documentRes: any) => {
                  this.actionButtons[0].loading = false;
                  this.router.navigate([
                    '/purchase-invoice/view/',
                    res.data.id,
                  ]);
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Purchase Invoice has been created successfully',
                  });
                },
                error: (err) => {
                  this.actionButtons[0].loading = false;
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Purchase Invoice Document',
                    detail: err.message,
                  });
                },
              });
          } else {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Invoice',
              detail: res.message,
            });
            if (this.purchaseInvoiceNumber != res.data.invoice_no) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail:
                  'Purchase Invoice Number has been changed because of duplicate',
              });
            }
            this.router.navigate(['/purchase-invoice/view/', res.data.id]);
          }
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
}
