import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPencil,
  faPlus,
  faTrash,
  faEye,
  faSave,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { Product } from '../../../product/interfaces/product';
import { ProductService } from '../../../product/services/product.service';
import { ProductCategory } from '../../interfaces/product-category';
import { ProductCategoryService } from '../../services/product-category.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcCurrencyPipe } from '../../../../shared/pipes/fc-currency.pipe';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';

@Component({
  selector: 'app-product-category-view',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    FormsModule,
    ReactiveFormsModule,
    FcCurrencyPipe,
    FcInputTextComponent,
  ],
  templateUrl: './product-category-view.component.html',
  styleUrl: './product-category-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class ProductCategoryViewComponent {
  private readonly destroy$: any = new Subject();
  faPencil = faPencil;
  faPlus = faPlus;
  faTrash = faTrash;
  faEye = faEye;

  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      action: () => {
        this.submit();
      },
    },
    {
      label: 'Delete',
      icon: faTrash,
      action: () => {
        this.onDeleteProductCategory();
      },
    },
  ];
  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [
    {
      label: '',
      icon: faRefresh,
      action: () => {
        this.loadData();
      },
    },
  ];

  productCategory: ProductCategory = {} as ProductCategory;
  products: Product[] = [];
  productsLoading = true;

  productCategoryForm: FormGroup;
  loading = false;

  constructor(
    private layoutService: LayoutService,
    private location: Location,
    private productCategoryService: ProductCategoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {
    this.layoutService.setHeaderConfig({
      title: 'Product Category Detail',
      icon: '',
      showHeader: true,
    });
    this.productCategoryForm = new FormGroup({
      name: new FormControl('', Validators.required),
      category_parent_id: new FormControl(''),
    });
    this.productCategory.id = String(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.loadData();
    this.layoutService.setSearchConfig({ hide: true });
  }

  loadData() {
    this.loading = true;
    this.productsLoading = true;
    this.productCategoryService
      .getProductCategory(this.productCategory.id)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.productCategory = res.data;
          this.productCategoryForm.patchValue(this.productCategory);
          this.loadProduct();
        },
        error: (err: any) => {
          this.loading = false;
          this.productsLoading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Product Category',
            detail: err.message,
          });
        },
      });
  }
  loadProduct() {
    let param = `with_filter=1&products-product_category_id=${this.productCategory.id}`;
    this.productService.getProductsByProductCategory(param).subscribe({
      next: (res: any) => {
        this.productsLoading = false;
        this.products = res.data.products;
      },
      error: (err: any) => {
        this.productsLoading = false;
      },
    });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }
  onDeleteProductCategory() {
    this.confirmationService.confirm({
      header: 'Delete Product Category',
      message: 'Are you sure to delete this product category?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.deleteProductCategory();
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Delete operation was cancelled',
        });
      },
    });
  }
  deleteProductCategory() {
    this.actionButtons[1].loading = true;
    this.productCategoryService
      .deleteProductCategory(this.productCategory.id)
      .subscribe({
        next: (res: any) => {
          this.actionButtons[1].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Product Category',
            detail: res.message,
          });
          this.back();
        },
        error: (err: any) => {
          this.actionButtons[1].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Product Category',
            detail: err.message,
          });
        },
      });
  }

  navigateToProductDetail(id: string) {
    this.router.navigate(['/product/view', id]);
  }

  submit() {
    this.actionButtons[0].loading = true;
    this.productCategoryService
      .updateProductCategory(
        this.productCategory.id,
        this.productCategoryForm.value,
      )
      .subscribe({
        next: (res: any) => {
          this.productCategory = res.data;
          this.productCategoryForm.patchValue(this.productCategory);
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'success',
            summary: 'Product Category',
            detail: res.message,
          });
        },
        error: (err: any) => {
          this.actionButtons[0].loading = false;
          this.messageService.clear();
          this.messageService.add({
            severity: 'error',
            summary: 'Product Category',
            detail: err.message,
          });
        },
      });
  }
  back() {
    this.location.back();
  }
}
