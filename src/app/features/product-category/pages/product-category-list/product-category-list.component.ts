import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Ability } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLocationDot,
  faUser,
  faPhone,
  faEye,
  faPencil,
  faTrash,
  faPlus,
  faChevronLeft,
  faRefresh,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService, MessageService, SharedModule } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil, take } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { FcFilterDialogComponent } from '../../../../shared/components/fc-filter-dialog/fc-filter-dialog.component';
import { FcFilterConfig } from '../../../../shared/components/fc-filter-dialog/interfaces/fc-filter-config';
import { FcFilterDialogService } from '../../../../shared/components/fc-filter-dialog/services/fc-filter-dialog.service';
import { DataListParameter } from '../../../../shared/interfaces/data-list-parameter.interface';
import { ProductCategory } from '../../interfaces/product-category';
import { ProductCategoryService } from '../../services/product-category.service';
import { ProductCategoryAddDialogComponent } from '../../components/product-category-add-dialog/product-category-add-dialog.component';
import { ProductCategoryEditDialogComponent } from '../../components/product-category-edit-dialog/product-category-edit-dialog.component';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product-category-list',
  imports: [
    ToastModule,
    CommonModule,
    FontAwesomeModule,
    FcActionBarComponent,
    SharedModule,
    ConfirmDialogModule,
  ],
  templateUrl: './product-category-list.component.html',
  styleUrl: './product-category-list.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class ProductCategoryListComponent {
  private readonly destroy$ = new Subject<void>();
  faLocationDot = faLocationDot;
  faUser = faUser;
  faPhone = faPhone;
  faEye = faEye;
  faPencil = faPencil;
  faTrash = faTrash;
  faPlus = faPlus;
  faChevronLeft = faChevronLeft;

  quickView = false;

  actionButtons: any[] = [
    {
      label: 'Add',
      icon: faPlus,
      action: () => {
        this.onAddCategory();
      },
      hidden: false,
    },
  ];
  filterButtons: any[] = [
    {
      label: 'Refresh',
      icon: faRefresh,
      action: () => {
        this.loadData();
      },
    },
    {
      label: 'Filter',
      icon: faFilter,
      action: () => {
        this.onFilter();
      },
    },
  ];

  fcFilterConfig: FcFilterConfig = {
    filterFields: [],
    sort: {
      fields: [{ name: 'name', header: 'Name' }],
      selectedField: 'id',
      direction: 'desc',
    },
  };

  loading: boolean = false;
  totalRecords = 0;
  totalPages = 1;
  page = 1;
  rows = 10;
  searchQuery: string = '';

  productCategories: ProductCategory[] = [];
  selectedProductCategory: ProductCategory | undefined;

  constructor(
    private layoutService: LayoutService,
    private productCategoryService: ProductCategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private fcFilterDialogService: FcFilterDialogService,
    private ability: Ability,
    private messageService: MessageService,
  ) {
    // this.actionButtons[0].hidden = !this.ability.can(
    //   'create',
    //   'product-category',
    // );
    this.layoutService.setHeaderConfig({
      title: 'Product Categories',
      icon: '',
      showHeader: true,
    });
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: any) => {
        this.page = params.page ? params.page : 1;
        this.rows = params.limit ? params.limit : 10;
        this.searchQuery = params.searchQuery ? params.searchQuery : '';
        this.layoutService.setSearchConfig({
          searchQuery: this.searchQuery,
          featureName: 'product category',
          baseHref: '/product-category/list',
        });
        if (params.order_by && params.direction) {
          this.fcFilterConfig.sort.selectedField = params.order_by;
          this.fcFilterConfig.sort.direction = params.direction;
        }
        this.fcFilterConfig.filterFields?.map((field: any) => {
          if (params[field.name]) {
            field.value = String(params[field.name]);
            if (field.type == 'object') {
              field.valueLabel = String(params[field.name + '-label']);
            }
          }
        });
        this.fcFilterConfig.filterOptions?.map((filterOption: any) => {
          if (params[filterOption.optionValue]) {
            filterOption.selectedValue = String(
              params[filterOption.optionValue],
            );
          }
        });
      });
  }

  ngOnInit(): void {
    this.loadData();
    this.layoutService.setSearchConfig({
      hide: false,
      featureName: 'product category',
    });
    this.layoutService.searchConfigSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config.featureName == 'product category') {
          if (this.searchQuery != config.searchQuery) {
            this.searchQuery = config.searchQuery;
            this.loadData();
          }
        }
      });
  }

  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setParam() {
    let queryParams: any = {
      page: this.page,
      limit: this.rows,
    };
    if (this.searchQuery) {
      queryParams.searchQuery = this.searchQuery;
    }
    if (this.fcFilterConfig.sort.selectedField) {
      queryParams.order_by = this.fcFilterConfig.sort.selectedField;
      queryParams.direction = this.fcFilterConfig.sort.direction;
    }
    // filter conditions
    this.fcFilterConfig.filterFields?.map((field: any) => {
      if (field.value) {
        queryParams[field.name] = field.value;
        if (field.type == 'object') {
          queryParams[field.name + '-label'] = field.valueLabel;
        }
      }
    });
    this.fcFilterConfig.filterOptions?.map((filterOption: any) => {
      if (filterOption.selectedValue != null) {
        queryParams[filterOption.optionValue] = filterOption.selectedValue;
      }
    });
    // end filter conditions
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
  }

  loadData(
    page: number = 0,
    searchQuery: string = this.searchQuery,
    filterObj: string = this.fcFilterDialogService.getFilterString(
      this.fcFilterConfig,
    ),
    sortBy: string = this.fcFilterDialogService.getSortString(
      this.fcFilterConfig,
    ),
  ) {
    this.setParam();
    this.loading = true;
    let dataListParameter: DataListParameter = {} as DataListParameter;
    dataListParameter.rows = this.rows;
    dataListParameter.page = this.page;
    dataListParameter.sortBy = sortBy;
    dataListParameter.filterObj = filterObj;
    dataListParameter.searchQuery = searchQuery;
    this.destroy$.next();

    this.productCategoryService
      .getProductCategories(dataListParameter)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe((res: any) => {
        let data = res.data.product_categories;
        this.handleProductCategories(data);
        this.loading = false;
      });
  }

  handleProductCategories(productCategories: ProductCategory[]) {
    // Create a map to store categories by ID
    const categoryMap: { [key: string]: ProductCategory } = {};

    // Initialize main categories in the map and add an empty subcategories array
    productCategories.forEach((category: ProductCategory) => {
      categoryMap[category.id] = { ...category, subcategories: [] };
    });

    // Link subcategories to their parent category if available
    productCategories.forEach((category: ProductCategory) => {
      if (
        category.category_parent_id !== null &&
        categoryMap[category.category_parent_id]
      ) {
        categoryMap[category.category_parent_id].subcategories.push(
          categoryMap[category.id],
        );
      }
    });

    // Store all categories, whether they have subcategories or not
    this.productCategories = productCategories.map(
      (category) => categoryMap[category.id],
    );
  }

  onPageUpdate(pagination: any) {
    let page = pagination.page;
    let rows = pagination.rows;
    this.rows = rows;
    if (page > 0) {
      this.page = page;
    } else {
      this.page = 1;
    }
    this.loadData();
  }

  onFilter() {
    const ref = this.dialogService.open(FcFilterDialogComponent, {
      data: {
        fcFilterConfig: this.fcFilterConfig,
      },
      showHeader: false,
      contentStyle: {
        padding: '0',
      },
      style: {
        overflow: 'hidden',
      },
      styleClass: 'rounded-sm',
      dismissableMask: true,
      width: '450px',
    });
    ref.onClose.subscribe((res: any) => {
      if (res) {
        this.fcFilterConfig = res;
        this.loadData();
      }
    });
  }

  onChangeProductCategory(productCategory: ProductCategory) {
    this.selectedProductCategory = productCategory;
  }
  onAddCategory(productCategory: ProductCategory | undefined = undefined) {
    const ref = this.dialogService.open(ProductCategoryAddDialogComponent, {
      data: {
        title: 'Add Category',
        productCategory: productCategory,
      },
      showHeader: false,
      contentStyle: {
        padding: '0',
      },
      style: {
        overflow: 'hidden',
      },
      styleClass: 'rounded-sm',
      dismissableMask: true,
      width: '450px',
    });
    ref.onClose.subscribe((newData) => {
      if (newData) {
        newData.subcategories = [];
        // check if has parent
        if (newData.category_parent_id) {
          // add to sub categories
          this.addSubcategory(newData);
        } else {
          // add to product categories
          this.addCategory(newData);
        }
      }
    });
  }
  addCategory(productCategory: ProductCategory) {
    this.productCategories.push(productCategory);
  }
  addSubcategory(newProductCategory: ProductCategory) {
    this.productCategories.forEach((productCategory: ProductCategory) => {
      if (productCategory.id === newProductCategory.category_parent_id) {
        productCategory.subcategories.push(newProductCategory);
      } else {
        if (productCategory.subcategories.length > 0) {
          productCategory.subcategories.forEach(
            (subCategory: ProductCategory) => {
              if (subCategory.id === newProductCategory.category_parent_id) {
                subCategory.subcategories.push(newProductCategory);
              }
            },
          );
        }
      }
    });
  }
  onEditProductCategory(productCategory: ProductCategory) {
    const ref = this.dialogService.open(ProductCategoryEditDialogComponent, {
      data: {
        title: 'Edit Category',
        productCategory: productCategory,
      },
      showHeader: false,
      contentStyle: {
        padding: '0',
      },
      style: {
        overflow: 'hidden',
      },
      styleClass: 'rounded-sm',
      dismissableMask: true,
      width: '450px',
    });
    ref.onClose.subscribe((updatedData) => {
      if (updatedData) {
        // check if has parent
        if (updatedData.category_parent_id) {
          // update to sub categories
          this.updateSubCategories(updatedData);
        } else {
          // update to product categories
          this.updateProductCategories(updatedData);
        }
      }
    });
  }
  updateProductCategories(updatedProductCategory: ProductCategory) {
    this.productCategories.forEach((productCategory: ProductCategory) => {
      if (productCategory.id === updatedProductCategory.id) {
        productCategory.name = updatedProductCategory.name;
      } else {
        if (productCategory.subcategories.length > 0) {
          // is has parent
          productCategory.subcategories.forEach(
            (subCategory: ProductCategory) => {
              if (subCategory.id === updatedProductCategory.id) {
                subCategory.name = updatedProductCategory.name;
              }
            },
          );
        }
      }
    });
  }
  updateSubCategories(updatedProductCategory: ProductCategory) {
    this.productCategories.forEach((productCategory: ProductCategory) => {
      if (productCategory.id === updatedProductCategory.category_parent_id) {
        productCategory.subcategories.forEach(
          (subCategory: ProductCategory) => {
            if (subCategory.id === updatedProductCategory.id) {
              subCategory.name = updatedProductCategory.name;
            }
          },
        );
      } else {
        if (productCategory.subcategories.length > 0) {
          productCategory.subcategories.forEach(
            (subCategory: ProductCategory) => {
              if (
                subCategory.id === updatedProductCategory.category_parent_id
              ) {
                subCategory.subcategories.forEach(
                  (subCategoryItem: ProductCategory) => {
                    if (subCategoryItem.id === updatedProductCategory.id) {
                      subCategoryItem.name = updatedProductCategory.name;
                    }
                  },
                );
              }
            },
          );
        }
      }
    });
  }
  deleteProductCategory(productCategory: ProductCategory) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this product category?',
      header: 'Delete Confirmation',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.productCategoryService
          .deleteProductCategory(productCategory.id)
          .subscribe((res) => {
            if (productCategory.category_parent_id) {
              this.productCategories.forEach(
                (productCategoryItem: ProductCategory) => {
                  if (
                    productCategoryItem.id ===
                    productCategory.category_parent_id
                  ) {
                    let deletedIndex =
                      productCategoryItem.subcategories.findIndex(
                        (subCategory: ProductCategory) =>
                          subCategory.id === productCategory.id,
                      );
                    productCategoryItem.subcategories.splice(deletedIndex, 1);
                  } else {
                    if (productCategoryItem.subcategories.length > 0) {
                      // is has parent
                      productCategoryItem.subcategories.forEach(
                        (subCategory: ProductCategory) => {
                          if (
                            subCategory.id ===
                            productCategory.category_parent_id
                          ) {
                            let deletedIndex =
                              subCategory.subcategories.findIndex(
                                (subCategory: ProductCategory) =>
                                  subCategory.id === productCategory.id,
                              );
                            subCategory.subcategories.splice(deletedIndex, 1);
                          }
                        },
                      );
                    }
                  }
                },
              );
            } else {
              let deletedIndex = this.productCategories.findIndex(
                (productCategoryItem: ProductCategory) =>
                  productCategoryItem.id === productCategory.id,
              );
              this.productCategories.splice(deletedIndex, 1);
            }
          });
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
  navigateToDetail(productCategory: ProductCategory) {
    this.router.navigate(['/product-category/view/', productCategory.id]);
  }
}
