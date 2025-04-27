import { Routes } from '@angular/router';
import { SupplierAddComponent } from './pages/supplier-add/supplier-add.component';
import { SupplierListComponent } from './pages/supplier-list/supplier-list.component';
import { SupplierViewComponent } from './pages/supplier-view/supplier-view.component';

export const supplierRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: SupplierAddComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'create',
    // },
  },
  {
    path: 'view/:id',
    component: SupplierViewComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'read',
    // },
  },
  { path: 'list', component: SupplierListComponent },
];
