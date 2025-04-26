import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import localeId from '@angular/common/locales/id';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);

registerLocaleData(localeId, environment.default_currency_code);
