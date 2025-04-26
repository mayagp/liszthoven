import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { ProductCategoryService } from '../../services/product-category.service';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';

@Component({
  selector: 'app-product-category-add-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FcInputTextComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './product-category-add-dialog.component.html',
  styleUrl: './product-category-add-dialog.component.css',
})
export class ProductCategoryAddDialogComponent {
  private readonly destroy$: any = new Subject();

  faTimes = faTimes;
  faSpinner = faSpinner;

  title = 'Add Product Category';
  productCategory: any = {};
  productCategoryForm: FormGroup;
  loading = false;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private productCategoryService: ProductCategoryService,
  ) {
    if (this.config.data.productCategory) {
      this.productCategory = this.config.data.productCategory;
    }
    if (this.config.data.title) {
      this.title = this.config.data.title;
    }
    this.productCategoryForm = new FormGroup({
      name: new FormControl('', Validators.required),
      category_parent_id: new FormControl(this.productCategory.id || null),
    });
  }

  ngOnInit(): void {}
  ngAfterContentInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose() {
    this.ref.close();
  }
  submit() {
    this.loading = true;
    this.productCategoryService
      .addProductCategory(this.productCategoryForm.value)
      .subscribe((res: any) => {
        this.ref.close(res.data);
      });
  }
}
