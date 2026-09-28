import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-champ-de-saisie-multiligne',
  templateUrl: './champ-de-saisie-multiligne.component.html',
  standalone: false,
})
export class ChampDeSaisieMultiligneComponent {
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormGroup;
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
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
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = 4;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = 8;
  /**
   * Affichage du compteur de caractères maximum autorisé si renseigné
   * Champ optionnel, peut être laissé à vide pour ne pas afficher le compteur
   */
  @Input() maxLength: number;
  /**
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;
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
