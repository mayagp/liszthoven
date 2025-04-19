import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  sidebarConfig: any = {
    showSidebar: true,
    hideWhenRouteChange: false,
    overlay: true,
  };

  constructor(
    // private settingService: SettingService,
    private router: Router,
  ) {
    // this.settingService.settingConfig$.subscribe((config) => {
    //   // match with for each
    //   for (const key in config.generalConfig) {
    //     if (Object.prototype.hasOwnProperty.call(config.generalConfig, key)) {
    //       const element = config.generalConfig[key];
    //       this.sidebarConfig[key] = element;
    //     }
    //   }
    // });
    // check if sidebar is hidden when route change
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.sidebarConfig.hideWhenRouteChange) {
          this.sidebarConfig.showSidebar = false;
        }
      }
    });
  }

  ngOnInit(): void {}

  toggleSidebar(showBarStatus: boolean) {
    console.log('Toggle Sidebar:', showBarStatus);
    this.sidebarConfig.showSidebar = showBarStatus;
  }
}
