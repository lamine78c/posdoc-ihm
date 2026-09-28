import { FormGroup } from '@angular/forms';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { SingleListeHierarchiseFormComponent } from './single-liste-hierarchise-form/app-single-liste-hierarchise-form';

@Component({
  selector: 'app-single-select-hierarchise-list',
  templateUrl: './single-select-hierarchise-list.component.html',
  styleUrls: ['./single-select-hierarchise-list.component.scss'],
  standalone: false,
})
export class SingleSelectHierarchiseListComponent implements OnInit {
  @ViewChild('dropdownRef', { static: false, read: NgbDropdown }) dropdown: NgbDropdown;
  @ViewChild('scrollableContent', { static: false }) scrollableContent: ElementRef<HTMLElement>;
  @ViewChildren(SingleListeHierarchiseFormComponent) childForms: QueryList<SingleListeHierarchiseFormComponent>;
  /**
   * Largeur de la colonne du label en pixel
   * Permet de définir une taille fixe en fonction du contenu
   * Champ optionnel, écrasera la valeur labelColumns
   */
  @Input() labelWidth: number;
  /**
   * Taille de la colonne pour l'input
   * Champ optionnel, valeur par défaut : 6
   */
  @Input() inputColumns = 6;
  /**
   * Label à afficher pour le control correspondant
   */
  @Input() label: string;
  /**
   * Texte affiché dans l'input lorsqu'aucune valeur n'est sélectionnée
   */
  @Input() defaultText: string = '%';
  /**
   * Index pour éviter des duplications d'id/for
   */
  @Input() formIndex: number;
  /**
   * Désactive le formulaire si true
   * Optionnel, peut être laissé à vide pour activer le formulaire
   */
  @Input() disabled = false;
  /**
   * Taille de la colonne pour le label
   * Champ optionnel, valeur par défaut : 4
   */
  @Input() labelColumns = 4;
  /**
   * met le libelle et l'input en vertical
   */
  @Input() vertical: boolean = false;
  /**
   * En cas d'erreur sur le formulaire réactif, affiche une erreur plutôt qu'un warning
   * Champ optionnel, peut être laissé à vide pour afficher un warning
   */
  @Input() isError: boolean;
  /**
   * Affiche un ou plusieurs messages d'erreur dans un tooltips au survol de l'icône d'erreur/warning
   */
  @Input() errorMessage: string | { message: string }[];
  /**
   * Group du formulaire réactif contenant l'ensemble des valeurs
   * Format :
   * group({
   *   'Groupe 1': group({
   *     'Option 1':
   *   })
   * })
   */
  @Input() form: FormGroup;

  @Input() labelClass = '';

  /**
   * Envoyer les champs selectionnés au composant parent
   */
  @Output() changeEvent = new EventEmitter<any>();

  selectedElement: string;

  array = Array;

  ngOnInit(): void {
    this.changeEvent.emit('');
  }

  /**
   * Appelé lorsque la dropdown est ouverte/fermée
   */
  openChange(isOpened: boolean): void {
    if (!isOpened) {
      this.form.markAsTouched();
      return;
    }
    // Redéplie le groupe portant la sélection, l'utilisateur ayant pu le replier
    this.childForms?.forEach(childForm => childForm.expandIfContainsSelectedElement());
    // Le menu vient tout juste d'être affiché : on attend qu'il soit positionné pour mesurer les éléments
    setTimeout(() => this.scrollToSelectedElement());
  }

  /**
   * Positionne le scroll de la liste sur l'élément sélectionné afin qu'il soit
   * visible dès l'ouverture, même s'il se trouve en bas d'une longue liste.
   */
  private scrollToSelectedElement(): void {
    const container = this.scrollableContent?.nativeElement;
    if (!container) {
      return;
    }
    // Classe posée par app-single-liste-hierarchise-form sur l'élément sélectionné,
    // on ignore ceux qui ne sont pas rendus (groupes repliés)
    const selected = Array.from(container.querySelectorAll<HTMLElement>('.selected-color')).find(
      element => element.getClientRects().length
    );
    if (!selected) {
      return;
    }
    const containerBounds = container.getBoundingClientRect();
    const selectedBounds = selected.getBoundingClientRect();
    const isAlreadyVisible =
      selectedBounds.top >= containerBounds.top && selectedBounds.bottom <= containerBounds.bottom;
    if (isAlreadyVisible) {
      return;
    }
    // Centre l'élément sélectionné dans la zone visible (le navigateur borne la valeur)
    container.scrollTop += selectedBounds.top - containerBounds.top - (container.clientHeight - selectedBounds.height) / 2;
  }

  /**
   * Toggle la dropdown
   */
  toggleDropdown(): void {
    this.dropdown.toggle();
  }

  getElementToDisplay(): string {
    this.setValueInCaseOfNavigationFromAnotherComponent();
    if (!Object.keys(this.form.controls).length) {
      return this.defaultText;
    }
    return this.selectedElement ?? this.defaultText;
  }

  setValueInCaseOfNavigationFromAnotherComponent(): void {
    const [selectedElement] = Object.values(this.form.controls).flatMap(e =>
      Object.keys((e as FormGroup).controls).filter(c => (e as FormGroup).controls[c].value)
    );
    !this.selectedElement && (this.selectedElement = selectedElement);
  }

  setSelectedElement(selectedElement: string): void {
    this.selectedElement = selectedElement;
    this.dropdown.close();
    this.changeEvent.emit(this.selectedElement.trim());
  }

  isTouchedAndEmpty(): boolean {
    return this.form.touched && !this.selectedElement;
  }
}
