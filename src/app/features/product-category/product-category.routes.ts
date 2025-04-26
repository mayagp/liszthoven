import { Routes } from '@angular/router';
import { ProductCategoryListComponent } from './pages/product-category-list/product-category-list.component';
import { ProductCategoryViewComponent } from './pages/product-category-view/product-category-view.component';

export const productCategoryRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ProductCategoryListComponent,
    data: {
      subject: 'product-category',
      action: 'read',
    },
  },
  {
    path: 'view/:id',
    component: ProductCategoryViewComponent,
    // data: {
    //   subject: 'product-category',
    //   action: 'read',
    // },
  },
  { path: 'list', component: ProductCategoryListComponent },
];
