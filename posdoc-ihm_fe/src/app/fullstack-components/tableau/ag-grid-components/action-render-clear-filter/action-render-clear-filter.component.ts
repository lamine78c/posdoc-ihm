import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ExtendedICellRendererParams } from '../../models/tableau.models';

@Component({
  selector: 'app-action-render-clear-filter',
  templateUrl: './action-render-clear-filter.component.html',
  standalone: false,
})
export class ActionRenderClearFilterComponent implements ICellRendererAngularComp, OnDestroy {
  @ViewChild('actionRenderer') actionRendererElement: ElementRef;

  constructor() {
    // do nothing
  }

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

    // Envoie le focus sur la première action
  }

  refresh(): boolean {
    return false;
  }

  ngOnDestroy(): void {
    this.params.eGridCell.removeEventListener('focus', this.handleFocusFn);
  }
}
