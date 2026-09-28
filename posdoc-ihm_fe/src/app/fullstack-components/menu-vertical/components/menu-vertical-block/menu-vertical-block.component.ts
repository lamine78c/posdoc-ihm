import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MenuVertical } from '../../models/menu-vertical.models';

@Component({
  selector: 'app-menu-vertical-block',
  templateUrl: './menu-vertical-block.component.html',
  standalone: false,
})
export class MenuVerticalBlockComponent implements OnChanges {
  @Input() menuVertical: MenuVertical;
  @Input() alwaysOpened: boolean;
  /**
   * Index du block
   */
  @Input() index: number;
  /**
   * Index du block à ouvrir au chargement
   */
  @Input() openChildIndex: number;
  /**
   * Index du block à ne pas fermer en cas de changement
   */
  @Input() allChildrenExcept: number;
  /**
   * Envoie un message au composant parent pour fermer tous les blocks sauf celui sélectionné
   */
  @Output() closeAllChildrenExcept: EventEmitter<number> = new EventEmitter<number>();

  // Affichage du menu enfant
  displayChildMenu = false;

  previousRoute: string;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Ferme les blocks sauf celui courant
    if (changes.allChildrenExcept && this.allChildrenExcept !== this.index) {
      this.displayChildMenu = false;
    }

    // Ouvre le block à l'initialisation
    if (changes.openChildIndex && this.openChildIndex === this.index) {
      this.displayChildMenu = true;
    }
  }

  /**
   * Affiche/masque le menu enfant ou navigue si il n'y a pas d'enfants
   */
  toggleOrNavigate(): void {
    if (this.menuVertical.children?.length > 0) {
      this.displayChildMenu = !this.displayChildMenu;
      // Si il existe une route précédemment sélectionnée, navigue directement vers cette route
      // Sinon navigue vers le premier fils
      this.navigate(this.previousRoute ? this.previousRoute : this.menuVertical.children[0].route);
    } else {
      this.navigate(this.menuVertical.route);
    }

    // Ferme les autres blocks
    this.closeAllChildrenExcept.emit(this.index);
  }

  /**
   * Navigue vers la route voulue
   */
  navigate(route: string): void {
    if (route) {
      this.router.navigate([route]);
      // Sauvegarde la dernière route de ce block
      this.previousRoute = route;
    }
  }
}
