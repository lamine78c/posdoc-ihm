import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterSharedDataService {
  private dataSubject = new BehaviorSubject<any>(null);

  getData() {
    return this.dataSubject.asObservable();
  }

  updateData(newData: any) {
    this.dataSubject.next(newData);
  }
}
