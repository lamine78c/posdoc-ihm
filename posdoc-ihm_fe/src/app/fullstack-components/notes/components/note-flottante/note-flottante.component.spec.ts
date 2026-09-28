import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoteFlottanteComponent } from './note-flottante.component';

describe('NoteFlottanteComponent', () => {
  let component: NoteFlottanteComponent;
  let fixture: ComponentFixture<NoteFlottanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoteFlottanteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteFlottanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
