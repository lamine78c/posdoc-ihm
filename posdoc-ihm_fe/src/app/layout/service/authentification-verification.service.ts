import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationVerificationService {
  private dataSubject = new Subject<void>();
  data$ = this.dataSubject.asObservable();

  private authDataReadySubject = new Subject<void>();
  authDataReady$ = this.authDataReadySubject.asObservable();

  sendLoginSucced() {
    this.dataSubject.next();
  }

  sendAuthDataReady() {
    this.authDataReadySubject.next();
  }
}
