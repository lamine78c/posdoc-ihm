import { FormBuilder, FormGroup } from '@angular/forms';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EditorService } from '../../services/editor.service';
import { TableauService } from '../../services/tableau.service';
import { ExtendedICellRendererParams } from '../../models/tableau.models';
import { ONE, THREE_HUNDRED } from '@app/shared/utils/Constants';

@Component({
  selector: 'app-date-editor',
  templateUrl: './date-editor.component.html',
  styleUrls: ['./date-editor.component.scss'],
  standalone: false,
})
export class DateEditorComponent implements ICellRendererAngularComp, OnDestroy, AfterViewInit {
  /**
   * Composant custom pour l'edition d'une input dans ag grid
   *
   * Pour bien comprendre le code qui suit, il faut savoir que :
   * - La cellule peut être détruite puis recrée après chaque filtrage, tri ou changement de page (si elle disparaît du tableau)
   * - Après une édition, la valeur est instantanément sauvegardée dans le tableau. Cette sauvegarde permet de :
   *   - Garder en mémoire la valeur après un filtre, tri ou changement de page
   *   - Prendre en compte la nouvelle valeur lors d'un filtrage ou d'un tri
   * - La sauvegarde d'une cellule va également la détruire puis la recréer
   *   - Cela engendre une perte du focus (repositionné avec setCursorPosition)
   * - Des informations sont stockées dans la ligne du tableau plutôt que dans la cellule pour ne pas perdre les informations
   *   - Affichage des erreurs du formulaire (formErrors: Map<string, boolean>)
   *   - Affichage des erreurs asynchrones (asyncErrors: Map<string, TableAsynchronousError>)
   *   - Boolean de modification de la ligne
   */

  @ViewChild('d') datePicker: NgbInputDatepicker;
  @ViewChild('dateInput') dateInput: ElementRef;

  // Positionne le cursor d'édition au bon endroit après une sauvegarde automatique
  @ViewChild('dateInput') set cursorPosition(element: ElementRef) {
    this.setCursorPosition(element);
  }

  @ViewChild('dateElement') dateElement: ElementRef;

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

  constructor(
    private readonly fb: FormBuilder,
    private readonly editorService: EditorService,
    private readonly tableauService: TableauService
  ) {}

  agInit(params: ExtendedICellRendererParams): void {
    const isTotalRow = !!params.node.rowPinned;
    this.params = params;
    this.cellId = params.column['colId'];
    this.uniqueGridKey = params.api.getGridId();

    // Vérifie si la cellule est en edition
    this.isEditing = this.editorService.getIsEditing(this.params);

    // Pas éditable si ligne total ou pas de clef de formulaire
    if (!isTotalRow && this.params.formKey && !params.data.lockEdition && this.isEditing) {
      // Envoie le focus dans l'input lorsque la cellule est focus
      this.handleFocusFn = this.handleFocus.bind(this);
      this.params.eGridCell.addEventListener('focus', this.handleFocusFn);

      this.initForm();
    } else {
      this.isEditing = false;
    }

    // Écoute le resize de la grille ou d'une colonne
    this.checkTooltipDisplayFn = this.tableauService.debounce(this.checkTooltipDisplay.bind(this), THREE_HUNDRED);
    this.params.api.addEventListener('columnResized', this.checkTooltipDisplayFn);
  }

  /**
   * Création du formulaire à l'initialisation du composant
   */
  initForm(): void {
    const validators = this.params.validators || [];

    // Création du formulaire à l'initialisation du composant
    if (this.params.value) {
      const date: Date = new Date(this.params.value);

      this.form = this.fb.group({
        [this.params.formKey]: [{ year: date.getFullYear(), month: date.getMonth() + ONE, day: date.getDate() }, validators],
      });
    } else {
      this.form = this.fb.group({
        [this.params.formKey]: [null, validators],
      });
    }
    // Affiche les erreurs
    this.editorService.displayErrorsAfterFormInit(this.form, this.cellId, this.params);

    // Sauvegarde après un changement de valeur
    this.subscriptions.push(
      this.form
        .get(this.params.formKey)
        .valueChanges.pipe(debounceTime(THREE_HUNDRED))
        .subscribe(() => {
          // Si la date est jugée invalide par ngbDate, alors ajoute une erreur custom
          if (this.form.get(this.params.formKey).errors?.ngbDate?.invalid) {
            this.form.get(this.params.formKey).setErrors({ isError: true, message: 'La date est invalide' });
            // Sauvegarde l'invalidité du formulaire sans le node du tableau
            this.params.node.formErrors.set(this.cellId, this.form.get(this.params.formKey).invalid);
          } else {
            this.saveValueChange();
            // Informe le composant tableau qu'une édition a commencé pour la validation des données
            // this.params.api.dispatchEvent({type: 'formEditionStarted'});
            this.params.api.dispatchEvent({ type: 'cellEditingStarted' });
          }
        })
    );

    // Écoute l'évènement rowDataUpdated afin d'afficher les erreurs
    // Notamment utile si l'utilisateur essaie d'ajouter une ligne vide
    this.displayErrorsFn = this.displayErrors.bind(this);
    this.params.api.addEventListener('rowDataUpdated', this.displayErrorsFn);
  }

  /**
   * Sauvegarde après un changement de valeur même si l'utilisateur n'a pas encore cliqué sur sauvegarder
   * En cas d'annulation, les valeurs originales seront restitués
   *
   * Cette sauvegarde immédiate permet de prendre en compte la nouvelle valeur lors d'un tri ou filtre
   * Et de ne pas la perdre lors d'un changement de page
   */
  saveValueChange(): void {
    this.editorService.saveValueChange(this.form, this.cellId, this.params, this.dateInput);

    const selectedValue = this.form.getRawValue()[this.params.formKey];
    if (selectedValue) {
      const newDate = new Date(Date.UTC(selectedValue.year, selectedValue.month - ONE, selectedValue.day));
      const newDateString = newDate.toISOString();
      this.params.setValue(newDateString);
    } else {
      this.params.setValue(null);
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
  /**  GESTION FOCUS   **/
  /**********************/

  /**
   * Envoie le focus dans l'input lorsque la cellule est focus
   */
  handleFocus(): void {
    this.dateInput?.nativeElement.focus();
  }

  /**
   * Positionne le cursor d'édition au bon endroit après une sauvegarde automatique
   */
  setCursorPosition(element: ElementRef) {
    this.editorService.setCursorPosition(element, this.params);
  }

  /**
   * Ouvre le calendrier
   */
  toggleCalendar() {
    this.datePicker.toggle();
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
    if (this.dateElement) {
      this.enableTooltip = this.tableauService.shouldDisplayTooltips(this.dateElement);
    }
  }

  /**********************/
  /**     DESTROY      **/
  /**********************/

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.params.eGridCell.removeEventListener('focus', this.handleFocusFn);
    this.params.api.removeEventListener('rowDataUpdated', this.displayErrorsFn);
    this.params.api.removeEventListener('cellEditingStarted', this.displayErrorsFn);
    this.params.api.removeEventListener('columnResized', this.checkTooltipDisplayFn);
  }
}
