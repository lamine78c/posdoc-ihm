import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {
  NUM_CLOSE_BTN_MODAL,
  NUM_FIRST_BTN_MODAL,
  NUM_SECOND_BTN_MODAL,
  NUM_THIRD_BTN_MODAL
} from '@app/fullstack-components/utils/Constants';
import {NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

export interface BoutonPopup {
  label: string;
  icone?: string;
  isDisabled?: boolean;
}

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  standalone: false,
})
export class PopupComponent {
  @Input() modalRef: NgbModalRef | NgbActiveModal;

  /**
   * Titre de la popup
   */
  @Input() title: string;
  /**
   * Label et icône du premier bouton (En partant de la droite)
   * Champ optionnel, sera affiché par défaut "Confirmer"
   */
  @Input() firstButton: BoutonPopup = { label: 'Confirmer', icone: 'icon-b_valid', isDisabled: false };
  /**
   * Label et icône du premier bouton (En partant de la droite)
   * Champ optionnel, sera affiché par défaut "Abandonner"
   */
  @Input() secondButton: BoutonPopup = { label: 'Abandonner', icone: 'icon-b_cancel' };
  /**
   * Label et icône du premier bouton (En partant de la droite)
   * Champ optionnel, sera masqué par défaut
   */
  @Input() thirdButton: BoutonPopup;
  /**
   * Validité du formulaire, désactive le premier bouton si faux.
   * Champ optionnel
   */
  @Input() isFormValid = true;
  /**
   * URL de l'icône à afficher dans la popup
   */
  @Input() iconToDisplay: string;
  /**
   * Permet de déplacer la modale lorsqu'elle est ouverte
   * Champ optionnel, valeur par défaut : true
   */
  @Input() draggable: boolean = true;

  /**
   * informer le parent que l'utilisateur a cliquer sur le button 1
   */
  @Output() saveEvent = new EventEmitter<any>();

  @Input() contentTemplate: TemplateRef<any>;
  @Input() isShowcontentTemplate: boolean = false;

  numClose = NUM_CLOSE_BTN_MODAL;
  numFirstBtn = NUM_FIRST_BTN_MODAL;
  numSecondBtn = NUM_SECOND_BTN_MODAL;
  numThirdBtn = NUM_THIRD_BTN_MODAL;

  /**
   * Ferme la popup en renvoyant le numéro du bouton
   */
  closePopup(numButton: number): void {
    this.modalRef.dismiss(numButton);
  }

  save() {
    this.saveEvent.emit();
    this.closePopup(this.numFirstBtn);
  }
}
