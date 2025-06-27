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
import { SupplierService } from '../../services/supplier.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

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

  registerForm: FormGroup;
  constructor(
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private dialogService: DialogService,
    private ability: PureAbility,
    private fcDirtyStateService: FcDirtyStateService,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'supplier');
    this.layoutService.setHeaderConfig({
      title: 'Add Supplier',
      icon: '',
      showHeader: true,
    });
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('asdqwe123'), // default password
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
    this.layoutService.setSearchConfig({ hide: true });
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

  submit() {
    if (this.registerForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.registerForm);
      return;
    }

    let bodyReq = { ...this.registerForm.value };
    this.actionButtons[0].loading = true;

    this.authService.registerSupplier(bodyReq).subscribe({
      next: (res: any) => {
        this.actionButtons[0].loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Supplier',
          detail: res.message,
        });
        this.router.navigate(['/supplier/view/', res.data.supplier.id]);
      },
      error: (err) => {
        this.actionButtons[0].loading = false;
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message,
        });
      },
    });
  }

  back() {
    this.location.back();
  }
}
