import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ModalImprimeComponent } from './modal-imprime.component';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('ModalImprimeComponent', () => {
  let component: ModalImprimeComponent;
  let fixture: ComponentFixture<ModalImprimeComponent>;
  let mockFilterSharedDataService: jasmine.SpyObj<FilterSharedDataService>;

  beforeEach(waitForAsync(() => {
    const filterSharedDataServiceSpy = jasmine.createSpyObj('FilterSharedDataService', ['updateData']);
    TestBed.configureTestingModule({
      declarations: [ModalImprimeComponent],
      providers: [{ provide: FilterSharedDataService, useValue: filterSharedDataServiceSpy }],
    }).compileComponents();
    mockFilterSharedDataService = TestBed.inject(FilterSharedDataService) as jasmine.SpyObj<FilterSharedDataService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalImprimeComponent);
    component = fixture.componentInstance;
    component.modalRef = new NgbActiveModal();
    fixture.detectChanges();
  });

  it('should create and init with value imprimeSelected correctly', () => {
    component.imprimeSelected = 'ref';
    component.ngOnInit();
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.controls.imprime).toBeTruthy();
    expect(component.form.controls.imprime.value).toEqual('ref');
  });

  it('should close Popup', () => {
    spyOn(component.modalRef, 'close');
    component.closePopup();
    fixture.detectChanges();
    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('should updateData on ngOnDestroy', () => {
    component.ngOnDestroy();
    fixture.detectChanges();
    expect(mockFilterSharedDataService.updateData).toHaveBeenCalled();
  });

  it('should emit value imprime correctly', () => {
    spyOn(component.passEntry, 'emit');
    component.form.controls.imprime.setValue('ref');
    component.apply();
    fixture.detectChanges();
    expect(component.passEntry.emit).toHaveBeenCalledWith('ref');
  });

  it('should execute onChange correctly', () => {
    component.imprimeSelected = 'ref';
    component.form.controls.imprime.setValue('ref2');
    component.isFormValid = false;
    component.onChange({});
    fixture.detectChanges();
    expect(component.isFormValid).toBeTruthy();
  });

  it('should execute onChange to fail', () => {
    component.imprimeSelected = 'ref';
    component.form.controls.imprime.setValue('ref');
    component.isFormValid = false;
    component.onChange({});
    fixture.detectChanges();
    expect(component.isFormValid).toBeFalsy();
  });
});
