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
import { Supplier, SupplierBankAccount } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { SupplierBankAccountAddDialogComponent } from '../../components/supplier-bank-account-add-dialog/supplier-bank-account-add-dialog.component';
import { SupplierBankAccountEditDialogComponent } from '../../components/supplier-bank-account-edit-dialog/supplier-bank-account-edit-dialog.component';
import { ToastModule } from 'primeng/toast';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';

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

  supplierForm: FormGroup;
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
    this.supplierForm = new FormGroup({
      name: new FormControl('', Validators.required),
      address: new FormControl(''),
      contact_no: new FormControl(''),
      pic: new FormControl(''),
      tax_no: new FormControl(''),
      supplier_bank_accounts: new FormArray([]),
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

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.supplierService
      .getSupplier(this.supplier.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.supplier = res.data;
        this.supplierForm.patchValue({
          name: this.supplier.name,
          address: this.supplier.address,
          contact_no: this.supplier.contact_no,
          pic: this.supplier.pic,
          tax_no: this.supplier.tax_no,
        });
        this.supplier.supplier_bank_accounts.forEach(
          (supplierBankAcocunt: SupplierBankAccount) => {
            this.supplierBankAccounts.push(
              this.generateSupplierBankAccouns(supplierBankAcocunt),
            );
          },
        );
        this.loading = false;
      });
  }
  // Manage supplier bank accounts
  generateSupplierBankAccouns(
    supplierBankAccount: SupplierBankAccount,
  ): FormGroup {
    return new FormGroup({
      id: new FormControl(supplierBankAccount.id),
      account_no: new FormControl(supplierBankAccount.account_no),
      bank: new FormControl(supplierBankAccount.bank),
      swift_code: new FormControl(supplierBankAccount.swift_code),
    });
  }
  get supplierBankAccounts(): FormArray {
    return this.supplierForm.get('supplier_bank_accounts') as FormArray;
  }
  addSupplierBankAccount() {
    const ref = this.dialogService.open(SupplierBankAccountAddDialogComponent, {
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
    ref.onClose.subscribe((supplierBankAccount) => {
      if (supplierBankAccount) {
        let bodyReq = JSON.parse(JSON.stringify(supplierBankAccount)); // deep copy

        this.supplierService
          .addSupplierBankAccount(this.supplier.id, bodyReq)
          .subscribe({
            next: (res: any) => {
              supplierBankAccount.id = res.data.id;
              this.supplierBankAccounts.push(
                this.generateSupplierBankAccouns(supplierBankAccount),
              );
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Supplier Bank Account has been added',
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
  editSupplierBankAccountDetail(index: number) {
    const ref = this.dialogService.open(
      SupplierBankAccountEditDialogComponent,
      {
        data: {
          title: 'Edit Purchase Payment Detail',
          supplierBankAccount: this.supplierBankAccounts.value[index],
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
    ref.onClose.subscribe((supplierBankAccount) => {
      if (supplierBankAccount) {
        let bodyReq = JSON.parse(JSON.stringify(supplierBankAccount)); // deep copy
        this.supplierService
          .updateSupplierBankAccount(
            this.supplier.id,
            this.supplierBankAccounts.value[index].id,
            bodyReq,
          )
          .subscribe({
            next: (res: any) => {
              this.supplierBankAccounts
                .at(index)
                .patchValue(supplierBankAccount);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Supplier Bank Account has been updated',
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
  deleteSupplierBankAccountDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.supplierService
          .deleteSupplierBankAccount(
            this.supplier.id,
            this.supplierBankAccounts.value[index].id,
          )
          .subscribe({
            next: (res: any) => {
              this.supplierBankAccounts.removeAt(index);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Supplier Bank Account has been deleted',
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
    if (this.supplierForm.valid) {
      let bodyReq = JSON.parse(JSON.stringify(this.supplierForm.value)); // deep copy
      delete bodyReq.supplier_bank_accounts;
      this.actionButtons[0].loading = true;
      this.supplierService.updateSupplier(this.supplier.id, bodyReq).subscribe({
        next: (res: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Supplier',
            detail: res.message,
          });
          this.onUpdated.emit(res.data);
        },
        error: (err: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Supplier',
            detail: err.message,
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
    this.supplierForm.removeControl('supplier_bank_accounts');
    this.supplierForm.addControl('supplier_bank_accounts', new FormArray([]));
    this.loadData();
  }
}
