import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EditorService } from '@app/fullstack-components/tableau/services/editor.service';
import { TableauService } from '@app/fullstack-components/tableau/services/tableau.service';
import { NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { ExtendedICellRendererParams, FormattedValue } from '../../models/tableau.models';

@Component({
  selector: 'app-combobox',
  templateUrl: './combobox.component.html',
  styleUrls: ['./combobox.component.scss'],
  standalone: false,
})
export class ComboboxComponent implements ICellRendererAngularComp, OnDestroy, AfterViewInit {
  @ViewChild('input') input: ElementRef;
  @ViewChild('input') set cursorPosition(element: ElementRef) {
    this.setCursorPosition(element);
  }
  @ViewChild('textElement') textElement: ElementRef;
  @ViewChild('dropdownMenuRef', { static: false, read: NgbDropdownMenu }) dropdownMenu: NgbDropdownMenu;

  // Formulaire
  form: FormGroup;
  // paramètres ag grid
  params: ExtendedICellRendererParams;
  subscriptions: Subscription[] = [];
  // Statut de l'édition
  isEditing: boolean;
  // Clef unique du tableau ag grid
  uniqueGridKey: string;
  // Id de la cellule
  cellId: string;
  enableTooltip = false;
  checkTooltipDisplayFn;
  handleFocusFn;
  displayErrorsFn;
  // données du select
  data;

  constructor(
    private readonly fb: FormBuilder,
    private readonly editorService: EditorService,
    private readonly tableauService: TableauService
  ) {}

  agInit(params: ExtendedICellRendererParams): void {
    const isTotalRow = !!params.node.rowPinned;
    this.params = params;
    this.uniqueGridKey = params.api.getGridId();
    this.cellId = params.column['colId'];

    // Vérifie si la cellule est en edition
    this.isEditing = this.editorService.getIsEditing(this.params);

    // Pas éditable si ligne total ou pas de clef de formulaire
    if (!isTotalRow && this.params.formKey && this.isEditing && !params.data.lockEdition) {
      // Envoie le focus dans l'input lorsque la cellule est focus
      this.handleFocusFn = this.handleFocus.bind(this);
      params.eGridCell.addEventListener('focus', this.handleFocusFn);

      // si les données brut existe on les sélectionne, si non, on s'inscrit pour les recevoir
      if (params.values && params.values.length > 0) {
        this.data = params.values;
      } else {
        this.subscriptions.push(this.params.selectData!.subscribe(e => {
          this.data = e;
        }));
      }

      this.initForm();
    } else {
      this.isEditing = false;
    }

    // Écoute le resize de la grille ou d'une colonne
    this.checkTooltipDisplayFn = this.tableauService.debounce(this.checkTooltipDisplay.bind(this), 300);
    this.params.api.addEventListener('columnResized', this.checkTooltipDisplayFn);
  }

  /**
   * Création du formulaire à l'initialisation du composant
   */
  initForm(): void {
    const validators = this.params.validators || [];
    // Formate la valeur avant de l'afficher si inputInput existe
    const value = this.params.inputInput ? this.params.inputInput(this.params.value, null).value : this.params.value;

    this.form = this.fb.group({
      [this.params.formKey]: [value, validators],
    });

    // Affiche les erreurs
    this.editorService.displayErrorsAfterFormInit(this.form, this.cellId, this.params);

    // Dans le cas d'une nouvelle ligne
    if (this.params.newRowAdded) {
      // Écoute l'évènement rowDataUpdated afin d'afficher les erreurs
      // Notamment utile si l'utilisateur essaie d'ajouter une ligne vide
      this.displayErrorsFn = this.displayErrors.bind(this);
      this.params.api.addEventListener('rowDataUpdated', this.displayErrorsFn);
    }
  }

  /**
   * Sauvegarde après un changement de valeur même si l'utilisateur n'a pas encore cliqué sur sauvegarder
   * En cas d'annulation, les valeurs originales seront restitués
   *
   * Cette sauvegarde immédiate permet de prendre en compte la nouvelle valeur lors d'un tri ou filtre
   * Et de ne pas la perdre lors d'un changement de page
   */
  saveValueChange(): void {
    this.editorService.saveValueChange(this.form, this.cellId, this.params, this.input);

    // Applique le formatage à la sauvegarde si il existe
    if (this.params.inputSave) {
      const value = this.params.inputSave(this.form.getRawValue()[this.params.formKey]);
      this.params.setValue(value);
    } else {
      // Met à jour la valeur
      this.params.setValue(this.form.getRawValue()[this.params.formKey]);
    }
  }

  // Sauvegarde après un changement de valeur
  openChange(isOpned: any): void {
    if (!isOpned) {
      this.saveValueChange();
      // Informe le composant tableau qu'une édition a commencé pour la validation des données asynchrones
      // this.params.api.dispatchEvent({type: 'formEditionStarted'});
      this.params.api.dispatchEvent({ type: 'cellEditingStarted' });
    }
  }

  /**********************/
  /** AFFICHAGE ERREURS */
  /**********************/

  /**
   * Affiche les erreurs du formulaire si il y en a
   */
  displayErrors(): void {
    this.form.markAsDirty();
  }

  /**
   * Affiche les erreurs asynchrones dans le formulaire si elles existes
   * Affiche un tooltip si nécessaire
   */
  ngAfterViewInit(): void {
    this.editorService.displayAsyncErrors(this.form, this.params);

    if (!this.isEditing) {
      // Utilisation d'un timeout pour obtenir les valeurs réels
      setTimeout(() => {
        this.checkTooltipDisplay();
      });
    }
  }

  /**********************/
  /**   GESTION FOCUS  **/
  /**********************/

  /**
   * Envoie le focus dans l'input lorsque la cellule est focus
   */
  handleFocus(): void {
    this.input?.nativeElement.focus();
  }

  /**
   * Positionne le cursor d'édition au bon endroit après une sauvegarde automatique
   */
  setCursorPosition(element: ElementRef) {
    this.editorService.setCursorPosition(element, this.params);
  }

  /**********************/
  /**    FORMATAGE     **/
  /**********************/

  /**
   * Autorise uniquement un certain format passé en paramètre
   */
  inputKeypress(event: KeyboardEvent): boolean {
    return this.params.inputKeypress(event);
  }

  getFiltredData(data: string[]): string[] {
    if (!!!this.form.get(this.params.formKey).value) {
      return data;
    }
    return data.filter((e: string) => e.toLowerCase().includes(this.form.get(this.params.formKey).value?.toLowerCase()));
  }

  /**
   * Formate la valeur à la saisie
   */
  inputInput(event, input: HTMLInputElement, formKey: string): void {
    const formattedValue: FormattedValue = this.params.inputInput(event.target.value, input);
    if (formattedValue.value) {
      this.form.get(formKey).setValue(formattedValue.value);
    }
    // Repositionne le curseur au bon endroit
    input.selectionStart = input.selectionEnd = formattedValue.cursorPos;

    // le cas de saisie dans l'input avec 'dropdown' fermer
    !this.dropdownMenu.dropdown.isOpen() && this.saveValueChange();
  }

  /**********************/
  /**     AG GRID      **/
  /**********************/

  refresh(): boolean {
    return false;
  }

  /**********************/
  /**     TOOLTIP      **/
  /**********************/

  /**
   *  Affiche un tooltip si la valeur est trop longue pour la casse
   */
  checkTooltipDisplay(): void {
    if (this.textElement) {
      this.enableTooltip = this.tableauService.shouldDisplayTooltips(this.textElement);
    }
  }

  /**********************/
  /**     DESTROY      **/
  /**********************/

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.params.eGridCell.removeEventListener('focus', this.handleFocusFn);
    this.params.api.removeEventListener('cellEditingStarted', this.displayErrorsFn);
    this.params.api.removeEventListener('rowDataUpdated', this.displayErrorsFn);
    this.params.api.removeEventListener('columnResized', this.checkTooltipDisplayFn);
  }

  /**
   * Toggle la dropdown
   */
  closeToggleDropdown(option: string): void {
    if (this.form.get(this.params.formKey).value?.toLowerCase() !== option.toLowerCase()) {
      this.form.get(this.params.formKey).setValue(option);
    }
    this.dropdownMenu.dropdown.close();
  }
}
