import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UniqueComponentId } from '../fc-input-text/uniquecomponentid';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'fc-file-input',
  standalone: true,
  imports: [CommonModule, OverlayPanelModule, DialogModule, FontAwesomeModule],
  templateUrl: './fc-file-input.component.html',
  styleUrl: './fc-file-input.component.css',
})
export class FcFileInputComponent {
  @Input() multiple: boolean = false;
  @Input() accept: String = '';

  @Output() onInput: EventEmitter<any> = new EventEmitter();
  @Input() uniqueId = UniqueComponentId();
  @Input() disabled: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  @ViewChild('fileInput') fileInput: any;

  uploadFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (this.multiple) {
        let files = event.target.files;
        let selectedFiles: any = [];
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (_e) => {
            let sanitizedImg = this.sanitizer.bypassSecurityTrustUrl(
              reader.result as string,
            );
            selectedFiles.push({
              file: file,
              img_src: sanitizedImg,
            });
            if (selectedFiles.length == files.length) {
              this.onInput.emit(selectedFiles);
              if (this.fileInput) this.fileInput.nativeElement.value = '';
            }
          };
        }
      } else {
        let file = event.target.files[0];
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_e) => {
          let sanitizedImg = this.sanitizer.bypassSecurityTrustUrl(
            reader.result as string,
          );
          this.onInput.emit({
            file: file,
            img_src: sanitizedImg,
          });
        };
      }
    }
  }
  click() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }
}
