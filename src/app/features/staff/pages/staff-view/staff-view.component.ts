import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import {
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    FcImagePreviewComponent,
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
  constructor(
    private layoutService: LayoutService,
    private authService: AuthService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private fcDirtyStateService: FcDirtyStateService,
    private route: ActivatedRoute,
    private staffService: StaffService,
    private ability: PureAbility,
    private router: Router,
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
        role: new FormControl(0), // note: need to change by backend, and every role has different required fields
        // New Data
        working_since: new FormControl(Date()),
        identification_number: new FormControl(''),
        tax_number: new FormControl(''),
        bpjs_number: new FormControl(''),
      }),
      user_documents: new FormArray([]),
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

  // manage document files
  get documentFilesArray() {
    return this.registerForm.get('user_documents') as FormArray;
  }

  get staffForm(): FormGroup {
    return this.registerForm.get('staff') as FormGroup;
  }

  get businessUnitArray() {
    return this.staffForm.get('business_units') as FormArray;
  }

  loading = false;
  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.staffService
      .getStaff(this.staff.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.staff = res.data;
        this.loadUserDocuments();
        // patch value
        this.registerForm.patchValue({
          file: this.staff.user.profile_url,
          name: this.staff.user.name,
          email: this.staff.user.email,
          address: this.staff.user.address,
          phone_no: this.staff.user.phone_no,
        });
        this.staffForm.patchValue({
          working_since: this.staff.working_since,
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
    this.registerForm.removeControl('user_documents');
    this.registerForm.addControl('user_documents', new FormArray([]));
    this.loadData();
  }

  loadingDocument = false;
  loadUserDocuments() {
    let paramString = 'page=1&limit=1000';
    this.loadingDocument = true;
    this.authService
      .getUserDocuments(this.staff.user_id, paramString)
      .subscribe({
        next: (res: any) => {
          this.loadingDocument = false;
          res.data.user_documents.forEach((document: any) => {
            const dotIndex = document.name.lastIndexOf('.');
            let fileType = '';
            if (dotIndex !== -1) {
              // Extract the "type" part from the input
              fileType = document.name.substring(dotIndex);
            }
            this.documentFilesArray.push(
              new FormGroup({
                id: new FormControl(document.id),
                src: new FormControl(document.url),
                name: new FormControl(document.name),
                note: new FormControl(document.note),
                file_type: new FormControl(fileType),
                loading_edit: new FormControl(false),
                loading_delete: new FormControl(false),
                inputChangeName: new FormControl(false),
              }),
            );
          });
        },
        error: (err) => {
          this.loadingDocument = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Staff Document',
            detail: err.message,
          });
        },
      });
  }

  loadingProfileImage = false;
  changeProfile(image: any) {
    this.loadingProfileImage = true;
    let fd = new FormData();
    fd.append('image', image.file);
    this.staffService.updateProfilePicture(this.staff.user_id, fd).subscribe({
      next: (res: any) => {
        this.registerForm.controls['file'].setValue(res.data.profile_url);
        this.loadingProfileImage = false;
        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Staff Profile',
          detail: res.message,
        });
      },
      error: (err) => {
        this.loadingProfileImage = false;
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Staff Profile',
          detail: err.message,
        });
      },
    });
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
  //       this.loadingDocument = true;
  //       // make body request
  //       let bodyReqDocument = new FormData();
  //       documents.forEach((document: any, index: number) => {
  //         bodyReqDocument.append(
  //           `documents[${index}][document]`,
  //           document.file
  //         );
  //         bodyReqDocument.append(`documents[${index}][name]`, document.name);
  //         bodyReqDocument.append(`documents[${index}][note]`, document.note);
  //       });
  //       this.authService
  //         .addUserDocument(Number(this.staff.user_id), bodyReqDocument)
  //         .subscribe({
  //           next: (documentRes: any) => {
  //             this.loadingDocument = false;
  //             documentRes.data.forEach((data: any) => {
  //               const dotIndex = data.name.lastIndexOf('.');
  //               let fileType = '';
  //               if (dotIndex !== -1) {
  //                 // Extract the "type" part from the input
  //                 fileType = data.name.substring(dotIndex);
  //               }
  //               this.documentFilesArray.push(
  //                 new FormGroup({
  //                   id: new FormControl(data.id),
  //                   src: new FormControl(data.url),
  //                   name: new FormControl(data.name),
  //                   note: new FormControl(data.note),
  //                   file_type: new FormControl(fileType),
  //                   loading_edit: new FormControl(false),
  //                   loading_delete: new FormControl(false),
  //                   inputChangeName: new FormControl(false),
  //                 })
  //               );
  //             });
  //             this.fcToastService.add({
  //               severity: 'success',
  //               header: 'User Document',
  //               message: 'Successfully added user document',
  //             });
  //           },
  //           error: (err) => {
  //             this.loadingDocument = false;
  //             this.fcToastService.add({
  //               severity: 'error',
  //               header: 'User Document',
  //               message: err.message,
  //             });
  //           },
  //         });
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

  changeDocumentName(index: number, id: string) {
    if (this.documentFilesArray.at(index).value.inputChangeName == true) {
      this.confirmationService.confirm({
        header: 'Confirmation',
        message: 'Are you sure to update this user document?',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => {
          let bodyReq = new FormGroup({
            name: new FormControl(this.documentFilesArray.value[index].name),
            note: new FormControl(this.documentFilesArray.value[index].note),
          });
          this.documentFilesArray.at(index).patchValue({
            loading_edit: true,
          });
          this.authService
            .updateUserDocument(this.staff.user_id, id, bodyReq.value)
            .subscribe({
              next: (res: any) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'User Document',
                  detail: res.message,
                });
                this.documentFilesArray.at(index).patchValue({
                  name: res.data.name,
                  note: res.data.note,
                  inputChangeName: false,
                  loading_edit: false,
                });
              },
              error: (err) => {
                this.documentFilesArray.at(index).patchValue({
                  loading_edit: false,
                });
                this.messageService.add({
                  severity: 'error',
                  summary: 'User Document',
                  detail: err.message,
                });
              },
            });
        },
        reject: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cancelled',
            detail: 'Update operation was cancelled',
          });
        },
      });
    } else {
      this.documentFilesArray.at(index).patchValue({
        inputChangeName: true,
      });
    }
  }

  removeDocument(index: number, id: string) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this document?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.documentFilesArray.at(index).patchValue({
          loading_delete: true,
        });
        this.authService.deleteUserDocument(this.staff.user_id, id).subscribe({
          next: (res: any) => {
            this.documentFilesArray.at(index).patchValue({
              loading_delete: false,
            });
            this.messageService.add({
              severity: 'success',
              summary: 'User Document',
              detail: res.message,
            });
            this.documentFilesArray.removeAt(index);
          },
          error: (err) => {
            this.documentFilesArray.at(index).patchValue({
              loading_delete: false,
            });
            this.messageService.add({
              severity: 'error',
              summary: 'User Document',
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
      delete bodyReq.user_documents;
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
