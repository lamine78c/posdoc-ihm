import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OngletPremierNiveau, OngletPremierNiveauIcone, OngletDeuxiemeNiveau } from '../../models/onglets.models';
import { OngletTypeEnum } from '../onglet/onglet.component';

@Component({
  selector: 'app-onglet-header',
  templateUrl: './onglet-header.component.html',
  standalone: false,
})
export class OngletHeaderComponent {
  /**
   * Type d'onglet à afficher
   */
  @Input() type: OngletTypeEnum;
  /**
   * Object onglet à renseigné en fonction du type d'onglet
   * Contient toutes les informations à afficher dans l'entête d'un onglet
   */
  @Input() tab: OngletPremierNiveau | OngletPremierNiveauIcone | OngletDeuxiemeNiveau;
  /**
   * Numéro de l'onglet sélectionnée par défaut
   * Utiliser pour variable afin de récupérer l'output de la valeur
   */
  @Input() active: number;
  /**
   * Index de l'onglet
   */
  @Input() index: number;
  /**
   * Envoie un évènement au composant parent lorsqu'un onglet est fermé
   */
  @Output() closeTab = new EventEmitter<number>();

  ongletTypeEnum: typeof OngletTypeEnum = OngletTypeEnum;

  /**
   * Envoie un évènement au composant parent lorsqu'un onglet est fermé
   */
  close(event): void {
    // Supprime le comportement par défaut du clic (sélection de l'onglet)
    event.preventDefault();
    event.stopImmediatePropagation();
    this.closeTab.emit(this.index);
  }
}
