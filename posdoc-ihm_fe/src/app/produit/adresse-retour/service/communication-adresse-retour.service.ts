import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommunicationAdresseRetourService {
  private readonly triggerMethodSource = new Subject<void>();

  triggerMethod$ = this.triggerMethodSource.asObservable();

  callOtherComponentMethod() {
    this.triggerMethodSource.next();
  }
}
