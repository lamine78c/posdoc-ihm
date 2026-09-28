import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationPopupComponent } from './confirmation-popup.component';

describe('ConfirmationPopupComponent', () => {
  let component: ConfirmationPopupComponent;
  let fixture: ComponentFixture<ConfirmationPopupComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      declarations: [ConfirmationPopupComponent],
      providers: [{ provide: NgbActiveModal, useValue: mockActiveModal }],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with singular title when rowsToDelete has one element', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2', 'Titre pluriel', 'Message pluriel 4', 'Message singulier 5'];
    component.rowsToDelete = [{ id: 1, name: 'Row 1' }];
    component.rowsNotAuthorisedToBeDeleted = [];

    component.ngOnInit();

    expect(component.title).toBe('Titre singulier');
  });

  it('should initialize with plural title when rowsToDelete has multiple elements', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2', 'Titre pluriel', 'Message pluriel 4', 'Message singulier 5'];
    component.rowsToDelete = [
      { id: 1, name: 'Row 1' },
      { id: 2, name: 'Row 2' },
    ];
    component.rowsNotAuthorisedToBeDeleted = [];

    component.ngOnInit();

    expect(component.title).toBe('Titre pluriel');
  });

  it('should set plural rowsNotAuthorisedMessage when rowsNotAuthorisedToBeDeleted has multiple elements', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2', 'Titre pluriel', 'Message pluriel 4', 'Message singulier 5'];
    component.rowsToDelete = [];
    component.rowsNotAuthorisedToBeDeleted = [
      { id: 3, name: 'Row 3' },
      { id: 4, name: 'Row 4' },
    ];

    component.ngOnInit();

    expect(component.rowsNotAuthorisedMessage).toBe('Message pluriel 4');
  });

  it('should set singular rowsNotAuthorisedMessage when rowsNotAuthorisedToBeDeleted has one element', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2', 'Titre pluriel', 'Message pluriel 4', 'Message singulier 5'];
    component.rowsToDelete = [];
    component.rowsNotAuthorisedToBeDeleted = [{ id: 5, name: 'Row 5' }];

    component.ngOnInit();

    expect(component.rowsNotAuthorisedMessage).toBe('Message singulier 5');
  });

  it('should return truthy value for isPluralTitle when total rows equal 2 (one to delete and one not authorised)', () => {
    component.messages = ['Titre singulier', 'Message 1', 'Message 2', 'Titre pluriel', 'Message pluriel 4', 'Message singulier 5'];
    component.rowsToDelete = [{ id: 1, name: 'Row 1' }];
    component.rowsNotAuthorisedToBeDeleted = [{ id: 2, name: 'Row 2' }];

    const result = component.isPluralTitle();

    expect(result).toBeTruthy();
    expect(result as any).toBe('Titre pluriel');
  });

  it('should transforme message correctly', () => {
    component.messages = [
      'Titre singulier',
      'Message ***',
      'Message 2',
      'Titre pluriel',
      'Message pluriel 4',
      'Message singulier 5',
      { '***': 'codnot' },
    ];
    component.rowsToDelete = [{ id: 1, name: 'Row 1', codnot: 'code notice' }];

    component.transformeMessage();

    expect(component.messages[1]).toBe('Message code notice');
  });
});
