import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subject } from 'rxjs';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { Product } from '../../../product/interfaces/product';
import { PurchaseRequestDetail } from '../../interfaces/purchase-request';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-request-edit-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    IftaLabelModule,
    ToastModule,
  ],
  templateUrl: './purchase-request-edit-dialog.component.html',
  styleUrl: './purchase-request-edit-dialog.component.css',
  providers: [MessageService],
})
export class PurchaseRequestEditDialogComponent {
  private readonly destroy$: any = new Subject();

  faTimes = faTimes;
  faSpinner = faSpinner;

  title = 'Add Purchase Request';
  purchaseRequestDetail: PurchaseRequestDetail = {} as PurchaseRequestDetail;
  purchaseRequestDetailForm: FormGroup;
  currentProducts: Product[] = [];

  loading = false;
  searchQuery: string = '';
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService,
  ) {
    this.purchaseRequestDetailForm = new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity: new FormControl(null, [Validators.required, Validators.min(1)]),
    });
    if (this.config.data) {
      if (this.config.data.title) {
        this.title = this.config.data.title;
      }
      if (this.config.data.purchaseRequestDetail) {
        this.purchaseRequestDetail = this.config.data.purchaseRequestDetail;
        this.purchaseRequestDetailForm.patchValue(this.purchaseRequestDetail);
      }
    }
  }

  ngOnInit(): void {}
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose() {
    this.ref.close();
  }
  submit() {
    if (this.purchaseRequestDetailForm.valid) {
      this.ref.close(this.purchaseRequestDetailForm.value);
    } else {
      this.messageService.add({
        severity: 'warning',
        summary: 'Purchase Request Detail',
        detail: 'Please fill in all required fields.',
      });
    }
  }
}
