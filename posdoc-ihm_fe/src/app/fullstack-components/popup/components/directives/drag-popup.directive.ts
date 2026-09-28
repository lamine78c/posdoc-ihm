import { Directive, ElementRef, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';

class Position {
  x: number;
  y: number;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Inspiré du code suivant : https://stackoverflow.com/questions/45834446/making-a-ngb-draggable-modal
 */
@Directive({
  selector: '[appDragPopup]',
  standalone: false,
})
export class DragPopupDirective implements OnInit, OnDestroy {
  constructor(
    private el: ElementRef,
    private zone: NgZone,
    private renderer: Renderer2
  ) {}

  moving: boolean = false;
  origin: Position = null;
  host: HTMLElement;

  // Enregistrement des listeners
  removeMouseDownFn: Function;
  removeMouseUpFn: Function;
  removeMouseMoveFn: Function;

  ngOnInit(): void {
    // Récupère l'élément parent afin de bouger l'intégralité de la popup
    this.host = this.el.nativeElement.offsetParent;

    // Ajoute le style transform avec une position par défaut
    this.host.style.transform = 'translate(0,0)';

    // Écoute lorsque le clique de la souris est enfoncé
    this.removeMouseDownFn = this.renderer.listen(this.el.nativeElement, 'mousedown', (event: MouseEvent) => {
      // Si il s'agit du clique gauche de la souris
      if (event.button === 0) {
        this.moving = true;
        this.origin = this.getPosition(event.clientX, event.clientY);
      }
    });

    // Écoute lorsque la souris bouge
    this.removeMouseMoveFn = this.renderer.listen(document, 'mousemove', event => {
      // Si on est en train de bouger
      if (this.moving) {
        // uses ngzone to run moving outside angular for better performance
        this.zone.runOutsideAngular(() => {
          event.preventDefault();
          this.moveTo(event.clientX, event.clientY);
        });
      }
    });

    // Écoute lorsque le clique de la souris n'est plus enfoncé
    this.removeMouseUpFn = this.renderer.listen(document, 'mouseup', () => {
      // Si le clique n'est plus enfoncé, alors on ne bouge plus
      this.moving = false;
    });
  }

  /**
   * Déplace l'élément en modifiant sa propriété transform
   */
  moveTo(x: number, y: number): void {
    if (this.origin) {
      this.host.style.transform = this.getTranslate(x - this.origin.x, y - this.origin.y);
    }
  }

  /**
   * Récupère la position d'origine
   */
  getPosition(x: number, y: number): Position {
    let transVal: string[] = this.host.style.transform.split(',');
    let newX = parseInt(transVal[0].replace('translate(', ''));
    // Pour Firefox, à l'initialisation transform = translate(0px) au lieu de translate(0px, 0px) comme set plus haut
    // Il faut donc initialiser la valeur à 0 si elle n'existe pas
    let newY = parseInt(transVal[1]) || 0;
    return new Position(x - newX, y - newY);
  }

  /**
   * Construit la valeur du translate
   */
  private getTranslate(x: number, y: number): string {
    return 'translate(' + x + 'px,' + y + 'px)';
  }

  ngOnDestroy() {
    // Supprime tous les listeners
    this.removeMouseDownFn();
    this.removeMouseUpFn();
    this.removeMouseMoveFn();
  }
}
