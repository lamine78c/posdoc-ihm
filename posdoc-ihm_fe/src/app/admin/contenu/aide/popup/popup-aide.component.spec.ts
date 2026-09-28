import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupAideComponent } from './popup-aide.component';
import { ApiAdelaideContenuService } from '@app/services/api-adelaide-contenu.service';
import { of } from 'rxjs';

describe('PopupAideComponent', () => {
  let component: PopupAideComponent;
  let fixture: ComponentFixture<PopupAideComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let mockApiAdelaideContenuService: jasmine.SpyObj<ApiAdelaideContenuService>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    mockApiAdelaideContenuService = jasmine.createSpyObj('ApiAdelaideContenuService', ['getAllPathComplet']);

    mockApiAdelaideContenuService.getAllPathComplet.and.returnValue(of({
      data: {
        getAllPathComplet: [
          { path: '/admin/aide', libelle: 'Administration > Aide' },
          { path: '/admin/tarif', libelle: 'Administration > Tarif' }
        ]
      }
    } as any));

    await TestBed.configureTestingModule({
      declarations: [PopupAideComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: NgbActiveModal, useValue: mockActiveModal },
        { provide: ApiAdelaideContenuService, useValue: mockApiAdelaideContenuService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PopupAideComponent);
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
      expect(component.form.get('message').value).toBe('');
    });

    it('should initialize form with provided input values', () => {
      component.path = 'Administration > Tarif';
      component.message = 'Message aide pour tarif';

      component.ngOnInit();

      expect(component.form.get('path').value).toBe('Administration > Tarif');
      expect(component.form.get('message').value).toBe('Message aide pour tarif');
    });

    it('should have required validators on path field', () => {
      component.ngOnInit();
      const pathControl = component.form.get('path');

      pathControl.setValue('');
      expect(pathControl.invalid).toBe(true);

      pathControl.setValue('Some path');
      expect(pathControl.valid).toBe(true);
    });

    it('should have required validators on message field', () => {
      component.ngOnInit();
      const messageControl = component.form.get('message');

      messageControl.setValue('');
      expect(messageControl.invalid).toBe(true);

      messageControl.setValue('Some message');
      expect(messageControl.valid).toBe(true);
    });
  });

  describe('save()', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should close popup with form data when id is not provided (creation)', () => {
      component.form.patchValue({
        path: 'Administration > Client',
        message: 'Message aide pour client'
      });

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalledWith({
        path: 'Administration > Client',
        message: 'Message aide pour client'
      });
    });

    it('should close popup with form data including id when id is provided (edition)', () => {
      component.id = 42;
      component.form.patchValue({
        path: 'Administration > Tarif',
        message: 'Message modifié'
      });

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalledWith({
        id: 42,
        path: 'Administration > Tarif',
        message: 'Message modifié'
      });
    });

    it('should get all form values including disabled ones', () => {
      component.form.patchValue({
        path: 'Test path',
        message: 'Test message'
      });
      component.form.get('path').disable();

      component.save();

      const callArgs = mockActiveModal.close.calls.mostRecent().args[0];
      expect(callArgs.path).toBe('Test path');
      expect(callArgs.message).toBe('Test message');
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when both fields are empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should be invalid when only path is filled', () => {
      component.form.patchValue({
        path: 'Administration > Test'
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be invalid when only message is filled', () => {
      component.form.patchValue({
        message: 'Test message'
      });

      expect(component.form.valid).toBe(false);
    });

    it('should be valid when both fields are filled', () => {
      component.form.patchValue({
        path: 'Administration > Test',
        message: 'Test message'
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
      component.path = 'Administration > Application';
      expect(component.path).toBe('Administration > Application');
    });

    it('should accept message input', () => {
      component.message = 'Message for application';
      expect(component.message).toBe('Message for application');
    });

    it('should have default empty string for path', () => {
      expect(component.path).toBe('');
    });

    it('should have default empty string for message', () => {
      expect(component.message).toBe('');
    });
  });

  describe('Integration tests', () => {
    it('should preserve form data through save operation', () => {
      component.id = 99;
      component.path = 'Initial path';
      component.message = 'Initial message';
      component.ngOnInit();

      component.form.patchValue({
        path: 'Updated path',
        message: 'Updated message'
      });

      component.save();

      expect(mockActiveModal.close).toHaveBeenCalledWith({
        id: 99,
        path: 'Updated path',
        message: 'Updated message'
      });
    });
  });
});
