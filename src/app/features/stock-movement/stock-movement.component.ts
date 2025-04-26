import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-stock-movement',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './stock-movement.component.html',
  styleUrl: './stock-movement.component.css',
})
export class StockMovementComponent {}
