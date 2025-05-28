import { inject, signal } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "src/environments/environment.dev";
import { firstValueFrom, zip } from "rxjs";
import { countries } from "src/app/shared/utils/countries";

export class ZipcodeValidator {

  private http = inject(HttpClient);
  private API_KEY = environment.zipcodeStack.apiKey;

  private lastZipCode: string | null = null;
  private lastCountry: string | null = null;
  private lastResult: ValidationErrors | null = null;
 
  public cityResult = signal<string | null>(null);

  validate(): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors | null> => {
      const parent = control.parent;
      if (!parent) return null;

      const zipCode = control.value;
      const country = parent.get('country')?.value;

      if (!zipCode || !country) return null;

      if (zipCode === this.lastZipCode && country === this.lastCountry) {
        return this.lastResult;
      }

      const countryCode = countries.find(c => c.nameES.toUpperCase() === country.toUpperCase())?.iso2;
      if (!countryCode) return { zipValidationFailed: true };

      const params = new HttpParams()
        .set('apikey', this.API_KEY)
        .set('codes', zipCode)
        .set('country', countryCode);

      try {
        const response: any = await firstValueFrom(this.http
          .get('https://api.zipcodestack.com/v1/search', { params })
        );

        const results = response?.results ?? [];

        const valid = results && !Array.isArray(results) && results[zipCode]?.length > 0;

        if (!valid) {
          this.cityResult.set(null);
          this.setCache(zipCode, country, { invalidZipCode: true });
          return { invalidZipCode: true };
        }

        const cityName = results[zipCode][0]?.city ?? null;
        this.cityResult.set(cityName);
        this.setCache(zipCode, country, null);
        
        return null;
      } catch {
        this.cityResult.set(null);
        this.setCache(zipCode, country, { zipValidationFailed: true });
        return { zipValidationFailed: true };
      }
    };
  }

  private setCache(zipCode: string, country: string, result: ValidationErrors | null) {
    this.lastZipCode = zipCode;
    this.lastCountry = country;
    this.lastResult = result;
  }
}