import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { ListeDeroulanteMultipleComponent } from './liste-deroulante-multiple.component';

xdescribe('ListeDeroulanteMultipleComponent', () => {
  let component: ListeDeroulanteMultipleComponent;
  let fixture: ComponentFixture<ListeDeroulanteMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeDeroulanteMultipleComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeDeroulanteMultipleComponent);
    component = fixture.componentInstance;
    component.form = component['fb'].group({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
