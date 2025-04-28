import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
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
  ],
  templateUrl: './staff-add.component.html',
  styleUrl: './staff-add.component.css',
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
      hidden: true,
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

  teacherTypes = [
    {
      label: 'Permanent',
      value: 0,
    },
    {
      label: 'Part Time',
      value: 1,
    },
  ];
  maritalStatus = [
    {
      id: 0,
      label: 'TK0',
    },
    {
      id: 1,
      label: 'TK1',
    },
    {
      id: 2,
      label: 'TK2',
    },
    {
      id: 3,
      label: 'TK3',
    },
    {
      id: 4,
      label: 'K0',
    },
    {
      id: 5,
      label: 'K1',
    },
    {
      id: 6,
      label: 'K2',
    },
    {
      id: 7,
      label: 'K3',
    },
  ];

  roles = [
    {
      id: 0,
      label: 'Developer',
    },
    {
      id: 1,
      label: 'Teacher',
    },
    {
      id: 2,
      label: 'Admin',
    },
    {
      id: 3,
      label: 'Owner',
    },
    {
      id: 4,
      label: 'Admin Manager',
    },
    {
      id: 5,
      label: 'Commisioner',
    },
    {
      id: 6,
      label: 'Director',
    },
  ];

  religion = [
    {
      id: 0,
      label: 'Islam',
    },
    {
      id: 1,
      label: 'Christianity',
    },
    {
      id: 2,
      label: 'Catholic',
    },
    {
      id: 3,
      label: 'Hinduism',
    },
    {
      id: 4,
      label: 'Buddhism',
    },
    {
      id: 5,
      label: 'Confucianism',
    },
    {
      id: 6,
      label: 'Other',
    },
  ];

  isTeacherRole = false;
  registerForm: FormGroup;
  constructor(
    private layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private ability: PureAbility,
    private messageService: MessageService,
    private fcDirtyStateService: FcDirtyStateService,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'staff');
    this.layoutService.setHeaderConfig({
      title: 'Add Staff',
      icon: '',
      showHeader: true,
    });
    // init form
    this.registerForm = new FormGroup({
      first_name: new FormControl('', Validators.required),
      middle_name: new FormControl(''),
      last_name: new FormControl(''),
      email: new FormControl('', Validators.required),
      password: new FormControl('asdqwe123'), // default password
      address: new FormControl(''),
      phone_no: new FormControl(''),
      staff: new FormGroup({
        business_units: new FormArray([]),
        note: new FormControl(''),
        role: new FormControl(0),
        // note: need to change by backend, and every role has different required fields
        // New Data
        teacher: new FormGroup({
          note: new FormControl('-'),
          type: new FormControl(0),
          classroom: new FormControl(null),
          spoken_language: new FormControl('-'),
          teacher_instruments: new FormArray([]),
        }),
        working_since: new FormControl(Date()),
        identification_number: new FormControl(''),
        tax_number: new FormControl(''),
        bpjs_number: new FormControl(''),
        marital_status: new FormControl(0),
        religion: new FormControl(0),
        color: new FormControl(null),
        tax_category: new FormControl(null),
      }),
      user_documents: new FormArray([]),
    });
  }

  ngOnInit(): void {
    this.layoutService.setSearchConfig({ hide: true });
    this.staffForm.get('role')?.valueChanges.subscribe((selectedRole) => {
      this.isTeacherRole = selectedRole === 1;
    });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  get businessUnitsForm(): FormArray {
    return this.registerForm.controls['staff'].get(
      'business_units',
    ) as FormArray;
  }

  // manage document files
  get documentFilesArray() {
    return this.registerForm.get('user_documents') as FormArray;
  }

  get staffForm(): FormGroup {
    return this.registerForm.get('staff') as FormGroup;
  }

  get teacherForm(): FormGroup {
    return this.staffForm.get('teacher') as FormGroup;
  }

  // addMultipleFiles(files: any) {
  //   const ref = this.dialogService.open(UserDocumentAddDialogComponent, {
  //     data: {
  //       title: 'Add User Document',
  //       documents: files,
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '800px',
  //   });
  //   ref.onClose.subscribe((documents: any) => {
  //     if (documents) {
  //       documents.forEach((document: any, index: number) => {
  //         const dotIndex = document.name.lastIndexOf('.');
  //         let fileType = '';
  //         if (dotIndex !== -1) {
  //           // Extract the "type" part from the input
  //           fileType = document.name.substring(dotIndex);
  //         }
  //         this.documentFilesArray.push(
  //           new FormGroup({
  //             file: new FormControl(document.file),
  //             src: new FormControl(document.src),
  //             name: new FormControl(document.name),
  //             note: new FormControl(document.note),
  //             file_type: new FormControl(fileType),
  //             inputChangeName: new FormControl(false),
  //           })
  //         );
  //       });
  //     }
  //   });
  // }

  fileType(fileName: string) {
    if (fileName.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) != null) {
      return 'image';
    } else if (fileName.toLowerCase().match(/\.(pdf)$/) != null) {
      return 'pdf';
    } else {
      return 'file';
    }
  }

  changeDocumentName(index: number) {
    if (this.documentFilesArray.at(index).value.inputChangeName == true) {
      this.documentFilesArray.at(index).patchValue({
        name: this.documentFilesArray.at(index).value.name,
        note: this.documentFilesArray.at(index).value.note,
        inputChangeName: false,
      });
    } else {
      this.documentFilesArray.at(index).patchValue({
        inputChangeName: true,
      });
    }
  }

  // removeDocument(index: number) {
  //   this.fcConfirmService.open({
  //     header: 'Confirmation',
  //     message: 'Are you sure to delete this document?',
  //     accept: () => {
  //       this.documentFilesArray.removeAt(index);
  //     },
  //   });
  // }

  // onAddBusinessUnit() {
  //   const ref = this.dialogService.open(BusinessUnitSelectDialogComponent, {
  //     data: {
  //       title: 'Select Branch',
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '450px',
  //   });
  //   ref.onClose.subscribe((businessUnit: any) => {
  //     if (!businessUnit) {
  //       return;
  //     }
  //     this.businessUnitsForm.push(
  //       new FormGroup({
  //         company: new FormControl(businessUnit.company),
  //         branch: new FormControl(businessUnit.branch),
  //       })
  //     );
  //   });
  // }

  removeBusinessUnit(index: number) {
    this.businessUnitsForm.removeAt(index);
  }

  // onSelectTaxCategory() {
  //   const ref = this.dialogService.open(TaxCategorySelectDialogComponent, {
  //     data: {
  //       title: 'Select Tax Category',
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '450px',
  //   });
  //   ref.onClose.subscribe((tax_category) => {
  //     if (tax_category && this.staffForm?.controls['tax_category']) {
  //       this.staffForm.controls['tax_category'].setValue(tax_category);
  //     }
  //   });
  // }

  onRemoveTaxCategory() {
    this.staffForm.controls['tax_category'].setValue(null);
  }

  get teacherInstrumentFormArray(): FormArray {
    return this.teacherForm.get('teacher_instruments') as FormArray;
  }
  generateTeacherInstrument(teacherInstrument: any): FormGroup {
    return new FormGroup({
      instrument: new FormControl(
        teacherInstrument.instrument,
        Validators.required,
      ),
      teacher_rank: new FormControl(
        teacherInstrument.teacher_rank,
        Validators.required,
      ),
      note: new FormControl(teacherInstrument.note, Validators.required),
    });
  }
  // addTeacherInstrument() {
  //   const ref = this.dialogService.open(TeacherAddInstrumentDialogComponent, {
  //     data: {
  //       title: 'Add Service Invoice Detail',
  //       teacherInstrumentFormArray: this.teacherInstrumentFormArray.value,
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '450px',
  //   });
  //   ref.onClose.subscribe((teacherInstrument: any) => {
  //     if (teacherInstrument) {
  //       console.log('Data received:', teacherInstrument); // Debug 3: Cek data yang dikirim
  //       this.teacherInstrumentFormArray.push(
  //         this.generateTeacherInstrument(teacherInstrument)
  //       );

  //       console.log(
  //         'Updated FormArray:',
  //         this.teacherInstrumentFormArray.value
  //       ); // Debug 4: Cek apakah data berhasil ditambahkan
  //     } else {
  //       console.log('No data received.');
  //     }
  //   });
  // }

  submit() {
    if (this.registerForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.registerForm);
      return;
    } else {
      let bodyReq = { ...this.registerForm.value };
      bodyReq.staff.business_units = bodyReq.staff.business_units.map(
        (item: any) => {
          return {
            company_id: item.company.id,
            branch_id: item.branch.id,
          };
        },
      );
      if (!bodyReq.staff.note || bodyReq.staff.note.trim() === '') {
        bodyReq.staff.note = '-';
      }
      bodyReq.staff.tax_category_id =
        bodyReq.staff.tax_category &&
        typeof bodyReq.staff.tax_category === 'object'
          ? bodyReq.staff.tax_category.id
          : null;
      delete bodyReq.staff.tax_category;

      if (bodyReq.staff.role === 1) {
        bodyReq.staff.teacher = {
          note: bodyReq.staff.teacher?.note || '-',
          type: bodyReq.staff.teacher?.type || 0,
          spoken_language: bodyReq.staff.teacher?.spoken_language || '-',
          teacher_instruments: bodyReq.staff.teacher?.teacher_instruments
            ? bodyReq.staff.teacher.teacher_instruments.map((item: any) => ({
                instrument_id: item.instrument.id,
                teacher_rank_id: item.teacher_rank.id,
                note: item.note,
              }))
            : [],
        };
      } else {
        delete bodyReq.staff.teacher; // Hapus teacher jika role bukan 1
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
}
