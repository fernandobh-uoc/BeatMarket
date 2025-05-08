import { Pipe, PipeTransform } from '@angular/core';
import { countries } from '../countries';

@Pipe({
  name: 'countryCodeToName',
  standalone: true
})
export class CountryCodeToNamePipe implements PipeTransform {

  transform(iso2: string, ...args: unknown[]): string {
    const country = countries.find(c => c.iso2.toUpperCase() === iso2.toUpperCase());
    return country ? country.nameES : iso2; // fallback to iso2 if not found
  }

}
