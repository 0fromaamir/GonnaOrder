import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'formatPrice'})
export class FormatPrice implements PipeTransform {

  transform(price: number, langCode: string, currency: string, currencySymbol: string): string {
    if (langCode && currency && typeof price === 'number') {
      if ( currency === 'BBD' ) {
       return price.toLocaleString(langCode, {style: 'currency', currency}).replace('$', 'BBD $');
      }
      else {
        return price.toLocaleString(langCode, {style: 'currency', currency})
          .replace(currency, currencySymbol);
      }
    }
    return '';
  }
}
