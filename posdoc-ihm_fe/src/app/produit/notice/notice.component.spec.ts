import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { OngletService } from '@app/services/ongletService/onglet.service';
import { PermissionService } from '@app/services/permission/permission.service';
import { AUTH } from '@app/services/permission/PermissionsFile';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { NoticeComponent } from './notice.component';

describe('NoticeComponent', () => {
  let component: NoticeComponent;
  let fixture: ComponentFixture<NoticeComponent>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockOngletService: jasmine.SpyObj<OngletService>;
  let mockActivatedRoute: any;

  const labelNoticeActive = 'Notices actives';
  const labelNoticePerimee = 'Notices périmées';
  const labelAffectationNotice = 'Affectation notices';
  const labelNoticesFichiers = 'Notices de fichiers';

  beforeEach(waitForAsync(() => {
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['hasPermission']);
    mockOngletService = jasmine.createSpyObj('OngletService', ['getIndexOnglet', 'navigateToFirstOnglet']);

    mockActivatedRoute = {
      fragment: of('Notices actives'),
    };

    TestBed.configureTestingModule({
      declarations: [NoticeComponent],
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
    mockActivatedRoute.fragment = of(labelNoticeActive);

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tabs with correct labels and permissions', () => {
    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.tabs).toHaveSize(4);
    expect(component.tabs[0]).toEqual({ label: labelNoticeActive, perm: AUTH.FICHIER_EDITION.NOTICES.NOTICES_ACTIVES.ID });
    expect(component.tabs[1]).toEqual({ label: labelNoticePerimee, perm: AUTH.FICHIER_EDITION.NOTICES.NOTICES_PERIMEES.ID });
    expect(component.tabs[2]).toEqual({ label: labelAffectationNotice, perm: AUTH.FICHIER_EDITION.NOTICES.AFFECTATION_NOTICES.ID });
    expect(component.tabs[3]).toEqual({ label: labelNoticesFichiers, perm: AUTH.FICHIER_EDITION.NOTICES.NOTICES_FICHIERS.ID });
  });

  it('should filter onglets based on user permissions', () => {
    mockPermissionService.hasPermission.and.callFake((perm: number) => {
      return perm === AUTH.FICHIER_EDITION.NOTICES.NOTICES_ACTIVES.ID || perm === AUTH.FICHIER_EDITION.NOTICES.NOTICES_PERIMEES.ID;
    });

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(2);
    expect(component.onglets[0].label).toBe(labelNoticeActive);
    expect(component.onglets[1].label).toBe(labelNoticePerimee);
  });

  it('should set active tab from URL fragment', () => {
    mockActivatedRoute.fragment = of(labelNoticePerimee);
    mockOngletService.getIndexOnglet.and.callFake((tabs, fragment) => {
      if (fragment === labelNoticePerimee) {
        return tabs.findIndex(tab => tab.label === labelNoticePerimee);
      }
      return 0;
    });

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.getIndexOnglet).toHaveBeenCalledWith(component.onglets, labelNoticePerimee);
    expect(component.active).toBe(1);
    expect(component.labelActif).toBe(1);
  });

  it('should navigate to first tab when no fragment is provided', () => {
    mockActivatedRoute.fragment = of(null);

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockOngletService.navigateToFirstOnglet).toHaveBeenCalledWith(component.onglets);
  });

  it('should handle empty onglets array when user has no permissions', () => {
    mockPermissionService.hasPermission.and.returnValue(false);

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.onglets).toHaveSize(0);
  });

  it('should expose OngletTypeEnum and OngletNumEnum for template usage', () => {
    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.ongletTypeEnum).toBeDefined();
    expect(component.ongletNumEnum).toBeDefined();
    expect(component.ongletNumEnum.ONGLET_NUMBER_NOTICE_ACTIVE).toBe(0);
    expect(component.ongletNumEnum.ONGLET_NUMBER_NOTICE_PERIMEE).toBe(1);
    expect(component.ongletNumEnum.ONGLET_NUMBER_AFF_NOTICE).toBe(2);
  });

  it('should handle fragment subscription lifecycle correctly', () => {
    const mockFragment = jasmine.createSpy('fragmentSubscribe').and.returnValue({ unsubscribe: jasmine.createSpy() });
    mockActivatedRoute.fragment = {
      subscribe: mockFragment,
    };

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockFragment).toHaveBeenCalled();
  });

  it('activeChange event validity', () => {
    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      activeId: 1,
      nextId: 2,
    } as NgbNavChangeEvent;

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    component.activeChange(mockEvent);
    expect(component.labelActif).toBe(2);
  });
});
