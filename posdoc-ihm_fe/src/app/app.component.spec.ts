import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {AppComponent} from './app.component';
import {LoginService, RefreshService} from '@acoss/prisme-angular-intranet';
import {TokenExpirationService} from '@app/shared/services/TokenExpirationService';
import {FrontTokenRefreshService} from '@app/shared/services/front-token-refresh.service';
import {InactivityLogoutService} from '@app/shared/services/inactivity-logout.service';
import {TOKEN_EXPIRATION_CHECK_INTERVAL} from '@app/shared/utils/Constants';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  let mockRefreshService: jasmine.SpyObj<RefreshService>;
  let mockTokenExpirationService: jasmine.SpyObj<TokenExpirationService>;
  let mockFrontTokenRefreshService: jasmine.SpyObj<FrontTokenRefreshService>;
  let mockInactivityLogoutService: jasmine.SpyObj<InactivityLogoutService>;

  beforeEach(async () => {
    mockLoginService = jasmine.createSpyObj('LoginService', ['hasAccessTokenBackInStorage']);
    mockRefreshService = jasmine.createSpyObj('RefreshService', ['relancerRafraichissement']);
    mockTokenExpirationService = jasmine.createSpyObj('TokenExpirationService', [
      'startTokenExpirationCheck',
      'stopTokenExpirationCheck'
    ]);
    mockFrontTokenRefreshService = jasmine.createSpyObj('FrontTokenRefreshService', ['start', 'stop']);
    mockInactivityLogoutService = jasmine.createSpyObj('InactivityLogoutService', ['start', 'stop']);

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: LoginService, useValue: mockLoginService },
        { provide: RefreshService, useValue: mockRefreshService },
        { provide: TokenExpirationService, useValue: mockTokenExpirationService },
        { provide: FrontTokenRefreshService, useValue: mockFrontTokenRefreshService },
        { provide: InactivityLogoutService, useValue: mockInactivityLogoutService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Init component', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.title).toBe('posdoc-fe-ihm');
      expect(component.openSideBar).toBe(true);
      expect(component.subscription).toBeUndefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call relancerRafraichissement when user has access token', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(true);
      component.ngOnInit();
      expect(mockLoginService.hasAccessTokenBackInStorage).toHaveBeenCalled();
      expect(mockRefreshService.relancerRafraichissement).toHaveBeenCalled();
      expect(mockTokenExpirationService.startTokenExpirationCheck)
        .toHaveBeenCalledWith(TOKEN_EXPIRATION_CHECK_INTERVAL);
    });

    it('should not call relancerRafraichissement when user has no access token', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(false);
      component.ngOnInit();
      expect(mockLoginService.hasAccessTokenBackInStorage).toHaveBeenCalled();
      expect(mockRefreshService.relancerRafraichissement).not.toHaveBeenCalled();
      expect(mockTokenExpirationService.startTokenExpirationCheck)
        .toHaveBeenCalledWith(TOKEN_EXPIRATION_CHECK_INTERVAL);
    });

    it('should always start token expiration check regardless of token presence', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(true);
      component.ngOnInit();
      expect(mockTokenExpirationService.startTokenExpirationCheck)
        .toHaveBeenCalledWith(TOKEN_EXPIRATION_CHECK_INTERVAL);
      mockTokenExpirationService.startTokenExpirationCheck.calls.reset();
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(false);
      component.ngOnInit();
      expect(mockTokenExpirationService.startTokenExpirationCheck)
        .toHaveBeenCalledWith(TOKEN_EXPIRATION_CHECK_INTERVAL);
    });
  });

  describe('toggleSideBar', () => {
    it('should toggle openSideBar from true to false', () => {
      component.openSideBar = true;
      component.toggleSideBar();
      expect(component.openSideBar).toBe(false);
    });

    it('should toggle openSideBar from false to true', () => {
      component.openSideBar = false;
      component.toggleSideBar();
      expect(component.openSideBar).toBe(true);
    });

    it('should toggle multiple times correctly', () => {
      component.openSideBar = true;
      component.toggleSideBar();
      expect(component.openSideBar).toBe(false);

      component.toggleSideBar();
      expect(component.openSideBar).toBe(true);

      component.toggleSideBar();
      expect(component.openSideBar).toBe(false);
    });
  });

  describe('isConnecte', () => {
    it('should return true when user has access token', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(true);
      const result = component.isConnecte();
      expect(result).toBe(true);
      expect(mockLoginService.hasAccessTokenBackInStorage).toHaveBeenCalled();
    });

    it('should return false when user has no access token', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(false);
      const result = component.isConnecte();
      expect(result).toBe(false);
      expect(mockLoginService.hasAccessTokenBackInStorage).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe and stop token expiration check when subscription exists', () => {
      const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component.subscription = mockSubscription;
      component.ngOnDestroy();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(mockTokenExpirationService.stopTokenExpirationCheck).toHaveBeenCalled();
    });

    it('should handle ngOnDestroy when subscription is undefined', () => {
      component.subscription = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
      expect(mockTokenExpirationService.stopTokenExpirationCheck).toHaveBeenCalled();
    });

    it('should stop token expiration check even if subscription is null', () => {
      component.subscription = null;
      component.ngOnDestroy();
      expect(mockTokenExpirationService.stopTokenExpirationCheck).toHaveBeenCalled();
    });
  });

  describe('Services integrations', () => {
    it('should inject all required services', () => {
      expect(component['loginService']).toBeDefined();
      expect(component['refreshService']).toBeDefined();
      expect(component['tokenExpirationService']).toBeDefined();
    });

    it('should call services in correct order during initialization', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(true);
      let callOrder: string[] = [];

      mockLoginService.hasAccessTokenBackInStorage.and.callFake(() => {
        callOrder.push('hasAccessTokenBackInStorage');
        return true;
      });

      mockRefreshService.relancerRafraichissement.and.callFake(() => {
        callOrder.push('relancerRafraichissement');
      });

      mockTokenExpirationService.startTokenExpirationCheck.and.callFake(() => {
        callOrder.push('startTokenExpirationCheck');
      });
      component.ngOnInit();
      expect(callOrder).toEqual([
        'hasAccessTokenBackInStorage',
        'relancerRafraichissement',
        'startTokenExpirationCheck'
      ]);
    });
  });

  describe('Error handling', () => {
    it('should handle error in loginService.hasAccessTokenBackInStorage', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.throwError('Service error');
      expect(() => component.ngOnInit()).toThrowError('Service error');
    });

    it('should handle error in refreshService.relancerRafraichissement', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(true);
      mockRefreshService.relancerRafraichissement.and.throwError('Refresh error');
      expect(() => component.ngOnInit()).toThrowError('Refresh error');
    });

    it('should handle error in tokenExpirationService.startTokenExpirationCheck', () => {
      mockLoginService.hasAccessTokenBackInStorage.and.returnValue(false);
      mockTokenExpirationService.startTokenExpirationCheck.and.throwError('Token service error');
      expect(() => component.ngOnInit()).toThrowError('Token service error');
    });
  });
});
