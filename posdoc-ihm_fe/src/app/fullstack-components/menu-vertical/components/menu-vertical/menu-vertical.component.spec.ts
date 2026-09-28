import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MenuVerticalComponent } from './menu-vertical.component';

describe('MenuVerticalComponent', () => {
  let component: MenuVerticalComponent;
  let fixture: ComponentFixture<MenuVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuVerticalComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
