import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../user/interfaces/user';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { DataListParameter } from '../../../shared/interfaces/data-list-parameter.interface';
import { environment } from '../../../../environments/environment';
import { USER_ABILITY } from '../constants/auth.constant';

export const ROOT_API_URL = environment.API_URL;
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUserTokensSubject: BehaviorSubject<string>;
  currentUserDataSubject: BehaviorSubject<string>;
  constructor(
    private http: HttpClient,
    private router: Router,
    // private cookieService: CookieService,
    private ability: PureAbility,
  ) {
    this.currentUserTokensSubject = new BehaviorSubject(
      localStorage.getItem('access_token') || '',
    );
    console.log(localStorage.getItem('access_token'));
    this.currentUserDataSubject = new BehaviorSubject(
      JSON.parse(localStorage.getItem('user') as string),
    );
    this.updateAbility(this.currentUserDataSubject.value as unknown as User);
  }

  public get getCurrentUserTokens() {
    return this.currentUserTokensSubject.value;
  }
  public get getCurrentUserData() {
    return this.currentUserDataSubject;
  }

  login(loginData: any) {
    return this.http.post(ROOT_API_URL + '/auth/login', loginData).pipe(
      map((res: any) => {
        console.log('LOGIN RESPONSE:', res); // Tambahkan ini
        if (res.statusCode == 200) {
          localStorage.setItem('access_token', res.data.access_token);
          this.currentUserTokensSubject.next(res.data.access_token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.currentUserDataSubject.next(res.data.user);
          this.updateAbility(res.data.user);
          return true;
        } else {
          return false;
        }
      }),
    );
  }

  private updateAbility(user: User) {
    if (!user) return;

    const { can, rules } = new AbilityBuilder<PureAbility>(PureAbility);

    let roleNumber: number | undefined;

    if (user.staff) {
      roleNumber = user.staff.role;
    } else if (user.supplier) {
      roleNumber = 7;
    } else {
      this.ability.update([]);
      return;
    }

    const ability = USER_ABILITY.find((a) =>
      a.role_enums.includes(roleNumber!),
    );

    if (ability) {
      ability.abilities.forEach(([subject, action]) => {
        can(action, subject);
      });
    }

    this.ability.update(rules);
  }

  isLoggedIn() {
    if (this.currentUserTokensSubject.value) {
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserTokensSubject.next('');
    this.currentUserDataSubject.next('');
    this.router.navigate(['/auth/login']);
  }

  updateUserData(user: any) {
    this.currentUserDataSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  register(registerData: any) {
    return this.http.post(ROOT_API_URL + '/auth/register/staff', registerData);
  }

  registerSupplier(registerData: any) {
    return this.http.post(
      ROOT_API_URL + '/auth/register/supplier',
      registerData,
    );
  }
  // User Document
  getUserDocuments(userId: string, params: string) {
    return this.http.get(
      ROOT_API_URL + '/users/' + userId + `/documents?${params}`,
    );
  }

  getUserDocument(userId: number, documentId: number) {
    return this.http.get(
      ROOT_API_URL + '/users/' + userId + `/documents/${documentId}`,
    );
  }

  addUserDocument(userId: number, document: any) {
    return this.http.post(
      ROOT_API_URL + '/users/' + userId + '/documents',
      document,
    );
  }

  updateUserDocument(userId: string, documentId: string, document: any) {
    return this.http.put(
      ROOT_API_URL + '/users/' + userId + '/documents/' + documentId,
      document,
    );
  }

  updateUserDocumentFile(userId: number, document: any) {
    return this.http.put(
      ROOT_API_URL + '/users/' + userId + '/documents/image',
      document,
    );
  }

  deleteUserDocument(userId: string, documentId: string) {
    return this.http.delete(
      ROOT_API_URL + '/users/' + userId + '/documents/' + documentId,
    );
  }
}
