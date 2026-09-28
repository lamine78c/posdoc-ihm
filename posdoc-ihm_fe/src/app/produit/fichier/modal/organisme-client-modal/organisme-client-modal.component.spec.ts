import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OrganismeClientModalComponent } from './organisme-client-modal.component';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('OrganismeClientModalComponent', () => {
  let component: OrganismeClientModalComponent;
  let fixture: ComponentFixture<OrganismeClientModalComponent>;
  let mockActiveModal: jasmine.SpyObj<NgbActiveModal>;
  let fb: FormBuilder;

  beforeEach(waitForAsync(() => {
    mockActiveModal = jasmine.createSpyObj('NgbActiveModal', ['close']);

    TestBed.configureTestingModule({
      declarations: [OrganismeClientModalComponent],
      providers: [FormBuilder, { provide: NgbActiveModal, useValue: mockActiveModal }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganismeClientModalComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    component.organismesSansRegionSelected = ['a', 'b'];
    component.values = { a: 'va', b: 'vb' };
    component.clientOptions = ['va', 'vb', 'vc'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form controls', () => {
    component.ngOnInit();
    expect(Object.keys(component.form.controls)).toEqual(['a', 'b']);
    expect(component.form.get('a').value).toBe('va');
    expect(component.isFormValid()).toBeTruthy();
    // tous les champs sont obligatoire à remplir
    component.form.get('a').setValue('');
    expect(component.isFormValid()).toBeFalsy();
    component.form.get('a').setValue('a');
    component.form.get('b').setValue('');
    expect(component.isFormValid()).toBeFalsy();
  });

  it('passBack validity', () => {
    spyOn(component.passEntry, 'emit');
    component.ngOnInit();
    component.passBack();

    expect(component.passEntry.emit).toHaveBeenCalledWith({ formOrganismeClientValue: component.form.getRawValue() });
  });
});
