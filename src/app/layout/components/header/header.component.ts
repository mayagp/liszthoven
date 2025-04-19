import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import {
  faCircleNotch,
  faBars,
  faUser,
  faBell,
  faCircleHalfStroke,
  faChevronDown,
  faCog,
  faPowerOff,
  faMoon,
  faSun,
  faLineChart,
  faSearch,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil, take } from 'rxjs';
import { AuthService } from '../../../features/auth/services/auth.service';
import { User } from '../../../features/user/interfaces/user';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';
import { HeaderConfig } from '../../interfaces/header-config';
import { LayoutService } from '../../services/layout.service';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    FontAwesomeModule,
    CommonModule,
    FormsModule,
    RouterModule,
    DrawerModule,
    TooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly destroy$ = new Subject<void>();

  faCircleNotch = faCircleNotch;
  faBars = faBars;
  faUser = faUser;
  faBell = faBell;
  faCircleHalfStroke = faCircleHalfStroke;
  faChevronDown = faChevronDown;
  faCog = faCog;
  faPowerOff = faPowerOff;
  faMoon = faMoon;
  faSun = faSun;
  faLineChart = faLineChart;
  faSearch = faSearch;
  faChevronLeft = faChevronLeft;

  visible: boolean = false;

  showThemes: boolean = false;
  showMenus: boolean = false;

  @Input() showSidebar: boolean = true;
  @Output() onToggleSidebar: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  headerConfig: HeaderConfig | null = null;
  searchConfig: any = {};

  menus: any = [];
  user: any = {} as User;

  constructor(
    private layoutService: LayoutService,
    private router: Router,
    private authService: AuthService,
    private title: Title,
    // private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.menus = this.layoutService.getRoutes();
    this.layoutService.headerConfigSubject.subscribe((config: any) => {
      this.headerConfig = config;
      this.title.setTitle(config.title);
    });
    this.layoutService.searchConfigSubject.subscribe((config) => {
      this.searchConfig = config;
    });
    // Get User
    this.authService.currentUserDataSubject.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
    // this.notificationService.getCurrentNotificationCount.subscribe((count) => {
    //   this.notificationsCount = count;
    // });
    // this.loadNotifications();
  }

  toggleSidebar() {
    console.log('Sidebar toggled:', !this.showSidebar);
    this.onToggleSidebar.emit(!this.showSidebar);
  }

  onSearch() {
    this.layoutService.setSearchConfig({
      searchQuery: this.searchConfig.searchQuery,
    });
  }

  onSearchEnter() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      return this.router.navigate([this.searchConfig.baseHref], {
        queryParams: {
          page: 1,
          limit: 10,
          searchQuery: this.searchConfig.searchQuery,
        },
      });
    });
  }

  logout() {
    this.authService.logout();
  }

  notificationsCount: any = 0;
  // loadNotifications() {
  //   let dataListParameter: DataListParameter = {} as DataListParameter;
  //   dataListParameter.rows = 1000;
  //   dataListParameter.page = 1;
  //   dataListParameter.sortBy = 'order_by=id';
  //   dataListParameter.filterObj = 'direction=desc';
  //   this.destroy$.next();
  //   this.notificationService
  //     .getNotifications(dataListParameter)
  //     .pipe(take(1), takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (res: any) => {
  //         this.notificationsCount = res.data.notifications.filter(
  //           (notification: any) => notification.read_at == null
  //         ).length;
  //         this.notificationService.updateNotificationCount(
  //           this.notificationsCount
  //         );
  //       },
  //       error: (err: any) => {},
  //     });
  // }
}
