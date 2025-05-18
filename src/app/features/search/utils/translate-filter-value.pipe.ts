import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'translateFilterValue'
})
export class TranslateFilterValuePipe implements PipeTransform {
  transform(value: string | string[], ...args: unknown[]): string {
    if (Array.isArray(value)) {
      return value.join(', ').toString();
    } else {
      return value;
    }
  }
}
