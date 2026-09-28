import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ZonePliableDepliableComponent } from './zone-pliable-depliable.component';

xdescribe('ZonePliableDepliableComponent', () => {
  let component: ZonePliableDepliableComponent;
  let fixture: ComponentFixture<ZonePliableDepliableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZonePliableDepliableComponent],
      imports: [NgbModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZonePliableDepliableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
