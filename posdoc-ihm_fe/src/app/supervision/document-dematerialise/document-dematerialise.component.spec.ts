import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDematerialiseComponent } from './document-dematerialise.component';

xdescribe('DocumentDematerialiseComponent', () => {
  let component: DocumentDematerialiseComponent;
  let fixture: ComponentFixture<DocumentDematerialiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentDematerialiseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDematerialiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
