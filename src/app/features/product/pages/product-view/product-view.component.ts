import {
  AfterContentInit,
  Component,
  EventEmitter,
  HostListener,
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
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PureAbility } from '@casl/ability';
import {
  faCloudArrowUp,
  faCheck,
  faTrash,
  faSpinner,
  faTimes,
  faChevronDown,
  faSave,
  faImage,
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
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product-view',
  imports: [
    CommonModule,
    FontAwesomeModule,
    ToastModule,
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
  faImage = faImage;

  private readonly destroy$: any = new Subject();
  productForm: FormGroup;
  loading = false;
  productId: any;
  selectedCategory!: ProductCategory | null;
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
  pastedImages: any = [];

  isDarkMode =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  lightInputStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    color: '#000000',
    fontSize: '12px',
    lineHeight: '1.7',
    '::placeholder': {
      color: '#9ca3af',
    },
  };

  darkInputStyle = {
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    color: '#ffffff',
    fontSize: '12px',
    lineHeight: '1.7',
    '::placeholder': {
      color: '#9ca3af',
    },
  };

  constructor(
    private layoutService: LayoutService,
    private productService: ProductService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private ability: PureAbility,
  ) {
    this.product.id = String(this.route.snapshot.paramMap.get('id'));
    this.actionButtons[0].hidden = !this.ability.can('update', 'product');
    this.actionButtons[1].hidden = !this.ability.can('delete', 'product');
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

  hasRequiredValidator(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    if (!control || !control.validator) return false;

    const validator = control.validator({} as AbstractControl);
    return validator && validator['required'];
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
          brand: this.product.brand,
          // quantity: this.product.quantity,
        });
        let imageArrayForm: FormArray = this.productForm.get(
          'product_images',
        ) as FormArray;
        while (imageArrayForm.length !== 0) {
          imageArrayForm.removeAt(0);
        }
        if (this.product.product_images) {
          this.pastedImages = this.product.product_images.map((image: any) => {
            return {
              image_url: image.url,
              id: image.id,
              is_default: image.is_default,
              sequence: image.sequence,
            };
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

  removeCategory() {
    this.selectedCategory = null;
    this.productForm.controls['product_category_id'].setValue('');
  }

  get imagesArrayForm(): FormArray {
    return this.productForm.get('product_images') as FormArray;
  }
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

          // ⬇️ Tambahkan ke FormArray
          (this.productForm.get('product_images') as FormArray).push(
            new FormGroup({
              file: new FormControl(blob),
              src: new FormControl(imageUrl),
            }),
          );
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
