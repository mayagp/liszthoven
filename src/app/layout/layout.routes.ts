import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth.guard';
import { DashboardComponent } from '../features/dashboard/dashboard.component';
import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent, // Tambahkan LayoutComponent
    children: [
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        component: DashboardComponent,
      },
      {
        path: 'staff',
        loadChildren: () =>
          import('../features/staff/staff.routes').then((m) => m.staffRoutes),
      },
      {
        path: 'branch',
        loadChildren: () =>
          import('../features/branch/branch.routes').then(
            (m) => m.branchRoutes,
          ),
      },
      {
        path: 'warehouse',
        loadChildren: () =>
          import('../features/warehouse/warehouse.routes').then(
            (m) => m.warehouseRoutes,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
