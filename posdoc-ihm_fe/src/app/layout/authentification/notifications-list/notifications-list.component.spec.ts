import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { NotificationsListComponent } from './notifications-list.component';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { FaqNotification } from '@app/models/notification';
import { Faq, FaqStatusType } from '@app/models/faq-conversation';

describe('NotificationsListComponent', () => {
  let component: NotificationsListComponent;
  let fixture: ComponentFixture<NotificationsListComponent>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockApiContenuService: jasmine.SpyObj<ApiAdelaideContenuService>;

  const mockFaq: Faq = {
    id: 1,
    question: 'Comment accéder au tableau de bord ?',
    path: '/admin/dashboard',
    exchanges: [],
    answer: null,
    status: FaqStatusType.ENABLED,
    viewCount: 5,
    createdBy: '0000',
    updatedBy: '0000',
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-01-01T10:00:00'
  };

  const mockFaq2: Faq = {
    id: 2,
    question: 'Comment modifier mon profil ?',
    path: '/admin/profile',
    exchanges: [],
    answer: null,
    status: FaqStatusType.ENABLED,
    viewCount: 3,
    createdBy: '0000',
    updatedBy: '0000',
    createdAt: '2025-01-01T11:00:00',
    updatedAt: '2025-01-01T11:00:00'
  };

  const mockNotification1: FaqNotification = {
    id: 1,
    recipientId: 'user123',
    faq: mockFaq,
    createdAt: '2025-01-01T12:00:00'
  };

  const mockNotification2: FaqNotification = {
    id: 2,
    recipientId: 'user123',
    faq: mockFaq2,
    createdAt: '2025-01-01T13:00:00'
  };

  const mockPathLabelsResponse = {
    data: {
      getAllPathComplet: [
        { path: '/admin/dashboard', libelle: 'Tableau de bord' },
        { path: '/admin/profile', libelle: 'Mon profil' },
        { path: '/admin/settings', libelle: 'Paramètres' }
      ]
    }
  };

  beforeEach(waitForAsync(() => {
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockApiContenuService = jasmine.createSpyObj('ApiAdelaideContenuService', ['getAllPathComplet']);

    TestBed.configureTestingModule({
      declarations: [NotificationsListComponent],
      providers: [
        { provide: NgbModal, useValue: mockModalService },
        { provide: ApiAdelaideContenuService, useValue: mockApiContenuService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsListComponent);
    component = fixture.componentInstance;
    component.notifications = [mockNotification1];
    mockApiContenuService.getAllPathComplet.and.returnValue(of(mockPathLabelsResponse as any));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize pathLabels as empty Map', () => {
    expect(component.pathLabels).toBeInstanceOf(Map);
    expect(component.pathLabels.size).toBe(0);
  });

  it('should call loadPathLabels on ngOnInit', () => {
    spyOn<any>(component, 'loadPathLabels');

    component.ngOnInit();

    expect(component['loadPathLabels']).toHaveBeenCalled();
  });

  describe('loadPathLabels', () => {
    it('should populate pathLabels map with data from getAllPathComplet', () => {
      fixture.detectChanges();

      expect(mockApiContenuService.getAllPathComplet).toHaveBeenCalled();
      expect(component.pathLabels.size).toBe(3);
      expect(component.pathLabels.get('/admin/dashboard')).toBe('Tableau de bord');
      expect(component.pathLabels.get('/admin/profile')).toBe('Mon profil');
      expect(component.pathLabels.get('/admin/settings')).toBe('Paramètres');
    });

    it('should handle multiple path items', () => {
      const multiplePathsResponse = {
        data: {
          getAllPathComplet: [
            { path: '/path1', libelle: 'Label 1' },
            { path: '/path2', libelle: 'Label 2' },
            { path: '/path3', libelle: 'Label 3' },
            { path: '/path4', libelle: 'Label 4' },
            { path: '/path5', libelle: 'Label 5' }
          ]
        }
      };
      mockApiContenuService.getAllPathComplet.and.returnValue(of(multiplePathsResponse as any));

      fixture.detectChanges();

      expect(component.pathLabels.size).toBe(5);
      expect(component.pathLabels.get('/path1')).toBe('Label 1');
      expect(component.pathLabels.get('/path5')).toBe('Label 5');
    });

    it('should handle empty response from getAllPathComplet', () => {
      const emptyResponse = {
        data: {
          getAllPathComplet: []
        }
      };
      mockApiContenuService.getAllPathComplet.and.returnValue(of(emptyResponse as any));

      fixture.detectChanges();

      expect(component.pathLabels.size).toBe(0);
    });
  });

  describe('getPathLabel', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return label when path exists in pathLabels', () => {
      const label = component.getPathLabel('/admin/dashboard');

      expect(label).toBe('Tableau de bord');
    });

    it('should return raw path when path not found in pathLabels', () => {
      const label = component.getPathLabel('/unknown/path');

      expect(label).toBe('/unknown/path');
    });

    it('should handle empty pathLabels map', () => {
      component.pathLabels.clear();

      const label = component.getPathLabel('/admin/dashboard');

      expect(label).toBe('/admin/dashboard');
    });
  });

  describe('openModal', () => {
    let mockModalRef: jasmine.SpyObj<NgbModalRef>;

    beforeEach(() => {
      mockModalRef = jasmine.createSpyObj('NgbModalRef', ['close', 'dismiss']);
      Object.defineProperty(mockModalRef, 'componentInstance', {
        value: {},
        writable: true
      });
      mockModalService.open.and.returnValue(mockModalRef);
      spyOn<any>(component, 'configureModal');
      fixture.detectChanges();
    });

    it('should open modal with correct configuration', () => {
      component.openModal();

      expect(mockModalService.open).toHaveBeenCalledWith(
        jasmine.anything(),
        {
          size: 'lg',
          backdrop: 'static',
          windowClass: 'notifications-modal'
        }
      );
    });

    it('should call configureModal with the modal reference', () => {
      component.openModal();

      expect(component['configureModal']).toHaveBeenCalledWith(mockModalRef);
    });
  });

  describe('configureModal', () => {
    let mockModalRef: jasmine.SpyObj<NgbModalRef>;

    beforeEach(() => {
      mockModalRef = jasmine.createSpyObj('NgbModalRef', ['close', 'dismiss']);
      Object.defineProperty(mockModalRef, 'componentInstance', {
        value: {},
        writable: true
      });
      fixture.detectChanges();
    });

    it('should set modalRef on modal instance', () => {
      component['configureModal'](mockModalRef);

      expect(mockModalRef.componentInstance.modalRef).toBe(mockModalRef);
    });

    it('should set title to "Notifications"', () => {
      component['configureModal'](mockModalRef);

      expect(mockModalRef.componentInstance.title).toBe('Notifications');
    });

    it('should set firstButton with correct label and icon', () => {
      component['configureModal'](mockModalRef);

      expect(mockModalRef.componentInstance.firstButton).toEqual({
        label: 'Fermer',
        icone: 'icon-b_cancel'
      });
    });

    it('should set secondButton to null', () => {
      component['configureModal'](mockModalRef);

      expect(mockModalRef.componentInstance.secondButton).toBeNull();
    });

    it('should set isFormValid to true', () => {
      component['configureModal'](mockModalRef);

      expect(mockModalRef.componentInstance.isFormValid).toBe(true);
    });

    it('should set isShowcontentTemplate to true', () => {
      component['configureModal'](mockModalRef);

      expect(mockModalRef.componentInstance.isShowcontentTemplate).toBe(true);
    });

    it('should set contentTemplate to notificationsTemplate', () => {
      component['configureModal'](mockModalRef);

      expect(mockModalRef.componentInstance.contentTemplate).toBe(component.notificationsTemplate);
    });
  });
});
