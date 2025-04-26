import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ImageModule } from 'primeng/image';
import {
  faTimes,
  faRefresh,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'fc-image-preview',
  imports: [
    CommonModule,
    FontAwesomeModule,
    DialogModule,
    ImageModule,
    FormsModule,
  ],
  standalone: true,
  templateUrl: './fc-image-preview.component.html',
  styleUrl: './fc-image-preview.component.css',
})
export class FcImagePreviewComponent {
  faTimes = faTimes;
  faRefresh = faRefresh;
  faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  loading = true;

  @Input() src: string = '';
  @Input() srcError: string = '/assets/images/placeholder/error.webp';
  @Input() alt: string = '';
  @Input() width: string = '';
  @Input() height: string = '';
  @Input() actionButtons: any[] = [];
  showPreview = false;
  @Input() preview = false;

  isError = false;
  loadSuccess() {
    this.loading = false;
  }
  setErrorImg() {
    this.isError = true;
  }
  @ViewChild('imageDialog') imageDialog: any;

  handleClick() {
    if (!this.loading) {
      if (this.isError) {
        this.retry();
      } else {
        if (this.preview) {
          this.showPreview = true;
          this.imageDialog.maximized = true;
        }
      }
    }
  }
  retry() {
    this.isError = false;
  }
}
