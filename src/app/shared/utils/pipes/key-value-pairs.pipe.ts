import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyValuePairs'
})
export class KeyValuePairsPipe implements PipeTransform {
  transform(obj: Record<string, any>): { key: string; value: any }[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({ key, value }));
  }
}
