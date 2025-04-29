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
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
  faCheck,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { SupplierQuotationDetailEditDialogComponent } from '../../components/supplier-quotation-detail-edit-dialog/supplier-quotation-detail-edit-dialog.component';
import { SupplierQuotation } from '../../interfaces/supplier-quotation';
import { SupplierQuotationService } from '../../services/supplier-quotation.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-supplier-quotation-view',
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
    FcCurrencyPipe,
    RouterModule,
    DatePickerModule,
    IftaLabelModule,
  ],
  templateUrl: './supplier-quotation-view.component.html',
  styleUrl: './supplier-quotation-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class SupplierQuotationViewComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faArrowRight = faArrowRight;

  selectedSupplier: any;

  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      hidden: false,
      action: () => {
        this.submit();
      },
    },
    {
      label: 'Receive',
      icon: faCheck,
      hidden: false,
      action: () => {
        this.receiveSupplierQuotation();
      },
    },
    {
      label: 'Cancel',
      icon: faTimes,
      hidden: false,
      action: () => {
        this.cancelSupplierQuotation();
      },
    },
    {
      label: 'Delete',
      icon: faTrash,
      hidden: false,
      action: () => {
        this.deleteSupplierQuotation();
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
  supplierQuotationForm: FormGroup;
  @Input() supplierQuotation: SupplierQuotation = {} as SupplierQuotation;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private supplierQuotationService: SupplierQuotationService,
    private messageService: MessageService,
    private location: Location,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private ability: PureAbility,
  ) {
    if (this.route.snapshot.paramMap.get('id')) {
      this.supplierQuotation.id = String(
        this.route.snapshot.paramMap.get('id'),
      );
    }
    this.supplierQuotationForm = new FormGroup({
      quotation_no: new FormControl(null, Validators.required),
      supplier_id: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      expected_delivery_date: new FormControl(new Date(), Validators.required),
      tax: new FormControl(null),
      note: new FormControl(null),
      supplier_quotation_details: new FormArray([]),
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
  generateActionButtons() {
    // Semua tombol disembunyikan dulu
    this.actionButtons[0].hidden = true;
    this.actionButtons[1].hidden = true;
    this.actionButtons[2].hidden = true;
    this.actionButtons[3].hidden = true;

    switch (this.supplierQuotation.status) {
      case 0:
        if (this.ability.can('update', 'supplier-quotation'))
          this.actionButtons[0].hidden = false; // <<< ubah jadi false
        if (this.ability.can('receive', 'supplier-quotation'))
          this.actionButtons[1].hidden = false;
        if (this.ability.can('cancel', 'supplier-quotation'))
          this.actionButtons[2].hidden = false;
        if (this.ability.can('delete', 'supplier-quotation'))
          this.actionButtons[3].hidden = false;
        break;
      default:
        break;
    }
    console.log(
      'Can update:',
      this.ability.can('update', 'supplier-quotation'),
    );
    console.log(
      'Can receive:',
      this.ability.can('receive', 'supplier-quotation'),
    );
    console.log(
      'Can cancel:',
      this.ability.can('cancel', 'supplier-quotation'),
    );
    console.log(
      'Can delete:',
      this.ability.can('delete', 'supplier-quotation'),
    );
  }

  updateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Supplier Quotation (${this.supplierQuotation.status_name})`,
      icon: '',
      showHeader: true,
    });
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

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.supplierQuotationService
      .getSupplierQuotation(this.supplierQuotation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.supplierQuotation = res.data;
        this.selectedSupplier = this.supplierQuotation.supplier;
        this.supplierQuotationForm.patchValue({
          quotation_no: this.supplierQuotation.quotation_no,
          supplier_id: this.supplierQuotation.supplier_id,
          date: new Date(this.supplierQuotation.date),
          expected_delivery_date: new Date(
            this.supplierQuotation.expected_delivery_date,
          ),
          tax: Number(this.supplierQuotation.tax),
          note: this.supplierQuotation.note,
        });
        this.supplierQuotation.supplier_quotation_details.forEach(
          (data: any) => {
            this.supplierQuotationDetails.push(
              this.generateSupplierQuotationDetail(data),
            );
          },
        );
        this.generateActionButtons();
        this.updateHeader();
        setTimeout(() => {
          this.setOrderSummaryVisibility();
        }, 100);
      });
  }

  get supplierQuotationDetails(): FormArray {
    return this.supplierQuotationForm.get(
      'supplier_quotation_details',
    ) as FormArray;
  }

  generateSupplierQuotationDetail(supplierQuotationDetail: any): FormGroup {
    return new FormGroup({
      id: new FormControl(supplierQuotationDetail.id),
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

  removeSupplier() {
    this.selectedSupplier = null;
    this.supplierQuotationForm.controls['supplier_id'].setValue('');
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
        this.selectedSupplier = supplier;
        this.supplierQuotationForm.controls['supplier_id'].setValue(
          this.selectedSupplier.id,
        );
      }
    });
  }

  onAddSupplierQuotationDetail() {
    let existProducts = this.supplierQuotationDetails.value.map((data: any) => {
      return data.product;
    });

    const ref = this.dialogService.open(
      SupplierQuotationDetailEditDialogComponent,
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
          supplierQuotationId: this.supplierQuotation.id,
          currentProducts: existProducts,
        },
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
      SupplierQuotationDetailEditDialogComponent,
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
          supplierQuotationId: this.supplierQuotation.id,
        },
      },
    );
    ref.onClose.subscribe((newData) => {
      if (newData) {
        this.supplierQuotationDetails.controls[index].patchValue(newData);
      }
    });
  }

  onRemoveSupplierQuotationDetail(
    index: number,
    supplierQuotationDetailId: any,
  ) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.supplierQuotationService
          .deleteSupplierQuotationDetail(
            this.supplierQuotation.id,
            supplierQuotationDetailId,
          )
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Supplier Quotation Detail',
                detail: res.message,
              });
              this.supplierQuotationDetails.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Supplier Quotation Detail',
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

  back() {
    this.location.back();
  }

  receiveSupplierQuotation() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to receive this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[1].loading = true;
        this.supplierQuotationService
          .receiveSupplierQuotation(this.supplierQuotation.id)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[1].loading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Receive Supplier Quotation',
                detail: res.message,
              });
              this.supplierQuotation.status_name = res.data.status_name;
              this.supplierQuotation.status = res.data.status;
              this.generateActionButtons();
              this.updateHeader();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (err) => {
              this.actionButtons[1].loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Receive Supplier Quotation',
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

  cancelSupplierQuotation() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to cancel this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[2].loading = true;
        this.supplierQuotationService
          .cancelSupplierQuotation(this.supplierQuotation.id)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[2].loading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Cancel Supplier Quotation',
                detail: res.message,
              });
              this.supplierQuotation.status_name = res.data.status_name;
              this.supplierQuotation.status = res.data.status;
              this.generateActionButtons();
              this.updateHeader();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (err) => {
              this.actionButtons[2].loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Cancel Supplier Quotation',
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

  deleteSupplierQuotation() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[3].loading = true;
        this.supplierQuotationService
          .deleteSupplierQuotation(this.supplierQuotation.id)
          .subscribe({
            next: (res: any) => {
              this.actionButtons[3].loading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Delete Supplier Quotation',
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
              this.messageService.add({
                severity: 'error',
                summary: 'Delete Supplier Quotation',
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
    if (this.supplierQuotationForm.valid) {
      this.actionButtons[0].loading = true;
      let bodyReqForm: FormGroup;
      bodyReqForm = new FormGroup({
        quotation_no: new FormControl(
          this.supplierQuotationForm.value.quotation_no,
        ),
        supplier_id: new FormControl(
          Number(this.supplierQuotationForm.value.supplier_id),
        ),
        date: new FormControl(this.supplierQuotationForm.value.date),
        expected_delivery_date: new FormControl(
          this.supplierQuotationForm.value.expected_delivery_date,
        ),
        tax: new FormControl(Number(this.supplierQuotationForm.value.tax)),
        note: new FormControl(this.supplierQuotationForm.value.note),
      });

      this.supplierQuotationService
        .updateSupplierQuotation(this.supplierQuotation.id, bodyReqForm.value)
        .subscribe({
          next: (res: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Supplier Quotation',
              detail: res.message,
            });
            this.supplierQuotation.quotation_no = res.data.quotation_no;
            this.supplierQuotation.status_name = res.data.status_name;
            this.supplierQuotation.status = res.data.status;
            this.generateActionButtons();
            this.updateHeader();
            if (this.quickView) {
              this.onUpdated.emit(res.data);
            }
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
    } else {
      // Toast
      this.messageService.add({
        summary: 'Supplier Quotation',
        detail: 'Fill the form first!',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    }
  }

  refresh() {
    this.isShowDetailSummary = false;
    this.supplierQuotationForm.reset();
    this.supplierQuotationForm.removeControl('supplier_quotation_details');
    this.supplierQuotationForm.addControl(
      'supplier_quotation_details',
      new FormArray([]),
    );
    this.loadData();
  }
}
