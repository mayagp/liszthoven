import { Routes } from '@angular/router';
import { PurchaseRequestAddComponent } from './pages/purchase-request-add/purchase-request-add.component';
import { PurchaseRequestListComponent } from './pages/purchase-request-list/purchase-request-list.component';
import { PurchaseRequestViewComponent } from './pages/purchase-request-view/purchase-request-view.component';

export const purchaseRequestRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: PurchaseRequestAddComponent,
    //   data: {
    //     subject: 'product-category',
    //     action: 'read',
    //   },
  },
  {
    path: 'view/:id',
    component: PurchaseRequestViewComponent,
    // data: {
    //   subject: 'product-category',
    //   action: 'read',
    // },
  },
  { path: 'list', component: PurchaseRequestListComponent },
];
