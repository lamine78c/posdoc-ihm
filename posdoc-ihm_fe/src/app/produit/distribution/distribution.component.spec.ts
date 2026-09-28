import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DistributionComponent } from './distribution.component';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';

describe('DistributionComponent', () => {
  let component: DistributionComponent;
  let fixture: ComponentFixture<DistributionComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockOngletService: jasmine.SpyObj<OngletService>;
  let mockActivatedRoute: any;

  beforeEach(waitForAsync(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockOngletService = jasmine.createSpyObj('OngletService', ['getIndexOnglet', 'navigateToFirstOnglet']);

    mockActivatedRoute = {
      fragment: of('Exemplaires'),
    };

    TestBed.configureTestingModule({
      declarations: [DistributionComponent],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: OngletService, useValue: mockOngletService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockPermissionService.hasPermission.and.returnValue(true);
    mockOngletService.getIndexOnglet.and.returnValue(0);
    mockActivatedRoute.fragment = of('Exemplaires');
  });

  it('should create', () => {
    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize tabs with correct labels and permissions', () => {
    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.tabs).toHaveSize(3);
    expect(component.tabs[0]).toEqual({ label: 'Exemplaires', perm: AUTH.FICHIER_EDITION.DISTRIBUTION.EXEMPLAIRES.ID });
    expect(component.tabs[1]).toEqual({ label: 'Paramètres Edition en liste', perm: AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_EN_LISTE.ID });
    expect(component.tabs[2]).toEqual({
      label: 'Paramètres Edition par ressource',
      perm: AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.ID,
    });
  });

  it('should filter onglets based on user permissions', () => {
    mockPermissionService.hasPermission.and.callFake((perm: number) => {
      return perm === AUTH.FICHIER_EDITION.DISTRIBUTION.PARAM_EDITION_PAR_RESSOURCE.ID;
    });

    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(1);
    expect(component.onglets[0].label).toBe('Paramètres Edition par ressource');
  });

  it('should set active tab from URL fragment', () => {
    mockActivatedRoute.fragment = of('Paramètres Edition en liste');
    mockOngletService.getIndexOnglet.and.callFake((tabs, fragment) => {
      if (fragment === 'Paramètres Edition en liste') {
        return tabs.findIndex(tab => tab.label === 'Paramètres Edition en liste');
      }
      return 0;
    });

    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Paramètres Edition en liste');
    expect(component.active).toBe(1);
    expect(component.labelActif).toBe(1);
  });

  it('should navigate to first tab when no fragment is provided', () => {
    mockActivatedRoute.fragment = of(null);

    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
  });

  it('should handle empty onglets array when user has no permissions', () => {
    mockPermissionService.hasPermission.and.returnValue(false);

    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(0);
  });

  it('should prevent default behavior on activeChange event', () => {
    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;

    const mockEvent = { preventDefault: jasmine.createSpy('preventDefault') } as any as NgbNavChangeEvent;

    component.activeChange(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should update active and labelActif when setOngletActive is called', () => {
    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;

    mockOngletService.getIndexOnglet.and.callFake((tabs: OngletPremierNiveau[]) => {
      if (tabs === component.onglets) return 1;
      if (tabs === component.tabs) return 2;
      return 0;
    });

    component.setOngletActive('Paramètres Edition en liste');

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Paramètres Edition en liste');
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, 'Paramètres Edition en liste');
    expect(component.active).toBe(1);
    expect(component.labelActif).toBe(2);
  });

  it('should expose OngletTypeEnum and OngletNumEnum for template usage', () => {
    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.ongletTypeEnum).toBeDefined();
    expect(component.ongletNumEnum).toBeDefined();
    expect(component.ongletNumEnum.ONGLET_NUMBER_DIST_EXEMPLAIRE).toBe(0);
    expect(component.ongletNumEnum.ONGLET_NUMBER_DIST_PARAM_EDITION_LISTE).toBe(1);
    expect(component.ongletNumEnum.ONGLET_NUMBER_DIST_PARAM_EDITION_COLONNE).toBe(2);
  });

  it('should handle fragment subscription lifecycle correctly', () => {
    const fragmentSpy = jasmine.createSpy('fragmentSubscribe').and.returnValue({ unsubscribe: jasmine.createSpy() });
    mockActivatedRoute.fragment = {
      subscribe: fragmentSpy,
    };

    fixture = TestBed.createComponent(DistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fragmentSpy).toHaveBeenCalled();
  });
});
