import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MessageService } from 'primeng/api';
import { Ability, PureAbility } from '@casl/ability';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log('Dark mode active?', prefersDark); // Ini sekarang pasti muncul

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    { provide: APP_BASE_HREF, useValue: '/' },
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    importProvidersFrom(
      ReactiveFormsModule,
      ToastModule,
      InputTextModule,
      ButtonModule,
      FontAwesomeModule,
      ConfirmDialogModule,
    ),
    MessageService,
    Ability,
    PureAbility,
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          dark: prefersDark,
        },
      },
    }),
  ],
};
