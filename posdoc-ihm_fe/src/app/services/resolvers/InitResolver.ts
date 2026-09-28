import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiAdelaideProfileService } from '../api-adelaide-profile.service';
import { LoginService } from '@acoss/prisme-angular-intranet';

@Injectable({
  providedIn: 'root',
})
export class InitResolver {
  constructor(
    private profilService: ApiAdelaideProfileService,
    private loginService: LoginService
  ) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let profileID = this.loginService.getInfos().infosUtilisateurFront.hrProfil;
    return this.profilService.getProfileById(profileID);
  }
}
