import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-payment',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './purchase-payment.component.html',
  styleUrl: './purchase-payment.component.css',
})
export class PurchasePaymentComponent {}
