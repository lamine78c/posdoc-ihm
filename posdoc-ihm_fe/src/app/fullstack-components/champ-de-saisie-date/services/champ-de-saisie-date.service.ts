import { Injectable } from '@angular/core';
import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class ChampDeSaisieDateService {
  checkIfToDateIsBiggerThanFromDate(fromDate: NgbDateStruct, toDate: NgbDateStruct): boolean {
    if (fromDate && toDate) {
      const _fromDate: NgbDate = new NgbDate(fromDate.year, fromDate.month, fromDate.day);
      const _toDate: NgbDate = new NgbDate(toDate.year, toDate.month, toDate.day);

      return _toDate.before(_fromDate);
    }
    return false;
  }
}
