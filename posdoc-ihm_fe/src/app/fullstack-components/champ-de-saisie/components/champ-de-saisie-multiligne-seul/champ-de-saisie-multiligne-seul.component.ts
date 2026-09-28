import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-champ-de-saisie-multiligne-seul',
  templateUrl: './champ-de-saisie-multiligne-seul.component.html',
  standalone: false,
})
export class ChampDeSaisieMultiligneSeulComponent {
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormControl;
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() index: number;
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
  /**
   * Nombre de rows pour le textarea
   * Champ optionnel, valeur par défaut : 5
   */
  @Input() textareaRows = 5;
  /**
   * Affichage du compteur de caractères maximum autorisé si renseigné
   * Champ optionnel, peut être laissé à vide pour ne pas afficher le compteur
   */
  @Input() maxLength: number;
  /**
   * Placeholder du champs
   * Champ optionnel
   */
  @Input() placeholder = '';
  /**
   * Affiche un message d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string;
}
