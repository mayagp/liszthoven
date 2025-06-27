import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-plan',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './purchase-plan.component.html',
  styleUrl: './purchase-plan.component.css',
})
export class PurchasePlanComponent {}
