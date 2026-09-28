import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardStepComponent } from './wizard-step.component';

describe('WizardStepComponent', () => {
  let component: WizardStepComponent;
  let fixture: ComponentFixture<WizardStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WizardStepComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardStepComponent);
    component = fixture.componentInstance;
    component.wizardStep = { text: 'text' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
