import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-product-category',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css',
})
export class ProductCategoryComponent {}
