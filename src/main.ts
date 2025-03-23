import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import localeId from '@angular/common/locales/id';
import { RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { provideAnimations } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { Ability, PureAbility } from '@casl/ability';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    { provide: APP_BASE_HREF, useValue: '/' },
    provideHttpClient(),
    importProvidersFrom(
      ReactiveFormsModule,
      ToastModule,
      InputTextModule,
      ButtonModule,
      FontAwesomeModule,
    ), // Tambahkan ToastModule
    MessageService,
    Ability,
    PureAbility,
  ],
}).catch((err) => console.error(err));

registerLocaleData(localeId, environment.default_currency_code);
