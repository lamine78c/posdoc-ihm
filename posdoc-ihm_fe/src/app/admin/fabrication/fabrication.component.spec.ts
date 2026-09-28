import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { FabricationComponent } from './fabrication.component';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';

describe('FabricationComponent', () => {
  let component: FabricationComponent;
  let fixture: ComponentFixture<FabricationComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockOngletService: jasmine.SpyObj<OngletService>;
  let mockActivatedRoute: any;

  beforeEach(waitForAsync(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const ongletServiceSpy = jasmine.createSpyObj('OngletService', ['getIndexOnglet', 'navigateToFirstOnglet']);

    mockActivatedRoute = {
      fragment: of('Serveurs'),
    };

    TestBed.configureTestingModule({
      declarations: [FabricationComponent],
      providers: [
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: OngletService, useValue: ongletServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    mockPermissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    mockOngletService = TestBed.inject(OngletService) as jasmine.SpyObj<OngletService>;
  }));

  beforeEach(() => {
    mockPermissionService.hasPermission.and.returnValue(true);
    mockOngletService.getIndexOnglet.and.returnValue(0);
    mockActivatedRoute.fragment = of('Serveurs');
  });

  it('should create', () => {
    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize tabs with correct labels and permissions', () => {
    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.tabs).toHaveSize(5);
    expect(component.tabs[0]).toEqual({ label: 'Serveurs', perm: AUTH.ADMINISTRATION.FABRICATION.SERVEURS.ID });
    expect(component.tabs[1]).toEqual({ label: 'Gammes', perm: AUTH.ADMINISTRATION.FABRICATION.GAMMES.ID });
    expect(component.tabs[2]).toEqual({ label: 'Verrous', perm: AUTH.ADMINISTRATION.FABRICATION.VERROUS.ID });
    expect(component.tabs[3]).toEqual({ label: 'Paramètres Distribution', perm: AUTH.ADMINISTRATION.FABRICATION.PARAMETRES_DISCRIBUTIONS.ID });
    expect(component.tabs[4]).toEqual({ label: 'Ressources', perm: AUTH.ADMINISTRATION.FABRICATION.RESSOURCES.ID });
  });

  it('should filter onglets based on user permissions', () => {
    mockPermissionService.hasPermission.and.callFake((perm: number) => {
      return perm === AUTH.ADMINISTRATION.FABRICATION.SERVEURS.ID || perm === AUTH.ADMINISTRATION.FABRICATION.GAMMES.ID;
    });

    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(2);
    expect(component.onglets[0].label).toBe('Serveurs');
    expect(component.onglets[1].label).toBe('Gammes');
  });

  it('should set active tab from URL fragment', () => {
    mockActivatedRoute.fragment = of('Gammes');
    mockOngletService.getIndexOnglet.and.callFake((tabs, fragment) => {
      if (fragment === 'Gammes') {
        return tabs.findIndex(tab => tab.label === 'Gammes');
      }
      return 0;
    });

    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Gammes');
    expect(component.active).toBe(1);
    expect(component.labelActif).toBe(1);
  });

  it('should navigate to first tab when no fragment is provided', () => {
    mockActivatedRoute.fragment = of(null);

    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
  });

  it('should handle empty onglets array when user has no permissions', () => {
    mockPermissionService.hasPermission.and.returnValue(false);

    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(0);
  });

  it('should prevent default behavior on activeChange event', () => {
    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;

    const mockEvent = { preventDefault: jasmine.createSpy('preventDefault') } as any as NgbNavChangeEvent;

    component.activeChange(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should update active and labelActif when setOngletActive is called', () => {
    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;

    mockOngletService.getIndexOnglet.and.callFake((tabs: OngletPremierNiveau[], _fragment: string) => {
      if (tabs === component.onglets) return 2;
      if (tabs === component.tabs) return 3;
      return 0;
    });

    component.setOngletActive('Verrous');

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Verrous');
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, 'Verrous');
    expect(component.active).toBe(2);
    expect(component.labelActif).toBe(3);
  });

  it('should expose OngletTypeEnum and OngletNumEnum for template usage', () => {
    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.ongletTypeEnum).toBeDefined();
    expect(component.ongletNumEnum).toBeDefined();
    expect(component.ongletNumEnum.ONGLET_NUMBER_SERVEUR).toBe(0);
    expect(component.ongletNumEnum.ONGLET_NUMBER_GAMME).toBe(1);
    expect(component.ongletNumEnum.ONGLET_NUMBER_VERROU).toBe(2);
    expect(component.ongletNumEnum.ONGLET_NUMBER_PARAM_DIST).toBe(3);
    expect(component.ongletNumEnum.ONGLET_NUMBER_RESSOURCE).toBe(4);
  });

  it('should handle fragment subscription lifecycle correctly', () => {
    const fragmentSpy = jasmine.createSpy('fragmentSubscribe').and.returnValue({ unsubscribe: jasmine.createSpy() });
    mockActivatedRoute.fragment = {
      subscribe: fragmentSpy,
    };

    fixture = TestBed.createComponent(FabricationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fragmentSpy).toHaveBeenCalled();
  });
});
