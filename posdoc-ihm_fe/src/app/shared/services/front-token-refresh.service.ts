import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccessTokenService, LoginService, PrismeAngularConfiguration } from '@acoss/prisme-angular-intranet';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { gzip } from 'pako';
import { InactivityLogoutService } from '@app/shared/services/inactivity-logout.service';
import { FRONT_TOKEN_REFRESH_CHECK_INTERVAL, PRISME_USER_STORAGE_KEY } from '@app/shared/utils/Constants';

/**
 * Renouvellement périodique du token FRONT.
 *
 * La librairie Prisme ne renouvelle que le token BACK (RefreshService) ; le token
 * FRONT expire à durée fixe (2h en production) et son expiration provoque une
 * déconnexion à la navigation suivante (AuthImplicitGuard → failureTokenFrontExpired).
 *
 * Ce service comble ce manque : la gateway accepte le grant
 * "urn:ietf:params:oauth:grant-type:jwt-bearer" avec le scope front (validé en
 * assemblage), exactement comme pour le renouvellement du back. On vérifie
 * périodiquement le token front et on le renouvelle quand il a dépassé la moitié
 * de sa durée de vie.
 */
@Injectable({ providedIn: 'root' })
export class FrontTokenRefreshService {
  private readonly http = inject(HttpClient);
  private readonly loginService = inject(LoginService);
  private readonly config = inject(PrismeAngularConfiguration);
  private readonly accessTokenService = inject(AccessTokenService);
  private readonly inactivityLogoutService = inject(InactivityLogoutService);

  private checkSubscription: Subscription;
  private renewalInProgress = false;
  private readonly onVisibilityChange = () => {
    // Retour sur l'onglet (changement d'onglet, sortie de veille) : on vérifie
    // sans attendre le prochain tick, tant que le token est encore renouvelable
    if (document.visibilityState === 'visible') {
      this.checkAndRenew();
    }
  };

  start(intervalMs: number = FRONT_TOKEN_REFRESH_CHECK_INTERVAL): void {
    this.stop();
    this.checkAndRenew();
    this.checkSubscription = interval(intervalMs).subscribe(() => this.checkAndRenew());
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  stop(): void {
    if (this.checkSubscription) {
      this.checkSubscription.unsubscribe();
      this.checkSubscription = null;
    }
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private checkAndRenew(): void {
    // On ne prolonge pas la session d'un utilisateur inactif : sans renouvellement le
    // token expirera, et InactivityLogoutService déconnectera au seuil configuré
    if (!this.inactivityLogoutService.isUserActive()) {
      return;
    }

    const frontToken = this.loginService.getAccessTokenFront();
    if (!frontToken || this.renewalInProgress) {
      return;
    }

    const payload = this.decodePayload(frontToken);
    if (!payload?.exp || !payload?.iat) {
      return;
    }

    const nowInSeconds = Date.now() / 1000;
    if (payload.exp <= nowInSeconds) {
      // Token déjà expiré : non renouvelable, l'AuthImplicitGuard gèrera la reconnexion
      return;
    }

    // Renouvellement quand le token a dépassé la moitié de sa durée de vie
    const halfLife = (payload.exp - payload.iat) / 2;
    if (payload.exp - nowInSeconds > halfLife) {
      return;
    }

    this.renew(frontToken);
  }

  private renew(frontToken: string): void {
    console.warn('Tentative de rafraichissement du jeton front');
    this.renewalInProgress = true;
    this.renewFrontToken(frontToken)
      .then(newToken => {
        const oldPayload = this.decodePayload(frontToken);
        const newPayload = this.decodePayload(newToken);
        if (newPayload?.jti === oldPayload?.jti) {
          // La gateway resert le même jeton tant qu'il est jeune : cas normal,
          // le renouvellement aboutira à un prochain contrôle quand le jeton aura assez vécu
          console.warn('Token front pas encore renouvelé par la gateway (jeton trop récent), nouvel essai au prochain contrôle');
          return;
        }
        if (newPayload?.aud !== oldPayload?.aud) {
          console.error('Renouvellement du token front : aud inattendu (token non front ?)', newPayload);
          return;
        }
        this.storeFrontToken(newToken);
        console.warn('Token front renouvelé, nouvelle expiration : ' + new Date(newPayload.exp * 1000).toLocaleString());
      })
      .catch(error => {
        // reconnexion via la mire à l'expiration du token
        console.error('Echec du renouvellement du token front', error);
      })
      .finally(() => (this.renewalInProgress = false));
  }

  /**
   * Demande un nouveau token front à la gateway via le grant assertion JWT :
   * même requête que le renouvellement du token back par la librairie
   * (OauthService.authentificationBackAssertionJwt), avec le scope front à la
   * place du scope back — la librairie n'expose pas cette variante.
   */
  private renewFrontToken(assertion: string): Promise<string> {
    const body = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: this.config.prismeClientId,
      client_secret: this.config.prismeClientSecret,
      assertion_type: 'jwt_token',
      assertion: assertion,
      // Le scope doit être gzippé puis encodé en base64 (format attendu par la gateway)
      scope: btoa(String.fromCharCode(...gzip(this.config.prismeScopeFront))),
    };

    return firstValueFrom(this.http.post<any>(this.config.prismeTokenEndpoint, body)).then(response => {
      if (!response?.access_token) {
        throw new Error('Réponse de la gateway sans access_token');
      }
      return response.access_token;
    });
  }

  /**
   * Remplace le token front dans les informations de session stockées par la
   * librairie. Clé (PRISME_USER_STORAGE_KEY) et storage (sessionStorage)
   * identiques à ceux de LoginService, conformément à
   * PrismeAngularInitModule.forRoot(PRISME_STORAGE_KEY, false) (app.module.ts).
   */
  private storeFrontToken(newToken: string): void {
    const userInfos = JSON.parse(sessionStorage.getItem(PRISME_USER_STORAGE_KEY));
    if (!userInfos) {
      console.error(`Renouvellement du token front : informations utilisateur introuvables en sessionStorage (clé ${PRISME_USER_STORAGE_KEY})`);
      return;
    }
    userInfos.accessTokenFront = newToken;
    sessionStorage.setItem(PRISME_USER_STORAGE_KEY, JSON.stringify(userInfos));
    if (this.loginService.getAccessTokenFront() !== newToken) {
      console.error('Renouvellement du token front : le token stocké ne correspond pas (clé ou storage différent de celui de la librairie ?)');
    }
  }

  private decodePayload(jwt: string): any {
    try {
      return this.accessTokenService.decodeAccessToken(jwt);
    } catch {
      return null;
    }
  }
}
