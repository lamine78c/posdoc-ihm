import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';

import { ConversationComponent } from './conversation.component';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { FaqStatusType } from '@app/models/faq-conversation';
import { NotificationsRefreshService } from '@app/shared/services/notifications-refresh.service';

describe('ConversationComponent', () => {
  let component: ConversationComponent;
  let fixture: ComponentFixture<ConversationComponent>;
  let mockFaqService: jasmine.SpyObj<ApiAdelaideFaqService>;
  let mockContenuService: jasmine.SpyObj<ApiAdelaideContenuService>;
  let mockNotificationsRefreshService: { refresh$: Subject<void> };

  const CURRENT_USER = '0000';
  const OTHER_USER = '1111';

  const mockRawFaqs: any[] = [
    {
      id: 1,
      question: 'Old Question',
      createdBy: CURRENT_USER,
      updatedAt: '2025-01-01T10:00:00',
      status: FaqStatusType.DRAFT,
      exchanges: [
        { id: 11, author: CURRENT_USER, message: 'Me', createdAt: '2025-01-01T10:00:00' },
        { id: 12, author: OTHER_USER, message: 'Support', createdAt: '2025-01-01T10:05:00' }
      ]
    },
    {
      id: 2,
      question: 'Recent Question',
      createdBy: CURRENT_USER,
      updatedAt: '2025-01-02T10:00:00',
      status: FaqStatusType.DRAFT,
      exchanges: []
    },
    {
      id: 3,
      question: 'Other User Question',
      createdBy: OTHER_USER,
      updatedAt: '2025-01-03T10:00:00',
      status: FaqStatusType.DRAFT,
      exchanges: []
    }
  ];

  const mockFaqResponse = {
    data: {
      searchAllFaq: mockRawFaqs
    }
  };

  const mockPathResponse = {
    data: {
      getAllPathComplet: [
        { path: '/test', libelle: 'Test Page' }
      ]
    }
  };

  const mockNotificationsResponse = {
    data: {
      getNotification: []
    }
  };

  beforeEach(waitForAsync(() => {
    mockFaqService = jasmine.createSpyObj('ApiAdelaideFaqService', ['searchAllFaq', 'getNotificationsCount']);
    mockContenuService = jasmine.createSpyObj('ApiAdelaideContenuService', ['getAllPathComplet']);
    mockNotificationsRefreshService = { refresh$: new Subject<void>() };

    TestBed.configureTestingModule({
      declarations: [ConversationComponent],
      providers: [
        { provide: ApiAdelaideFaqService, useValue: mockFaqService },
        { provide: ApiAdelaideContenuService, useValue: mockContenuService },
        { provide: NotificationsRefreshService, useValue: mockNotificationsRefreshService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    spyOn(sessionStorage, 'getItem').and.callFake((key) => {
      return key === 'user.login' ? CURRENT_USER : null;
    });

    fixture = TestBed.createComponent(ConversationComponent);
    component = fixture.componentInstance;

    mockFaqService.searchAllFaq.and.returnValue(of(mockFaqResponse as any));
    mockFaqService.getNotificationsCount.and.returnValue(of(mockNotificationsResponse as any));
    mockContenuService.getAllPathComplet.and.returnValue(of(mockPathResponse as any));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call APIs on init', () => {
      expect(mockFaqService.searchAllFaq).toHaveBeenCalled();
      expect(mockContenuService.getAllPathComplet).toHaveBeenCalled();
    });

    it('should populate pathOptions', () => {
      expect(component.pathOptions.length).toBe(1);
      expect(component.pathOptions[0].text).toBe('Test Page');
    });

    it('should filter out FAQs not created by current user', () => {
      expect(component.faqs.length).toBe(2);
      expect(component.faqs.find(f => f.id === 3)).toBeUndefined();
    });

    it('should sort FAQs by date descending (newest first)', () => {
      expect(component.faqs[0].id).toBe(2);
      expect(component.faqs[1].id).toBe(1);
    });
  });

  describe('Event Handlers', () => {

    it('handleCreatedQuestion should add new faq and re-sort', () => {
      const newFaqRaw: any = {
        id: 4,
        question: 'Brand New',
        createdBy: CURRENT_USER,
        updatedAt: '2025-01-05T10:00:00',
        status: FaqStatusType.DRAFT,
        exchanges: []
      };

      component.handleCreatedQuestion([newFaqRaw]);

      expect(component.faqs.length).toBe(1);
      expect(component.faqs[0].id).toBe(4);
    });

    it('handleUpdatedQuestion should replace the list', () => {
      const updatedListRaw: any[] = [{
        id: 1,
        question: 'Updated Q',
        createdBy: CURRENT_USER,
        updatedAt: '2025-01-01T10:00:00',
        status: FaqStatusType.DRAFT,
        exchanges: []
      }];

      component.handleUpdatedQuestion(updatedListRaw);

      expect(component.faqs.length).toBe(1);
      expect(component.faqs[0].question).toBe('Updated Q');
    });

    it('handleMessageCreated should update specific faq AND update selectedFaq reference', () => {
      const faqId = 2;
      const initialFaq = component.faqs.find(f => f.id === faqId)!;
      component.selectedFaq = initialFaq;

      const faqWithNewMessage: any = {
        ...initialFaq,
        updatedAt: '2025-01-06T10:00:00',
        status: FaqStatusType.DRAFT,
        exchanges: [{ id: 99, message: 'New Msg', author: CURRENT_USER, createdAt: '2025-01-06T10:00:00' }]
      };

      component.handleMessageCreated(faqWithNewMessage);

      const updatedFaqInList = component.faqs.find(f => f.id === faqId);
      expect(updatedFaqInList?.exchanges.length).toBe(1);

      expect(component.selectedFaq).not.toBe(initialFaq);
      expect(component.selectedFaq.id).toBe(faqId);
    });

    it('handleActionOnCreateComponent should unselect FAQ and close child component', () => {
      const mockListQuestionComponent = jasmine.createSpyObj('ListQuestionComponent', ['closeUpdatingQuestion']);
      component.listQuestionComponent = mockListQuestionComponent;

      component.selectedFaq = component.faqs[0];

      component.handleActionOnCreateComponent();

      expect(component.selectedFaq).toBeUndefined();
      expect(mockListQuestionComponent.closeUpdatingQuestion).toHaveBeenCalled();
    });

    it('setSelectedFaq should update state', () => {
      const faqToSelect = component.faqs[0];
      component.setSelectedFaq(faqToSelect);
      expect(component.selectedFaq).toBe(faqToSelect);
    });
  });
});
