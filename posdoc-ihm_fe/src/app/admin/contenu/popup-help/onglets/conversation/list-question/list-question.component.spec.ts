import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ListQuestionComponent } from './list-question.component';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { Faq, FaqStatusType } from '@app/models/faq-conversation';
import { FaqNotification } from '@app/models/notification';

describe('ListQuestionComponent', () => {
  let component: ListQuestionComponent;
  let fixture: ComponentFixture<ListQuestionComponent>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideFaqService>;

  const mockFaq: Faq = {
    id: 1,
    question: 'Question originale',
    path: '/admin/test',
    exchanges: [],
    answer: null,
    status: FaqStatusType.DRAFT,
    viewCount: 0,
    createdBy: '0000',
    updatedBy: '0000',
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-01-01T10:00:00'
  };

  const mockFaq2: Faq = {
    id: 2,
    question: 'Question secondaire',
    path: '/admin/test2',
    exchanges: [],
    answer: null,
    status: FaqStatusType.DRAFT,
    viewCount: 0,
    createdBy: '0000',
    updatedBy: '0000',
    createdAt: '2025-01-01T11:00:00',
    updatedAt: '2025-01-01T11:00:00'
  };

  const mockFaqNotification: FaqNotification = {
    id: 1,
    recipientId: 'user123',
    faq: mockFaq,
    createdAt: '2025-01-01T12:00:00'
  };

  const mockFaqNotification2: FaqNotification = {
    id: 2,
    recipientId: 'user123',
    faq: mockFaq2,
    createdAt: '2025-01-01T13:00:00'
  };

  const mockUpdateResponse = {
    data: {
      updateFaq: [mockFaq]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideFaqService', ['updateFaq']);

    TestBed.configureTestingModule({
      declarations: [ListQuestionComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiAdelaideFaqService, useValue: mockApiService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListQuestionComponent);
    component = fixture.componentInstance;
    component.faqs = [mockFaq];
    component.faqNotifications = [];
    component.pathOptions = [
      { value: '/admin/test', text: 'Page Test' },
      { value: '/admin/home', text: 'Page Accueil' }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('question')).toBeTruthy();
  });

  describe('editQuestion', () => {
    it('should enter edit mode and populate form if no question is selected', () => {
      component.questionSelected = undefined as any;

      component.editQuestion(mockFaq);

      expect(component.questionUpdating).toEqual(mockFaq);
      expect(component.form.get('question')?.value).toBe(mockFaq.question);
    });

    it('should not enter edit mode if a conversation is already selected', () => {
      component.questionSelected = mockFaq;

      component.editQuestion(mockFaq);

      expect(component.questionUpdating).toBeUndefined();
    });
  });

  describe('closeUpdatingQuestion', () => {
    it('should clear form and exit edit mode', () => {
      component.questionUpdating = mockFaq;
      component.form.patchValue({ question: 'Texte en cours' });

      component.closeUpdatingQuestion();

      expect(component.questionUpdating).toBeUndefined();
      expect(component.form.get('question')?.value).toBe('');
    });
  });

  describe('saveUpdateQuestion', () => {
    it('should call api, emit update event and reset state', () => {
      component.questionUpdating = mockFaq;
      const newQuestionText = 'Question modifiée';
      component.form.patchValue({ question: newQuestionText });

      mockApiService.updateFaq.and.returnValue(of(mockUpdateResponse as any));

      const emitSpy = spyOn(component.questionsUpdate, 'emit');

      component.saveUpdateQuestion();

      expect(mockApiService.updateFaq).toHaveBeenCalledWith(mockFaq.id, mockFaq.path, newQuestionText);

      expect(emitSpy).toHaveBeenCalledWith(mockUpdateResponse.data.updateFaq);

      expect(component.form.get('question')?.value).toBe('');
      expect(component.questionUpdating).toBeUndefined();
    });
  });

  describe('selectConversation', () => {
    it('should emit the faq when selecting a new conversation', () => {
      const emitSpy = spyOn(component.questionSelect, 'emit');

      component.selectConversation(mockFaq);

      expect(emitSpy).toHaveBeenCalledWith(mockFaq);
    });

    it('should emit undefined when clicking on the already selected conversation', () => {
      component.questionSelected = mockFaq;
      const emitSpy = spyOn(component.questionSelect, 'emit');

      component.selectConversation(mockFaq);

      expect(emitSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getPathLabel', () => {
    it('should return label if path exists in options', () => {
      const label = component.getPathLabel('/admin/test');
      expect(label).toBe('Page Test');
    });

    it('should return raw path if not found in options', () => {
      const label = component.getPathLabel('/unknown/path');
      expect(label).toBe('/unknown/path');
    });
  });

  describe('hasNotification', () => {
    it('should return true when faq has an associated notification', () => {
      component.faqNotifications = [mockFaqNotification];

      const result = component.hasNotification(mockFaq);

      expect(result).toBe(true);
    });

    it('should return false when faq has no associated notification', () => {
      component.faqNotifications = [mockFaqNotification];

      const faqWithoutNotification: Faq = {
        ...mockFaq,
        id: 999
      };
      const result = component.hasNotification(faqWithoutNotification);

      expect(result).toBe(false);
    });

    it('should return false when faqNotifications array is empty', () => {
      component.faqNotifications = [];

      const result = component.hasNotification(mockFaq);

      expect(result).toBe(false);
    });

    it('should return true when faq has notification among multiple notifications', () => {
      component.faqNotifications = [mockFaqNotification, mockFaqNotification2];

      const result = component.hasNotification(mockFaq2);

      expect(result).toBe(true);
    });

    it('should correctly identify notification when multiple notifications exist', () => {
      component.faqNotifications = [mockFaqNotification, mockFaqNotification2];

      const resultForFaq1 = component.hasNotification(mockFaq);
      const resultForFaq2 = component.hasNotification(mockFaq2);

      expect(resultForFaq1).toBe(true);
      expect(resultForFaq2).toBe(true);
    });

    it('should return false when faq is not in the notifications list with multiple notifications', () => {
      component.faqNotifications = [mockFaqNotification, mockFaqNotification2];

      const faqWithoutNotification: Faq = {
        ...mockFaq,
        id: 999
      };
      const result = component.hasNotification(faqWithoutNotification);

      expect(result).toBe(false);
    });
  });
});
