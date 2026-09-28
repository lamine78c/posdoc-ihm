import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DELAI_VALUE_CHANGE } from '@app/shared/utils/Constants';
import { PlacementArray } from '@ng-bootstrap/ng-bootstrap/util/positioning';
import { OperatorFunction, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

export enum SearchTypeEnum {
  START_WITH = 'START_WITH ',
  INCLUDES = 'INCLUDES',
}

@Component({
  selector: 'app-champ-de-saisie-auto-completion',
  templateUrl: './champ-de-saisie-auto-completion.component.html',
  styleUrls: ['./champ-de-saisie-auto-completion.component.scss'],
  standalone: false,
})
export class ChampDeSaisieAutoCompletionComponent {
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
  @Input() index: number;
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
   * Placeholder du champs
   * Champ optionnel
   */
  @Input() placeholder = '';
  /**
   * Liste des résultats possible pour l'autocomplete
   */
  @Input() autoCompleteResults: string[];
  /**
   * Nombre de caractères à partir duquel la recherche dans autoCompleteResults commence
   * Champ optionnel, valeur par défaut : 2
   */
  @Input() kickLength = 2;
  /**
   * Nombre maximum de résultat dans la liste d'autocomplétion
   * Champ optionnel, valeur par défaut : 10
   */
  @Input() maxResults = 10;
  /**
   * Type de recherche dans la liste d'autocomplétion
   * Champ optionnel, valeur par défaut : includes
   */
  @Input() searchType: SearchTypeEnum = SearchTypeEnum.START_WITH;
  /**
   * If true, model values will not be restricted only to items selected from the popup.
   * Default value: true
   */
  @Input() editable = true;
  /**
   * The preferred placement of the typeahead, among the possible values.
   * The default order of preference is "bottom-start bottom-end top-start top-end"
   */
  @Input() placement: PlacementArray = 'bottom-start bottom-end top-start top-end';
  /**
   * Affiche un message d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string;
  /**
   * Affiche une icône de recherche dans l'input
   */
  @Input() displaySearchIcon: boolean = false;
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical: boolean = false;

  @Input() labelClass = '';

  /**
   * Recherche le mot tapper par l'utilisateur et retourne la liste de résultats dans un observable
   */
  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(DELAI_VALUE_CHANGE),
      distinctUntilChanged(),
      map(term => {
        if (term.length < this.kickLength) {
          return [];
        } else if (this.searchType === SearchTypeEnum.START_WITH) {
          return this.autoCompleteResults.filter(v => v.toLowerCase().startsWith(term.toLowerCase()));
        } else {
          return this.autoCompleteResults.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1);
        }
      })
    );
  };
}
