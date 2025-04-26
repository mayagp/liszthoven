import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Ability } from '@casl/ability';
import {
  faCloudArrowUp,
  faCheck,
  faTrash,
  faSpinner,
  faTimes,
  faChevronDown,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { Product } from '../../interfaces/product';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProductCategory } from '../../../product-category/interfaces/product-category';
import { ProductCategorySelectDialogComponent } from '../../../product-category/components/product-category-select-dialog/product-category-select-dialog.component';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { FcTextareaComponent } from '../../../../shared/components/fc-textarea/fc-textarea.component';

@Component({
  selector: 'app-product-view',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    FcActionBarComponent,
    FcTextareaComponent,
    FcInputTextComponent,
    FcImagePreviewComponent,
    InputNumberModule,
    IftaLabelModule,
    SelectModule,
  ],
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.css',
  providers: [ConfirmationService, MessageService, DialogService],
})
export class ProductViewComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  // Icons
  faCloudArrowUp = faCloudArrowUp;
  faCheck = faCheck;
  faTrash = faTrash;
  faSpinner = faSpinner;
  faTimes = faTimes;
  faChevronDown = faChevronDown;

  private readonly destroy$: any = new Subject();
  productForm: FormGroup;
  loading = false;
  productId: any;
  selectedCategory!: ProductCategory | null;
  // selectedBrand!: Brand | null;
  selectedDefaultImage: any;

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
        this.softDelete();
      },
    },
  ];

  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [];

  productType: any = [
    {
      id: 0,
      name: 'Serialized',
    },
    {
      id: 1,
      name: 'Unserialized',
    },
  ];

  productStatus: any = [
    {
      id: 0,
      name: 'Status1',
    },
  ];

  productValuationMethod: any = [
    {
      id: 0,
      name: 'LIFO',
    },
    {
      id: 1,
      name: 'FIFO',
    },
  ];

  @Input() product: Product = {} as Product;
  @Input() quickView: Boolean = false;
  @Output() onDeleted = new EventEmitter();
  @Output() onUpdated = new EventEmitter();

  constructor(
    private layoutService: LayoutService,
    private productService: ProductService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private ability: Ability,
  ) {
    this.product.id = String(this.route.snapshot.paramMap.get('id'));
    // this.actionButtons[0].hidden = !this.ability.can('update', 'product');
    // this.actionButtons[1].hidden = !this.ability.can('delete', 'product');
    this.layoutService.setHeaderConfig({
      title: 'Product Detail',
      icon: '',
      showHeader: true,
    });
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      base_price: new FormControl('', Validators.required),
      status: new FormControl('', Validators.required),
      valuation_method: new FormControl('', Validators.required),
      product_category_id: new FormControl('', Validators.required),
      brand: new FormControl('', Validators.required),
      // quantity: new FormControl('', Validators.required),
      product_images: new FormArray([], Validators.required),
    });
  }

  ngOnInit(): void {
    if (!this.quickView) {
      this.loadData();
    }
    this.layoutService.setSearchConfig({ hide: true });
  }
  ngOnChanges(): void {
    if (this.product.id) {
      this.refresh();
    }
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  refresh() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.productService
      .getProduct(this.product.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.loading = false;
        this.product = res.data;
        // this.selectedBrand = this.product.brand;
        this.selectedCategory = this.product.product_category;
        this.productForm.patchValue({
          name: this.product.name,
          description: this.product.description,
          type: this.product.type,
          base_price: this.product.base_price,
          status: this.product.status,
          valuation_method: this.product.valuation_method,
          product_category_id: this.product.product_category_id,
          brand: this.product.brand.name,
          // quantity: this.product.quantity,
        });
        let imageArrayForm: FormArray = this.productForm.get(
          'product_images',
        ) as FormArray;
        while (imageArrayForm.length !== 0) {
          imageArrayForm.removeAt(0);
        }
        if (this.product.product_images) {
          // let imageArrayForm: any = this.productForm.get('product_images');
          this.product.product_images.forEach((image: any) => {
            imageArrayForm.push(
              new FormGroup({
                id: new FormControl(image.id),
                is_default: new FormControl(image.is_default),
                sequence: new FormControl(image.sequence),
                url: new FormControl(image.url),
              }),
            );
          });
        }
      });
  }

  onSelectProductCategory() {
    const ref = this.dialogService.open(ProductCategorySelectDialogComponent, {
      data: {
        title: 'Select Product Category',
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
      width: '600px',
    });
    ref.onClose.subscribe((category) => {
      if (category) {
        this.selectedCategory = category;
        this.productForm.controls['product_category_id'].setValue(
          this.selectedCategory?.id,
        );
      }
    });
  }

  // onSelectProductBrand() {
  //   const ref = this.dialogService.open(BrandSelectDialogComponent, {
  //     data: {
  //       title: 'Select Product Brand',
  //     },
  //     showHeader: false,
  //     contentStyle: {
  //       padding: '0',
  //     },
  //     style: {
  //       overflow: 'hidden',
  //     },
  //     styleClass: 'rounded-sm',
  //     dismissableMask: true,
  //     width: '450px',
  //   });
  //   ref.onClose.subscribe((brand) => {
  //     if (brand) {
  //       this.selectedBrand = brand;
  //       this.productForm.controls['brand_id'].setValue(this.selectedBrand?.id);
  //     }
  //   });
  // }

  removeCategory() {
    this.selectedCategory = null;
    this.productForm.controls['product_category_id'].setValue('');
  }

  // removeBrand() {
  //   this.selectedBrand = null;
  //   this.productForm.controls['brand_id'].setValue('');
  // }

  loadingAddImage = false;
  addMultipleImage(images: any) {
    this.loadingAddImage = true;
    let fd: FormData = new FormData();
    images.forEach((image: any, i: number) => {
      fd.append(`product_images[${i}][file]`, image.file);
      fd.append(`product_images[${i}][is_default]`, 'false');
    });

    this.productService.addProductImage(this.product.id, fd).subscribe({
      next: (res: any) => {
        this.loadingAddImage = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Product Image',
          detail: res.message,
        });
        // init productimage to form
        let imageArrayForm: any = this.productForm.get('product_images');
        const currentIds = imageArrayForm.value.map((image: any) => image.id);
        const newImages = res.data.product_images.filter(
          (value: any) => !currentIds.includes(value.id),
        );
        newImages.forEach((image: any) => {
          imageArrayForm.push(
            new FormGroup({
              id: new FormControl(image.id),
              is_default: new FormControl(image.is_default),
              sequence: new FormControl(image.sequence),
              url: new FormControl(image.url),
            }),
          );
        });
      },
      error: (err) => {
        this.loadingAddImage = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Product Image',
          detail: err.message,
        });
      },
    });
  }

  onUpdateDefaultImage(image: any) {
    let reqData = new FormGroup({
      product_images: new FormArray([
        new FormGroup({
          id: new FormControl(image.id),
          sequence: new FormControl(image.sequence),
          is_default: new FormControl(true),
        }),
      ]),
    });

    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure that you want make this product image default?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.productService
          .updateProductImage(this.product.id, reqData.value)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Product Image',
                detail: res.message,
              });
              // init productimage to form
              this.productForm.removeControl('product_images');
              this.productForm.addControl('product_images', new FormArray([]));
              let imageArrayForm: any = this.productForm.get('product_images');
              let newImageData = res.data.product_images;
              newImageData.forEach((image: any) => {
                imageArrayForm.push(
                  new FormGroup({
                    id: new FormControl(image.id),
                    is_default: new FormControl(image.is_default),
                    sequence: new FormControl(image.sequence),
                    url: new FormControl(image.url),
                  }),
                );
              });
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Product Image',
                detail: err.message,
              });
            },
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

  get imagesArrayForm(): FormArray {
    return this.productForm.get('product_images') as FormArray;
  }

  softDeleteProductImage(image: any, index: number) {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this product image?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.productService
          .softDeleteProductImage(this.product.id, image.id)
          .subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Product Image',
                detail: res.message,
              });
              this.imagesArrayForm.removeAt(index);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Product Image',
                detail: err.message,
              });
            },
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

  submit() {
    let bodyReq = structuredClone(this.productForm.value);
    delete bodyReq.product_images;
    this.actionButtons[0].loading = true;
    this.productService.updateProduct(this.product.id, bodyReq).subscribe({
      next: (res: any) => {
        this.actionButtons[0].loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Product',
          detail: res.message,
        });
      },
      error: (err) => {
        this.actionButtons[0].loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Product',
          detail: err.message,
        });
      },
    });
  }

  softDelete() {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Are you sure to delete this product ?',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.actionButtons[1].loading = true;
        this.productService.softDeleteProduct(this.product.id).subscribe({
          next: (res: any) => {
            this.actionButtons[1].loading = false;
            this.router.navigate(['/product/list']);
            this.messageService.add({
              severity: 'success',
              summary: 'Product',
              detail: res.message,
            });
          },
          error: (err) => {
            this.actionButtons[1].loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Product',
              detail: err.message,
            });
          },
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
}
