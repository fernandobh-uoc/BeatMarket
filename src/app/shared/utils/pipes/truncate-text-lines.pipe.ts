import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateTextLines'
})
export class TruncateTextLinesPipe implements PipeTransform {
  transform(value: string, maxWords: number = 100): string {
    if (!value) return '';
    
    if (value.split(' ').length > maxWords) {
      return value.split(' ').splice(0, maxWords).join(' ') + '...';
    }
    
    return value;
  }


}
