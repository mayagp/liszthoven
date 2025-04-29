import { CommonModule, Location } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faEye,
  faTrash,
  faPencil,
  faTimes,
  faChevronDown,
  faRefresh,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { Subject, takeUntil } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { PurchaseRequestAddDialogComponent } from '../../components/purchase-request-add-dialog/purchase-request-add-dialog.component';
import { PurchaseRequestEditDialogComponent } from '../../components/purchase-request-edit-dialog/purchase-request-edit-dialog.component';
import { PurchaseRequest } from '../../interfaces/purchase-request';
import { PurchaseRequestService } from '../../services/purchase-request.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-purchase-request-view',
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    FcInputTextComponent,
    FcImagePreviewComponent,
    FcCurrencyPipe,
    RouterModule,
    DatePickerModule,
    IftaLabelModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './purchase-request-view.component.html',
  styleUrl: './purchase-request-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class PurchaseRequestViewComponent {
  private readonly destroy$: any = new Subject();
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  actionButtons: any[] = [];
  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,
      action: () => {
        this.refresh();
      },
    },
  ];

  purchaseRequestForm: FormGroup;
  loading = false;

  @Input() purchaseRequest: PurchaseRequest = {} as PurchaseRequest;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

  constructor(
    private layoutService: LayoutService,
    private purchaseRequestService: PurchaseRequestService,
    private messageService: MessageService,
    private location: Location,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.layoutService.setHeaderConfig({
      title: 'Purchase Request',
      icon: '',
      showHeader: true,
    });
    this.purchaseRequestForm = new FormGroup({
      business_unit: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      purchase_request_no: new FormControl('', Validators.required),
      purchase_request_details: new FormArray([]),
    });
    this.purchaseRequest.id = String(this.route.snapshot.paramMap.get('id'));
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
  isShowPurchaseRequestDetailSummary: boolean = false;
  @ViewChild('purchaseRequestDetailSummary')
  purchaseRequestDetailSummary?: ElementRef;
  @ViewChild('purchaseRequestFormElement')
  purchaseRequestFormElement?: ElementRef;
  @ViewChild('stickyPurchaseRequestDetailSummary')
  stickyPurchaseRequestDetailSummary?: ElementRef;
  onScroll(event: any) {
    this.setPurchaseRequestDetailSummaryVisibility();
  }
  setPurchaseRequestDetailSummaryVisibility() {
    let formPurchaseOrderBoxBounds =
      this.purchaseRequestFormElement?.nativeElement.getBoundingClientRect();
    let stickyPurchaseOrderBoxBounds =
      this.stickyPurchaseRequestDetailSummary?.nativeElement.getBoundingClientRect();
    let purchaseRequestDetailSummaryBoxBounds =
      this.purchaseRequestDetailSummary?.nativeElement.getBoundingClientRect();

    if (
      formPurchaseOrderBoxBounds != undefined &&
      purchaseRequestDetailSummaryBoxBounds != undefined
    ) {
      if (
        formPurchaseOrderBoxBounds.bottom -
          (purchaseRequestDetailSummaryBoxBounds.bottom -
            purchaseRequestDetailSummaryBoxBounds.height) <
        stickyPurchaseOrderBoxBounds.height
      ) {
        this.isShowPurchaseRequestDetailSummary = true;
      } else {
        this.isShowPurchaseRequestDetailSummary = false;
      }
    }
  }
  scrollToBottom() {
    this.purchaseRequestDetailSummary?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    });
  }

  generateActionButtons() {
    switch (this.purchaseRequest.status) {
      case 0:
        this.actionButtons = [
          {
            label: 'Save',
            icon: faSave,
            action: () => {
              this.submit();
            },
            hidden: !this.ability.can('update', 'purchase-request'),
          },
          {
            label: 'Approval Request',
            icon: faSave,
            action: () => {
              this.approvalRequest();
            },
            hidden: !this.ability.can('approval-request', 'purchase-request'),
          },
          {
            label: 'Cancel',
            icon: faTimes,
            action: () => {
              this.cancel();
            },
            hidden: !this.ability.can('cancel', 'purchase-request'),
          },
          {
            label: 'Delete',
            icon: faTrash,
            action: () => {
              this.delete();
            },
            hidden: !this.ability.can('delete', 'purchase-request'),
          },
        ];
        break;
      case 1:
        this.actionButtons = [
          {
            label: 'Approve',
            icon: faSave,
            action: () => {
              this.approve();
            },
            hidden: !this.ability.can('approve', 'purchase-request'),
          },
          {
            label: 'Cancel',
            icon: faTimes,
            action: () => {
              this.cancel();
            },
            hidden: !this.ability.can('cancel', 'purchase-request'),
          },
          {
            label: 'Delete',
            icon: faTrash,
            action: () => {
              this.delete();
            },
            hidden: !this.ability.can('delete', 'purchase-request'),
          },
        ];
        break;
      // case 2:
      //   this.actionButtons = [
      //     {
      //       label: 'Save',
      //       icon: faSave,
      //       action: () => {
      //         this.submit();
      //       },
      //     },
      //     {
      //       label: 'Delete',
      //       icon: faTrash,
      //       action: () => {
      //         this.delete();
      //       },
      //     },
      //   ];
      //   break;
      // case 3:
      //   this.actionButtons = [
      //     {
      //       label: 'Save',
      //       icon: faSave,
      //       action: () => {
      //         this.submit();
      //       },
      //     },
      //     {
      //       label: 'Delete',
      //       icon: faTrash,
      //       action: () => {
      //         this.delete();
      //       },
      //     },
      //   ];
      //   break;
      default:
        this.actionButtons = [];
        break;
    }
  }
  updateHeader() {
    this.layoutService.setHeaderConfig({
      title: `Purchase Request (${this.purchaseRequest.status_name})`,
      icon: '',
      showHeader: true,
    });
  }

  loadData() {
    this.loading = true;
    this.destroy$.next();
    this.purchaseRequestService
      .getPurchaseRequest(this.purchaseRequest.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.purchaseRequest = res.data;
          this.purchaseRequestForm.patchValue({
            ...this.purchaseRequest,
            date: new Date(this.purchaseRequest.date),
          });
          this.purchaseRequest.purchase_request_details.map(
            (purchaseRequestDetail: any) => {
              this.purchaseRequestDetails.push(
                this.generatePurchaseRequestDetail(purchaseRequestDetail),
              );
            },
          );
          this.updateHeader();
          this.generateActionButtons();
          setTimeout(() => {
            this.setPurchaseRequestDetailSummaryVisibility();
          }, 100);
        },
        error: (err: any) => {
          this.loading = false;
          this.back();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message,
          });
        },
      });
  }

  get purchaseRequestDetails(): FormArray {
    return this.purchaseRequestForm.get(
      'purchase_request_details',
    ) as FormArray;
  }

  generatePurchaseRequestDetail(purchaseRequestDetail: any): FormGroup {
    return new FormGroup({
      id: new FormControl(purchaseRequestDetail.id, Validators.required),
      product: new FormControl(
        purchaseRequestDetail.product,
        Validators.required,
      ),
      quantity: new FormControl(
        purchaseRequestDetail.quantity,
        Validators.required,
      ),
    });
  }

  onAddPurchaseRequestDetail() {
    const ref = this.dialogService.open(PurchaseRequestAddDialogComponent, {
      showHeader: false,
      data: {
        title: 'Add Purchase Request Detail',
        purchaseRequestDetails: this.purchaseRequestDetails.value,
      },
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
    ref.onClose.subscribe((purchaseRequestDetail) => {
      if (purchaseRequestDetail) {
        let bodyReq = {
          quantity: purchaseRequestDetail.quantity,
          product_id: purchaseRequestDetail.product.id,
        };
        this.purchaseRequestService
          .addPurchaseRequestDetail(this.purchaseRequest.id, bodyReq)
          .subscribe({
            next: (res: any) => {
              this.purchaseRequestDetails.push(
                this.generatePurchaseRequestDetail(res.data),
              );
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message,
              });
            },
          });
      }
    });
  }

  onEditPurchaseRequestDetail(index: number) {
    const ref = this.dialogService.open(PurchaseRequestEditDialogComponent, {
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
      data: {
        title: 'Edit Purchase Request Detail',
        purchaseRequestDetail:
          this.purchaseRequestDetails.controls[index].value,
      },
    });
    ref.onClose.subscribe((purchaseRequestDetail) => {
      if (purchaseRequestDetail) {
        let bodyReq = JSON.parse(JSON.stringify(purchaseRequestDetail)); // deep copy
        bodyReq.product_id = bodyReq.product.id;
        delete bodyReq.product;

        this.purchaseRequestService
          .updatePurchaseRequestDetail(
            this.purchaseRequest.id,
            bodyReq,
            this.purchaseRequestDetails.value[index].id,
          )
          .subscribe({
            next: (res: any) => {
              this.purchaseRequestDetails
                .at(index)
                .patchValue(purchaseRequestDetail);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Request Detail has been updated',
              });
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message,
              });
            },
          });
      }
    });
  }

  onRemovePurchaseRequestDetail(index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseRequestService
          .deletePurchaseRequestDetail(
            this.purchaseRequest.id,
            this.purchaseRequestDetails.value[index].id,
          )
          .subscribe({
            next: (res: any) => {
              this.purchaseRequestDetails.removeAt(index);
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Request Detail has been deleted',
              });
            },
            error: (err: any) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
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

  removeBusinessUnit() {
    this.purchaseRequestForm.controls['business_unit'].setValue('');
  }

  onSelectBusinessUnit() {
    const ref = this.dialogService.open(BranchSelectDialogComponent, {
      data: {
        title: 'Select Business Unit',
        companyId: 2,
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
    ref.onClose.subscribe((businessUnit: any) => {
      if (businessUnit) {
        this.purchaseRequestForm.controls['business_unit'].setValue(
          businessUnit,
        );
      }
    });
  }
  get grandTotalPrice() {
    return this.purchaseRequestDetails.value.reduce(
      (sum: any, item: any) => sum + item.product.base_price * item.quantity,
      0,
    );
  }

  back() {
    this.location.back();
  }

  submit() {
    if (this.purchaseRequestForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchaseRequestForm);
      return;
    }
    if (this.purchaseRequestForm.valid) {
      this.actionButtons[0].loading = true;
      let bodyReq = JSON.parse(JSON.stringify(this.purchaseRequestForm.value)); // deep copy
      bodyReq = { ...bodyReq, business_unit_id: bodyReq.business_unit.id };
      delete bodyReq.purchase_request_no;
      delete bodyReq.purchase_request_details;
      delete bodyReq.business_unit;

      this.purchaseRequestService
        .updatePurchaseRequest(this.purchaseRequest.id, bodyReq)
        .subscribe({
          next: (res: any) => {
            this.actionButtons[0].loading = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Purchase Request',
              detail: res.message,
            });
            if (this.quickView) {
              this.onUpdated.emit(res.data);
            }
          },
          error: (err) => {
            this.actionButtons[0].loading = false;
            this.messageService.clear();
            this.messageService.add({
              severity: 'error',
              summary: 'Purchase Request',
              detail: err.message,
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error Message',
        detail: 'Please fill all required fields',
      });
    }
  }

  approvalRequest() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to request approval this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseRequestService
          .approvalRequestPurchaseRequest(this.purchaseRequest.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Request has been requested approval',
              });
              this.purchaseRequest.status = res.data.status;
              this.purchaseRequest.status_name = res.data.status_name;
              this.updateHeader();
              this.generateActionButtons();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: error.message,
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

  approve() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to approve this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseRequestService
          .approvePurchaseRequest(this.purchaseRequest.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Request has been approved',
              });
              this.purchaseRequest.status = res.data.status;
              this.purchaseRequest.status_name = res.data.status_name;
              this.updateHeader();
              this.generateActionButtons();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: error.message,
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

  cancel() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to cancel this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseRequestService
          .cancelPurchaseRequest(this.purchaseRequest.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Request has been canceled',
              });
              this.purchaseRequest.status = res.data.status;
              this.purchaseRequest.status_name = res.data.status_name;
              this.updateHeader();
              this.generateActionButtons();
              if (this.quickView) {
                this.onUpdated.emit(res.data);
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: error.message,
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

  delete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this data?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.purchaseRequestService
          .deletePurchaseRequest(this.purchaseRequest.id)
          .subscribe({
            next: (res) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success Message',
                detail: 'Purchase Request has been deleted',
              });
              if (this.quickView) {
                this.onDeleted.emit();
              } else {
                this.location.back();
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error Message',
                detail: error.message,
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

  refresh() {
    this.isShowPurchaseRequestDetailSummary = false;
    this.purchaseRequestForm.reset();
    this.purchaseRequestForm.removeControl('purchase_request_details');
    this.purchaseRequestForm.addControl(
      'purchase_request_details',
      new FormArray([]),
    );
    this.loadData();
  }
}
