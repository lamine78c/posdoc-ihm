import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { InterrupteurRadioComponent } from './interrupteur-radio.component';

xdescribe('InterrupteurRadioComponent', () => {
  let component: InterrupteurRadioComponent;
  let fixture: ComponentFixture<InterrupteurRadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterrupteurRadioComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InterrupteurRadioComponent);
    component = fixture.componentInstance;
    component.params = { currentParentModel: () => {} } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
