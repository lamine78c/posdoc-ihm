import { LoginService } from '@acoss/prisme-angular-intranet';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RedirectHomeGuard {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.loginService.hasAccessTokenBackInStorage()) {
      return this.router.navigate(['home']);
    } else {
      return this.router.navigate(['accueil']);
    }
  }
}
