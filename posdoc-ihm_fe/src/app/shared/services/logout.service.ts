import { inject, Injectable } from '@angular/core';
import { LoginService, OauthService, PrismeAngularConfiguration, RefreshService } from '@acoss/prisme-angular-intranet';

/**
 * Déconnexion complète, partagée par le bouton Déconnexion (AuthentificationComponent),
 * TokenExpirationService et InactivityLogoutService : arrêt du rafraîchissement,
 * purge de la session locale, puis destruction de la session SSO côté gateway
 * (cookie pss) via l'endpoint /logout — sans cet appel, la mire ré-authentifie
 * silencieusement l'utilisateur et la déconnexion est sans effet.
 */
@Injectable({ providedIn: 'root' })
export class LogoutService {
  private readonly loginService = inject(LoginService);
  private readonly refreshService = inject(RefreshService);
  private readonly oauthService = inject(OauthService);
  private readonly prismeAngularConfiguration = inject(PrismeAngularConfiguration);

  private logoutInProgress = false;

  logout(returnRoute: string): void {
    if (this.logoutInProgress) {
      return;
    }
    this.logoutInProgress = true;
    // idToken capturé avant l'arrêt du rafraîchissement, qui purge les informations de session
    const idToken = this.loginService.getIdToken();
    this.refreshService.stopperRafraichissementEtDeconnecter()
      .catch(error => console.error('Echec de l\'arrêt du rafraîchissement, déconnexion forcée', error))
      .finally(() => {
        sessionStorage.clear();
        const postLogoutRedirectUri = this.oauthService.authentificationFrontUrl(returnRoute);
        this.redirectTo(this.buildLogoutUrl(idToken, postLogoutRedirectUri));
        this.logoutInProgress = false;
      });
  }

  private buildLogoutUrl(idToken: string, postLogoutRedirectUri: string): string {
    if (!idToken) {
      return postLogoutRedirectUri;
    }
    const logoutUrl = this.prismeAngularConfiguration.prismeAuthzEndpoint.replace('/authz', '/logout');
    return `${logoutUrl}?id_token_hint=${encodeURIComponent(idToken)}&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
  }

  private redirectTo(url: string): void {
    window.location.href = url;
  }
}
