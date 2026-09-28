import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { LoginService, OauthService, PrismeAngularConfiguration, RefreshService } from '@acoss/prisme-angular-intranet';
import { LogoutService } from './logout.service';

describe('LogoutService', () => {
  const ID_TOKEN = 'id-token-jwt';
  const MIRE_URL = 'https://mire.test/authz';
  const PSS_LOGOUT_URL = `https://gw.test/pss/logout?id_token_hint=${encodeURIComponent(ID_TOKEN)}&post_logout_redirect_uri=${encodeURIComponent(MIRE_URL)}`;

  let service: LogoutService;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockRefreshService: jasmine.SpyObj<RefreshService>;
  let mockOauthService: jasmine.SpyObj<OauthService>;
  let redirectSpy: jasmine.Spy;

  beforeEach(() => {
    mockLoginService = jasmine.createSpyObj('LoginService', ['getIdToken']);
    mockRefreshService = jasmine.createSpyObj('RefreshService', ['stopperRafraichissementEtDeconnecter']);
    mockOauthService = jasmine.createSpyObj('OauthService', ['authentificationFrontUrl']);

    mockLoginService.getIdToken.and.returnValue(ID_TOKEN);
    // Promesse créée au moment de l'appel pour rester dans la zone du test (fakeAsync)
    mockRefreshService.stopperRafraichissementEtDeconnecter.and.callFake(() => Promise.resolve(true));
    mockOauthService.authentificationFrontUrl.and.returnValue(MIRE_URL);

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: mockLoginService },
        { provide: RefreshService, useValue: mockRefreshService },
        { provide: OauthService, useValue: mockOauthService },
        { provide: PrismeAngularConfiguration, useValue: { prismeAuthzEndpoint: 'https://gw.test/pss/authz' } },
      ],
    });
    service = TestBed.inject(LogoutService);
    // Empêche toute navigation réelle qui rechargerait la page de test
    redirectSpy = spyOn<any>(service, 'redirectTo');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should clear the session and redirect to the gateway pss logout with the id token', fakeAsync(() => {
    sessionStorage.setItem('user.login', 'x');

    service.logout('/exploitation-editique/massification');
    flushMicrotasks();

    expect(mockRefreshService.stopperRafraichissementEtDeconnecter).toHaveBeenCalled();
    expect(mockOauthService.authentificationFrontUrl).toHaveBeenCalledWith('/exploitation-editique/massification');
    expect(redirectSpy).toHaveBeenCalledWith(PSS_LOGOUT_URL);
    expect(sessionStorage.getItem('user.login')).toBeNull();
  }));

  it('should redirect straight to the mire when no id token is available', fakeAsync(() => {
    mockLoginService.getIdToken.and.returnValue(null);

    service.logout('/');
    flushMicrotasks();

    expect(redirectSpy).toHaveBeenCalledWith(MIRE_URL);
  }));

  it('should still clear the session and redirect when stopping the refresh fails', fakeAsync(() => {
    mockRefreshService.stopperRafraichissementEtDeconnecter.and.callFake(() => Promise.reject(new Error('gateway KO')));
    sessionStorage.setItem('user.login', 'x');

    service.logout('/');
    flushMicrotasks();

    expect(sessionStorage.getItem('user.login')).toBeNull();
    expect(redirectSpy).toHaveBeenCalledWith(PSS_LOGOUT_URL);
  }));

  it('should keep the oauth state stored by the mire url generation after the session purge', fakeAsync(() => {
    // Le callback retour_pss revalide le state généré ici : la purge ne doit pas l'effacer
    sessionStorage.setItem('user.login', 'x');
    mockOauthService.authentificationFrontUrl.and.callFake(() => {
      sessionStorage.setItem('pss_LastState', 'state-xyz');
      return MIRE_URL;
    });

    service.logout('/');
    flushMicrotasks();

    expect(sessionStorage.getItem('user.login')).toBeNull();
    expect(sessionStorage.getItem('pss_LastState')).toBe('state-xyz');
  }));

  it('should ignore a second call while a logout is already in progress', fakeAsync(() => {
    service.logout('/');
    service.logout('/');
    flushMicrotasks();

    expect(mockRefreshService.stopperRafraichissementEtDeconnecter).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledTimes(1);
  }));
});
