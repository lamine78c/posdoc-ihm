import { Pipe, PipeTransform } from '@angular/core';

export enum TextFormat {
  SIRET = 'XXX XXX XXX XXXXX',
  SIREN = 'XXX XXX XXX',
  NIR = 'X XX XX XX XXX XXX XX',
}

@Pipe({
  name: 'textFormat',
  standalone: false,
})
export class TextFormatPipe implements PipeTransform {
  transform(value: string = '', format?: TextFormat): string {
    if (!format) {
      return value;
    }
    if (!value) {
      return '-';
    }
    value = String(value);
    let count: number = 0;
    return format
      .replace(/X/g, () => {
        return value.charAt(count++);
      })
      .trim();
  }
}
