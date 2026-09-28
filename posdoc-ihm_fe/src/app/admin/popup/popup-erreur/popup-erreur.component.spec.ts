import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupErreurComponent } from './popup-erreur.component';

describe('PopupErreurComponent', () => {
  let component: PopupErreurComponent;
  let fixture: ComponentFixture<PopupErreurComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      declarations: [PopupErreurComponent],
      providers: [{ provide: NgbActiveModal, useValue: mockActiveModal }],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupErreurComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty messages array by default', () => {
    expect(component.messages).toEqual([]);
    expect(component.messages.length).toBe(0);
  });

  it('should accept messages input with three elements', () => {
    const testMessages = ['Titre Erreur', 'Message principal', 'Message détaillé'];
    component.messages = testMessages;

    expect(component.messages).toEqual(testMessages);
    expect(component.messages[0]).toBe('Titre Erreur');
    expect(component.messages[1]).toBe('Message principal');
    expect(component.messages[2]).toBe('Message détaillé');
  });

  it('should have activeModal injected and available', () => {
    expect(component.activeModal).toBeDefined();
    expect(component.activeModal).toBe(mockActiveModal);
  });

  it('should call activeModal.close when close is triggered', () => {
    component.activeModal.close('test');

    expect(mockActiveModal.close).toHaveBeenCalledWith('test');
  });

  it('should call activeModal.dismiss when dismiss is triggered', () => {
    component.activeModal.dismiss('cancel');

    expect(mockActiveModal.dismiss).toHaveBeenCalledWith('cancel');
  });
});
