import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-champ-de-saisie-seul',
  templateUrl: './champ-de-saisie-seul.component.html',
  standalone: false,
})
// TODO : à vérifier si le componsant est utilisable sinon supprime-le
export class ChampDeSaisieSeulComponent {
  /**
   * Control du formulaire réactif pour la valeur voulue
   */
  @Input() form: FormControl;
  /**
   * Permet à l'utilisateur de spécifier des caractères spéciaux supplémentaires autorisés
   */
  @Input() allowedCharacters: string[];
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
   * Placeholder du champs
   * Champ optionnel
   */
  @Input() placeholder = '';

  @Input() unit: string;

  /**
   * Transforme la saisie en majuscule
   */
  @Input() toUpperCase: boolean = false;

  patchFormatedValue(event: any): void {
    const formatedValue = this.toUpperCase ? event.target.value.toUpperCase() : event.target.value;
    this.form.patchValue(formatedValue);
  }
}
