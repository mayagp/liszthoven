import { Routes } from '@angular/router';
import { BranchListComponent } from './pages/branch-list/branch-list.component';
import { BranchAddComponent } from './pages/branch-add/branch-add.component';
import { BranchViewComponent } from './pages/branch-view/branch-view.component';
export const branchRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: BranchAddComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'create',
    // },
  },
  {
    path: 'view/:id',
    component: BranchViewComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'read',
    // },
  },
  { path: 'list', component: BranchListComponent },
];
