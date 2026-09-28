import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { OrganismeComponent, OngletNumEnum } from './organisme.component';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';
import { of } from 'rxjs';

describe('OrganismeComponent', () => {
  let component: OrganismeComponent;
  let fixture: ComponentFixture<OrganismeComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockOngletService: jasmine.SpyObj<OngletService>;
  let mockActivatedRoute: any;

  beforeEach(waitForAsync(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockOngletService = jasmine.createSpyObj('OngletService', ['getIndexOnglet', 'navigateToFirstOnglet']);
    mockActivatedRoute = {
      fragment: of(null),
    };

    TestBed.configureTestingModule({
      declarations: [OrganismeComponent],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: OngletService, useValue: mockOngletService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockPermissionService.hasPermission.and.returnValue(true);
    mockOngletService.getIndexOnglet.and.returnValue(0);

    fixture = TestBed.createComponent(OrganismeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs with correct labels and permissions', () => {
    expect(component.tabs).toEqual([
      { label: 'Organismes', perm: AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.ID },
      { label: 'Régions', perm: AUTH.ADMINISTRATION.ORGANISMES.REGION.ID },
      { label: 'Sites', perm: AUTH.ADMINISTRATION.ORGANISMES.SITE.ID },
    ]);
  });

  it('should initialize enum properties correctly', () => {
    expect(component.ongletTypeEnum).toBe(OngletTypeEnum);
    expect(component.ongletNumEnum).toBe(OngletNumEnum);
  });

  it('should filter tabs based on user permissions when all permissions are granted', () => {
    fixture = TestBed.createComponent(OrganismeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(3);
  });

  it('should filter out tabs when user lacks permissions', () => {
    mockPermissionService.hasPermission.and.callFake(perm => {
      return perm !== AUTH.ADMINISTRATION.ORGANISMES.ORGANISME.ID;
    });

    fixture = TestBed.createComponent(OrganismeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(2);
    expect(component.onglets[0].label).toBe('Régions');
  });

  it('should handle fragment subscription and navigate to first tab when fragment is null', () => {
    const fragmentSubject = of(null);
    mockActivatedRoute.fragment = fragmentSubject;
    fixture = TestBed.createComponent(OrganismeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
  });

  it('should handle fragment subscription with specific fragment value', () => {
    const fragmentSubject = of('Sites');
    mockActivatedRoute.fragment = fragmentSubject;
    mockOngletService.getIndexOnglet.and.returnValue(2);
    fixture = TestBed.createComponent(OrganismeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Sites');
  });

  it('should prevent default behavior on activeChange event', () => {
    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as NgbNavChangeEvent;

    component.activeChange(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should set active and labelActif correctly in setOngletActive', () => {
    mockOngletService.getIndexOnglet.and.returnValues(0, 0);

    component.setOngletActive('Organismes');

    expect(component.active).toBe(0);
    expect(component.labelActif).toBe(0);
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Organismes');
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, 'Organismes');
  });

  it('should handle empty onglets array when user has no permissions', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    fixture = TestBed.createComponent(OrganismeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toEqual([]);
    // When onglets array is empty, getIndexOnglet is not called because the condition checks onglets.length > 0
    expect(mockOngletService.getIndexOnglet).not.toHaveBeenCalled();
  });

  it('should verify OngletNumEnum values match expected constants', () => {
    expect(OngletNumEnum.ONGLET_NUMBER_ORGANISME).toBe(0);
    expect(OngletNumEnum.ONGLET_NUMBER_REGION).toBe(1);
    expect(OngletNumEnum.ONGLET_NUMBER_SITE).toBe(2);
  });
});
