import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeaderConfig } from '../interfaces/header-config';
import { isPlatformBrowser } from '@angular/common';
import { PureAbility } from '@casl/ability';

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
    private ability: PureAbility,
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
        icon_path_light: 'images/sidebar-icon/black/student.png',
        icon_path_dark: 'images/sidebar-icon/white/student.png',
        route: '/branch',
        name: 'Branch',
        visible: true,
      },
      {
        icon_path_light: 'images/sidebar-icon/black/warehouse.png',
        icon_path_dark: 'images/sidebar-icon/white/warehouse.png',
        route: '/warehouse',
        name: 'Warehouse',
        visible: true,
      },
      {
        icon_path_light: 'images/sidebar-icon/black/product.png',
        icon_path_dark: 'images/sidebar-icon/white/product.png',
        name: 'Product',
        parentRoute: 'report',
        showRoutes: false,
        visible: true,
        subMenus: [
          {
            name: 'Product List',
            route: '/product',
            visible: true,
          },
          {
            name: 'Product Category',
            route: '/product-category',
            visible: true,
          },
          {
            name: 'Product Stock Movement',
            route: '/stock-movement',
            visible: true,
          },
        ],
      },
      {
        icon_path_light: 'images/sidebar-icon/black/supplier.png',
        icon_path_dark: 'images/sidebar-icon/white/supplier.png',
        route: '/supplier',
        name: 'Supplier',
        visible: true,
      },
      {
        icon_path_light: 'images/sidebar-icon/black/purchase.png',
        icon_path_dark: 'images/sidebar-icon/white/purchase.png',
        name: 'Purchase',
        parentRoute: 'purchase',
        showRoutes: false,
        visible: true,
        // this.ability.can('read', 'purchase-plan') ||
        // this.ability.can('read', 'purchase-request') ||
        // this.ability.can('read', 'supplier-quotation') ||
        // this.ability.can('read', 'purchase-order') ||
        // this.ability.can('read', 'purchase-invoice') ||
        // this.ability.can('read', 'goods-receipt') ||
        // this.ability.can('read', 'purchase-payment') ||
        // this.ability.can('read', 'purchase-return') ||
        // this.ability.can('read', 'purchase-note'),
        subMenus: [
          // {
          //   name: 'Purchase Plan',
          //   route: '/purchase-plan',
          //   visible: true,
          // },
          {
            name: 'Purchase Request',
            route: '/purchase-request',
            visible: true,
          },
          {
            name: 'Supplier Quotation',
            route: '/supplier-quotation',
            visible: true,
          },
          {
            name: 'Purchase Order',
            route: '/purchase-order',
            visible: this.ability.can('read', 'purchase-order'),
          },
          {
            name: 'Purchase Invoice',
            route: '/purchase-invoice',
            visible: this.ability.can('read', 'purchase-invoice'),
          },
          // {
          //   name: 'Goods Receipt',
          //   route: '/goods-receipt',
          //   visible: this.ability.can('read', 'goods-receipt'),
          // },
          {
            name: 'Purchase Payment',
            route: '/purchase-payment',
            visible: this.ability.can('read', 'purchase-payment'),
          },
          {
            name: 'Purchase Return',
            route: '/purchase-return',
            visible: this.ability.can('read', 'purchase-return'),
          },
          // {
          //   name: 'Purchase Note',
          //   route: '/purchase-note',
          //   visible: this.ability.can('read', 'purchase-note'),
          // },
        ],
      },
    ];
  }
}
