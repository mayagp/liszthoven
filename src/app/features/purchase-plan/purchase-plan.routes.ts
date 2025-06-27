import { Routes } from '@angular/router';
import { PurchasePlanAddComponent } from './pages/purchase-plan-add/purchase-plan-add.component';
import { PurchasePlanListComponent } from './pages/purchase-plan-list/purchase-plan-list.component';
import { PurchasePlanViewComponent } from './pages/purchase-plan-view/purchase-plan-view.component';

export const purchasePlanRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: PurchasePlanAddComponent,
  },
  {
    path: 'view/:id',
    component: PurchasePlanViewComponent,
  },
  { path: 'list', component: PurchasePlanListComponent },
];
