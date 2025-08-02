import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PureAbility } from '@casl/ability';
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
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { ProductSelectDialogComponent } from '../../../product/components/product-select-dialog/product-select-dialog.component';
import { PurchasePayment } from '../../../purchase-payment/interfaces/purchase-payment';
import { WarehouseSelectDialogComponent } from '../../../warehouse/components/warehouse-select-dialog/warehouse-select-dialog.component';
import { PurchasePlan } from '../../interfaces/purchase-plan';
import { PurchasePlanService } from '../../services/purchase-plan.service';
import { CommonModule, Location } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-purchase-plan-view',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    ToastModule,
    ConfirmDialogModule,
    DatePickerModule,
    IftaLabelModule,
    ProgressSpinner,
    SelectModule,
    InputNumberModule,
  ],
  templateUrl: './purchase-plan-view.component.html',
  styleUrl: './purchase-plan-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchasePlanViewComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faArrowRight = faArrowRight;

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
  loading = false;
  purchasePlanForm: FormGroup;
  purchasePlanStatus: any[] = [
    {
      label: 'Created',
      value: 0,
    },
    {
      label: 'Progress',
      value: 1,
    },
    {
      label: 'Complete',
      value: 2,
    },
    {
      label: 'Cancelled',
      value: 3,
    },
  ];
  @Input() purchasePlan: PurchasePlan = {} as PurchasePlan;
  @Input() purchasePayment: PurchasePayment = {} as PurchasePayment;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

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
    private purchasePlanService: PurchasePlanService,
    private messageService: MessageService,
    private location: Location,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    if (this.route.snapshot.paramMap.get('id')) {
      this.purchasePlan.id = String(this.route.snapshot.paramMap.get('id'));
    }
    this.actionButtons[0].hidden = !this.ability.can('update', 'purchase-plan');
    this.actionButtons[1].hidden = !this.ability.can('delete', 'purchase-plan');
    this.layoutService.setHeaderConfig({
      title: 'Purchase Plan',
      icon: '',
      showHeader: true,
    });
    this.purchasePlanForm = new FormGroup({
      warehouse: new FormControl('', Validators.required),
      product: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
      date: new FormControl(new Date(), Validators.required),
      status: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    if (!this.quickView) {
      this.loadData();
    }
    this.layoutService.setSearchConfig({ hide: true });
  }
  ngOnChanges(): void {
    if (this.purchasePlan.id) {
      this.refresh();
    }
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  hasRequiredValidator(controlName: string): boolean {
    const control = this.purchasePlanForm.get(controlName);
    if (!control || !control.validator) return false;

    const validator = control.validator({} as AbstractControl);
    return validator && validator['required'];
  }
  generateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Purchase Plan (${this.purchasePlan.status_name})`,
      icon: '',
      showHeader: true,
    });
  }
  loadData() {
    this.loading = true;
    this.destroy$.next();

    this.purchasePlanService
      .getPurchasePlan(this.purchasePlan.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          const data = res.data.purchase_plans ?? res.data;
          console.log('DEBUG: data', data);

          this.purchasePlanForm.patchValue({
            warehouse: data.warehouse ?? '',
            product: data.product ?? '',
            quantity: data.quantity,
            date: data.date ? new Date(data.date) : null,
            status: data.status,
          });

          this.purchasePlan = data;

          this.generateActionButtons();
          this.generateHeader();
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Purchase Plan',
            detail: err.message,
          });
        },
      });
  }

  generateActionButtons() {
    // reset action buttons
    this.actionButtons[0].hidden = true; // save
    this.actionButtons[1].hidden = true; // delete

    switch (this.purchasePlan.status) {
      case 0: // Created
        if (this.ability.can('update', 'purchase-plan'))
          this.actionButtons[0].hidden = false; // save
        if (this.ability.can('delete', 'purchase-plan'))
          this.actionButtons[1].hidden = false; // delete
        break;
      case 1: // Progress
        if (this.ability.can('update', 'purchase-plan'))
          this.actionButtons[0].hidden = false; // save
        if (this.ability.can('delete', 'purchase-plan'))
          this.actionButtons[1].hidden = false; // delete
        break;
      case 2: // Complete
        break;
      case 3: // Cancelled
        break;
      default:
        break;
    }
  }
  onSelectWarehouse() {
    const ref = this.dialogService.open(WarehouseSelectDialogComponent, {
      data: {
        title: 'Select Warehouse',
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
    ref.onClose.subscribe((warehouse) => {
      if (warehouse) {
        this.purchasePlanForm.controls['warehouse'].setValue(warehouse);
      }
    });
  }
  removeWarehouse() {
    this.purchasePlanForm.controls['warehouse'].setValue('');
  }
  onSelectProduct() {
    const ref = this.dialogService.open(ProductSelectDialogComponent, {
      data: {
        title: 'Select Product',
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
    ref.onClose.subscribe((product) => {
      if (product) {
        this.purchasePlanForm.controls['product'].setValue(product);
      }
    });
  }
  removeProduct() {
    this.purchasePlanForm.controls['product'].setValue('');
  }

  submit() {
    if (this.purchasePlanForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchasePlanForm);
      return;
    }
    if (this.purchasePlanForm.valid) {
      this.actionButtons[0].loading = true;
      let bodyReq = JSON.parse(JSON.stringify(this.purchasePlanForm.value));
      delete bodyReq.warehouse;
      delete bodyReq.product;

      this.purchasePlanService
        .updatePurchasePlan(this.purchasePlan.id, bodyReq)
        .subscribe({
          next: (res: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Plan',
              detail: res.message,
            });
            this.purchasePlan = { ...this.purchasePlan, ...res.data };
            if (this.quickView) {
              this.onUpdated.emit(res.data);
            }
            this.generateActionButtons();
            this.generateHeader();
          },
          error: (err) => {
            this.actionButtons[0].loading = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Purchase Plan',
              detail: err.message,
            });
          },
        });
    } else {
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'Purchase Plan',
        detail: 'Please fill required fields',
      });
    }
  }
  onDelete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchasePlanService
          .deletePurchasePlan(this.purchasePlan.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Plan has been deleted',
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
  back() {
    this.location.back();
  }
  refresh() {
    this.loadData();
  }
}
