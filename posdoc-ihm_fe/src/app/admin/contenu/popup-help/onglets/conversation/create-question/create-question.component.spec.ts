import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CreateQuestionComponent } from './create-question.component';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { Faq, FaqStatusType } from '@app/models/faq-conversation';

describe('CreateQuestionComponent', () => {
  let component: CreateQuestionComponent;
  let fixture: ComponentFixture<CreateQuestionComponent>;
  let mockFaqService: jasmine.SpyObj<ApiAdelaideFaqService>;

  const mockCreatedFaq: Faq = {
    id: 99,
    question: 'Nouvelle question',
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

  const mockCreateResponse = {
    data: {
      createFaq: [mockCreatedFaq]
    },
    loading: false,
    networkStatus: 7
  };

  beforeEach(waitForAsync(() => {
    mockFaqService = jasmine.createSpyObj('ApiAdelaideFaqService', ['createFaq']);

    TestBed.configureTestingModule({
      declarations: [CreateQuestionComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ApiAdelaideFaqService, useValue: mockFaqService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateQuestionComponent);
    component = fixture.componentInstance;

    component.path = '/admin/test';
    component.pathOptions = [
      { value: '/admin/test', text: 'Page Test' },
      { value: '/admin/home', text: 'Page Accueil' }
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form with inputs', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('path')?.value).toBe('/admin/test');
      expect(component.form.get('question')?.value).toBe('');
    });
  });

  describe('Validation', () => {
    it('should be invalid when question is empty', () => {
      component.form.get('question')?.setValue('');
      expect(component.form.invalid).toBeTrue();
    });

    it('should be valid when required fields are filled', () => {
      component.form.get('question')?.setValue('Ma question ?');
      component.form.get('path')?.setValue('/admin/test');
      expect(component.form.valid).toBeTrue();
    });
  });

  describe('ngOnChanges', () => {
    it('should close accordion when conversation is selected externally', () => {
      component.isAccordionCollapsed = false;
      component.isConversationSelected = true;

      component.ngOnChanges({
        isConversationSelected: new SimpleChange(false, true, false)
      });

      expect(component.isAccordionCollapsed).toBeTrue();
    });
  });

  describe('Accordion Events', () => {
    it('onAccordionShown should set collapsed to false and emit event', () => {
      const emitSpy = spyOn(component.actionOnCreateComponent, 'emit');

      component.onAccordionShown();

      expect(component.isAccordionCollapsed).toBeFalse();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('onAccordionHidden should set collapsed to true and re-initialize form', () => {
      component.form.patchValue({ question: 'Dirty value' });

      component.onAccordionHidden();

      expect(component.isAccordionCollapsed).toBeTrue();
      expect(component.form.get('question')?.value).toBe('');
      expect(component.form.get('path')?.value).toBe('/admin/test');
    });
  });

  describe('saveNewConversation', () => {
    it('should call api, emit event and reset form on success', () => {
      const pathValue = '/admin/test';
      const questionValue = 'Nouvelle question';

      component.form.patchValue({
        path: pathValue,
        question: questionValue
      });

      mockFaqService.createFaq.and.returnValue(of(mockCreateResponse as any));

      const emitSpy = spyOn(component.newFaqCreated, 'emit');

      component.saveNewConversation();

      expect(mockFaqService.createFaq).toHaveBeenCalledWith(pathValue, questionValue);
      expect(emitSpy).toHaveBeenCalledWith([mockCreatedFaq]);

      expect(component.form.get('question')?.value).toBeNull();
      expect(component.isAccordionCollapsed).toBeTruthy();
    });
  });
});
