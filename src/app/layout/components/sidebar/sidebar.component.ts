import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  faChevronUp,
  faBell,
  faGear,
  faDisplay,
  faSun,
  faMoon,
  faArrowRightFromBracket,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth.service';
import { LayoutService } from '../../services/layout.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly destroy$ = new Subject<void>();
  faChevronUp = faChevronUp;
  faBell = faBell;
  faGear = faGear;
  faDisplay = faDisplay;
  faSun = faSun;
  faMoon = faMoon;
  faArrowRightFromBracket = faArrowRightFromBracket;
  faChevronLeft = faChevronLeft;

  // get user info
  user: any;

  @Input() showSidebar: boolean = true;
  @Input() hideWhenChangeRoute: boolean = true;
  @Output() onToggleSidebar: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  mainMenus: any = [];

  constructor(
    private authService: AuthService,
    private layoutService: LayoutService,
    private router: Router,
  ) {
    this.mainMenus = this.layoutService.getRoutes();
    this.authService.getCurrentUserData.subscribe((data: any) => {
      this.user = data;
    });
  }

  showUserMenu: boolean = false;
  toggleSidebar() {
    console.log('Sidebar toggled:', !this.showSidebar);
    this.onToggleSidebar.emit(!this.showSidebar);
  }

  ngOnInit(): void {
    this.checkActiveDropdownMenu();
  }
  checkActiveDropdownMenu() {
    const CUR_URL = this.router.url.split('/');
    this.mainMenus.map((mainMenu: any) => {
      if (mainMenu.parentRoute) {
        mainMenu.subMenus.forEach((subMenu: any) => {
          let route = subMenu.route.split('/')[1];
          if (CUR_URL.includes(route)) {
            mainMenu.showRoutes = true;
          }
        });
      }
    });
  }
  logout() {
    this.authService.logout();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
