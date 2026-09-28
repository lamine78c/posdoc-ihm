import { FormatDatePipe } from './format-date.pipe';
import { DatePipe } from '@angular/common';

describe('FormatDatePipe', () => {
  it('create an instance', () => {
    let datePipe = new DatePipe('fr-FR');
    const pipe = new FormatDatePipe(datePipe);
    expect(pipe).toBeTruthy();
  });
});
