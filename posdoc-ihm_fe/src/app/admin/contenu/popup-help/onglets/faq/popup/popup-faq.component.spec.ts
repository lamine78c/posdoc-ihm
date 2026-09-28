import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PopupFaqComponent } from './popup-faq.component';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { ApiAdelaideFaqService } from '@app/services/api-adelaide-faq.service';
import { of } from 'rxjs';

describe('PopupFaqComponent', () => {
  let component: PopupFaqComponent;
  let fixture: ComponentFixture<PopupFaqComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let mockApiAdelaideContenuService: jasmine.SpyObj<ApiAdelaideContenuService>;
  let mockApiAdelaideFaqService: jasmine.SpyObj<ApiAdelaideFaqService>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    mockApiAdelaideContenuService = jasmine.createSpyObj('ApiAdelaideContenuService', ['getAllPathComplet']);
    mockApiAdelaideFaqService = jasmine.createSpyObj('ApiAdelaideFaqService', ['createFaqExchange']);

    mockApiAdelaideContenuService.getAllPathComplet.and.returnValue(of({
      data: {
        getAllPathComplet: [
          { path: '/admin/aide', libelle: 'Administration > Aide' },
          { path: '/admin/tarif', libelle: 'Administration > Tarif' }
        ]
      }
    } as any));

    mockApiAdelaideFaqService.createFaqExchange.and.returnValue(of({
      data: {
        createFaqExchange: {
          id: 1,
          exchanges: []
        }
      }
    } as any));

    await TestBed.configureTestingModule({
      declarations: [PopupFaqComponent],
      imports: [ReactiveFormsModule, NgbModule],
      providers: [
        { provide: NgbActiveModal, useValue: mockActiveModal },
        { provide: ApiAdelaideContenuService, useValue: mockApiAdelaideContenuService },
        { provide: ApiAdelaideFaqService, useValue: mockApiAdelaideFaqService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PopupFaqComponent);
    component = fixture.componentInstance;
  });

  it('should have quillModules configured from shared config', () => {
    expect(component.quillModules).toBeDefined();
    expect(component.quillModules.toolbar).toBeDefined();
    expect(component.quillModules.imageResize).toBeDefined();
    expect(component.quillModules.imageResize.displaySize).toBe(true);
    expect(component.quillModules.imageResize.modules).toEqual(['Resize', 'DisplaySize', 'Toolbar']);
  });

  describe('Component initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load path options on init', () => {
      component.ngOnInit();

      expect(mockApiAdelaideContenuService.getAllPathComplet).toHaveBeenCalled();
      expect(component.pathOptions.length).toBe(2);
      expect(component.pathOptions[0]).toEqual({ value: '/admin/aide', text: 'Administration > Aide' });
      expect(component.pathOptions[1]).toEqual({ value: '/admin/tarif', text: 'Administration > Tarif' });
    });

    it('should initialize form with empty values when no inputs provided', () => {
      component.ngOnInit();

      expect(component.form).toBeDefined();
      expect(component.form.get('path').value).toBe('');
      expect(component.form.get('question').value).toBe('');
      expect(component.form.get('answer').value).toBe('');
    });

    it('should initialize form with provided input values', () => {
      component.path = '/admin/tarif';
      component.question = 'Comment modifier un tarif ?';
      component.answer = 'Pour modifier un tarif, cliquez sur...';

      component.ngOnInit();

      expect(component.form.get('path').value).toBe('/admin/tarif');
      expect(component.form.get('question').value).toBe('Comment modifier un tarif ?');
      expect(component.form.get('answer').value).toBe('Pour modifier un tarif, cliquez sur...');
    });

    it('should have required validators on path field', () => {
      component.ngOnInit();
      const pathControl = component.form.get('path');

      pathControl.setValue('');
      expect(pathControl.invalid).toBe(true);

      pathControl.setValue('/admin/test');
      expect(pathControl.valid).toBe(true);
    });

    it('should have required validators on question field', () => {
      component.ngOnInit();
      const questionControl = component.form.get('question');

      questionControl.setValue('');
      expect(questionControl.invalid).toBe(true);

      questionControl.setValue('Une question ?');
      expect(questionControl.valid).toBe(true);
    });

    it('should have required validators on answer field', () => {
      component.ngOnInit();
      const answerControl = component.form.get('answer');

      answerControl.setValue('');
      expect(answerControl.invalid).toBe(true);

      answerControl.setValue('Une réponse');
      expect(answerControl.valid).toBe(true);
    });
  });

  describe('save()', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should close popup with form data when id is not provided (creation)', () => {
      component.form.patchValue({
        path: '/admin/client',
        question: 'Comment créer un client ?',
        answer: 'Pour créer un client...'
      });

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalledWith({
        path: '/admin/client',
        question: 'Comment créer un client ?',
        answer: 'Pour créer un client...'
      });
    });

    it('should close popup with form data including id when id is provided (edition)', () => {
      component.id = 42;
      component.form.patchValue({
        path: '/admin/tarif',
        question: 'Comment modifier un tarif ?',
        answer: 'Réponse modifiée'
      });

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalledWith({
        id: 42,
        path: '/admin/tarif',
        question: 'Comment modifier un tarif ?',
        answer: 'Réponse modifiée'
      });
    });

    it('should get all form values including disabled ones', () => {
      component.form.patchValue({
        path: '/test/path',
        question: 'Test question',
        answer: 'Test answer'
      });
      component.form.get('path').disable();

      component.save();

      const callArgs = mockActiveModal.close.calls.mostRecent().args[0];
      expect(callArgs.path).toBe('/test/path');
      expect(callArgs.question).toBe('Test question');
      expect(callArgs.answer).toBe('Test answer');
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when all fields are empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should be invalid when only path is filled', () => {
      component.form.patchValue({
        path: '/admin/test'
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid when only question is filled', () => {
      component.form.patchValue({
        question: 'Une question ?'
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid when only answer is filled', () => {
      component.form.patchValue({
        answer: 'Une réponse'
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid when path and question are filled but answer is empty', () => {
      component.form.patchValue({
        path: '/admin/test',
        question: 'Une question ?'
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be valid when all fields are filled', () => {
      component.form.patchValue({
        path: '/admin/test',
        question: 'Une question ?',
        answer: 'Une réponse'
      });

      expect(component.form.valid).toBe(true);
    });
  });

  describe('Input properties', () => {
    it('should accept id input', () => {
      component.id = 123;
      expect(component.id).toBe(123);
    });

    it('should accept path input', () => {
      component.path = '/admin/application';
      expect(component.path).toBe('/admin/application');
    });

    it('should accept question input', () => {
      component.question = 'Comment faire ?';
      expect(component.question).toBe('Comment faire ?');
    });

    it('should accept answer input', () => {
      component.answer = 'Voici la réponse';
      expect(component.answer).toBe('Voici la réponse');
    });

    it('should have default empty string for path', () => {
      expect(component.path).toBe('');
    });

    it('should have default empty string for question', () => {
      expect(component.question).toBe('');
    });

    it('should have default empty string for answer', () => {
      expect(component.answer).toBe('');
    });
  });

  describe('Integration tests', () => {
    it('should preserve form data through save operation', () => {
      component.id = 99;
      component.path = '/initial/path';
      component.question = 'Initial question';
      component.answer = 'Initial answer';
      component.ngOnInit();

      component.form.patchValue({
        path: '/updated/path',
        question: 'Updated question',
        answer: 'Updated answer'
      });

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalledWith({
        id: 99,
        path: '/updated/path',
        question: 'Updated question',
        answer: 'Updated answer'
      });
    });
  });

  describe('getInitials()', () => {
    it('should return "?" for empty author', () => {
      expect(component.getInitials('')).toBe('?');
      expect(component.getInitials(null)).toBe('?');
      expect(component.getInitials(undefined)).toBe('?');
    });

    it('should return first two letters for single word author', () => {
      expect(component.getInitials('John')).toBe('JO');
      expect(component.getInitials('Marie')).toBe('MA');
    });

    it('should return first and last initials for multiple word author', () => {
      expect(component.getInitials('John Doe')).toBe('JD');
      expect(component.getInitials('Marie Louise Martin')).toBe('MM');
    });

    it('should handle extra spaces in author name', () => {
      expect(component.getInitials('  John   Doe  ')).toBe('JD');
    });
  });

  describe('isCurrentUser()', () => {
    it('should return true when author matches current user', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue('john.doe');
      expect(component.isCurrentUser('john.doe')).toBe(true);
    });

    it('should return false when author does not match current user', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue('john.doe');
      expect(component.isCurrentUser('jane.smith')).toBe(false);
    });

    it('should return false when no current user in session', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);
      expect(component.isCurrentUser('john.doe')).toBe(false);
    });
  });

  describe('messageForm', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be initialized on ngOnInit', () => {
      expect(component.messageForm).toBeDefined();
      expect(component.messageForm.get('message')).toBeDefined();
    });

    it('should have required validator on message field', () => {
      const messageControl = component.messageForm.get('message');

      messageControl.setValue('');
      expect(messageControl.invalid).toBe(true);

      messageControl.setValue('Un message');
      expect(messageControl.valid).toBe(true);
    });

    it('should be invalid when message is empty', () => {
      expect(component.messageForm.valid).toBe(false);
    });

    it('should be valid when message is filled', () => {
      component.messageForm.patchValue({
        message: 'Un message de test'
      });
      expect(component.messageForm.valid).toBe(true);
    });
  });

  describe('saveMessage()', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should not call service when id is not set', () => {
      component.id = null;
      component.messageForm.patchValue({ message: 'Test message' });

      component.saveMessage();

      expect(mockApiAdelaideFaqService.createFaqExchange).not.toHaveBeenCalled();
    });

    it('should not call service when messageForm is invalid', () => {
      component.id = 1;
      component.messageForm.patchValue({ message: '' });

      component.saveMessage();

      expect(mockApiAdelaideFaqService.createFaqExchange).not.toHaveBeenCalled();
    });

    it('should call service with correct parameters when form is valid and id is set', () => {
      component.id = 42;
      component.messageForm.patchValue({ message: 'Mon message' });

      component.saveMessage();

      expect(mockApiAdelaideFaqService.createFaqExchange).toHaveBeenCalledWith('Mon message', 42);
    });

    it('should update exchanges list on successful save', () => {
      const mockExchanges = [
        { id: 1, author: 'john.doe', message: 'Premier message', createdAt: '2024-01-01' },
        { id: 2, author: 'jane.smith', message: 'Deuxième message', createdAt: '2024-01-02' }
      ];

      mockApiAdelaideFaqService.createFaqExchange.and.returnValue(of({
        data: {
          createFaqExchange: {
            id: 42,
            exchanges: mockExchanges
          }
        }
      } as any));

      component.id = 42;
      component.messageForm.patchValue({ message: 'Nouveau message' });

      component.saveMessage();

      expect(component.exchanges).toEqual(mockExchanges);
    });

    it('should reset messageForm after successful save', () => {
      component.id = 42;
      component.messageForm.patchValue({ message: 'Test message' });

      component.saveMessage();

      expect(component.messageForm.get('message').value).toBeNull();
    });
  });

  describe('Form change tracking', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should initialize with isFormTouched as false', () => {
      expect(component.isFormTouched).toBe(false);
    });

    it('should set isFormTouched to true when path is changed', () => {
      component.form.patchValue({ path: '/new/path' });
      expect(component.isFormTouched).toBe(true);
    });

    it('should set isFormTouched to true when question is changed', () => {
      component.form.patchValue({ question: 'New question?' });
      expect(component.isFormTouched).toBe(true);
    });

    it('should set isFormTouched to true when answer is changed', () => {
      component.form.patchValue({ answer: 'New answer' });
      expect(component.isFormTouched).toBe(true);
    });

    it('should remain true once set even if value is changed back', () => {
      const originalPath = component.form.get('path').value;
      component.form.patchValue({ path: '/new/path' });
      expect(component.isFormTouched).toBe(true);

      component.form.patchValue({ path: originalPath });
      expect(component.isFormTouched).toBe(true);
    });
  });

  describe('Exchanges accordion state', () => {
    it('should initialize with exchanges accordion closed', () => {
      expect(component.isExchangeAccordionOpen).toBe(false);
    });

    it('should track exchanges accordion state', () => {
      component.isExchangeAccordionOpen = true;
      expect(component.isExchangeAccordionOpen).toBe(true);

      component.isExchangeAccordionOpen = false;
      expect(component.isExchangeAccordionOpen).toBe(false);
    });
  });
});
