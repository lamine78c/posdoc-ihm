import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { NoteTemplateComponent } from './note-template.component';

describe('NoteTemplateComponent', () => {
  let component: NoteTemplateComponent;
  let fixture: ComponentFixture<NoteTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoteTemplateComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteTemplateComponent);
    component = fixture.componentInstance;
    component.toast = {
      body: 'string',
      title: 'string',
      classname: 'string',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
