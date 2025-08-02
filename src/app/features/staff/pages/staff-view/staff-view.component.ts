import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcTextareaComponent } from '../../../../shared/components/fc-textarea/fc-textarea.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import {
  faSave,
  faBoxOpen,
  faBuilding,
  faLocationDot,
  faTrash,
  faPlus,
  faCloudArrowUp,
  faFile,
  faFloppyDisk,
  faPencil,
  faXmark,
  faTimes,
  faChevronDown,
  faMusic,
  faRefresh,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Staff } from '../../interfaces/staff';
import { ActivatedRoute, Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { AuthService } from '../../../auth/services/auth.service';
import { StaffService } from '../../services/staff.service';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';
import { ProgressSpinner } from 'primeng/progressspinner';
@Component({
  selector: 'app-staff-view',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    FcInputTextComponent,
    FcTextareaComponent,
    FcInputTelComponent,
    IftaLabelModule,
    SelectModule,
    DatePickerModule,
    ProgressSpinner,
  ],
  templateUrl: './staff-view.component.html',
  styleUrl: './staff-view.component.css',

  providers: [DialogService, MessageService, ConfirmationService],
})
export class StaffViewComponent {
  private readonly destroy$ = new Subject<void>();

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

  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,
      action: () => {
        this.refresh();
      },
    },
  ];
  faBoxOpen = faBoxOpen;
  faBuilding = faBuilding;
  faLocationDot = faLocationDot;
  faTrash = faTrash;
  faPlus = faPlus;
  faCloudArrowUp = faCloudArrowUp;
  faFile = faFile;
  faFloppyDisk = faFloppyDisk;
  faPencil = faPencil;
  faXmark = faXmark;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faMusic = faMusic;
  faSpinner = faSpinner;

  roles = [
    // {
    //   id: 0,
    //   label: 'Developer',
    // },
    {
      id: 2,
      label: 'Branch Admin',
    },
    {
      id: 3,
      label: 'Admin Manager',
    },
    {
      id: 4,
      label: 'Owner',
    },
  ];

  registerForm: FormGroup;
  branches: any = [];

  @Input() staff: Staff = {} as Staff;
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
    private authService: AuthService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private fcDirtyStateService: FcDirtyStateService,
    private route: ActivatedRoute,
    private staffService: StaffService,
    private confirmationService: ConfirmationService,
  ) {
    // this.actionButtons[0].hidden = !this.ability.can('update', 'staff');
    this.staff.id = String(this.route.snapshot.paramMap.get('staffId'));

    this.layoutService.setHeaderConfig({
      title: 'Staff Detail',
      icon: '',
      showHeader: true,
    });
    // init form
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      address: new FormControl(''),
      phone_no: new FormControl(''),
      staff: new FormGroup({
        branch: new FormControl(null, Validators.required),
        role: new FormControl(0, Validators.required),
        note: new FormControl(''),
        working_since: new FormControl(new Date(), Validators.required),
        identification_number: new FormControl(''),
        tax_number: new FormControl(''),
        bpjs_number: new FormControl(''),
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
    if (this.staff.id) {
      this.refresh();
    }
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  get staffForm(): FormGroup {
    return this.registerForm.get('staff') as FormGroup;
  }

  loading = false;

  hasRequiredValidator(controlName: string): boolean {
    const control = this.staffForm.get(controlName);
    if (!control || !control.validator) return false;

    const validator = control.validator({} as AbstractControl);
    return validator && validator['required'];
  }
  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.staffService
      .getStaff(this.staff.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.staff = res.data;
        // patch value
        this.registerForm.patchValue({
          file: this.staff.user.profile_url,
          name: this.staff.user.name,
          email: this.staff.user.email,
          address: this.staff.user.address,
          phone_no: this.staff.user.phone_no,
        });
        this.staffForm.patchValue({
          working_since: new Date(this.staff.working_since),
          identification_number: this.staff.identification_number,
          tax_number: this.staff.tax_number,
          bpjs_number: this.staff.bpjs_number,
          note: this.staff.note,
          role: this.staff.role,
          branch: this.staff.branch,
        });

        this.loading = false;
      });
  }

  refresh() {
    this.loadData();
  }

  onSelectBranch() {
    const ref = this.dialogService.open(BranchSelectDialogComponent, {
      data: { title: 'Select Branch' },
      showHeader: false,
      contentStyle: { padding: '0' },
      style: { overflow: 'hidden' },
      styleClass: 'rounded-sm',
      dismissableMask: true,
      width: '450px',
    });
    ref.onClose.subscribe((result: any) => {
      if (result && result.branch) {
        console.log('Selected branch:', result.branch);
        this.staffForm.get('branch')?.setValue(result.branch);
      }
    });
  }

  removeBranch() {
    this.staffForm.get('branch')?.reset();
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
      delete bodyReq.staff.tax_category;
      delete bodyReq.email;
      delete bodyReq.file;
      delete bodyReq.staff.branch;
      delete bodyReq.staff.role;
      this.staffService
        .updateStaffBasedOnUser(this.staff.user.id, bodyReq)
        .subscribe({
          next: (res: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Staff',
              detail: 'Staff has been updated',
            });
            this.onUpdated.emit();
          },
          error: (err) => {
            this.actionButtons[0].loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Staff',
              detail: 'Failed to update staff',
            });
          },
        });
    }
  }
}
