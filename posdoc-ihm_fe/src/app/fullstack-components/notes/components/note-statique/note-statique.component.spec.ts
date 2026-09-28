import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteStatiqueComponent } from './note-statique.component';

describe('NoteStatiqueComponent', () => {
  let component: NoteStatiqueComponent;
  let fixture: ComponentFixture<NoteStatiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoteStatiqueComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteStatiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
