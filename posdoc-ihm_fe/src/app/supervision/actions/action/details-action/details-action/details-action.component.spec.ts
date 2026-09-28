import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsActionComponent } from './details-action.component';

xdescribe('DetailsActionComponent', () => {
  let component: DetailsActionComponent;
  let fixture: ComponentFixture<DetailsActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailsActionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
