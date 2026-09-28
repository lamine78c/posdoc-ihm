import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'formatDate',
  standalone: false,
})
export class FormatDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: string, ...args: string[]): unknown {
    return this.datePipe.transform(value, 'dd/MM/yyy à hh:mm:ss');
  }
}
