import { Directive, HostListener, Input, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[appNoSpecialCharacters]',
  standalone: false,
})
export class NoSpecialCharactersDirective {
  @Input('allowedCharacters') allowedCharacters: string[] = [];

  private readonly elRef = inject(ElementRef);

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {

    if (this.allowedCharacters.includes('ALL')) {
      return;
    }

    // Autoriser les raccourcis clavier système (Ctrl+V, Ctrl+C, Ctrl+X, Ctrl+A, etc.)
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    let regexExpression: string = `[^a-zA-Z0-9${this.allowedCharacters.reduce((acc, curr) => acc + '\\' + curr, '')}]`;
    const allowedRegex: RegExp = new RegExp(regexExpression, 'g');

    if (allowedRegex.test(event.key)) {
      event.preventDefault(); // Empêcher l'action par défaut si un caractère spécial est entré
    }
  }
}
