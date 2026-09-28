import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class ApiAdelaideDateService {
  constructor(private datePipe: DatePipe) {}

  transformDateToString(date: NgbDateStruct, isTo: boolean = false) {
    if (!!date && typeof date === 'object' && date.year > 1000) {
      const heure = isTo ? '23:59:59' : '00:00:01';
      return this.datePipe.transform(date['year'] + '-' + date['month'] + '-' + date['day'], 'yyyy-MM-dd ' + heure);
    }
    return null;
  }
}
