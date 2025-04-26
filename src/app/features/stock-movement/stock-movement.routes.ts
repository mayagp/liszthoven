import { Routes } from '@angular/router';
import { StockMovementAddComponent } from './pages/stock-movement-add/stock-movement-add.component';
import { StockMovementListComponent } from './pages/stock-movement-list/stock-movement-list.component';
import { StockMovementViewComponent } from './pages/stock-movement-view/stock-movement-view.component';

export const stockMovementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: StockMovementAddComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'create',
    // },
  },
  {
    path: 'view/:id',
    component: StockMovementViewComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'read',
    // },
  },
  { path: 'list', component: StockMovementListComponent },
];
