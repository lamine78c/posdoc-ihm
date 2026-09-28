import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ProductionComponent } from './production.component';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { ZERO, ONE } from '@app/shared/utils/Constants';

describe('ProductionComponent', () => {
  let component: ProductionComponent;
  let fixture: ComponentFixture<ProductionComponent>;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let ongletService: jasmine.SpyObj<OngletService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const permissionServiceSpy = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    const ongletServiceSpy = jasmine.createSpyObj('OngletService', ['getIndexOnglet', 'navigateToFirstOnglet']);
    const activatedRouteSpy = {
      fragment: of(null),
    };

    await TestBed.configureTestingModule({
      declarations: [ProductionComponent],
      providers: [
        { provide: PermissionService, useValue: permissionServiceSpy },
        { provide: OngletService, useValue: ongletServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductionComponent);
    component = fixture.componentInstance;
    permissionService = TestBed.inject(PermissionService) as jasmine.SpyObj<PermissionService>;
    ongletService = TestBed.inject(OngletService) as jasmine.SpyObj<OngletService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs with correct labels and permissions', () => {
    expect(component.tabs.length).toBe(2);
    expect(component.tabs[0].label).toBe("Occurrences d'application");
    expect(component.tabs[0].perm).toBe(AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID);
    expect(component.tabs[1].label).toBe('Occurrences de fichiers');
    expect(component.tabs[1].perm).toBe(AUTH.SUIVI.PRODUCTION.OCCURENCES_FICHIERS.ID);
  });

  it('should filter onglets based on user permissions when user has permission', () => {
    permissionService.hasPermission.and.returnValue(true);
    ongletService.getIndexOnglet.and.returnValue(ZERO);

    component.ngOnInit();

    expect(component.onglets.length).toBe(2);
    expect(permissionService.hasPermission).toHaveBeenCalledTimes(2);
    expect(permissionService.hasPermission).toHaveBeenCalledWith(AUTH.SUIVI.PRODUCTION.OCCURENCES_APPLICATION.ID);
    expect(permissionService.hasPermission).toHaveBeenCalledWith(AUTH.SUIVI.PRODUCTION.OCCURENCES_FICHIERS.ID);
  });

  it('should filter onglets based on user permissions when user has no permission', () => {
    permissionService.hasPermission.and.returnValue(false);

    component.ngOnInit();

    expect(component.onglets.length).toBe(0);
    expect(permissionService.hasPermission).toHaveBeenCalled();
  });

  it('should navigate tab to first onglet when no fragment is provided', () => {
    permissionService.hasPermission.and.returnValue(true);
    activatedRoute.fragment = of(null);

    component.ngOnInit();

    expect(ongletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
  });

  it('should set active tab based on route fragment', () => {
    const fragment = 'Occurrences de fichiers';
    permissionService.hasPermission.and.returnValue(true);
    ongletService.getIndexOnglet.and.returnValue(ONE);
    activatedRoute.fragment = of(fragment);

    component.ngOnInit();

    expect(ongletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, fragment);
    expect(component.active).toBe(ONE);
  });

  it('should call setOngletActive with correct fragment', () => {
    const fragment = "Occurrences d'application";
    permissionService.hasPermission.and.returnValue(true);
    ongletService.getIndexOnglet.and.returnValue(ZERO);
    activatedRoute.fragment = of(fragment);
    spyOn(component, 'setOngletActive');

    component.ngOnInit();

    expect(component.setOngletActive).toHaveBeenCalled();
  });

  it('should correctly set active and labelActif in setOngletActive method', () => {
    const fragment = 'Occurrences de fichiers';
    const expectedIndex = ONE;
    ongletService.getIndexOnglet.and.returnValue(expectedIndex);
    component.onglets = component.tabs;

    component.setOngletActive(fragment);

    expect(component.active).toBe(expectedIndex);
    expect(component.labelActif).toBe(expectedIndex);
    expect(ongletService.getIndexOnglet).toHaveBeenCalledTimes(2);
  });

  it('should have correct OngletNumEnum values', () => {
    expect(component.ongletNumEnum.ONGLET_NUMBER_OCCURRENCES_APPLICATION).toBe(ZERO);
    expect(component.ongletNumEnum.ONGLET_NUMBER_OCCURRENCES_FICHIERS).toBe(ONE);
  });

  it('should not set active tab when no onglets are available', () => {
    permissionService.hasPermission.and.returnValue(false);
    activatedRoute.fragment = of('test');

    component.ngOnInit();

    expect(component.onglets.length).toBe(0);
    expect(component.active).toBeUndefined();
  });

  it('should handle multiple calls to setOngletActive', () => {
    ongletService.getIndexOnglet.and.returnValues(ZERO, ZERO, ONE, ONE);
    component.onglets = component.tabs;

    component.setOngletActive("Occurrences d'application");
    expect(component.active).toBe(ZERO);
    expect(component.labelActif).toBe(ZERO);

    component.setOngletActive('Occurrences de fichiers');
    expect(component.active).toBe(ONE);
    expect(component.labelActif).toBe(ONE);
  });
});
