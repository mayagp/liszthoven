import { Routes } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./layout/layout.routes').then((m) => m.layoutRoutes),
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, // Default ke login
];
