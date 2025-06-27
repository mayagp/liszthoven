import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../../layout/services/layout.service';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../user/interfaces/user';
import { Supplier } from '../supplier/interfaces/supplier';
import { SupplierService } from '../supplier/services/supplier.service';
import { Subject, take, takeUntil } from 'rxjs';
import { DataListParameter } from '../../shared/interfaces/data-list-parameter.interface';
import { CommonModule } from '@angular/common';
import { PurchaseOrderService } from '../purchase-order/services/purchase-order.service';
import { PurchaseRequestService } from '../purchase-request/services/purchase-request.service';
import { SupplierQuotationService } from '../supplier-quotation/services/supplier-quotation.service';
import { ProductService } from '../product/services/product.service';
import { FcFilterDialogService } from '../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly destroy$ = new Subject<void>();
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;

  loading = true;
  user!: User;
  suppliers: Supplier[] = [];

  purchaseOrders: any[] = [];
  totalPurchaseOrders = 0;

  purchaseRequests: any[] = [];
  totalPurchaseRequests = 0;
  totalPurchaseRequestBranches = 0;

  supplierQuotations: any[] = [];
  totalSupplierQuotations = 0;

  products: any[] = [];
  totalProducts = 0;

  constructor(
    private layoutService: LayoutService,
    private router: Router,
    private supplierService: SupplierService,
    private authService: AuthService,
    private purchaseOrderService: PurchaseOrderService,
    private purchaseRequestService: PurchaseRequestService,
    private supplierQuotationService: SupplierQuotationService,
    private productService: ProductService,
    private fcFilterDialogService: FcFilterDialogService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUserDataSubject.subscribe((rawUser) => {
      const user = rawUser as unknown as User;

      if (!user) return;

      this.user = user;

      const isStaff = !!user.staff;
      const isSupplier = !!user.supplier;

      if (isStaff && user.staff?.role !== undefined) {
        const role = user.staff.role;
        console.log('Staff role:', user.staff.role_name);

        switch (role) {
          case 0:
            break;
          case 2:
            // Purchasing staff
            this.loadDataPurchaseRequestBranch();
            this.loadDataProduct();
            break;
          case 3:
            // Purchasing head
            this.loadDataPurchaseRequest();
            this.loadDataPurchaseOrder();
            this.loadDataSupplier();
            this.loadDataSupplierQuotation();
            break;
          default:
            break;
        }
      } else if (isSupplier) {
        // Jika user adalah supplier
        this.loadDataSupplierQuotation();
        this.loadDataPurchaseOrder();
      }
    });
  }

  loadDataSupplier(page: number = 0) {
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    this.supplierService
      .getSuppliers(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.totalRecords = res.data.count;
        this.totalPages =
          this.totalRecords > this.rows
            ? Math.ceil(this.totalRecords / this.rows)
            : 1;
        this.suppliers = res.data.suppliers;
      });
  }

  loadDataPurchaseOrder(page: number = 0) {
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    this.purchaseOrderService
      .getPurchaseOrders(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.totalPurchaseOrders = res.data.count;
        this.totalPages =
          this.totalRecords > this.rows
            ? Math.ceil(this.totalRecords / this.rows)
            : 1;
        this.purchaseOrders = res.data.purchase_orders;
      });
  }

  loadDataPurchaseRequest(page: number = 0) {
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    this.purchaseRequestService
      .getPurchaseRequests(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.totalPurchaseRequests = res.data.count;
        this.totalPages =
          this.totalRecords > this.rows
            ? Math.ceil(this.totalRecords / this.rows)
            : 1;
        this.purchaseRequests = res.data.purchase_requests;
      });
  }

  loadDataPurchaseRequestBranch(page: number = 0) {
    this.loading = true;
    this.layoutService.setSearchConfig({
      loading: true,
    });

    const branchFilter = `branch_id=${this.user?.staff?.branch_id ?? ''}`;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.filterObj = branchFilter;

    this.destroy$.next();
    this.purchaseRequestService
      .getPurchaseRequests(dataListParameter)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.totalPurchaseRequestBranches = res.data.count;
          this.totalPages =
            this.totalRecords > this.rows
              ? Math.ceil(this.totalRecords / this.rows)
              : 1;
          this.purchaseRequests = res.data.purchase_requests;
          this.loading = false;
          this.layoutService.setSearchConfig({
            loading: false,
          });
        },
        error: (err: any) => {
          this.loading = false;
          this.layoutService.setSearchConfig({
            loading: false,
          });
        },
      });
  }

  loadDataSupplierQuotation(page: number = 0) {
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    this.supplierQuotationService
      .getSupplierQuotations(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.totalSupplierQuotations = res.data.count;
        this.totalPages =
          this.totalRecords > this.rows
            ? Math.ceil(this.totalRecords / this.rows)
            : 1;
        this.supplierQuotations = res.data.supplier_quotations;
      });
  }

  loadDataProduct(page: number = 0) {
    this.loading = true;

    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    this.productService
      .getProducts(dataListParameter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.totalProducts = res.data.count;
        this.totalPages =
          this.totalRecords > this.rows
            ? Math.ceil(this.totalRecords / this.rows)
            : 1;
        this.products = res.data.products;
      });
  }

  navigatePurchaseOrder() {
    this.router.navigate(['/purchase-order/list']);
  }

  navigatePurchaseRequest() {
    this.router.navigate(['/purchase-request/list']);
  }
  navigateSupplierQuotation() {
    this.router.navigate(['/supplier-quotation/list']);
  }
  navigateProduct() {
    this.router.navigate(['/product/list']);
  }
}
