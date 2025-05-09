import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCurrency'
})
export class FormatCurrencyPipe implements PipeTransform {
  transform(
    value: number | string,
    showSymbol: boolean = true,
    symbolPosition: 'before' | 'after' = 'after'
  ): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '';
    }

    const number = Number(value).toFixed(2);
    const [integerPart, decimalPart] = number.split('.');

    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formattedNumber = `${withThousands},${decimalPart}`;

    if (!showSymbol) return formattedNumber;

    return symbolPosition === 'before'
      ? `€ ${formattedNumber}`
      : `${formattedNumber} €`;
  }
}
