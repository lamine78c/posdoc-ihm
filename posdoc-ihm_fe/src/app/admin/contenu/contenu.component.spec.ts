import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { ContenuComponent, OngletNumEnum } from './contenu.component';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { AUTH } from '@app/services/permission/PermissionsFile';

describe('ContenuComponent', () => {
  let component: ContenuComponent;
  let fixture: ComponentFixture<ContenuComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockOngletService: jasmine.SpyObj<OngletService>;
  let mockActivatedRoute: any;

  const mockTabs: OngletPremierNiveau[] = [
    { label: "Pages d'accueil", perm: AUTH.ADMINISTRATION.CONTENU.PAGE_ACCUEIL.ID },
    { label: 'Aide', perm: AUTH.ADMINISTRATION.CONTENU.AIDE.ID },
    { label: 'FAQ', perm: AUTH.ADMINISTRATION.CONTENU.FAQ.ID },
  ];

  beforeEach(async () => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockOngletService = jasmine.createSpyObj('OngletService', ['getIndexOnglet', 'navigateToFirstOnglet']);
    mockActivatedRoute = {
      fragment: of(null),
    };

    await TestBed.configureTestingModule({
      declarations: [ContenuComponent],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: OngletService, useValue: mockOngletService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContenuComponent);
    component = fixture.componentInstance;
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct enum references', () => {
      expect(component.ongletTypeEnum).toBe(OngletTypeEnum);
      expect(component.ongletNumEnum).toBe(OngletNumEnum);
    });

    it('should initialize tabs with correct structure', () => {
      expect(component.tabs).toEqual(mockTabs);
      expect(component.tabs.length).toBe(3);
      expect(component.tabs[0].label).toBe("Pages d'accueil");
      expect(component.tabs[0].perm).toBe(AUTH.ADMINISTRATION.CONTENU.PAGE_ACCUEIL.ID);
      expect(component.tabs[1].label).toBe('Aide');
      expect(component.tabs[1].perm).toBe(AUTH.ADMINISTRATION.CONTENU.AIDE.ID);
      expect(component.tabs[2].label).toBe('FAQ');
      expect(component.tabs[2].perm).toBe(AUTH.ADMINISTRATION.CONTENU.FAQ.ID);
    });
  });

  describe('Constructor logic', () => {
    beforeEach(() => {
      mockPermissionService.hasPermission.and.returnValue(true);
      mockOngletService.getIndexOnglet.and.returnValue(0);
    });

    it('should filter tabs based on permissions when user has permission', () => {
      mockActivatedRoute.fragment = of(null);

      fixture = TestBed.createComponent(ContenuComponent);
      component = fixture.componentInstance;

      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.CONTENU.PAGE_ACCUEIL.ID);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.CONTENU.AIDE.ID);
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.CONTENU.FAQ.ID);
      expect(component.onglets).toEqual(mockTabs);
      expect(component.onglets.length).toBe(3);
    });

    it('should filter out tabs when user does not have permission', () => {
      mockPermissionService.hasPermission.and.returnValue(false);
      mockActivatedRoute.fragment = of(null);

      fixture = TestBed.createComponent(ContenuComponent);
      component = fixture.componentInstance;

      expect(component.onglets).toEqual([]);
    });

    it('should navigate to first tab when no fragment is provided', () => {
      mockActivatedRoute.fragment = of(null);

      fixture = TestBed.createComponent(ContenuComponent);
      component = fixture.componentInstance;

      expect(mockOngletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
    });

    it('should set active tab based on fragment when provided', () => {
      const testFragment = 'test-fragment';
      mockActivatedRoute.fragment = of(testFragment);

      fixture = TestBed.createComponent(ContenuComponent);
      component = fixture.componentInstance;

      expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, testFragment);
      expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, testFragment);
    });

    it('should not call setOngletActive when no onglets are available', () => {
      mockPermissionService.hasPermission.and.returnValue(false);
      mockActivatedRoute.fragment = of(null);

      const setOngletActiveSpy = spyOn(ContenuComponent.prototype, 'setOngletActive');

      fixture = TestBed.createComponent(ContenuComponent);
      component = fixture.componentInstance;

      expect(setOngletActiveSpy).not.toHaveBeenCalled();
      expect(component.onglets.length).toBe(0);
    });
  });

  describe('activeChange method', () => {
    it('should prevent default event', () => {
      const mockEvent = jasmine.createSpyObj<NgbNavChangeEvent>('NgbNavChangeEvent', ['preventDefault']);

      component.activeChange(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('setOngletActive method', () => {
    beforeEach(() => {
      component.onglets = mockTabs;
      component.tabs = mockTabs;
      mockOngletService.getIndexOnglet.and.returnValue(0);
    });

    it('should set active and labelActif properties correctly', () => {
      const testFragment = 'test-fragment';

      component.setOngletActive(testFragment);

      expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, testFragment);
      expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, testFragment);
      expect(component.active).toBe(0);
      expect(component.labelActif).toBe(0);
    });

    it('should handle different index values from ongletService', () => {
      mockOngletService.getIndexOnglet.and.returnValues(1, 2);

      component.setOngletActive('fragment');

      expect(component.active).toBe(1);
      expect(component.labelActif).toBe(2);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete flow with permissions and fragment', () => {
      mockPermissionService.hasPermission.and.returnValue(true);
      mockOngletService.getIndexOnglet.and.returnValue(0);
      mockActivatedRoute.fragment = of('test-fragment');

      fixture = TestBed.createComponent(ContenuComponent);
      component = fixture.componentInstance;

      expect(component.onglets.length).toBe(3);
      expect(component.active).toBe(0);
      expect(component.labelActif).toBe(0);
    });

    it('should handle empty permissions scenario', () => {
      mockPermissionService.hasPermission.and.returnValue(false);
      mockActivatedRoute.fragment = of('any-fragment');

      fixture = TestBed.createComponent(ContenuComponent);
      component = fixture.componentInstance;

      expect(component.onglets.length).toBe(0);
      expect(component.active).toBeUndefined();
      expect(component.labelActif).toBeUndefined();
    });
  });

  describe('Properties and enums', () => {
    it('should have correct OngletNumEnum values', () => {
      expect(OngletNumEnum.ONGLET_NUMBER_ACCUEIL).toBe(0);
    });

    it('should expose OngletTypeEnum correctly', () => {
      expect(component.ongletTypeEnum).toBeDefined();
      expect(component.ongletTypeEnum).toBe(OngletTypeEnum);
    });

    it('should expose OngletNumEnum correctly', () => {
      expect(component.ongletNumEnum).toBeDefined();
      expect(component.ongletNumEnum).toBe(OngletNumEnum);
    });
  });
});
