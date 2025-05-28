import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { countries } from '../countries';

@Pipe({
  name: 'countryNameToCode'
})
@Injectable({
  providedIn: 'root'
})
export class CountryNameToCodePipe implements PipeTransform {

  transform(countryName: string, ...args: unknown[]): string {
    const country = countries.find(c => c.nameES.toUpperCase() === countryName.toUpperCase());
    return country ? country.iso2 : ''; // fallback to empty string if not found
  }

}
