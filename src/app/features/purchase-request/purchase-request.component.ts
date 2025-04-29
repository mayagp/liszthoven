import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-purchase-request',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './purchase-request.component.html',
  styleUrl: './purchase-request.component.css',
})
export class PurchaseRequestComponent {}
