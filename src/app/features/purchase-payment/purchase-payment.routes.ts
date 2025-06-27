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
  },
  {
    path: 'view/:id',
    component: PurchasePaymentViewComponent,
  },
  { path: 'list', component: PurchasePaymentListComponent },
];
