import { Component, ElementRef, ViewChild } from '@angular/core';
import { ExtendedICellRendererParams } from '../../models/tableau.models';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';

@Component({
  selector: 'app-action-renderer-clear-filter',
  templateUrl: './action-renderer-clear-filter.component.html',
  styleUrls: ['./action-renderer-clear-filter.component.scss'],
  standalone: false,
})
export class ActionRendererClearFilterComponent implements ICellRendererAngularComp {
  isDisabled: boolean = false;

  @ViewChild('actionRenderer') actionRendererElement: ElementRef;

  constructor(private filterSharedDataService: FilterSharedDataService) {
    this.filterSharedDataService.getData().subscribe(isDisabled => (this.isDisabled = isDisabled));
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

    // Envoie le focus sur la première action
  }

  refresh(): boolean {
    return false;
  }

  clearFilter() {
    this.params.api.setFilterModel(null);
    this.params.api.onFilterChanged();
    this.params.api.refreshHeader();
    this.params.api.resetColumnState();
  }
}
