import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth.guard';
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent, // Tambahkan LayoutComponent
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        component: DashboardComponent,
      },
      {
        path: 'staff',
        loadChildren: () =>
          import('../features/staff/staff.routes').then((m) => m.staffRoutes),
      },
      {
        path: 'branch',
        loadChildren: () =>
          import('../features/branch/branch.routes').then(
            (m) => m.branchRoutes,
          ),
      },
      {
        path: 'warehouse',
        loadChildren: () =>
          import('../features/warehouse/warehouse.routes').then(
            (m) => m.warehouseRoutes,
          ),
      },
      {
        path: 'product',
        loadChildren: () =>
          import('../features/product/product.routes').then(
            (m) => m.productRoutes,
          ),
      },
      {
        path: 'product-category',
        loadChildren: () =>
          import('../features/product-category/product-category.routes').then(
            (m) => m.productCategoryRoutes,
          ),
      },
      {
        path: 'stock-movement',
        loadChildren: () =>
          import('../features/stock-movement/stock-movement.routes').then(
            (m) => m.stockMovementRoutes,
          ),
      },
      {
        path: 'supplier',
        loadChildren: () =>
          import('../features/supplier/supplier.routes').then(
            (m) => m.supplierRoutes,
          ),
      },
      {
        path: 'supplier-quotation',
        loadChildren: () =>
          import(
            '../features/supplier-quotation/supplier-quotation.routes'
          ).then((m) => m.supplierQuotationRoutes),
      },
      {
        path: 'purchase-request',
        loadChildren: () =>
          import('../features/purchase-request/purchase-request.routes').then(
            (m) => m.purchaseRequestRoutes,
          ),
      },
      {
        path: 'purchase-order',
        loadChildren: () =>
          import('../features/purchase-order/purchase-order.routes').then(
            (m) => m.purchaseOrderRoutes,
          ),
      },
      {
        path: 'purchase-invoice',
        loadChildren: () =>
          import('../features/purchase-invoice/purchase-invoice.routes').then(
            (m) => m.purchaseInvoiceRoutes,
          ),
      },
      {
        path: 'purchase-payment',
        loadChildren: () =>
          import('../features/purchase-payment/purchase-payment.routes').then(
            (m) => m.purchasePaymentRoutes,
          ),
      },
      {
        path: 'purchase-return',
        loadChildren: () =>
          import('../features/purchase-return/purchase-return.routes').then(
            (m) => m.purchaseReturnRoutes,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
