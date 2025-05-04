import { Routes } from '@angular/router';
import { PurchasePaymentAddComponent } from './pages/purchase-payment-add/purchase-payment-add.component';
import { PurchasePaymentListComponent } from './pages/purchase-payment-list/purchase-payment-list.component';
import { PurchasePaymentViewComponent } from './pages/purchase-payment-view/purchase-payment-view.component';

export const purchasePaymentRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: PurchasePaymentAddComponent,
    //   data: {
    //     subject: 'product-category',
    //     action: 'read',
    //   },
  },
  {
    path: 'view/:id',
    component: PurchasePaymentViewComponent,
    // data: {
    //   subject: 'product-category',
    //   action: 'read',
    // },
  },
  { path: 'list', component: PurchasePaymentListComponent },
];
