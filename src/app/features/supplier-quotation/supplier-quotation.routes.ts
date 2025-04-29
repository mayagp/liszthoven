import { Routes } from '@angular/router';
import { SupplierQuotationAddComponent } from './pages/supplier-quotation-add/supplier-quotation-add.component';
import { SupplierQuotationViewComponent } from './pages/supplier-quotation-view/supplier-quotation-view.component';
import { SupplierQuotationListComponent } from './pages/supplier-quotation-list/supplier-quotation-list.component';

export const supplierQuotationRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'add',
    component: SupplierQuotationAddComponent,
    //   data: {
    //     subject: 'product-category',
    //     action: 'read',
    //   },
  },
  {
    path: 'view/:id',
    component: SupplierQuotationViewComponent,
    // data: {
    //   subject: 'product-category',
    //   action: 'read',
    // },
  },
  { path: 'list', component: SupplierQuotationListComponent },
];
