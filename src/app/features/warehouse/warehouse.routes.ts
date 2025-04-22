import { Routes } from '@angular/router';
import { WarehouseAddComponent } from './pages/warehouse-add/warehouse-add.component';
import { WarehouseListComponent } from './pages/warehouse-list/warehouse-list.component';
import { WarehouseViewComponent } from './pages/warehouse-view/warehouse-view.component';

export const warehouseRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: WarehouseAddComponent,
    data: {
      subject: 'warehouse',
      action: 'create',
    },
  },

  {
    path: 'view/:id',
    component: WarehouseViewComponent,
    data: {
      subject: 'warehouse',
      action: 'read',
    },
  },
  { path: 'list', component: WarehouseListComponent },
];
