import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FcInputTextComponent } from '../../../../shared/components/fc-input-text/fc-input-text.component';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { ProductCategoryService } from '../../services/product-category.service';

@Component({
  selector: 'app-product-category-edit-dialog',
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    FcInputTextComponent,
  ],
  templateUrl: './product-category-edit-dialog.component.html',
  styleUrl: './product-category-edit-dialog.component.css',
})
export class ProductCategoryEditDialogComponent {
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
      name: new FormControl(this.productCategory.name, Validators.required),
      category_parent_id: new FormControl(
        this.productCategory.category_parent_id || null,
      ),
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
      .updateProductCategory(
        this.productCategory.id,
        this.productCategoryForm.value,
      )
      .subscribe((res: any) => {
        this.ref.close(res.data);
      });
  }
}
