import { ValidatorFn } from '@angular/forms';
import { ColDef, Column, ICellRendererParams, IHeaderParams, RowNode } from 'ag-grid-community';

export interface StartEditingTable {
  id: string;
  rowId?: number;
}

export interface InternalRowNode extends RowNode {
  // Gestion des erreurs dans les cellules d'une ligne
  // string correspond à l'id de la cellule
  // boolean correspond à l'invalidité du formulaire
  formErrors: Map<string, boolean>;
  // Gestion des erreurs asynchrone d'une ligne
  // string correspond à l'id de la cellule
  // TableAsynchronousError contient les informations de l'erreur
  asyncErrors: Map<string, TableAsynchronousError>;
  // Enregistre le fait que cette ligne a été modifiée (utilisé pour la validation asynchrone)
  updated: boolean;
}

export interface TableAsynchronousError {
  isError: boolean;
  message: string;
  id: string;
}

export interface FormattedValue {
  value: string;
  cursorPos: number;
}

export interface UserColConfiguration {
  columnsToHide: { colId: string }[];
  columnsToDisplay: { colId: string }[];
}

export interface DefaultColConfiguration {
  columnsHidden: ColDef[];
  columnsDisplayed: ColDef[];
  lockedLeft: number;
}

export interface ExtendedColDef extends ColDef {
  // Paramètre custom permettant de gérer l'affichage de l'icône dans l'header et du nombre de lignes totales (tableau imbriqué)
  enableCollapsing?: boolean;
  // Permet d'empêcher de masquer la colonnes lors de la configuration des colonnes
  lockList?: boolean;
  // Paramètre custom permettant de gérer l'affichage de l'icône dans l'header (tableau dépliable)
  enableGrouping?: boolean;
}

export interface ExtendedICellRendererParams extends ICellRendererParams {
  // Permet de savoir si la cellule est en édition
  isEditing?: boolean;
  // Modale de suppression pour ActionRendererDeleteComponent
  deleteModal?: any;
  // Clef pour le formulaire, cellule éditable
  formKey?: string;
  // Validateurs pour le formulaire
  validators?: ValidatorFn[];
  // Permet de savoir si l'utilisateur essaie d'ajouter une nouvelle ligne lors d'une édition
  newRowAdded?: boolean;
  // Permet de connaître l'id de la row en édition, si null et isEditing true => édition totale du tableau
  rowIdEdit?: number;
  // Autorise l'édition de la cellule uniquement lors de l'ajout d'une ligne
  canEditOnlyOnNewRow?: boolean;
  // Extends du node par défaut
  node: ExtendedRowNode;
  // permission to edit
  canEditPosition;
  // données du select passer avec subject
  selectData;
  // données du select passer en brut
  values;
  // Permet à l'utilisateur de spécifier des caractères spéciaux supplémentaires autorisés
  allowedCharacters?: string[];
  // La valeur de la colonne doit être affichée sous forme de lien
  isLink: boolean;
  // La propriété a utiliser pour récupérer le chemin du fichier pdf
  pdfProperty: string;

  // Applique un filtrage à la saisie de chaque caractère
  inputKeypress?(event: KeyboardEvent): boolean;
  // Applique un formatage à la saisie
  inputInput?(value: any, input: HTMLInputElement): FormattedValue;
  // Applique un formatage à la sauvegarde
  inputSave?(value: string): string;
}

interface ExtendedRowNode extends RowNode {
  // Place les erreurs du formulaire au niveau du node car jamais détruit (contrairement à la cellule lors d'un tri par exemple)
  formErrors?: Map<string, boolean>;
  // Permet de savoir si il y a eu une édition sur la ligne (utilisé pour la validation asynchrone)
  updated?: boolean;
  // Erreurs asynchrone du formulaire, placé au niveau du node car jamais détruit (contrairement à la cellule lors d'un tri par exemple)
  asyncErrors?: Map<string, TableAsynchronousError>;
}

export interface ExtendedIHeaderParams extends IHeaderParams {
  column: ExtendedColumn;
}

interface ExtendedColumn extends Column {
  getColDef(): ExtendedColDef;
}
