import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalculator,
  faPlus,
  faTrash,
  faCheck,
  faCloudArrowUp,
  faTimes,
  faChevronDown,
  faSave,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { LayoutService } from '../../../../layout/services/layout.service';
import { ProductService } from '../../services/product.service';
import { MessageService } from 'primeng/api';
import { FcActionBarComponent } from '../../../../shared/components/fc-action-bar/fc-action-bar.component';
import { ProductCategorySelectDialogComponent } from '../../../product-category/components/product-category-select-dialog/product-category-select-dialog.component';
import { FcImagePreviewComponent } from '../../../../shared/components/fc-image-preview/fc-image-preview.component';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FcTextareaComponent } from '../../../../shared/components/fc-textarea/fc-textarea.component';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product-add',
  imports: [
    CommonModule,
    ToastModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FcActionBarComponent,
    FcTextareaComponent,
    FcInputTextComponent,
    InputNumberModule,
    IftaLabelModule,
    SelectModule,
  ],
  templateUrl: './product-add.component.html',
  styleUrl: './product-add.component.css',
  providers: [DialogService, MessageService],
})
export class ProductAddComponent
  implements OnInit, OnDestroy, AfterContentInit
{
  // Icons
  faCalculator = faCalculator;
  faPlus = faPlus;
  faTrash = faTrash;
  faCheck = faCheck;
  faCloudArrowUp = faCloudArrowUp;
  faTimes = faTimes;
  faChevronDown = faChevronDown;
  faImage = faImage;

  private readonly destroy$: any = new Subject();
  actionButtons: any[] = [
    {
      label: 'Save',
      icon: faSave,
      hidden: false,
      action: () => {
        this.submit();
      },
    },
  ];

  hiddenActionButtons: any[] = [];
  filterButtons: any[] = [];

  productForm: FormGroup;
  loading = false;
  selectedCategory: any;
  selectedBrand: any;
  selectedDefaultImage: any;

  pastedImages: any = [];

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

  constructor(
    private layoutService: LayoutService,
    private productService: ProductService,
    private dialogService: DialogService,
    private router: Router,
    private messageService: MessageService,
    private ability: PureAbility,
  ) {
    this.actionButtons[0].hidden = !this.ability.can('create', 'product');
    this.layoutService.setHeaderConfig({
      title: 'Add Product',
      icon: '',
      showHeader: true,
    });
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      type: new FormControl(0, Validators.required),
      base_price: new FormControl(0, Validators.required),
      status: new FormControl(0, Validators.required),
      valuation_method: new FormControl(0, Validators.required),
      product_category_id: new FormControl('', Validators.required),
      brand: new FormControl('', Validators.required),
      // quantity: new FormControl(0, Validators.required),
      product_images: new FormArray([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.layoutService.setSearchConfig({ hide: true });
  }
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.layoutService.setSearchConfig({ hide: false });
  }

  submit() {
    let product = this.productForm.value;

    let fd: FormData = new FormData();
    fd.append(`name`, product.name);
    fd.append(`description`, product.description);
    fd.append(`type`, product.type);
    fd.append(`base_price`, product.base_price);
    fd.append(`status`, product.status);
    fd.append(`valuation_method`, product.valuation_method);
    fd.append(`product_category_id`, product.product_category_id);
    fd.append(`brand`, product.brand.name);
    // fd.append(`quantity`, product.quantity);
    // Image
    product.product_images.forEach((image: any, i: number) => {
      fd.append(`product_images[${i}][file]`, image.file);
      if (this.selectedDefaultImage == image) {
        fd.append(`product_images[${i}][is_default]`, 'true');
      } else {
        fd.append(`product_images[${i}][is_default]`, 'false');
      }
    });
    this.actionButtons[0].loading = true;
    this.productService.addProduct(fd).subscribe({
      next: (res: any) => {
        this.productForm.reset();
        this.imagesArrayForm.reset();
        this.actionButtons[0].loading = false;
        this.router.navigate(['/product/view/' + res.data.id]);
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

  addMultipleImage(images: any) {
    images.forEach((element: any) => {
      (this.productForm.get('product_images') as FormArray).push(
        new FormGroup({
          file: new FormControl(element.file),
          src: new FormControl(element.img_src),
        }),
      );
    });
  }

  get imagesArrayForm(): FormArray {
    return this.productForm.get('product_images') as FormArray;
  }

  removeProductImage(image: any, index: number) {
    this.imagesArrayForm.removeAt(index);
    if (image == this.selectedDefaultImage) {
      this.selectedDefaultImage = '';
    }
  }

  onSelectedDefaultImage(image: any) {
    this.selectedDefaultImage = image;
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
          this.selectedCategory.id,
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
  //       this.productForm.controls['brand_id'].setValue(this.selectedBrand.id);
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

  @HostListener('document:paste', ['$event'])
  handlePaste(event: ClipboardEvent) {
    const items: any = event.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            this.readImage(blob);
          }
        }
      }
    }
  }

  @HostListener('drop', ['$event'])
  handleDrop(event: DragEvent) {
    event.preventDefault();
    const items: any = event.dataTransfer?.items;
    if (items) {
      for (const item of items) {
        if (item.kind === 'file' && item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            this.readImage(file);
          }
        }
      }
    }
  }

  @HostListener('dragover', ['$event'])
  handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private readImage(blob: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageUrl = e.target?.result;
      if (imageUrl) {
        const imageObject = {
          file: blob,
          image_url: imageUrl,
        };
        if (
          !this.pastedImages.some((image: any) => image.image_url === imageUrl)
        ) {
          this.pastedImages.push(imageObject);
        }
      }
    };
    reader.readAsDataURL(blob);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        this.readImage(file);
      });
    }
  }

  removeImage(event: any, index: number) {
    event.stopPropagation();
    this.pastedImages.splice(index, 1);
  }
}
