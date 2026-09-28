import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-action-renderer-edit-popup',
  templateUrl: './action-renderer-edit-popup.component.html',
  standalone: false,
})
export class ActionRendererEditPopupComponent implements ICellRendererAngularComp {
  // Paramètres ag grid
  params: any;

  agInit(params: ICellRendererParams<any, any>): void {
    this.params = params;
  }

  editRow() {
    this.params.context.updateRowEvent?.emit(this.params);
  }

  refresh(_params: ICellRendererParams<any, any>): boolean {
    return false;
  }
}
