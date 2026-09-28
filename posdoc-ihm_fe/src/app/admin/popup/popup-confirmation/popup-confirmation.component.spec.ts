import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupConfirmationComponent } from './popup-confirmation.component';

describe('PopupConfirmationComponent', () => {
  let component: PopupConfirmationComponent;
  let fixture: ComponentFixture<PopupConfirmationComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      declarations: [PopupConfirmationComponent],
      providers: [{ provide: NgbActiveModal, useValue: mockActiveModal }],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupConfirmationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with singular title when rowDataArray has one element', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2', 'Titre pluriel'];
    component.rowDataArray = ['Item 1'];

    component.ngOnInit();

    expect(component.title).toBe('Titre singulier');
  });

  it('should initialize with plural title when rowDataArray has multiple elements', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2', 'Titre pluriel'];
    component.rowDataArray = ['Item 1', 'Item 2', 'Item 3'];

    component.ngOnInit();

    expect(component.title).toBe('Titre pluriel');
  });

  it('should keep singular title when rowDataArray has multiple elements but messages[3] is not defined', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2'];
    component.rowDataArray = ['Item 1', 'Item 2'];

    component.ngOnInit();

    expect(component.title).toBe('Titre singulier');
  });

  it('should initialize with default button configurations', () => {
    component.ngOnInit();

    expect(component.firstButton.label).toBe('Confirmer suppression');
    expect(component.firstButton.icone).toBe('icon-b_valid');
    expect(component.secondButton.label).toBe('Abandonner suppression');
    expect(component.secondButton.icone).toBe('icon-b_cancel');
  });

  it('should use custom button configurations when provided', () => {
    const customFirstButton = { label: 'Valider', icone: 'icon-custom-1' };
    const customSecondButton = { label: 'Annuler', icone: 'icon-custom-2' };
    component.firstButton = customFirstButton;
    component.secondButton = customSecondButton;

    component.ngOnInit();

    expect(component.firstButton).toEqual(customFirstButton);
    expect(component.secondButton).toEqual(customSecondButton);
  });
});


