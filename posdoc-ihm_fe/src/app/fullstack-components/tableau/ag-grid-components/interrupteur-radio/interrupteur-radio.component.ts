import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AutoUnsubscribe } from '@app/shared/decorators/auto-unsubscribe.decorator';
import { DELAI_VALUE_CHANGE } from '@app/shared/utils/Constants';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-interrupteur-radio',
  templateUrl: './interrupteur-radio.component.html',
  styleUrls: ['./interrupteur-radio.component.scss'],
  standalone: false,
})
@AutoUnsubscribe
export class InterrupteurRadioComponent implements ICellRendererAngularComp {
  @ViewChild('input') input: ElementRef;

  // paramètres ag grid
  params;
  // Formulaire
  form: FormGroup;
  subscriptions: Subscription[] = [];
  // Statut de l'édition
  isEditing: boolean;
  // Id de la cellule
  cellId: string;
  // Param. qui affiche l'input qui est cliquable à tout moment
  isAllTimeClickable = false;
  hideContent = false;

  private readonly fb = inject(FormBuilder);
  private readonly editorService = inject(EditorService);

  constructor() {
    // do nothing
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.cellId = params.column['colId'];
    if (this.params.node.group) {
      this.params.data = this.params.node.allLeafChildren[0].data;
    }
    // Replace null value by false
    if (this.params.data[this.params.formKey] === null) {
      this.params.data[this.params.formKey] = this.params.value ?? false;
    }
    // maj isAllTimeClickable et isEditing selon le cas
    this.updateIsAllTimeClickableAndIsEditing();
    this.initToShow();
  }

  private getIsAllTimeClickable() {
    return (this.params.isAllTimeClickable && !this.params.data?.isDataConsul) ?? false;
  }

  private updateIsAllTimeClickableAndIsEditing() {
    // Vérifie si l'input est cliquable à tout moment
    this.isAllTimeClickable = this.getIsAllTimeClickable();
    // Vérifie si la cellule est en edition
    this.isEditing = this.editorService.getIsEditing(this.params);
    // Si on est dans le mode édition et la cellule n'est pas en édition
    if (this.params.colDef.cellRendererParams.isEditing && !this.isEditing) {
      // la cellule n'est pas clickable
      this.isAllTimeClickable = false;
    }
    // Si isnotEditableOnNewRow = true et on est dans le mode édition/création, la cellule est en édition
    if (this.params.isnotEditableOnNewRow && this.params.colDef.cellRendererParams.isEditing && this.isEditing && this.params.newRowAdded) {
      // la cellule n'est pas clickable
      this.isAllTimeClickable = false;
      // la cellule n'est plus en édition
      this.isEditing = false;
    }
  }

  private initToShow() {
    const isTotalRow = !!this.params.node.rowPinned;
    // Formulaire pour l'input
    this.form = this.fb.group({
      // On désactive le form si la cellule n'est pas en édition et isAllTimeClickable est false
      [this.params.formKey]: [{ value: this.params.value, disabled: !this.isEditing && !this.isAllTimeClickable }, null],
    });
    // Pas éditable si ligne total ou pas de clef de formulaire
    if (!isTotalRow && this.params.formKey && !this.params.data.lockEdition && this.isEditing) {
      this.initForm();
    } else {
      this.isEditing = false;
    }
    // Ne pas afficher la cellule selon le cas
    this.checkIfHidden();
  }

  private checkIfHidden(): void {
    if (this.params.resource) {
      this.hideContent = !this.params.resource?.exemplaireExists;
    } else {
      this.hideContent = false;
    }
  }

  /**
   * Création du formulaire à l'initialisation du composant
   */
  initForm(): void {
    this.form.get(this.params.formKey).enable();
    // Sauvegarde après un changement de valeur
    this.subscriptions.push(
      this.form
        .get(this.params.formKey)
        .valueChanges.pipe(debounceTime(DELAI_VALUE_CHANGE))
        .subscribe(() => {
          this.saveValueChange();
        })
    );
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

  refresh(): boolean {
    return false;
  }
}
