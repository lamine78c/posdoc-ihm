import { discardPeriodicTasks, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AccessTokenService, LoginService, PrismeAngularConfiguration } from '@acoss/prisme-angular-intranet';
import { FrontTokenRefreshService } from './front-token-refresh.service';
import { InactivityLogoutService } from './inactivity-logout.service';
import { FRONT_TOKEN_REFRESH_CHECK_INTERVAL, PRISME_USER_STORAGE_KEY } from '@app/shared/utils/Constants';

describe('FrontTokenRefreshService', () => {
  let service: FrontTokenRefreshService;
  let mockHttp: jasmine.SpyObj<HttpClient>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockAccessTokenService: jasmine.SpyObj<AccessTokenService>;
  let mockInactivityLogoutService: jasmine.SpyObj<InactivityLogoutService>;

  // payloads décodés par token, alimentés par declareToken()
  let payloads: { [token: string]: any };

  const config = {
    prismeClientId: 'PSFE',
    prismeClientSecret: 'secret',
    prismeScopeFront: 'openid *:PSFE',
    prismeTokenEndpoint: 'https://gateway.test/token',
  } as PrismeAngularConfiguration;

  const nowInSeconds = () => Math.floor(Date.now() / 1000);

  function declareToken(token: string, ageInSeconds: number, lifetimeInSeconds: number, jti: string, aud: string = 'AUD_FRONT'): void {
    const iat = nowInSeconds() - ageInSeconds;
    payloads[token] = { jti, aud, iat, exp: iat + lifetimeInSeconds };
  }

  function storeUserInfos(frontToken: string): void {
    sessionStorage.setItem(PRISME_USER_STORAGE_KEY, JSON.stringify({ accessTokenFront: frontToken }));
  }

  function storedFrontToken(): string {
    return JSON.parse(sessionStorage.getItem(PRISME_USER_STORAGE_KEY))?.accessTokenFront;
  }

  beforeEach(() => {
    payloads = {};
    mockHttp = jasmine.createSpyObj('HttpClient', ['post']);
    mockLoginService = jasmine.createSpyObj('LoginService', ['getAccessTokenFront']);
    mockAccessTokenService = jasmine.createSpyObj('AccessTokenService', ['decodeAccessToken']);
    mockInactivityLogoutService = jasmine.createSpyObj('InactivityLogoutService', ['isUserActive']);

    mockInactivityLogoutService.isUserActive.and.returnValue(true);
    mockAccessTokenService.decodeAccessToken.and.callFake((token: string) => payloads[token]);
    // Lecture du token depuis le sessionStorage, comme le vrai LoginService
    mockLoginService.getAccessTokenFront.and.callFake(() => storedFrontToken() ?? null);

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: LoginService, useValue: mockLoginService },
        { provide: AccessTokenService, useValue: mockAccessTokenService },
        { provide: InactivityLogoutService, useValue: mockInactivityLogoutService },
        { provide: PrismeAngularConfiguration, useValue: config },
      ],
    });
    service = TestBed.inject(FrontTokenRefreshService);
  });

  afterEach(() => {
    service.stop();
    sessionStorage.clear();
  });

  describe('renouvellement', () => {
    it('should renew and store the front token when it is past half-life', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 4000, 7200, 'jti-old');
      declareToken('new-token', 0, 7200, 'jti-new');
      mockHttp.post.and.returnValue(of({ access_token: 'new-token' }));

      service.start();
      flushMicrotasks();

      expect(mockHttp.post).toHaveBeenCalledTimes(1);
      const [url, body] = mockHttp.post.calls.mostRecent().args as [string, any];
      expect(url).toBe(config.prismeTokenEndpoint);
      expect(body.grant_type).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
      expect(body.assertion_type).toBe('jwt_token');
      expect(body.assertion).toBe('old-token');
      expect(body.client_id).toBe(config.prismeClientId);
      expect(body.scope).toEqual(jasmine.any(String));
      expect(storedFrontToken()).toBe('new-token');
      discardPeriodicTasks();
    }));

    it('should not call the gateway when the token has not reached half-life', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 1000, 7200, 'jti-old');

      service.start();
      flushMicrotasks();

      expect(mockHttp.post).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should not renew when the user is inactive', fakeAsync(() => {
      mockInactivityLogoutService.isUserActive.and.returnValue(false);
      storeUserInfos('old-token');
      declareToken('old-token', 4000, 7200, 'jti-old');

      service.start();
      flushMicrotasks();

      expect(mockHttp.post).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should not renew when there is no front token', fakeAsync(() => {
      service.start();
      flushMicrotasks();

      expect(mockHttp.post).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should not renew an already expired token', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 8000, 7200, 'jti-old');

      service.start();
      flushMicrotasks();

      expect(mockHttp.post).not.toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should retry at each check interval until the gateway returns a new token', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 4000, 7200, 'jti-old');
      // La gateway ressert un jeton avec le même jti (jeton trop récent)
      declareToken('same-jti-token', 0, 7200, 'jti-old');
      mockHttp.post.and.returnValue(of({ access_token: 'same-jti-token' }));

      service.start();
      flushMicrotasks();
      tick(FRONT_TOKEN_REFRESH_CHECK_INTERVAL);
      flushMicrotasks();

      expect(mockHttp.post).toHaveBeenCalledTimes(2);
      discardPeriodicTasks();
    }));
  });

  describe('garde-fous sur le token reçu', () => {
    it('should keep the current token when the gateway returns the same jti', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 4000, 7200, 'jti-old');
      declareToken('same-jti-token', 0, 7200, 'jti-old');
      mockHttp.post.and.returnValue(of({ access_token: 'same-jti-token' }));

      service.start();
      flushMicrotasks();

      expect(storedFrontToken()).toBe('old-token');
      discardPeriodicTasks();
    }));

    it('should not store a token with an unexpected aud', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 4000, 7200, 'jti-old');
      declareToken('back-token', 0, 7200, 'jti-back', 'AUD_BACK');
      mockHttp.post.and.returnValue(of({ access_token: 'back-token' }));

      service.start();
      flushMicrotasks();

      expect(storedFrontToken()).toBe('old-token');
      discardPeriodicTasks();
    }));

    it('should keep working after a gateway error and retry at the next tick', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 4000, 7200, 'jti-old');
      mockHttp.post.and.returnValue(throwError(() => new Error('gateway indisponible')));

      service.start();
      flushMicrotasks();
      expect(storedFrontToken()).toBe('old-token');

      tick(FRONT_TOKEN_REFRESH_CHECK_INTERVAL);
      flushMicrotasks();

      expect(mockHttp.post).toHaveBeenCalledTimes(2);
      discardPeriodicTasks();
    }));
  });

  describe('stop', () => {
    it('should stop checking after stop()', fakeAsync(() => {
      storeUserInfos('old-token');
      declareToken('old-token', 1000, 7200, 'jti-old');

      service.start();
      flushMicrotasks();
      service.stop();

      // Le token dépasse sa mi-vie après l'arrêt : aucun appel ne doit partir
      declareToken('old-token', 4000, 7200, 'jti-old');
      tick(FRONT_TOKEN_REFRESH_CHECK_INTERVAL);
      flushMicrotasks();

      expect(mockHttp.post).not.toHaveBeenCalled();
    }));
  });
});
