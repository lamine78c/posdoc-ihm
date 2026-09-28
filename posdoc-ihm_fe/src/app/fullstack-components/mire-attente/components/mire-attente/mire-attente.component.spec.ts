import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MireAttenteComponent } from './mire-attente.component';

describe('MireAttenteComponent', () => {
  let component: MireAttenteComponent;
  let fixture: ComponentFixture<MireAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MireAttenteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MireAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
