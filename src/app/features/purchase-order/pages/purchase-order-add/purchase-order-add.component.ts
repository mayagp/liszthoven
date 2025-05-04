import { CommonModule } from '@angular/common';
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
  faLocationDot,
  faPhone,
  faPlus,
  faChevronDown,
  faTimes,
  faPencil,
  faTrash,
  faRefresh,
  faFile,
  faCloudArrowUp,
  faFloppyDisk,
  faXmark,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { AutoNumberService } from '../../../../shared/services/auto-number.service';
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { PurchaseOrderAddDetailComponent } from '../../components/purchase-order-add-detail/purchase-order-add-detail.component';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';

@Component({
  selector: 'app-purchase-order-add',
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
  templateUrl: './purchase-order-add.component.html',
  styleUrl: './purchase-order-add.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchaseOrderAddComponent {
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
  faFile = faFile;
  faCloudArrowUp = faCloudArrowUp;
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

  purchaseOrderForm: FormGroup;
  constructor(
    private layoutService: LayoutService,
    private purchaseOrderService: PurchaseOrderService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private autoNumberService: AutoNumberService,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'purchase-order',
    );
    this.layoutService.setHeaderConfig({
      title: 'Add Purchase Order',
      icon: '',
      showHeader: true,
    });
    // init form
    this.purchaseOrderForm = new FormGroup({
      supplier: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      expected_delivery_date: new FormControl(null, Validators.required),
      tax: new FormControl(0),
      note: new FormControl(''),
      business_unit: new FormControl(null, Validators.required),
      purchase_order_documents: new FormArray([]),
      purchase_order_details: new FormArray([], Validators.required),
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.purchaseOrderDetails.value.length) {
        this.setOrderSummaryVisibility();
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

  addPurchaseOrderDetail() {
    const ref = this.dialogService.open(PurchaseOrderAddDetailComponent, {
      data: {
        title: 'Add Purchase Order Detail',
        existingPurchaseOrderDetails: this.purchaseOrderDetails.value,
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
        this.purchaseOrderDetails.push(
          this.generatePurchaseOrderDetail(purchaseOrderDetail),
        );
      }
    });
  }

  editPurchaseOrderDetail(index: number) {
    const ref = this.dialogService.open(PurchaseOrderAddDetailComponent, {
      data: {
        title: 'Edit Purchase Order Detail',
        existingPurchaseOrderDetails: this.purchaseOrderDetails.value,
        purchaseOrderDetail: this.purchaseOrderDetails.value[index],
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
        let formGroup = this.purchaseOrderDetails.at(index) as FormGroup;
        this.purchaseOrderDetails.at(index).patchValue(formGroup);
      }
    });
  }

  removePurchaseOrderDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseOrderDetails.removeAt(index);
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

  wizardPurchaseOrder() {
    const ref = this.dialogService.open(BranchSelectDialogComponent, {
      data: {
        title: 'Wizard Purchase Order',
        existingPurchaseOrderDetails: this.purchaseOrderDetails.value,
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
      width: '600px',
    });
    ref.onClose.subscribe((purchaseOrder) => {
      if (purchaseOrder.supplierQuotation) {
        this.purchaseOrderForm.controls['supplier'].setValue(
          purchaseOrder.supplierQuotation.supplier,
        );

        this.purchaseOrderForm.controls['tax'].setValue(
          +purchaseOrder.supplierQuotation.tax,
        );
      }

      if (purchaseOrder.purchaseOrderDetails) {
        purchaseOrder.purchaseOrderDetails.forEach((data: any) => {
          this.purchaseOrderDetails.push(
            this.generatePurchaseOrderDetail(data),
          );
        });
      }
    });
  }

  purchaseOrderNumber: string = '';
  generateAutoNumber() {
    this.autoNumberService
      .getAutoNumberByTabel('purchase_orders')
      .subscribe((res: any) => {
        this.purchaseOrderNumber = res.latest_auto_number;
      });
  }

  // manage purchase order document files
  get documentFilesArray() {
    return this.purchaseOrderForm.get('purchase_order_documents') as FormArray;
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
    if (this.purchaseOrderForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchaseOrderForm);
      return;
    }

    if (this.purchaseOrderForm.valid) {
      this.actionButtons[0].loading = true;
      let bodyReq = JSON.parse(JSON.stringify(this.purchaseOrderForm.value)); // deep copy
      bodyReq.supplier_id = Number(this.purchaseOrderForm.value.supplier.id);
      bodyReq.business_unit_id = Number(
        this.purchaseOrderForm.value.business_unit.id,
      );
      bodyReq.purchase_order_details.forEach((purchaseOrderDetail: any) => {
        purchaseOrderDetail.product_id = purchaseOrderDetail.product.id;
        purchaseOrderDetail.supplier_quotation_id =
          purchaseOrderDetail.supplier_quotation?.supplier_quotation_id;
        delete purchaseOrderDetail.product;
        delete purchaseOrderDetail.supplier_quotation;
      });
      delete bodyReq.business_unit;
      delete bodyReq.supplier;
      delete bodyReq.purchase_order_documents;

      this.purchaseOrderService.addPurchaseOrder(bodyReq).subscribe({
        next: (res: any) => {
          // if with document
          if (
            this.purchaseOrderForm.value.purchase_order_documents.length > 0
          ) {
            let bodyReqDocument = new FormData();
            this.purchaseOrderForm.value.purchase_order_documents.forEach(
              (file: any, index: number) => {
                bodyReqDocument.append(
                  `purchase_order_documents[${index}][file]`,
                  file.file,
                );
                bodyReqDocument.append(
                  `purchase_order_documents[${index}][original_name]`,
                  file.original_name,
                );
              },
            );
            this.purchaseOrderService
              .addPurchaseOrderDocument(res.data.id, bodyReqDocument)
              .subscribe({
                next: (documentRes: any) => {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Purchase Order',
                    detail: res.message,
                  });
                  this.actionButtons[0].loading = false;
                  this.router.navigate(['/purchase-order/view/', res.data.id]);
                },
                error: (err) => {
                  this.actionButtons[0].loading = false;
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Purchase Order Document',
                    detail: err.message,
                  });
                },
              });
          } else {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Order',
              detail: res.message,
            });
            if (this.purchaseOrderNumber != res.data.purchase_order_no) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail:
                  'Purchase Order Number has been changed because of duplicate',
              });
            }
            this.router.navigate(['/purchase-order/view/', res.data.id]);
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
    }
  }
}
