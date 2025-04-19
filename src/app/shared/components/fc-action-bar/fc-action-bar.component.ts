import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  faChevronDown,
  faChevronLeft,
  faCog,
  faEllipsisVertical,
  faFilter,
  faPlus,
  faRefresh,
  faSave,
  faSortAlphaUp,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-fc-action-bar',
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    PopoverModule,
    TooltipModule,
  ],
  templateUrl: './fc-action-bar.component.html',
  styleUrl: './fc-action-bar.component.css',
})
export class FcActionBarComponent {
  // fontawesome
  faPlus = faPlus;
  faTrash = faTrash;
  faSave = faSave;
  faCog = faCog;
  faChevronDown = faChevronDown;
  faFilter = faFilter;
  faSortAlphaUp = faSortAlphaUp;
  faRefresh = faRefresh;
  faEllipsisVertical = faEllipsisVertical;
  faChevronLeft = faChevronLeft;
  faSpinner = faSpinner;

  @Input() isHasBackButton = false;
  @Input() actionButtons: any[] = [];
  @Input() hiddenActionButtons: any[] = [];
  @Input() filterButtons: any[] = [];

  constructor(private location: Location) {}
  back() {
    this.location.back();
  }
  get isHasMoreButton() {
    return this.actionButtons.filter((x) => !x.hidden && !x.route).length > 0;
  }
}
