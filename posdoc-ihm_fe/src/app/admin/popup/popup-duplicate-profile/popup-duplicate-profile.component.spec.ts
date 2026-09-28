import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupDuplicateProfileComponent } from './popup-duplicate-profile.component';

describe('PopupDuplicateProfileComponent', () => {
  let component: PopupDuplicateProfileComponent;
  let fixture: ComponentFixture<PopupDuplicateProfileComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);

    await TestBed.configureTestingModule({
      declarations: [PopupDuplicateProfileComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NgbActiveModal, useValue: mockActiveModal }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PopupDuplicateProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with two required fields on ngOnInit', () => {
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.form.get('nouveauCodeProfile')).toBeDefined();
    expect(component.form.get('nouveauLibelleProfile')).toBeDefined();
  });

  it('should have invalid form when fields are empty', () => {
    component.ngOnInit();

    expect(component.form.valid).toBeFalsy();
    expect(component.form.get('nouveauCodeProfile')?.valid).toBeFalsy();
    expect(component.form.get('nouveauLibelleProfile')?.valid).toBeFalsy();
  });

  it('should have valid form when both fields are filled', () => {
    component.ngOnInit();
    component.form.patchValue({
      nouveauCodeProfile: 'PROFILE_001',
      nouveauLibelleProfile: 'Nouveau Profile'
    });

    expect(component.form.valid).toBeTruthy();
    expect(component.form.get('nouveauCodeProfile')?.valid).toBeTruthy();
    expect(component.form.get('nouveauLibelleProfile')?.valid).toBeTruthy();
  });

  it('should call activeModal.close with form values when save is called', () => {
    component.ngOnInit();
    const formValue = {
      nouveauCodeProfile: 'PROFILE_002',
      nouveauLibelleProfile: 'Profile Dupliqué'
    };
    component.form.patchValue(formValue);

    component.save();

    expect(mockActiveModal.close).toHaveBeenCalledWith(formValue);
  });
});
