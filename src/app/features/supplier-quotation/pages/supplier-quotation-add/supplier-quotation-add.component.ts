import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
  faSave,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { SupplierQuotationDetailAddDialogComponent } from '../../components/supplier-quotation-detail-add-dialog/supplier-quotation-detail-add-dialog.component';
import { SupplierQuotationService } from '../../services/supplier-quotation.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoNumberService } from '../../../../shared/services/auto-number.service';

@Component({
  selector: 'app-supplier-quotation-add',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    FcInputTextComponent,
    ToastModule,
    ConfirmDialogModule,
    FcImagePreviewComponent,
    RouterModule,
    DatePickerModule,
    IftaLabelModule,
    InputNumberModule,
  ],
  templateUrl: './supplier-quotation-add.component.html',
  styleUrl: './supplier-quotation-add.component.css',
  providers: [DialogService, MessageService, ConfirmationService],
})
export class SupplierQuotationAddComponent {
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

  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      action: () => {
        this.submit();
      },
      hidden: false,
    },
  ];
  hiddenActionButtons: any[] = [];

  supplierQuotationForm: FormGroup;
  loading = false;

  isDarkMode =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  lightInputStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    color: '#000000',
    fontSize: '12px',
    lineHeight: '1.7',
    '::placeholder': {
      color: '#9ca3af',
    },
  };

  darkInputStyle = {
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    color: '#ffffff',
    fontSize: '12px',
    lineHeight: '1.7',
    '::placeholder': {
      color: '#9ca3af',
    },
  };

  constructor(
    private layoutService: LayoutService,
    private supplierQuotationService: SupplierQuotationService,
    private messageService: MessageService,
    private location: Location,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
    private autoNumberService: AutoNumberService,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'supplier-quotation',
    );
    this.layoutService.setHeaderConfig({
      title: 'Add Supplier Quotation',
      icon: '',
      showHeader: true,
    });
    this.supplierQuotationForm = new FormGroup({
      // quotation_no: new FormControl(null),
      supplier: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      expected_delivery_date: new FormControl(new Date(), Validators.required),
      tax: new FormControl(0),
      note: new FormControl(null),
      supplier_quotation_details: new FormArray([]),
    });
  }

  ngOnInit(): void {
    this.layoutService.setSearchConfig({ hide: true });
    this.generateAutoNumber();
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  hasRequiredValidator(controlName: string): boolean {
    const control = this.supplierQuotationForm.get(controlName);
    if (!control || !control.validator) return false;

    const validator = control.validator({} as AbstractControl);
    return validator && validator['required'];
  }

  isShowDetailSummary: boolean = false;
  @ViewChild('detailSummary') detailSummary?: ElementRef;
  @ViewChild('supplierQuotationFormElement')
  supplierQuotationFormElement?: ElementRef;
  @ViewChild('stickyDetailSummary')
  stickyDetailSummary?: ElementRef;
  // Detect scroll in order summary
  onScroll(event: any) {
    this.setOrderSummaryVisibility();
  }

  setOrderSummaryVisibility() {
    let formSupplierQuotationBoxBounds =
      this.supplierQuotationFormElement?.nativeElement.getBoundingClientRect();
    let stickyDetailBoxBounds =
      this.stickyDetailSummary?.nativeElement.getBoundingClientRect();
    let detailSummaryBoxBounds =
      this.detailSummary?.nativeElement.getBoundingClientRect();
    if (
      formSupplierQuotationBoxBounds != undefined &&
      detailSummaryBoxBounds != undefined
    ) {
      if (
        formSupplierQuotationBoxBounds.bottom -
          (detailSummaryBoxBounds.bottom - detailSummaryBoxBounds.height) <
        stickyDetailBoxBounds.height
      ) {
        this.isShowDetailSummary = true;
      } else {
        this.isShowDetailSummary = false;
      }
    }
  }

  scrollToBottom() {
    this.detailSummary?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }

  get supplierQuotationDetails(): FormArray {
    return this.supplierQuotationForm.get(
      'supplier_quotation_details',
    ) as FormArray;
  }

  generateSupplierQuotationDetail(supplierQuotationDetail: any): FormGroup {
    return new FormGroup({
      product: new FormControl(supplierQuotationDetail.product),
      quantity: new FormControl(supplierQuotationDetail.quantity),
      price_per_unit: new FormControl(supplierQuotationDetail.price_per_unit),
    });
  }

  get grandTotalPrice() {
    return this.subTotalPrice + this.supplierQuotationForm.value.tax;
  }

  get subTotalPrice() {
    return this.supplierQuotationDetails.value.reduce(
      (sum: any, item: any) => sum + item.price_per_unit * item.quantity,
      0,
    );
  }

  supplierQuotationNumber: string = '';
  generateAutoNumber() {
    this.autoNumberService
      .getAutoNumberByTabel('supplier_quotations')
      .subscribe((res: any) => {
        this.supplierQuotationNumber = res.latest_auto_number;
      });
  }

  removeSupplier() {
    this.supplierQuotationForm.controls['supplier'].setValue('');
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
        this.supplierQuotationForm.controls['supplier'].setValue(supplier);
      }
    });
  }

  onAddSupplierQuotationDetail() {
    let existProducts = this.supplierQuotationDetails.value.map((data: any) => {
      return data.product;
    });

    const ref = this.dialogService.open(
      SupplierQuotationDetailAddDialogComponent,
      {
        data: {
          currentProducts: existProducts,
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
        this.supplierQuotationDetails.push(
          this.generateSupplierQuotationDetail(newData),
        );
      }
    });
  }

  onEditSupplierQuotationDetail(index: number) {
    let existProducts = this.supplierQuotationDetails.value.map((data: any) => {
      return data.product;
    });

    const ref = this.dialogService.open(
      SupplierQuotationDetailAddDialogComponent,
      {
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
        data: {
          currentProducts: existProducts,
          supplierQuotationDetail:
            this.supplierQuotationDetails.controls[index].value,
        },
      },
    );
    ref.onClose.subscribe((newData) => {
      if (newData) {
        this.supplierQuotationDetails.controls[index].patchValue(newData);
      }
    });
  }
  onRemoveSupplierQuotationDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.supplierQuotationDetails.removeAt(index);
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
    if (this.supplierQuotationForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.supplierQuotationForm);
      return;
    }
    this.actionButtons[0].loading = true;
    let bodyReqForm = JSON.parse(
      JSON.stringify(this.supplierQuotationForm.value),
    );
    bodyReqForm.supplier_id = bodyReqForm.supplier.id;
    delete bodyReqForm.supplier;
    if (this.supplierQuotationForm.value.supplier_quotation_details) {
      bodyReqForm.supplier_quotation_details =
        bodyReqForm.supplier_quotation_details.map((prd: any) => {
          return {
            product_id: prd.product.id,
            quantity: prd.quantity,
          };
        });
    }
    this.supplierQuotationService.addSupplierQuotation(bodyReqForm).subscribe({
      next: (res: any) => {
        this.actionButtons[0].loading = false;
        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Supplier Quotation',
          detail: res.message,
        });
        // change route without add to history
        this.router.navigateByUrl('/supplier-quotation/view/' + res.data.id, {
          replaceUrl: true,
        });
      },
      error: (err) => {
        this.actionButtons[0].loading = false;
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Supplier Quotation',
          detail: err.message,
        });
      },
    });
  }
}
