import { ElementRef, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CellPosition } from 'ag-grid-community';
import { ExtendedICellRendererParams, TableAsynchronousError } from '../models/tableau.models';
import { TableauModifiableService } from './tableau-modifiable.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  constructor(private tableauModifiableService: TableauModifiableService) {}

  /**
   * Retourne le status de l'edition d'une cellule
   */
  getIsEditing(params: ExtendedICellRendererParams): boolean {
    // Passe la cellule en édition si besoin
    // Si rowIdEdit === undefined alors l'édition concerne toutes les cellules et pas une en particulier
    if (params.node.__objectId === params.rowIdEdit || params.rowIdEdit === undefined) {
      // Dans certains cas, on peut uniquement vouloir passer en édition lors de l'ajout d'un nouvelle ligne
      if (!params.newRowAdded && params.canEditOnlyOnNewRow) {
        return false;
      } else {
        return params.isEditing;
      }
    }
  }

  /**
   * Affiche les erreurs du formulaire s'il y en avaient avant la destruction de la cellule
   */
  displayErrorsAfterFormInit(form: FormGroup, cellId: string, params: ExtendedICellRendererParams): void {
    // S'assure que la map existe
    if (!params.node.formErrors) {
      params.node.formErrors = new Map();
    }

    // Récupère l'état précédent s'il existe
    const previousInvalid = params.node.formErrors.get(cellId);

    if (previousInvalid === undefined) {
      // Première initialisation: on mémorise juste l'état sans afficher
      params.node.formErrors.set(cellId, form.invalid);
    } else {
      // Deuxième initialisation (après redraw, filtre, tri...)
      const forceShow = (params.node as any).forceShowFormErrors === true;
      const userChanged = params.node.updated === true;
      const shouldShow = !!previousInvalid && (forceShow || userChanged);
      if (shouldShow) {
        form.markAsDirty();
      }
    }
  }

  /**
   * Enregistre les informations temporaires de la cellule avant destruction
   *
   * Utilise la ligne (node) pour garder les informations même après la destruction de la cellule
   * (destruction causée par une sauvegarde, tri, filtre, changement de page)
   */
  saveValueChange(form: FormGroup, cellId: string, params: ExtendedICellRendererParams, element: ElementRef): void {
    // Enregistre le fait que cette ligne a été modifiée (utilisé pour la validation asynchrone)
    params.node.updated = true;
    // Supprime les anciennes erreurs asynchrones de la cellule gardée en mémoire sur la ligne
    params.node.asyncErrors?.delete(cellId);
    // Met à jour la validité de la cellule en fonction du formulaire
    params.node.formErrors?.set(cellId, form.get(params.formKey).invalid);

    // Sauvegarde la position de curseur dans l'input
    this.tableauModifiableService.cursorPosition = element.nativeElement.selectionStart;
  }

  /**
   * Affiche les erreurs asynchrone (s'il y en a) de la cellule à son initialisation
   */
  displayAsyncErrors(form: FormGroup, params: ExtendedICellRendererParams): void {
    const errors: Map<string, TableAsynchronousError> = params.node.asyncErrors;
    const error: TableAsynchronousError = errors?.get(params.formKey);

    if (form && error) {
      form.get(params.formKey).setErrors({ isError: error.isError, message: error.message });
      form.get(params.formKey).markAsDirty();
    }
  }

  /**
   * Positionne le cursor d'édition au bon endroit après une sauvegarde automatique
   * si l'utilisateur cible toujours la cellule en question
   */
  setCursorPosition(element: ElementRef, params: ExtendedICellRendererParams): void {
    if (element) {
      setTimeout(() => {
        const focusedCell: CellPosition = params.api.getFocusedCell();
        // Vérifie que la cellule focused est la même que celle qui vient d'être sauvegardée
        const focusedCellCondition: boolean =
          !focusedCell || (focusedCell.rowIndex === params.node.rowIndex && focusedCell.column['colId'] === params.column['colId']);
        const cursorPosition = this.tableauModifiableService.cursorPosition;
        if (cursorPosition !== null && focusedCellCondition) {
          element.nativeElement.selectionStart = element.nativeElement.selectionEnd = cursorPosition;
          element.nativeElement.focus();
          this.tableauModifiableService.cursorPosition = null;
        }
      });
    }
  }
}
