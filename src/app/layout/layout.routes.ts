import { Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth.guard';
import { DashboardComponent } from '../features/dashboard/dashboard.component';

export const layoutRoutes: Routes = [
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default ke login
];
