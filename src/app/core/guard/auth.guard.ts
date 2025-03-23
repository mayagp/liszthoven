import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  currentUserTokens: string = '';
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.currentUserTokens = this.authService.getCurrentUserTokens;
    if (this.currentUserTokens) {
      return true;
    }
    this.router.navigate(['/auth/login']);
    return false;
  }
}
