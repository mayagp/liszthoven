import { Routes } from '@angular/router';
import { PurchaseInvoiceAddComponent } from './pages/purchase-invoice-add/purchase-invoice-add.component';
import { PurchaseInvoiceListComponent } from './pages/purchase-invoice-list/purchase-invoice-list.component';
import { PurchaseInvoiceViewComponent } from './pages/purchase-invoice-view/purchase-invoice-view.component';

export const purchaseInvoiceRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: PurchaseInvoiceAddComponent,
    //   data: {
    //     subject: 'product-category',
    //     action: 'read',
    //   },
  },
  {
    path: 'view/:id',
    component: PurchaseInvoiceViewComponent,
    // data: {
    //   subject: 'product-category',
    //   action: 'read',
    // },
  },
  { path: 'list', component: PurchaseInvoiceListComponent },
];
