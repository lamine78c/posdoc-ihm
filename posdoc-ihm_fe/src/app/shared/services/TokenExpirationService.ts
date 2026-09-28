import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AccessTokenService, LoginService } from '@acoss/prisme-angular-intranet';
import { interval, Subscription } from 'rxjs';
import { TOKEN_EXPIRATION_CHECK_INTERVAL } from '@app/shared/utils/Constants';
import { LogoutService } from '@app/shared/services/logout.service';

@Injectable({
  providedIn: 'root',
})
export class TokenExpirationService {
  private tokenCheckInterval: Subscription;

  constructor(
    private loginService: LoginService,
    private logoutService: LogoutService,
    private router: Router,
    private accessTokenService: AccessTokenService
  ) {}

  startTokenExpirationCheck(intervalMs: number = TOKEN_EXPIRATION_CHECK_INTERVAL) {
    // Arrêter l'intervalle précédent s'il existe
    this.stopTokenExpirationCheck();

    // Vérifier périodiquement la validité du token
    this.tokenCheckInterval = interval(intervalMs).subscribe(() => {
      const token = this.loginService.getAccessTokenBack();
      if (this.accessTokenService.isTokenExpired(token)) {
        this.logoutDueToExpiration();
      }
    });
  }

  stopTokenExpirationCheck() {
    if (this.tokenCheckInterval) {
      this.tokenCheckInterval.unsubscribe();
    }
  }

  private logoutDueToExpiration() {
    console.warn('Déconnexion : jeton back expiré');
    this.stopTokenExpirationCheck();
    this.logoutService.logout(this.router.url);
  }
}
