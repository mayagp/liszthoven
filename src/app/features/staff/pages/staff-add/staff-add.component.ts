import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
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
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcTextareaComponent } from '../../../../shared/components/fc-textarea/fc-textarea.component';
import { FcDatepickerComponent } from '../../../../shared/components/fc-datepicker/fc-datepicker.component';
import { FcInputTelComponent } from '../../../../shared/components/fc-input-tel/fc-input-tel.component';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';

@Component({
  selector: 'app-staff-add',
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
    // FcDatepickerComponent,
    FcInputTelComponent,
    IftaLabelModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './staff-add.component.html',
  styleUrl: './staff-add.component.css',
  providers: [DialogService, MessageService],
})
export class StaffAddComponent implements OnInit, AfterContentInit, OnDestroy {
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
    private router: Router,
    private ability: PureAbility,
    private messageService: MessageService,
    private dialogService: DialogService,
    private fcDirtyStateService: FcDirtyStateService,
  ) {
    this.layoutService.setHeaderConfig({
      title: 'Add Staff',
      icon: '',
      showHeader: true,
    });
    // init form
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      password: new FormControl('asdqwe123'), // default password
      address: new FormControl(''),
      phone_no: new FormControl('', Validators.required),
      staff: new FormGroup({
        // branches: new FormControl(''),
        branch: new FormControl(null, Validators.required),
        note: new FormControl(''),
        role: new FormControl(0, Validators.required),
        working_since: new FormControl(Date()),
        identification_number: new FormControl(''),
        tax_number: new FormControl(''),
        bpjs_number: new FormControl(''),
        // status: new FormControl(0),
      }),
      user_documents: new FormArray([]),
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

  get branchesForm(): FormArray {
    return this.registerForm.controls['staff'].get('branches') as FormArray;
  }

  // manage document files
  get documentFilesArray() {
    return this.registerForm.get('user_documents') as FormArray;
  }

  get staffForm(): FormGroup {
    return this.registerForm.get('staff') as FormGroup;
  }

  hasRequiredValidator(controlName: string): boolean {
    const control = this.staffForm.get(controlName);
    if (!control || !control.validator) return false;

    const validator = control.validator({} as AbstractControl);
    return validator && validator['required'];
  }
  removeBranch() {
    this.staffForm.get('branch')?.reset();
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

  submit() {
    if (this.registerForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.registerForm);
      return;
    }

    let bodyReq = { ...this.registerForm.value };

    if (bodyReq.staff.branch && bodyReq.staff.branch.id) {
      bodyReq.staff.branch_id = bodyReq.staff.branch.id;
    }
    delete bodyReq.staff.branch;

    if (!bodyReq.staff.note || bodyReq.staff.note.trim() === '') {
      bodyReq.staff.note = '-';
    }

    delete bodyReq.user_documents;

    this.actionButtons[0].loading = true;

    this.authService.register(bodyReq).subscribe({
      next: (res: any) => {
        if (this.registerForm.value.user_documents.length) {
          let bodyReqDocument = new FormData();
          this.registerForm.value.user_documents.forEach(
            (file: any, index: number) => {
              bodyReqDocument.append(
                `documents[${index}][document]`,
                file.file,
              );
              bodyReqDocument.append(`documents[${index}][name]`, file.name);
              bodyReqDocument.append(`documents[${index}][note]`, file.note);
            },
          );

          this.authService
            .addUserDocument(res.data.id, bodyReqDocument)
            .subscribe({
              next: (documentRes: any) => {
                this.actionButtons[0].loading = false;
                this.router.navigate(['/staff/view/', res.data.staff.id]);
              },
              error: (err) => {
                this.actionButtons[0].loading = false;
                this.messageService.add({
                  severity: 'success',
                  summary: 'Staff',
                  detail: res.message,
                });
              },
            });
        } else {
          this.actionButtons[0].loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Staff',
            detail: res.message,
          });
          this.router.navigate(['/staff/view/', res.data.staff.id]);
        }
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
}
