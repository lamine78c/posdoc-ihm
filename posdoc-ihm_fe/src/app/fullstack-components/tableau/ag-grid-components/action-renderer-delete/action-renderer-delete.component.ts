import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ExtendedICellRendererParams } from '../../models/tableau.models';
import { TableauModifiableService } from '../../services/tableau-modifiable.service';

@Component({
  selector: 'app-action-renderer-delete',
  templateUrl: './action-renderer-delete.component.html',
  styleUrls: ['./action-renderer-delete.component.scss'],
  standalone: false,
})
export class ActionRendererDeleteComponent implements ICellRendererAngularComp, OnDestroy {
  isNotAuthorisedToBeDeleted: boolean = true;

  @ViewChild('actionRenderer') actionRendererElement: ElementRef;

  constructor(private tableauModifiableService: TableauModifiableService) {}

  // Paramètres ag grid
  params: ExtendedICellRendererParams;
  // Statut de l'édition
  isEditing: boolean;
  // Clef unique du tableau ag grid
  uniqueKey: string;

  handleFocusFn;

  agInit(params: ExtendedICellRendererParams): void {
    this.params = params;
    this.uniqueKey = params.api.getGridId();
    this.isEditing = params.isEditing;
    this.isNotAuthorisedToBeDeleted = params.data?.isNotAuthorisedToBeDeleted ?? false;

    // Envoie le focus sur la première action
    this.handleFocusFn = this.handleFocus.bind(this);
    params.eGridCell.addEventListener('focus', this.handleFocusFn);
  }

  /**
   * Supprime la ligne
   */
  deleteRow() {
    this.tableauModifiableService.deleteRow(
      this.params.api,
      this.params.node.id,
      this.params.context.deleteRowEvent,
      (this.params as any).deleteModal,
      (this.params as any).messages,
      (this.params as any).idsLabel,
      (this.params as any).idsLabelSeparator
    );
  }

  refresh(): boolean {
    return false;
  }

  /**
   * Envoie le focus sur la première action lorsque la cellule est focus
   */
  handleFocus(): void {
    this.actionRendererElement?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.params.eGridCell.removeEventListener('focus', this.handleFocusFn);
  }
}
