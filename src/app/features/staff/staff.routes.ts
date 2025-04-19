import { Routes } from '@angular/router';
import { StaffListComponent } from './pages/staff-list/staff-list.component';
import { StaffAddComponent } from './pages/staff-add/staff-add.component';
import { StaffViewComponent } from './pages/staff-view/staff-view.component';

export const staffRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: StaffAddComponent,
    data: {
      subject: 'staff',
      action: 'create',
    },
  },

  {
    path: 'view/:staffId',
    component: StaffViewComponent,
    data: {
      subject: 'staff',
      action: 'read',
    },
  },
  { path: 'list', component: StaffListComponent },
];
