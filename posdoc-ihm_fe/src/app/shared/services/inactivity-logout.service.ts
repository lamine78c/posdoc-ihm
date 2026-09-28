import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '@acoss/prisme-angular-intranet';
import { interval, Subscription } from 'rxjs';
import { AppConfigService } from '@app/app-config/app-config.service';
import { LogoutService } from '@app/shared/services/logout.service';
import {
  ACTIVITY_TRACKING_THROTTLE,
  DEFAULT_INACTIVITY_LOGOUT_DELAY,
  INACTIVITY_CHECK_INTERVAL,
  LAST_ACTIVITY_STORAGE_KEY,
} from '@app/shared/utils/Constants';

/**
 * Déconnexion automatique en cas d'inactivité prolongée.
 *
 * Le renouvellement du token front (FrontTokenRefreshService) maintient la session
 * indéfiniment tant que l'onglet est ouvert : ce service en est le garde-fou.
 * La dernière activité utilisateur (clic, clavier, scroll, souris) est horodatée
 * en sessionStorage (survit au F5, par onglet comme les tokens) ; au-delà du délai
 * configuré (inactivityLogoutDelay dans configuration.json), l'utilisateur est
 * déconnecté et redirigé vers la mire — même chemin que TokenExpirationService.
 *
 * Le contrôle périodique ne suffit pas : les timers ne tournent pas pendant la
 * veille et sont bridés dans un onglet masqué. La garantie est donc posée au
 * moment du retour : si le délai est déjà dépassé, le premier geste (ou le
 * retour sur l'onglet) déconnecte au lieu de réarmer le compteur.
 */
@Injectable({ providedIn: 'root' })
export class InactivityLogoutService {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly appConfigService = inject(AppConfigService);
  private readonly logoutService = inject(LogoutService);

  private checkSubscription: Subscription;
  private lastRecordedActivity = 0;

  private readonly activityEvents = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
  private readonly onActivity = () => this.recordActivity();
  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.check();
    }
  };

  start(): void {
    this.stop();
    if (this.isInactivityExpired(Date.now())) {
      this.logout();
      return;
    }
    this.recordActivity();
    this.activityEvents.forEach(eventName => document.addEventListener(eventName, this.onActivity, { passive: true, capture: true }));
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.checkSubscription = interval(INACTIVITY_CHECK_INTERVAL).subscribe(() => this.check());
  }

  stop(): void {
    if (this.checkSubscription) {
      this.checkSubscription.unsubscribe();
      this.checkSubscription = null;
    }
    this.activityEvents.forEach(eventName => document.removeEventListener(eventName, this.onActivity, { capture: true }));
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  isUserActive(): boolean {
    return Date.now() - this.getLastActivity() < this.getLogoutDelay();
  }

  /**
   * Horodate l'activité, avec un throttle pour ne pas écrire en storage à chaque mousemove.
   * Si le délai d'inactivité est déjà dépassé, le geste de retour déconnecte au lieu
   * de réarmer le compteur — seul point de passage fiable après une veille.
   */
  private recordActivity(): void {
    const now = Date.now();
    if (now - this.lastRecordedActivity < ACTIVITY_TRACKING_THROTTLE) {
      return;
    }
    if (this.isInactivityExpired(now)) {
      this.logout();
      return;
    }
    this.lastRecordedActivity = now;
    sessionStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, now.toString());
  }

  private isInactivityExpired(now: number): boolean {
    const stored = parseInt(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY), 10);
    return !!stored && now - stored >= this.getLogoutDelay() && this.loginService.hasAccessTokenBackInStorage();
  }

  private getLastActivity(): number {
    return parseInt(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY), 10) || this.lastRecordedActivity;
  }

  private getLogoutDelay(): number {
    return this.appConfigService.settings?.inactivityLogoutDelay ?? DEFAULT_INACTIVITY_LOGOUT_DELAY;
  }

  private check(): void {
    if (!this.loginService.hasAccessTokenBackInStorage()) {
      return;
    }
    if (!this.isUserActive()) {
      this.logout();
    }
  }

  private logout(): void {
    console.warn('Déconnexion pour inactivité prolongée');
    this.stop();
    this.logoutService.logout(this.router.url);
  }
}
