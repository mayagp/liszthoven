import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { PurchaseInvoice } from '../../../purchase-invoice/interfaces/purchase-invoice';
import { PurchaseInvoiceService } from '../../../purchase-invoice/services/purchase-invoice.service';
import { User } from '../../../user/interfaces/user';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ScrollerModule } from 'primeng/scroller';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-purchase-payment-detail-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FcCurrencyPipe,
    IftaLabelModule,
    InputNumberModule,
    ScrollerModule,
    SkeletonModule,
  ],
  templateUrl: './purchase-payment-detail-add-dialog.component.html',
  styleUrl: './purchase-payment-detail-add-dialog.component.css',
})
export class PurchasePaymentDetailAddDialogComponent {
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faRefresh = faRefresh;

  purchaseInvoices: PurchaseInvoice[] = [];

  searchQuery: string = '';
  loading = false;
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;
  title = '';

  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    sort: {
      fields: [{ name: 'name', header: 'Name' }],
      selectedField: 'id',
      direction: 'desc',
    },
  };

  purchasePaymentDetailForm: FormGroup;
  purchasePaymentDetails: any[] = [];
  supplier: any;
  user!: User;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private purchaseInvoiceService: PurchaseInvoiceService,
    private fcFilterDialogService: FcFilterDialogService,
    private authService: AuthService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
    if (this.config.data.purchasePaymentDetails) {
      this.purchasePaymentDetails = structuredClone(
        this.config.data.purchasePaymentDetails,
      );
    }
    if (this.config.data.supplier) {
      this.supplier = this.config.data.supplier;
    }

    this.authService.getCurrentUserData.subscribe((data: any) => {
      this.user = data;
    });

    this.purchasePaymentDetailForm = new FormGroup({
      purchase_invoice: new FormControl(null),
      amount_allocated: new FormControl(0),
    });
  }

  ngOnInit(): void {
    this.loadData();
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setParam() {
    let queryParams: any = {
      page: this.page,
      limit: this.rows,
    };
    if (this.searchQuery) {
      queryParams.searchQuery = this.searchQuery;
    }
  }

  loadData(
    page: number = 0,
    searchQuery: string = this.searchQuery,
    filterObj: string = this.fcFilterDialogService.getFilterString(
      this.fcFilterConfig,
    ),
    sortBy: string = this.fcFilterDialogService.getSortString(
      this.fcFilterConfig,
    ),
    append: boolean = false,
  ) {
    this.setParam();
    this.loading = true;
    const filterBusinessUnit = this.user.staff.business_units.reduce(
      (x, businessUnit, index) => {
        return (x += `&business_unit_id[${index}]=${businessUnit.id}`);
      },
      '',
    );
    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.sortBy = sortBy;
    dataListParameter.filterObj =
      filterObj + `status=2&with_filter=1${filterBusinessUnit}`;
    if (this.supplier.id) {
      dataListParameter.filterObj += `&supplier_id=${this.supplier.id}`;
    }
    dataListParameter.searchQuery = searchQuery;
    this.destroy$.next();
    this.purchaseInvoiceService
      .getPurchaseInvoices(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        // Jika append true, gabungkan data baru dengan data lama
        if (append) {
          this.purchaseInvoices = [
            ...this.purchaseInvoices,
            ...res.data.purchase_invoices,
          ];
        } else {
          // Jika append false, update dengan data baru (misalnya pada halaman pertama)
          this.purchaseInvoices = res.data.purchase_invoices;
        }
        // check if product is already added then status exist
        this.purchaseInvoices.forEach((purchaseInvoice: any) => {
          let purchasePaymentDetailInvoice = this.purchasePaymentDetails.find(
            (purchasePaymentDetail: any) =>
              purchasePaymentDetail.purchase_invoice.id === purchaseInvoice.id,
          );
          if (purchasePaymentDetailInvoice) {
            purchaseInvoice.exist = true;
          }
        });
      });
  }

  onScroll(event: any) {
    const bottom =
      event.target.scrollHeight - event.target.scrollTop <=
      event.target.clientHeight + 10;

    if (bottom && !this.loading && this.page < this.totalPages) {
      this.page++;
      this.loadData(
        this.page,
        this.searchQuery,
        this.fcFilterDialogService.getFilterString(this.fcFilterConfig),
        this.fcFilterDialogService.getSortString(this.fcFilterConfig),
        true, // append = true
      );
    }
  }

  onPageUpdate(pagination: any) {
    let page = pagination.page;
    let rows = pagination.rows;
    this.rows = rows;
    if (page > 0) {
      this.page = page;
    } else {
      this.page = 1;
    }
    this.loadData(this.page);
  }

  search() {
    this.page = 1;
    this.loadData(this.page);
  }

  onSelectPurchaseInvoice(purchaseInvoice: PurchaseInvoice) {
    this.purchasePaymentDetailForm.patchValue({
      purchase_invoice: purchaseInvoice,
      amount_allocated: Number(purchaseInvoice.remaining_amount),
    });
  }
  onRemovePurchaseInvoice() {
    this.purchasePaymentDetailForm.reset();
  }
  submit() {
    this.ref.close(this.purchasePaymentDetailForm.value);
  }
  onClose() {
    this.ref.close();
  }
}
