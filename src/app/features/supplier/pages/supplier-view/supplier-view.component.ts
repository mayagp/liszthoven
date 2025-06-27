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
import { ActivatedRoute } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faPencil,
  faTrash,
  faSave,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { Supplier } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { ToastModule } from 'primeng/toast';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';

@Component({
  selector: 'app-supplier-view',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    FcActionBarComponent,
    FcInputTextComponent,
    ToastModule,
    FcInputTelComponent,
    ProgressSpinner,
  ],
  templateUrl: './supplier-view.component.html',
  styleUrl: './supplier-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class SupplierViewComponent {
  private readonly destroy$ = new Subject<void>();

  faPlus = faPlus;
  faPencil = faPencil;
  faTrash = faTrash;

  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      action: () => {
        this.submit();
      },
      hidden: false,
    },
    {
      label: 'Delete',
      icon: faTrash,
      action: () => {
        this.delete();
      },
      hidden: false,
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
  @Input() supplier: Supplier = {} as Supplier;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

  loading = true;

  registerForm: FormGroup;
  confirmPassword: string = '';
  constructor(
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private location: Location,
    private supplierService: SupplierService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private ability: PureAbility,
    private fcDirtyStateService: FcDirtyStateService,
  ) {
    this.supplier.id = String(this.route.snapshot.paramMap.get('id'));
    this.actionButtons[0].hidden = !this.ability.can('update', 'supplier');
    this.actionButtons[1].hidden = !this.ability.can('delete', 'supplier');
    this.layoutService.setHeaderConfig({
      title: 'Supplier',
      icon: '',
      showHeader: true,
    });
    // init form
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      address: new FormControl(''),
      phone_no: new FormControl(''),
      supplier: new FormGroup({
        tax_no: new FormControl(''),
        total_payable: new FormControl(''),
        account_no: new FormControl(''),
        bank: new FormControl(''),
        swift_code: new FormControl(''),
      }),
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

  get supplierForm(): FormGroup {
    return this.registerForm.get('supplier') as FormGroup;
  }

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.supplierService
      .getSupplier(this.supplier.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.supplier = res.data;
        this.registerForm.patchValue({
          name: this.supplier.user.name,
          email: this.supplier.user.email,
          address: this.supplier.user.address,
          phone_no: this.supplier.user.phone_no,
        });
        this.supplierForm.patchValue({
          tax_no: this.supplier.tax_no,
          total_payable: this.supplier.total_payable,
          account_no: this.supplier.account_no,
          bank: this.supplier.bank,
          swift_code: this.supplier.swift_code,
        });
        this.loading = false;
      });
  }

  submit() {
    if (this.registerForm.invalid) {
      this.messageService.clear();
      this.fcDirtyStateService.checkFormValidation(this.registerForm);
      return;
    }
    if (this.registerForm.valid) {
      this.actionButtons[0].loading = true;
      let bodyReq = JSON.parse(JSON.stringify(this.registerForm.value));
      delete bodyReq.email;
      this.supplierService
        .updateSupplierBasedOnUser(this.supplier.user.id, bodyReq)
        .subscribe({
          next: (res: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Supplier',
              detail: 'Supplier has been updated',
            });
            this.onUpdated.emit();
          },
          error: (err) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Supplier',
              detail: 'Failed to update supplier',
            });
          },
        });
    } else {
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'Supplier',
        detail: 'Please fill in all required fields',
      });
    }
  }
  delete() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this supplier?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[1].loading = true;
        this.supplierService.deleteSupplier(this.supplier.id).subscribe({
          next: (res: any) => {
            this.actionButtons[1].loading = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Supplier',
              detail: res.message,
            });
            if (this.quickView) {
              this.onDeleted.emit();
            } else {
              this.back();
            }
          },
          error: (err) => {
            this.actionButtons[1].loading = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Supplier',
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
    this.supplierForm.reset();
    this.loadData();
  }
}
