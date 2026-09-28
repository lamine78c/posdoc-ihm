import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { OngletPremierNiveau } from '@app/fullstack-components/onglets/models/onglets.models';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { of } from 'rxjs';
import { FondPageComponent } from './fond-page.component';

describe('FondPageComponent', () => {
  let component: FondPageComponent;
  let fixture: ComponentFixture<FondPageComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockOngletService: jasmine.SpyObj<OngletService>;
  let mockActivatedRoute: any;

  beforeEach(waitForAsync(() => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const ongletServiceSpy = jasmine.createSpyObj('OngletService', ['getIndexOnglet', 'navigateToFirstOnglet']);

    mockActivatedRoute = {
      fragment: of('Imprimés'),
    };

    TestBed.configureTestingModule({
      declarations: [FondPageComponent],
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
    mockActivatedRoute.fragment = of('Imprimés');
  });

  it('should create', () => {
    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize tabs with correct labels and permissions', () => {
    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.ongletNumEnum.ONGLET_NUMBER_IMPRIMES).toBe(0);
    expect(component.ongletNumEnum.ONGLET_NUMBER_REFERENCE).toBe(1);
    expect(component.tabs).toHaveSize(2);
    expect(component.tabs[0]).toEqual({ label: 'Imprimés', perm: AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.ID });
    expect(component.tabs[1]).toEqual({ label: 'Références', perm: AUTH.FICHIER_EDITION.FONDS_DE_PAGE.REFERENCES.ID });
  });

  it('should filter onglets based on user permissions', () => {
    mockPermissionService.hasPermission.and.callFake((perm: number) => {
      return perm === AUTH.FICHIER_EDITION.FONDS_DE_PAGE.IMPRIMES.ID;
    });

    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(1);
    expect(component.onglets[0].label).toBe('Imprimés');
  });

  it('should set active tab from URL fragment', () => {
    mockActivatedRoute.fragment = of('Imprimés');
    mockOngletService.getIndexOnglet.and.callFake((tabs, fragment) => {
      if (fragment === 'Imprimés') {
        return tabs.findIndex(tab => tab.label === 'Imprimés');
      }
      return -1;
    });

    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Imprimés');
    expect(component.active).toBe(0);
    expect(component.labelActif).toBe(0);
  });

  it('should navigate to first tab when no fragment is provided', () => {
    mockActivatedRoute.fragment = of(null);

    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
  });

  it('should handle empty onglets array when user has no permissions', () => {
    mockPermissionService.hasPermission.and.returnValue(false);

    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(0);
  });

  it('should update active and labelActif when setOngletActive is called', () => {
    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;

    mockOngletService.getIndexOnglet.and.callFake((tabs: OngletPremierNiveau[], _fragment: string) => {
      if (tabs === component.onglets) return 2;
      if (tabs === component.tabs) return 3;
      return 0;
    });

    component.setOngletActive('Références');
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Références');
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, 'Références');
    expect(component.active).toBe(2);
    expect(component.labelActif).toBe(3);
  });

  it('should handle fragment subscription lifecycle correctly', () => {
    const fragmentSpy = jasmine.createSpy('fragmentSubscribe').and.returnValue({ unsubscribe: jasmine.createSpy() });
    mockActivatedRoute.fragment = {
      subscribe: fragmentSpy,
    };

    fixture = TestBed.createComponent(FondPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fragmentSpy).toHaveBeenCalled();
  });
});
