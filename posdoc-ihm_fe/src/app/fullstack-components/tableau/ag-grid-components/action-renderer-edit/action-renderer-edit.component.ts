import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { TableauModifiableService } from '@app/fullstack-components/tableau/services/tableau-modifiable.service';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ExtendedICellRendererParams } from '../../models/tableau.models';
import { FilterSharedDataService } from '@app/services/filter-shared-data.service';

@Component({
  selector: 'app-action-renderer-edit',
  templateUrl: './action-renderer-edit.component.html',
  styleUrls: ['./action-renderer-edit.component.scss'],
  standalone: false,
})
export class ActionRendererEditComponent implements ICellRendererAngularComp, OnDestroy {
  @ViewChild('actionRenderer') actionRendererElement: ElementRef;

  constructor(
    private tableauModifiableService: TableauModifiableService,
    private filterSharedDataService: FilterSharedDataService
  ) {}

  // Paramètres ag grid
  params: ExtendedICellRendererParams;
  // Statut de l'édition
  isEditing: boolean;
  // Clef unique du tableau ag grid
  uniqueKey: string;

  handleFocusFn;
  // has paemission to edit
  canEditPosition;

  agInit(params: ExtendedICellRendererParams): void {
    this.params = params;
    this.uniqueKey = params.api.getGridId();
    this.isEditing = params.isEditing;
    this.canEditPosition = params.canEditPosition;
    // Envoie le focus sur la première action
    this.handleFocusFn = this.handleFocus.bind(this);
    params.eGridCell.addEventListener('focus', this.handleFocusFn);
  }

  /**
   * Active l'édition
   */
  onStartEditing() {
    // service to disable filters
    this.filterSharedDataService.updateData(true);
    this.tableauModifiableService.startEditing(this.uniqueKey, this.params.node.__objectId);
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
