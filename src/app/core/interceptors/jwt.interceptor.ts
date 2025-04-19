// import {
//   HttpEvent,
//   HttpHandler,
//   HttpInterceptor,
//   HttpRequest,
// } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { AuthService } from '../../features/auth/services/auth.service';

// @Injectable()
// export class JWTInterceptor implements HttpInterceptor {
//   constructor(private authService: AuthService) {}

//   intercept(
//     req: HttpRequest<any>,
//     next: HttpHandler,
//   ): Observable<HttpEvent<any>> {
//     const currentUserTokens = this.authService.getCurrentUserTokens;
//     const user: any = this.authService.getCurrentUserData;
//     let headers;
//     if (currentUserTokens && currentUserTokens) {
//       headers = req.headers.set('Authorization', `Bearer ${currentUserTokens}`);
//     }

//     // const headerstest = new Headers({
//     //   Authorization: `Bearer ${currentUserTokens}`,
//     //   'Cache-Control': 'no-cache, no-store, must-revalidate',
//     //   Pragma: 'no-cache',
//     //   Expires: '0',
//     // });

//     // const requestOptions = {
//     //   method: 'GET', // or 'POST', 'PUT', etc.
//     //   headers: headerstest,
//     //   // Other options like body, mode, credentials, etc. can be added here
//     // };

//     // fetch(
//     //   `https://api.liszthoven.id/api/v1/admin/course-schedules?with_filter=1&date_start=2023-10-29T00:00:00+07:00&date_end=2023-12-03T00:00:00+07:00`,
//     //   requestOptions
//     // )
//     //   .then((response) => {
//     //     console.log(response);
//     //     // Handle the response here
//     //   })
//     //   .catch((error) => {
//     //     // Handle errors here
//     //   });
//     const authReq = req.clone({ headers });
//     return next.handle(authReq);
//   }
// }

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../features/auth/services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getCurrentUserTokens;

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
