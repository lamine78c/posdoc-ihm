import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoutonChoixMultiples } from '../../models/bouton-choix-multiples.models';

@Component({
  selector: 'app-bouton-choix-multiples',
  templateUrl: './bouton-choix-multiples.component.html',
  standalone: false,
})
// TODO : à vérifier si le componsant est utilisable sinon supprime-le
export class BoutonChoixMultiplesComponent {
  /**
   * Le nom affiché sur le bouton
   */
  @Input() buttonName: string;
  /**
   * Le status du bouton
   */
  @Input() disable = false;
  /**
   * La liste des boutons dans la dropdown
   */
  @Input() dropdownButtons: BoutonChoixMultiples[];
  /**
   * Affiche "..." à la place du texte et de la flèche
   * Champ optionnel
   */
  @Input() useThreeDotsStyle: boolean = false;
  /**
   * Renvoie au composant parent l'index du bouton cliqué
   */
  @Output() buttonClicked: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Envoie un message au composant parent lorsque l'un des boutons de la dropdown est cliqué avec l'index de celui-ci
   */
  buttonDropdownClick(index: number) {
    this.buttonClicked.emit(index);
  }
}
