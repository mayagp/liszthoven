import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { ProductCategory } from '../../interfaces/product-category';
import { ProductCategoryService } from '../../services/product-category.service';

@Component({
  selector: 'app-product-category-select-dialog',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './product-category-select-dialog.component.html',
  styleUrl: './product-category-select-dialog.component.css',
})
export class ProductCategorySelectDialogComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  private readonly destroy$: any = new Subject();
  // Icons
  faTimes = faTimes;
  faChevronRight = faChevronRight;

  productCategories: ProductCategory[] = [];
  activeRootCategory: any;
  selectedCategory: any;

  searchQuery: string = '';
  loading = false;
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;
  title = '';

  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    sort: {
      fields: [{ name: 'name', header: 'Name' }],
      selectedField: 'id',
      direction: 'desc',
    },
  };

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private productCategoryService: ProductCategoryService,
  ) {
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
  }

  ngOnInit(): void {
    this.loadData();
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    this.productCategoryService.getProductCategories().subscribe((res: any) => {
      this.loading = false;
      let data = res.data.product_categories;
      this.handleProductCategories(data);
    });
  }

  handleProductCategories(productCategories: ProductCategory[]) {
    // fetch product categories with their sub
    productCategories = productCategories.map(
      (productCategory: ProductCategory) => {
        productCategory.subcategories = productCategories.filter(
          (subCategory: ProductCategory) =>
            subCategory.category_parent_id === productCategory.id,
        );
        return productCategory;
      },
    );
    // filter only parent categories
    productCategories = productCategories.filter(
      (productCategory: ProductCategory) =>
        productCategory.category_parent_id === null,
    );
    this.productCategories = productCategories;
    this.onShowCategory(this.productCategories[0]);
  }

  isSubmitAllowed(): boolean {
    if (this.selectedCategory) {
      return true;
    } else {
      return false;
    }
  }

  onClose() {
    this.ref.close();
  }

  onShowCategory(category: ProductCategory) {
    this.activeRootCategory = category;
    this.onSelectCategory(category);
  }
  onSelectCategory(category: ProductCategory) {
    this.selectedCategory = category;
  }

  submit() {
    this.ref.close(this.selectedCategory);
  }
}
