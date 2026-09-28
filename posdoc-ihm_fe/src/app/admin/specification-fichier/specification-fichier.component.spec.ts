import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { SpecificationFichierComponent, OngletNumEnum } from './specification-fichier.component';
import { PermissionService } from '@app/services/permission/permission.service';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { OngletTypeEnum } from '@app/fullstack-components/onglets/components/onglet/onglet.component';

describe('SpecificationFichierComponent', () => {
  let component: SpecificationFichierComponent;
  let fixture: ComponentFixture<SpecificationFichierComponent>;
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
      declarations: [SpecificationFichierComponent],
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
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with correct tabs configuration', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.tabs.length).toBe(6);
    expect(component.tabs[0].label).toBe('Compositions');
    expect(component.tabs[1].label).toBe('Formats');
    expect(component.tabs[2].label).toBe('Multi feuillets');
    expect(component.tabs[3].label).toBe('Supports');
    expect(component.tabs[4].label).toBe('Echantillons');
    expect(component.tabs[5].label).toBe('Rééditions');
  });

  it('should initialize tabs with correct permissions', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.tabs[0].perm).toBe(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.COMPOSITIONS.ID);
    expect(component.tabs[1].perm).toBe(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.FORMATS.ID);
    expect(component.tabs[2].perm).toBe(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.MULTI_FEUILLETS.ID);
    expect(component.tabs[3].perm).toBe(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.SUPPORTS.ID);
    expect(component.tabs[4].perm).toBe(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.ID);
    expect(component.tabs[5].perm).toBe(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS.ID);
  });

  it('should filter onglets based on user permissions', () => {
    mockPermissionService.hasPermission.and.callFake((perm: number) => {
      return perm === AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.COMPOSITIONS.ID || perm === AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.FORMATS.ID;
    });

    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets.length).toBe(2);
    expect(component.onglets[0].label).toBe('Compositions');
    expect(component.onglets[1].label).toBe('Formats');
  });

  it('should navigate to first onglet when no fragment is provided', () => {
    mockActivatedRoute.fragment = of(null);

    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
  });

  it('should set active tab based on fragment parameter', () => {
    mockActivatedRoute.fragment = of('Formats');
    mockOngletService.getIndexOnglet.and.returnValue(1);

    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Formats');
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, 'Formats');
  });

  it('should activate onglet based on URL fragment on initialization', () => {
    mockActivatedRoute.fragment = of('Supports');
    mockOngletService.getIndexOnglet.and.returnValues(3, 3);

    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Supports');
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, 'Supports');
    expect(component.active).toBe(3);
    expect(component.labelActif).toBe(3);
  });

  it('should prevent default on activeChange event', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      activeId: 1,
      nextId: 2,
    } as any as NgbNavChangeEvent;

    component.activeChange(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should set active and labelActif in setOngletActive method', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    mockOngletService.getIndexOnglet.and.returnValues(1, 1);

    component.setOngletActive('Formats');

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, 'Formats');
    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.tabs, 'Formats');
    expect(component.active).toBe(1);
    expect(component.labelActif).toBe(1);
  });

  it('should expose OngletTypeEnum correctly', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.ongletTypeEnum).toBe(OngletTypeEnum);
  });

  it('should expose OngletNumEnum correctly', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.ongletNumEnum).toBe(OngletNumEnum);
    expect(component.ongletNumEnum.ONGLET_NUMBER_COMPOSITION).toBe(0);
    expect(component.ongletNumEnum.ONGLET_NUMBER_FORMAT).toBe(1);
    expect(component.ongletNumEnum.ONGLET_NUMBER_MULTIF).toBe(2);
    expect(component.ongletNumEnum.ONGLET_NUMBER_SUPPORT).toBe(3);
    expect(component.ongletNumEnum.ONGLET_NUMBER_ECHANT).toBe(4);
    expect(component.ongletNumEnum.ONGLET_NUMBER_EDIT).toBe(5);
  });

  it('should handle case when user has no permissions and onglets array is empty', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    mockActivatedRoute.fragment = of(null);

    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets.length).toBe(0);
    expect(mockOngletService.getIndexOnglet).not.toHaveBeenCalled();
  });

  it('should call permissionService.hasPermission for each tab', () => {
    fixture = TestBed.createComponent(SpecificationFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(6);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.COMPOSITIONS.ID);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.FORMATS.ID);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.MULTI_FEUILLETS.ID);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.SUPPORTS.ID);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.ECHANTILLONS.ID);
    expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(AUTH.ADMINISTRATION.SPECIFICATION_FICHIER.REEDITIONS.ID);
  });
});
