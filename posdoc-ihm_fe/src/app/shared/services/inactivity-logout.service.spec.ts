import { discardPeriodicTasks, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginService, OauthService, PrismeAngularConfiguration, RefreshService } from '@acoss/prisme-angular-intranet';
import { InactivityLogoutService } from './inactivity-logout.service';
import { LogoutService } from './logout.service';
import { AppConfigService } from '@app/app-config/app-config.service';
import {
  ACTIVITY_TRACKING_THROTTLE,
  DEFAULT_INACTIVITY_LOGOUT_DELAY,
  INACTIVITY_CHECK_INTERVAL,
  LAST_ACTIVITY_STORAGE_KEY,
} from '@app/shared/utils/Constants';

describe('InactivityLogoutService', () => {
  const CONFIGURED_DELAY = 120000; // 2 minutes pour les tests
  const ID_TOKEN = 'id-token-jwt';
  const MIRE_URL = 'https://mire.test/authz';
  // Même construction que le bouton Déconnexion : logout gateway (destruction du cookie pss) puis retour mire
  const PSS_LOGOUT_URL = `https://gw.test/pss/logout?id_token_hint=${encodeURIComponent(ID_TOKEN)}&post_logout_redirect_uri=${encodeURIComponent(MIRE_URL)}`;

  let service: InactivityLogoutService;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockRefreshService: jasmine.SpyObj<RefreshService>;
  let mockOauthService: jasmine.SpyObj<OauthService>;
  let appConfigMock: { settings: any };
  let redirectSpy: jasmine.Spy;

  function setLastActivity(timestamp: number): void {
    sessionStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, timestamp.toString());
  }

  /** Simule une longue absence : dernière activité ancienne en storage ET en mémoire (throttle) */
  function simulateAbsenceSince(timestamp: number): void {
    setLastActivity(timestamp);
    (service as any).lastRecordedActivity = timestamp;
  }

  beforeEach(() => {
    mockLoginService = jasmine.createSpyObj('LoginService', ['hasAccessTokenBackInStorage', 'getIdToken']);
    mockRefreshService = jasmine.createSpyObj('RefreshService', ['stopperRafraichissementEtDeconnecter']);
    mockOauthService = jasmine.createSpyObj('OauthService', ['authentificationFrontUrl']);
    appConfigMock = { settings: { inactivityLogoutDelay: CONFIGURED_DELAY } };

    mockLoginService.hasAccessTokenBackInStorage.and.returnValue(true);
    mockLoginService.getIdToken.and.returnValue(ID_TOKEN);
    // Promesse créée au moment de l'appel pour rester dans la zone du test (fakeAsync)
    mockRefreshService.stopperRafraichissementEtDeconnecter.and.callFake(() => Promise.resolve(true));
    mockOauthService.authentificationFrontUrl.and.returnValue(MIRE_URL);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: mockLoginService },
        { provide: RefreshService, useValue: mockRefreshService },
        { provide: OauthService, useValue: mockOauthService },
        { provide: Router, useValue: { url: '/exploitation-editique/massification' } },
        { provide: AppConfigService, useValue: appConfigMock },
        { provide: PrismeAngularConfiguration, useValue: { prismeAuthzEndpoint: 'https://gw.test/pss/authz' } },
      ],
    });
    service = TestBed.inject(InactivityLogoutService);
    // Empêche toute navigation réelle qui rechargerait la page de test
    redirectSpy = spyOn<any>(TestBed.inject(LogoutService), 'redirectTo');
  });

  afterEach(() => {
    service.stop();
    sessionStorage.clear();
  });

  describe('suivi de l\'activité', () => {
    it('should record activity at start', () => {
      const before = Date.now();
      service.start();

      const recorded = parseInt(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY), 10);
      expect(recorded).toBeGreaterThanOrEqual(before);
    });

    it('should record activity on user event once the throttle window has passed', () => {
      service.start();
      (service as any).lastRecordedActivity = Date.now() - ACTIVITY_TRACKING_THROTTLE - 1;
      const previous = Date.now() - 60000;
      setLastActivity(previous);

      document.dispatchEvent(new Event('click'));

      const recorded = parseInt(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY), 10);
      expect(recorded).toBeGreaterThan(previous);
    });

    it('should throttle activity recording', () => {
      service.start();
      // Dernier enregistrement à l'instant : l'événement suivant est ignoré
      const sentinel = (Date.now() - 1000).toString();
      sessionStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, sentinel);

      document.dispatchEvent(new Event('click'));

      expect(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)).toBe(sentinel);
    });
  });

  describe('isUserActive', () => {
    it('should return true when the last activity is within the configured delay', () => {
      service.start();
      setLastActivity(Date.now() - CONFIGURED_DELAY + 5000);

      expect(service.isUserActive()).toBeTrue();
    });

    it('should return false when the last activity is older than the configured delay', () => {
      service.start();
      setLastActivity(Date.now() - CONFIGURED_DELAY - 1);

      expect(service.isUserActive()).toBeFalse();
    });

    it('should fall back to the default delay when the configuration does not define it', () => {
      appConfigMock.settings = {};
      service.start();
      setLastActivity(Date.now() - CONFIGURED_DELAY - 1);

      // Inactif pour le délai de test, mais pas pour le délai par défaut (2h)
      expect(service.isUserActive()).toBeTrue();

      setLastActivity(Date.now() - DEFAULT_INACTIVITY_LOGOUT_DELAY - 1);
      expect(service.isUserActive()).toBeFalse();
    });
  });

  describe('déconnexion pour inactivité', () => {
    it('should logout when the user has been inactive beyond the configured delay', fakeAsync(() => {
      service.start();
      setLastActivity(Date.now() - CONFIGURED_DELAY - 1);

      tick(INACTIVITY_CHECK_INTERVAL);
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).toHaveBeenCalled();
      expect(mockOauthService.authentificationFrontUrl).toHaveBeenCalledWith('/exploitation-editique/massification');
      expect(redirectSpy).toHaveBeenCalledWith(PSS_LOGOUT_URL);
      expect(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)).toBeNull();
    }));

    it('should not logout while the user is active', fakeAsync(() => {
      service.start();

      tick(INACTIVITY_CHECK_INTERVAL);
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should not logout when the user is not connected', fakeAsync(() => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(false);
      service.start();
      setLastActivity(Date.now() - CONFIGURED_DELAY - 1);

      tick(INACTIVITY_CHECK_INTERVAL);
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should not check anymore after stop()', fakeAsync(() => {
      service.start();
      service.stop();
      setLastActivity(Date.now() - CONFIGURED_DELAY - 1);

      tick(INACTIVITY_CHECK_INTERVAL);
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).not.toHaveBeenCalled();
    }));
  });

  describe('retour après une longue absence (veille, onglet quitté)', () => {
    it('should logout on user activity when the delay has already elapsed instead of re-arming', fakeAsync(() => {
      service.start();
      simulateAbsenceSince(Date.now() - CONFIGURED_DELAY - 1);

      document.dispatchEvent(new Event('click'));
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).toHaveBeenCalled();
      expect(redirectSpy).toHaveBeenCalledWith(PSS_LOGOUT_URL);
    }));

    it('should logout only once when several events fire in a row', fakeAsync(() => {
      service.start();
      simulateAbsenceSince(Date.now() - CONFIGURED_DELAY - 1);

      document.dispatchEvent(new Event('click'));
      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('mousemove'));
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).toHaveBeenCalledTimes(1);
    }));

    it('should logout at start when the stored activity is older than the delay (page reload)', fakeAsync(() => {
      setLastActivity(Date.now() - CONFIGURED_DELAY - 1);

      service.start();
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).toHaveBeenCalled();
      expect(redirectSpy).toHaveBeenCalled();
    }));

    it('should check immediately when the tab becomes visible again', fakeAsync(() => {
      service.start();
      setLastActivity(Date.now() - CONFIGURED_DELAY - 1);

      document.dispatchEvent(new Event('visibilitychange'));
      flushMicrotasks();

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).toHaveBeenCalled();
    }));

    it('should still clear the session and redirect when the gateway logout call fails', fakeAsync(() => {
      mockRefreshService.stopperRafraichissementEtDeconnecter.and.callFake(() => Promise.reject(new Error('gateway KO')));
      service.start();
      simulateAbsenceSince(Date.now() - CONFIGURED_DELAY - 1);

      document.dispatchEvent(new Event('click'));
      flushMicrotasks();

      expect(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)).toBeNull();
      expect(redirectSpy).toHaveBeenCalledWith(PSS_LOGOUT_URL);
    }));

    it('should redirect straight to the mire when no id token is available', fakeAsync(() => {
      mockLoginService.getIdToken.and.returnValue(null);
      service.start();
      simulateAbsenceSince(Date.now() - CONFIGURED_DELAY - 1);

      document.dispatchEvent(new Event('click'));
      flushMicrotasks();

      expect(redirectSpy).toHaveBeenCalledWith(MIRE_URL);
    }));

    it('should re-arm normally on activity when the user is not connected', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(false);
      service.start();
      (service as any).lastRecordedActivity = Date.now() - ACTIVITY_TRACKING_THROTTLE - 1;
      const stale = Date.now() - CONFIGURED_DELAY - 1;
      setLastActivity(stale);

      document.dispatchEvent(new Event('click'));

      expect(mockRefreshService.stopperRafraichissementEtDeconnecter).not.toHaveBeenCalled();
      expect(parseInt(sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY), 10)).toBeGreaterThan(stale);
    });
  });
});
