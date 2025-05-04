import { Routes } from '@angular/router';
import { PurchaseReturnAddComponent } from './pages/purchase-return-add/purchase-return-add.component';
import { PurchaseReturnListComponent } from './pages/purchase-return-list/purchase-return-list.component';
import { PurchaseReturnViewComponent } from './pages/purchase-return-view/purchase-return-view.component';

export const purchaseReturnRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: PurchaseReturnAddComponent,
    //   data: {
    //     subject: 'product-category',
    //     action: 'read',
    //   },
  },
  {
    path: 'view/:id',
    component: PurchaseReturnViewComponent,
    // data: {
    //   subject: 'product-category',
    //   action: 'read',
    // },
  },
  { path: 'list', component: PurchaseReturnListComponent },
];
