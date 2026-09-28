import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDateInput]',
  standalone: false,
})
export class DateInputDirective {
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^-?\d+(\.\d*)?$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', '/', 'Enter'];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    if (!String(event.key).match(this.regex) && event.key !== '/') {
      event.preventDefault();
    }
  }
}
