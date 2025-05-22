import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTimestamp'
})
export class FormatTimestampPipe implements PipeTransform {

  transform(value: Date | string | number): string {
    const date = new Date(value);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    if (isToday) {
      return `Hoy, ${time}`;
    }

    if (isYesterday) {
      return `Ayer, ${time}`;
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}, ${time}`;
  }

}
