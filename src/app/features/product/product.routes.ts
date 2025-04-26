import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductAddComponent } from './pages/product-add/product-add.component';
import { ProductViewComponent } from './pages/product-view/product-view.component';

export const productRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: ProductAddComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'create',
    // },
  },
  {
    path: 'view/:id',
    component: ProductViewComponent,
    // data: {
    //   subject: 'branch',
    //   action: 'read',
    // },
  },
  { path: 'list', component: ProductListComponent },
];
