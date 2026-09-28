import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StringUtil } from '@app/shared/utils/StringUtil';

@Component({
  selector: 'app-champ-de-saisie',
  styleUrls: ['./champ-de-saisie.component.scss'],
  templateUrl: './champ-de-saisie.component.html',
  standalone: false,
})
export class ChampDeSaisieComponent implements OnInit {
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormControl;
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() index: string;
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = 4;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = 6;
  /**
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;
  /**
   * L'input prendra toute la place
   * Ne prend plus en compte la largeur des colonnes
   * Utilise la valeur labelWidth
   * Champ optionnel, faux par défaut
   */
  @Input() fillInput: boolean = false;
  /**
   * Placeholder du champs
   * Champ optionnel
   */
  @Input() placeholder = '';
  /**
   * Affiche un ou plusieurs messages d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string | { message: string }[];
  /**
   * Propriété maxlength de l'input
   */
  @Input() maxlength: number;
  /**
   * Le type de l'input, text par defaut.
   */
  @Input() typeInput: string = 'text';
  /**
   * Transforme la saisie en majuscule
   */
  @Input() toUpperCase: boolean = false;
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical: boolean = false;

  @Input() labelClass = '';

  array = Array;
  hidePassword: boolean = true;
  isTypePassword: boolean = false;

  ngOnInit() {
    this.isTypePassword = this.typeInput === 'password';

    // générer un index unique s'il manque
    if (!this.index) {
      this.index = StringUtil.uniqueKey();
    }
  }

  patchFormatedValue(event: any): void {
    const formatedValue = this.toUpperCase ? event.target.value.toUpperCase() : event.target.value;
    this.form.patchValue(formatedValue);
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
    this.typeInput = this.hidePassword ? 'password' : 'text';
  }
}
