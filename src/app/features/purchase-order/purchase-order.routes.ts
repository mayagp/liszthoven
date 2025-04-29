import { Routes } from '@angular/router';
import { PurchaseOrderAddComponent } from './pages/purchase-order-add/purchase-order-add.component';
import { PurchaseOrderViewComponent } from './pages/purchase-order-view/purchase-order-view.component';
import { PurchaseOrderListComponent } from './pages/purchase-order-list/purchase-order-list.component';

export const purchaseOrderRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: PurchaseOrderAddComponent,
    //   data: {
    //     subject: 'product-category',
    //     action: 'read',
    //   },
  },
  {
    path: 'view/:id',
    component: PurchaseOrderViewComponent,
    // data: {
    //   subject: 'product-category',
    //   action: 'read',
    // },
  },
  { path: 'list', component: PurchaseOrderListComponent },
];
