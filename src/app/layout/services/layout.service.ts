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
  getRoutes(roleId: number) {
    const branchAdminRoles = [0, 3];
    const isBranchAdmin = branchAdminRoles.includes(roleId);
    let routes: any[] = [
      {
        route: '/dashboard',
        icon_path_light: 'images/sidebar-icon/black/dashboard.png',
        icon_path_dark: 'images/sidebar-icon/white/dashboard.png',
        name: 'Dashboard',
        visible: true,
      },
      {
        icon_path_light: 'images/sidebar-icon/black/student.png',
        icon_path_dark: 'images/sidebar-icon/white/student.png',
        route: '/branch',
        name: 'Branch',
        visible: this.ability.can('read', 'branch'),
      },
      {
        icon_path_light: 'images/sidebar-icon/black/staff.png',
        icon_path_dark: 'images/sidebar-icon/white/staff.png',
        route: '/staff',
        name: 'Staff',
        visible: this.ability.can('read', 'staff'),
      },
      {
        icon_path_light: 'images/sidebar-icon/black/warehouse.png',
        icon_path_dark: 'images/sidebar-icon/white/warehouse.png',
        route: '/warehouse',
        name: 'Warehouse',
        visible: this.ability.can('read', 'warehouse'),
      },
      {
        icon_path_light: 'images/sidebar-icon/black/supplier.png',
        icon_path_dark: 'images/sidebar-icon/white/supplier.png',
        route: '/supplier',
        name: 'Supplier',
        visible: this.ability.can('read', 'supplier'),
      },
    ];

    if (isBranchAdmin) {
      routes.push(
        {
          icon_path_light: 'images/sidebar-icon/black/product.png',
          icon_path_dark: 'images/sidebar-icon/white/product.png',
          name: 'Product',
          parentRoute: 'report',
          showRoutes: true,
          visible:
            this.ability.can('read', 'product') ||
            this.ability.can('read', 'stock-movement') ||
            this.ability.can('read', 'product-category'),
          subMenus: [
            {
              name: 'Product List',
              route: '/product',
              visible: this.ability.can('read', 'product'),
            },
            {
              name: 'Product Category',
              route: '/product-category',
              visible: this.ability.can('read', 'product-category'),
            },
            {
              name: 'Product Stock Movement',
              route: '/stock-movement',
              visible: this.ability.can('read', 'stock-movement'),
            },
          ],
        },
        {
          icon_path_light: 'images/sidebar-icon/black/purchase.png',
          icon_path_dark: 'images/sidebar-icon/white/purchase.png',
          name: 'Purchase',
          parentRoute: 'purchase',
          showRoutes: true,
          visible:
            this.ability.can('read', 'purchase-plan') ||
            this.ability.can('read', 'purchase-request') ||
            this.ability.can('read', 'supplier-quotation') ||
            this.ability.can('read', 'purchase-order') ||
            this.ability.can('read', 'purchase-invoice') ||
            this.ability.can('read', 'purchase-payment') ||
            this.ability.can('read', 'goods-receipt'),
          // this.ability.can('read', 'purchase-return'),
          subMenus: [
            {
              name: 'Purchase Plan',
              route: '/purchase-plan',
              visible: this.ability.can('read', 'purchase-plan'),
            },
            {
              name: 'Purchase Request',
              route: '/purchase-request',
              visible: this.ability.can('read', 'purchase-request'),
            },
            {
              name: 'Supplier Quotation',
              route: '/supplier-quotation',
              visible: this.ability.can('read', 'supplier-quotation'),
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
            {
              name: 'Purchase Payment',
              route: '/purchase-payment',
              visible: this.ability.can('read', 'purchase-payment'),
            },
            {
              name: 'Goods Receipt',
              route: '/goods-receipt',
              visible: this.ability.can('read', 'goods-receipt'),
            },
          ],
        },
      );
    } else {
      const flattened = [
        {
          route: '/product',
          icon_path_light: 'images/sidebar-icon/black/product.png',
          icon_path_dark: 'images/sidebar-icon/white/product.png',
          name: 'Product',
          visible: this.ability.can('read', 'product'),
        },
        {
          route: '/purchase-request',
          icon_path_light: 'images/sidebar-icon/black/purchase.png',
          icon_path_dark: 'images/sidebar-icon/white/purchase.png',
          name: 'Purchase Request',
          visible: this.ability.can('read', 'purchase-request'),
        },
      ];

      routes.push(...flattened.filter((menu) => menu.visible));
    }

    return routes;
  }
}
