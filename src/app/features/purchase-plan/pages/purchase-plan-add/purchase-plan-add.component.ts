import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
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
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { ProductSelectDialogComponent } from '../../../product/components/product-select-dialog/product-select-dialog.component';
import { WarehouseSelectDialogComponent } from '../../../warehouse/components/warehouse-select-dialog/warehouse-select-dialog.component';
import { PurchasePlanService } from '../../services/purchase-plan.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-purchase-plan-add',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    FcActionBarComponent,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    DatePickerModule,
    IftaLabelModule,
    InputNumberModule,
  ],
  templateUrl: './purchase-plan-add.component.html',
  styleUrl: './purchase-plan-add.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchasePlanAddComponent {
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
      action: () => {
        this.submit();
      },
      hidden: true,
    },
  ];

  hiddenActionButtons: any[] = [];

  loading = false;
  purchasePlanForm: FormGroup;

  constructor(
    private layoutService: LayoutService,
    private purchasePlanService: PurchasePlanService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'purchase-plan');
    this.layoutService.setHeaderConfig({
      title: 'Add Purchase Plan',
      icon: '',
      showHeader: true,
    });
    this.purchasePlanForm = new FormGroup({
      warehouse: new FormControl('', Validators.required),
      product: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
      date: new FormControl(new Date(), Validators.required),
    });
  }

  ngOnInit(): void {
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
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
      let bodyReq = {
        warehouse_id: this.purchasePlanForm.controls['warehouse'].value.id,
        product_id: this.purchasePlanForm.controls['product'].value.id,
        quantity: this.purchasePlanForm.controls['quantity'].value,
        date: this.purchasePlanForm.controls['date'].value,
      };
      this.purchasePlanService.addPurchasePlan(bodyReq).subscribe({
        next: (res: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Purchase Plan',
            detail: res.message,
          });
          this.router.navigate(['/purchase-plan/view/', res.data.id]);
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
}
