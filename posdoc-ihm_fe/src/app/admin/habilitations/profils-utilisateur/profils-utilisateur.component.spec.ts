import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilsUtilisateurComponent } from './profils-utilisateur.component';

xdescribe('ProfilsUtilisateurComponent', () => {
  let component: ProfilsUtilisateurComponent;
  let fixture: ComponentFixture<ProfilsUtilisateurComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilsUtilisateurComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilsUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
