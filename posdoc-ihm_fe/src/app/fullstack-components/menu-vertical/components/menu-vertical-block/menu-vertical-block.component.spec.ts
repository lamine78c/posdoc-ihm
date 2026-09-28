import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MenuVerticalBlockComponent } from './menu-vertical-block.component';

describe('MenuVerticalBlockComponent', () => {
  let component: MenuVerticalBlockComponent;
  let fixture: ComponentFixture<MenuVerticalBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuVerticalBlockComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuVerticalBlockComponent);
    component = fixture.componentInstance;
    component.menuVertical = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
