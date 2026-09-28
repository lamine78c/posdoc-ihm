import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextTooltipRendererComponent } from './text-tooltip-renderer.component';

xdescribe('TextTooltipRendererComponent', () => {
  let component: TextTooltipRendererComponent;
  let fixture: ComponentFixture<TextTooltipRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextTooltipRendererComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextTooltipRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
