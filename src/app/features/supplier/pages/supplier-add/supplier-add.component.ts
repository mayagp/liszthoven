import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faPencil,
  faTrash,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { SupplierBankAccountAddDialogComponent } from '../../components/supplier-bank-account-add-dialog/supplier-bank-account-add-dialog.component';
import { SupplierBankAccountEditDialogComponent } from '../../components/supplier-bank-account-edit-dialog/supplier-bank-account-edit-dialog.component';
import { SupplierBankAccount } from '../../interfaces/supplier';
import { SupplierService } from '../../services/supplier.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';

@Component({
  selector: 'app-supplier-add',
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
  templateUrl: './supplier-add.component.html',
  styleUrl: './supplier-add.component.css',
  providers: [MessageService, DialogService],
})
export class SupplierAddComponent {
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
  ];

  supplierForm: FormGroup;
  constructor(
    private layoutService: LayoutService,
    private supplierService: SupplierService,
    private location: Location,
    private messageService: MessageService,
    private dialogService: DialogService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'supplier');
    this.layoutService.setHeaderConfig({
      title: 'Add Supplier',
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
    this.layoutService.setSearchConfig({ hide: true });
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }
  // Manage supplier bank accounts
  generateSupplierBankAccouns(
    supplierBankAccount: SupplierBankAccount,
  ): FormGroup {
    return new FormGroup({
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
    ref.onClose.subscribe((supplierBankAccount: any) => {
      if (supplierBankAccount) {
        this.supplierBankAccounts.push(
          this.generateSupplierBankAccouns(supplierBankAccount),
        );
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
    ref.onClose.subscribe((supplierBankAccount: any) => {
      if (supplierBankAccount) {
        this.supplierBankAccounts.at(index).patchValue(supplierBankAccount);
      }
    });
  }
  deleteSupplierBankAccountDetail(index: number) {
    this.supplierBankAccounts.removeAt(index);
  }
  submit() {
    if (this.supplierForm.valid) {
      this.actionButtons[0].loading = true;
      this.supplierService.addSupplier(this.supplierForm.value).subscribe({
        next: (res) => {
          this.actionButtons[0].loading = false;
          this.location.back();
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Supplier added successfully',
          });
        },
        error: (err) => {
          this.actionButtons[0].loading = false;

          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'error',
            detail: err.message,
          });
        },
      });
    } else {
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'error',
        detail: 'Please check your input',
      });
    }
  }
  back() {
    this.location.back();
  }
}
