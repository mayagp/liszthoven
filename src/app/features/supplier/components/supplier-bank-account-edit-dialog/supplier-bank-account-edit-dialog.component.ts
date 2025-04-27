import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { SupplierBankAccount } from '../../interfaces/supplier';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';

@Component({
  selector: 'app-supplier-bank-account-edit-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FcInputTextComponent,
  ],
  templateUrl: './supplier-bank-account-edit-dialog.component.html',
  styleUrl: './supplier-bank-account-edit-dialog.component.css',
})
export class SupplierBankAccountEditDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  title = 'Add Supplier Bank Account';
  supplierBankAccountForm: FormGroup;
  supplierBankAccount: SupplierBankAccount = {} as SupplierBankAccount;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {
    if (this.config.data) {
      if (this.config.data.title) {
        this.title = this.config.data.title;
      }
      if (this.config.data.supplierBankAccount) {
        this.supplierBankAccount = this.config.data.supplierBankAccount;
      }
    }
    this.supplierBankAccountForm = new FormGroup({
      account_no: new FormControl(this.supplierBankAccount.account_no),
      bank: new FormControl(this.supplierBankAccount.bank),
      swift_code: new FormControl(this.supplierBankAccount.swift_code),
    });
  }

  ngOnInit(): void {}
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit() {
    this.ref.close(this.supplierBankAccountForm.value);
  }
  onClose() {
    this.ref.close();
  }
}
