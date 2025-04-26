import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fcCurrency',
})
export class FcCurrencyPipe extends CurrencyPipe implements PipeTransform {
  override transform(
    value: number | string,
    currencyCode?: string,
    display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean,
    digitsInfo?: string,
    locale?: string,
  ): string | null;
  override transform(
    value: null | undefined,
    currencyCode?: string,
    display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean,
    digitsInfo?: string,
    locale?: string,
  ): null;
  override transform(
    value: number | string | null | undefined,
    currencyCode?: string,
    display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean,
    digitsInfo?: string,
    locale?: string,
  ): string | null {
    return super.transform(
      value,
      currencyCode || 'IDR',
      display || 'symbol-narrow',
      digitsInfo || '1.0-0',
      locale || 'id-ID',
    );
  }
  // register locale at main.ts files
}
