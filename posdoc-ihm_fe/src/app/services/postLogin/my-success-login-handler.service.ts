import { AbstractSuccessLoginHandler } from '@acoss/prisme-angular-intranet';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KEY_SESSION_DATA_SEARCH } from '@app/shared/utils/Constants';
import { AuthentificationVerificationService } from '@app/layout/service/authentification-verification.service';

@Injectable({
  providedIn: 'root',
})
export class MySuccessLoginHandlerService extends AbstractSuccessLoginHandler {
  private readonly router = inject(Router);
  private readonly authentificationVerificationService = inject(AuthentificationVerificationService);

  constructor() {
    super();
  }

  postSuccessLogin() {
    sessionStorage.removeItem(KEY_SESSION_DATA_SEARCH);
    this.authentificationVerificationService.sendLoginSucced();
    this.router.navigate(['home']);
  }
}
