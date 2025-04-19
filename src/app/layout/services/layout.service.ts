import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeaderConfig } from '../interfaces/header-config';
import { isPlatformBrowser } from '@angular/common';
import { Ability } from '@casl/ability';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  isMobileSubject: BehaviorSubject<any>;

  headerConfigSubject = new BehaviorSubject<HeaderConfig>({
    title: '',
    icon: '',
    showHeader: true,
  });
  searchConfigSubject = new BehaviorSubject<any>({
    showSearch: false,
    searchPlaceholder: '',
    searchQuery: '',
    featureName: '',
  });

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ability: Ability,
  ) {
    this.isMobileSubject = new BehaviorSubject(
      Boolean(this.deviceType == 'mobile'),
    );
  }
  get deviceType(): string {
    if (isPlatformBrowser(this.platformId)) {
      const ua = window.navigator.userAgent;
      if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
          ua,
        )
      ) {
        return 'mobile';
      }
      return 'desktop';
    } else {
      return '';
    }
  }
  public get isMobile$() {
    return this.isMobileSubject;
  }

  setHeaderConfig(config: HeaderConfig) {
    this.headerConfigSubject.next({
      ...this.headerConfigSubject.value,
      ...config,
    });
  }
  setSearchConfig(config: any) {
    this.searchConfigSubject.next({
      ...this.searchConfigSubject.value,
      ...config,
    });
  }

  getRoutes() {
    return [
      {
        route: '/dashboard',
        icon_path_light: 'images/sidebar-icon/black/dashboard.png',
        icon_path_dark: 'images/sidebar-icon/white/dashboard.png',
        name: 'Dashboard',
        visible: true,
      },
      {
        icon_path_light: 'images/sidebar-icon/black/supplier.png',
        icon_path_dark: 'images/sidebar-icon/white/supplier.png',
        route: '/supplier',
        name: 'Supplier',
        visible: this.ability.can('read', 'supplier'),
      },
      {
        icon_path_light: 'images/sidebar-icon/black/staff.png',
        icon_path_dark: 'images/sidebar-icon/white/staff.png',
        route: '/staff',
        name: 'Staff',
        // visible: this.ability.can('read', 'staff'),
        visible: true,
      },
      {
        icon_path_light: 'images/sidebar-icon/black/warehouse.png',
        icon_path_dark: 'images/sidebar-icon/white/warehouse.png',
        route: '/warehouse',
        name: 'Warehouse',
        visible: this.ability.can('read', 'warehouse'),
      },
      {
        icon_path_light: 'images/sidebar-icon/black/student.png',
        icon_path_dark: 'images/sidebar-icon/white/student.png',
        route: '/branch',
        name: 'Branch',
        visible: true,
      },
    ];
  }
}
