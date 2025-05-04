import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faChevronDown,
  faPlus,
  faEye,
  faTrash,
  faPencil,
  faArrowRight,
  faRefresh,
  faCloudArrowUp,
  faFile,
  faFloppyDisk,
  faXmark,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { AutoNumberService } from '../../../../shared/services/auto-number.service';
import { SupplierSelectDialogComponent } from '../../../supplier/components/supplier-select-dialog/supplier-select-dialog.component';
import { PurchaseReturnAddDetailDialogComponent } from '../../components/purchase-return-add-detail-dialog/purchase-return-add-detail-dialog.component';
import { PurchaseReturnEditDetailDialogComponent } from '../../components/purchase-return-edit-detail-dialog/purchase-return-edit-detail-dialog.component';
import { PurchaseReturnService } from '../../services/purchase-return.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-purchase-return-add',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    ToastModule,
    RouterModule,
    FcCurrencyPipe,
    FcImagePreviewComponent,
    FcInputTextComponent,
    DatePickerModule,
    IftaLabelModule,
    ConfirmDialogModule,
  ],
  templateUrl: './purchase-return-add.component.html',
  styleUrl: './purchase-return-add.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchaseReturnAddComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faArrowRight = faArrowRight;
  faRefresh = faRefresh;
  faCloudArrowUp = faCloudArrowUp;
  faFile = faFile;
  faFloppyDisk = faFloppyDisk;
  faXmark = faXmark;

  purchaseReturnDestination: any = [
    {
      id: 0,
      name: 'Goods Receipt',
    },
    {
      id: 1,
      name: 'Purchase Invoice',
    },
  ];

  purchaseReturnTypes: any = [
    {
      id: 0,
      name: 'Return',
    },
    {
      id: 1,
      name: 'Refund',
    },
  ];

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

  loading = false;
  purchaseReturnForm: FormGroup;
  purchaseReturnNumber: string = '';

  constructor(
    private layoutService: LayoutService,
    private purchaseReturnService: PurchaseReturnService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private autoNumberService: AutoNumberService,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'purchase-return',
    );
    this.layoutService.setHeaderConfig({
      title: 'Add Purchase Return',
      icon: '',
      showHeader: true,
    });
    this.purchaseReturnForm = new FormGroup({
      destination: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      note: new FormControl(null),
      type: new FormControl(null, Validators.required),
      supplier: new FormControl(null, Validators.required),
      purchase_return_details: new FormArray([]),
      purchase_return_documents: new FormArray([]),
    });
  }
  ngOnInit(): void {
    this.generateAutoNumber();
    this.layoutService.setSearchConfig({ hide: true });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }
  generateAutoNumber() {
    this.autoNumberService
      .getAutoNumberByTabel('purchase_returns')
      .subscribe((res: any) => {
        this.purchaseReturnNumber = res.latest_auto_number;
      });
  }

  get purchaseReturnDetails(): FormArray {
    return this.purchaseReturnForm.get('purchase_return_details') as FormArray;
  }

  generatePurchaseReturnDetails(purchaseReturnDetail: any): FormGroup {
    return new FormGroup({
      purchaseable: new FormControl(purchaseReturnDetail.purchaseable),
      quantity: new FormControl(purchaseReturnDetail.quantity),
      amount: new FormControl(purchaseReturnDetail.amount),
    });
  }

  changeDestination() {
    this.purchaseReturnForm.removeControl('purchase_return_details');
    this.purchaseReturnForm.addControl(
      'purchase_return_details',
      new FormArray([]),
    );
  }

  removeDestination() {
    this.purchaseReturnForm.controls['destination'].setValue(null);
    this.purchaseReturnForm.removeControl('purchase_return_details');
    this.purchaseReturnForm.addControl(
      'purchase_return_details',
      new FormArray([]),
    );
  }

  removeSupplier() {
    this.purchaseReturnForm.controls['supplier'].setValue('');
  }

  onSelectSupplier() {
    const ref = this.dialogService.open(SupplierSelectDialogComponent, {
      data: {
        title: 'Select Supplier',
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
    });
    ref.onClose.subscribe((supplier) => {
      if (supplier) {
        this.purchaseReturnForm.controls['supplier'].setValue(supplier);
      }
    });
  }

  onAddPurchaseReturnDetail() {
    let existProducts: any[] = [];
    if (this.purchaseReturnDetails.value.length > 0) {
      existProducts = this.purchaseReturnDetails.value.map((data: any) => {
        return data.purchaseable.product;
      });
    }

    // Open Dialog
    const ref = this.dialogService.open(
      PurchaseReturnAddDetailDialogComponent,
      {
        data: {
          title: 'Add Purchase Return Detail',
          currentProducts: existProducts,
          destination: this.purchaseReturnForm.value.destination,
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
    ref.onClose.subscribe((purchaseReturnDetail) => {
      if (purchaseReturnDetail) {
        this.purchaseReturnDetails.push(
          this.generatePurchaseReturnDetails(purchaseReturnDetail),
        );
      }
    });
  }

  onEditPurchaseReturnDetail(index: number) {
    let existProducts: any[] = [];
    if (this.purchaseReturnDetails.value.length > 0) {
      existProducts = this.purchaseReturnDetails.value.map((data: any) => {
        return data.purchaseable.product;
      });
    }

    // Open Dialog
    const ref = this.dialogService.open(
      PurchaseReturnEditDetailDialogComponent,
      {
        data: {
          title: 'Edit Purchase Return Detail',
          currentProducts: existProducts,
          purchaseReturnDetail: this.purchaseReturnDetails.value[index],
          destination: this.purchaseReturnForm.value.destination,
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
    ref.onClose.subscribe((newData) => {
      if (newData) {
        this.purchaseReturnDetails.controls[index].patchValue(newData);
      }
    });
  }

  onRemovePurchaseReturnDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseReturnDetails.removeAt(index);
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

  // manage document files
  get documentFilesArray() {
    return this.purchaseReturnForm.get(
      'purchase_return_documents',
    ) as FormArray;
  }

  addMultipleFiles(files: any) {
    files.forEach((element: any) => {
      const dotIndex = element.file.name.lastIndexOf('.');
      let fileType = '';
      if (dotIndex !== -1) {
        // Extract the "type" part from the input
        fileType = element.file.name.substring(dotIndex);
      }
      this.documentFilesArray.push(
        new FormGroup({
          file: new FormControl(element.file),
          src: new FormControl(element.img_src),
          original_name: new FormControl(element.file.name),
          file_type: new FormControl(fileType),
          inputChangeName: new FormControl(false),
        }),
      );
    });
  }

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
    const documentFile = this.documentFilesArray.at(index);
    if (documentFile.value.inputChangeName == true) {
      documentFile.patchValue({
        original_name:
          documentFile.value.original_name + documentFile.value.file_type,
        inputChangeName: false,
      });
    } else {
      documentFile.patchValue({
        inputChangeName: true,
        original_name: documentFile.value.original_name.replace(
          documentFile.value.file_type,
          '',
        ),
      });
    }
  }

  removeDocument(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this document?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.documentFilesArray.removeAt(index);
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
    if (this.purchaseReturnForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchaseReturnForm);
      return;
    }
    if (this.purchaseReturnForm.valid) {
      let bodyReqForm: FormGroup;
      bodyReqForm = new FormGroup({
        destination: new FormControl(this.purchaseReturnForm.value.destination),
        date: new FormControl(this.purchaseReturnForm.value.date),
        note: new FormControl(this.purchaseReturnForm.value.note),
        type: new FormControl(this.purchaseReturnForm.value.type),
        supplier_id: new FormControl(this.purchaseReturnForm.value.supplier.id),
        purchase_return_details: new FormArray([]),
      });
      if (this.purchaseReturnForm.value.purchase_return_details) {
        let purchaseReturnDetailArray: any = bodyReqForm.get(
          'purchase_return_details',
        );
        this.purchaseReturnForm.value.purchase_return_details.forEach(
          (data: any) => {
            let fg = new FormGroup({
              purchaseable_id: new FormControl(data.purchaseable.id),
              quantity: new FormControl(data.quantity),
              amount: new FormControl(data.amount),
            });
            purchaseReturnDetailArray.push(fg);
          },
        );
      }

      this.purchaseReturnService
        .addPurchaseReturn(bodyReqForm.value)
        .subscribe({
          next: (res: any) => {
            if (
              this.purchaseReturnForm.value.purchase_return_documents.length
            ) {
              let bodyReqDocument = new FormData();
              this.purchaseReturnForm.value.purchase_return_documents.forEach(
                (file: any, index: number) => {
                  bodyReqDocument.append(
                    `purchase_return_documents[${index}][file]`,
                    file.file,
                  );
                  bodyReqDocument.append(
                    `purchase_return_documents[${index}][original_name]`,
                    file.original_name,
                  );
                },
              );
              this.purchaseReturnService
                .addPurchaseReturnDocuments(res.data.id, bodyReqDocument)
                .subscribe({
                  next: (documentRes: any) => {
                    this.actionButtons[0].loading = false;
                    this.messageService.clear();
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Purchase Return',
                      detail: res.message,
                    });
                    if (
                      this.purchaseReturnNumber != res.data.purchase_return_no
                    ) {
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Success Message',
                        detail:
                          'Purchase Return Number has been changed because of duplicate',
                      });
                    }
                    this.router.navigate([
                      '/purchase-return/view/',
                      res.data.id,
                    ]);
                  },
                  error: (err) => {
                    this.actionButtons[0].loading = false;
                  },
                });
            } else {
              this.actionButtons[0].loading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Purchase Return',
                detail: res.message,
              });
              this.router.navigate(['/purchase-return/view/', res.data.id]);
            }
          },
          error: (err) => {
            this.actionButtons[0].loading = false;
          },
        });
    } else {
      // Toast
      this.messageService.add({
        summary: 'Purchase Return',
        detail: 'Fill the form first!',
        // lottieOption: {
        //   path: '/assets/lotties/warning.json',
        //   loop: false,
        // },
      });
    }
  }
}
