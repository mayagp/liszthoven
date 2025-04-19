// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
// } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { Observable, throwError } from 'rxjs';
// import { catchError, retry } from 'rxjs/operators';
// import { AuthService } from '../../features/auth/services/auth.service';

// @Injectable()
// export class ErrorInterceptor implements HttpInterceptor {
//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     //   private fcToastService: FcToastService
//   ) {}
//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler,
//   ): Observable<HttpEvent<any>> {
//     return next.handle(req).pipe(
//       retry(1),
//       catchError((e) => {
//         if (e.status == 400) {
//           // this.fcToastService.clear();
//           let messages = '';
//           if (e.error.response instanceof Object) {
//             e.error.response.message.forEach((message: any) => {
//               messages += message + '<br/>';
//             });
//           } else {
//             messages = e.error.response;
//           }
//           // this.fcToastService.add({
//           //   severity: 'error',
//           //   header: e.error.message,
//           //   message: messages,
//           // });
//         } else if (e.status == 401) {
//           // clear local storage
//           localStorage.removeItem('access_token');
//           localStorage.removeItem('user');
//           this.authService.currentUserDataSubject.next('');
//           this.authService.currentUserTokensSubject.next('');
//           this.router.navigate(['/auth/login']);
//           // this.fcToastService.add({
//           //   header: 'Login',
//           //   message: 'Your session has expired, Please login again',
//           //   lottieOption: {
//           //     path: '/assets/lotties/warning.json',
//           //     loop: false,
//           //   },
//           // });
//         } else if (e.status == 404) {
//           this.router.navigate(['/error/not-found']);
//         }
//         const error = e.error;
//         return throwError(error);
//       }),
//     );
//   }
// }

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    retry(1),
    catchError((e) => {
      if (e.status === 400) {
        // handle 400
      } else if (e.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        authService.currentUserDataSubject.next('');
        authService.currentUserTokensSubject.next('');
        router.navigate(['/auth/login']);
      } else if (e.status === 404) {
        router.navigate(['/error/not-found']);
      }

      return throwError(() => e.error);
    }),
  );
};
