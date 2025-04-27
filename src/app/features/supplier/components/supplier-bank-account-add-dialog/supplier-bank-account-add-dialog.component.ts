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
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';

@Component({
  selector: 'app-supplier-bank-account-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FcInputTextComponent,
  ],
  templateUrl: './supplier-bank-account-add-dialog.component.html',
  styleUrl: './supplier-bank-account-add-dialog.component.css',
})
export class SupplierBankAccountAddDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  title = 'Add Supplier Bank Account';
  supplierBankAccountForm: FormGroup;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {
    if (this.config.data) {
      if (this.config.data.title) {
        this.title = this.config.data.title;
      }
    }
    this.supplierBankAccountForm = new FormGroup({
      account_no: new FormControl(''),
      bank: new FormControl(''),
      swift_code: new FormControl(''),
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
