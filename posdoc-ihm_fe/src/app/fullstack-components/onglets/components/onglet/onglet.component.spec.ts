import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { OngletComponent } from './onglet.component';

describe('OngletComponent', () => {
  let component: OngletComponent;
  let fixture: ComponentFixture<OngletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OngletComponent],
      imports: [NgbModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OngletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
