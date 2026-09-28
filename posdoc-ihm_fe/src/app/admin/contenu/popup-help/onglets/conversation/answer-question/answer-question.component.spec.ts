import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { AnswerQuestionComponent } from './answer-question.component';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { Faq, FaqStatusType } from '@app/models/faq-conversation';

describe('AnswerQuestionComponent', () => {
  let component: AnswerQuestionComponent;
  let fixture: ComponentFixture<AnswerQuestionComponent>;
  let mockApiService: jasmine.SpyObj<ApiAdelaideFaqService>;

  const mockFaq: Faq = {
    id: 123,
    question: 'Question test',
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

  const mockResponse = {
    data: {
      createFaqExchange: {
        ...mockFaq,
        exchanges: [{ id: 1, message: 'Nouveau message', author: 'Moi', createdAt: 'Date' }]
      }
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    mockApiService = jasmine.createSpyObj('ApiAdelaideFaqService', ['createFaqExchange']);

    TestBed.configureTestingModule({
      declarations: [AnswerQuestionComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiAdelaideFaqService, useValue: mockApiService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerQuestionComponent);
    component = fixture.componentInstance;
    component.faqToDisplay = mockFaq;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on init', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('message')).toBeTruthy();
    expect(component.form.get('message')?.value).toBe('');
  });

  describe('ngOnChanges', () => {
    it('should trigger scroll when faqToDisplay changes', fakeAsync(() => {
      const scrollSpy = spyOn(component, 'scroll');

      component.ngOnChanges({
        faqToDisplay: new SimpleChange(null, mockFaq, true)
      });

      tick();

      expect(scrollSpy).toHaveBeenCalled();
    }));

    it('should reset form message when faqToDisplay becomes null', () => {
      component.form.get('message')?.setValue('Texte à effacer');

      component.faqToDisplay = null as any;
      component.ngOnChanges({
        faqToDisplay: new SimpleChange(mockFaq, null, false)
      });

      expect(component.form.get('message')?.value).toBe('');
    });
  });

  describe('saveMessage', () => {
    it('should call api, emit event and reset form on success', () => {
      const messageToSend = 'Mon message de test';
      component.form.get('message')?.setValue(messageToSend);
      mockApiService.createFaqExchange.and.returnValue(of(mockResponse));

      const emitSpy = spyOn(component.messageCreated, 'emit');

      component.saveMessage();

      expect(mockApiService.createFaqExchange).toHaveBeenCalledWith(messageToSend, mockFaq.id);
      expect(emitSpy).toHaveBeenCalledWith(mockResponse.data.createFaqExchange);
      expect(component.form.get('message')?.value).toBe('');
    });
  });

  describe('scroll', () => {
    it('should scroll to bottom if container exists', () => {
      const mockNativeElement = { scrollTop: 0, scrollHeight: 500 };

      (component as any).scrollContainer = { nativeElement: mockNativeElement };

      component.scroll();

      expect(mockNativeElement.scrollTop).toBe(500);
    });

    it('should handle missing container gracefully', () => {
      (component as any).scrollContainer = undefined;

      spyOn(console, 'error');
      expect(() => component.scroll()).not.toThrow();
      expect(console.error).toHaveBeenCalledWith('Pas de conteneur de messages');
    });
  });
});
