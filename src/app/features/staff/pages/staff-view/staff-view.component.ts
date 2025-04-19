import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-staff-view',
  standalone: true,
  templateUrl: './staff-view.component.html',
  styleUrl: './staff-view.component.css',
})
export class StaffViewComponent {
  value: string | undefined;
}
