import { Routes } from '@angular/router';
import { GoodsReceiptViewComponent } from './pages/goods-receipt-view/goods-receipt-view.component';
import { GoodsReceiptListComponent } from './pages/goods-receipt-list/goods-receipt-list.component';
import { GoodsReceiptAddComponent } from './pages/goods-receipt-add/goods-receipt-add.component';
export const goodsReceiptRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: GoodsReceiptAddComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'create',
    // },
  },
  {
    path: 'view/:id',
    component: GoodsReceiptViewComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'read',
    // },
  },
  { path: 'list', component: GoodsReceiptListComponent },
];
