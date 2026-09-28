import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public httpLoading$ = new ReplaySubject<boolean>(1);
  public readonly loading$ = this.httpLoading$.pipe(delay(1));
  constructor() {
    // do nothing
  }

  httpProgress(): any {
    return this.httpLoading$.asObservable();
  }

  setHttpProgressStatus(inprogess: boolean) {
    this.httpLoading$.next(inprogess);
  }
}
