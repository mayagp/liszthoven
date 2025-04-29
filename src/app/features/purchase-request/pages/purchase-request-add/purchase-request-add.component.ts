import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FcDirtyStateService } from '../../../../core/service/fc-dirty-state.service';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { PurchaseRequestService } from '../../services/purchase-request.service';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { MessageService } from 'primeng/api';
import { AutoNumberService } from '../../../../shared/services/auto-number.service';
import { PurchaseRequestAddDialogComponent } from '../../components/purchase-request-add-dialog/purchase-request-add-dialog.component';
import { PurchaseRequestEditDialogComponent } from '../../components/purchase-request-edit-dialog/purchase-request-edit-dialog.component';
import { BranchSelectDialogComponent } from '../../../branch/components/branch-select-dialog/branch-select-dialog.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-request-add',
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
  ],
  templateUrl: './purchase-request-add.component.html',
  styleUrl: './purchase-request-add.component.css',
  providers: [DialogService, MessageService],
})
export class PurchaseRequestAddComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faPlus = faPlus;
  faEye = faEye;
  faTrash = faTrash;
  faPencil = faPencil;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faRefresh = faRefresh;

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
  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [];

  purchaseRequestForm: FormGroup;
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private purchaseRequestService: PurchaseRequestService,
    private messageService: MessageService,
    private location: Location,
    private dialogService: DialogService,
    private autoNumberService: AutoNumberService,
    private router: Router,
    private fcDirtyStateService: FcDirtyStateService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can(
      'create',
      'purchase-request',
    );
    this.layoutService.setHeaderConfig({
      title: 'Add Purchase Request',
      icon: '',
      showHeader: true,
    });
    this.purchaseRequestForm = new FormGroup({
      business_unit: new FormControl(null, Validators.required),
      date: new FormControl(new Date(), Validators.required),
      purchase_request_details: new FormArray([]),
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.purchaseRequestDetails.value.length) {
        this.setPurchaseRequestDetailSummaryVisibility();
      }
    }, 1);
    this.generateAutoNumber();
    this.layoutService.setSearchConfig({ hide: true });
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

  get purchaseRequestDetails(): FormArray {
    return this.purchaseRequestForm.get(
      'purchase_request_details',
    ) as FormArray;
  }
  generatePurchaseRequestDetail(purchaseRequestDetail: any): FormGroup {
    return new FormGroup({
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
    ref.onClose.subscribe((newData) => {
      if (newData) {
        this.purchaseRequestDetails.push(
          this.generatePurchaseRequestDetail(newData),
        );
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
        purchaseRequestDetail:
          this.purchaseRequestDetails.controls[index].value,
      },
    });
    ref.onClose.subscribe((newData) => {
      if (newData) {
        this.purchaseRequestDetails.controls[index].patchValue(newData);
      }
    });
  }
  onRemovePurchaseRequestDetail(index: number) {
    this.purchaseRequestDetails.removeAt(index);
  }

  removeBusinessUnit() {
    this.purchaseRequestForm.controls['business_unit'].setValue('');
  }

  onSelectBusinessUnit() {
    const ref = this.dialogService.open(BranchSelectDialogComponent, {
      data: {
        title: 'Select Branch',
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

  purchaseRequestNumber: string = '';
  generateAutoNumber() {
    this.autoNumberService
      .getAutoNumberByTabel('purchase_requests')
      .subscribe((res: any) => {
        this.purchaseRequestNumber = res.latest_auto_number;
      });
  }

  back() {
    this.location.back();
  }
  submit() {
    if (this.purchaseRequestForm.invalid) {
      this.fcDirtyStateService.checkFormValidation(this.purchaseRequestForm);
      return;
    }

    this.actionButtons[0].loading = true;
    let bodyReq = structuredClone(this.purchaseRequestForm.value);
    bodyReq.purchase_request_details = bodyReq.purchase_request_details.map(
      (prd: any) => {
        return {
          product_id: prd.product.id,
          quantity: prd.quantity,
        };
      },
    );
    bodyReq.business_unit_id = bodyReq.business_unit.id;
    delete bodyReq.business_unit;

    this.purchaseRequestService.addPurchaseRequest(bodyReq).subscribe({
      next: (res: any) => {
        this.purchaseRequestForm.reset();
        this.actionButtons[0].loading = false;
        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Purchase Request',
          detail: res.message,
        });
        if (this.purchaseRequestNumber != res.data.purchase_request_no) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success Message',
            detail:
              'Purchase Request Number has been changed because of duplicate',
          });
        }
        this.router.navigateByUrl('/purchase-request/view/' + res.data.id, {
          replaceUrl: true,
        });
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
  }
}
